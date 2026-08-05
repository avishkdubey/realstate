import type { BreadcrumbList, Place, WithContext } from "schema-dts";

import { siteConfig } from "@/lib/site-config";
import type { Location } from "@/lib/types";

/**
 * Structured data for a micro-market page.
 *
 * These pages exist to answer "3 BHK flats in Bopal Ahmedabad" and its
 * neighbours, so the geography has to be machine-readable rather than only
 * described in prose (CLAUDE.md §11).
 */
export function placeSchema(location: Location): WithContext<Place> {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${siteConfig.url}/locations/${location.slug}#place`,
    name: `${location.name}, Ahmedabad`,
    description: location.description,
    url: `${siteConfig.url}/locations/${location.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
  };
}

export function locationBreadcrumbSchema(
  location: Location,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: `${siteConfig.url}/locations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: location.name,
        item: `${siteConfig.url}/locations/${location.slug}`,
      },
    ],
  };
}
