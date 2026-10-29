/**
 * @file servicesData.js
 * @description Catalog of commercial, residential, and specialist cleaning services,
 *              plus sector definitions for Licht Marketing.
 * @author Licht Marketing Engineering
 */

/**
 * Primary cleaning services offered by Licht Marketing.
 * Includes rates, pricing tiers, badges, and high-resolution Unsplash photo references.
 */
export const SERVICES_DATA = [
  {
    id: 'corporate',
    category: 'corporate',
    title: 'Corporate & Office Cleaning',
    badge: 'Popular',
    pricingNote: 'Small office or initial cleaning visit',
    desc: 'Small office or initial cleaning visit. Daily and scheduled cleaning for modern workplaces, corporate boardrooms, and commercial facilities.',
    price: 180,
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'residential',
    category: 'residential',
    title: 'Home & Residential Cleaning',
    badge: 'Core Service',
    pricingNote: 'Small property or minimum booking',
    desc: 'Small property or minimum booking. Bespoke domestic housekeeping for spotless living spaces, luxury kitchens, and revitalised bathrooms.',
    price: 95,
    img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'commercial',
    category: 'corporate',
    title: 'Commercial & Retail Cleaning',
    badge: 'High Impact',
    pricingNote: 'Small retail or commercial premises',
    desc: 'Small retail or commercial premises. High-standard cleaning for luxury retail showrooms, commercial premises, and customer venues.',
    price: 150,
    img: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'care',
    category: 'specialist',
    title: 'Care & Supported Living',
    badge: 'Strict Protocol',
    pricingNote: 'Subject to site assessment and cleaning requirements',
    desc: 'Subject to site assessment and cleaning requirements. Specialist hygiene regimes adhering to rigorous UK infection control and sanitisation standards.',
    price: 220,
    img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'deep-clean',
    category: 'specialist',
    title: 'Deep & Specialist Cleaning',
    badge: 'Specialist',
    pricingNote: 'Based on area and type of specialist cleaning',
    desc: 'Based on area and type of specialist cleaning. Intensive restorative cleaning for carpets, upholstery, tile grout, and hard surfaces.',
    price: 240,
    img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'contract',
    category: 'corporate',
    title: 'Ongoing Contract Cleaning',
    badge: 'Enterprise',
    pricingNote: 'Starting contract price; specify the billing period',
    desc: 'Starting contract price; specify the billing period. Scheduled commercial contracts with dedicated supervisors, key account managers, and digital audit logs.',
    price: 360,
    img: 'https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'end-of-tenancy',
    category: 'residential',
    title: 'End-of-Tenancy Cleaning',
    badge: 'Guaranteed',
    pricingNote: 'Small property; size and add-ons affect price',
    desc: 'Small property; size and add-ons affect price. Comprehensive inventory-standard cleans designed to pass landlord inspections and guarantee deposit returns.',
    price: 195,
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'post-build',
    category: 'specialist',
    title: 'Post-Construction & Sparkle Clean',
    badge: 'Developer Choice',
    pricingNote: 'Smaller project; final quote based on site condition',
    desc: 'Smaller project; final quote based on site condition. Post-construction fine silica dust extraction, paint residue removal, and sparkle handover clean.',
    price: 280,
    img: '/service_floor.jpg',
  },
];

/**
 * 8 Industry Sectors serviced across Greater London and surrounding counties.
 */
export const SECTORS_DATA = [
  {
    name: 'Private Homes',
    tag: 'Residential',
    img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Corporate Offices',
    tag: 'Workplaces',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Care & Supported Living',
    tag: 'Healthcare',
    img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retail & Showrooms',
    tag: 'Commercial',
    img: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Property Management',
    tag: 'Estates',
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Industrial & Warehouses',
    tag: 'Facilities',
    img: '/service_floor.jpg',
  },
  {
    name: 'Construction & Refurb',
    tag: 'Post-Build',
    img: 'https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Venues & Events',
    tag: 'Hospitality',
    img: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
  },
];
