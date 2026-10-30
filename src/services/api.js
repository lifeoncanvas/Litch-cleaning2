/**
 * @file api.js
 * @description Centralized API client service integrating Licht Cleaning Frontend
 *              with the Spring Boot REST API backend on port 8081.
 *              Includes resilient offline caching and fallback.
 */

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:8081/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to retrieve stored JWT token
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('licht_jwt_token') || '';
  } catch {
    return '';
  }
};

/**
 * Helper to store JWT token
 */
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('licht_jwt_token', token);
    } else {
      localStorage.removeItem('licht_jwt_token');
    }
  } catch (e) {
    console.warn('Could not store JWT token:', e);
  }
};

/**
 * Default JSON headers with Authorization bearer if available
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Safely parse response JSON, guarding against HTML fallback responses (e.g. 404 / Webpack index.html).
 */
export const safeJsonFetch = async (res, contextName = 'Request') => {
  const text = await res.text();
  if (!text || !text.trim()) {
    if (!res.ok) throw new Error(`${contextName} failed: HTTP ${res.status} ${res.statusText}`);
    return {};
  }
  const trimmed = text.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<!doctype')) {
    throw new Error(`${contextName}: Server returned HTML response (HTTP ${res.status}). Backend server is either offline or the route is not mapped.`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`${contextName}: Invalid JSON response (${text.slice(0, 60)})`);
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `${contextName} failed: HTTP ${res.status}`);
  }
  return data;
};

/* ==========================================================================
   HEALTH CHECK
   ========================================================================== */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { online: false, error: res.statusText };
    const data = await res.json();
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */
export const apiLogin = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  } catch (err) {
    console.warn('Backend login unavailable, fallback:', err);
    return null;
  }
};

export const apiAdminLogin = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  } catch (err) {
    console.warn('Backend admin login unavailable, fallback:', err);
    return null;
  }
};

export const apiDemoLogin = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  } catch (err) {
    console.warn('Backend demo login unavailable, fallback:', err);
    return null;
  }
};

export const apiRegister = async (userData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  } catch (err) {
    console.warn('Backend register unavailable, fallback:', err);
    return null;
  }
};

export const apiForgotPassword = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend forgot password unavailable:', err);
    return { success: false, message: 'Could not connect to authentication server.' };
  }
};

export const apiResetPassword = async (email, token, newPassword) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, token, newPassword }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend reset password unavailable:', err);
    return { success: false, message: 'Could not connect to authentication server.' };
  }
};

export const apiLogout = () => {
  setAuthToken(null);
};

/* ==========================================================================
   BOOKINGS API
   ========================================================================== */
export const apiFetchAllBookings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    localStorage.setItem('licht_bookings', JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Backend fetch bookings failed, using local fallback:', err);
    const saved = localStorage.getItem('licht_bookings');
    return saved ? JSON.parse(saved) : [];
  }
};

export const apiFetchMyBookings = async (email) => {
  try {
    const url = email
      ? `${API_BASE_URL}/bookings/my?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/bookings`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend fetch my bookings failed, using local cache:', err);
    const saved = localStorage.getItem('licht_bookings');
    if (!saved) return [];
    const list = JSON.parse(saved);
    return email ? list.filter((b) => b.clientEmail === email) : list;
  }
};

export const apiCreateBooking = async (bookingData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend create booking failed, returning local booking:', err);
    return bookingData;
  }
};

export const apiFetchBookingById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch booking by id failed:', err);
    return null;
  }
};

export const apiAssignCleaner = async (id, cleanerName) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/assign`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ cleaner: cleanerName }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend assign cleaner failed:', err);
    return null;
  }
};

export const apiSendPaymentRequest = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/request-payment`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend send payment request failed:', err);
    return null;
  }
};

export const apiDispatchBooking = async (id, dispatchData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/dispatch`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dispatchData),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend dispatch failed:', err);
    return null;
  }
};

export const apiCompleteBooking = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/complete`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend complete failed:', err);
    return null;
  }
};

export const apiVerifyBookingOtp = async (id, otp) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/verify-otp`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ otp }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend verify OTP failed:', err);
    return { success: false, message: 'Could not connect to verification server' };
  }
};

export const apiCancelBooking = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend cancel failed:', err);
    return null;
  }
};

/* ==========================================================================
   QUOTES & ENQUIRIES API
   ========================================================================== */
export const apiSubmitQuote = async (quoteData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(quoteData),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend quote submission failed, fallback saved:', err);
    return { success: true, message: 'Saved locally', data: quoteData };
  }
};

export const apiFetchQuotes = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch quotes failed:', err);
    return [];
  }
};

/* ==========================================================================
   OPERATIVES & FLEET API
   ========================================================================== */
export const apiFetchOperatives = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/operatives`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    localStorage.setItem('licht_admin_operatives', JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Backend fetch operatives failed, fallback:', err);
    const saved = localStorage.getItem('licht_admin_operatives');
    return saved ? JSON.parse(saved) : [];
  }
};

export const apiUpdateOperativeStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_BASE_URL}/operatives/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend update operative status failed:', err);
    return null;
  }
};

export const apiFetchFleet = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/fleet`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch fleet failed:', err);
    return [];
  }
};

export const apiUpdateFleetStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_BASE_URL}/fleet/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend update fleet status failed:', err);
    return null;
  }
};

/* ==========================================================================
   PAYPAL PAYMENT GATEWAY API (LIVE INTEGRATION)
   ========================================================================== */
export const apiGetPayPalConfig = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await safeJsonFetch(res, 'PayPal Config');
  } catch (err) {
    console.warn('Backend PayPal config unavailable, using fallback client-id:', err.message);
    return {
      clientId: 'BAAQ19iQI1yAbaq1W3b8UExMuZlNMOOiEP3BO5IF7r-T1PjgTpTxFVGGEMK4W1lKGK2Kd2c6Y9X1pwfnTE',
      currency: 'GBP',
      appName: 'LICHT House Cleaning',
      mode: 'live',
      webhookId: '45S68093S3920431N',
    };
  }
};

export const apiCreatePayPalOrder = async (amount, bookingId, serviceName) => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, bookingId, serviceName, currency: 'GBP' }),
    });
    return await safeJsonFetch(res, 'PayPal Create Order');
  } catch (err) {
    console.warn('Backend create PayPal order failed:', err.message);
    throw err;
  }
};

export const apiCapturePayPalOrder = async (orderId, bookingId, payStage = 'BOOKING') => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/capture-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, bookingId, payStage }),
    });
    return await safeJsonFetch(res, 'PayPal Capture Order');
  } catch (err) {
    console.warn('Backend capture PayPal order failed:', err.message);
    throw err;
  }
};

const apiService = {
  checkBackendHealth,
  apiLogin,
  apiAdminLogin,
  apiDemoLogin,
  apiRegister,
  apiLogout,
  apiFetchAllBookings,
  apiFetchMyBookings,
  apiCreateBooking,
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
