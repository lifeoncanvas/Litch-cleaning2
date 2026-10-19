/**
 * @file AboutPage.js
 * @description Editorial About Us Page for Licht Marketing.
 *              Showcases core disciplines, "Why Us" concentric radial orbit hub,
 *              asymmetrical operational capabilities mosaic, and bespoke specifications highlight.
 * @author Licht Marketing Engineering
 */

import React from 'react';
import { SERVICES_DATA } from '../data/servicesData';

/**
 * AboutPage Component
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback for switching pages/sections
 * @param {Function} props.onInitiateBooking - Direct booking callback for service items
 */
export default function AboutPage({ onNavigate, onInitiateBooking }) {
  return (
    <div className="about-ref-page">
      <div className="editorial-container">
        {/* ── 1. Top Section: Split with Discipline List & High-Impact Portrait ── */}
        <section className="about-ref-hero-grid" aria-label="About Licht Marketing">
          <div className="about-ref-hero-left">
            <h1 className="about-ref-title">
              THE STANDARD OF<br />
              EXCEPTIONAL<br />
              CLEANING
            </h1>

            <div className="about-ref-list-kicker">OUR CORE DISCIPLINES</div>

            <div className="about-ref-list">
              {/* Corporate Facilities Item */}
              <div
                className="about-ref-list-item"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onInitiateBooking
                    ? onInitiateBooking(SERVICES_DATA[0])
                    : onNavigate('home', 'services')
                }
                title="Book Corporate Facilities Cleaning"
              >
                <div className="ref-item-left">
                  <img
                    src="/service_office.jpg"
                    alt="Corporate Facilities Cleaning"
                    className="ref-item-thumb"
                  />
                  <div>
                    <div className="ref-item-title">Corporate Facilities</div>
                  </div>
                </div>
                <div className="ref-item-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ref-item-badge">From £180</span>
                  <div className="ref-item-arrow">›</div>
                </div>
              </div>

              {/* Residential Housekeeping Item */}
              <div
                className="about-ref-list-item"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onInitiateBooking
                    ? onInitiateBooking(SERVICES_DATA[1])
                    : onNavigate('home', 'services')
                }
                title="Book Residential Housekeeping"
              >
                <div className="ref-item-left">
                  <img
                    src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80"
                    alt="Residential Housekeeping"
                    className="ref-item-thumb"
                  />
                  <div>
                    <div className="ref-item-title">Residential Housekeeping</div>
                  </div>
                </div>
                <div className="ref-item-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ref-item-badge">From £95</span>
                  <div className="ref-item-arrow">›</div>
                </div>
              </div>

              {/* Care & Supported Living Item */}
              <div
                className="about-ref-list-item"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onInitiateBooking
                    ? onInitiateBooking(SERVICES_DATA[3])
                    : onNavigate('home', 'services')
                }
                title="Book Care & Supported Living"
              >
                <div className="ref-item-left">
                  <img
                    src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80"
                    alt="Care & Supported Living"
                    className="ref-item-thumb"
                  />
                  <div>
                    <div className="ref-item-title">Care &amp; Supported Living</div>
                  </div>
                </div>
                <div className="ref-item-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ref-item-badge">From £220</span>
                  <div className="ref-item-arrow">›</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('home', 'services')}
              className="about-ref-view-all"
            >
              VIEW ALL SERVICES →
            </button>
          </div>

          <div className="about-ref-hero-right">
            <div className="about-ref-portrait-card">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                alt="Uniformed professional cleaner inspecting pristine corporate desk"
                className="ref-portrait-img"
              />

              {/* Floating Accreditation Pill */}
              <div className="ref-floating-search-pill">
                <span>🔍 Accredited Hygiene Operations | London &amp; UK</span>
                <span style={{ cursor: 'pointer', opacity: 0.6 }}>✕</span>
              </div>

              {/* Bottom Operational Badges */}
              <div className="ref-floating-bottom-pills">
                <div className="ref-bottom-pill">
                  <span>📞 Direct Operations Team</span>
                </div>
                <div className="ref-bottom-pill">
                  <span>🛡️ 100% DBS Vetted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. "WHY US?" Concentric Radial Orbit Hub Section ── */}
        <section className="about-why-orbit-section" aria-label="Why Choose Us">
          <div className="why-orbit-container">
            {/* Center concentric pulse circle */}
            <div className="why-orbit-center-hub">
              <div className="orbit-concentric-ring-1" />
              <div className="orbit-concentric-ring-2" />
              <div className="why-orbit-headline">
                WHY<br />US?
              </div>
            </div>

            {/* 4 Satellite Pillar Cards */}
            <div className="why-orbit-card card-tl">
              <div className="card-top-header">
                <h3 className="card-orbit-title">Qualified Personnel</h3>
                <span className="card-step-num">01</span>
              </div>
              <p className="card-orbit-desc">
                100% directly employed, background-checked, and rigorously trained in modern hygiene protocols and corporate etiquette.
              </p>
            </div>

            <div className="why-orbit-card card-bl">
              <div className="card-top-header">
                <h3 className="card-orbit-title">Quality &amp; Consistency</h3>
                <span className="card-step-num">02</span>
              </div>
              <p className="card-orbit-desc">
                Multi-point digital checklists, regular supervisory audits, and transparent reporting ensuring contractual SLAs are surpassed.
              </p>
            </div>

            <div className="why-orbit-card card-tr">
              <div className="card-top-header">
                <h3 className="card-orbit-title">Seamless Reliability</h3>
                <span className="card-step-num">03</span>
              </div>
              <p className="card-orbit-desc">
                Punctual attendance with guaranteed replacement cover in place so your home or office is never left unserviced.
              </p>
            </div>

            <div className="why-orbit-card card-br">
              <div className="card-top-header">
                <h3 className="card-orbit-title">Certified COSHH Standards</h3>
                <span className="card-step-num">04</span>
              </div>
              <p className="card-orbit-desc">
                Hospital-grade disinfection paired with non-toxic, eco-responsible formulations that protect indoor air quality.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. Asymmetrical Editorial Operational Gallery / Mosaic ── */}
        <section className="about-mosaic-section" aria-label="Operational Capabilities">
          <div className="about-mosaic-header">
            <span className="mosaic-tab-active">Commercial &amp; Corporate</span>
            <span className="mosaic-tab-separator">/</span>
            <span className="mosaic-tab-inactive">Residential Living</span>
          </div>

          {/* Top Mosaic Row */}
          <div className="mosaic-top-grid">
            <div className="mosaic-card mosaic-tall-card">
              <img
                src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80"
                alt="Commercial glass cleaning in high-rise reception"
                className="mosaic-img"
              />
              <div className="mosaic-card-gradient" />
              <div className="mosaic-card-content">
                <span className="mosaic-label">Commercial Glass Maintenance</span>
                <div className="mosaic-arrow-btn">›</div>
              </div>
            </div>

            <div className="mosaic-card mosaic-tall-card">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                alt="Corporate desk touchpoint sanitisation"
                className="mosaic-img"
              />
              <div className="mosaic-card-gradient" />
              <div className="mosaic-card-content">
                <span className="mosaic-label">Desk &amp; Touchpoint Sanitisation</span>
                <div className="mosaic-arrow-btn">›</div>
              </div>
            </div>

            <div className="mosaic-stacked-col">
              <div className="mosaic-card mosaic-short-card">
                <img
                  src="https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&w=800&q=80"
                  alt="Industrial carpet vacuuming"
                  className="mosaic-img"
                />
                <div className="mosaic-card-gradient" />
                <div className="mosaic-card-content">
                  <span className="mosaic-label">High-Traffic Carpet Care</span>
                  <div className="mosaic-arrow-btn">›</div>
                </div>
              </div>

              <div className="mosaic-card mosaic-short-card">
                <img
                  src="https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80"
                  alt="Kitchen counter disinfection"
                  className="mosaic-img"
                />
                <div className="mosaic-card-gradient" />
                <div className="mosaic-card-content">
                  <span className="mosaic-label">Kitchen &amp; Communal Areas</span>
                  <div className="mosaic-arrow-btn">›</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Mosaic Row */}
          <div className="mosaic-bottom-grid">
            <div className="mosaic-card mosaic-bottom-card">
              <img
                src="https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80"
                alt="Deep washroom tile cleaning"
                className="mosaic-img"
              />
              <div className="mosaic-card-gradient" />
              <div className="mosaic-card-content">
                <span className="mosaic-label">Washroom &amp; Tile Hygiene</span>
                <div className="mosaic-arrow-btn">›</div>
              </div>
            </div>

            <div className="mosaic-card mosaic-bottom-card">
              <img
                src="/service_floor.jpg"
                alt="Industrial rotary floor polishing buffer"
                className="mosaic-img"
              />
              <div className="mosaic-card-gradient" />
              <div className="mosaic-card-content">
                <span className="mosaic-label">Specialist Hard-Floor Polishing</span>
                <div className="mosaic-arrow-btn">›</div>
              </div>
            </div>

            <div
              className="mosaic-white-action-card"
              onClick={() => onNavigate('home', 'services')}
              role="button"
              tabIndex={0}
            >
              <div className="white-action-title">
                Explore Full Service Portfolio →
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-mid)', marginTop: '8px' }}>
                Bespoke cleaning plans engineered for modern corporate workplaces and luxury private residences.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. Circular Highlight / Detailed Feature Section ── */}
        <section className="about-circular-highlight-section" aria-label="Bespoke Specifications">
          <div className="circular-highlight-grid">
            <div className="circular-hl-left">
              <h2 className="circular-hl-title">
                TAILORED<br />CLEANING PLANS
              </h2>

              <div className="circular-hl-pills">
                <span className="hl-pills-label">Who It's For:</span>
                <span className="hl-pill-item">🏢 Corporate Headquarters &amp; Offices</span>
                <span className="hl-pill-item">🏡 Discerning Private Residences</span>
                <span className="hl-pill-item">🩺 Care Homes &amp; Clinical Facilities</span>
              </div>
            </div>

            <div className="circular-hl-center">
              <div className="circular-photo-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"
                  alt="Detailed cleaning inspection in progress"
                  className="circular-photo-img"
                />
                <div className="circular-photo-badge">✦</div>
              </div>
            </div>

            <div className="circular-hl-right">
              <p className="circular-hl-desc">
                We engineer individualized cleaning specifications calibrated to the footfall, surface materials, and regulatory standards of your environment — ensuring immaculate presentation and documented hygiene compliance.
              </p>

              <button
                onClick={() => onNavigate('home', 'quote')}
                className="circular-hl-link"
              >
                REQUEST BESPOKE SPECIFICATION →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
