/**
 * @file api.js
 * @description Centralized API client for the Licht Cleaning frontend and the
 *              Spring Boot REST API.
 *
 *              Rule: a failed request is NEVER reported as a success. Write
 *              operations (login, register, booking, quote, payment) throw or
 *              return { success: false } so the UI can show a real error.
 *              Read operations may fall back to the last cached copy, but say so
 *              via the `fromCache` flag.
 */

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:8081/api';
};

export const API_BASE_URL = getApiBaseUrl();

const CONNECTION_ERROR = 'We could not reach our booking server. Please try again in a few minutes or call us.';

/* ------------------------------------------------------------------ */
/* Token helpers                                                       */
/* ------------------------------------------------------------------ */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('licht_jwt_token') || '';
  } catch {
    return '';
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem('licht_jwt_token', token);
    else localStorage.removeItem('licht_jwt_token');
  } catch (e) {
    console.warn('Could not store JWT token:', e);
  }
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

/**
 * Parse a response as JSON. Throws on non-2xx, HTML fallbacks and invalid JSON.
 */
export const safeJsonFetch = async (res, contextName = 'Request') => {
  const text = await res.text();
  const trimmed = (text || '').trim();
  if (!trimmed) {
    if (!res.ok) throw new Error(`${contextName} failed (HTTP ${res.status}).`);
    return {};
  }
  if (trimmed.startsWith('<')) {
    throw new Error(`${contextName} failed: server returned an HTML page (HTTP ${res.status}).`);
  }
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    throw new Error(`${contextName} failed: invalid server response.`);
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `${contextName} failed (HTTP ${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
};

/** fetch + safeJsonFetch, converting network failures to a friendly error. */
const request = async (path, { method = 'GET', body, context = 'Request' } = {}) => {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(CONNECTION_ERROR);
  }
  return safeJsonFetch(res, context);
};

/** Wrap auth calls so the UI always gets { success, message, user?, token? }. */
const authRequest = async (path, body, context) => {
  try {
    const data = await request(path, { method: 'POST', body, context });
    if (data?.token) setAuthToken(data.token);
    return data;
  } catch (err) {
    let message;
    if (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 409) {
      // Credential / validation problems: show the server's explanation if it gave one.
      message = err.message && !/^(Unauthorized|Forbidden|Bad Request|Conflict)$/i.test(err.message)
        ? err.message
        : 'Incorrect email or password.';
    } else if (err.status) {
      message = `${context} failed — the service is unavailable right now (HTTP ${err.status}). Please try again later.`;
    } else {
      message = err.message;
    }
    return { success: false, message };
  }
};

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */
export const checkBackendHealth = async () => {
  try {
    const data = await request('/health', { context: 'Health check' });
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */
export const apiLogin = (email, password) => authRequest('/auth/login', { email, password }, 'Sign in');
export const apiAdminLogin = (email, password) => authRequest('/auth/admin-login', { email, password }, 'Admin sign in');
export const apiRegister = (userData) => authRequest('/auth/register', userData, 'Registration');
export const apiForgotPassword = (email) => authRequest('/auth/forgot-password', { email }, 'Password reset');
export const apiResetPassword = (email, token, newPassword) =>
  authRequest('/auth/reset-password', { email, token, newPassword }, 'Password reset');

export const apiLogout = () => setAuthToken(null);

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */
const readCache = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/** Admin: all bookings. Throws if the server is unreachable (no silent local fallback). */
export const apiFetchAllBookings = () => request('/bookings', { context: 'Load bookings' });

/** Client: own bookings. Falls back to the cached copy, flagged with fromCache. */
export const apiFetchMyBookings = async (email) => {
  try {
    const data = await request(`/bookings/my?email=${encodeURIComponent(email || '')}`, { context: 'Load bookings' });
    return { bookings: Array.isArray(data) ? data : [], fromCache: false };
  } catch (err) {
    const list = readCache('licht_bookings').filter((b) => !email || b.clientEmail === email);
    return { bookings: list, fromCache: true, error: err.message };
  }
};

/** Throws on failure so the UI never shows a booking that was not saved. */
export const apiCreateBooking = (bookingData) =>
  request('/bookings', { method: 'POST', body: bookingData, context: 'Create booking' });

export const apiFetchBookingById = async (id) => {
  try {
    return await request(`/bookings/${encodeURIComponent(id)}`, { context: 'Load booking' });
  } catch {
    return null;
  }
};

const bookingAction = (id, action, method, body, context) =>
  request(`/bookings/${encodeURIComponent(id)}/${action}`, { method, body, context });

export const apiAssignCleaner = (id, cleanerName) => bookingAction(id, 'assign', 'PUT', { cleaner: cleanerName }, 'Assign cleaner');
export const apiSendPaymentRequest = (id) => bookingAction(id, 'request-payment', 'POST', undefined, 'Send payment request');
export const apiDispatchBooking = (id, dispatchData) => bookingAction(id, 'dispatch', 'PUT', dispatchData, 'Dispatch booking');
export const apiCompleteBooking = (id) => bookingAction(id, 'complete', 'PUT', undefined, 'Complete booking');
export const apiCancelBooking = (id) => bookingAction(id, 'cancel', 'PUT', undefined, 'Cancel booking');

export const apiVerifyBookingOtp = async (id, otp) => {
  try {
    return await bookingAction(id, 'verify-otp', 'PUT', { otp }, 'Verify PIN');
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* ------------------------------------------------------------------ */
/* Quotes                                                              */
/* ------------------------------------------------------------------ */
/** Throws on failure so the enquiry form can tell the visitor it was NOT sent. */
export const apiSubmitQuote = (quoteData) =>
  request('/quotes', { method: 'POST', body: quoteData, context: 'Send enquiry' });

export const apiFetchQuotes = () => request('/quotes', { context: 'Load quotes' });

/* ------------------------------------------------------------------ */
/* Operatives & fleet                                                  */
/* ------------------------------------------------------------------ */
export const apiFetchOperatives = () => request('/operatives', { context: 'Load operatives' });
export const apiUpdateOperativeStatus = (id, status) =>
  request(`/operatives/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status }, context: 'Update operative' });
