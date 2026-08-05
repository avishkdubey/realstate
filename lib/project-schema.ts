import type {
  Apartment,
  BreadcrumbList,
  FAQPage,
  SingleFamilyResidence,
  WithContext,
} from "schema-dts";

import { siteConfig } from "@/lib/site-config";
import type { Project } from "@/lib/types";

/**
 * Structured data for a project page (CLAUDE.md §11).
 *
 * `Residence` with a nested `Offer` is what lets a search engine — or an AI
 * assistant answering "3 BHK on SG Highway under ₹2 crore" — read the price,
 * the carpet area and the location as facts rather than as prose.
 */
export function residenceSchema(
  project: Project,
): WithContext<Apartment> | WithContext<SingleFamilyResidence> {
  // Villa projects are SingleFamilyResidence; everything else is Apartment.
  // Both are Accommodation subtypes, so both carry numberOfRooms and
  // floorSize — the two facts a search engine most needs from this page.
  const isVilla =
    project.typology.length === 1 && project.typology[0] === "villa";

  const body = accommodationBody(project);

  return isVilla
    ? { "@context": "https://schema.org", "@type": "SingleFamilyResidence", ...body }
    : { "@context": "https://schema.org", "@type": "Apartment", ...body };
}

/** The shape both accommodation types share. */
function accommodationBody(project: Project) {
  // BHK counts expressed as a range, because numberOfRooms takes a number or a
  // QuantitativeValue — "3 BHK, 4 BHK" is prose, and a crawler cannot use it.
  const roomCounts = project.bhkOptions
    .map((option) => parseInt(option, 10))
    .filter((count) => !Number.isNaN(count));

  return {
    "@id": `${siteConfig.url}/projects/${project.slug}#residence`,
    name: project.name,
    description: project.summary,
    url: `${siteConfig.url}/projects/${project.slug}`,
    address: {
      "@type": "PostalAddress" as const,
      streetAddress: project.addressLine,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates" as const,
      latitude: project.geo.lat,
      longitude: project.geo.lng,
    },
    numberOfRooms: {
      "@type": "QuantitativeValue" as const,
      minValue: Math.min(...roomCounts),
      maxValue: Math.max(...roomCounts),
      unitText: "BHK",
    },
    floorSize: {
      "@type": "QuantitativeValue" as const,
      minValue: project.carpetAreaMin,
      maxValue: project.carpetAreaMax,
      // FTK is the UN/CEFACT code for square foot.
      unitCode: "FTK",
    },
    ...(project.startingPrice && !project.priceOnRequest
      ? {
          makesOffer: {
            "@type": "Offer" as const,
            price: project.startingPrice,
            priceCurrency: "INR",
            availability:
              project.status === "completed"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            seller: { "@id": `${siteConfig.url}/#organization` },
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(project: Project): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${siteConfig.url}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: `${siteConfig.url}/projects/${project.slug}`,
      },
    ],
  };
}

/** FAQ markup is the highest-leverage schema for AI citation retrieval. */
export function faqSchema(faqs: { q: string; a: string }[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
