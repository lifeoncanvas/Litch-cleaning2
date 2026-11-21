/**
 * @file legalData.js
 * @description Content for the Privacy Policy and Terms of Service pages.
 *
 * BEFORE GOING LIVE: fill in every value in COMPANY_DETAILS below (anything still
 * in [square brackets] is shown on the site with a yellow highlight), and have the
 * policies reviewed by a solicitor. Business choices such as the cancellation
 * notice period, late-cancellation fee and data retention periods are defaults —
 * change them here if the business works differently.
 */

export const LEGAL_LAST_UPDATED = '21 November 2026';

export const COMPANY_DETAILS = {
  legalName: 'Licht Marketing Limited',
  tradingName: 'Licht Home & Corporate Cleaning',
  companyNumber: '[Company number]',
  registeredOffice: '[Registered office address]',
  vatNumber: '[VAT number — or remove if not VAT registered]',
  icoNumber: '[ICO registration number]',
  email: 'info@lichtmarketinglimited.org',
  phone: '[Phone number]',
  website: 'https://lichtmarketinglimited.org',
  hostingProvider: '[Website hosting provider]',
};

// Business policy defaults used in the Terms — change here if different.
export const POLICY = {
  freeCancellationHours: 48,
  lateCancellationFeePercent: 50,
  reportIssueHours: 48,
  paymentDueDays: 7,
};

const C = COMPANY_DETAILS;
const P = POLICY;

/*
 * Section format: { id, title, body: [ string | { list: [...] } ] }
 * Strings may contain [placeholders], which the page highlights.
 */
