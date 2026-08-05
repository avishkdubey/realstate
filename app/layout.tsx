import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_Gujarati } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StickyMobileActionBar } from "@/components/layout/sticky-mobile-action-bar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { ReducedMotionProvider } from "@/components/providers/reduced-motion-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";
import { organizationSchema } from "@/lib/structured-data";

import "./globals.css";

/* Two families, no more. Both self-hosted through next/font and subset, so
   there is no render-blocking request to a font CDN. */
/* Only the optical-size axis is requested. Fraunces also ships SOFT and WONK,
   and carrying all three costs ~118KB on the critical path for two decorative
   axes this design never varies. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/* Scoped to :lang(gu) in globals.css, so `preload: false` is essential —
   otherwise ~110KB of Gujarati glyphs is fetched on the critical path of
   every English page that will never render one of them. */
const notoGujarati = Noto_Sans_Gujarati({
  variable: "--font-noto-gujarati",
  subsets: ["gujarati"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Residences in Ahmedabad`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Residences in Ahmedabad`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Residences in Ahmedabad`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${manrope.variable} ${notoGujarati.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationSchema()} />
        <ReducedMotionProvider>
          <LenisProvider />
          <a
            href="#main"
            className="bg-charcoal text-ivory sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:rounded-sm focus:px-4 focus:py-3"
          >
            Skip to content
          </a>
          <SiteHeader />
          {/* pb-16 clears the sticky mobile action bar. */}
          <main id="main" className="flex-1 pb-16 lg:pb-0">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppFab />
          <StickyMobileActionBar />
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
