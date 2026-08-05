/**
 * Home-loan arithmetic. Pure functions, no React — so the numbers can be
 * checked without a browser.
 *
 * Affordability is the single biggest anxiety for the 25–40 segment this site
 * targets: EMI-to-income sits near 40% for many buyers and above 50% in
 * premium markets (CLAUDE.md §2). Showing the monthly figure honestly, before
 * anyone has to ask a salesperson, is the point of this tool.
 */

export type EmiInput = {
  /** Property price in rupees. */
  price: number;
  /** Down payment in rupees. */
  downPayment: number;
  /** Annual nominal rate, e.g. 7.5 for 7.5%. */
  annualRatePercent: number;
  /** Tenure in years. */
  years: number;
};

export type EmiResult = {
  principal: number;
  monthly: number;
  totalPayable: number;
  totalInterest: number;
};

/**
 * Standard reducing-balance EMI:
 *
 *   E = P · r · (1+r)^n / ((1+r)^n − 1)
 *
 * where r is the monthly rate and n the number of months.
 */
export function calculateEmi({
  price,
  downPayment,
  annualRatePercent,
  years,
}: EmiInput): EmiResult {
  const principal = Math.max(0, price - downPayment);
  const months = Math.round(years * 12);

  if (principal === 0 || months === 0) {
    return { principal, monthly: 0, totalPayable: 0, totalInterest: 0 };
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  // A zero-rate loan is just the principal spread evenly; the formula below
  // divides by zero in that case.
  const monthly =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayable = monthly * months;

  return {
    principal,
    monthly,
    totalPayable,
    totalInterest: totalPayable - principal,
  };
}

/**
 * Lenders in India typically fund up to 80% of value for loans in this range,
 * so 20% is the realistic starting down payment.
 */
export const DEFAULT_DOWN_PAYMENT_PERCENT = 20;

/**
 * Indicative floating rate. CLAUDE.md §1 records 7.10–7.35% across SBI, Union
 * Bank and Bank of Baroda after the RBI's December 2025 cut; this sits just
 * above that so the estimate is not flattering. Always editable — a rate baked
 * into a page goes stale the week after it ships.
 */
export const DEFAULT_INTEREST_RATE = 7.5;

export const DEFAULT_TENURE_YEARS = 20;
