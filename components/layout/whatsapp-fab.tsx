import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/whatsapp";

/**
 * Persistent WhatsApp bubble for desktop. Deliberately chosen over exit-intent
 * or screen-blocking pop-ups, which this audience reads as hard-sell.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="bg-forest-lift text-ivory ring-hairline-strong hover:ring-hairline fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full ring-1 transition-all duration-200 lg:flex"
    >
      <MessageCircle size={22} aria-hidden />
    </a>
  );
}
