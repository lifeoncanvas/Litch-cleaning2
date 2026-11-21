/**
 * @file validation.js
 * @description Shared client-side validation for enquiry and booking forms.
 *              The backend must validate again — this only gives users fast feedback.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// UK numbers: +44 or 0, then 9–10 more digits (spaces, dashes, brackets allowed).
const UK_PHONE_RE = /^(?:\+44\s?|0)(?:[\s\-()]*\d){9,10}$/;
// Full UK postcode, e.g. SW1A 1AA, M1 1AE, B33 8TH (space optional, any case).
const UK_POSTCODE_RE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;

export const isValidEmail = (v) => EMAIL_RE.test((v || '').trim());
export const isValidUkPhone = (v) => UK_PHONE_RE.test((v || '').trim());
export const isValidUkPostcode = (v) => UK_POSTCODE_RE.test((v || '').trim());
export const hasRealText = (v, min = 2) => (v || '').trim().length >= min && /[A-Za-z]/.test(v || '');

/** Dummy values the backend saves when a customer leaves phone/address blank at registration. */
const PLACEHOLDER_CONTACTS = [
  '+44 20 8000 0000',
  '+44 20 8000 8899',
  'central london, uk',
  'london headquarters',
  '14 berkeley square, london',
  '14 berkeley square, mayfair',
];
export const isPlaceholderContact = (v) => !v || PLACEHOLDER_CONTACTS.includes(String(v).trim().toLowerCase());

/** Normalise a UK postcode to "SW1A 1AA" format. */
export const formatUkPostcode = (v) => {
  const m = (v || '').trim().match(UK_POSTCODE_RE);
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : (v || '').trim();
};

/** Returns the first problem with the enquiry form, or '' when valid. */
export function validateQuoteForm(data, quoteTab = 'general') {
  if (!hasRealText(data.name)) return 'Please enter your full name.';
  if (quoteTab === 'corporate' && !hasRealText(data.company)) return 'Please enter your company or organisation name.';
  if (!isValidEmail(data.email)) return 'Please enter a valid email address (e.g. name@company.co.uk).';
  if (!isValidUkPhone(data.phone)) return 'Please enter a valid UK phone number (e.g. 07700 900123 or +44 20 7946 0000).';
  if (!hasRealText(data.postcode)) return 'Please enter your postcode or location.';
  return '';
}

/** Returns the first problem with booking step 3 (contact & address), or '' when valid. */
export function validateBookingContact({ clientName, clientEmail, phone, address, postcode }) {
  if (!hasRealText(clientName)) return 'Please enter the contact name for this booking.';
  if (!isValidEmail(clientEmail)) return 'Please enter a valid email address.';
  if (!isValidUkPhone(phone)) return 'Please enter a valid UK phone number for the cleaner to contact you.';
  if (!hasRealText(address, 5)) return 'Please enter the full property address.';
  if (!isValidUkPostcode(postcode)) return 'Please enter a valid UK postcode (e.g. SW1A 1AA).';
  return '';
}
