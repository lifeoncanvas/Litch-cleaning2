import React, { useState, useEffect } from 'react';
import './Admin.css';

// Spring Boot Backend API Integration
import {
  checkBackendHealth,
  apiAdminLogin,
  apiLogout,
  apiFetchAllBookings,
  apiCreateBooking,
  apiDispatchBooking,
  apiCompleteBooking,
  apiCancelBooking,
  apiFetchOperatives,
  apiUpdateOperativeStatus,
  apiFetchQuotes,
} from './services/api';

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

/* Initial Registered Users / Clients */
const INITIAL_USERS = [
  { id: 'usr_1', name: 'Marcus Shaw', email: 'admin@lichtmarketinglimited.org', role: 'ROLE_ADMIN', company: 'Licht Marketing Limited', phone: '+44 20 8000 8899', joined: '10/01/2026' },
  { id: 'usr_2', name: 'Alex Vance', email: 'alex.vance@ventureoffices.co.uk', role: 'ROLE_CLIENT', company: 'Venture Offices Group', phone: '+44 20 7946 0912', joined: '15/02/2026' },
  { id: 'usr_3', name: 'Sarah Sterling', email: 's.sterling@pentacapital.co.uk', role: 'ROLE_CLIENT', company: 'Penta Capital', phone: '+44 20 7946 0881', joined: '01/03/2026' },
  { id: 'usr_4', name: 'Lord Julian Montgomery', email: 'julian.montgomery@chelsea-estates.co.uk', role: 'ROLE_CLIENT', company: 'Chelsea Estates', phone: '+44 20 7946 0553', joined: '12/03/2026' },
  { id: 'usr_5', name: 'Clara Oswald', email: 'clara.oswald@tardis-solutions.co.uk', role: 'ROLE_CLIENT', company: 'Tardis Solutions', phone: '+44 7700 900888', joined: '25/10/2026' },
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

  // Backend Health & Inbound Quotes State
  const [backendStatus, setBackendStatus] = useState({ online: false, port: 8081 });
  const [quotes, setQuotes] = useState([]);

  // Tab State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'cleaners' | 'fleet' | 'quotes' | 'users' | 'overview'

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

  const [fleet, setFleet] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_admin_fleet');
      return stored ? JSON.parse(stored) : INITIAL_FLEET;
    } catch (e) {
      return INITIAL_FLEET;
    }
  });

  const [usersList, setUsersList] = useState(() => {
    try {
      const stored = localStorage.getItem('licht_admin_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
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

  // Management Modals: Create Booking, Add Operative, Add Fleet Vehicle
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

  const [createOperativeModalOpen, setCreateOperativeModalOpen] = useState(false);
  const [newOperativeForm, setNewOperativeForm] = useState({
    name: '',
    role: 'Lead Deep Clean Specialist',
    phone: '+44 7700 900',
    dbs: 'DBS-GB-' + Math.floor(100000 + Math.random() * 900000) + ' (Verified)',
    status: 'available',
  });

  const [createFleetModalOpen, setCreateFleetModalOpen] = useState(false);
  const [newFleetForm, setNewFleetForm] = useState({
    name: '',
    reg: '',
    status: 'Depot Ready',
    equipment: 'Industrial HEPA Rig + Pure Water Extraction',
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('licht_admin_fleet', JSON.stringify(fleet));
    } catch (e) {}
  }, [fleet]);

  useEffect(() => {
    try {
      localStorage.setItem('licht_admin_users', JSON.stringify(usersList));
    } catch (e) {}
  }, [usersList]);
  useEffect(() => {
    try {
      localStorage.setItem('licht_admin_operatives', JSON.stringify(operatives));
    } catch (e) {}
  }, [operatives]);

  // Initial Data Sync from Spring Boot Backend
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendStatus({ online: res.online, port: res.data?.port || 8081 });
    });

    apiFetchAllBookings().then((b) => {
      if (b && b.length > 0) setBookings(b);
    });

    apiFetchOperatives().then((ops) => {
      if (ops && ops.length > 0) setOperatives(ops);
    });

    apiFetchQuotes().then((q) => {
      if (q && q.length > 0) setQuotes(q);
    });
  }, [adminUser]);

  // Handle Admin Login (Spring Boot Backend API)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    try {
      const res = await apiAdminLogin(adminEmail, adminPassword);
      if (res && res.success && res.user) {
        setAdminUser(res.user);
        localStorage.setItem('licht_admin_auth', JSON.stringify(res.user));
        return;
      }
    } catch (err) {}

    // Fallback if backend is offline
    if ((adminEmail === 'admin@lichtmarketinglimited.org' || adminEmail === 'info@lichtmarketinglimited.org' || adminEmail === 'admin@lichtmarketing.co.uk') && adminPassword === 'admin123') {
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

  const handleQuickDemoAdminLogin = async () => {
    try {
      const res = await apiAdminLogin('admin@lichtmarketinglimited.org', 'admin123');
      if (res && res.success && res.user) {
        setAdminUser(res.user);
        localStorage.setItem('licht_admin_auth', JSON.stringify(res.user));
        return;
      }
    } catch (e) {}

    const admin = {
      name: 'Marcus Shaw',
      role: 'Operations Director',
      email: 'admin@lichtmarketinglimited.org',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAdminUser(admin);
    localStorage.setItem('licht_admin_auth', JSON.stringify(admin));
  };

  const handleAdminLogout = () => {
    apiLogout();
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

  const confirmDispatchAndStartBooking = async () => {
    if (!selectedBookingForDispatch) return;

    const chosenCleaner = operatives.find(o => o.id === assignedCleanerId);
    const chosenVan = INITIAL_FLEET.find(v => v.id === assignedVanId);

    try {
      await apiDispatchBooking(selectedBookingForDispatch.id, {
        cleanerId: assignedCleanerId,
        vanId: assignedVanId,
        eta: dispatchEta,
      });
    } catch (e) {}

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
  const handleMarkCompleted = async (bookingId) => {
    const target = bookings.find(b => b.id === bookingId);
    try {
      await apiCompleteBooking(bookingId);
    } catch (e) {}

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
  const handleToggleOperativeStatus = async (operativeId, newStatus) => {
    try {
      await apiUpdateOperativeStatus(operativeId, newStatus);
    } catch (e) {}
    setOperatives(prev => prev.map(o => o.id === operativeId ? { ...o, status: newStatus } : o));
  };

  // Add / Create New Booking (Manual, Phone, Corporate Contract)
  const handleCreateNewBooking = async (e) => {
    e.preventDefault();
    if (!newBookingForm.clientName || !newBookingForm.clientEmail || !newBookingForm.address) {
      alert('Please fill in required fields: Client Name, Email, and Premises Address.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: `LICHT-BK-${randomSuffix}`,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: newBookingForm.paymentMethod,
      paidAmount: parseFloat(newBookingForm.totalPrice) || 280,
      totalPrice: parseFloat(newBookingForm.totalPrice) || 280,
      serviceName: newBookingForm.serviceName,
      serviceId: newBookingForm.serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      serviceImg: '/service_office.jpg',
      frequency: newBookingForm.frequency,
      propertySize: newBookingForm.propertySize,
      date: newBookingForm.date,
      timeSlot: newBookingForm.timeSlot,
      address: newBookingForm.address,
      notes: newBookingForm.notes || 'Manual administrative booking. Standard key collection protocol.',
      clientName: newBookingForm.clientName,
      clientEmail: newBookingForm.clientEmail,
      createdAt: new Date().toLocaleDateString('en-GB'),
      status: 'Confirmed & Scheduled (Paid)',
      assignedCleaner: null,
      assignedVan: null,
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

  // Cancel / Delete Booking
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

  // Quick Direct Status Update
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('licht_bookings', JSON.stringify(updated));
    if (onBookingUpdate) onBookingUpdate();
  };

  // Onboard New Operative
  const handleCreateOperative = (e) => {
    e.preventDefault();
    if (!newOperativeForm.name || !newOperativeForm.phone) {
      alert('Please fill in operative name and phone number.');
      return;
    }

    const newOp = {
      id: `OP-${Math.floor(100 + Math.random() * 900)}`,
      name: newOperativeForm.name,
      role: newOperativeForm.role,
      phone: newOperativeForm.phone,
      dbs: newOperativeForm.dbs,
      rating: 5.0,
      jobsCompleted: 0,
      status: newOperativeForm.status,
      currentJobId: null,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    };

    const updated = [...operatives, newOp];
    setOperatives(updated);
    localStorage.setItem('licht_admin_operatives', JSON.stringify(updated));
    setCreateOperativeModalOpen(false);
    setNewOperativeForm({
      name: '',
      role: 'Lead Deep Clean Specialist',
      phone: '+44 7700 900',
      dbs: 'DBS-GB-' + Math.floor(100000 + Math.random() * 900000) + ' (Verified)',
      status: 'available',
    });
  };

  // Delete Operative
  const handleDeleteOperative = (opId) => {
    if (!window.confirm('Are you sure you want to remove this operative from staff roster?')) return;
    const updated = operatives.filter(o => o.id !== opId);
    setOperatives(updated);
    localStorage.setItem('licht_admin_operatives', JSON.stringify(updated));
  };

  // Register New Fleet Vehicle
  const handleCreateFleetVehicle = (e) => {
    e.preventDefault();
    if (!newFleetForm.name || !newFleetForm.reg) {
      alert('Please specify van name and vehicle registration plate.');
      return;
    }

    const newVan = {
      id: `VAN-${fleet.length + 1}`,
      name: newFleetForm.name,
      reg: newFleetForm.reg.toUpperCase(),
      status: newFleetForm.status,
      equipment: newFleetForm.equipment,
    };

    const updated = [...fleet, newVan];
    setFleet(updated);
    localStorage.setItem('licht_admin_fleet', JSON.stringify(updated));
    setCreateFleetModalOpen(false);
    setNewFleetForm({
      name: '',
      reg: '',
      status: 'Depot Ready',
      equipment: 'Industrial HEPA Rig + Pure Water Extraction',
    });
  };

  // Toggle Fleet Status
  const handleToggleFleetStatus = (vanId, newStatus) => {
    const updated = fleet.map(v => v.id === vanId ? { ...v, status: newStatus } : v);
    setFleet(updated);
    localStorage.setItem('licht_admin_fleet', JSON.stringify(updated));
  };

  // Convert Quote Lead into Live Booking
  const handleConvertQuoteToBooking = (quote) => {
    setNewBookingForm({
      clientName: quote.name || '',
      clientEmail: quote.email || '',
      phone: quote.phone || '',
      serviceName: quote.serviceType || 'Corporate & Office Cleaning',
      frequency: quote.frequency || 'One-Off Deep Clean',
      propertySize: quote.propertySize || 'Standard Premises (1,500-3,500 sq ft)',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: 'Morning Window (08:00 – 12:00)',
      address: quote.postcode ? `London premises (${quote.postcode})` : 'Central London, UK',
      totalPrice: 320,
      paymentMethod: 'Corporate Invoice Net-30',
      notes: `Converted from inbound inquiry #${quote.id}. Notes: ${quote.message || 'No additional specifications.'}`,
    });
    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted to Booking' } : q));
    setCreateBookingModalOpen(true);
  };

  // Mark Quote as Contacted
  const handleMarkQuoteContacted = (quoteId) => {
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Contacted / Offer Sent' } : q));
  };

  // Delete Quote
  const handleDeleteQuote = (quoteId) => {
    if (!window.confirm('Delete this quote enquiry?')) return;
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  };

  // Delete / Remove User
  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    setUsersList(prev => prev.filter(u => u.id !== userId));
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
                placeholder="admin@lichtmarketinglimited.org"
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
                Hint: <code>admin@lichtmarketinglimited.org</code> / <code>admin123</code>
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
          {/* Live Spring Boot Backend Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '20px',
              background: backendStatus.online ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: backendStatus.online ? '#22c55e' : '#ef4444',
              border: `1px solid ${backendStatus.online ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
            title={backendStatus.online ? 'Spring Boot REST API is running and connected to MySQL licht_cleaning_db' : 'Connecting to Spring Boot REST API (:8081)...'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus.online ? '#22c55e' : '#ef4444',
                boxShadow: backendStatus.online ? '0 0 6px #22c55e' : 'none',
              }}
            />
            <span>API :8081 {backendStatus.online ? 'Connected' : 'Offline'}</span>
          </div>

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
          <span className="admin-tab-count">{fleet.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('quotes');
            apiFetchQuotes().then(setQuotes);
          }}
        >
          <span>📨 Inbound Quotes</span>
          <span className="admin-tab-count">{quotes.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span>👤 Client &amp; Staff Users</span>
          <span className="admin-tab-count">{usersList.length}</span>
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
                  <option value="confirmed">Confirmed (Paid)</option>
                  <option value="dispatched">In Progress / Dispatched</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                      const isCancelled = (b.status || '').toLowerCase().includes('cancel');

                      return (
                        <tr key={b.id} style={{ opacity: isCancelled ? 0.6 : 1 }}>
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
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                background: isCompleted ? '#f0fdf4' : isDispatched ? '#f0fdfa' : isCancelled ? '#fef2f2' : '#f8fafc',
                                color: isCompleted ? '#166534' : isDispatched ? '#0f766e' : isCancelled ? '#991b1b' : '#1e293b',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="Confirmed & Scheduled (Paid)">● Paid &amp; Scheduled</option>
                              <option value="In Progress (Team Dispatched)">🚀 In Progress</option>
                              <option value="Completed & Verified">✓ Completed</option>
                              <option value="Cancelled">✕ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            {b.assignedCleaner ? (
                              <div>
                                <strong style={{ color: 'var(--navy)' }}>{b.assignedCleaner}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>{b.assignedVan || 'Van 1'}</div>
                              </div>
                            ) : (
                              <span style={{ color: isCancelled ? '#94a3b8' : '#ea580c', fontSize: '0.75rem', fontWeight: 600 }}>
                                {isCancelled ? '—' : '⚠️ Needs Operative'}
                              </span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--navy)', fontSize: '0.95rem' }}>£{b.totalPrice || b.paidAmount}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-mid)' }}>inc. VAT</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {!isCompleted && !isDispatched && !isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => openDispatchModal(b)}
                                  className="booking-action-btn dispatch"
                                  title="Assign cleaner and start cleaning"
                                >
                                  🚀 Start
                                </button>
                              )}

                              {isDispatched && !isCompleted && !isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(b.id)}
                                  className="booking-action-btn"
                                  style={{ background: '#16a34a' }}
                                  title="Mark service finished and verified"
                                >
                                  ✓ Finish
                                </button>
                              )}

                              {isCompleted && (
                                <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700, padding: '4px 6px' }}>
                                  ✓ Audited
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => setJobSheetBooking(b)}
                                className="booking-action-btn details"
                                title="View detailed Job Sheet & Access codes"
                              >
                                Sheet
                              </button>

                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="booking-action-btn"
                                  style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.72rem', padding: '4px 8px' }}
                                  title="Cancel Booking"
                                >
                                  ✕
                                </button>
                              )}
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
                  onClick={() => setCreateOperativeModalOpen(true)}
                  className="admin-submit-btn"
                  style={{ width: 'auto', padding: '10px 18px', margin: 0, background: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>+</span> Add New Operative
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteOperative(op.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove from Roster
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

              <div className="admin-controls-row">
                <button
                  type="button"
                  onClick={() => setCreateFleetModalOpen(true)}
                  className="admin-submit-btn"
                  style={{ width: 'auto', padding: '10px 18px', margin: 0, background: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>+</span> Register Service Van
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {fleet.map((van) => (
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
                  <div style={{ background: 'var(--bg-offwhite)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '14px' }}>
                    <strong>Onboard Equipment:</strong>
                    <div>{van.equipment}</div>
                  </div>

                  <div className="cleaner-status-toggle">
                    <button
                      type="button"
                      className={van.status === 'Depot Ready' ? 'active' : ''}
                      onClick={() => handleToggleFleetStatus(van.id, 'Depot Ready')}
                    >
                      Depot Ready
                    </button>
                    <button
                      type="button"
                      className={van.status === 'On Route' ? 'active' : ''}
                      onClick={() => handleToggleFleetStatus(van.id, 'On Route')}
                    >
                      On Route
                    </button>
                    <button
                      type="button"
                      className={van.status === 'In Maintenance' ? 'active' : ''}
                      onClick={() => handleToggleFleetStatus(van.id, 'In Maintenance')}
                    >
                      Maintenance
                    </button>
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

        {/* ── TAB 4: INBOUND QUOTES ── */}
        {activeTab === 'quotes' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Inbound Quotes &amp; Enquiries</h2>
                <p className="admin-section-subtitle">Real-time quote requests submitted by prospective clients through the web quotation form.</p>
              </div>
              <button
                type="button"
                className="admin-action-btn secondary"
                onClick={() => apiFetchQuotes().then(setQuotes)}
              >
                🔄 Refresh Quotes
              </button>
            </div>

            <div className="admin-table-card">
              {quotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-mid)' }}>
                  No quote enquiries submitted yet. When clients fill out the contact quotation form, they appear here instantly.
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
                        <th>Submitted At</th>
                        <th>Status</th>
                        <th>Lead Actions</th>
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
                            <div style={{ fontSize: '0.82rem' }}>📧 {q.email}</div>
                            {q.phone && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>📞 {q.phone}</div>}
                            {q.postcode && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>📍 {q.postcode}</div>}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-mid)' }}>
                            {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-GB') : 'Today'}
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
                                title="Convert this quote lead into a live booked clean"
                              >
                                Convert to Job →
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

        {/* ── TAB 5: CLIENT & USER ACCOUNTS ── */}
        {activeTab === 'users' && (
          <section>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Registered Clients &amp; System Users</h2>
                <p className="admin-section-subtitle">
                  Inspect user accounts created via registration, track active commercial clients, and manage user roles.
                </p>
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
                      <th>System Role</th>
                      <th>Joined Date</th>
                      <th>Security Status</th>
                      <th>Manage Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)' }}>{u.id}</td>
                        <td>
                          <strong>{u.name}</strong>
                          {u.company && <div style={{ fontSize: '0.78rem', color: 'var(--slate-mid)' }}>{u.company}</div>}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{u.email}</div>
                        </td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span className={`booking-status-pill ${u.role === 'ROLE_ADMIN' ? 'completed' : 'confirmed'}`}>
                            {u.role === 'ROLE_ADMIN' ? '🛡️ Director (Admin)' : '👤 Client Partner'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--slate-mid)' }}>{u.joined || 'Active'}</td>
                        <td>
                          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                            ✓ Active &amp; Verified
                          </span>
                        </td>
                        <td>
                          {u.role !== 'ROLE_ADMIN' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              style={{
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✕ Remove
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Primary Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 5: OVERVIEW ── */}
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
                {fleet.map(van => (
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

      {/* ==========================================================================
         MODAL 1: CREATE NEW BOOKING (MANUAL / PHONE / CONTRACT)
         ========================================================================== */}
      {createBookingModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setCreateBookingModalOpen(false)}>
          <div className="admin-modal-box large-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">📝 Create New Booking (Manual / Phone / Contract)</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCreateBookingModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewBooking}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. Victoria Chambers"
                    value={newBookingForm.clientName}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, clientName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Client Email *</label>
                  <input
                    type="email"
                    required
                    className="admin-form-input"
                    placeholder="e.g. victoria@company.co.uk"
                    value={newBookingForm.clientEmail}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, clientEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="admin-form-input"
                    placeholder="e.g. +44 20 8123 4567"
                    value={newBookingForm.phone}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, phone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Service Type *</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.serviceName}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, serviceName: e.target.value })}
                  >
                    <option value="Corporate & Office Cleaning">Corporate &amp; Office Cleaning</option>
                    <option value="Commercial Floor & Carpet Restoration">Commercial Floor &amp; Carpet Restoration</option>
                    <option value="Post-Construction Deep Clean">Post-Construction Deep Clean</option>
                    <option value="Bio-Sanitisation & Infection Control">Bio-Sanitisation &amp; Infection Control</option>
                    <option value="Home & Residential Cleaning">Home &amp; Residential Cleaning</option>
                    <option value="Specialist Window & High-Level Glass">Specialist Window &amp; High-Level Glass</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Service Frequency *</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.frequency}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, frequency: e.target.value })}
                  >
                    <option value="One-Off Deep Clean">One-Off Deep Clean</option>
                    <option value="Weekly Contract">Weekly Contract</option>
                    <option value="Fortnightly Service">Fortnightly Service</option>
                    <option value="Monthly Maintenance">Monthly Maintenance</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Premises Scale *</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.propertySize}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, propertySize: e.target.value })}
                  >
                    <option value="Standard Premises (1,500-3,500 sq ft)">Standard Premises (1,500-3,500 sq ft)</option>
                    <option value="Compact (Under 1,500 sq ft)">Compact (Under 1,500 sq ft)</option>
                    <option value="Large Complex (3,500+ sq ft)">Large Complex (3,500+ sq ft)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    className="admin-form-input"
                    value={newBookingForm.date}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, date: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Time Window *</label>
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
                <label className="admin-form-label">Premises Address (Street, City, Postcode) *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. 50 Grosvenor Square, Mayfair, London, W1K 2HP"
                  value={newBookingForm.address}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Agreed Total Price (£ inc. VAT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="admin-form-input"
                    value={newBookingForm.totalPrice}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, totalPrice: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Payment Method *</label>
                  <select
                    className="admin-form-input"
                    value={newBookingForm.paymentMethod}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, paymentMethod: e.target.value })}
                  >
                    <option value="Corporate Invoice Net-30">Corporate Invoice Net-30</option>
                    <option value="Credit / Debit Card (Paid)">Credit / Debit Card (Paid)</option>
                    <option value="BACS Direct Bank Transfer">BACS Direct Bank Transfer</option>
                    <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Access Instructions / Key Codes / Special Notes</label>
                <textarea
                  className="admin-form-input"
                  rows={2}
                  placeholder="e.g. Key safe on reception entrance. Alarm code #4491. Loading bay access."
                  value={newBookingForm.notes}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, notes: e.target.value })}
                />
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
                  Create &amp; Add to Queue →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL 2: ONBOARD NEW OPERATIVE
         ========================================================================== */}
      {createOperativeModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setCreateOperativeModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">👥 Onboard New Cleaning Operative</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCreateOperativeModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOperative}>
              <div className="admin-form-group">
                <label className="admin-form-label">Operative Full Name *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. Jordan Matthews"
                  value={newOperativeForm.name}
                  onChange={(e) => setNewOperativeForm({ ...newOperativeForm, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Role / Specialisation *</label>
                <select
                  className="admin-form-input"
                  value={newOperativeForm.role}
                  onChange={(e) => setNewOperativeForm({ ...newOperativeForm, role: e.target.value })}
                >
                  <option value="Lead Deep Clean Specialist">Lead Deep Clean Specialist</option>
                  <option value="Commercial Floor & Carpet Lead">Commercial Floor &amp; Carpet Lead</option>
                  <option value="Bio-Sanitisation & Infection Control Tech">Bio-Sanitisation &amp; Infection Control Tech</option>
                  <option value="High-Level Glass & Specialist Tech">High-Level Glass &amp; Specialist Tech</option>
                  <option value="Domestic & Turnover Specialist">Domestic &amp; Turnover Specialist</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  className="admin-form-input"
                  placeholder="e.g. +44 7700 900555"
                  value={newOperativeForm.phone}
                  onChange={(e) => setNewOperativeForm({ ...newOperativeForm, phone: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">DBS Certificate Verification Code *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  value={newOperativeForm.dbs}
                  onChange={(e) => setNewOperativeForm({ ...newOperativeForm, dbs: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Initial Standby Status</label>
                <select
                  className="admin-form-input"
                  value={newOperativeForm.status}
                  onChange={(e) => setNewOperativeForm({ ...newOperativeForm, status: e.target.value })}
                >
                  <option value="available">Available (On Standby)</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCreateOperativeModalOpen(false)}
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
                  Register Operative →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL 3: REGISTER NEW FLEET VEHICLE
         ========================================================================== */}
      {createFleetModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setCreateFleetModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">🚐 Register Service Van</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCreateFleetModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFleetVehicle}>
              <div className="admin-form-group">
                <label className="admin-form-label">Van Name / Territorial Unit *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. Van 4 (Canary Wharf & Docklands Unit)"
                  value={newFleetForm.name}
                  onChange={(e) => setNewFleetForm({ ...newFleetForm, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Vehicle Registration Plate *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. LN74 FGT"
                  value={newFleetForm.reg}
                  onChange={(e) => setNewFleetForm({ ...newFleetForm, reg: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Initial Status</label>
                <select
                  className="admin-form-input"
                  value={newFleetForm.status}
                  onChange={(e) => setNewFleetForm({ ...newFleetForm, status: e.target.value })}
                >
                  <option value="Depot Ready">Depot Ready</option>
                  <option value="On Route">On Route</option>
                  <option value="In Maintenance">In Maintenance</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Onboard Rig &amp; Equipment Specifications *</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  value={newFleetForm.equipment}
                  onChange={(e) => setNewFleetForm({ ...newFleetForm, equipment: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCreateFleetModalOpen(false)}
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
                  Register Vehicle →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
