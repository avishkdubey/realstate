"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Menu, X } from "lucide-react";

import { mainNav, siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Transparent over the hero, solid once the visitor commits to scrolling.
 *
 * Only the home route has a dark full-bleed hero to sit over, so the
 * transparent-and-light treatment is scoped to it; every other route gets the
 * solid header from the first pixel. The scroll state flips on a passive
 * listener rather than an observer so it stays correct on refresh-at-offset.
 */
export function SiteHeader() {
  const segment = useSelectedLayoutSegment();
  const overDarkHero = segment === null;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen || !overDarkHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-[var(--ease-transition)]",
        solid
          ? "bg-background text-foreground border-b border-border"
          : "text-ivory bg-transparent",
      )}
    >
      <div className="container-page flex h-20 items-center justify-between gap-8">
        <Link
          href="/"
          className="font-display text-lead tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "eyebrow transition-colors duration-200",
                    solid
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-ivory/75 hover:text-ivory",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "eyebrow rounded-sm border border-current px-5 py-3 transition-colors duration-200",
              solid
                ? "hover:bg-foreground hover:text-background"
                : "hover:bg-ivory hover:text-charcoal",
            )}
          >
            Enquire
          </a>
        </div>

        <button
          type="button"
          className="-mr-2 p-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="bg-background border-t border-border lg:hidden"
        >
          <ul className="container-page flex flex-col py-6">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display block border-b border-border py-5 text-h5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
