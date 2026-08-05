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
  towers: Tower[];
  amenityIds: string[];
  specifications: { group: string; items: string[] }[];
  faqs: { q: string; a: string }[];
  /** Dated construction updates. Built out with real photography in Phase 2. */
  progress: { date: string; caption: string }[];
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
