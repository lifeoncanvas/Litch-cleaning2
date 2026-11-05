import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const jsonResponse = (body, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });

const mockLoginResponse = (loginHandler) => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes('/auth/login')) return loginHandler();
    return jsonResponse([]);
  });
};

const submitLogin = async (email, password) => {
  fireEvent.click(screen.getAllByRole('button', { name: /^login$/i })[0]);
  fireEvent.change(await screen.findByPlaceholderText('name@company.com'), { target: { value: email } });
  fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in & continue/i }));
};

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
});

test('renders the home page hero', () => {
  mockLoginResponse(() => jsonResponse({}));
  render(<App />);
  expect(screen.getAllByText(/Clean Spaces\./i).length).toBeGreaterThan(0);
});

test('rejected credentials show the server message and do not sign in', async () => {
  mockLoginResponse(() => jsonResponse({ success: false, message: 'Invalid email or password' }, 401));
  render(<App />);
  await submitLogin('client@example.com', 'wrong-password');

  expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
  expect(localStorage.getItem('licht_user')).toBeNull();
  expect(localStorage.getItem('licht_jwt_token')).toBeNull();
});

test('unreachable server shows a connection error and does not sign in', async () => {
  mockLoginResponse(() => Promise.reject(new TypeError('Failed to fetch')));
  render(<App />);
  await submitLogin('client@example.com', 'any-password');

  expect(await screen.findByText(/Could not reach the sign-in server/i)).toBeInTheDocument();
  expect(localStorage.getItem('licht_user')).toBeNull();
});

test('accepted credentials sign the user in and store the token', async () => {
  mockLoginResponse(() =>
    jsonResponse({
      success: true,
      token: 'test-jwt',
      user: { id: 1, name: 'Test Client', email: 'client@example.com', role: 'ROLE_CLIENT' },
    })
  );
  render(<App />);
  await submitLogin('client@example.com', 'right-password');

  await waitFor(() => expect(localStorage.getItem('licht_jwt_token')).toBe('test-jwt'));
  expect(JSON.parse(localStorage.getItem('licht_user')).email).toBe('client@example.com');
});
