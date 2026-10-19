import React, { useState, useEffect } from 'react';
import './Admin.css';

/* Initial Seeded Bookings if none exist */
const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'LICHT-BK-9182',
    transactionId: 'TXN-741982',
    paymentMethod: 'Visa ending in 4242',
    paidAmount: 280,
    serviceName: 'Corporate & Office Cleaning',
    serviceId: 'corporate_office',
    serviceImg: '/service_office.jpg',
    frequency: 'Weekly Contract',
    propertySize: 'Standard Premises (1,500-3,500 sq ft)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning Window (08:00 – 12:00)',
    address: '14 Berkeley Square, Mayfair, London, W1J 6BQ',
    notes: 'Key safe on rear wall code 4892. Security guard on desk at reception.',
    totalPrice: 280,
    clientName: 'Alex Vance',
    clientEmail: 'alex.vance@ventureoffices.co.uk',
    createdAt: new Date().toLocaleDateString('en-GB'),
    status: 'Confirmed & Scheduled (Paid)',
    assignedCleaner: null,
    assignedVan: null,
  },
  {
    id: 'LICHT-BK-8431',
    transactionId: 'TXN-391820',
    paymentMethod: 'Corporate Net-30 (PO: LICHT-CORP-94)',
    paidAmount: 490,
    serviceName: 'Commercial Floor & Carpet Restoration',
    serviceId: 'floor_carpet',
    serviceImg: '/service_floor.jpg',
    frequency: 'One-Off Deep Clean',
    propertySize: 'Large Complex (3,500+ sq ft)',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: 'Evening Shift (18:00 – 22:00)',
    address: '100 Bishopsgate, Level 18, London, EC2N 4AG',
    notes: 'Loading bay access via St Helen’s Place after 18:30. DBS check required at front desk.',
    totalPrice: 490,
    clientName: 'Sarah Sterling (Penta Capital)',
    clientEmail: 's.sterling@pentacapital.co.uk',
    createdAt: new Date().toLocaleDateString('en-GB'),
    status: 'Confirmed & Scheduled (Paid)',
    assignedCleaner: null,
    assignedVan: null,
  },
  {
    id: 'LICHT-BK-7219',
    transactionId: 'TXN-119284',
    paymentMethod: 'Apple Pay / Google Pay',
    paidAmount: 216,
    serviceName: 'Home & Residential Cleaning',
    serviceId: 'home_residential',
    serviceImg: '/service_home.jpg',
    frequency: 'Fortnightly Service',
    propertySize: 'Standard Premises (1,500-3,500 sq ft)',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    timeSlot: 'Afternoon Window (12:00 – 16:00)',
    address: '22 Cheyne Walk, Chelsea, London, SW3 5HH',
    notes: 'Alarm code #9123. Please use hypoallergenic detergents for hardwood floors.',
    totalPrice: 216,
    clientName: 'Lord Julian Montgomery',
    clientEmail: 'julian.montgomery@chelsea-estates.co.uk',
    createdAt: new Date().toLocaleDateString('en-GB'),
    status: 'In Progress (Team Dispatched)',
    assignedCleaner: 'Elena Rostova',
    assignedVan: 'Van 1 (Mayfair & West End Unit)',
  },
];

