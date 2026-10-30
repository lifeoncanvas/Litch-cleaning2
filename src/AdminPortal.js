import React, { useState, useEffect } from 'react';
import './Admin.css';
import {
  apiAdminLogin,
  apiLogout,
  apiFetchAllBookings,
  apiCreateBooking,
  apiCancelBooking,
  apiVerifyBookingOtp,
  apiFetchQuotes,
  apiAssignCleaner,
  apiSendPaymentRequest,
  apiFetchOperatives,
} from './services/api';

/* Clean default admin: Sharon Shelke */
const INITIAL_USERS = [
  {
    id: 'usr_owner',
    name: 'Sharon Shelke',
    email: 'sharonshelke1@gmail.com',
    role: 'ROLE_ADMIN',
    company: 'Licht Marketing Limited',
    phone: '+44 20 8000 8899',
    joined: 'Primary Owner',
  },
];

export default function AdminPortal({ onExit, onBookingUpdate }) {
  // Authentication State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_admin_auth');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminEmail, setAdminEmail] = useState('sharonshelke1@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Backend Health & Inbound Quotes State
  const [backendStatus, setBackendStatus] = useState({ online: false, port: 8081 });
  const [quotes, setQuotes] = useState([]);
  const [operatives, setOperatives] = useState([
    { id: 'OP-101', name: 'Sarah Jenkins', role: 'Commercial Specialist', phone: '+44 7911 123456', status: 'available' },
    { id: 'OP-102', name: 'Marcus Davies', role: 'Deep Clean Lead', phone: '+44 7911 654321', status: 'available' },
    { id: 'OP-103', name: 'Elena Rostova', role: 'Domestic Specialist', phone: '+44 7911 789012', status: 'available' },
    { id: 'OP-104', name: 'David Adeleke', role: 'Surface Technician', phone: '+44 7911 345678', status: 'available' },
  ]);

  // Tab State: Simplified to 3 core tabs (orders, quotes, users)
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'quotes' | 'users'

  // Data State - Purges mock dummy data on load
  const [bookings, setBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleaned = parsed.filter(b => !['LICHT-BK-9182', 'LICHT-BK-8431', 'LICHT-BK-7219'].includes(b.id));
        localStorage.setItem('licht_bookings', JSON.stringify(cleaned));
        return cleaned;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [usersList, setUsersList] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_admin_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleaned = parsed.filter(u =>
          !['usr_1', 'usr_2', 'usr_3', 'usr_4', 'usr_5'].includes(u.id) &&
          !['alex.vance@ventureoffices.co.uk', 's.sterling@pentacapital.co.uk', 'julian.montgomery@chelsea-estates.co.uk', 'clara.oswald@tardis-solutions.co.uk', 'admin@lichtmarketinglimited.org'].includes(u.email)
        );
        if (cleaned.length > 0) return cleaned;
      }
      localStorage.setItem('licht_admin_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Management Modals: Create Booking, Add Admin
  const [createBookingModalOpen, setCreateBookingModalOpen] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    clientName: '',
    clientEmail: '',
    phone: '',
    serviceName: 'Corporate & Office Cleaning',
    frequency: 'One-Off Deep Clean',
    propertySize: 'Standard Premises (1,500-3,500 sq ft)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning Window (08:00 – 12:00)',
    address: '',
    totalPrice: 280,
    paymentMethod: 'Corporate Invoice Net-30',
    notes: '',
  });

  // Admin Access Modal State
  const [grantAdminModalOpen, setGrantAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    company: 'Licht Operations Management',
    phone: '',
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [adminNotice, setAdminNotice] = useState('');

  // OTP Verification Modal State
  const [otpModalBooking, setOtpModalBooking] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [auditModalBooking, setAuditModalBooking] = useState(null);

  // Initial Sync & Purge
  useEffect(() => {
    try {
      // Clear legacy dummy storage keys
      localStorage.removeItem('licht_admin_operatives');
      localStorage.removeItem('licht_admin_fleet');
    } catch (e) {}

    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/health');
        if (res.ok) {
          setBackendStatus({ online: true, port: 8081 });
          apiFetchQuotes().then(setQuotes);
          apiFetchOperatives().then(data => {
            if (Array.isArray(data) && data.length > 0) setOperatives(data);
          });
          const serverBookings = await apiFetchAllBookings();
          if (Array.isArray(serverBookings) && serverBookings.length > 0) {
            setBookings(serverBookings);
            localStorage.setItem('licht_bookings', JSON.stringify(serverBookings));
          }
        } else {
          setBackendStatus({ online: false, port: 8081 });
        }
      } catch (err) {
        setBackendStatus({ online: false, port: 8081 });
      }
    };
    checkHealth();
  }, []);

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem('licht_admin_users', JSON.stringify(usersList));
    } catch (e) {}
  }, [usersList]);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await apiAdminLogin(adminEmail, adminPassword);
      if (res && res.success && res.user) {
        setAdminUser(res.user);
        localStorage.setItem('licht_admin_auth', JSON.stringify(res.user));
        return;
      } else if (res && !res.success) {
        setAuthError(res.message || 'Invalid administrator credentials.');
        return;
      }
    } catch (err) {
      console.warn('Backend admin login error:', err);
    }

    setAuthError('Unauthorized. Valid administrator credentials required.');
  };

  const handleAdminLogout = () => {
    apiLogout();
    setAdminUser(null);
    localStorage.removeItem('licht_admin_auth');
  };

  // Create Manual Booking
  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!newBookingForm.clientName || !newBookingForm.address) {
      alert('Please fill in client name and address.');
      return;
    }

    const newBooking = {
      id: `LCT-${Math.floor(10000 + Math.random() * 90000)}`,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: newBookingForm.paymentMethod,
      paidAmount: Number(newBookingForm.totalPrice),
      totalPrice: Number(newBookingForm.totalPrice),
      serviceName: newBookingForm.serviceName,
      serviceId: newBookingForm.serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      serviceImg: '/service_office.jpg',
      frequency: newBookingForm.frequency,
      propertySize: newBookingForm.propertySize,
      date: newBookingForm.date,
      timeSlot: newBookingForm.timeSlot,
      address: newBookingForm.address,
      notes: newBookingForm.notes || 'Administrative booking.',
      clientName: newBookingForm.clientName,
      clientEmail: newBookingForm.clientEmail || 'client@lichtmarketinglimited.org',
      createdAt: new Date().toLocaleDateString('en-GB'),
      status: 'Confirmed & Scheduled (Paid)',
    };

    try {
      await apiCreateBooking(newBooking);
    } catch (err) {}

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));

    if (onBookingUpdate) onBookingUpdate();
    setCreateBookingModalOpen(false);
    setNewBookingForm({
      clientName: '',
      clientEmail: '',
      phone: '',
      serviceName: 'Corporate & Office Cleaning',
      frequency: 'One-Off Deep Clean',
      propertySize: 'Standard Premises (1,500-3,500 sq ft)',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Morning Window (08:00 – 12:00)',
      address: '',
      totalPrice: 280,
      paymentMethod: 'Corporate Invoice Net-30',
      notes: '',
    });
  };

  // Delete / Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) return;

    try {
      await apiCancelBooking(bookingId);
    } catch (e) {}

    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();
  };

  const handleDeleteBookingPermanently = (bookingId) => {
    if (!window.confirm(`Permanently remove booking ${bookingId} from records?`)) return;
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();
  };

  // Direct Status Update
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    if (newStatus === 'Completed & Verified' || newStatus === 'Completed') {
      const target = bookings.find(b => b.id === bookingId);
      if (target) {
        setOtpModalBooking(target);
        setEnteredOtp('');
        setOtpError('');
        return;
      }
    }
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();
  };

  // Step 4: Admin assigns an available cleaner
  const handleAssignCleaner = async (bookingId, cleanerName) => {
    if (!cleanerName) return;
    try {
      await apiAssignCleaner(bookingId, cleanerName);
    } catch (e) {}

    const selectedOp = operatives.find(o => o.name === cleanerName);
    const updated = bookings.map(b => b.id === bookingId ? {
      ...b,
      assignedCleaner: cleanerName,
      assignedCleanerPhone: selectedOp ? selectedOp.phone : '+44 20 8000 8899',
      status: 'Cleaner Assigned'
    } : b);

    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();
    setAdminNotice(`✓ Assigned ${cleanerName} to booking ${bookingId}. Customer notified via email!`);
    setTimeout(() => setAdminNotice(''), 6000);
  };

  // Step 6: Customer receives payment request
  const handleSendPaymentRequest = async (booking) => {
    try {
      await apiSendPaymentRequest(booking.id);
      setAdminNotice(`✓ Payment request email sent to ${booking.clientEmail} with secure PayPal link for booking ${booking.id} (£${booking.totalPrice})`);
      setTimeout(() => setAdminNotice(''), 6000);
    } catch (e) {
      setAdminNotice(`Notice: Payment request triggered for ${booking.id}`);
      setTimeout(() => setAdminNotice(''), 6000);
    }
  };

  // Handle Customer OTP Verification & Job Completion
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpModalBooking) return;
    setOtpError('');

    const expected = otpModalBooking.completionOtp;
    const isMatch = expected && expected.trim() === enteredOtp.trim();

    if (!isMatch) {
      setOtpError('Invalid OTP! Please enter the 4-digit verification code provided by the customer.');
      return;
    }

    try {
      await apiVerifyBookingOtp(otpModalBooking.id, enteredOtp);
    } catch (err) {}

    const updated = bookings.map(b =>
      b.id === otpModalBooking.id
        ? { ...b, status: 'Completed & Verified (OTP Authenticated)', otpVerified: true, completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : b
    );
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();

    setAdminNotice(`✓ Booking ${otpModalBooking.id} authenticated with customer OTP! Job marked completed & feedback review email dispatched to client.`);
    setTimeout(() => setAdminNotice(''), 6000);
    setOtpModalBooking(null);
    setEnteredOtp('');
  };

  // Convert Quote to Booking
  const handleConvertQuoteToBooking = (quote) => {
    setNewBookingForm({
      clientName: quote.name,
      clientEmail: quote.email,
      phone: quote.phone || '',
      serviceName: quote.serviceType || 'Corporate & Office Cleaning',
      frequency: quote.frequency || 'One-Off Deep Clean',
      propertySize: quote.propertySize || 'Standard Premises (1,500-3,500 sq ft)',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: 'Morning Window (08:00 – 12:00)',
      address: quote.postcode ? `London premises (${quote.postcode})` : 'London, UK',
      totalPrice: 320,
      paymentMethod: 'Corporate Invoice Net-30',
      notes: `Converted from quote enquiry #${quote.id}. Message: ${quote.message || 'None.'}`,
    });
    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted to Booking' } : q));
    setCreateBookingModalOpen(true);
  };

  const handleMarkQuoteContacted = (quoteId) => {
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Contacted' } : q));
  };

  const handleDeleteQuote = (quoteId) => {
    if (!window.confirm('Delete this quote enquiry?')) return;
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  };

  // Promote User to Admin
  const handlePromoteToAdmin = (userId) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return;
    if (!window.confirm(`Grant full Administrator privileges to ${target.name} (${target.email})?`)) return;

    const updated = usersList.map(u => u.id === userId ? { ...u, role: 'ROLE_ADMIN' } : u);
    setUsersList(updated);
    localStorage.setItem('licht_admin_users', JSON.stringify(updated));

    try {
      const stored = JSON.parse(localStorage.getItem('licht_admin_emails') || '[]');
      const norm = target.email.toLowerCase().trim();
      if (!stored.includes(norm)) {
        stored.push(norm);
        localStorage.setItem('licht_admin_emails', JSON.stringify(stored));
      }
    } catch (e) {}

    setAdminNotice(`Success: ${target.name} (${target.email}) is now an Administrator!`);
    setTimeout(() => setAdminNotice(''), 5000);
  };

  // Demote Admin to Client
  const handleDemoteToClient = (userId) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return;
    if (target.email?.toLowerCase().trim() === 'sharonshelke1@gmail.com') {
      alert('Primary Owner Sharon Shelke cannot be demoted.');
      return;
    }
    if (!window.confirm(`Revoke administrator privileges for ${target.name}?`)) return;

    const updated = usersList.map(u => u.id === userId ? { ...u, role: 'ROLE_CLIENT' } : u);
    setUsersList(updated);
    localStorage.setItem('licht_admin_users', JSON.stringify(updated));

    try {
      const stored = JSON.parse(localStorage.getItem('licht_admin_emails') || '[]');
      const filtered = stored.filter(e => e.toLowerCase().trim() !== target.email.toLowerCase().trim());
      localStorage.setItem('licht_admin_emails', JSON.stringify(filtered));
    } catch (e) {}

    setAdminNotice(`Administrator privileges revoked for ${target.name}.`);
    setTimeout(() => setAdminNotice(''), 5000);
  };

  // Add / Make Admin via Email
  const handleGrantAdminSubmit = (e) => {
    e.preventDefault();
    const emailNorm = newAdminForm.email.trim().toLowerCase();
    if (!emailNorm) {
      alert('Please enter an email address.');
      return;
    }

    const existingIndex = usersList.findIndex(u => (u.email || '').toLowerCase().trim() === emailNorm);
    let updated;

    if (existingIndex >= 0) {
      updated = [...usersList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        role: 'ROLE_ADMIN',
        name: newAdminForm.name || updated[existingIndex].name,
        company: newAdminForm.company || updated[existingIndex].company || 'Licht Operations Management',
      };
    } else {
      const newAdminUser = {
        id: 'usr_' + Date.now(),
        name: newAdminForm.name || emailNorm.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: emailNorm,
        phone: newAdminForm.phone || '+44 20 8000 8899',
        company: newAdminForm.company || 'Licht Operations Management',
        role: 'ROLE_ADMIN',
        joined: new Date().toLocaleDateString('en-GB'),
      };
      updated = [newAdminUser, ...usersList];
    }

    setUsersList(updated);
    localStorage.setItem('licht_admin_users', JSON.stringify(updated));

    try {
      const stored = JSON.parse(localStorage.getItem('licht_admin_emails') || '[]');
      if (!stored.includes(emailNorm)) {
        stored.push(emailNorm);
        localStorage.setItem('licht_admin_emails', JSON.stringify(stored));
      }
    } catch (err) {}

    setGrantAdminModalOpen(false);
    setNewAdminForm({ name: '', email: '', company: 'Licht Operations Management', phone: '' });
    setAdminNotice(`Granted Administrator role to ${emailNorm}!`);
    setTimeout(() => setAdminNotice(''), 5000);
  };

  const handleDeleteUser = (userId) => {
    const target = usersList.find(u => u.id === userId);
    if (target?.email?.toLowerCase().trim() === 'sharonshelke1@gmail.com') {
      alert('Cannot delete primary owner account.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    setUsersList(prev => prev.filter(u => u.id !== userId));
    if (target) {
      try {
        const stored = JSON.parse(localStorage.getItem('licht_admin_emails') || '[]');
        const filtered = stored.filter(e => e.toLowerCase().trim() !== target.email.toLowerCase().trim());
        localStorage.setItem('licht_admin_emails', JSON.stringify(filtered));
      } catch (e) {}
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isComp = (b.status || '').toLowerCase().includes('completed') || Boolean(b.otpVerified);
    const isCanc = (b.status || '').toLowerCase().includes('cancel');

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? !isComp && !isCanc
        : statusFilter === 'completed'
        ? isComp
        : statusFilter === 'cancelled'
        ? isCanc
        : (b.status || '').toLowerCase().includes(statusFilter);

    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(userSearchQuery.toLowerCase());

    const matchesRole =
      userRoleFilter === 'all'
        ? true
        : userRoleFilter === 'admin'
        ? u.role === 'ROLE_ADMIN'
        : u.role !== 'ROLE_ADMIN';

    return matchesSearch && matchesRole;
  });

  /* ── ADMIN LOGIN SCREEN ── */
  if (!adminUser) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-brand-icon">
              <span>✦</span>
            </div>
            <span className="admin-login-badge"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Restricted Operations Portal</span>
            <h1 className="admin-login-title">Licht Admin Access</h1>
            <p className="admin-login-sub">
              Sign in to manage live customer bookings, review quote inquiries, and configure user permissions.
            </p>
          </div>

          {authError && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="admin-form-group">
              <label className="admin-form-label">Admin Email</label>
              <input
                type="email"
                required
                className="admin-form-input"
                placeholder="sharonshelke1@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Password</label>
              <input
                type="password"
                required
                className="admin-form-input"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', marginTop: '4px' }}>
                Restricted Operations Portal — Authorized Administrator Credentials Required
              </div>
            </div>

            <button type="submit" className="admin-submit-btn">
              Authorize &amp; Enter Portal
            </button>
          </form>

          <button
            type="button"
            onClick={onExit}
            className="admin-back-link"
            style={{ background: 'none', border: 'none', width: '100%' }}
          >
            Return to Main Website
          </button>
        </div>
      </div>
    );
  }

  /* ── MAIN ADMIN PORTAL ── */
  return (
    <div className="admin-portal-app">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-nav-logo-box" onClick={onExit} style={{ cursor: 'pointer' }} title="Back to Licht Home">
            <img src="/licht-logo.png" alt="LICHT MARKETING" className="admin-header-logo" />
          </div>
          <span className="admin-portal-tag">Operations Admin</span>
          <button onClick={onExit} className="admin-exit-btn" title="Back to main website">
            Main Website
          </button>
        </div>

        <div className="admin-header-actions">
          <div
            className="admin-api-indicator"
            style={{
              background: backendStatus.online ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: backendStatus.online ? '#16a34a' : '#ca8a04',
              border: `1px solid ${backendStatus.online ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus.online ? '#16a34a' : '#eab308',
                boxShadow: backendStatus.online ? '0 0 8px rgba(34, 197, 94, 0.8)' : 'none',
              }}
            />
            <span>{backendStatus.online ? 'API Online' : 'Local Mode'}</span>
          </div>

          <div className="admin-badge">
            <span className="admin-user-avatar">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : 'S'}
            </span>
            <div className="admin-badge-info">
              <span className="admin-user-name">{adminUser?.name || 'Sharon Shelke'}</span>
              <span className="admin-user-role">
                {adminUser?.email?.toLowerCase().trim() === 'sharonshelke1@gmail.com' ? 'Primary Owner' : 'Administrator'}
              </span>
            </div>
          </div>

          <button onClick={handleAdminLogout} className="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Simplified 3 Navigation Tabs */}
      <nav className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Bookings &amp; Orders</span>
          <span className="admin-tab-count">{bookings.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('quotes');
            apiFetchQuotes().then(setQuotes);
          }}
        >
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Inbound Quotes</span>
          <span className="admin-tab-count">{quotes.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Admins &amp; User Access</span>
          <span className="admin-tab-count">{usersList.length}</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="admin-container">
        {/* KPI Strip */}
        <section className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Total Orders</div>
              <div className="admin-kpi-val">{bookings.length}</div>
              <div className="admin-kpi-trend">All customer bookings</div>
            </div>
            <div className="admin-kpi-icon-bubble">📋</div>
          </div>

          <div className="admin-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div>
              <div className="admin-kpi-title">Completed Orders</div>
              <div className="admin-kpi-val" style={{ color: '#059669' }}>
                {bookings.filter(b => (b.status || '').toLowerCase().includes('completed') || b.otpVerified).length}
              </div>
              <div className="admin-kpi-trend" style={{ color: '#059669', fontWeight: 600 }}>✓ Verified &amp; Signed Off</div>
            </div>
            <div className="admin-kpi-icon-bubble" style={{ background: '#dcfce7', color: '#059669' }}>✨</div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Inbound Quotes</div>
              <div className="admin-kpi-val">{quotes.length}</div>
              <div className="admin-kpi-trend">Inquiries from contact form</div>
            </div>
            <div className="admin-kpi-icon-bubble"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Registered Users</div>
              <div className="admin-kpi-val">{usersList.length}</div>
              <div className="admin-kpi-trend">Client &amp; staff accounts</div>
            </div>
            <div className="admin-kpi-icon-bubble"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">System Admins</div>
              <div className="admin-kpi-val">{usersList.filter(u => u.role === 'ROLE_ADMIN').length}</div>
              <div className="admin-kpi-trend" style={{ color: 'var(--teal)' }}>Sharon Shelke (Owner)</div>
            </div>
            <div className="admin-kpi-icon-bubble"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          </div>
        </section>

        {/* ── TAB 1: BOOKINGS & ORDERS ── */}
        {activeTab === 'orders' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Client Bookings &amp; Orders</h2>
                <p className="admin-section-subtitle">
                  Review booked cleanings from the website, manage fulfillment status, and add manual orders.
                </p>
              </div>

              <div className="admin-controls-row">
                <button
                  type="button"
                  onClick={() => setCreateBookingModalOpen(true)}
                  className="admin-submit-btn"
                  style={{ width: 'auto', padding: '10px 18px', margin: 0, background: '#0f766e', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>+</span> Create New Booking
                </button>

                <input
                  type="text"
                  placeholder="Search order ref, client, or address..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="admin-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

                        {/* Quick Status Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'all' ? '1.5px solid var(--navy)' : '1px solid #cbd5e1',
                  background: statusFilter === 'all' ? 'var(--navy)' : '#ffffff',
                  color: statusFilter === 'all' ? '#ffffff' : '#475569',
                }}
              >
                All Orders ({bookings.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'active' ? '1.5px solid var(--teal)' : '1px solid #cbd5e1',
                  background: statusFilter === 'active' ? 'var(--teal)' : '#ffffff',
                  color: statusFilter === 'active' ? '#ffffff' : '#0f766e',
                }}
              >
                ⏳ Scheduled &amp; In Progress ({bookings.filter(b => !(b.status || '').toLowerCase().includes('completed') && !(b.status || '').toLowerCase().includes('cancel')).length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'completed' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: statusFilter === 'completed' ? '#059669' : '#ffffff',
                  color: statusFilter === 'completed' ? '#ffffff' : '#065f46',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✓</span> Completed &amp; Verified ({bookings.filter(b => (b.status || '').toLowerCase().includes('completed') || b.otpVerified).length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('cancelled')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'cancelled' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  background: statusFilter === 'cancelled' ? '#dc2626' : '#ffffff',
                  color: statusFilter === 'cancelled' ? '#ffffff' : '#991b1b',
                }}
              >
                ✕ Cancelled ({bookings.filter(b => (b.status || '').toLowerCase().includes('cancel')).length})
              </button>
            </div>

            <div className="admin-table-card">
              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--slate-mid)' }}>
                  <span style={{ fontSize: '2.8rem' }}>📋</span>
                  <h3 style={{ color: 'var(--navy)', marginTop: '14px', marginBottom: '6px' }}>No Customer Bookings Yet</h3>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    When visitors complete a booking on the website or you create one manually, it will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-orders-table">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Client &amp; Contact</th>
                        <th>Service Details</th>
                        <th>Date &amp; Window</th>
                        <th>Assigned Cleaner</th>
                        <th>Payment Status</th>
                        <th>Job Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const isCompleted = (b.status || '').toLowerCase().includes('completed');
                        const isCancelled = (b.status || '').toLowerCase().includes('cancel');
                        const isInProgress = (b.status || '').toLowerCase().includes('progress');
                        const isPaid = b.paymentStatus === 'PAID' || (b.paidAmount && b.paidAmount > 0) || (b.status || '').toLowerCase().includes('paid');

                        return (
                          <tr key={b.id} style={{ opacity: isCancelled ? 0.6 : 1 }}>
                            <td>
                              <div className="booking-ref-cell">{b.id}</div>
                              {b.paymentMethod?.includes('PayPal') ? (
                                <div style={{ marginTop: '3px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#003087', fontWeight: 800, background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                    ● PayPal (GBP)
                                  </span>
                                </div>
                              ) : b.paymentMethod?.includes('Pay After Service') ? (
                                <div style={{ marginTop: '3px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#b45309', fontWeight: 800, background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                    ⏳ Pay After Service
                                  </span>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>
                                  {b.paymentMethod || 'Card'}
                                </div>
                              )}
                              {b.transactionId && (
                                <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--slate-mid)', marginTop: '2px' }}>
                                  Txn: {b.transactionId}
                                </div>
                              )}
                              {b.completionOtp && (
                                <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700, marginTop: '4px' }}>
                                  OTP: <code>{b.completionOtp}</code>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="booking-client-name">{b.clientName || 'Client'}</div>
                              <div className="booking-client-contact">
                                <a href={`mailto:${b.clientEmail}`} style={{ color: 'var(--teal)', textDecoration: 'none' }}>{b.clientEmail}</a>
                              </div>
                              {b.clientPhone && (
                                <div className="booking-client-contact" style={{ fontWeight: 600, color: '#0f172a' }}>
                                  📞 {b.clientPhone}
                                </div>
                              )}
                              <div className="booking-client-contact" style={{ color: 'var(--slate-mid)', fontSize: '0.75rem' }}>{b.address}</div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--navy)' }}>{b.serviceName}</strong>
                              <div style={{ fontSize: '0.74rem', color: 'var(--slate-mid)' }}>
                                {b.frequency} {b.propertySize ? `· ${b.propertySize}` : ''}
                              </div>
                              {b.notes && (
                                <div style={{ fontSize: '0.72rem', color: '#334155', fontStyle: 'italic', marginTop: '4px', maxWidth: '220px' }}>
                                  "{b.notes}"
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{b.date}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>{b.timeSlot}</div>
                            </td>
                            <td>
                              {b.assignedCleaner ? (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.8rem' }}>
                                    👤 {b.assignedCleaner}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-mid)' }}>
                                    {b.assignedCleanerPhone || '+44 7911 123456'}
                                  </div>
                                  <select
                                    value={b.assignedCleaner}
                                    onChange={(e) => handleAssignCleaner(b.id, e.target.value)}
                                    style={{
                                      fontSize: '0.68rem',
                                      marginTop: '4px',
                                      padding: '2px 6px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      background: '#f8fafc',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value={b.assignedCleaner}>Change Cleaner...</option>
                                    {operatives.map((op) => (
                                      <option key={op.id} value={op.name}>
                                        {op.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <select
                                  value=""
                                  onChange={(e) => handleAssignCleaner(b.id, e.target.value)}
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #0d9488',
                                    background: '#f0fdfa',
                                    color: '#0f766e',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="">+ Assign Cleaner</option>
                                  {operatives.map((op) => (
                                    <option key={op.id} value={op.name}>
                                      {op.name} ({op.role.split(' ')[0]})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td>
                              {isPaid ? (
                                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem' }}>
                                  ✓ Paid (£{b.paidAmount || b.totalPrice})
                                </span>
                              ) : (
                                <div>
                                  <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem' }}>
                                    ⏳ £{b.totalPrice} Due
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleSendPaymentRequest(b)}
                                    style={{
                                      display: 'block',
                                      marginTop: '5px',
                                      background: '#0070ba',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                    title="Email secure payment link to customer"
                                  >
                                    ✉ Send Payment Link
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <select
                                value={b.status}
                                onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '5px 8px',
                                  borderRadius: '10px',
                                  border: '1px solid #cbd5e1',
                                  background: isCompleted ? '#f0fdf4' : isInProgress ? '#eff6ff' : isCancelled ? '#fef2f2' : '#f8fafc',
                                  color: isCompleted ? '#166534' : isInProgress ? '#1e40af' : isCancelled ? '#991b1b' : '#1e293b',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="Booking Requested (Pending Assignment)">⏳ Booking Requested</option>
                                <option value="Cleaner Assigned">👤 Cleaner Assigned</option>
                                <option value="In Progress">⚡ In Progress</option>
                                <option value="Completed & Verified">✓ Completed (Triggers Payment Request)</option>
                                <option value="Completed & Paid (PayPal)">✓ Completed &amp; Paid (PayPal)</option>
                                <option value="Cancelled">✕ Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {!isCompleted && !isCancelled && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOtpModalBooking(b);
                                      setEnteredOtp('');
                                      setOtpError('');
                                    }}
                                    className="booking-action-btn"
                                    style={{
                                      background: '#0f766e',
                                      padding: '6px 12px',
                                      fontSize: '0.74rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                    title="Authenticate client OTP to confirm completion of service"
                                  >
                                    <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: '-1px' }}><path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5M10 13l-4 4-2-2-4 4 4 4 2-2 4-4"/></svg></span> Verify OTP
                                  </button>
                                )}
                                {isCompleted && (
                                  <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span>✓</span> Done
                                  </span>
                                )}
                                {!isCancelled && !isCompleted && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBooking(b.id)}
                                    style={{
                                      background: '#fef2f2',
                                      color: '#ef4444',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      fontSize: '0.72rem',
                                      cursor: 'pointer',
                                    }}
                                    title="Cancel booking"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBookingPermanently(b.id)}
                                  style={{
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                  }}
                                  title="Delete record"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 2: INBOUND QUOTES ── */}
        {activeTab === 'quotes' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Inbound Customer Enquiries &amp; Quotes</h2>
                <p className="admin-section-subtitle">
                  Quotes submitted by commercial or domestic clients from the Contact page.
                </p>
              </div>
            </div>

            <div className="admin-table-card">
              {quotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--slate-mid)' }}>
                  <span style={{ fontSize: '2.8rem' }}>📫</span>
                  <h3 style={{ color: 'var(--navy)', marginTop: '14px', marginBottom: '6px' }}>No Inbound Quotes Yet</h3>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    Inquiries submitted through the website Contact form will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client / Company</th>
                        <th>Service Requested</th>
                        <th>Frequency &amp; Scale</th>
                        <th>Contact Info</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((q) => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 700, color: 'var(--navy)' }}>#{q.id}</td>
                          <td>
                            <strong>{q.name}</strong>
                            {q.company && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>{q.company}</div>}
                          </td>
                          <td>{q.serviceType || 'General Cleaning'}</td>
                          <td>
                            <div>{q.frequency || 'One-Off'}</div>
                            {q.propertySize && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>{q.propertySize}</div>}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem' }}>✉ {q.email}</div>
                            {q.phone && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>☎ {q.phone}</div>}
                            {q.postcode && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>📍 {q.postcode}</div>}
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: '#475569' }}>
                            {q.message || 'No additional specifications.'}
                          </td>
                          <td>
                            <span className="order-status-badge badge-blue">
                              {q.status || 'New'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleConvertQuoteToBooking(q)}
                                style={{
                                  background: '#0f766e',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 9px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Convert this quote to a booked job"
                              >
                                Convert to Booking
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkQuoteContacted(q.id)}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Contacted
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuote(q.id)}
                                style={{
                                  background: '#fef2f2',
                                  color: '#ef4444',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  padding: '5px 7px',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                }}
                                title="Delete enquiry"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 3: ADMIN ROLES & USER ACCESS CONTROL ── */}
        {activeTab === 'users' && (
          <section>
            {adminNotice && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                <span>{adminNotice}</span>
              </div>
            )}

            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Administrator Roles &amp; Access Control</h2>
                <p className="admin-section-subtitle">
                  Manage registered user accounts, promote clients to Administrators with 1-click, and grant full portal access.
                </p>
              </div>

              <div className="admin-controls-row">
                <button
                  type="button"
                  onClick={() => setGrantAdminModalOpen(true)}
                  className="admin-submit-btn"
                  style={{ width: 'auto', padding: '10px 18px', margin: 0, background: 'var(--navy)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>★</span> Make / Add New Admin
                </button>

                <input
                  type="text"
                  placeholder="Search users by name, email, or company..."
                  className="admin-search-input"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />

                <select
                  className="admin-filter-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles ({usersList.length})</option>
                  <option value="admin">Administrators Only ({usersList.filter(u => u.role === 'ROLE_ADMIN').length})</option>
                  <option value="client">Clients Only ({usersList.filter(u => u.role !== 'ROLE_ADMIN').length})</option>
                </select>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name / Company</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Current Role</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                      <th>Manage Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-mid)' }}>
                          No users matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <span className="booking-ref-cell">{u.id}</span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--navy)', fontSize: '0.92rem' }}>{u.name}</strong>
                            {u.company && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)', marginTop: '2px' }}>{u.company}</div>}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.86rem' }}>{u.email}</div>
                          </td>
                          <td style={{ fontSize: '0.84rem', color: 'var(--slate-dark)' }}>{u.phone || 'N/A'}</td>
                          <td>
                            {u.role === 'ROLE_ADMIN' ? (
                              <span
                                className="booking-status-pill"
                                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Administrator
                              </span>
                            ) : (
                              <span className="booking-status-pill confirmed">
                                Client Partner
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.84rem', color: 'var(--slate-mid)' }}>{u.joined || 'Active'}</td>
                          <td>
                            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>✓</span> Active &amp; Verified
                            </span>
                          </td>
                          <td>
                            {u.email?.toLowerCase().trim() === 'sharonshelke1@gmail.com' ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-1px', color: '#eab308' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> Primary Owner
                              </span>
                            ) : u.role === 'ROLE_ADMIN' ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDemoteToClient(u.id)}
                                  title="Revoke Admin privileges and reset to regular Client"
                                  style={{
                                    background: '#fffbeb',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Demote to Client
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  title="Remove User"
                                  style={{
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handlePromoteToAdmin(u.id)}
                                  title="Grant this user full Administrator access to the Operations Portal"
                                  style={{
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <span>★</span> Make Admin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  title="Remove User"
                                  style={{
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── MODAL: CREATE MANUAL BOOKING ── */}
      {createBookingModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setCreateBookingModalOpen(false)}>
          <div className="admin-modal-box large-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Create New Customer Booking</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCreateBookingModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. John Smith"
                    value={newBookingForm.clientName}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, clientName: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Email</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    placeholder="client@example.com"
                    value={newBookingForm.clientEmail}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, clientEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Service Type</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.serviceName}
                    onChange={(e) => {
                      const svc = e.target.value;
                      const prices = {
                        'Corporate & Office Cleaning': 180,
                        'Home & Residential Cleaning': 95,
                        'Commercial & Retail Cleaning': 150,
                        'Care & Supported Living': 220,
                        'Deep & Specialist Cleaning': 240,
                        'Ongoing Contract Cleaning': 360,
                        'End-of-Tenancy Cleaning': 195,
                        'Post-Construction & Sparkle Clean': 280,
                      };
                      setNewBookingForm({
                        ...newBookingForm,
                        serviceName: svc,
                        totalPrice: prices[svc] || newBookingForm.totalPrice
                      });
                    }}
                  >
                    <option value="Corporate & Office Cleaning">Corporate &amp; Office Cleaning (From £180)</option>
                    <option value="Home & Residential Cleaning">Home &amp; Residential Cleaning (From £95)</option>
                    <option value="Commercial & Retail Cleaning">Commercial &amp; Retail Cleaning (From £150)</option>
                    <option value="Care & Supported Living">Care &amp; Supported Living (From £220)</option>
                    <option value="Deep & Specialist Cleaning">Deep &amp; Specialist Cleaning (From £240)</option>
                    <option value="Ongoing Contract Cleaning">Ongoing Contract Cleaning (From £360)</option>
                    <option value="End-of-Tenancy Cleaning">End-of-Tenancy Cleaning (From £195)</option>
                    <option value="Post-Construction & Sparkle Clean">Post-Construction &amp; Sparkle Clean (From £280)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Frequency</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.frequency}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, frequency: e.target.value })}
                  >
                    <option value="One-Off Deep Clean">One-Off Deep Clean</option>
                    <option value="Weekly Contract">Weekly Contract</option>
                    <option value="Fortnightly Service">Fortnightly Service</option>
                    <option value="Monthly Contract">Monthly Contract</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    className="admin-form-input"
                    value={newBookingForm.date}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, date: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Time Slot</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.timeSlot}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, timeSlot: e.target.value })}
                  >
                    <option value="Morning Window (08:00 – 12:00)">Morning Window (08:00 – 12:00)</option>
                    <option value="Afternoon Window (12:00 – 16:00)">Afternoon Window (12:00 – 16:00)</option>
                    <option value="Evening Shift (18:00 – 22:00)">Evening Shift (18:00 – 22:00)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Service Address *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. 100 Bishopsgate, London, EC2N 4AG"
                  value={newBookingForm.address}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (£ inc. VAT)</label>
                  <input
                    type="number"
                    required
                    className="admin-form-input"
                    value={newBookingForm.totalPrice}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, totalPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Payment Method</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.paymentMethod}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, paymentMethod: e.target.value })}
                  >
                    <option value="Corporate Invoice Net-30">Corporate Invoice Net-30</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Bank Transfer (BACS)">Bank Transfer (BACS)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCreateBookingModalOpen(false)}
                  className="admin-nav-btn"
                  style={{ background: '#f1f5f9', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-submit-btn"
                  style={{ flex: 2, margin: 0, background: '#0f766e' }}
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GRANT / ADD NEW ADMINISTRATOR ── */}
      {grantAdminModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setGrantAdminModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">★ Grant Administrator Privileges</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setGrantAdminModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantAdminSubmit}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '18px', fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.5 }}>
                Enter the email address of any user or client. They will be immediately elevated to <strong>ROLE_ADMIN</strong> with full access to this Operations Admin Portal.
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">User Email Address *</label>
                <input
                  type="email"
                  required
                  className="admin-form-input"
                  placeholder="e.g. colleague@lichtmarketinglimited.org"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Operations Manager"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Department / Company</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Licht Operations Management"
                  value={newAdminForm.company}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, company: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="admin-form-input"
                  placeholder="+44 20 8000 8899"
                  value={newAdminForm.phone}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={() => setGrantAdminModalOpen(false)}
                  className="admin-nav-btn"
                  style={{ background: '#f1f5f9', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-submit-btn"
                  style={{ flex: 2, margin: 0, background: 'var(--navy)' }}
                >
                  Grant Full Admin Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. JOB COMPLETION OTP VERIFICATION MODAL ── */}
      {otpModalBooking && (
        <div className="admin-modal-overlay" onClick={() => setOtpModalBooking(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: '-1px' }}><path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5M10 13l-4 4-2-2-4 4 4 4 2-2 4-4"/></svg>Verify Customer Job OTP</h3>
              <button
                type="button"
                onClick={() => setOtpModalBooking(null)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Booking Reference:</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'monospace' }}>
                {otpModalBooking.id}
              </div>
              <div style={{ fontSize: '0.84rem', marginTop: '6px' }}>
                <strong>Client:</strong> {otpModalBooking.clientName} ({otpModalBooking.clientEmail})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                📍 {otpModalBooking.address}
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--slate-mid)', lineHeight: 1.5, marginBottom: '20px' }}>
              To verify that the operative arrived on-site and the cleaning service was delivered, enter the <strong>4-digit verification code</strong> provided by the customer at the property.
            </p>

            {otpError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Customer 4-Digit Completion PIN / OTP *</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  autoFocus
                  placeholder="e.g. 5829"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="admin-form-input"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.8rem',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontWeight: 900,
                    color: '#0f766e',
                    padding: '14px',
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', marginTop: '6px', textAlign: 'center' }}>
                  Please enter the 4-digit verification code provided by the client upon on-site inspection.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setOtpModalBooking(null)}
                  className="admin-nav-btn"
                  style={{ background: '#f1f5f9', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-submit-btn"
                  style={{ flex: 2, margin: 0, background: '#0f766e' }}
                >
                  Verify OTP &amp; Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* ── MODAL: VERIFIED COMPLETED ORDER AUDIT & VAT RECEIPT ── */}
      {auditModalBooking && (
        <div
          className="admin-modal-overlay"
          onClick={() => setAuditModalBooking(null)}
          style={{ zIndex: 2500 }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', padding: 0 }}
          >
            <div style={{ background: '#10264A', padding: '24px', color: '#ffffff', borderBottom: '3px solid #1599AC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Operations &amp; Dispatch Audit
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800 }}>
                    Verified Service Completion Record
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditModalBooking(null)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#065f46', fontWeight: 800 }}>
                    Fulfillment Status
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>
                    ✓ Completed &amp; Verified
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#065f46', fontWeight: 800 }}>
                    Customer Security PIN
                  </div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#065f46', fontSize: '1.1rem' }}>
                    {auditModalBooking.completionOtp || '5829'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Order ID:</strong> <code>{auditModalBooking.id}</code>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Client Name:</strong> {auditModalBooking.clientName}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Client Email:</strong> {auditModalBooking.clientEmail}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Service:</strong> {auditModalBooking.serviceName}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Scope &amp; Frequency:</strong> {auditModalBooking.frequency} {auditModalBooking.propertySize ? `· ${auditModalBooking.propertySize}` : ''}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Service Location:</strong> {auditModalBooking.address}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Scheduled Date:</strong> {auditModalBooking.date} ({auditModalBooking.timeSlot})
                </div>
                {auditModalBooking.completedAt && (
                  <div style={{ marginBottom: '8px', color: '#15803d', fontWeight: 600 }}>
                    <strong>Completed &amp; Signed Off:</strong> {auditModalBooking.completedAt}
                  </div>
                )}
                <div>
                  <strong>Total Invoice Paid:</strong> £{auditModalBooking.totalPrice || auditModalBooking.paidAmount} (inc. VAT)
                </div>
              </div>

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
                  <span>🖨️</span> Print Audit Summary
                </button>
                <button
                  type="button"
                  onClick={() => setAuditModalBooking(null)}
                  style={{
                    padding: '12px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
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
    </div>
  );
}