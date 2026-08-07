"use client";

import { useSyncExternalStore } from "react";

/**
 * What we remember about a visitor, and nothing more.
 *
 * This is the first persistence of any kind in the codebase — before this the
 * only storage anywhere was a one-shot reload guard in `app/error.tsx`. So the
 * rules are worth stating plainly rather than assuming:
 *
 * A name is personal data under the DPDP Act 2023 §6, which `lib/enquiry-schema.ts`
 * already takes seriously for the enquiry form. The position taken here is that
 * this is a *local convenience*, not a collection:
 *
 *  - it never leaves the browser. No request carries it, no analytics sees it.
 *  - the gate says so in plain words next to the input.
 *  - `clear()` is wired to a visible control, so withdrawal is one click.
 *  - it prefills the enquiry form's visible name field, but the form's own
 *    consent checkbox still governs whether anything is ever sent.
 *
 * If any of that stops being true — if someone later logs the name to GA4, say
 * — the copy in the gate becomes a false statement, and that is a compliance
 * problem rather than a tidiness one.
 */

const KEY = "kautilya:visitor";

export type VisitorRecord = {
  /** Schema version, so a future shape change can be migrated or discarded. */
  v: 1;
  /** Null when the visitor skipped rather than answered. */
  name: string | null;
  /** Epoch ms. Presence of a record at all is what suppresses the gate. */
  greetedAt: number;
};

/* `getSnapshot` must return a referentially stable value or React re-renders
   forever, so the parsed record is cached and only replaced on a real write. */
let cached: VisitorRecord | null = null;
let loaded = false;
const subscribers = new Set<() => void>();

function read(): VisitorRecord | null {
  if (loaded) return cached;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return (cached = null);
    const parsed = JSON.parse(raw) as VisitorRecord;
    cached = parsed?.v === 1 ? parsed : null;
  } catch {
    // Private mode, a full quota, or someone hand-edited the value. A visitor
    // who cannot be remembered simply sees the greeting again.
    cached = null;
  }
  return cached;
}

function write(record: VisitorRecord | null) {
  cached = record;
  loaded = true;
  try {
    if (record) window.localStorage.setItem(KEY, JSON.stringify(record));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* Storage is a nicety here, never a requirement. */
  }
  for (const notify of subscribers) notify();
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  // Keeps two open tabs in agreement, and picks up a clear() from elsewhere.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    loaded = false;
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Strips anything that is not plausibly part of a name.
 *
 * Applied at the write boundary rather than at the point of use, because the
 * value flows onward into the enquiry form and from there into an email body.
 * Unicode letter and mark classes keep Gujarati, Devanagari and accented Latin
 * intact — this audience is not all ASCII.
 */
export function sanitiseName(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}'\-. ]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

export function rememberName(raw: string) {
  const name = sanitiseName(raw);
  write({ v: 1, name: name.length > 0 ? name : null, greetedAt: Date.now() });
}

/** Records that the visitor was greeted without giving a name. */
export function rememberSkip() {
  write({ v: 1, name: null, greetedAt: Date.now() });
}

/** The DPDP withdrawal path. Surfaced as "Not you?" in the footer. */
export function forgetVisitor() {
  write(null);
}

/**
 * The stored record, or null.
 *
 * The server snapshot is always null — assume nobody has been greeted, so the
 * server HTML is identical for every visitor and stays cacheable. The gate then
 * appears (or does not) after hydration.
 */
export function useVisitor(): VisitorRecord | null {
  return useSyncExternalStore(
    subscribe,
    read,
    () => null,
  );
}