/* Initial Operatives Directory */
const INITIAL_OPERATIVES = [
  {
    id: 'OP-101',
    name: 'Elena Rostova',
    role: 'Lead Deep Clean Specialist',
    phone: '+44 7700 900123',
    dbs: 'DBS-GB-882941 (Verified)',
    rating: 4.98,
    jobsCompleted: 342,
    status: 'on_job', // 'available' | 'on_job' | 'off_duty'
    currentJobId: 'LICHT-BK-7219',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'OP-102',
    name: 'David Chen',
    role: 'Commercial Floor & Carpet Lead',
    phone: '+44 7700 900456',
    dbs: 'DBS-GB-771092 (Verified)',
    rating: 4.95,
    jobsCompleted: 289,
    status: 'available',
    currentJobId: null,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'OP-103',
    name: 'Sarah Jenkins',
    role: 'Bio-Sanitisation & Care Team Lead',
    phone: '+44 7700 900789',
    dbs: 'DBS-GB-663219 (Verified)',
    rating: 5.0,
    jobsCompleted: 418,
    status: 'available',
    currentJobId: null,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'OP-104',
    name: 'Michael Adebayo',
    role: 'High-Level Glass & Specialist Tech',
    phone: '+44 7700 900321',
    dbs: 'DBS-GB-990145 (Verified)',
    rating: 4.92,
    jobsCompleted: 195,
    status: 'available',
    currentJobId: null,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'OP-105',
    name: 'Chloe Dubois',
    role: 'Domestic & Turnover Specialist',
    phone: '+44 7700 900654',
    dbs: 'DBS-GB-554180 (Verified)',
    rating: 4.97,
    jobsCompleted: 260,
    status: 'off_duty',
    currentJobId: null,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
  },
];

