"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_DOWN_PAYMENT_PERCENT,
  DEFAULT_INTEREST_RATE,
  DEFAULT_TENURE_YEARS,
  calculateEmi,
} from "@/lib/emi";
import { formatPrice } from "@/lib/format";

/**
 * EMI calculator.
 *
 * Deliberately answers the question without asking for a phone number first —
 * the buyers this site is built for expect to work out affordability
 * themselves, and gating the arithmetic is what makes them leave.
 */
export function EmiCalculator({ startingPrice }: { startingPrice: number }) {
  const [price, setPrice] = useState(startingPrice);
  const [downPercent, setDownPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT);
  const [rate, setRate] = useState(DEFAULT_INTEREST_RATE);
  const [years, setYears] = useState(DEFAULT_TENURE_YEARS);

  const downPayment = Math.round((price * downPercent) / 100);

  const result = useMemo(
    () =>
      calculateEmi({
        price,
        downPayment,
        annualRatePercent: rate,
        years,
      }),
    [price, downPayment, rate, years],
  );

  return (
    <div className="border border-border p-8">
      <div className="space-y-8">
        <Slider
          label="Property price"
          value={price}
          display={formatPrice(price)}
          min={2_500_000}
          max={60_000_000}
          step={500_000}
          onChange={setPrice}
        />
        <Slider
          label="Down payment"
          value={downPercent}
          display={`${downPercent}% · ${formatPrice(downPayment)}`}
          min={10}
          max={60}
          step={5}
          onChange={setDownPercent}
        />
        <Slider
          label="Interest rate"
          value={rate}
          display={`${rate.toFixed(2)}% p.a.`}
          min={6}
          max={12}
          step={0.05}
          onChange={setRate}
        />
        <Slider
          label="Tenure"
          value={years}
          display={`${years} years`}
          min={5}
          max={30}
          step={1}
          onChange={setYears}
        />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <p className="eyebrow text-muted-foreground">Monthly instalment</p>
        <p
          className="font-display mt-3 text-h3"
          aria-live="polite"
          aria-atomic="true"
        >
          ₹
          {Math.round(result.monthly).toLocaleString("en-IN")}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <dt className="eyebrow text-muted-foreground">Loan amount</dt>
            <dd className="mt-2">{formatPrice(result.principal)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Total interest</dt>
            <dd className="mt-2">{formatPrice(result.totalInterest)}</dd>
          </div>
        </dl>
      </div>

      <p className="text-caption text-muted-foreground mt-8 leading-relaxed">
        Indicative only. Your actual instalment depends on the rate your lender
        offers, processing fees and your credit profile. This estimate excludes
        GST, stamp duty and registration — see the cost breakdown for those. We
        are not a lender and this is not financial advice.
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="eyebrow text-muted-foreground">{label}</span>
        <span className="text-small tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-bronze mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)]"
      />
    </label>
  );
}
