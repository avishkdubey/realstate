import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Records an optional brochure lead.
 *
 * The brochure itself is a static file — this route never gates it. If the
 * request fails the client downloads anyway, because withholding a document
 * over a failed log entry is exactly the behaviour this site is built to avoid.
 */
const brochureLeadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?91[-\s]?|0)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  projectSlug: z.string().optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = brochureLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  console.info("[brochure]", {
    ...parsed.data,
    source: "brochure",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
