import { NextResponse } from "next/server";

import { enquirySchema } from "@/lib/enquiry-schema";
import { siteConfig } from "@/lib/site-config";

/**
 * Receives an enquiry, validates it, and emails the sales desk.
 *
 * Email is best-effort by design: if RESEND_API_KEY is absent the lead is
 * logged and the request still succeeds, so the demo build works with no
 * credentials and a misconfigured key never costs a real lead. The client
 * hands off to WhatsApp regardless — that is the channel that actually gets
 * answered.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const enquiry = parsed.data;

  // Honeypot tripped. Return 200 so the bot believes it succeeded.
  if (enquiry.company) {
    return NextResponse.json({ ok: true });
  }

  // Drop the honeypot and any optional field the visitor left blank, so the
  // sales desk reads a lead rather than a form dump.
  const fields = { ...enquiry, company: undefined };
  const record = {
    ...Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== "" && value !== undefined),
    ),
    createdAt: new Date().toISOString(),
  };

  try {
    await notifySales(record);
  } catch (error) {
    // Never fail the visitor's submission because our mail provider is down.
    console.error("[enquiry] notification failed", error);
  }

  console.info("[enquiry]", record);

  return NextResponse.json({ ok: true });
}

async function notifySales(record: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[enquiry] RESEND_API_KEY not set — logging lead only");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const lines = Object.entries(record)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  await resend.emails.send({
    from: process.env.ENQUIRY_FROM_EMAIL ?? "enquiries@example.com",
    to: process.env.ENQUIRY_TO_EMAIL ?? siteConfig.email,
    subject: `New enquiry — ${record.name} (${record.phone})`,
    text: `A new enquiry arrived from the website.\n\n${lines}\n\nCall or WhatsApp within five minutes if you can.`,
  });
}
