/**
 * Domain types for the builder site.
 *
 * These mirror the Sanity schema shape described in CLAUDE.md §10, so the
 * placeholder data layer in `lib/data.ts` can be swapped for a Sanity client
 * without touching a single component.
 */

export type ProjectStatus = "ongoing" | "completed" | "upcoming";
export type Typology = "apartment" | "villa" | "penthouse";
export type UnitStatus = "available" | "sold" | "blocked";

/** The eight compass facings that matter to a Vastu-aware buyer. */
export type Facing =
  | "East"
  | "North-East"
  | "North"
  | "North-West"
  | "West"
  | "South-West"
  | "South"
  | "South-East";

export type Unit = {
  id: string;
  bhk: string;
  /** Carpet area in sq ft — the RERA-defined measure, never super built-up. */
  carpetArea: number;
  facing: Facing;
  status: UnitStatus;
  /** Absolute rupees. Omitted when the project is price-on-request. */
  price?: number;
  /** Keys a layout in `lib/floor-plans.ts`. Real drawings replace these. */
  floorPlanId?: string;
};

export type Tower = {
  id: string;
  name: string;
  floors: number;
  units: Unit[];
};

export type Amenity = {
  id: string;
  name: string;
  category: "wellness" | "social" | "outdoor" | "convenience" | "sustainability";
  description: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  typology: Typology[];
  microMarket: string;
  addressLine: string;
  geo: { lat: number; lng: number };
  bhkOptions: string[];
  carpetAreaMin: number;
  carpetAreaMax: number;
  /** Absolute rupees. Omitted when `priceOnRequest` is true. */
  startingPrice?: number;
  priceOnRequest: boolean;
  /** Human-readable, e.g. "December 2027". Absent for completed projects. */
  possession?: string;
  /**
   * GujRERA registration number. Demo data carries the DEMO-PENDING marker —
   * an invented number here would itself be the §59 offence.
   */
  reraNumber: string;
  /** Dominant facing of the layout, surfaced as a Vastu filter. */
  vastuFacing: Facing;
  summary: string;
  usp: string[];
  /**
   * Client photography and renders under /public/images. `hero` is the wide
   * image used at the top of the project page and on cards.
   */
  images?: { hero?: string; gallery?: string[] };
  towers: Tower[];
  amenityIds: string[];
  specifications: { group: string; items: string[] }[];
  faqs: { q: string; a: string }[];
  /**
   * Dated construction updates, newest first. `stage` drives the schematic
   * visual until real site photography exists.
   */
  progress: {
    date: string;
    caption: string;
    stage?: "excavation" | "foundation" | "structure" | "finishing" | "handover";
  }[];
  /** Path to the downloadable brochure. Demo builds point at a marked stand-in. */
  brochureUrl?: string;
};

/**
 * A micro-market. These pages carry the local-SEO weight — "3 BHK flats in
 * Bopal Ahmedabad" is the query, and a neighbourhood guide is the answer
 * (CLAUDE.md §11).
 */
export type Location = {
  id: string;
  slug: string;
  /** Must match `Project.microMarket` exactly — it is the join key. */
  name: string;
  tagline: string;
  description: string;
  geo: { lat: number; lng: number };
  /**
   * Directional ₹/sq ft band from the CLAUDE.md §1 table. Sources disagree
   * (see §17) — verify against GujRERA and live listings before publishing.
   */
  priceRange: { min: number; max: number };
  /** Percentage appreciation over the stated window, or null where unknown. */
  priceTrend: { window: string; changePercent: number } | null;
  phase: string;
  buyerProfile: string;
  driveTimes: { place: string; minutes: number }[];
  landmarks: {
    name: string;
    type: "school" | "hospital" | "temple" | "retail" | "transit" | "work";
    distanceKm: number;
  }[];
  /** Long-term infrastructure context. Never presented as a commitment. */
  catalysts: string[];
  faqs: { q: string; a: string }[];
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  projectSlug?: string;
};

export type Enquiry = {
  name: string;
  phone: string;
  email?: string;
  projectSlug?: string;
  budget?: string;
  possession?: string;
  isNri: boolean;
  consent: boolean;
  source: "contact" | "project" | "site_visit";
  createdAt: string;
};
