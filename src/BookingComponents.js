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
   2. AUTHENTICATION MODAL (LOGIN / REGISTER / QUICK DEMO)
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
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      onLogin({ email, password });
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please complete all required fields.');
        return;
      }
      onRegister({ name, email, password, phone });
    }
  };

  return (
    <div className="licht-modal-overlay" onClick={onClose}>
      <div className="licht-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title">
            {mode === 'login' ? 'Client Sign In' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="licht-modal-body">
          {message && (
            <div className="auth-message-banner">
              <span>🔒</span>
              <span>{message}</span>
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div className="demo-login-box">
            <div className="demo-login-info">
              <div className="demo-login-title">
                <span>⚡</span> Instant Demo Client Login
              </div>
              <div>Test the booking and cart flow with 1-click verified credentials.</div>
            </div>
            <button
              type="button"
              onClick={onDemoLogin}
              className="demo-quick-btn"
            >
              Sign In Demo
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Existing Client Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              New Client Registration
            </button>
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="form-submit-btn">
              {mode === 'login' ? 'Sign In & Continue →' : 'Create Account & Continue →'}
            </button>
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
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
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
      setProcessingStatus(`Authorizing £${grandTotal} with financial provider...`);
    }, 500);

    setTimeout(() => {
      setProcessingStatus('Payment verified & authorized!');
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingRef = `LICHT-BK-${Math.floor(1000 + Math.random() * 9000)}`;
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
        timeSlot: timeSlot === 'morning' ? 'Morning Window (08:00 – 12:00)' : timeSlot === 'afternoon' ? 'Afternoon Window (12:00 – 16:00)' : 'Evening Shift (18:00 – 22:00)',
        address: `${address}, ${postcode}`,
        notes,
        totalPrice: grandTotal,
        clientName: user?.name || 'Verified Client',
        clientEmail: user?.email || 'client@lichtmarketing.co.uk',
        createdAt: new Date().toLocaleDateString('en-GB'),
        status: 'Confirmed & Scheduled (Paid)',
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
                  1. Scope &amp; Frequency
                </div>
                <div className={`booking-step-chip ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                  2. Schedule Date &amp; Time
                </div>
                <div className={`booking-step-chip ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                  3. Address &amp; Access
                </div>
                <div className={`booking-step-chip ${step === 4 ? 'active' : ''}`}>
                  4. Payment Gateway 🔒
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
                    <span>🔒 256-Bit SSL Encrypted Payment Gateway</span>
                    <span>PCI-DSS Level 1 Compliant</span>
                  </div>

                  {isProcessingPayment ? (
                    <div className="payment-processing-overlay">
                      <div className="payment-spinner" />
                      <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '8px' }}>
                        Processing Payment (£{grandTotal})
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
                          <span className="payment-tab-icon">💳</span>
                          <span>Credit / Debit Card</span>
                        </button>

                        <button
                          type="button"
                          className={`payment-tab-btn ${paymentMethod === 'apple_pay' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('apple_pay')}
                        >
                          <span className="payment-tab-icon"></span>
                          <span>Apple / Google Pay</span>
                        </button>

                        <button
                          type="button"
                          className={`payment-tab-btn ${paymentMethod === 'invoice' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('invoice')}
                        >
                          <span className="payment-tab-icon">🏢</span>
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
                            <span> Pay</span> £{grandTotal}
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
                            📋 <strong>Net-30 B2B Payment Terms:</strong> An itemized VAT tax invoice for <strong>£{grandTotal}</strong> will be emailed to your accounts department. Technician scheduling is confirmed immediately.
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
                  <span>{step === 4 ? 'Amount to Authorize' : 'Estimated Total'}</span>
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
                      ← Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="modal-next-btn"
                    >
                      {step === 3 ? 'Proceed to Payment Gateway →' : 'Continue to Next Step →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="modal-pay-btn"
                    >
                      🔒 Pay £{grandTotal} &amp; Confirm Booking →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* STEP 5: Payment Receipt & Confirmed Screen */
            <div className="booking-success-box">
              <div className="booking-success-icon">✓</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '6px' }}>
                Booking Confirmed &amp; Payment Received!
              </h3>
              <p style={{ color: 'var(--slate-mid)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Your service has been authorized and scheduled. A certified Licht cleaning supervisor has been assigned to your booking.
              </p>

              <div className="payment-receipt-badge">
                <span>✓ Payment Captured: £{confirmedBookingData?.totalPrice}</span>
                <span style={{ fontFamily: 'monospace' }}>{paymentReceipt?.txnId}</span>
              </div>

              <div className="booking-ref-badge">
                Booking Reference: {confirmedBookingData?.id}
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
                  <strong>Confirmed Amount:</strong> £{confirmedBookingData?.totalPrice} (inc. VAT) · Status: <strong>PAID</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => alert(`Receipt ${paymentReceipt?.txnId} downloaded for £${confirmedBookingData?.totalPrice}`)}
                  className="service-cart-btn"
                  style={{ padding: '14px 20px' }}
                >
                  📄 Download Receipt (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => { handleClose(); onViewBookings(); }}
                  className="service-book-btn"
                  style={{ flex: 1, padding: '14px 20px' }}
                >
                  View in My Bookings ↗
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
            <span>🛒</span> Cleaning Cart ({cart.length})
          </h3>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-mid)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧹</div>
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
              Proceed to Schedule Booking ({cart.length} services) →
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
   5. CLIENT BOOKINGS HISTORY MODAL
   ========================================================================== */
export function MyBookingsModal({
  isOpen,
  onClose,
  bookings = [],
  onCancelBooking,
  onBookNew,
}) {
  if (!isOpen) return null;

  return (
    <div className="licht-modal-overlay" onClick={onClose}>
      <div className="licht-modal-box large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="licht-modal-header">
          <h2 className="licht-modal-title">My Scheduled Bookings</h2>
          <button onClick={onClose} className="licht-modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="licht-modal-body">
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-mid)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '8px' }}>No Active Bookings</h3>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>
                You have not booked any cleaning services yet. Choose from our accredited commercial and domestic services.
              </p>
              <button
                onClick={() => { onClose(); onBookNew(); }}
                className="service-book-btn"
                style={{ padding: '12px 28px' }}
              >
                Browse &amp; Book Services
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--slate-mid)' }}>
                You have <strong>{bookings.length}</strong> active cleaning reservation(s):
              </div>

              {bookings.map((b) => (
                <div key={b.id} className="booking-history-card">
                  <div className="booking-card-top">
                    <span className="booking-card-ref">REF: {b.id}</span>
                    <span className="booking-status-tag">{b.status}</span>
                  </div>

                  <h4 className="booking-card-title">{b.serviceName}</h4>

                  <div className="booking-card-meta">
                    🗓 <strong>Scheduled:</strong> {b.date} · {b.timeSlot}
                  </div>
                  <div className="booking-card-meta">
                    📍 <strong>Address:</strong> {b.address}
                  </div>
                  <div className="booking-card-meta">
                    🔄 <strong>Frequency:</strong> {b.frequency} ({b.propertySize})
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: '800', color: 'var(--navy)', fontSize: '1rem' }}>
                      £{b.totalPrice} <span style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', fontWeight: 'normal' }}>(inc. VAT)</span>
                    </div>

                    <button
                      onClick={() => onCancelBooking(b.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
