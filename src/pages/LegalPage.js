/**
 * @file LegalPage.js
 * @description Renders the Privacy Policy or Terms of Service from data/legalData.js.
 *              Any [placeholder] still in the text is highlighted so it is easy
 *              to spot and fill in before going live.
 */

import React from 'react';
import './LegalPage.css';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, LEGAL_LAST_UPDATED, COMPANY_DETAILS } from '../data/legalData';

const DOCS = { privacy: PRIVACY_POLICY, terms: TERMS_OF_SERVICE };

/** Wrap [placeholders] in a highlighted <mark> so unfinished details stand out. */
function withPlaceholders(text) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="legal-placeholder" title="To be filled in before going live">{part}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function LegalPage({ page = 'privacy', onNavigate }) {
  const doc = DOCS[page] || PRIVACY_POLICY;
  const other = page === 'privacy' ? { key: 'terms', label: 'Terms of Service' } : { key: 'privacy', label: 'Privacy Policy' };

  return (
    <main className="legal-page">
      <div className="legal-container">
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate && onNavigate('home')}>Home</button>
          <span aria-hidden="true">/</span>
          <span>{doc.title}</span>
        </nav>

        <header className="legal-header">
          <h1 className="legal-title">{doc.title}</h1>
          <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED}</p>
          <p className="legal-intro">{withPlaceholders(doc.intro)}</p>
        </header>

        <div className="legal-layout">
          <aside className="legal-toc" aria-label="Contents">
            <div className="legal-toc-title">Contents</div>
            <ol>
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${page}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`legal-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {s.title.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal-body">
            {doc.sections.map((s) => (
              <section key={s.id} id={`legal-${s.id}`} className="legal-section" aria-labelledby={`legal-h-${s.id}`}>
                <h2 id={`legal-h-${s.id}`}>{s.title}</h2>
                {s.body.map((block, i) =>
                  typeof block === 'string' ? (
                    <p key={i}>{withPlaceholders(block)}</p>
                  ) : (
                    <ul key={i}>
                      {block.list.map((item, j) => (
                        <li key={j}>{withPlaceholders(item)}</li>
                      ))}
                    </ul>
                  )
                )}
              </section>
            ))}

            <div className="legal-footer-box">
              <p>
                Questions? Email{' '}
                <a href={`mailto:${COMPANY_DETAILS.email}`}>{COMPANY_DETAILS.email}</a>.
              </p>
              <p>
                See also our{' '}
                <button type="button" className="legal-inline-link" onClick={() => onNavigate && onNavigate(other.key)}>
                  {other.label}
                </button>
                .
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
