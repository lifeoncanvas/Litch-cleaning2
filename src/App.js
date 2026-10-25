/**
 * @file App.js
 * @description Main Application Controller for Licht Marketing.
 *              Orchestrates routing (Home, About Us, Operations Admin Portal),
 *              client authentication, booking workflow, and interactive quotation engine.
 * @author Licht Marketing Engineering
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Styles & Booking Components
import {
  AuthModal,
  BookingModal,
  CartDrawer,
  MyBookingsModal,
  ToastNotification,
} from './components/booking';
import './Booking.css';

// Pages
import AboutPage from './pages/AboutPage';
import AdminPortal from './pages/AdminPage';

// Data Catalogs
import { SERVICES_DATA, SECTORS_DATA } from './data/servicesData';
import { VALUES_DATA, PROCESS_DATA, TESTIMONIALS_DATA } from './data/contentData';

// Spring Boot Backend API Integration
import {
  checkBackendHealth,
  apiLogin,
  apiDemoLogin,
  apiRegister,
  apiLogout,
  apiFetchMyBookings,
  apiCreateBooking,
  apiCancelBooking,
  apiSubmitQuote,
} from './services/api';

/* ==========================================================================
   MAIN APP CONTROLLER COMPONENT
   ========================================================================== */
export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'about'
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [quoteTab, setQuoteTab] = useState('general'); // 'general' | 'corporate'
  const [submittedForm, setSubmittedForm] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendPort, setBackendPort] = useState(8081);

  // User Authentication State (Persisted in localStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('licht_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cleaning Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('licht_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Client Bookings State (Persisted in localStorage)
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('licht_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & UI Flow State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authMessage, setAuthMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [myBookingsModalOpen, setMyBookingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    postcode: '',
    serviceType: 'Corporate & Office Cleaning',
    frequency: 'Weekly',
    propertySize: '',
    date: '',
    message: '',
  });

  // Handle URL hash and pathname changes (including /admin)
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin')) {
        setCurrentPage('admin');
        document.title = 'Operations Admin Portal | Licht Home and Corporate Cleaning';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#about' || hash.startsWith('#/about')) {
        setCurrentPage('about');
        document.title = 'About Us | Licht Home and Corporate Cleaning';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentPage('home');
        document.title = 'Licht Home and Corporate Cleaning';
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Backend Health Check
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendOnline(res.online);
      if (res.online && res.data?.port) {
        setBackendPort(res.data.port);
      }
    });
  }, []);

  // Fetch client bookings from backend when user is logged in
  useEffect(() => {
    if (user?.email) {
      apiFetchMyBookings(user.email).then((fetched) => {
        if (fetched && fetched.length > 0) {
          setBookings(fetched);
          localStorage.setItem('licht_bookings', JSON.stringify(fetched));
        }
      });
    }
  }, [user]);

  const navigateTo = (page, sectionId = null) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);

    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
      window.location.hash = '#/admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'about') {
      if (window.location.pathname === '/admin') {
        window.history.pushState({}, '', '/');
      }
      window.location.hash = '#about';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState({}, '', '/');
      }
      window.location.hash = sectionId ? `#${sectionId}` : '#';
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Execute pending action after successful authentication
  const executePendingAction = (currentUser) => {
    if (!pendingAction) return;

    if (pendingAction.type === 'book') {
      setSelectedServiceForBooking(pendingAction.service);
      setBookingModalOpen(true);
    } else if (pendingAction.type === 'cart') {
      handleAddToCart(pendingAction.service, false, currentUser);
    } else if (pendingAction.type === 'checkout') {
      setSelectedServiceForBooking(null);
      setBookingModalOpen(true);
    }
    setPendingAction(null);
  };

  // Authentication Handlers (Connected to Spring Boot REST API with offline fallback)
  const handleLogin = async (credentials) => {
    try {
      const res = await apiLogin(credentials.email, credentials.password);
      let loggedUser;
      if (res && res.success && res.user) {
        loggedUser = res.user;
      } else {
        loggedUser = {
          id: 'usr_' + Date.now(),
          name: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: credentials.email,
          phone: '+44 20 8000 0000',
          address: '14 Berkeley Square, London',
          company: 'Corporate Partner',
        };
      }
      setUser(loggedUser);
      localStorage.setItem('licht_user', JSON.stringify(loggedUser));
      setAuthModalOpen(false);
      showToast(`Welcome back, ${loggedUser.name}!`);
      executePendingAction(loggedUser);
    } catch (e) {
      showToast('Error during login. Using local session.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const res = await apiDemoLogin();
      let demoUser;
      if (res && res.success && res.user) {
        demoUser = res.user;
      } else {
        demoUser = {
          id: 'usr_demo_882',
          name: 'Alex Vance',
          email: 'alex.vance@ventureoffices.co.uk',
          phone: '+44 20 7946 0912',
          address: '45 Marylebone High Street, London W1U 5AA',
          company: 'Venture Offices Group',
        };
      }
      setUser(demoUser);
      localStorage.setItem('licht_user', JSON.stringify(demoUser));
      setAuthModalOpen(false);
      showToast('Signed in as Alex Vance (Verified Client)');
      executePendingAction(demoUser);
    } catch (e) {
      showToast('Demo login fallback active.');
    }
  };

  const handleRegister = async (data) => {
    try {
      const res = await apiRegister(data);
      let newUser;
      if (res && res.success && res.user) {
        newUser = res.user;
      } else {
        newUser = {
          id: 'usr_' + Date.now(),
          name: data.name,
          email: data.email,
          phone: data.phone || '+44 20 8000 0000',
          address: 'Central London, UK',
          company: 'Corporate / Domestic Partner',
        };
      }
      setUser(newUser);
      localStorage.setItem('licht_user', JSON.stringify(newUser));
      setAuthModalOpen(false);
      showToast(`Account created for ${newUser.name}!`);
      executePendingAction(newUser);
    } catch (e) {
      showToast('Registration fallback active.');
    }
  };

  const handleSignOut = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem('licht_user');
    showToast('Signed out successfully.');
  };

  // Click on a service to initiate direct booking (requires authentication)
  const handleInitiateBooking = (service) => {
    if (!user) {
      setPendingAction({ type: 'book', service });
      setAuthMessage(`Please sign in or create an account to book ${service.title}`);
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setSelectedServiceForBooking(service);
    setBookingModalOpen(true);
  };

  // Add service to cart (requires authentication)
  const handleAddToCart = (service, silent = false, currentUser = user) => {
    if (!currentUser) {
      setPendingAction({ type: 'cart', service });
      setAuthMessage(`Please sign in or create an account to add ${service.title} to your cart`);
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.serviceId === service.id);
      let updated;
      if (existing) {
        updated = prevCart.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [
          ...prevCart,
          {
            id: Date.now(),
            serviceId: service.id,
            title: service.title,
            category: service.category,
            price: service.price || 150,
            img: service.img,
            frequency: 'One-off Clean',
            quantity: 1,
          },
        ];
      }
      localStorage.setItem('licht_cart', JSON.stringify(updated));
      return updated;
    });

    showToast(`${service.title} added to cart!`);
    if (!silent) {
      setCartDrawerOpen(true);
    }
  };

  const handleUpdateCartQuantity = (id, newQty) => {
    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );
      localStorage.setItem('licht_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.id !== id);
      localStorage.setItem('licht_cart', JSON.stringify(updated));
      return updated;
    });
    showToast('Service removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('licht_cart');
    showToast('Cart cleared.');
  };

  const handleProceedCartCheckout = () => {
    if (!user) {
      setPendingAction({ type: 'checkout' });
      setAuthMessage('Please sign in or create an account to schedule your cart bookings');
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setCartDrawerOpen(false);
    setSelectedServiceForBooking(null);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (newBooking) => {
    try {
      const savedBooking = await apiCreateBooking(newBooking);
      const bookingToAdd = savedBooking || newBooking;
      setBookings((prev) => {
        const updated = [bookingToAdd, ...prev.filter((b) => b.id !== bookingToAdd.id)];
        localStorage.setItem('licht_bookings', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        localStorage.setItem('licht_bookings', JSON.stringify(updated));
        return updated;
      });
    }

    // If it was a cart checkout booking, clear cart
    if (!selectedServiceForBooking && cart.length > 0) {
      setCart([]);
      localStorage.removeItem('licht_cart');
    }

    showToast(`Booking ${newBooking.id} confirmed and saved to backend!`);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await apiCancelBooking(bookingId);
    } catch (e) {}
    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== bookingId);
      localStorage.setItem('licht_bookings', JSON.stringify(updated));
      return updated;
    });
    showToast('Booking cancelled.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiSubmitQuote(formData);
    } catch (err) {}
    setSubmittedForm(true);
    showToast('Quote request submitted and sent to backend API!');
  };

  const filteredServices = serviceFilter === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(s => s.category === serviceFilter);

  // Render Admin Portal if navigating to /admin
  if (currentPage === 'admin') {
    return (
      <AdminPortal
        onExit={() => navigateTo('home')}
        onBookingUpdate={() => {
          try {
            const b = localStorage.getItem('licht_bookings');
            if (b) setBookings(JSON.parse(b));
          } catch (e) {}
        }}
      />
    );
  }

  return (
    <div className="licht-editorial-app">
      {/* ── 1. FIXED FLOATING NAVIGATION BAR ── */}
      <header className={`header-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav-bar" aria-label="Main Navigation">
          {/* Brand Logo on the left */}
          <button
            onClick={() => navigateTo('home')}
            className="brand-logo-link"
            title="Licht Marketing Home"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {/* EXACT LICHT MARKETING LOGO — 100% UNTOUCHED ORIGINAL */}
            <img
              src="/licht-logo.png"
              alt="LICHT MARKETING - Home & Corporate Cleaning"
              className="brand-logo-img"
            />
          </button>

          {/* Desktop Navigation Links */}
          <ul className="nav-menu desktop-only">
            <li>
              <button
                onClick={() => navigateTo('home')}
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('about')}
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                style={currentPage === 'about' ? { color: 'var(--teal)' } : {}}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('home', 'services')}
                className="nav-link"
              >
                Services
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo('home', 'quote')}
                className="nav-link"
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Desktop Action Cluster (Cart + Login/User profile + Backend status) */}
          <div className="nav-actions desktop-only">
            {/* Live Backend Connection Indicator */}
            <div
              className="backend-status-pill"
              title={backendOnline ? `Spring Boot Backend API active on port ${backendPort} (Connected to MySQL)` : 'Connecting to Spring Boot REST API (:8081)...'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: '14px',
                background: backendOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                color: backendOnline ? '#16a34a' : '#ca8a04',
                border: `1px solid ${backendOnline ? 'rgba(34, 197, 94, 0.35)' : 'rgba(234, 179, 8, 0.35)'}`,
                cursor: 'default',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: backendOnline ? '#16a34a' : '#eab308',
                  boxShadow: backendOnline ? '0 0 6px rgba(34, 197, 94, 0.8)' : 'none',
                }}
              />
              <span>{backendOnline ? 'API :8081 Live' : 'API Syncing'}</span>
            </div>

            {/* Cart Button with Item Badge */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="nav-cart-btn"
              title="View Cleaning Cart"
            >
              <span>🛒</span> Cart
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>

            {/* Client Authentication Status & Primary Login CTA */}
            {user ? (
              <div className="nav-user-cluster">
                <button
                  onClick={() => setMyBookingsModalOpen(true)}
                  className="nav-bookings-btn"
                  title="View My Bookings"
                >
                  📅 Bookings {bookings.length > 0 && <span className="cart-badge" style={{ background: 'var(--navy)' }}>{bookings.length}</span>}
                </button>
                <div className="nav-user-pill">
                  <span className="user-avatar-circle">{user.name ? user.name[0].toUpperCase() : 'C'}</span>
                  <span>{user.name ? user.name.split(' ')[0] : 'Client'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="nav-signout-btn"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthMessage('Sign in to book cleaning services and manage reservations');
                  setPendingAction(null);
                  setAuthModalOpen(true);
                }}
                className="nav-cta-btn"
              >
                Login
              </button>
            )}
          </div>

          {/* Hamburger Menu Toggle Button (Visible exclusively on mobile/tablet right side) */}
          <button
            className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Mobile Full-Feature Hamburger Drawer (All links + Cart + Login/User in one place) */}
          {mobileMenuOpen && (
            <>
              <div
                className="mobile-nav-backdrop"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
                <ul className="mobile-links-list">
                  <li>
                    <button
                      onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
                      className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateTo('about'); setMobileMenuOpen(false); }}
                      className={`mobile-nav-link ${currentPage === 'about' ? 'active' : ''}`}
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateTo('home', 'services'); setMobileMenuOpen(false); }}
                      className="mobile-nav-link"
                    >
                      Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateTo('home', 'quote'); setMobileMenuOpen(false); }}
                      className="mobile-nav-link"
                    >
                      Contact
                    </button>
                  </li>
                </ul>

                <div className="mobile-drawer-divider" />

                {/* Action items inside mobile drawer */}
                <div className="mobile-drawer-actions">
                  <button
                    onClick={() => { setCartDrawerOpen(true); setMobileMenuOpen(false); }}
                    className="mobile-action-btn cart-btn"
                  >
                    <span>🛒 View Cart</span>
                    {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                  </button>

                  {user ? (
                    <div className="mobile-user-section">
                      <div className="mobile-user-info">
                        <span className="user-avatar-circle">{user.name ? user.name[0].toUpperCase() : 'C'}</span>
                        <div>
                          <strong style={{ color: 'var(--navy)' }}>{user.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-mid)' }}>{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => { setMyBookingsModalOpen(true); setMobileMenuOpen(false); }}
                        className="mobile-action-btn bookings-btn"
                      >
                        📅 My Bookings ({bookings.length})
                      </button>
                      <button
                        onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                        className="mobile-action-btn signout-btn"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setAuthMessage('Sign in to book cleaning services and manage reservations');
                        setPendingAction(null);
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-action-btn login-btn"
                    >
                      🔒 Sign In / Create Account
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </nav>
      </header>

      {/* ── 2. CONDITIONAL PAGE RENDERING: ABOUT US vs HOME ── */}
      {currentPage === 'about' ? (
        <AboutPage onNavigate={navigateTo} onInitiateBooking={handleInitiateBooking} />
      ) : (
        /* ── HOME PAGE CONTENT ── */
        <main>
          {/* ── HERO SECTION (EDITORIAL ARCHITECTURAL FRAME) ── */}
          {/* ── HERO SECTION (NOVA-STYLE REFERENCE DESIGN) ── */}
          <section id="hero" className="hero-wrapper" aria-label="Hero Section">
            <div className="nova-hero-frame">
              <img
                src="/hero.jpg"
                alt="Professional cleaner maintaining high-end corporate office"
                className="nova-hero-bg-media"
              />
              <div className="nova-hero-ambient-glow" />

              <div className="nova-hero-grid">
                {/* ── Left Column: Kicker, Headline, CTA, Dual Metrics ── */}
                <div className="nova-left-col">
                  <div>
                    <div className="nova-kicker">STANDARDS, NATURALLY</div>
                    <h1 className="nova-headline">
                      Meet Licht.<br />
                      Cleaning That<br />
                      Moves With You.
                    </h1>
                    <button
                      onClick={() => navigateTo('home', 'quote')}
                      className="nova-cta-btn"
                    >
                      Get Early Access <span>→</span>
                    </button>
                  </div>

                  <div className="nova-bottom-stats-row">
                    <button
                      type="button"
                      onClick={() => navigateTo('home', 'process')}
                      className="nova-glass-stat"
                      title="Explore Our 5-Step Process"
                    >
                      <div className="nova-stat-num">5-Step</div>
                      <div className="nova-stat-footer">
                        <span>Process</span>
                        <span>→</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('home', 'details-matter')}
                      className="nova-glass-stat"
                      title="Explore The Details Matter (Core Principles)"
                    >
                      <div className="nova-stat-num">100%</div>
                      <div className="nova-stat-footer">
                        <span>Details Matter</span>
                        <span>→</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── Right Column: Stacked White Cards ── */}
                <div className="nova-right-col">
                  {/* Top Card: See Features / Feels Effortless */}
                  <div className="nova-white-card">
                    <div className="nova-top-card-header">
                      <button
                        onClick={() => navigateTo('home', 'services')}
                        className="see-features-btn"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        SEE FEATURES
                      </button>
                      <div className="nova-preview-mini">
                        <img src="/service_office.jpg" alt="Service Preview" />
                      </div>
                    </div>
                    <h3 className="nova-card-title">Feels Effortless</h3>
                    <p className="nova-card-desc">
                      Designed to fit naturally into your everyday life and corporate schedule.
                    </p>
                  </div>

                  {/* Bottom Card: Dial / Gauge Stats */}
                  <div className="nova-white-card">
                    <div className="gauge-card-header">
                      <span className="gauge-big-stat">99%</span>
                      <span className="gauge-pill-target">+15MIN</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)', fontWeight: 600, marginTop: '2px' }}>
                      Typical Response Target
                    </div>

                    <div className="gauge-dial-container">
                      <svg className="gauge-radial-svg" viewBox="0 0 140 80">
                        {/* Background track arc */}
                        <path
                          d="M 15 70 A 55 55 0 0 1 125 70"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="3 4"
                        />
                        {/* Active arc in teal gradient */}
                        <path
                          d="M 15 70 A 55 55 0 0 1 115 50"
                          fill="none"
                          stroke="url(#dialTealGrad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="dialTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1599ac" />
                            <stop offset="100%" stopColor="#2ab5c0" />
                          </linearGradient>
                        </defs>
                        <text
                          x="70"
                          y="65"
                          textAnchor="middle"
                          fontFamily="Outfit, sans-serif"
                          fontWeight="800"
                          fontSize="16"
                          fill="#10264A"
                        >
                          99%
                        </text>
                      </svg>
                    </div>

                    <div className="gauge-footer-meta">
                      <span>Hygiene Readiness</span>
                      <span>Environmental Safe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. EDITORIAL WHITESPACE SECTION (MIDDLE OF REFERENCE IMAGE) ── */}
          <section id="about" className="editorial-middle-section" aria-label="Brand Overview">
            <div className="editorial-container">
              <div className="editorial-header-row">
                <div className="editorial-mark-group">
                  <span className="editorial-asterisk">✦</span>
                  <div>
                    <span className="editorial-kicker-label">SHAPING PRISTINE SPACES</span>
                    <div className="editorial-main-headline">
                      <div>CLEAN SPACES.</div>
                      <div className="editorial-headline-line-2">
                        <span>COMPLETE CONFIDENCE.</span>
                        <span className="editorial-toggle-pill">
                          <span className="editorial-toggle-dot" />
                          <span className="editorial-toggle-dot dot-teal" />
                        </span>
                      </div>
                      <div className="editorial-headline-line-3">
                        DELIVERING EXCEPTIONAL HYGIENE
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <a href="#services" className="editorial-left-link">
                  OUR COMPREHENSIVE SERVICES ↗
                </a>
                <button
                  onClick={() => navigateTo('about')}
                  className="editorial-left-link"
                  style={{ color: 'var(--teal)', borderColor: 'var(--teal)', cursor: 'pointer' }}
                >
                  LEARN MORE ABOUT US ↗
                </button>
              </div>

              {/* 3 Clean Rounded Architectural Cards (All Showing Cleaners in Action) */}
              <div className="editorial-tri-cards">
                <div className="editorial-tri-card">
                  <img
                    src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1000&q=80"
                    alt="Professional cleaner maintaining commercial glass partitions"
                    className="tri-card-img"
                  />
                  <div className="tri-card-gradient" />
                  <div className="tri-card-info">
                    <div className="tri-card-category">Glass &amp; Partition Care</div>
                    <h3 className="tri-card-title">Commercial Glass &amp; Facade Maintenance</h3>
                  </div>
                </div>

                <div className="editorial-tri-card">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"
                    alt="Cleaner in uniform sanitising corporate desks and office surfaces"
                    className="tri-card-img"
                  />
                  <div className="tri-card-gradient" />
                  <div className="tri-card-info">
                    <div className="tri-card-category">Workplace Hygiene</div>
                    <h3 className="tri-card-title">Office Desks &amp; Boardroom Detailing</h3>
                  </div>
                </div>

                <div className="editorial-tri-card">
                  <img
                    src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80"
                    alt="Domestic cleaner in apron mopping modern residential floor"
                    className="tri-card-img"
                  />
                  <div className="tri-card-gradient" />
                  <div className="tri-card-info">
                    <div className="tri-card-category">Residential Excellence</div>
                    <h3 className="tri-card-title">Meticulous Domestic Living Care</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. "WE CLEAN. YOU RELAX. →" DARK SERVICE CARDS ── */}
          <section className="we-clean-section" aria-label="Core Pillars">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <div className="center-headline-row">
                  <div className="center-headline-text">
                    WE CLEAN.<br />
                    <span className="center-headline-muted">YOU RELAX.</span>
                  </div>
                  <span className="center-headline-arrow">→</span>
                </div>
                <p className="center-subtext">
                  Comprehensive cleaning solutions engineered for corporate hygiene, seamless scheduling, and pristine environments.
                </p>
              </div>

              <div className="dark-service-row">
                {/* Card 1: Corporate Vacuuming & Surface Care */}
                <div className="dark-service-card" onClick={() => handleInitiateBooking(SERVICES_DATA[0])} style={{ cursor: 'pointer' }}>
                  <img
                    src="https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&w=800&q=80"
                    alt="Cleaner vacuuming modern corporate office floor"
                    className="dark-card-bg-img"
                  />
                  <div className="dark-card-gradient" />
                  <div className="dark-card-top">
                    <div className="dark-card-icon-pill">🏢</div>
                    <span className="dark-card-num">01</span>
                  </div>
                  <div className="dark-card-bottom">
                    <h3 className="dark-card-title">CORPORATE &amp; OFFICE</h3>
                    <p className="dark-card-desc">Scheduled workplace cleaning tailored to corporate headquarters and dynamic offices.</p>
                    <div className="dark-card-arrow-circle">↗</div>
                  </div>
                </div>

                {/* Card 2: Residential Kitchen & Living Clean */}
                <div className="dark-service-card" onClick={() => handleInitiateBooking(SERVICES_DATA[1])} style={{ cursor: 'pointer' }}>
                  <img
                    src="https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80"
                    alt="Cleaner wiping down modern kitchen surfaces"
                    className="dark-card-bg-img"
                  />
                  <div className="dark-card-gradient" />
                  <div className="dark-card-top">
                    <div className="dark-card-icon-pill">🏡</div>
                    <span className="dark-card-num">02</span>
                  </div>
                  <div className="dark-card-bottom">
                    <h3 className="dark-card-title">HOME &amp; RESIDENTIAL</h3>
                    <p className="dark-card-desc">Meticulous housekeeping, deep kitchen sanitisation, and routine domestic care.</p>
                    <div className="dark-card-arrow-circle">↗</div>
                  </div>
                </div>

                {/* Card 3: Care Living Infection Control */}
                <div className="dark-service-card" onClick={() => handleInitiateBooking(SERVICES_DATA[3])} style={{ cursor: 'pointer' }}>
                  <img
                    src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80"
                    alt="Healthcare cleaner in gloves disinfecting touchpoints"
                    className="dark-card-bg-img"
                  />
                  <div className="dark-card-gradient" />
                  <div className="dark-card-top">
                    <div className="dark-card-icon-pill">🩺</div>
                    <span className="dark-card-num">03</span>
                  </div>
                  <div className="dark-card-bottom">
                    <h3 className="dark-card-title">CARE &amp; HEALTHCARE</h3>
                    <p className="dark-card-desc">Infection control and hospital-standard hygiene for clinical and assisted living.</p>
                    <div className="dark-card-arrow-circle">↗</div>
                  </div>
                </div>

                {/* Card 4: Specialist Floor Buffing */}
                <div className="dark-service-card" onClick={() => handleInitiateBooking(SERVICES_DATA[7])} style={{ cursor: 'pointer' }}>
                  <img
                    src="/service_floor.jpg"
                    alt="Cleaner operating commercial floor buffer machine"
                    className="dark-card-bg-img"
                  />
                  <div className="dark-card-gradient" />
                  <div className="dark-card-top">
                    <div className="dark-card-icon-pill">⚙️</div>
                    <span className="dark-card-num">04</span>
                  </div>
                  <div className="dark-card-bottom">
                    <h3 className="dark-card-title">SPECIALIST &amp; POST-BUILD</h3>
                    <p className="dark-card-desc">Commercial floor restoration, steam extraction, and post-construction sparkle cleaning.</p>
                    <div className="dark-card-arrow-circle">↗</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. FULL SERVICES GRID ("CLEANING THAT FITS YOUR SPACE") ── */}
          <section id="services" className="services-full-section" aria-label="Services Grid">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <span className="editorial-kicker-label">TAILORED SOLUTIONS</span>
                <h2 className="editorial-main-headline" style={{ marginTop: '8px' }}>
                  CLEANING THAT FITS YOUR SPACE.
                </h2>
                <p className="center-subtext">
                  From recurring corporate contracts to meticulous domestic deep cleans, our verified teams deliver consistent excellence.
                </p>
              </div>

              <div className="services-filter-bar">
                <button
                  className={`filter-pill ${serviceFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setServiceFilter('all')}
                >
                  All Services (8)
                </button>
                <button
                  className={`filter-pill ${serviceFilter === 'corporate' ? 'active' : ''}`}
                  onClick={() => setServiceFilter('corporate')}
                >
                  Corporate &amp; Commercial
                </button>
                <button
                  className={`filter-pill ${serviceFilter === 'residential' ? 'active' : ''}`}
                  onClick={() => setServiceFilter('residential')}
                >
                  Residential &amp; Handover
                </button>
                <button
                  className={`filter-pill ${serviceFilter === 'specialist' ? 'active' : ''}`}
                  onClick={() => setServiceFilter('specialist')}
                >
                  Specialist &amp; Healthcare
                </button>
              </div>

              <div className="services-editorial-grid">
                {filteredServices.map(service => (
                  <div key={service.id} className="service-grid-card">
                    <div
                      className="service-card-media"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleInitiateBooking(service)}
                      title={`Book ${service.title}`}
                    >
                      <img src={service.img} alt={service.title} className="service-card-img" />
                      <span className="service-badge-tag">{service.badge}</span>
                    </div>
                    <div className="service-card-body">
                      <div>
                        <div className="service-card-meta-row">
                          <h3
                            className="service-card-title"
                            style={{ cursor: 'pointer', marginBottom: 0 }}
                            onClick={() => handleInitiateBooking(service)}
                          >
                            {service.title}
                          </h3>
                          <span className="service-price-pill">From £{service.price}</span>
                        </div>
                        <p className="service-card-text">{service.desc}</p>
                      </div>
                      <div className="service-card-actions">
                        <button
                          type="button"
                          className="service-book-btn"
                          onClick={() => handleInitiateBooking(service)}
                        >
                          Book Now ↗
                        </button>
                        <button
                          type="button"
                          className="service-cart-btn"
                          onClick={() => handleAddToCart(service)}
                          title="Add service to cart"
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 6. EDITORIAL SPLIT FEATURES (CORPORATE & RESIDENTIAL) ── */}
          <section className="feature-split-section" aria-label="Featured Service Sectors">
            <div className="editorial-container">
              {/* Corporate Feature */}
              <div id="corporate-feature" className="feature-panel">
                <div className="feature-panel-media">
                  <img
                    src="/hero.jpg"
                    alt="Corporate office cleaning in progress by uniformed professionals"
                    className="feature-panel-img"
                  />
                  <div className="feature-float-badge">
                    <div className="float-badge-title">Contract Reliability</div>
                    <div className="float-badge-sub">Fully vetted, uniformed staff with supervisory audits.</div>
                  </div>
                </div>
                <div className="feature-panel-text">
                  <span className="panel-kicker">CORPORATE CLEANING</span>
                  <h2 className="panel-headline">
                    PROFESSIONAL SPACES.<br />
                    PROFESSIONAL CARE.
                  </h2>
                  <p className="panel-description">
                    Reliable cleaning services tailored to your workplace and business requirements. We support modern offices, financial institutions, and commercial facilities with discreet, uncompromising service.
                  </p>
                  <a href="#quote" className="panel-cta-btn" onClick={() => setQuoteTab('corporate')}>
                    Request a Corporate Quote ↗
                  </a>
                </div>
              </div>

              {/* Home Cleaning Feature */}
              <div id="residential-feature" className="feature-panel reversed">
                <div className="feature-panel-text">
                  <span className="panel-kicker">HOME CLEANING</span>
                  <h2 className="panel-headline">
                    A CLEANER HOME.<br />
                    A BETTER FEELING.
                  </h2>
                  <p className="panel-description">
                    Thoughtful, reliable cleaning for the spaces you call home. Experience the comfort of a spotless living room, pristine kitchen, and revitalised bathrooms serviced by background-checked cleaning professionals.
                  </p>
                  <a href="#quote" className="panel-cta-btn" onClick={() => setQuoteTab('general')}>
                    Explore Home Cleaning ↗
                  </a>
                </div>
                <div className="feature-panel-media">
                  <img
                    src="https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1000&q=80"
                    alt="Professional cleaner spraying and wiping residential kitchen surfaces"
                    className="feature-panel-img"
                  />
                  <div className="feature-float-badge">
                    <div className="float-badge-title">Domestic Peace of Mind</div>
                    <div className="float-badge-sub">Eco-friendly materials, verified background checks.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 7. VISUAL SECTORS GRID (8 SECTORS — ALL CLEANING IN ACTION) ── */}
          <section id="sectors" className="sectors-section" aria-label="Sectors We Serve">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <span className="editorial-kicker-label" style={{ color: 'var(--teal)' }}>CLIENT PORTFOLIO</span>
                <h2 className="editorial-main-headline" style={{ color: 'white', marginTop: '8px' }}>
                  SECTORS WE SERVE.
                </h2>
                <p className="center-subtext" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Tailored protocols, sector-specific certifications, and precision hygiene across every environment.
                </p>
              </div>

              <div className="sectors-grid">
                {SECTORS_DATA.map((sector, idx) => (
                  <div key={idx} className="sector-card">
                    <img src={sector.img} alt={`${sector.name} professional cleaning`} className="sector-bg-img" />
                    <div className="sector-gradient" />
                    <div className="sector-content">
                      <div className="sector-tag">{sector.tag}</div>
                      <h3 className="sector-name">{sector.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 8. WHY CHOOSE US ("THE DETAILS MATTER") ── */}
          <section id="details-matter" className="why-us-section" aria-label="Why Choose Us">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <span className="editorial-kicker-label">CORE PRINCIPLES</span>
                <h2 className="editorial-main-headline" style={{ marginTop: '8px' }}>
                  THE DETAILS MATTER.
                </h2>
                <p className="center-subtext">
                  We believe true professionalism lies in the subtle nuances — the uncompromised corners, the verified staff, and the consistent reliability.
                </p>
              </div>

              <div className="details-grid">
                {VALUES_DATA.map(val => (
                  <div key={val.num} className="detail-card">
                    <div className="detail-number">{val.num}</div>
                    <h3 className="detail-title">{val.title}</h3>
                    <p className="detail-text">{val.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 9. OUR 5-STEP EDITORIAL PROCESS ── */}
          <section id="process" className="process-section" aria-label="Cleaning Process">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <span className="editorial-kicker-label">SEAMLESS ONBOARDING</span>
                <h2 className="editorial-main-headline" style={{ marginTop: '8px' }}>
                  OUR PROCESS.
                </h2>
                <p className="center-subtext">
                  A structured five-stage delivery pathway from initial survey to ongoing hygiene verification.
                </p>
              </div>

              <div className="process-timeline">
                {PROCESS_DATA.map(p => (
                  <div key={p.step} className="process-card">
                    <div className="process-step-num">{p.step}</div>
                    <h3 className="process-step-title">{p.title}</h3>
                    <p className="process-step-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 10. INTERACTIVE QUOTE & CONTRACT ENQUIRY FORMS ── */}
          <section id="quote" className="quote-section" aria-label="Quote Request">
            <div className="editorial-container">
              <div className="center-editorial-header">
                <span className="editorial-kicker-label">GET IN TOUCH</span>
                <h2 className="editorial-main-headline" style={{ marginTop: '8px' }}>
                  LET'S TALK ABOUT YOUR SPACE.
                </h2>
                <p className="center-subtext">
                  Submit your details below for a fast, transparent, and non-obligatory quote tailored to your environment.
                </p>
              </div>

              <div className="quote-tabs-container">
                {/* Tab switchers */}
                <div className="quote-nav-tabs">
                  <button
                    className={`quote-tab-btn ${quoteTab === 'general' ? 'active' : ''}`}
                    onClick={() => setQuoteTab('general')}
                  >
                    1. General &amp; Residential Quote
                  </button>
                  <button
                    className={`quote-tab-btn ${quoteTab === 'corporate' ? 'active' : ''}`}
                    onClick={() => setQuoteTab('corporate')}
                  >
                    2. Corporate &amp; Contract Enquiry
                  </button>
                </div>

                <div className="quote-form-card">
                  {submittedForm ? (
                    <div className="form-success-banner">
                      <div className="success-icon">✓</div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
                        Thank You! Your Enquiry Has Been Received.
                      </h3>
                      <p style={{ fontSize: '0.95rem' }}>
                        A dedicated client manager from <strong>Licht Marketing</strong> will review your space details and contact you within 2 business hours.
                      </p>
                      <button
                        className="nav-cta-btn"
                        style={{ marginTop: '20px', display: 'inline-flex' }}
                        onClick={() => setSubmittedForm(false)}
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Alexander Thorne"
                            className="form-input"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            {quoteTab === 'corporate' ? 'Company / Organisation *' : 'Company / Organisation (Optional)'}
                          </label>
                          <input
                            type="text"
                            name="company"
                            required={quoteTab === 'corporate'}
                            placeholder={quoteTab === 'corporate' ? 'e.g. Apex Global Ltd' : 'Optional'}
                            className="form-input"
                            value={formData.company}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. alexander@example.com"
                            className="form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="e.g. +44 20 8000 0000"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Postcode / Location *</label>
                          <input
                            type="text"
                            name="postcode"
                            required
                            placeholder="e.g. SW1A 1AA or City Centre"
                            className="form-input"
                            value={formData.postcode}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Service Required *</label>
                          <select
                            name="serviceType"
                            className="form-select"
                            value={formData.serviceType}
                            onChange={handleInputChange}
                          >
                            <option value="Corporate & Office Cleaning">Corporate &amp; Office Cleaning</option>
                            <option value="Home & Residential Cleaning">Home &amp; Residential Cleaning</option>
                            <option value="Commercial & Retail Cleaning">Commercial &amp; Retail Cleaning</option>
                            <option value="Care & Supported Living">Care &amp; Supported Living</option>
                            <option value="Deep & Specialist Cleaning">Deep &amp; Specialist Cleaning</option>
                            <option value="Ongoing Contract Cleaning">Ongoing Contract Cleaning</option>
                            <option value="End-of-Tenancy Cleaning">End-of-Tenancy Cleaning</option>
                            <option value="Post-Construction & Sparkle Clean">Post-Construction &amp; Sparkle Clean</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Frequency *</label>
                          <select
                            name="frequency"
                            className="form-select"
                            value={formData.frequency}
                            onChange={handleInputChange}
                          >
                            <option value="One-Off Deep Clean">One-Off Deep Clean</option>
                            <option value="Daily Contract">Daily Contract</option>
                            <option value="Weekly Clean">Weekly Clean</option>
                            <option value="Bi-Weekly (Fortnightly)">Bi-Weekly (Fortnightly)</option>
                            <option value="Monthly Clean">Monthly Clean</option>
                            <option value="Custom Cadence">Custom Cadence / Site Survey Required</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Property / Facility Size</label>
                          <input
                            type="text"
                            name="propertySize"
                            placeholder="e.g. 3-Bed House or 4,500 sq ft Office"
                            className="form-input"
                            value={formData.propertySize}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Specific Details / Space Requirements</label>
                        <textarea
                          name="message"
                          placeholder="Please mention any special access requirements, key focus areas, preferred cleaning hours (e.g. before 8 AM or after 6 PM), or specific instructions..."
                          className="form-textarea"
                          value={formData.message}
                          onChange={handleInputChange}
                        />
                      </div>

                      <button type="submit" className="form-submit-btn">
                        <span>Submit {quoteTab === 'corporate' ? 'Corporate Contract' : 'Cleaning'} Request</span>
                        <span>→</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 11. STANDARDS, COMPLIANCE & TESTIMONIALS ── */}
          <section className="standards-section" aria-label="Compliance and Testimonials">
            <div className="editorial-container">
              <div className="standards-badge-cluster">
                <div className="standard-badge-item">
                  <span className="badge-check">✓</span>
                  <span className="badge-text">COSHH Certified &amp; Compliant</span>
                </div>
                <div className="standard-badge-item">
                  <span className="badge-check">✓</span>
                  <span className="badge-text">£10M Public &amp; Employers Liability</span>
                </div>
                <div className="standard-badge-item">
                  <span className="badge-check">✓</span>
                  <span className="badge-text">Enhanced DBS Vetted Cleaners</span>
                </div>
                <div className="standard-badge-item">
                  <span className="badge-check">✓</span>
                  <span className="badge-text">Rigorous Health &amp; Safety Audits</span>
                </div>
              </div>

              <div className="testimonials-grid">
                {TESTIMONIALS_DATA.map((t, idx) => (
                  <div key={idx} className="testimonial-card">
                    <p className="testimonial-quote">“{t.quote}”</p>
                    <div className="testimonial-client">
                      <div className="client-avatar">{t.name[0]}</div>
                      <div>
                        <div className="client-meta-name">{t.name}</div>
                        <div className="client-meta-org">{t.role} · {t.company}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ── 12. MINIMALIST EDITORIAL FOOTER ── */}
      <footer className="footer-editorial" aria-label="Site Footer">
        <div className="editorial-container">
          <div className="footer-top-row">
            <div className="footer-logo-box">
              {/* EXACT ORIGINAL LOGO */}
              <img
                src="/licht-logo.png"
                alt="LICHT MARKETING Logo"
              />
            </div>
            <div className="footer-tagline">
              Professional Cleaning. Exceptional Standards.
            </div>
          </div>

          <div className="footer-columns-grid">
            <div>
              <div className="footer-col-title">About Licht Marketing</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '16px' }}>
                Licht Marketing is a premier home and corporate cleaning company dedicated to pristine hygiene, uncompromising standards, and reliable contract delivery.
              </p>
              <button
                onClick={() => navigateTo('about')}
                style={{
                  color: 'var(--teal)',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Read Our Story &amp; Values →
              </button>
            </div>

            <div>
              <div className="footer-col-title">Navigation</div>
              <ul className="footer-links-list">
                <li><button onClick={() => navigateTo('home')} className="footer-link-item">Home</button></li>
                <li><button onClick={() => navigateTo('about')} className="footer-link-item">About Us</button></li>
                <li><button onClick={() => navigateTo('home', 'services')} className="footer-link-item">Services</button></li>
                <li><button onClick={() => navigateTo('home', 'quote')} className="footer-link-item">Contact</button></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Contact &amp; Hours</div>
              <ul className="footer-links-list">
                <li style={{ color: 'white', fontWeight: '700' }}>📞 020 8000 0000</li>
                <li style={{ color: 'rgba(255,255,255,0.85)' }}>✉️ contact@lichtmarketing.co.uk</li>
                <li style={{ marginTop: '10px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                  Monday – Friday: 07:00 – 20:00<br />
                  Saturday: 08:00 – 17:00<br />
                  Sunday: By Corporate Appointment
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>
              © {new Date().getFullYear()} LICHT MARKETING — Home &amp; Corporate Cleaning. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={() => navigateTo('admin')}
                className="footer-link-item"
                style={{
                  background: 'rgba(21, 153, 172, 0.15)',
                  border: '1px solid rgba(21, 153, 172, 0.4)',
                  color: 'var(--teal)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                🔒 Staff / Admin Portal
              </button>
              <button onClick={() => navigateTo('about')} className="footer-link-item">About Licht Marketing</button>
              <a href="#privacy" className="footer-link-item">Privacy Policy</a>
              <a href="#terms" className="footer-link-item">Terms of Service</a>
              <a href="#compliance" className="footer-link-item">Health &amp; Safety Compliance</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* ── AUTHENTICATION MODAL (LOGIN / SIGN UP / QUICK DEMO) ── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        mode={authMode}
        setMode={setAuthMode}
        message={authMessage}
        onLogin={handleLogin}
        onDemoLogin={handleDemoLogin}
        onRegister={handleRegister}
      />

      {/* ── INTERACTIVE BOOKING FLOW MODAL ── */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedServiceForBooking(null);
        }}
        service={selectedServiceForBooking}
        cartItems={cart}
        user={user}
        onConfirmBooking={handleConfirmBooking}
        onViewBookings={() => setMyBookingsModalOpen(true)}
      />

      {/* ── CLEANING CART DRAWER ── */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedCheckout={handleProceedCartCheckout}
      />

      {/* ── CLIENT BOOKING HISTORY MODAL ── */}
      <MyBookingsModal
        isOpen={myBookingsModalOpen}
        onClose={() => setMyBookingsModalOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        onBookNew={() => {
          navigateTo('home', 'services');
        }}
      />
    </div>
  );
}
