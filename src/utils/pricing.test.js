import { calculateBookingPrice, cartBaseTotal, formatGBP, MAX_CART_QUANTITY, SIZE_ADDONS, FREQUENCY_DISCOUNTS } from './pricing';
import { SERVICES_DATA } from '../data/servicesData';

/** Reference calculation in exact pence, written independently of pricing.js. */
const expectedTotal = (base, size, freq) => {
  const subtotalPence = (base + SIZE_ADDONS[size]) * 100;
  const discountPence = Math.round(subtotalPence * FREQUENCY_DISCOUNTS[freq]);
  const netPence = subtotalPence - discountPence;
  return (netPence + Math.round(netPence * 0.2)) / 100;
};

describe('calculateBookingPrice', () => {
  test('one-off, compact = published "From" price + 20% VAT', () => {
    const p = calculateBookingPrice(180, 'compact', 'one-off');
    expect(p.subtotal).toBe(180);
    expect(p.vatAmount).toBe(36);
    expect(p.grandTotal).toBe(216);
  });

  test('size add-ons: compact +0, standard +40, large +90', () => {
    expect(calculateBookingPrice(100, 'compact').sizeAddon).toBe(0);
    expect(calculateBookingPrice(100, 'standard').sizeAddon).toBe(40);
    expect(calculateBookingPrice(100, 'large').sizeAddon).toBe(90);
  });

  test('frequency discounts: weekly 15%, fortnightly 10%, monthly 5%', () => {
    expect(calculateBookingPrice(200, 'compact', 'weekly').discountAmount).toBe(30);
    expect(calculateBookingPrice(200, 'compact', 'fortnightly').discountAmount).toBe(20);
    expect(calculateBookingPrice(200, 'compact', 'monthly').discountAmount).toBe(10);
  });

  test('keeps pence instead of rounding to whole pounds (was £184, should be £183.60)', () => {
    expect(calculateBookingPrice(180, 'compact', 'weekly').grandTotal).toBe(183.6);
  });

  test('full matrix: 8 services × 3 sizes × 4 frequencies match the reference to the penny', () => {
    let checked = 0;
    SERVICES_DATA.forEach((svc) => {
      Object.keys(SIZE_ADDONS).forEach((size) => {
        Object.keys(FREQUENCY_DISCOUNTS).forEach((freq) => {
          const p = calculateBookingPrice(svc.price, size, freq);
          expect(p.grandTotal).toBeCloseTo(expectedTotal(svc.price, size, freq), 2);
          expect(p.netTotal + p.vatAmount).toBeCloseTo(p.grandTotal, 2);
          checked += 1;
        });
      });
    });
    expect(checked).toBe(96);
  });

  test('unknown size/frequency fall back to no add-on and no discount', () => {
    expect(calculateBookingPrice(100, 'huge', 'yearly').grandTotal).toBe(120);
  });
});

describe('cart', () => {
  test('cart base total multiplies price by quantity', () => {
    expect(cartBaseTotal([{ price: 180, quantity: 2 }, { price: 95, quantity: 1 }])).toBe(455);
  });

  test(`quantity is capped at ${MAX_CART_QUANTITY} and floored at 1`, () => {
    expect(cartBaseTotal([{ price: 100, quantity: 999 }])).toBe(100 * MAX_CART_QUANTITY);
    expect(cartBaseTotal([{ price: 100, quantity: 0 }])).toBe(100);
  });

  test('cart estimate equals the booking modal opening estimate (was £330 vs £378)', () => {
    const cart = [{ price: 180, quantity: 1 }, { price: 95, quantity: 1 }];
    const cartTotal = calculateBookingPrice(cartBaseTotal(cart), 'compact', 'one-off').grandTotal;
    expect(cartTotal).toBe(330);
  });
});

test('formatGBP always shows two decimals', () => {
  expect(formatGBP(183.6)).toBe('£183.60');
  expect(formatGBP(13290)).toBe('£13,290.00');
});