/* Initial Fleet Resources */
const INITIAL_FLEET = [
  { id: 'VAN-1', name: 'Van 1 (Mayfair & West End Unit)', reg: 'LK23 WLM', status: 'On Route', equipment: 'Industrial HEPA + Steamer #4' },
  { id: 'VAN-2', name: 'Van 2 (City & Financial Core)', reg: 'LG72 XCT', status: 'Depot Ready', equipment: 'Rotary Floor Scrubber + Extraction #2' },
  { id: 'VAN-3', name: 'Van 3 (South Bank & Kensington)', reg: 'LA24 FDS', status: 'Depot Ready', equipment: 'Pure Water Glass Rig + Sanitisation Pack' },
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

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'cleaners' | 'fleet' | 'overview'

  // Data State
  const [bookings, setBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
      localStorage.setItem('licht_bookings', JSON.stringify(INITIAL_DEMO_BOOKINGS));
      return INITIAL_DEMO_BOOKINGS;
    } catch (e) {
      return INITIAL_DEMO_BOOKINGS;
    }
  });

  const [operatives, setOperatives] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_admin_operatives');
      return stored ? JSON.parse(stored) : INITIAL_OPERATIVES;
    } catch (e) {
      return INITIAL_OPERATIVES;
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dispatch Modal State (To start a booking)
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedBookingForDispatch, setSelectedBookingForDispatch] = useState(null);
  const [assignedCleanerId, setAssignedCleanerId] = useState('');
  const [assignedVanId, setAssignedVanId] = useState('VAN-1');
  const [dispatchEta, setDispatchEta] = useState('25 mins');

  // Job Sheet Modal State
  const [jobSheetBooking, setJobSheetBooking] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('licht_admin_operatives', JSON.stringify(operatives));
    } catch (e) {}
  }, [operatives]);

  // Handle Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    if (adminEmail === 'admin@lichtmarketing.co.uk' && adminPassword === 'admin123') {
      const admin = {
        name: 'Marcus Shaw',
        role: 'Operations Director',
        email: adminEmail,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAdminUser(admin);
      localStorage.setItem('licht_admin_auth', JSON.stringify(admin));
    } else {
      setAuthError('Invalid administrator credentials. Try the instant demo login.');
    }
  };

  const handleQuickDemoAdminLogin = () => {
    const admin = {
      name: 'Marcus Shaw',
      role: 'Operations Director',
      email: 'marcus.shaw@lichtmarketing.co.uk',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAdminUser(admin);
    localStorage.setItem('licht_admin_auth', JSON.stringify(admin));
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('licht_admin_auth');
  };

  // Dispatch / Start Booking Action
  const openDispatchModal = (booking) => {
    setSelectedBookingForDispatch(booking);
    // Auto-select first available cleaner
    const available = operatives.find(o => o.status === 'available');
    setAssignedCleanerId(available ? available.id : operatives[0]?.id || '');
    setDispatchModalOpen(true);
  };

  const confirmDispatchAndStartBooking = () => {
    if (!selectedBookingForDispatch) return;

    const chosenCleaner = operatives.find(o => o.id === assignedCleanerId);
    const chosenVan = INITIAL_FLEET.find(v => v.id === assignedVanId);

    const updatedBookings = bookings.map(b => {
      if (b.id === selectedBookingForDispatch.id) {
        return {
          ...b,
          status: 'In Progress (Team Dispatched)',
          assignedCleaner: chosenCleaner?.name || 'Assigned Specialist',
          assignedCleanerPhone: chosenCleaner?.phone || '+44 7700 900123',
          assignedVan: chosenVan?.name || 'Van 1',
          dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem('licht_bookings', JSON.stringify(updatedBookings));

    // Update cleaner status to 'on_job'
    if (chosenCleaner) {
      setOperatives(prev => prev.map(o => o.id === chosenCleaner.id ? { ...o, status: 'on_job', currentJobId: selectedBookingForDispatch.id } : o));
    }

    if (onBookingUpdate) onBookingUpdate();
    setDispatchModalOpen(false);
    setSelectedBookingForDispatch(null);
  };

  // Mark Booking as Completed
  const handleMarkCompleted = (bookingId) => {
    const target = bookings.find(b => b.id === bookingId);
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Completed & Verified',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem('licht_bookings', JSON.stringify(updatedBookings));

    // Free cleaner back to available
    if (target?.assignedCleaner) {
      setOperatives(prev => prev.map(o => o.name === target.assignedCleaner ? { ...o, status: 'available', currentJobId: null, jobsCompleted: o.jobsCompleted + 1 } : o));
    }

    if (onBookingUpdate) onBookingUpdate();
  };

  // Toggle Operative Status
  const handleToggleOperativeStatus = (operativeId, newStatus) => {
    setOperatives(prev => prev.map(o => o.id === operativeId ? { ...o, status: newStatus } : o));
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'confirmed'
        ? (b.status || '').toLowerCase().includes('confirmed')
        : statusFilter === 'dispatched'
        ? (b.status || '').toLowerCase().includes('dispatched') || (b.status || '').toLowerCase().includes('progress')
        : statusFilter === 'completed'
        ? (b.status || '').toLowerCase().includes('completed')
        : true;

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || b.paidAmount || 0), 0);
  const activeBookingsCount = bookings.filter(b => (b.status || '').toLowerCase().includes('confirmed') || (b.status || '').toLowerCase().includes('progress')).length;
  const availableCleanersCount = operatives.filter(o => o.status === 'available').length;
  const completedJobsCount = bookings.filter(b => (b.status || '').toLowerCase().includes('completed')).length;

  /* ==========================================================================
     RENDER: 1. ADMIN LOGIN VIEW
     ========================================================================== */
  if (!adminUser) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-glow" />
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-login-badge">🔒 Restricted Operations Portal</span>
            <h1 className="admin-login-title">Licht Admin Access</h1>
            <p className="admin-login-sub">
              Sign in to manage client bookings, dispatch DBS-vetted operatives, and supervise daily London cleaning routes.
            </p>
          </div>

          {/* Quick Demo Admin Button */}
          <div className="admin-demo-box">
            <div className="admin-demo-text">
              <strong>⚡ Instant Director Access</strong>
              <div>Test all management and order dispatch features with 1-click.</div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="admin-demo-btn"
            >
              Sign In Demo
            </button>
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
                placeholder="admin@lichtmarketing.co.uk"
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
                Hint: <code>admin@lichtmarketing.co.uk</code> / <code>admin123</code>
              </div>
            </div>

            <button type="submit" className="admin-submit-btn">
              Authorize &amp; Enter Portal →
            </button>
          </form>

          <button
            type="button"
            onClick={onExit}
            className="admin-back-link"
            style={{ background: 'none', border: 'none', width: '100%' }}
          >
            ← Return to Main Website
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RENDER: 2. ADMIN PORTAL DASHBOARD
     ========================================================================== */
  return (
    <div className="admin-portal-root">
      {/* ── Top Navbar ── */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-nav-logo-box">
            <img src="/licht-logo.png" alt="Licht Marketing" />
          </div>
          <span className="admin-nav-badge">Operations Portal</span>
        </div>

        <div className="admin-nav-right">
          <div className="admin-user-pill">
            <div className="admin-user-avatar">MS</div>
            <div>
              <strong>{adminUser.name}</strong> · <span style={{ opacity: 0.8 }}>{adminUser.role}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="admin-nav-btn"
            title="View public site in another tab"
          >
            ↗ Public Website
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="admin-nav-btn logout"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav className="admin-tabs-bar" aria-label="Admin Navigation Tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span>📋 Orders &amp; Bookings</span>
          <span className="admin-tab-count">{bookings.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'cleaners' ? 'active' : ''}`}
          onClick={() => setActiveTab('cleaners')}
        >
          <span>👥 Cleaners &amp; Resources</span>
          <span className="admin-tab-count">{operatives.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          <span>🚐 Fleet &amp; Equipment</span>
          <span className="admin-tab-count">{INITIAL_FLEET.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>📊 Financial &amp; KPI Overview</span>
        </button>
      </nav>

      {/* ── Main Container ── */}
      <main className="admin-container">
        {/* KPI Strip */}
        <section className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Captured Revenue</div>
              <div className="admin-kpi-val">£{totalRevenue.toLocaleString()}</div>
              <div className="admin-kpi-trend">↑ 100% Verified Payments</div>
            </div>
            <div className="admin-kpi-icon-bubble">💳</div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Active Bookings</div>
              <div className="admin-kpi-val">{activeBookingsCount}</div>
              <div className="admin-kpi-trend">Requiring dispatch or in-route</div>
            </div>
            <div className="admin-kpi-icon-bubble">📋</div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Available Cleaners</div>
              <div className="admin-kpi-val">{availableCleanersCount} / {operatives.length}</div>
              <div className="admin-kpi-trend" style={{ color: 'var(--teal)' }}>DBS-Vetted &amp; On Standby</div>
            </div>
            <div className="admin-kpi-icon-bubble">👥</div>
          </div>

          <div className="admin-kpi-card">
            <div>
              <div className="admin-kpi-title">Completed Cleanings</div>
              <div className="admin-kpi-val">{completedJobsCount}</div>
              <div className="admin-kpi-trend">Audited with 5-Star CSAT</div>
            </div>
            <div className="admin-kpi-icon-bubble">✨</div>
          </div>
        </section>

        {/* ── TAB 1: ORDERS & BOOKINGS ── */}
        {activeTab === 'orders' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Client Orders &amp; Dispatch Queue</h2>
                <p className="admin-section-subtitle">
                  Review booked cleanings, assign DBS-vetted lead operatives, and start active on-site service runs.
                </p>
              </div>

              <div className="admin-controls-row">
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
                  <option value="confirmed">Confirmed (Paid)</option>
                  <option value="dispatched">In Progress / Dispatched</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Client &amp; Contact</th>
                    <th>Service Scope</th>
                    <th>Scheduled Window</th>
                    <th>Status</th>
                    <th>Assigned Operative</th>
                    <th>Amount</th>
                    <th>Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-mid)' }}>
                        No bookings match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isDispatched = (b.status || '').toLowerCase().includes('dispatched') || (b.status || '').toLowerCase().includes('progress');
                      const isCompleted = (b.status || '').toLowerCase().includes('completed');

                      return (
                        <tr key={b.id}>
                          <td>
                            <div className="booking-ref-cell">{b.id}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>
                              {b.transactionId || 'PAID'}
                            </div>
                          </td>
                          <td>
                            <div className="booking-client-name">{b.clientName || 'Client'}</div>
                            <div className="booking-client-contact">{b.clientEmail}</div>
                            <div className="booking-client-contact">{b.address}</div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--navy)' }}>{b.serviceName}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--slate-mid)' }}>
                              {b.frequency} · {b.propertySize}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.date}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>{b.timeSlot}</div>
                          </td>
                          <td>
                            <span className={`booking-status-pill ${isCompleted ? 'completed' : isDispatched ? 'dispatched' : 'confirmed'}`}>
                              {isCompleted ? '✓ Completed' : isDispatched ? '🚀 Dispatched' : '● Paid & Scheduled'}
                            </span>
                          </td>
                          <td>
                            {b.assignedCleaner ? (
                              <div>
                                <strong style={{ color: 'var(--navy)' }}>{b.assignedCleaner}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>{b.assignedVan || 'Van 1'}</div>
                              </div>
                            ) : (
                              <span style={{ color: '#ea580c', fontSize: '0.75rem', fontWeight: 600 }}>
                                ⚠️ Needs Operative
                              </span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--navy)', fontSize: '0.95rem' }}>£{b.totalPrice || b.paidAmount}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>inc. VAT</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {!isCompleted && !isDispatched && (
                                <button
                                  type="button"
                                  onClick={() => openDispatchModal(b)}
                                  className="booking-action-btn dispatch"
                                  title="Assign cleaner and start cleaning"
                                >
                                  🚀 Start Booking
                                </button>
                              )}

                              {isDispatched && !isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(b.id)}
                                  className="booking-action-btn"
                                  style={{ background: '#16a34a' }}
                                  title="Mark service finished and verified"
                                >
                                  ✓ Finish Job
                                </button>
                              )}

                              {isCompleted && (
                                <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700, padding: '4px 8px' }}>
                                  ✓ Audited
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => setJobSheetBooking(b)}
                                className="booking-action-btn details"
                                title="View detailed Job Sheet & Access codes"
                              >
                                Job Sheet
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── TAB 2: CLEANERS & RESOURCES ── */}
        {activeTab === 'cleaners' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">DBS-Vetted Operatives &amp; Field Staff</h2>
                <p className="admin-section-subtitle">
                  Manage certified cleaning operatives, track live availability, and assign specialists to corporate contracts.
                </p>
              </div>

              <div className="admin-controls-row">
                <button
                  type="button"
                  onClick={() => alert('New Operative Onboarding: upload DBS certificate, insurance credentials, and ID documents to staff registrar.')}
                  className="admin-submit-btn"
                  style={{ width: 'auto', padding: '10px 18px', margin: 0 }}
                >
                  + Add New Operative
                </button>
              </div>
            </div>

            <div className="admin-cleaners-grid">
              {operatives.map((op) => (
                <div key={op.id} className="cleaner-card">
                  <div className="cleaner-card-header">
                    <img src={op.avatar} alt={op.name} className="cleaner-avatar" />
                    <div>
                      <div className="cleaner-name">{op.name}</div>
                      <div className="cleaner-role">{op.role}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>ID: {op.id}</div>
                    </div>
                    <span className={`cleaner-status-badge ${op.status}`}>
                      {op.status === 'available' ? '● Available' : op.status === 'on_job' ? '🚀 On Job' : '○ Off Duty'}
                    </span>
                  </div>

                  <div className="cleaner-meta-row">
                    <span>DBS Certificate</span>
                    <span style={{ color: '#16a34a' }}>✓ Verified</span>
                  </div>
                  <div className="cleaner-meta-row">
                    <span>Contact Phone</span>
                    <span>{op.phone}</span>
                  </div>
                  <div className="cleaner-meta-row">
                    <span>Quality Rating</span>
                    <span>★ {op.rating} ({op.jobsCompleted} cleanings)</span>
                  </div>
                  <div className="cleaner-meta-row">
                    <span>Current Assignment</span>
                    <span>{op.currentJobId ? `Job ${op.currentJobId}` : 'None (Standby)'}</span>
                  </div>

                  <div className="cleaner-status-toggle">
                    <button
                      type="button"
                      className={op.status === 'available' ? 'active' : ''}
                      onClick={() => handleToggleOperativeStatus(op.id, 'available')}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      className={op.status === 'on_job' ? 'active' : ''}
                      onClick={() => handleToggleOperativeStatus(op.id, 'on_job')}
                    >
                      On Job
                    </button>
                    <button
                      type="button"
                      className={op.status === 'off_duty' ? 'active' : ''}
                      onClick={() => handleToggleOperativeStatus(op.id, 'off_duty')}
                    >
                      Off Duty
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 3: FLEET & EQUIPMENT ── */}
        {activeTab === 'fleet' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Fleet Logistics &amp; Cleaning Equipment</h2>
                <p className="admin-section-subtitle">
                  Monitor service transport vans, industrial steam extraction rigs, and consumable eco-detergent depot levels.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {INITIAL_FLEET.map((van) => (
                <div key={van.id} className="cleaner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🚐</span>
                    <span className="booking-status-pill confirmed">{van.status}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '4px' }}>
                    {van.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-mid)', marginBottom: '16px' }}>
                    Registration: <strong>{van.reg}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-offwhite)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                    <strong>Onboard Equipment:</strong>
                    <div>{van.equipment}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-table-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '16px' }}>
                Eco-Chemicals &amp; Consumables Inventory Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: 'var(--bg-offwhite)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>Bio-Degradable Sanitiser (L)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>420 L</div>
                  <div style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ Ample Stock (Central Depot)</div>
                </div>
                <div style={{ background: 'var(--bg-offwhite)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>HEPA Replacement Filters</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>38 Units</div>
                  <div style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ 100% Ready for allergen jobs</div>
                </div>
                <div style={{ background: 'var(--bg-offwhite)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>Microfiber Colour-Coded Cloths</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>850 Sets</div>
                  <div style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ Cross-contamination proof</div>
                </div>
                <div style={{ background: 'var(--bg-offwhite)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>Diamond Floor Polishing Pads</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>64 Pads</div>
                  <div style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ Marble &amp; Terrazzo rigs</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Operations &amp; Performance Summary</h2>
                <p className="admin-section-subtitle">High-level contract delivery metrics and service level agreements (SLAs).</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div className="admin-table-card" style={{ padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '14px' }}>
                  Service Category Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <strong>Corporate &amp; Office Cleanings</strong>
                      <span>54% of revenue</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '54%', height: '100%', background: 'var(--teal)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <strong>Commercial Floor &amp; Carpet Rigs</strong>
                      <span>28% of revenue</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '28%', height: '100%', background: 'var(--navy)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <strong>Home &amp; Residential Appointments</strong>
                      <span>18% of revenue</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '18%', height: '100%', background: '#38bdf8' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-table-card" style={{ padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '14px' }}>
                  Compliance &amp; Safety Audits
                </h3>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--slate-dark)' }}>
                  <p style={{ marginBottom: '12px' }}>
                    ✓ <strong>100% Enhanced DBS</strong> checks verified for all active operatives on field shifts.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    ✓ <strong>£10,000,000</strong> Public &amp; Employers’ Liability Insurance current with Aviva UK.
                  </p>
                  <p>
                    ✓ <strong>ISO 9001 &amp; ISO 14001</strong> environmental standards maintained across all supplies.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ==========================================================================
         MODAL: DISPATCH TEAM / START BOOKING
         ========================================================================== */}
      {dispatchModalOpen && selectedBookingForDispatch && (
        <div className="admin-modal-overlay" onClick={() => setDispatchModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">🚀 Dispatch Team &amp; Start Job</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDispatchModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-mid)' }}>Order Reference</div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--navy)' }}>{selectedBookingForDispatch.id}</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {selectedBookingForDispatch.serviceName} · {selectedBookingForDispatch.clientName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-mid)', marginTop: '2px' }}>
                📍 {selectedBookingForDispatch.address}
              </div>
            </div>

            {selectedBookingForDispatch.notes && (
              <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: '12px', fontSize: '0.82rem', color: '#92400e', marginBottom: '20px' }}>
                🔑 <strong>Access Instructions:</strong> {selectedBookingForDispatch.notes}
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label">Assign Lead Cleaner / Operative *</label>
              <select
                className="admin-form-input"
                value={assignedCleanerId}
                onChange={(e) => setAssignedCleanerId(e.target.value)}
              >
                {operatives.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.role}) — {op.status === 'available' ? 'Available' : 'Currently Busy'}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Assign Service Van / Transport Unit *</label>
              <select
                className="admin-form-input"
                value={assignedVanId}
                onChange={(e) => setAssignedVanId(e.target.value)}
              >
                {INITIAL_FLEET.map(van => (
                  <option key={van.id} value={van.id}>
                    {van.name} [{van.reg}]
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Estimated Transit Time / ETA</label>
              <input
                type="text"
                className="admin-form-input"
                value={dispatchEta}
                onChange={(e) => setDispatchEta(e.target.value)}
                placeholder="e.g. 20-30 mins"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="admin-nav-btn"
                style={{ background: '#f1f5f9', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDispatchAndStartBooking}
                className="admin-submit-btn"
                style={{ flex: 2, margin: 0 }}
              >
                Confirm Dispatch &amp; Start Job →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL: DETAILED JOB SHEET & AUDIT LOG
         ========================================================================== */}
      {jobSheetBooking && (
        <div className="admin-modal-overlay" onClick={() => setJobSheetBooking(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">📄 Service Job Sheet</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setJobSheetBooking(null)}
              >
                ✕
              </button>
            </div>

            <div className="job-sheet-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--slate-mid)' }}>Order ID</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)' }}>
                    {jobSheetBooking.id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--slate-mid)' }}>Payment Status</span>
                  <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                    ✓ PAID (£{jobSheetBooking.totalPrice || jobSheetBooking.paidAmount})
                  </div>
                </div>
              </div>

              <div className="job-sheet-grid">
                <div className="job-sheet-item">
                  <strong>Client Name</strong>
                  {jobSheetBooking.clientName || 'N/A'}
                </div>
                <div className="job-sheet-item">
                  <strong>Contact Phone / Email</strong>
                  {jobSheetBooking.clientEmail}
                </div>
                <div className="job-sheet-item">
                  <strong>Service</strong>
                  {jobSheetBooking.serviceName}
                </div>
                <div className="job-sheet-item">
                  <strong>Frequency / Scope</strong>
                  {jobSheetBooking.frequency} · {jobSheetBooking.propertySize}
                </div>
                <div className="job-sheet-item" style={{ gridColumn: '1 / -1' }}>
                  <strong>Premises Address</strong>
                  {jobSheetBooking.address}
                </div>
                <div className="job-sheet-item" style={{ gridColumn: '1 / -1' }}>
                  <strong>Access Notes &amp; Key Safe Codes</strong>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', marginTop: '4px' }}>
                    {jobSheetBooking.notes || 'No specific gate codes provided. Front desk check-in.'}
                  </div>
                </div>
                <div className="job-sheet-item">
                  <strong>Scheduled Arrival Window</strong>
                  {jobSheetBooking.date} ({jobSheetBooking.timeSlot})
                </div>
                <div className="job-sheet-item">
                  <strong>Assigned Cleaner</strong>
                  {jobSheetBooking.assignedCleaner || 'Not assigned yet'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  alert(`Job Sheet ${jobSheetBooking.id} exported for field operative.`);
                  setJobSheetBooking(null);
                }}
                className="admin-submit-btn"
                style={{ margin: 0, flex: 1 }}
              >
                🖨️ Print / Export Job Sheet
              </button>
              <button
                type="button"
                onClick={() => setJobSheetBooking(null)}
                className="admin-nav-btn"
                style={{ background: '#f1f5f9', color: 'var(--navy)', padding: '12px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
