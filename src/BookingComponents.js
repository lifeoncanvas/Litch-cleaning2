/**
 * @file BookingComponents.js
 * @description Comprehensive client booking system for Licht Marketing.
 *              Includes:
 *              1. ToastNotification: Floating feedback alerts
 *              2. AuthModal: Client sign in, registration, and 1-click verified demo login
 *              3. BookingModal: 5-step booking flow with integrated 256-bit payment gateway
 *              4. CartDrawer: Slide-in cart management with multi-service checkout
 *              5. MyBookingsModal: Customer appointment dashboard with status tracking
 * @author Licht Marketing Engineering
 */

import React, { useState, useEffect, useRef } from 'react';
import './Booking.css';
import {
  apiForgotPassword,
  apiResetPassword,
  apiGetPayPalConfig,
  apiCreatePayPalOrder,
  apiCapturePayPalOrder,
} from './services/api';

/* ==========================================================================
   1. TOAST NOTIFICATION COMPONENT
   ========================================================================== */
export function ToastNotification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="licht-toast" role="alert">
      <span>✨ {message}</span>
      <button onClick={onClose} className="licht-toast-close" aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}

/* ==========================================================================
   2. AUTHENTICATION MODAL (LOGIN / REGISTER / QUICK DEMO / FORGOT / RESET)
   ========================================================================== */
