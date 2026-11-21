import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from './App';

/** Simulate the live server: every API call answers 404 Not Found. */
const mockServer404 = () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve(JSON.stringify({ status: 404, error: 'Not Found' })),
      json: () => Promise.resolve({ status: 404, error: 'Not Found' }),
    })
  );
};

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
  mockServer404();
});

test('home page renders the service catalogue', () => {
  render(<App />);
  expect(screen.getByText(/Meet Licht\./i)).toBeInTheDocument();
  expect(screen.getAllByText('Book Now')).toHaveLength(8);
});

test('C3: a rejected login does NOT create a session or open admin', async () => {
  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: /^login$/i })[0]);
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByPlaceholderText(/@/), { target: { value: 'admin@lichtmarketinglimited.org' } });
  fireEvent.change(dialog.querySelector('input[type="password"]'), { target: { value: 'wrong-password' } });
  fireEvent.submit(dialog.querySelector('form'));

  await waitFor(() => expect(within(dialog).getByText(/failed|incorrect|could not/i)).toBeInTheDocument());
  expect(localStorage.getItem('licht_user')).toBeNull();
  expect(localStorage.getItem('licht_admin_auth')).toBeNull();
  expect(screen.queryByText(/Admin Portal/i)).not.toBeInTheDocument();
});

test('H1: a failed enquiry shows an error, not "Thank you"', async () => {
  const { container } = render(<App />);
  const form = container.querySelector('#quote form');
  fireEvent.change(form.querySelector('[name="name"]'), { target: { value: 'Jane Smith' } });
  fireEvent.change(form.querySelector('[name="email"]'), { target: { value: 'jane@example.com' } });
  fireEvent.change(form.querySelector('[name="phone"]'), { target: { value: '07700 900123' } });
  fireEvent.change(form.querySelector('[name="postcode"]'), { target: { value: 'SW1A 1AA' } });
  fireEvent.submit(form);

  expect(await screen.findByText(/could not be sent/i)).toBeInTheDocument();
  expect(screen.queryByText(/Your Enquiry Has Been Received/i)).not.toBeInTheDocument();
});

test('M6: invalid phone number is rejected before sending', async () => {
  const { container } = render(<App />);
  const form = container.querySelector('#quote form');
  fireEvent.change(form.querySelector('[name="name"]'), { target: { value: 'Jane Smith' } });
  fireEvent.change(form.querySelector('[name="email"]'), { target: { value: 'jane@example.com' } });
  fireEvent.change(form.querySelector('[name="phone"]'), { target: { value: 'abcdef' } });
  fireEvent.change(form.querySelector('[name="postcode"]'), { target: { value: 'SW1A 1AA' } });
  fireEvent.submit(form);

  expect(await screen.findByText(/valid UK phone/i)).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/quotes'), expect.anything());
});

test('FE-NAV-10: footer Privacy Policy and Terms links open real pages', async () => {
  render(<App />);
  const footer = () => screen.getByRole('contentinfo');
  fireEvent.click(within(footer()).getByRole('button', { name: 'Privacy Policy' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Your rights/i })).toBeInTheDocument();
  expect(window.location.hash).toBe('#privacy');

  fireEvent.click(within(footer()).getByRole('button', { name: 'Terms of Service' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Changes and cancellations by you/i })).toBeInTheDocument();
  expect(window.location.hash).toBe('#terms');
  window.location.hash = '';
});

test('Terms are numbered 1–13 in order and contain no unfilled placeholders', () => {
  const { TERMS_OF_SERVICE } = require('./data/legalData');
  const numbers = TERMS_OF_SERVICE.sections.map((s) => Number(s.title.split('.')[0]));
  expect(numbers).toEqual(Array.from({ length: numbers.length }, (_, i) => i + 1));
  expect(TERMS_OF_SERVICE.sections.some((s) => s.id === 'about-us')).toBe(false);
  const allText = [TERMS_OF_SERVICE.intro, ...TERMS_OF_SERVICE.sections.flatMap((s) => s.body.flatMap((b) => (typeof b === 'string' ? [b] : b.list)))].join(' ');
  expect(allText).not.toMatch(/\[[^\]]+\]/);
});

test('opening /#privacy directly shows the policy', async () => {
  window.location.hash = '#privacy';
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
  window.location.hash = '';
});

test('C3: a role in localStorage without a server token does not unlock the admin portal', () => {
  localStorage.setItem('licht_user', JSON.stringify({ email: 'x@example.com', role: 'ROLE_ADMIN' }));
  localStorage.setItem('licht_admin_auth', JSON.stringify({ email: 'x@example.com', role: 'ROLE_ADMIN' }));
  window.history.pushState({}, '', '/admin');
  render(<App />);
  // Admin portal shows its own sign-in form instead of the dashboard.
  expect(screen.queryByText(/Client Bookings & Orders/i)).not.toBeInTheDocument();
  window.history.pushState({}, '', '/');
});