export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  intro: `This policy explains what personal information ${C.legalName} collects when you use ${C.website}, request a quote or book a cleaning service, how we use it, and the rights you have under UK data protection law (the UK GDPR and the Data Protection Act 2018).`,
  sections: [
    {
      id: 'who-we-are',
      title: '1. Who we are',
      body: [
        `${C.legalName} (trading as ${C.tradingName}) is the "controller" of your personal information. We are registered in England and Wales under company number ${C.companyNumber}, with our registered office at ${C.registeredOffice}. Our ICO registration number is ${C.icoNumber}.`,
        `If you have any questions about this policy or your information, email ${C.email} or call ${C.phone}.`,
      ],
    },
    {
      id: 'what-we-collect',
      title: '2. Information we collect',
      body: [
        'We only collect the information we need to answer your enquiry and deliver your cleaning service:',
        {
          list: [
            'Quote and enquiry forms: your name, company (if any), email address, phone number, postcode or location, the service and frequency you are interested in, property size, and any details you choose to give us.',
            'Your account: your name, email address, phone number, and optionally your address and company. Your password is stored only in encrypted (hashed) form — we can never see it.',
            'Bookings: the service, date and time window, property address and postcode, access notes (for example parking or key-safe instructions), your contact details, and the completion PIN for your booking.',
            'Payments: payments are handled by PayPal. We receive confirmation of the payment, the transaction reference, the amount and the payer\'s name and email. We never see or store your card or bank details.',
            'Messages: emails and other messages you send us, and our replies.',
            'Technical information: our servers record your IP address and the time of each request for security and to prevent misuse.',
          ],
        },
        'Please only include access codes or other sensitive details in booking notes if our cleaner needs them to do the job.',
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How we use your information and our legal basis',
      body: [
        {
          list: [
            'To provide quotes, take and manage bookings, send booking and payment emails, and carry out the cleaning — because it is necessary for a contract with you, or to take steps you have asked for before entering one.',
            'To reply to enquiries, keep our services secure, prevent fraud and misuse, and improve our service — because we have a legitimate interest in doing so, and we balance this against your rights.',
            'To keep accounting and tax records — because the law requires it.',
            'To send you marketing — only if you have agreed. You can opt out at any time by replying to any email or contacting us. We do not currently send marketing emails.',
          ],
        },
      ],
    },
    {
      id: 'sharing',
      title: '4. Who we share it with',
      body: [
        'We do not sell your personal information. We share it only where needed:',
        {
          list: [
            'Our cleaning staff assigned to your booking (your name, address, phone number and access notes).',
            'PayPal, to process payments.',
            'Google (Google Workspace), which provides our email service.',
            `Supabase, which hosts our database, and ${C.hostingProvider}, which hosts our website.`,
            'Our professional advisers (such as accountants and lawyers), and the police, courts, HMRC or other authorities when the law requires it.',
          ],
        },
        'Some of these providers may store data outside the UK. Where they do, we rely on UK adequacy regulations or the UK International Data Transfer Agreement/Addendum to keep your information protected.',
      ],
    },
    {
      id: 'retention',
      title: '5. How long we keep it',
      body: [
        {
          list: [
            'Enquiries that do not lead to a booking: 24 months.',
            'Your account: until you ask us to close it, or after 3 years with no activity.',
            'Booking and payment records: 6 years after the end of the financial year they relate to, as required for tax purposes.',
            'Server security logs: 90 days.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '6. Cookies and browser storage',
      body: [
        'We do not use advertising or analytics cookies. Our website stores a small amount of information in your browser\'s local storage that is strictly necessary for it to work — keeping you signed in, remembering your cart, and showing your bookings. Because this is strictly necessary, we do not ask for consent, but you can clear it at any time in your browser settings (you will be signed out).',
        'When you choose to pay, PayPal\'s payment window may set its own cookies, covered by PayPal\'s privacy policy.',
      ],
    },
    {
      id: 'security',
      title: '7. Keeping your information secure',
      body: [
        'Our website uses encrypted connections (HTTPS), passwords are stored in hashed form, and access to customer information is limited to staff who need it. No system is completely secure, so if we ever suffer a breach that is likely to put you at risk, we will tell you and the Information Commissioner\'s Office (ICO) as the law requires.',
      ],
    },
    {
      id: 'your-rights',
      title: '8. Your rights',
      body: [
        'You have the right to:',
        {
          list: [
            'ask for a copy of the information we hold about you;',
            'ask us to correct information that is wrong or incomplete;',
            'ask us to delete your information (we may need to keep some records, such as invoices, for legal reasons);',
            'ask us to restrict or stop using your information, or object to how we use it;',
            'ask for your information in a portable format;',
            'withdraw any consent you have given.',
          ],
        },
        `To use any of these rights, email ${C.email}. We will respond within one month, and there is normally no charge.`,
      ],
    },
    {
      id: 'complaints',
      title: '9. Complaints',
      body: [
        `If you are unhappy with how we have handled your information, please contact us first at ${C.email}. You also have the right to complain to the Information Commissioner's Office: ico.org.uk/make-a-complaint or 0303 123 1113.`,
      ],
    },
    {
      id: 'children',
      title: '10. Children',
      body: ['Our services are for adults. We do not knowingly collect information from anyone under 18.'],
    },
    {
      id: 'changes',
      title: '11. Changes to this policy',
      body: ['We may update this policy from time to time. The date at the top shows when it was last changed. If we make significant changes we will tell customers with an account by email.'],
    },
  ],
};

export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  intro: `These terms apply when you use ${C.website}, request a quote or book a cleaning service with ${C.legalName}. Please read them before booking. By confirming a booking you agree to them.`,
  sections: [
    {
      id: 'website',
      title: '1. Using our website and your account',
      body: [
        {
          list: [
            'Please give us accurate, up-to-date information, including the correct property address and contact number.',
            'Keep your password private. You are responsible for bookings made through your account.',
            'You must not misuse the website — for example by trying to access other people\'s information, interfering with how it works, or submitting false bookings or payments.',
          ],
        },
      ],
    },
    {
      id: 'prices',
      title: '2. Quotes and prices',
      body: [
        {
          list: [
            '"From" prices are starting prices for a small property or initial visit. Your price depends on the service, property size and how often you book, and is shown before you confirm.',
            'Prices include VAT where VAT applies.',
            'Recurring bookings receive a discount (weekly 15%, fortnightly 10%, monthly 5%) for as long as the regular service continues.',
            'If the property is materially larger, or in a substantially different condition, than described, we will tell you a revised price before starting. You may then cancel without charge.',
            'We charge the price stored in our booking system. If a price is shown incorrectly because of an obvious error, we will contact you before carrying out the work.',
          ],
        },
      ],
    },
    {
      id: 'bookings',
      title: '3. Bookings',
      body: [
        'When you submit a booking you are making a request. A contract between us is formed when we confirm the booking, usually when we assign a cleaner. We may decline a booking — for example if we cannot cover the area or date — in which case you will not be charged.',
      ],
    },
    {
      id: 'payment',
      title: '4. Payment',
      body: [
        {
          list: [
            'Nothing is charged when you book. After the cleaning is completed we will send you an invoice and a secure payment link.',
            `Payment is due within ${P.paymentDueDays} days of the invoice, by PayPal or card through PayPal, in pounds sterling (GBP).`,
            'Business customers with a contract may be invoiced on the terms agreed in that contract.',
          ],
        },
      ],
    },
    {
      id: 'completion-pin',
      title: '5. Completion PIN',
      body: [
        'Each booking has a completion PIN. Please give it to your cleaner only when you are satisfied the job has been completed. Sharing the PIN confirms that the service was carried out.',
      ],
    },
    {
      id: 'cancellations',
      title: '6. Changes and cancellations by you',
      body: [
        {
          list: [
            `You can change or cancel a booking free of charge up to ${P.freeCancellationHours} hours before the booked time window.`,
            `If you cancel with less than ${P.freeCancellationHours} hours' notice, or we cannot get access at the booked time, we may charge up to ${P.lateCancellationFeePercent}% of the booking price to cover the cleaner's time.`,
            'Your legal right to cancel (consumers): if you book online as a consumer, you have 14 days from when we confirm your booking to cancel without giving a reason. If you ask us to start the cleaning within those 14 days, you will pay for any service already provided before you cancel, and once the service has been fully completed you lose the right to cancel it.',
          ],
        },
        `To cancel, use "My Bookings" on the website or email ${C.email}.`,
      ],
    },
    {
      id: 'cancellations-by-us',
      title: '7. Changes and cancellations by us',
      body: [
        'We may need to rearrange a booking because of staff illness, severe weather or other events outside our control. We will contact you as soon as possible to offer a new date or, if you prefer, cancel the booking at no cost to you.',
      ],
    },
    {
      id: 'your-responsibilities',
      title: '8. Your responsibilities',
      body: [
        {
          list: [
            'Give our cleaner safe access to the property at the booked time, with running water and electricity.',
            'Tell us in advance about any hazards (for example damaged surfaces, mould or suspected asbestos), pets, and any delicate or high-value items needing special care.',
            'Put away cash, jewellery and other valuables, and any items you do not want moved or cleaned.',
            'Let us know about parking arrangements. Parking charges needed to reach your property may be added to your invoice if agreed in advance.',
          ],
        },
      ],
    },
    {
      id: 'quality',
      title: '9. If you are not happy',
      body: [
        `If any part of the cleaning was not done to the agreed standard, tell us within ${P.reportIssueHours} hours, with photos if possible. We will return to re-clean the affected areas free of charge. This does not affect your legal rights.`,
      ],
    },
    {
      id: 'liability',
      title: '10. Damage and liability',
      body: [
        {
          list: [
            `Please report any damage you believe we caused within ${P.reportIssueHours} hours so that we can investigate.`,
            'We are not responsible for existing damage or wear and tear, for items that were not secured or that we were not told were fragile, or for losses that were not foreseeable.',
            'For business customers, our total liability for any booking is limited to the price paid for that booking, except where the law does not allow this.',
            'Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot be limited by law, and nothing affects your statutory rights as a consumer.',
          ],
        },
      ],
    },
    {
      id: 'privacy',
      title: '11. Your personal information',
      body: ['We use your personal information as described in our Privacy Policy.'],
    },
    {
      id: 'law',
      title: '12. Changes to these terms and governing law',
      body: [
        'We may update these terms from time to time; the version shown when you confirm a booking applies to that booking.',
        'These terms are governed by the law of England and Wales. If you are a consumer living in Scotland or Northern Ireland, you may also bring proceedings in your local courts.',
      ],
    },
    {
      id: 'contact',
      title: '13. Contact us',
      body: [`Questions about these terms, a booking or an invoice? Email ${C.email} and we will reply within two working days.`],
    },
  ],
};
