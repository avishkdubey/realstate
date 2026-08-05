"use client";

import dynamic from "next/dynamic";

/**
 * The calculator is below the fold on every page that carries it, so its
 * interaction code loads on mount rather than in the initial bundle.
 */
const EmiCalculator = dynamic(
  () => import("@/components/finance/emi-calculator").then((m) => m.EmiCalculator),
  {
    ssr: false,
    loading: () => (
      <div
        className="bg-card h-[28rem] w-full animate-pulse border border-border"
        aria-hidden
      />
    ),
  },
);

export function DeferredEmiCalculator({ startingPrice }: { startingPrice: number }) {
  return <EmiCalculator startingPrice={startingPrice} />;
}
