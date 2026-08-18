/**
 * Rent-versus-buy arithmetic. Pure functions, no React.
 *
 * This is the calculation that decides whether a 28-year-old on a salary in
 * Ahmedabad should keep renting, and it is normally answered by a salesperson
 * with an incentive. So two rules govern what is modelled here:
 *
 * **Nothing flattering is left out.** Rent is not thrown away — the money not
 * spent on a down payment earns a return, and a fair comparison has to credit
 * it. Buying carries stamp duty, registration, maintenance and society dues
 * that no EMI figure shows. Both sides are modelled.
 *
 * **No result is asserted as advice.** The function returns a comparison, and
 * the component says out loud which assumptions drive it. Under RERA §12 the
 * promoter is liable for misleading statements in an advertisement, and "you
 * will be ₹X better off" is exactly that if the assumptions are hidden.
 *
 * The model is deliberately simple and slightly conservative toward buying:
 * appreciation compounds annually, the invested down payment compounds
 * annually, and no tax deduction on interest or principal is credited.
 */

export type RentVsBuyInput = {
  /** All-in property price in rupees. */
  price: number;
  /** Down payment as a percentage of price. */
  downPercent: number;
  /** Annual nominal home-loan rate, e.g. 7.5. */
  ratePercent: number;
  /** Loan tenure in years. Also the comparison horizon. */
  years: number;
  /** Current monthly rent for a comparable home, in rupees. */
  monthlyRent: number;
  /** Annual rent escalation, e.g. 6 for 6%. */
  rentGrowthPercent: number;
  /** Assumed annual property appreciation, e.g. 6. */
  appreciationPercent: number;
  /** Return on money not spent on the down payment, e.g. 9. */
  investmentReturnPercent: number;
};

export type RentVsBuyResult = {
  /** Everything paid to own, over the horizon. */
  buyOutflow: number;
  /** What the home is assumed to be worth at the end. */
  homeValue: number;
  /** Net position if you buy: equity minus everything spent. */
  buyNet: number;
  /** Everything paid in rent over the horizon. */
  rentOutflow: number;
  /** What the down payment plus monthly savings would have grown to. */
  investedValue: number;
  /** Net position if you rent and invest the difference. */
  rentNet: number;
  /** Positive means buying comes out ahead. */
  advantage: number;
  /** Monthly EMI, for display alongside the rent. */
  monthlyEmi: number;
  /** One-off costs of purchase — stamp duty, registration, fit-out. */
  upfrontCosts: number;
};

/**
 * Gujarat stamp duty is 4.9% including the surcharge, and registration is 1%
 * (waived for a sole female buyer, which is not modelled). Rounded to a single
 * 6% of price to cover both plus legal, which is the number a buyer should
 * budget with.
 */
export const TRANSACTION_COST_PERCENT = 6;

/**
 * Maintenance, society dues, repairs and property tax, as a percentage of value
 * per year. 1% is the conventional planning figure and matches what Ahmedabad
 * societies in this segment actually charge.
 */
export const HOLDING_COST_PERCENT = 1;

export function compareRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const {
    price,
    downPercent,
    ratePercent,
    years,
    monthlyRent,
    rentGrowthPercent,
    appreciationPercent,
    investmentReturnPercent,
  } = input;

  const months = Math.round(years * 12);
  const downPayment = (price * downPercent) / 100;
  const principal = Math.max(0, price - downPayment);
  const monthlyRate = ratePercent / 100 / 12;

  const monthlyEmi =
    principal === 0 || months === 0
      ? 0
      : monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

  const upfrontCosts = (price * TRANSACTION_COST_PERCENT) / 100;

  /* Walk the horizon a year at a time. A closed form would be shorter but the
     two sides escalate on different bases — rent compounds, holding cost tracks
     a rising valuation — and a loop that mirrors the real cash flows is far
     easier to check than an algebraic collapse of it. */
  let rentOutflow = 0;
  let holdingCosts = 0;
  let homeValue = price;
  // Renting frees up the down payment and the purchase costs immediately.
  let investedValue = downPayment + upfrontCosts;

  for (let year = 0; year < years; year++) {
    const rentThisYear = monthlyRent * 12 * Math.pow(1 + rentGrowthPercent / 100, year);
    rentOutflow += rentThisYear;

    const holdingThisYear = (homeValue * HOLDING_COST_PERCENT) / 100;
    holdingCosts += holdingThisYear;

    /* A renter's monthly surplus is whatever ownership would have cost beyond
       the rent. When rent overtakes the EMI the surplus goes negative and the
       invested pot is drawn down, which is exactly what happens in reality. */
    const ownershipThisYear = monthlyEmi * 12 + holdingThisYear;
    const surplus = ownershipThisYear - rentThisYear;

    investedValue =
      (investedValue + surplus) * (1 + investmentReturnPercent / 100);
    homeValue *= 1 + appreciationPercent / 100;
  }

  const buyOutflow = downPayment + upfrontCosts + monthlyEmi * months + holdingCosts;
  const buyNet = homeValue - buyOutflow;
  const rentNet = investedValue - rentOutflow;

  return {
    buyOutflow,
    homeValue,
    buyNet,
    rentOutflow,
    investedValue,
    rentNet,
    advantage: buyNet - rentNet,
    monthlyEmi,
    upfrontCosts,
  };
}

export const RENT_VS_BUY_DEFAULTS: RentVsBuyInput = {
  price: 9_500_000,
  downPercent: 20,
  ratePercent: 7.5,
  years: 20,
  monthlyRent: 32_000,
  rentGrowthPercent: 6,
  /* Ahmedabad led Indian prime-luxury appreciation at 14–22% in 2025
     (CLAUDE.md §1), but a twenty-year projection must not be built on one
     exceptional year. 6% is roughly the moderated national figure and is the
     conservative choice here. */
  appreciationPercent: 6,
  investmentReturnPercent: 9,
};