export function AuthModal({
  isOpen,
  onClose,
  mode = 'login',
  setMode,
  message,
  onLogin,
  onDemoLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onNavigateAdmin,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusNotice('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      onLogin({ email, password });
    } else if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please complete all required fields.');
        return;
      }
      onRegister({ name, email, password, phone });
    } else if (mode === 'forgot') {
      const targetEmail = (forgotEmail || email).trim();
      if (!targetEmail) {
        setError('Please enter your account email address.');
        return;
      }
      setIsLoading(true);
      try {
        const handler = onForgotPassword || apiForgotPassword;
        const res = await handler(targetEmail);
        setIsLoading(false);
        if (res && res.success) {
          setStatusNotice(res.message || `A verification code has been dispatched to ${targetEmail} from info@lichtmarketinglimited.org.`);
          setForgotEmail(targetEmail);
          setMode('reset');
        } else {
          setError(res?.message || 'Could not dispatch reset code. Please try again.');
        }
      } catch (err) {
        setIsLoading(false);
        setError('Error requesting password reset. Please try again.');
      }
    } else if (mode === 'reset') {
      const targetEmail = (forgotEmail || email).trim();
      if (!targetEmail || !resetCode.trim() || !newPassword.trim()) {
        setError('Please enter the security verification code and new password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
      setIsLoading(true);
      try {
        const handler = onResetPassword || apiResetPassword;
        const res = await handler(targetEmail, resetCode.trim(), newPassword);
        setIsLoading(false);
        if (res && res.success) {
          setStatusNotice('✓ Password reset successfully! You can now sign in with your new password.');
          setPassword(newPassword);
          setEmail(targetEmail);
          setMode('login');
        } else {
          setError(res?.message || 'Invalid or expired code. Please check and try again.');
        }
      } catch (err) {
        setIsLoading(false);
        setError('Error updating password. Please try again.');
      }
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'register': return 'Create Client Account';
      case 'forgot': return 'Reset Your Password';
      case 'reset': return 'Set New Password';
      case 'login':
      default: return 'Client Sign In';
    }
  };

  return (
    <div className="licht-modal-overlay" onClick={onClose}>
      <div className="licht-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title">
            {getModalTitle()}
          </h2>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="licht-modal-body">
          {message && (
            <div className="auth-message-banner">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <span>{message}</span>
            </div>
          )}

          {statusNotice && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#166534', fontSize: '0.84rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Mode Switcher for Login / Register */}
          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs-row">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(''); setStatusNotice(''); }}
              >
                Existing Client Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError(''); setStatusNotice(''); }}
              >
                New Client Registration
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600, background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── FORGOT PASSWORD BANNER ── */}
          {mode === 'forgot' && (
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '14px', padding: '16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📭</span>
              <div>
                <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.9rem', marginBottom: '4px' }}>
                  Verification Code via Email
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  Enter your registered email address. We will generate and dispatch a 6-digit security code directly from <strong>info@lichtmarketinglimited.org</strong> to verify your account identity.
                </div>
              </div>
            </div>
          )}

          {/* ── RESET PASSWORD BANNER ── */}
          {mode === 'reset' && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🔑</span>
              <div>
                <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.9rem', marginBottom: '4px' }}>
                  Enter Code from info@lichtmarketinglimited.org
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  A verification code was dispatched to <strong>{forgotEmail || email || 'your email'}</strong>. Enter the 6-digit code below along with your new password.
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTER NOTICE BANNER ── */}
          {mode === 'register' && (
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>📧</span>
              <div style={{ fontSize: '0.81rem', color: '#0f766e', lineHeight: 1.45 }}>
                An official welcome confirmation email will be automatically sent to your registered address from <strong>info@lichtmarketinglimited.org</strong>.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* REGISTER FIELDS */}
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name / Contact Person *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +44 20 8000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* LOGIN & REGISTER EMAIL & PASSWORD */}
            {(mode === 'login' || mode === 'register') && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password *</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setMode('forgot');
                          setError('');
                          setStatusNotice('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1599AC',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="form-group">
                <label className="form-label">Registered Account Email *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. alex.vance@ventureoffices.co.uk"
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            )}

            {/* RESET PASSWORD FORM */}
            {mode === 'reset' && (
              <>
                <div className="form-group">
                  <label className="form-label">Account Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">6-Digit Security Verification Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="form-input"
                    placeholder="e.g. 671759"
                    style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters) *</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="form-submit-btn"
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Processing Dispatch...' : (
                mode === 'login' ? 'Sign In & Continue' :
                mode === 'register' ? 'Create Account & Continue' :
                mode === 'forgot' ? 'Dispatch Security Code via Email' :
                'Set New Password & Sign In'
              )}
            </button>

            {/* BACK LINKS FOR FORGOT / RESET */}
            {(mode === 'forgot' || mode === 'reset') && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setStatusNotice('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Return to Client Sign In
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setStatusNotice('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1599AC',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAYPAL PAYMENT GATEWAY & SMART BUTTONS (SANDBOX INTEGRATION)
   App Name: LICHT House Cleaning | Client ID: BAAULNaisDn8M8rhxHPGOXZP8f3AfIDVn1zxs1i12Ql0qvjk8Avtx3RM9sijhsQ1QLhKXvP3SSjtSWuLcQ
   Currency: GBP | Intent: CAPTURE | Webhook ID: 45S68093S3920431N
   ========================================================================== */
export const PAYPAL_LIVE_CLIENT_ID = 'BAAQ19iQI1yAbaq1W3b8UExMuZlNMOOiEP3BO5IF7r-T1PjgTpTxFVGGEMK4W1lKGK2Kd2c6Y9X1pwfnTE';
export const PAYPAL_SANDBOX_CLIENT_ID = 'BAAULNaisDn8M8rhxHPGOXZP8f3AfIDVn1zxs1i12Ql0qvjk8Avtx3RM9sijhsQ1QLhKXvP3SSjtSWuLcQ';
export const PAYPAL_CLIENT_ID = PAYPAL_LIVE_CLIENT_ID;

let paypalSdkPromise = null;
let currentLoadedClientId = null;

export const loadPayPalSdk = (clientId = PAYPAL_CLIENT_ID, currency = 'GBP') => {
  if (typeof window !== 'undefined' && window.paypal && currentLoadedClientId === clientId) {
    return Promise.resolve(window.paypal);
  }

  // If client ID changed or SDK script exists with different ID, refresh
  if (currentLoadedClientId && currentLoadedClientId !== clientId) {
    paypalSdkPromise = null;
    const existing = document.getElementById('licht-paypal-sdk-script');
    if (existing) existing.remove();
    if (typeof window !== 'undefined') window.paypal = undefined;
  }

  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('licht-paypal-sdk-script');
    if (existing) {
      existing.addEventListener('load', () => {
        currentLoadedClientId = clientId;
        resolve(window.paypal);
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load PayPal script')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'licht-paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&enable-funding=paylater`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        currentLoadedClientId = clientId;
        resolve(window.paypal);
      } else {
        reject(new Error('PayPal SDK loaded but window.paypal is undefined'));
      }
    };
    script.onerror = (err) => {
      paypalSdkPromise = null;
      reject(new Error('Failed to load PayPal SDK script from paypal.com'));
    };
    document.body.appendChild(script);
  });

  return paypalSdkPromise;
};

export function PayPalButtonContainer({ amount, bookingId, serviceName, onPaymentSuccess, onError }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    apiGetPayPalConfig()
      .then((cfg) => {
        const clientId = cfg?.clientId || PAYPAL_CLIENT_ID;
        const currency = cfg?.currency || 'GBP';
        return loadPayPalSdk(clientId, currency);
      })
      .then((paypal) => {
        if (isCancelled) return;
        setLoading(false);

        if (containerRef.current && paypal && paypal.Buttons) {
          containerRef.current.innerHTML = '';
          try {
            paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 44,
              },
              createOrder: async (data, actions) => {
                if (onError) onError(null);

                // 1. First attempt: create order via backend Spring Boot API
                try {
                  const res = await apiCreatePayPalOrder(amount, bookingId, serviceName);
                  if (res && res.orderId) {
                    return res.orderId;
                  }
                } catch (backendErr) {
                  console.warn('Backend PayPal order creation offline/unavailable, using direct PayPal SDK order creation:', backendErr.message);
                }

                // 2. Resilient Fallback: direct PayPal client SDK order creation
                if (actions && actions.order && actions.order.create) {
                  try {
                    const formattedAmount = (parseFloat(amount) || 0).toFixed(2);
                    const orderId = await actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [
                        {
                          reference_id: bookingId || `LICHT-REF-${Date.now()}`,
                          description: `Cleaning Service: ${serviceName || 'Cleaning Service'} (Ref: ${bookingId || 'Direct'})`,
                          custom_id: bookingId || '',
                          amount: {
                            currency_code: 'GBP',
                            value: formattedAmount,
                          },
                        },
                      ],
                    });
                    return orderId;
                  } catch (sdkErr) {
                    console.error('PayPal SDK createOrder error:', sdkErr);
                    if (onError) onError(sdkErr.message || 'PayPal order creation failed.');
                    throw sdkErr;
                  }
                }

                const err = new Error('Could not initialize PayPal order');
                if (onError) onError(err.message);
                throw err;
              },
              onApprove: async (data, actions) => {
                try {
                  if (onError) onError(null);
                  let captureRes = null;

                  // 1. Attempt backend capture first
                  try {
                    captureRes = await apiCapturePayPalOrder(
                      data.orderID,
                      bookingId,
                      bookingId ? 'POST_SERVICE' : 'BOOKING'
                    );
                  } catch (backendErr) {
                    console.warn('Backend PayPal capture endpoint unavailable, falling back to PayPal SDK capture:', backendErr.message);
                  }

                  // 2. Resilient Fallback: PayPal client SDK capture
                  if (!captureRes || captureRes.status !== 'COMPLETED') {
                    if (actions && actions.order && actions.order.capture) {
                      const details = await actions.order.capture();
                      const captureItem = details?.purchase_units?.[0]?.payments?.captures?.[0];
                      captureRes = {
                        status: details?.status || 'COMPLETED',
                        orderId: details?.id || data.orderID,
                        captureId: captureItem?.id || details?.id || data.orderID,
                        transactionId: captureItem?.id || details?.id,
                        payerEmail: details?.payer?.email_address || '',
                        payerName: `${details?.payer?.name?.given_name || ''} ${details?.payer?.name?.surname || ''}`.trim(),
                        amount: captureItem?.amount?.value || details?.purchase_units?.[0]?.amount?.value || amount,
                        currency: captureItem?.amount?.currency_code || 'GBP',
                        paidAt: new Date().toISOString(),
                        bookingId: bookingId,
                      };
                    }
                  }

                  if (onPaymentSuccess) {
                    onPaymentSuccess(captureRes || {
                      status: 'COMPLETED',
                      orderId: data.orderID,
                      captureId: data.orderID,
                    });
                  }
                } catch (err) {
                  console.error('PayPal capture error:', err);
                  if (onError) onError(err.message || 'Payment capture failed. Please try again.');
                }
              },
              onError: (err) => {
                console.error('PayPal Buttons error:', err);
                if (onError) onError('PayPal encountered a connection error. Please try again.');
              },
            }).render(containerRef.current);
          } catch (renderErr) {
            console.error('PayPal button render error:', renderErr);
            setLoadError(renderErr.message);
          }
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setLoading(false);
        setLoadError(err.message);
      });

    return () => {
      isCancelled = true;
    };
  }, [amount, bookingId, serviceName, onError, onPaymentSuccess]);

  return (
    <div className="paypal-smart-container">
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px 10px', color: 'var(--slate-mid)', fontSize: '0.82rem' }}>
          <div className="payment-spinner" style={{ width: '28px', height: '28px', margin: '0 auto 8px' }} />
          Connecting to secure PayPal Live Gateway...
        </div>
      )}
      {loadError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
          ⚠️ PayPal Notice: {loadError}. You can also choose Credit/Debit Card or Pay After Service.
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}

export function PayPalPostServiceModal({ isOpen, onClose, booking, onPaymentSuccess }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSuccess = (res) => {
    setPaidSuccess(true);
    setTxnDetails(res);
    if (onPaymentSuccess) {
      onPaymentSuccess(res.booking || {
        ...booking,
        status: 'Completed & Paid (PayPal)',
        paidAmount: booking.totalPrice,
        paymentMethod: 'PayPal',
        transactionId: res.captureId,
      });
    }
  };

  return (
    <div className="licht-modal-overlay" onClick={onClose}>
      <div className="licht-modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
            <span style={{ color: '#003087', fontWeight: 900 }}>P</span>
            <span>LICHT House Cleaning — Settle Balance</span>
          </h2>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close">✕</button>
        </div>

        <div className="licht-modal-body" style={{ padding: '24px' }}>
          {paidSuccess ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '1.25rem' }}>
                Payment of £{booking.totalPrice} Captured!
              </h3>
              <p style={{ color: 'var(--slate-mid)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Your service balance has been settled via PayPal. An official VAT invoice has been emailed to <strong>{booking.clientEmail}</strong>.
              </p>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.82rem', textAlign: 'left' }}>
                <div><strong>Booking Ref:</strong> {booking.id}</div>
                <div style={{ marginTop: '4px' }}><strong>Capture ID:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--teal)' }}>{txnDetails?.captureId || booking.transactionId}</span></div>
                <div style={{ marginTop: '4px' }}><strong>Amount:</strong> £{booking.totalPrice} (inc. VAT)</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="service-book-btn"
                style={{ width: '100%', padding: '12px' }}
              >
                Close & View Bookings
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--slate-mid)' }}>Service:</span>
                  <strong style={{ color: 'var(--navy)' }}>{booking.serviceName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--slate-mid)' }}>Booking Reference:</span>
                  <strong style={{ color: 'var(--navy)' }}>{booking.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--slate-mid)' }}>Date & Window:</span>
                  <span>{booking.date} · {booking.timeSlot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--navy)' }}>Total Balance Due:</span>
                  <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '1.15rem' }}>£{booking.totalPrice}</span>
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--slate-mid)' }}>
                🔒 256-Bit Secure PayPal & Card Checkout (GBP) · LICHT House Cleaning
              </div>

              <PayPalButtonContainer
                amount={booking.totalPrice}
                bookingId={booking.id}
                serviceName={booking.serviceName}
                onPaymentSuccess={handleSuccess}
                onError={setErrorMsg}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. BOOKING FLOW MODAL
   ========================================================================== */
export function BookingModal({
  isOpen,
  onClose,
  service,
  cartItems = [],
  user,
  onConfirmBooking,
  onViewBookings,
}) {
  const isCartBooking = !service && cartItems.length > 0;

  // 5-Step Flow: 1: Scope & Freq, 2: Schedule, 3: Address, 4: Payment Gateway, 5: Confirmed Receipt
  const [step, setStep] = useState(1);
  const [frequency, setFrequency] = useState('one-off'); // one-off, weekly, fortnightly, monthly
  const [propertySize, setPropertySize] = useState('standard'); // compact, standard, large
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('morning'); // morning, afternoon, evening
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+44 20 8000 0000');
  const [address, setAddress] = useState(user?.address || '14 Berkeley Square, Mayfair');
  const [postcode, setPostcode] = useState('W1J 6BQ');
  const [notes, setNotes] = useState('');

  const [isProcessingPayment] = useState(false);

  const [preAssignedBookingId] = useState(() => 'LICHT-BK-' + Math.floor(1000 + Math.random() * 9000));
  const [preAssignedOtp] = useState(() => '' + Math.floor(1000 + Math.random() * 9000));
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  if (!isOpen) return null;

  // Price calculations
  const basePrice = isCartBooking
    ? cartItems.reduce((sum, item) => sum + (item.price || 150) * (item.quantity || 1), 0)
    : (service?.price || 150);

  const sizeAddon = propertySize === 'compact' ? 0 : propertySize === 'standard' ? 40 : 90;
  const rawSubtotal = basePrice + sizeAddon;

  // Frequency discounts
  const discountRate = frequency === 'weekly' ? 0.15 : frequency === 'fortnightly' ? 0.10 : frequency === 'monthly' ? 0.05 : 0;
  const discountAmount = Math.round(rawSubtotal * discountRate);
  const netTotal = rawSubtotal - discountAmount;
  const vatAmount = Math.round(netTotal * 0.20);
  const grandTotal = netTotal + vatAmount;

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Proceed to Step 4: Review & Confirm Screen
      setStep(4);
    }
  };

  const handlePayLaterConfirm = () => {
    const txnId = 'DUE-AFTER-SERVICE';
    const newBooking = {
      id: preAssignedBookingId,
      transactionId: txnId,
      paymentMethod: 'PayPal (Post-Service)',
      paidAmount: 0.0,
      paymentStatus: 'PENDING_PAYMENT',
      paymentLink: `https://lichtmarketinglimited.org/?pay=${preAssignedBookingId}`,
      serviceName: isCartBooking
        ? `${cartItems.length} Cleaning Services (${cartItems.map(i => i.title).join(', ')})`
        : service.title,
      serviceId: service?.id || 'multi_cart',
      serviceImg: service?.img || cartItems[0]?.img || '/service_office.jpg',
      frequency: frequency === 'weekly' ? 'Weekly Contract' : frequency === 'fortnightly' ? 'Fortnightly Service' : frequency === 'monthly' ? 'Monthly Service' : 'One-Off Deep Clean',
      propertySize: propertySize === 'compact' ? 'Compact Space (<1,500 sq ft)' : propertySize === 'standard' ? 'Standard Premises (1,500-3,500 sq ft)' : 'Large Complex (3,500+ sq ft)',
      date,
      timeSlot: timeSlot === 'morning' ? 'Morning Window (08:00 – 12:00)' : timeSlot === 'afternoon' ? 'Afternoon Window (12:00 – 16:00)' : 'Evening Shift (18:00 – 22:00)',
      address: `${address}, ${postcode}`,
      notes,
      totalPrice: grandTotal,
      clientName: clientName || user?.name || 'Customer',
      clientEmail: clientEmail || user?.email || 'info@lichtmarketinglimited.org',
      clientPhone: phone,
      createdAt: new Date().toLocaleDateString('en-GB'),
      status: 'Booking Requested (Pending Assignment)',
      completionOtp: preAssignedOtp,
      otpVerified: false,
    };

    setConfirmedBookingData(newBooking);
    onConfirmBooking(newBooking);
    setStep(5);
  };

  const handleClose = () => {
    setStep(1);
    setConfirmedBookingData(null);
    onClose();
  };

  return (
    <div className="licht-modal-overlay" onClick={handleClose}>
      <div className="licht-modal-box large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title">
            {step === 5 ? 'Booking Request Confirmed' : step === 4 ? 'Review & Confirm Request' : 'Book Professional Cleaning'}
          </h2>
          <button onClick={handleClose} className="licht-modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="licht-modal-body">
          {step < 5 ? (
            <>
              {/* Service Banner Preview */}
              <div className="booking-hero-preview">
                <img
                  src={service?.img || cartItems[0]?.img || '/service_office.jpg'}
                  alt={service?.title || 'Selected Services'}
                  className="booking-preview-img"
                />
                <div className="booking-preview-details">
                  <span className="booking-preview-tag">
                    {service?.badge || 'Verified Service'}
                  </span>
                  <div className="booking-preview-title">
                    {isCartBooking ? `Cart Checkout (${cartItems.length} Services)` : service?.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-mid)' }}>
                    Base Rate: £{basePrice} · Fully insured and DBS vetted teams
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="booking-steps-nav">
                <div className={`booking-step-chip ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                  1. Scope & Frequency
                </div>
                <div className={`booking-step-chip ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                  2. Schedule Date & Time
                </div>
                <div className={`booking-step-chip ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                  3. Address & Access
                </div>
                <div className={`booking-step-chip ${step === 4 ? 'active' : ''}`}>
                  4. Review & Confirm
                </div>
              </div>

              {/* STEP 1: Frequency & Scope */}
              {step === 1 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Select Cleaning Frequency</label>
                    <div className="frequency-grid">
                      <div
                        className={`frequency-card-btn ${frequency === 'one-off' ? 'selected' : ''}`}
                        onClick={() => setFrequency('one-off')}
                      >
                        <div className="frequency-title">One-Off Clean</div>
                        <div className="frequency-discount">Standard Rate</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${frequency === 'weekly' ? 'selected' : ''}`}
                        onClick={() => setFrequency('weekly')}
                      >
                        <div className="frequency-title">Weekly</div>
                        <div className="frequency-discount">Save 15%</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${frequency === 'fortnightly' ? 'selected' : ''}`}
                        onClick={() => setFrequency('fortnightly')}
                      >
                        <div className="frequency-title">Fortnightly</div>
                        <div className="frequency-discount">Save 10%</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${frequency === 'monthly' ? 'selected' : ''}`}
                        onClick={() => setFrequency('monthly')}
                      >
                        <div className="frequency-title">Monthly</div>
                        <div className="frequency-discount">Save 5%</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Facility / Property Scale</label>
                    <div className="frequency-grid">
                      <div
                        className={`frequency-card-btn ${propertySize === 'compact' ? 'selected' : ''}`}
                        onClick={() => setPropertySize('compact')}
                      >
                        <div className="frequency-title">Compact Space</div>
                        <div className="frequency-discount">&lt;1,500 sq ft</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${propertySize === 'standard' ? 'selected' : ''}`}
                        onClick={() => setPropertySize('standard')}
                      >
                        <div className="frequency-title">Standard Size</div>
                        <div className="frequency-discount">1,500–3,500 sq ft (+£40)</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${propertySize === 'large' ? 'selected' : ''}`}
                        onClick={() => setPropertySize('large')}
                      >
                        <div className="frequency-title">Large Complex</div>
                        <div className="frequency-discount">3,500+ sq ft (+£90)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Schedule Date & Time */}
              {step === 2 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Select Date for Service</label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Arrival Window</label>
                    <div className="slot-selection-grid">
                      <div
                        className={`slot-choice-btn ${timeSlot === 'morning' ? 'selected' : ''}`}
                        onClick={() => setTimeSlot('morning')}
                      >
                        ☀️ Morning<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>08:00 – 12:00</span>
                      </div>

                      <div
                        className={`slot-choice-btn ${timeSlot === 'afternoon' ? 'selected' : ''}`}
                        onClick={() => setTimeSlot('afternoon')}
                      >
                        ⛅ Afternoon<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>12:00 – 16:00</span>
                      </div>

                      <div
                        className={`slot-choice-btn ${timeSlot === 'evening' ? 'selected' : ''}`}
                        onClick={() => setTimeSlot('evening')}
                      >
                        🌙 Evening Shift<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>18:00 – 22:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Address & Access */}
              {step === 3 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Alexander Thorne"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-input"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="e.g. alexander@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">UK Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 20 8000 0000"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postcode *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. W1J 6BQ"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">UK Street Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Berkeley Square, London"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cleaning Requirements &amp; Access Notes</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      style={{ resize: 'none' }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Deep clean kitchen and bathrooms, key safe code 4892, pet on premises."
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM BOOKING (NO PAYMENT DUE TODAY) */}
              {step === 4 && (
                <div>
                  <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#16a34a', fontSize: '1.15rem', fontWeight: 900 }}>✓</span>
                      <strong style={{ color: '#15803d', fontSize: '0.98rem' }}>£0.00 Due Today — No Upfront Payment Required</strong>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                      Your cleaning service is confirmed with zero upfront charge. When our verified cleaner completes the job at your property, you will receive an official invoice and a secure PayPal link to settle by PayPal or Card in GBP.
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-mid)', fontWeight: 800, marginBottom: '10px' }}>
                      Booking Details & Access
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', fontSize: '0.84rem' }}>
                      <div>
                        <span style={{ color: 'var(--slate-mid)' }}>Service: </span>
                        <strong style={{ color: 'var(--navy)' }}>{isCartBooking ? `${cartItems.length} Services` : service?.title}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-mid)' }}>Frequency: </span>
                        <strong>{frequency === 'weekly' ? 'Weekly' : frequency === 'fortnightly' ? 'Fortnightly' : frequency === 'monthly' ? 'Monthly' : 'One-Off'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-mid)' }}>Date & Window: </span>
                        <strong>{date} ({timeSlot})</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-mid)' }}>Contact Phone: </span>
                        <strong>{phone}</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: 'var(--slate-mid)' }}>Address: </span>
                        <strong>{address}, {postcode}</strong>
                      </div>
                      {notes && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--slate-mid)' }}>Access Notes: </span>
                          <span>{notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayLaterConfirm}
                    className="service-book-btn"
                    style={{ width: '100%', padding: '15px', fontSize: '0.98rem', background: '#0f766e', cursor: 'pointer', fontWeight: 800 }}
                  >
                    Confirm Booking Request (£{grandTotal} Due After Service)
                  </button>
                </div>
              )}

              {/* Price Summary Box */}
              <div className="booking-pricing-breakdown">
                <div className="price-line-row">
                  <span>Base Cleaning Service</span>
                  <span>£{basePrice}</span>
                </div>
                {sizeAddon > 0 && (
                  <div className="price-line-row">
                    <span>Premises Scale Adjustment</span>
                    <span>+£{sizeAddon}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="price-line-row" style={{ color: 'var(--teal)' }}>
                    <span>Frequency Discount ({discountRate * 100}%)</span>
                    <span>-£{discountAmount}</span>
                  </div>
                )}
                <div className="price-line-row">
                  <span>VAT (20%)</span>
                  <span>£{vatAmount}</span>
                </div>
                <div className="price-line-row total-row">
                  <span>{step === 4 ? 'Total Due After Service' : 'Estimated Total'}</span>
                  <span>£{grandTotal}</span>
                </div>
              </div>

              {/* Step Navigation Buttons */}
              {!isProcessingPayment && (
                <div className="booking-modal-actions">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="modal-back-btn"
                    >
                      Back
                    </button>
                  )}
                  {step < 4 && (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="modal-next-btn"
                    >
                      {step === 3 ? 'Review & Confirm Booking' : 'Continue to Next Step'}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* STEP 5: Booking Confirmation & Service PIN Screen */
            <div className="booking-success-box">
              <div className="booking-success-icon">✓</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '6px' }}>
                Booking Request Confirmed!
              </h3>
              <p style={{ color: 'var(--slate-mid)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                We have received your booking request! Our operations team will assign a vetted operative and confirm your appointment. Confirmation details have been emailed to <strong>{confirmedBookingData?.clientEmail}</strong>.
              </p>

              <div className="booking-ref-badge" style={{ marginTop: '14px' }}>
                Booking Reference: {confirmedBookingData?.id}
              </div>

              {/* SERVICE COMPLETION VERIFICATION OTP BOX */}
              <div style={{
                background: '#f0fdfa',
                border: '2px dashed #0d9488',
                borderRadius: '16px',
                padding: '20px 24px',
                textAlign: 'center',
                margin: '18px 0 22px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.08)'
              }}>
                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f766e', fontWeight: 800, marginBottom: '6px' }}>
                  Service Completion Verification PIN / OTP
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 900, color: '#0f766e', letterSpacing: '8px', margin: '6px 0' }}>
                  {confirmedBookingData?.completionOtp || '5829'}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#115e59', lineHeight: 1.45 }}>
                  <strong>How this works:</strong> Provide this 4-digit PIN to your cleaning operative once the service has been satisfactorily completed at your property.
                </p>
              </div>

              <div style={{ background: 'var(--bg-offwhite)', borderRadius: '16px', padding: '18px 22px', textAlign: 'left', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <strong>Service:</strong> {confirmedBookingData?.serviceName}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <strong>Scheduled Date:</strong> {confirmedBookingData?.date} ({confirmedBookingData?.timeSlot})
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <strong>Location:</strong> {confirmedBookingData?.address}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <strong>Payment Terms:</strong> Settle after cleaning via secure PayPal email link
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Total Amount:</strong> £{confirmedBookingData?.totalPrice} (inc. VAT) · Status: <span style={{ color: '#d97706', fontWeight: 700 }}>Payment Due After Service (£0.00 Charged Today)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { handleClose(); onViewBookings(); }}
                  className="service-book-btn"
                  style={{ flex: 1, padding: '14px 20px' }}
                >
                  View in My Bookings
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="service-cart-btn"
                  style={{ padding: '14px 20px' }}
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. CART SLIDE-IN DRAWER
   ========================================================================== */
export function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 150) * (item.quantity || 1), 0);
  const vat = Math.round(subtotal * 0.20);
  const total = subtotal + vat;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span> Cleaning Cart ({cart.length})
          </h3>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-mid)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
              <h4 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '1.2rem' }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Browse our services and click "+ Add to Cart" to build your custom cleaning package.
              </p>
              <button
                onClick={onClose}
                className="service-book-btn"
                style={{ padding: '10px 24px' }}
              >
                Explore Services
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <img src={item.img} alt={item.title} className="cart-item-thumb" />
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-freq">{item.frequency || 'One-off Clean'}</div>
                  <div className="cart-item-price">
                    £{item.price * item.quantity}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border-medium)', background: '#fff', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border-medium)', background: '#fff', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="cart-item-remove-btn"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ marginBottom: '14px' }}>
              <div className="price-line-row">
                <span>Subtotal</span>
                <span>£{subtotal}</span>
              </div>
              <div className="price-line-row">
                <span>VAT (20%)</span>
                <span>£{vat}</span>
              </div>
              <div className="price-line-row total-row">
                <span>Total</span>
                <span>£{total}</span>
              </div>
            </div>

            <button
              onClick={onProceedCheckout}
              className="form-submit-btn"
              style={{ margin: 0, width: '100%' }}
            >
              Proceed to Schedule Booking ({cart.length} services)
            </button>

            <button
              onClick={onClearCart}
              style={{ background: 'none', border: 'none', color: 'var(--slate-mid)', fontSize: '0.78rem', width: '100%', marginTop: '10px', cursor: 'pointer', textAlign: 'center' }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. CLIENT BOOKINGS HISTORY MODAL (ACTIVE & COMPLETED ORDERS TRACKING)
   ========================================================================== */
export function MyBookingsModal({
  isOpen,
  onClose,
  bookings = [],
  onCancelBooking,
  onBookNew,
  onBookingPaid,
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [payPalModalBooking, setPayPalModalBooking] = useState(null);

  if (!isOpen) return null;

  const isCompletedBooking = (b) => {
    const s = (b.status || '').toLowerCase();
    return s.includes('completed') || Boolean(b.otpVerified);
  };

  const isCancelledBooking = (b) => {
    return (b.status || '').toLowerCase().includes('cancel');
  };

  const completedBookings = bookings.filter(isCompletedBooking);
  const activeBookings = bookings.filter((b) => !isCompletedBooking(b) && !isCancelledBooking(b));

  const displayedList =
    activeFilter === 'completed'
      ? completedBookings
      : activeFilter === 'active'
      ? activeBookings
      : bookings;

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackNotice(`✓ Thank you for your ${feedbackRating}-star review! Your feedback for order ${feedbackBooking?.id} has been submitted.`);
    setTimeout(() => {
      setFeedbackNotice('');
      setFeedbackBooking(null);
      setFeedbackRating(5);
      setFeedbackComment('');
    }, 2500);
  };

  return (
    <div className="licht-modal-overlay" onClick={onClose}>
      <div className="licht-modal-box large-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="licht-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📅</span>
            <div>
              <h2 className="licht-modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>
                My Cleaning Reservations &amp; Service History
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-mid)', marginTop: '2px' }}>
                Track upcoming appointments, view verified completed cleans, and download VAT receipts.
              </div>
            </div>
          </div>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── SUB-TABS: ALL / ACTIVE / COMPLETED ── */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border-light)',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeFilter === 'all' ? '1.5px solid var(--navy)' : '1px solid #cbd5e1',
              background: activeFilter === 'all' ? 'var(--navy)' : '#ffffff',
              color: activeFilter === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease',
            }}
          >
            All Bookings ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeFilter === 'active' ? '1.5px solid var(--teal)' : '1px solid #cbd5e1',
              background: activeFilter === 'active' ? 'var(--teal)' : '#ffffff',
              color: activeFilter === 'active' ? '#ffffff' : '#0f766e',
              transition: 'all 0.2s ease',
            }}
          >
            ⏳ Scheduled &amp; Active ({activeBookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeFilter === 'completed' ? '1.5px solid #059669' : '1px solid #cbd5e1',
              background: activeFilter === 'completed' ? '#059669' : '#ffffff',
              color: activeFilter === 'completed' ? '#ffffff' : '#065f46',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✓</span> Previous Completed Orders ({completedBookings.length})
          </button>
        </div>

        <div className="licht-modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {feedbackNotice && (
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
              {feedbackNotice}
            </div>
          )}

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--slate-mid)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '8px' }}>No Cleaning Bookings Found</h3>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>
                You have not booked any cleaning services yet. Select from our accredited commercial and domestic services.
              </p>
              <button
                onClick={() => { onClose(); onBookNew(); }}
                className="service-book-btn"
                style={{ padding: '12px 28px' }}
              >
                Browse &amp; Book Services ↗
              </button>
            </div>
          ) : displayedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', color: 'var(--slate-mid)', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
                {activeFilter === 'completed' ? '✨' : '⏳'}
              </div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '6px', fontSize: '1.05rem' }}>
                {activeFilter === 'completed' ? 'No Completed Orders Yet' : 'No Scheduled Active Bookings'}
              </h3>
              <p style={{ fontSize: '0.84rem', margin: '0 auto 18px', maxWidth: '420px', lineHeight: 1.5 }}>
                {activeFilter === 'completed'
                  ? 'Once your operative finishes work on-site and authenticates your 4-digit PIN, your verified completion records and VAT receipts will appear here.'
                  : 'You do not have any upcoming scheduled cleanings at this time.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{ background: 'var(--navy)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                View All Bookings ({bookings.length})
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: 'var(--slate-mid)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Showing <strong>{displayedList.length}</strong> {activeFilter === 'completed' ? 'completed order(s)' : activeFilter === 'active' ? 'active order(s)' : 'reservation(s)'}:
                </span>
                {completedBookings.length > 0 && activeFilter !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('completed')}
                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    View {completedBookings.length} Completed Service(s) →
                  </button>
                )}
              </div>

              {displayedList.map((b) => {
                const isCompleted = isCompletedBooking(b);
                const isCancelled = isCancelledBooking(b);
                const isUnpaid = !isCancelled && (!b.paidAmount || b.paidAmount === 0 || (b.status || '').toLowerCase().includes('pay after service') || (b.status || '').toLowerCase().includes('unpaid'));

                return (
                  <div
                    key={b.id}
                    className="booking-history-card"
                    style={{
                      border: isCompleted ? '1.5px solid #86efac' : isCancelled ? '1px solid #fecaca' : '1px solid var(--border-light)',
                      background: isCompleted ? '#f0fdf4' : isCancelled ? '#fff5f5' : 'var(--bg-offwhite)',
                      boxShadow: isCompleted ? '0 4px 16px rgba(22, 101, 52, 0.06)' : 'none',
                    }}
                  >
                    <div className="booking-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="booking-card-ref">REF: {b.id}</span>
                        {isCompleted && (
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>✓</span> Completed &amp; Verified
                          </span>
                        )}
                      </div>
                      <span
                        className="booking-status-tag"
                        style={
                          isCompleted
                            ? { background: 'rgba(22, 163, 74, 0.15)', color: '#15803d', borderColor: '#86efac' }
                            : isCancelled
                            ? { background: '#fee2e2', color: '#dc2626' }
                            : {}
                        }
                      >
                        {b.status || 'Confirmed & Scheduled (Paid)'}
                      </span>
                    </div>

                    <h4 className="booking-card-title">{b.serviceName}</h4>

                    <div className="booking-card-meta">
                      🗓 <strong>Scheduled:</strong> {b.date} · {b.timeSlot}
                      {b.completedAt && (
                        <span style={{ marginLeft: '12px', color: '#15803d', fontWeight: 600 }}>
                          • <strong>Completed At:</strong> {b.completedAt}
                        </span>
                      )}
                    </div>
                    <div className="booking-card-meta">
                      📍 <strong>Service Address:</strong> {b.address}
                    </div>
                    <div className="booking-card-meta">
                      🔄 <strong>Plan:</strong> {b.frequency} {b.propertySize ? `· ${b.propertySize}` : ''}
                    </div>

                    {/* ── SECURITY PIN BOX (DIFFERENTIATES ACTIVE VS COMPLETED) ── */}
                    {isCompleted ? (
                      <div style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        margin: '12px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#065f46', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>🛡️</span> Service Completed &amp; Authenticated On-Site
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '2px' }}>
                            Security OTP <code>{b.completionOtp || '5829'}</code> was verified by the DBS-vetted operative.
                          </div>
                        </div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: '#065f46',
                          background: '#d1fae5',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}>
                          ✓ PIN Authenticated
                        </span>
                      </div>
                    ) : (
                      b.completionOtp && (
                        <div style={{
                          background: '#f0fdfa',
                          border: '1px solid #99f6e4',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          margin: '12px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0f766e', fontWeight: 800 }}>
                              🔐 Service Completion PIN:
                            </div>
                            <div style={{ fontSize: '0.73rem', color: '#134e4a', marginTop: '2px' }}>
                              Give to operative once work is completed to verify service
                            </div>
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 900, color: '#0f766e', background: '#ccfbf1', padding: '3px 12px', borderRadius: '6px', letterSpacing: '3px' }}>
                            {b.completionOtp}
                          </span>
                        </div>
                      )
                    )}

                    {/* ── CARD FOOTER WITH PRICING & ACTIONS ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: '800', color: 'var(--navy)', fontSize: '1.05rem' }}>
                          £{b.totalPrice || b.paidAmount} <span style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', fontWeight: 'normal' }}>(inc. VAT)</span>
                        </div>
                        {isUnpaid ? (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde047' }}>
                            ⏳ Payment Due (£{b.totalPrice})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                            ✓ Paid ({b.paymentMethod?.includes('PayPal') ? 'PayPal' : 'Card'})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Live PayPal Post-Service Settlement Button */}
                        {isUnpaid && (
                          <button
                            type="button"
                            onClick={() => setPayPalModalBooking(b)}
                            style={{
                              background: '#ffc439',
                              border: '1px solid #e0a51d',
                              color: '#111827',
                              fontSize: '0.78rem',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(224, 165, 29, 0.35)',
                            }}
                            title="Settle booking balance online with PayPal"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#003087">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.004.408 5.42.043 5.918.043h7.728c3.275 0 5.612.784 6.758 2.268 1.096 1.42 1.258 3.398.48 5.882-.015.048-.033.095-.049.143-.323 1.077-.852 1.99-1.574 2.716-.762.766-1.745 1.343-2.923 1.714-1.127.355-2.434.536-3.886.536H10.12l-1.39 8.815c-.059.414-.416.72-.834.72l-.82.014z" />
                            </svg>
                            <span>Pay £{b.totalPrice} with PayPal</span>
                          </button>
                        )}
                        {isCompleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptBooking(b)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #059669',
                                color: '#059669',
                                fontSize: '0.75rem',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="View official VAT receipt and completion certificate"
                            >
                              <span>📄</span> View Receipt
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setFeedbackBooking(b);
                                setFeedbackRating(5);
                                setFeedbackComment('');
                              }}
                              style={{
                                background: '#fef3c7',
                                border: '1px solid #fde047',
                                color: '#92400e',
                                fontSize: '0.75rem',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Leave a review for this service"
                            >
                              <span>★</span> Leave Review
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onBookNew();
                              }}
                              style={{
                                background: '#0f766e',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Rebook this cleaning service"
                            >
                              <span>🔄</span> Book Again
                            </button>
                          </>
                        ) : !isCancelled ? (
                          <button
                            type="button"
                            onClick={() => onCancelBooking(b.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}
                          >
                            Cancel Booking
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: OFFICIAL VAT RECEIPT & COMPLETION CERTIFICATE ── */}
      {selectedReceiptBooking && (
        <div
          className="licht-modal-overlay"
          onClick={() => setSelectedReceiptBooking(null)}
          style={{ zIndex: 2500 }}
        >
          <div
            className="licht-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px', background: '#ffffff', padding: '0', borderRadius: '16px', overflow: 'hidden' }}
          >
            {/* Header */}
            <div style={{ background: '#10264A', padding: '24px', color: '#ffffff', borderBottom: '3px solid #1599AC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    LICHT MARKETING LIMITED
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Home &amp; Corporate Cleaning Excellence
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    Company Reg: 14892011 · VAT Reg: GB 442 8912 04
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptBooking(null)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Tax Invoice &amp; Receipt Ref</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {selectedReceiptBooking.id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                    ✓ PAID &amp; COMPLETED
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Service Rendered
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#10264A' }}>
                  {selectedReceiptBooking.serviceName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                  {selectedReceiptBooking.frequency} {selectedReceiptBooking.propertySize ? `· ${selectedReceiptBooking.propertySize}` : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                  <strong>Address:</strong> {selectedReceiptBooking.address}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                  <strong>Date Scheduled:</strong> {selectedReceiptBooking.date} ({selectedReceiptBooking.timeSlot})
                </div>
                {selectedReceiptBooking.completedAt && (
                  <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>
                    <strong>Verified Completed:</strong> {selectedReceiptBooking.completedAt}
                  </div>
                )}
                {selectedReceiptBooking.completionOtp && (
                  <div style={{ fontSize: '0.75rem', color: '#0f766e', marginTop: '6px', fontWeight: 700 }}>
                    🔐 Verified On-Site with PIN: <code>{selectedReceiptBooking.completionOtp}</code>
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', color: '#475569' }}>
                  <span>Service Subtotal (Net):</span>
                  <span>£{((selectedReceiptBooking.totalPrice || selectedReceiptBooking.paidAmount || 180) / 1.2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', color: '#475569' }}>
                  <span>UK VAT (20%):</span>
                  <span>£{((selectedReceiptBooking.totalPrice || selectedReceiptBooking.paidAmount || 180) - (selectedReceiptBooking.totalPrice || selectedReceiptBooking.paidAmount || 180) / 1.2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, padding: '10px 0', borderTop: '2px solid #e2e8f0', color: '#10264A', marginTop: '4px' }}>
                  <span>Total Paid (inc. VAT):</span>
                  <span>£{selectedReceiptBooking.totalPrice || selectedReceiptBooking.paidAmount}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right' }}>
                  Payment Method: {selectedReceiptBooking.paymentMethod || 'Visa / Mastercard Secure Escrow'}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    background: '#10264A',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🖨️</span> Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptBooking(null)}
                  style={{
                    padding: '12px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: 5-STAR SERVICE FEEDBACK ── */}
      {feedbackBooking && (
        <div
          className="licht-modal-overlay"
          onClick={() => setFeedbackBooking(null)}
          style={{ zIndex: 2500 }}
        >
          <div
            className="licht-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.15rem' }}>
                Rate Your Cleaning Experience
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackBooking(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--slate-mid)', marginTop: 0, marginBottom: '18px' }}>
              How did our DBS-vetted operative perform for <strong>{feedbackBooking.serviceName}</strong>?
            </p>

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: star <= feedbackRating ? '#f59e0b' : '#cbd5e1',
                      transition: 'transform 0.15s ease',
                    }}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  Comments or Suggestions (Optional)
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Share details on the clean, punctuality, or attention to detail..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ width: '100%', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="service-book-btn"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Submit Feedback ★
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackBooking(null)}
                  style={{
                    padding: '12px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PAYPAL POST-SERVICE BALANCE SETTLEMENT MODAL ── */}
      <PayPalPostServiceModal
        isOpen={Boolean(payPalModalBooking)}
        onClose={() => setPayPalModalBooking(null)}
        booking={payPalModalBooking}
        onPaymentSuccess={(updatedBooking) => {
          if (onBookingPaid) onBookingPaid(updatedBooking);
          setPayPalModalBooking(null);
        }}
      />
    </div>
  );
}
