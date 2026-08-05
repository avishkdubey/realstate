import type { Project } from "@/lib/types";

/**
 * All-in cost breakdown.
 *
 * Hidden charges are one of the named fears this audience brings to a builder
 * (CLAUDE.md §2), and the fix is arithmetic rather than reassurance: show the
 * statutory components, name them, and total them.
 *
 * ⚠ THE RATES BELOW ARE STATUTORY AND MUST BE VERIFIED BEFORE LAUNCH.
 * They reflect commonly-published Gujarat figures at the time of writing and
 * are labelled indicative everywhere they surface. Stamp duty, registration
 * and GST all change by notification, and getting them wrong on a website is a
 * §12 misleading-statement exposure, not a rounding error.
 */

export const RATES = {
  /** Gujarat stamp duty: 3.5% basic plus a 1.4% surcharge. */
  stampDutyPercent: 4.9,
  /**
   * Registration fee, 1% of consideration. Gujarat waives it where the sole
   * purchaser is a woman, which is why this is surfaced as a toggle rather
   * than folded silently into the total.
   */
  registrationPercent: 1,
  /**
   * GST at 5% without input tax credit on under-construction homes above the
   * affordable threshold. Completed homes that have received their occupancy
   * certificate attract no GST at all.
   */
  gstPercent: 5,
  /** Indicative maintenance advance, in months. Set per project in practice. */
  maintenanceAdvanceMonths: 12,
  /** Indicative monthly maintenance, ₹ per sq ft of carpet area. */
  maintenancePerSqFt: 3.5,
} as const;

export type CostLine = {
  label: string;
  amount: number;
  note: string;
};

export type CostSheet = {
  lines: CostLine[];
  total: number;
  /** True when GST does not apply because the project is delivered. */
  gstExempt: boolean;
};

export function buildCostSheet({
  project,
  basePrice,
  carpetArea,
  soleWomanPurchaser = false,
}: {
  project: Project;
  basePrice: number;
  carpetArea: number;
  soleWomanPurchaser?: boolean;
}): CostSheet {
  const gstExempt = project.status === "completed";

  const lines: CostLine[] = [
    {
      label: "Agreement value",
      amount: basePrice,
      note: `${carpetArea.toLocaleString("en-IN")} sq ft carpet area, as defined under the RERA Act`,
    },
  ];

  if (!gstExempt) {
    lines.push({
      label: `GST (${RATES.gstPercent}%)`,
      amount: (basePrice * RATES.gstPercent) / 100,
      note: "Charged on under-construction homes, without input tax credit",
    });
  }

  lines.push({
    label: `Stamp duty (${RATES.stampDutyPercent}%)`,
    amount: (basePrice * RATES.stampDutyPercent) / 100,
    note: "Gujarat: 3.5% basic duty plus 1.4% surcharge",
  });

  lines.push({
    label: soleWomanPurchaser
      ? "Registration fee (waived)"
      : `Registration fee (${RATES.registrationPercent}%)`,
    amount: soleWomanPurchaser
      ? 0
      : (basePrice * RATES.registrationPercent) / 100,
    note: soleWomanPurchaser
      ? "Gujarat waives the registration fee where the sole purchaser is a woman"
      : "1% of consideration, payable at registration",
  });

  lines.push({
    label: "Maintenance advance",
    amount:
      carpetArea *
      RATES.maintenancePerSqFt *
      RATES.maintenanceAdvanceMonths,
    note: `${RATES.maintenanceAdvanceMonths} months at ₹${RATES.maintenancePerSqFt}/sq ft, collected on possession`,
  });

  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    gstExempt,
  };
}
