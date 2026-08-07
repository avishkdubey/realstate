import { siteConfig } from "@/lib/site-config";
import type { Project } from "@/lib/types";

/**
 * The statutory disclosure block.
 *
 * RERA Act §11(2) requires the registration number and the authority's website
 * to appear prominently in every advertisement, and GujRERA Order No. 108
 * (effective 15 June 2025) adds a QR code at a font no smaller than the
 * contact number. §12 makes the promoter liable for misleading statements
 * regardless of any disclaimer, so nothing here is decorative.
 *
 * The QR slot is intentionally empty until a real registration exists —
 * a QR code pointing nowhere is worse than none.
 */
export function ReraBlock({ project }: { project: Project }) {
  const isDemo = project.reraNumber === "DEMO-PENDING";

  return (
    <div className="border border-border p-8">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div>
          <p className="eyebrow text-accent">Statutory disclosure</p>
          <p className="mt-4 text-base">
            {siteConfig.rera.authority} Registration No.{" "}
            <span className="font-medium">{project.reraNumber}</span>
          </p>
          <p className="mt-2 text-base">
            <a
              href={siteConfig.rera.authorityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {siteConfig.rera.authorityUrl}
            </a>
          </p>
        </div>

        <div
          className="flex h-28 w-28 shrink-0 items-center justify-center border border-dashed border-border p-2 text-center"
          role="img"
          aria-label="RERA QR code placeholder"
        >
          <span className="text-caption text-muted-foreground leading-tight">
            QR code
            <br />
            on registration
          </span>
        </div>
      </div>

      {isDemo && (
        <p className="measure text-caption text-muted-foreground mt-8 leading-relaxed">
          This is demonstration content. No RERA registration has been obtained
          for this project, and nothing on this page is an offer to sell.
          Advertising or selling an unregistered project is an offence under
          RERA Act §59.
        </p>
      )}

      <p className="measure text-caption text-muted-foreground mt-4 leading-relaxed">
        All renders, plans and layouts shown are an artist&apos;s impression and
        for representational purposes only. Maps are not to scale and are
        indicative. Carpet areas are as defined under the RERA Act. Prices are
        exclusive of GST, stamp duty, registration and other statutory charges,
        and are subject to revision.
      </p>
    </div>
  );
}
