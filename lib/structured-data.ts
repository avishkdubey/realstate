import type { Organization, WithContext } from "schema-dts";

import { siteConfig } from "@/lib/site-config";

/**
 * Site-wide Organization / RealEstateAgent graph. Emitted once from the root
 * layout so every route carries the firm's identity, address and socials.
 */
export function organizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: String(siteConfig.foundedYear),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed: "Ahmedabad, Gujarat, India",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.street}, ${siteConfig.address.locality}`,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    openingHours: "Mo-Sa 10:00-19:00",
    sameAs: Object.values(siteConfig.socials),
  };
}
