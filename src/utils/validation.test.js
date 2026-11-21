import { isValidEmail, isValidUkPhone, isValidUkPostcode, validateQuoteForm, validateBookingContact, formatUkPostcode, isPlaceholderContact } from './validation';

test.each([
  ['name@company.co.uk', true],
  ['a.b+c@gmail.com', true],
  ['a@b', false],
  ['abc', false],
  ['a b@c.com', false],
  ['', false],
])('email %s → %s', (v, ok) => expect(isValidEmail(v)).toBe(ok));

test.each([
  ['07700 900123', true],
  ['+44 20 7946 0000', true],
  ['020 7946 0000', true],
  ['+447700900123', true],
  ['abcdef', false],
  ['1', false],
  ['0770090', false],
])('UK phone %s → %s', (v, ok) => expect(isValidUkPhone(v)).toBe(ok));

test.each([
  ['SW1A 1AA', true],
  ['sw1a1aa', true],
  ['M1 1AE', true],
  ['B33 8TH', true],
  ['12345', false],
  ['W1J', false],
])('UK postcode %s → %s', (v, ok) => expect(isValidUkPostcode(v)).toBe(ok));

test('postcode is normalised', () => expect(formatUkPostcode('sw1a1aa')).toBe('SW1A 1AA'));

test('backend placeholder phone/address are recognised and not pre-filled', () => {
  expect(isPlaceholderContact('+44 20 8000 0000')).toBe(true);
  expect(isPlaceholderContact('Central London, UK')).toBe(true);
  expect(isPlaceholderContact('07700 900123')).toBe(false);
});

const goodQuote = { name: 'Jane Smith', company: '', email: 'jane@example.com', phone: '07700 900123', postcode: 'SW1A 1AA' };

test('valid quote passes', () => expect(validateQuoteForm(goodQuote)).toBe(''));
test('name of only spaces is rejected', () => expect(validateQuoteForm({ ...goodQuote, name: '   ' })).not.toBe(''));
test('corporate quote needs a company', () => expect(validateQuoteForm(goodQuote, 'corporate')).not.toBe(''));
test('weak email a@b is rejected', () => expect(validateQuoteForm({ ...goodQuote, email: 'a@b' })).not.toBe(''));
test('letters as phone are rejected', () => expect(validateQuoteForm({ ...goodQuote, phone: 'abcdef' })).not.toBe(''));

const goodContact = { clientName: 'Jane Smith', clientEmail: 'jane@example.com', phone: '07700 900123', address: '10 High Street, London', postcode: 'SW1A 1AA' };

test('valid booking contact passes', () => expect(validateBookingContact(goodContact)).toBe(''));
test.each(['clientName', 'clientEmail', 'phone', 'address', 'postcode'])('empty %s blocks the booking', (field) => {
  expect(validateBookingContact({ ...goodContact, [field]: '' })).not.toBe('');
});
