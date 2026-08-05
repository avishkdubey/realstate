import { siteConfig } from "@/lib/site-config";

type WhatsAppContext = {
  /** Project name, e.g. "Aarambh Vantage". */
  project?: string;
  /** Configuration of interest, e.g. "3 BHK". */
  bhk?: string;
  /** Micro-market, e.g. "SG Highway". */
  microMarket?: string;
  /** Overrides the generated message entirely. */
  message?: string;
};

/**
 * Builds a wa.me deep link with a prefilled message.
 *
 * WhatsApp carries ~60–70% of Indian metro property enquiries, so every CTA
 * that can hand off to it should — with context prefilled, so the sales desk
 * can answer in the first five minutes (CLAUDE.md §2, §12).
 */
export function whatsappLink({
  project,
  bhk,
  microMarket,
  message,
}: WhatsAppContext = {}): string {
  const text = message ?? defaultMessage({ project, bhk, microMarket });
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`;
}

function defaultMessage({ project, bhk, microMarket }: WhatsAppContext): string {
  if (!project) {
    return `Hi ${siteConfig.name}, I'd like to know more about your ongoing projects in Ahmedabad. Please share pricing & availability.`;
  }

  const details = [bhk, microMarket].filter(Boolean).join(", ");
  const suffix = details ? ` (${details})` : "";
  return `Hi, I'm interested in ${project}${suffix}. Please share pricing & availability.`;
}

/** `tel:` href stripped of the spaces the display format carries. */
export function telLink(): string {
  return `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
}
