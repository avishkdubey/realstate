import { z } from "zod";

/**
 * Shared between the client form and the API route, so validation cannot drift
 * between them.
 *
 * Only name and phone are required. Every extra field is a reason for someone
 * to abandon the form, and the sales desk can ask the rest on WhatsApp inside
 * five minutes (CLAUDE.md §12).
 */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),

  // Indian mobile numbers are ten digits starting 6–9; an optional +91 or 0
  // prefix is accepted because people type it both ways.
  phone: z
    .string()
    .trim()
    .regex(/^(\+?91[-\s]?|0)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),

  projectSlug: z.string().optional(),
  budget: z.string().optional(),
  possession: z.string().optional(),
  isNri: z.boolean().default(false),

  // DPDP Act 2023 §6 requires consent that is free, specific, informed and
  // unambiguous. The box ships unticked, and an unticked box is not consent —
  // hence a boolean that must refine to true rather than a literal, so the
  // form can hold `false` as its starting value.
  consent: z.boolean().refine((value) => value === true, {
    message: "Please agree to be contacted so we can respond",
  }),

  source: z.enum(["contact", "project", "site_visit"]).default("contact"),

  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Deliberately permissive: rejecting it here would return a 422 that tells
   * the bot exactly which field gave it away. The route checks it instead and
   * answers 200, so the bot leaves believing it succeeded.
   */
  company: z.string().optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryData = z.output<typeof enquirySchema>;

export const BUDGET_OPTIONS = [
  "Under ₹1 Cr",
  "₹1–1.5 Cr",
  "₹1.5–2.5 Cr",
  "₹2.5 Cr+",
] as const;

export const POSSESSION_OPTIONS = [
  "Ready to move",
  "Within 1 year",
  "1–3 years",
  "Flexible",
] as const;
