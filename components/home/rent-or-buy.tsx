"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { EmiCalculator } from "@/components/finance/emi-calculator";
import { formatPrice } from "@/lib/format";
import {
  compareRentVsBuy,
  HOLDING_COST_PERCENT,
  RENT_VS_BUY_DEFAULTS,
  TRANSACTION_COST_PERCENT,
} from "@/lib/rent-vs-buy";

/**
 * "Should you rent or buy?" — two calculators on one swipeable rail.
 *
 * The rent-versus-buy comparison comes first because it is the question that
 * actually blocks a decision; the EMI calculator answers the follow-up. Putting
 * them on a rail rather than stacking them keeps the section to one screen and
 * makes the pairing legible: the same person needs both, in that order.
 *
 * Neither gates anything behind a phone number. That is the whole argument of
 * `CLAUDE.md` §12 — this audience expects to do the arithmetic themselves, and
 * charging them a contact detail for it is what makes them leave.
 */
export function RentOrBuy() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setSelected(emblaApi.selectedScrollSnap());
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  const slides = ["Rent or buy", "Monthly instalment"];

  return (
    <section className="section" aria-labelledby="rent-or-buy-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">Run the numbers</p>
            <h2 id="rent-or-buy-heading" className="measure mt-6 text-h3">
              Should you rent or buy?
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {slides.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-current={selected === index}
                className={`eyebrow border-b pb-1 transition-colors ${
                  selected === index
                    ? "border-gold text-gold-soft"
                    : "text-muted-foreground border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={prev}
              aria-label="Previous calculator"
              className="border-border hover:border-hairline-strong ml-3 rounded-full border p-3 transition-colors"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next calculator"
              className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8">
            <div className="min-w-0 flex-[0_0_100%] lg:flex-[0_0_58%]">
              <RentVsBuyCalculator />
            </div>
            <div className="min-w-0 flex-[0_0_100%] lg:flex-[0_0_58%]">
              <EmiCalculator startingPrice={RENT_VS_BUY_DEFAULTS.price} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RentVsBuyCalculator() {
  const [price, setPrice] = useState(RENT_VS_BUY_DEFAULTS.price);
  const [monthlyRent, setMonthlyRent] = useState(RENT_VS_BUY_DEFAULTS.monthlyRent);
  const [years, setYears] = useState(RENT_VS_BUY_DEFAULTS.years);
  const [appreciation, setAppreciation] = useState(
    RENT_VS_BUY_DEFAULTS.appreciationPercent,
  );

  const result = useMemo(
    () =>
      compareRentVsBuy({
        ...RENT_VS_BUY_DEFAULTS,
        price,
        monthlyRent,
        years,
        appreciationPercent: appreciation,
      }),
    [price, monthlyRent, years, appreciation],
  );

  const buyingWins = result.advantage > 0;

  return (
    <div className="border-border border p-8">
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
          label="Rent you pay today"
          value={monthlyRent}
          display={`₹${monthlyRent.toLocaleString("en-IN")} / month`}
          min={8_000}
          max={200_000}
          step={1_000}
          onChange={setMonthlyRent}
        />
        <Slider
          label="How long you would stay"
          value={years}
          display={`${years} years`}
          min={3}
          max={30}
          step={1}
          onChange={setYears}
        />
        <Slider
          label="Assumed appreciation"
          value={appreciation}
          display={`${appreciation.toFixed(1)}% a year`}
          min={0}
          max={12}
          step={0.5}
          onChange={setAppreciation}
        />
      </div>

      <div className="border-border mt-10 border-t pt-8">
        <p className="eyebrow text-muted-foreground">
          After {years} years, buying leaves you
        </p>
        <p
          className="font-display mt-3 text-h3"
          aria-live="polite"
          aria-atomic="true"
        >
          {buyingWins ? "+" : "−"}
          {formatPrice(Math.abs(result.advantage))}
        </p>
        <p className="text-small text-muted-foreground mt-2">
          {buyingWins
            ? "better off than renting and investing the difference."
            : "worse off than renting and investing the difference."}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <dt className="eyebrow text-muted-foreground">Monthly instalment</dt>
            <dd className="mt-2 tabular-nums">
              ₹{Math.round(result.monthlyEmi).toLocaleString("en-IN")}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Rent over {years} yrs</dt>
            <dd className="mt-2">{formatPrice(result.rentOutflow)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Home worth then</dt>
            <dd className="mt-2">{formatPrice(result.homeValue)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Stamp duty & fees</dt>
            <dd className="mt-2">{formatPrice(result.upfrontCosts)}</dd>
          </div>
        </dl>
      </div>

      {/* The assumptions are stated, not buried. A "you will be ₹X better off"
          claim with hidden inputs is a misleading statement under RERA §12, and
          a disclaimer does not waive the promoter's liability for it. */}
      <p className="text-caption text-muted-foreground mt-8 leading-relaxed">
        Assumes a {RENT_VS_BUY_DEFAULTS.downPercent}% down payment at{" "}
        {RENT_VS_BUY_DEFAULTS.ratePercent}% p.a., rent rising{" "}
        {RENT_VS_BUY_DEFAULTS.rentGrowthPercent}% a year, {TRANSACTION_COST_PERCENT}%
        in stamp duty, registration and legal costs, {HOLDING_COST_PERCENT}% a year in
        maintenance and society dues, and that a renter invests the difference at{" "}
        {RENT_VS_BUY_DEFAULTS.investmentReturnPercent}% a year. No tax deduction on
        interest or principal is credited, so the buying case here is
        conservative. Property appreciation is an assumption you set, not a
        forecast we are making. This is an illustration, not financial advice.
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
        className="mt-4 w-full"
      />
    </label>
  );
}
