"use client";

import { useState } from "react";

import { formatArea, priceLabel } from "@/lib/format";
import type { Project } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Brochure access.
 *
 * The preview is ungated on purpose: hard form-gates are what make sceptical
 * buyers bounce, and everything in a brochure is already on this page. The
 * optional name-and-phone step exists for people who would rather be called,
 * and it hands off to WhatsApp afterwards (CLAUDE.md §5, §12).
 */
export function BrochureDownload({ project }: { project: Project }) {
  const [showGate, setShowGate] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project.brochureUrl) return null;

  const download = () => {
    window.open(project.brochureUrl, "_blank", "noopener");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, projectSlug: project.slug }),
      });
      if (!response.ok) throw new Error("failed");
      download();
      setShowGate(false);
    } catch {
      setError(
        "We couldn't record that. The brochure is downloading anyway — nothing here is held back.",
      );
      download();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-border p-8">
      <p className="eyebrow text-bronze">Brochure</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Preview label="Configurations" value={project.bhkOptions.join(" · ")} />
        <Preview label="Carpet area" value={formatArea(project)} />
        <Preview label="Starting at" value={priceLabel(project)} />
        <Preview
          label="Possession"
          value={project.possession ?? "Delivered"}
        />
      </dl>

      <p className="measure text-small text-muted-foreground mt-6">
        Everything in the brochure is already on this page. Take it anyway if
        you want something to show at home.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={download}
          className="eyebrow bg-charcoal text-ivory rounded-sm px-8 py-4 transition-opacity duration-200 hover:opacity-90"
        >
          Download — no details needed
        </button>
        {!showGate && (
          <button
            type="button"
            onClick={() => setShowGate(true)}
            className="eyebrow border-foreground rounded-sm border px-8 py-4"
          >
            Download and have someone call me
          </button>
        )}
      </div>

      {showGate && (
        <form onSubmit={submit} className="mt-8 max-w-md space-y-6">
          <label className="block">
            <span className="eyebrow text-muted-foreground">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              autoComplete="name"
              className="mt-2 w-full border-0 border-b border-border bg-transparent py-3 outline-none focus:border-bronze"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Mobile number</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern="^(\+?91[-\s]?|0)?[6-9]\d{9}$"
              className="mt-2 w-full border-0 border-b border-border bg-transparent py-3 outline-none focus:border-bronze"
            />
          </label>

          {error && <p className="text-small text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={sending}
              className="eyebrow bg-charcoal text-ivory rounded-sm px-8 py-4 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send and download"}
            </button>
            <a
              href={whatsappLink({
                project: project.name,
                microMarket: project.microMarket,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow text-bronze border-b border-current pb-1"
            >
              Or ask on WhatsApp
            </a>
          </div>

          <p className="text-caption text-muted-foreground">
            We use these details only to call you about this project. See the{" "}
            <a href="/privacy" className="underline underline-offset-4">
              privacy policy
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-small">{value}</dd>
    </div>
  );
}
