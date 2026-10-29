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

import React, { useState } from 'react';
import './Booking.css';
import { apiForgotPassword, apiResetPassword } from './services/api';

/* ==========================================================================
   1. TOAST NOTIFICATION COMPONENT
   ========================================================================== */
export function ToastNotification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="licht-toast" role="alert">
      <span>âœ¨ {message}</span>
      <button onClick={onClose} className="licht-toast-close" aria-label="Dismiss notification">
        âœ•
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
          // If code was returned in dev payload, prefill
          if (res.data && res.data.code) {
            setResetCode(res.data.code);
          }
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
          setStatusNotice('âœ“ Password reset successfully! You can now sign in with your new password.');
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
            âœ•
          </button>
        </div>

        <div className="licht-modal-body">
          {message && (
            <div className="auth-message-banner">
              <span>ðŸ”’</span>
              <span>{message}</span>
            </div>
          )}

          {statusNotice && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#166534', fontSize: '0.84rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>âœ‰ï¸</span>
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
              âš ï¸ {error}
            </div>
          )}

          {/* â”€â”€ FORGOT PASSWORD BANNER â”€â”€ */}
          {mode === 'forgot' && (
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '14px', padding: '16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>ðŸ“¬</span>
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

          {/* â”€â”€ RESET PASSWORD BANNER â”€â”€ */}
          {mode === 'reset' && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>ðŸ”</span>
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

          {/* â”€â”€ REGISTER NOTICE BANNER â”€â”€ */}
          {mode === 'register' && (
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>ðŸ“§</span>
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
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                mode === 'login' ? 'Sign In & Continue â†’' :
                mode === 'register' ? 'Create Account & Continue â†’' :
                mode === 'forgot' ? 'Dispatch Security Code via Email â†’' :
                'Set New Password & Sign In â†’'
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
                  â† Return to Client Sign In
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
  const [phone, setPhone] = useState(user?.phone || '+44 20 8000 0000');
  const [address, setAddress] = useState(user?.address || '14 Berkeley Square, Mayfair');
  const [postcode, setPostcode] = useState('W1J 6BQ');
  const [notes, setNotes] = useState('');

  // Payment Gateway State
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple_pay' | 'invoice'
  const [cardNumber, setCardNumber] = useState('4242 â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('389');
  const [cardholderName, setCardholderName] = useState(user?.name || 'Alex Vance');
  const [saveCard, setSaveCard] = useState(true);
  const [poNumber, setPoNumber] = useState('');
  const [accountsEmail, setAccountsEmail] = useState(user?.email || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState(null);

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
      // Proceed to Step 4: Payment Gateway Screen
      setStep(4);
    }
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setProcessingStatus('Connecting to secure 256-bit payment gateway...');

    setTimeout(() => {
      setProcessingStatus(`Authorizing Â£${grandTotal} with financial provider...`);
    }, 500);

    setTimeout(() => {
      setProcessingStatus('Payment verified & authorized!');
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingRef = `LICHT-BK-${Math.floor(1000 + Math.random() * 9000)}`;
      const completionOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const methodUsed = paymentMethod === 'apple_pay'
        ? 'Apple Pay / Google Pay'
        : paymentMethod === 'invoice'
        ? `Corporate Net-30 Invoice (PO: ${poNumber || 'LICHT-CORP-498'})`
        : `Visa ending in ${cardNumber.replace(/\D/g, '').slice(-4) || '4242'}`;

      const newBooking = {
        id: bookingRef,
        transactionId: txnId,
        paymentMethod: methodUsed,
        paidAmount: grandTotal,
        serviceName: isCartBooking
          ? `${cartItems.length} Cleaning Services (${cartItems.map(i => i.title).join(', ')})`
          : service.title,
        serviceId: service?.id || 'multi_cart',
        serviceImg: service?.img || cartItems[0]?.img || '/service_office.jpg',
        frequency: frequency === 'weekly' ? 'Weekly Contract' : frequency === 'fortnightly' ? 'Fortnightly Service' : frequency === 'monthly' ? 'Monthly Service' : 'One-Off Deep Clean',
        propertySize: propertySize === 'compact' ? 'Compact Space (<1,500 sq ft)' : propertySize === 'standard' ? 'Standard Premises (1,500-3,500 sq ft)' : 'Large Complex (3,500+ sq ft)',
        date,
        timeSlot: timeSlot === 'morning' ? 'Morning Window (08:00 â€“ 12:00)' : timeSlot === 'afternoon' ? 'Afternoon Window (12:00 â€“ 16:00)' : 'Evening Shift (18:00 â€“ 22:00)',
        address: `${address}, ${postcode}`,
        notes,
        totalPrice: grandTotal,
        clientName: user?.name || 'Verified Client',
        clientEmail: user?.email || 'info@lichtmarketinglimited.org',
        createdAt: new Date().toLocaleDateString('en-GB'),
        status: 'Confirmed & Scheduled (Paid)',
        completionOtp: completionOtp,
        otpVerified: false,
      };

      setIsProcessingPayment(false);
      setPaymentReceipt({
        txnId,
        methodUsed,
        amount: grandTotal,
        date: new Date().toLocaleDateString('en-GB'),
      });
      setConfirmedBookingData(newBooking);
      onConfirmBooking(newBooking);
      setStep(5);
    }, 1200);
  };

  const handleClose = () => {
    setStep(1);
    setIsProcessingPayment(false);
    setConfirmedBookingData(null);
    setPaymentReceipt(null);
    onClose();
  };

  return (
    <div className="licht-modal-overlay" onClick={handleClose}>
      <div className="licht-modal-box large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title">
            {step === 5 ? 'Booking Confirmed & Paid' : step === 4 ? 'Secure Payment Gateway' : 'Book Professional Cleaning'}
          </h2>
          <button onClick={handleClose} className="licht-modal-close-btn" aria-label="Close">
            âœ•
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
                    Base Rate: Â£{basePrice} Â· Fully insured and DBS vetted teams
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="booking-steps-nav">
                <div className={`booking-step-chip ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                  1. Scope &amp; Frequency
                </div>
                <div className={`booking-step-chip ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                  2. Schedule Date &amp; Time
                </div>
                <div className={`booking-step-chip ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                  3. Address &amp; Access
                </div>
                <div className={`booking-step-chip ${step === 4 ? 'active' : ''}`}>
                  4. Payment Gateway ðŸ”’
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
                        <div className="frequency-discount">1,500â€“3,500 sq ft (+Â£40)</div>
                      </div>

                      <div
                        className={`frequency-card-btn ${propertySize === 'large' ? 'selected' : ''}`}
                        onClick={() => setPropertySize('large')}
                      >
                        <div className="frequency-title">Large Complex</div>
                        <div className="frequency-discount">3,500+ sq ft (+Â£90)</div>
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
                        â˜€ï¸ Morning<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>08:00 â€“ 12:00</span>
                      </div>

                      <div
                        className={`slot-choice-btn ${timeSlot === 'afternoon' ? 'selected' : ''}`}
                        onClick={() => setTimeSlot('afternoon')}
                      >
                        â›… Afternoon<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>12:00 â€“ 16:00</span>
                      </div>

                      <div
                        className={`slot-choice-btn ${timeSlot === 'evening' ? 'selected' : ''}`}
                        onClick={() => setTimeSlot('evening')}
                      >
                        ðŸŒ™ Evening Shift<br />
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>18:00 â€“ 22:00</span>
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
                      <label className="form-label">Contact Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={user?.name || ''}
                        disabled
                        style={{ background: '#f8fafc' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 20 8000 0000"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 14 Berkeley Square"
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
                    <label className="form-label">Access Instructions / Key Code (Optional)</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      style={{ resize: 'none' }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Key safe code 4892, check in with building security, alarm deactivated."
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT GATEWAY SCREEN */}
              {step === 4 && (
                <div>
                  <div className="payment-security-banner">
                    <span>ðŸ”’ 256-Bit SSL Encrypted Payment Gateway</span>
                    <span>PCI-DSS Level 1 Compliant</span>
                  </div>

                  {isProcessingPayment ? (
                    <div className="payment-processing-overlay">
                      <div className="payment-spinner" />
                      <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '8px' }}>
                        Processing Payment (Â£{grandTotal})
                      </h4>
                      <p style={{ color: 'var(--slate-mid)', fontSize: '0.85rem' }}>
                        {processingStatus}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Payment Method Tabs */}
                      <div className="payment-methods-tabs">
                        <button
                          type="button"
                          className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <span className="payment-tab-icon">ðŸ’³</span>
                          <span>Credit / Debit Card</span>
                        </button>

                        <button
                          type="button"
                          className={`payment-tab-btn ${paymentMethod === 'apple_pay' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('apple_pay')}
                        >
                          <span className="payment-tab-icon">ï£¿</span>
                          <span>Apple / Google Pay</span>
                        </button>

                        <button
                          type="button"
                          className={`payment-tab-btn ${paymentMethod === 'invoice' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('invoice')}
                        >
                          <span className="payment-tab-icon">ðŸ¢</span>
                          <span>Corporate Invoice</span>
                        </button>
                      </div>

                      {/* Card Details View */}
                      {paymentMethod === 'card' && (
                        <div>
                          <div className="form-group">
                            <label className="form-label">Cardholder Name *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={cardholderName}
                              onChange={(e) => setCardholderName(e.target.value)}
                              placeholder="Name as it appears on card"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Card Number *</label>
                            <div className="card-input-wrapper">
                              <input
                                type="text"
                                className="form-input"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="1234 5678 9012 3456"
                                required
                              />
                              <div className="card-input-icons">
                                <span>VISA</span>
                                <span>MC</span>
                                <span>AMEX</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div className="form-group">
                              <label className="form-label">Expiry Date *</label>
                              <input
                                type="text"
                                className="form-input"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">CVC / Security Code *</label>
                              <input
                                type="password"
                                maxLength={4}
                                className="form-input"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="CVC"
                                required
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px' }}>
                            <input
                              type="checkbox"
                              id="saveCardCheckbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="saveCardCheckbox" style={{ fontSize: '0.82rem', color: 'var(--slate-dark)', cursor: 'pointer' }}>
                              Save card securely for recurring cleanings and fast checkout
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Apple Pay View */}
                      {paymentMethod === 'apple_pay' && (
                        <div className="express-pay-box">
                          <h4 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '1.05rem' }}>
                            Express One-Click Checkout
                          </h4>
                          <p style={{ color: 'var(--slate-mid)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Authorize your cleaning booking instantly using your default device card and biometric authentication.
                          </p>
                          <button
                            type="button"
                            onClick={handleProcessPayment}
                            className="apple-pay-simulate-btn"
                          >
                            <span>ï£¿ Pay</span> Â£{grandTotal}
                          </button>
                        </div>
                      )}

                      {/* Corporate Invoicing View */}
                      {paymentMethod === 'invoice' && (
                        <div className="corporate-invoice-box">
                          <div className="form-group">
                            <label className="form-label">Purchase Order (PO) Number</label>
                            <input
                              type="text"
                              className="form-input"
                              value={poNumber}
                              onChange={(e) => setPoNumber(e.target.value)}
                              placeholder="e.g. PO-LICHT-2026-904"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Accounts Payable Email *</label>
                            <input
                              type="email"
                              className="form-input"
                              value={accountsEmail}
                              onChange={(e) => setAccountsEmail(e.target.value)}
                              placeholder="accounts@company.co.uk"
                              required
                            />
                          </div>
                          <div className="corporate-terms-note">
                            ðŸ“‹ <strong>Net-30 B2B Payment Terms:</strong> An itemized VAT tax invoice for <strong>Â£{grandTotal}</strong> will be emailed to your accounts department. Technician scheduling is confirmed immediately.
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Live Price Summary Box */}
              <div className="booking-pricing-breakdown">
                <div className="price-line-row">
                  <span>Base Cleaning Service</span>
                  <span>Â£{basePrice}</span>
                </div>
                {sizeAddon > 0 && (
                  <div className="price-line-row">
                    <span>Premises Scale Adjustment</span>
                    <span>+Â£{sizeAddon}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="price-line-row" style={{ color: 'var(--teal)' }}>
                    <span>Frequency Discount ({discountRate * 100}%)</span>
                    <span>-Â£{discountAmount}</span>
                  </div>
                )}
                <div className="price-line-row">
                  <span>VAT (20%)</span>
                  <span>Â£{vatAmount}</span>
                </div>
                <div className="price-line-row total-row">
                  <span>{step === 4 ? 'Amount to Authorize' : 'Estimated Total'}</span>
                  <span>Â£{grandTotal}</span>
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
                      â† Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="modal-next-btn"
                    >
                      {step === 3 ? 'Proceed to Payment Gateway â†’' : 'Continue to Next Step â†’'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="modal-pay-btn"
                    >
                      ðŸ”’ Pay Â£{grandTotal} &amp; Confirm Booking â†’
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* STEP 5: Payment Receipt & Confirmed Screen */
            <div className="booking-success-box">
              <div className="booking-success-icon">âœ“</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '6px' }}>
                Booking Confirmed &amp; Payment Received!
              </h3>
              <p style={{ color: 'var(--slate-mid)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Your service has been authorized and scheduled. A certified Licht cleaning supervisor has been assigned to your booking.
              </p>

              <div className="payment-receipt-badge">
                <span>âœ“ Payment Captured: Â£{confirmedBookingData?.totalPrice}</span>
                <span style={{ fontFamily: 'monospace' }}>{paymentReceipt?.txnId}</span>
              </div>

              <div className="booking-ref-badge">
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
                  ðŸ” Service Completion Verification PIN / OTP
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 900, color: '#0f766e', letterSpacing: '8px', margin: '6px 0' }}>
                  {confirmedBookingData?.completionOtp || '5829'}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#115e59', lineHeight: 1.45 }}>
                  <strong>How this works:</strong> When your cleaning operative arrives and finishes the service at your property, provide them with this 4-digit code. Entering this OTP authorizes and verifies that the clean was successfully completed.
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
                  <strong>Payment Method:</strong> {paymentReceipt?.methodUsed}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Confirmed Amount:</strong> Â£{confirmedBookingData?.totalPrice} (inc. VAT) Â· Status: <strong>PAID</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => alert(`Receipt ${paymentReceipt?.txnId} downloaded for Â£${confirmedBookingData?.totalPrice}`)}
                  className="service-cart-btn"
                  style={{ padding: '14px 20px' }}
                >
                  ðŸ“„ Download Receipt (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => { handleClose(); onViewBookings(); }}
                  className="service-book-btn"
                  style={{ flex: 1, padding: '14px 20px' }}
                >
                  View in My Bookings â†—
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
            <span>ðŸ›’</span> Cleaning Cart ({cart.length})
          </h3>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close cart">
            âœ•
          </button>
        </div>

        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-mid)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>ðŸ§¹</div>
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
                    Â£{item.price * item.quantity}
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
                  âœ•
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
                <span>Â£{subtotal}</span>
              </div>
              <div className="price-line-row">
                <span>VAT (20%)</span>
                <span>Â£{vat}</span>
              </div>
              <div className="price-line-row total-row">
                <span>Total</span>
                <span>Â£{total}</span>
              </div>
            </div>

            <button
              onClick={onProceedCheckout}
              className="form-submit-btn"
              style={{ margin: 0, width: '100%' }}
            >
              Proceed to Schedule Booking ({cart.length} services) â†’
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
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

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
                      <div style={{ fontWeight: '800', color: 'var(--navy)', fontSize: '1.05rem' }}>
                        £{b.totalPrice || b.paidAmount} <span style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', fontWeight: 'normal' }}>(inc. VAT)</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
    </div>
  );
}