export const apiFetchFleet = () => request('/fleet', { context: 'Load fleet' });
export const apiUpdateFleetStatus = (id, status) =>
  request(`/fleet/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status }, context: 'Update fleet' });

/* ------------------------------------------------------------------ */
/* PayPal — orders are created and captured ONLY by the backend.       */
/* The backend must read the amount from the booking in the database.  */
/* ------------------------------------------------------------------ */
export const apiGetPayPalConfig = () => request('/payments/paypal/config', { context: 'PayPal configuration' });

export const apiCreatePayPalOrder = (bookingId) =>
  request('/payments/paypal/create-order', { method: 'POST', body: { bookingId, currency: 'GBP' }, context: 'Create PayPal order' });

export const apiCapturePayPalOrder = (orderId, bookingId, payStage = 'POST_SERVICE') =>
  request('/payments/paypal/capture-order', { method: 'POST', body: { orderId, bookingId, payStage }, context: 'Confirm PayPal payment' });

const apiService = {
  checkBackendHealth,
  apiLogin,
  apiAdminLogin,
  apiRegister,
  apiLogout,
  apiForgotPassword,
  apiResetPassword,
  apiFetchAllBookings,
  apiFetchMyBookings,
  apiCreateBooking,
  apiFetchBookingById,
  apiAssignCleaner,
  apiSendPaymentRequest,
  apiDispatchBooking,
  apiCompleteBooking,
  apiVerifyBookingOtp,
  apiCancelBooking,
  apiSubmitQuote,
  apiFetchQuotes,
  apiFetchOperatives,
  apiUpdateOperativeStatus,
  apiFetchFleet,
  apiUpdateFleetStatus,
  apiGetPayPalConfig,
  apiCreatePayPalOrder,
  apiCapturePayPalOrder,
};

export default apiService;
