"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BUDGET_OPTIONS,
  POSSESSION_OPTIONS,
  enquirySchema,
  type EnquiryInput,
} from "@/lib/enquiry-schema";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * The enquiry form.
 *
 * Two required fields, everything else optional. Inputs are underlined rather
 * than boxed, which keeps the page reading as editorial instead of as a
 * database entry screen. On success the visitor is handed straight to
 * WhatsApp — the sales desk answers there, and speed is the whole game.
 */
export function EnquiryForm({
  projectSlug,
  projectName,
  source = "contact",
  className,
}: {
  projectSlug?: string;
  projectName?: string;
  source?: "contact" | "project" | "site_visit";
  className?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { projectSlug, source, isNri: false, consent: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setServerError(
        "We couldn't send that just now. Please WhatsApp us instead — it reaches the same desk.",
      );
    }
  });

  if (submitted) {
    return (
      <div className={cn("border border-border p-8", className)}>
        <p className="font-display text-h5">Thank you — we have your details.</p>
        <p className="measure text-muted-foreground mt-4">
          Someone from the sales desk will call you shortly. If you would rather
          not wait, message us on WhatsApp and we will pick up there.
        </p>
        <a
          href={whatsappLink({ project: projectName })}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow bg-forest text-ivory mt-8 inline-block rounded-sm px-8 py-4"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-8", className)}>
      {/* Honeypot — visually and programmatically hidden from real users. */}
      <div aria-hidden className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Field label="Name" error={errors.name?.message} required>
        <input
          {...register("name")}
          autoComplete="name"
          className={inputClass}
          placeholder="Your full name"
        />
      </Field>

      <Field label="Mobile number" error={errors.phone?.message} required>
        <input
          {...register("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={inputClass}
          placeholder="10-digit mobile number"
        />
      </Field>

      <Field label="Email" error={errors.email?.message} hint="Optional">
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Budget" hint="Optional">
          <select {...register("budget")} className={inputClass} defaultValue="">
            <option value="">No preference</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Possession" hint="Optional">
          <select {...register("possession")} className={inputClass} defaultValue="">
            <option value="">No preference</option>
            {POSSESSION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          {...register("isNri")}
          className="mt-1 h-4 w-4 accent-[var(--bronze)]"
        />
        <span className="text-small">
          I am an NRI — please call me in my timezone
        </span>
      </label>

      {/* DPDP Act 2023 §6: consent must be free, specific, informed and
          unambiguous, so this box ships unticked and the form will not submit
          without it. */}
      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 h-4 w-4 accent-[var(--bronze)]"
          />
          <span className="text-small text-muted-foreground">
            I agree to be contacted by phone, WhatsApp or email about this
            enquiry, and I have read the{" "}
            <a href="/privacy" className="text-foreground underline underline-offset-4">
              privacy policy
            </a>
            . I can withdraw this consent at any time.
          </span>
        </label>
        {errors.consent && (
          <p className="text-small text-destructive mt-2">{errors.consent.message}</p>
        )}
      </div>

      {serverError && <p className="text-small text-destructive">{serverError}</p>}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="eyebrow bg-charcoal text-ivory rounded-sm px-10 py-4 transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-caption text-muted-foreground mt-4">
          Your details go to our sales desk only. We never sell or share them.
        </p>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors duration-200 focus:border-bronze placeholder:text-muted-foreground/60";

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground flex items-baseline gap-2">
        {label}
        {required && <span className="text-bronze">*</span>}
        {hint && <span className="normal-case tracking-normal">({hint})</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="text-small text-destructive mt-2">{error}</p>}
    </label>
  );
}
