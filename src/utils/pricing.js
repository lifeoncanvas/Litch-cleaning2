/**
 * @file pricing.js
 * @description Single source of truth for booking and cart price calculations.
 *              All maths is done in integer pence to avoid rounding drift; results
 *              are returned in pounds (2 decimal places). The backend must repeat
 *              this calculation and never trust an amount sent by the browser.
 */

export const VAT_RATE = 0.2;
export const MAX_CART_QUANTITY = 10;

export const SIZE_ADDONS = {
  compact: 0,
  standard: 40,
  large: 90,
};

export const FREQUENCY_DISCOUNTS = {
  'one-off': 0,
  weekly: 0.15,
  fortnightly: 0.1,
  monthly: 0.05,
};

const toPence = (pounds) => Math.round((Number(pounds) || 0) * 100);
const toPounds = (pence) => Math.round(pence) / 100;

/** Sum of item price × quantity (base rates, before size/frequency/VAT). */
export const cartBaseTotal = (items = []) =>
  toPounds(
    items.reduce(
      (sum, item) => sum + toPence(item.price) * Math.max(1, Math.min(MAX_CART_QUANTITY, item.quantity || 1)),
      0
    )
  );

/**
 * Full booking price breakdown.
 * @param {number} basePrice  base rate in pounds
 * @param {string} propertySize compact | standard | large
 * @param {string} frequency  one-off | weekly | fortnightly | monthly
 */
export function calculateBookingPrice(basePrice, propertySize = 'compact', frequency = 'one-off') {
  const basePence = toPence(basePrice);
  const addonPence = toPence(SIZE_ADDONS[propertySize] ?? 0);
  const subtotalPence = basePence + addonPence;
  const discountRate = FREQUENCY_DISCOUNTS[frequency] ?? 0;
  const discountPence = Math.round(subtotalPence * discountRate);
  const netPence = subtotalPence - discountPence;
  const vatPence = Math.round(netPence * VAT_RATE);
  const totalPence = netPence + vatPence;

  return {
    basePrice: toPounds(basePence),
    sizeAddon: toPounds(addonPence),
    subtotal: toPounds(subtotalPence),
    discountRate,
    discountAmount: toPounds(discountPence),
    netTotal: toPounds(netPence),
    vatAmount: toPounds(vatPence),
    grandTotal: toPounds(totalPence),
  };
}

/** Format pounds as "£1,234.50" (always two decimals). */
export const formatGBP = (amount) =>
  `£${(Number(amount) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
