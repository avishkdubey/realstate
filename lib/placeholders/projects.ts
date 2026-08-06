import type { Facing, Project, Tower, Unit, UnitStatus } from "@/lib/types";

/**
 * Kautilya Group's portfolio.
 *
 * Project names, statuses and imagery come from the client's existing site.
 * Everything that site does not publish — pricing, carpet areas, possession
 * dates, unit inventory and RERA registration numbers — is marked as awaiting
 * client input rather than invented. Fabricating any of those on a live
 * builder's website is a §12 misleading-statement exposure, and inventing a
 * RERA number is a §59 offence.
 *
 * TODO(client): supply per-project carpet areas, price bands, possession
 * dates, unit availability and GujRERA registration numbers.
 */

/** Until the client supplies registrations, nothing here claims one. */
const RERA_PENDING = "AWAITING CLIENT";

/**
 * Placeholder inventory so the availability view has something to render.
 * Replace wholesale with the sales desk's real stack — these counts are
 * illustrative and are labelled as such on the project page.
 */
function buildTower(
  id: string,
  name: string,
  floors: number,
  perFloor: { bhk: string; facing: Facing }[],
  soldThroughFloor: number,
): Tower {
  const units: Unit[] = [];

  for (let floor = 1; floor <= floors; floor++) {
    perFloor.forEach((spec, index) => {
      let status: UnitStatus = "available";
      if (floor <= soldThroughFloor) status = "sold";
      else if (floor === soldThroughFloor + 1 && index === 0) status = "blocked";

      units.push({
        id: `${id}-${floor}${String.fromCharCode(65 + index)}`,
        bhk: spec.bhk,
        carpetArea: 0,
        facing: spec.facing,
        status,
      });
    });
  }

  return { id, name, floors, units };
}

export const projects: Project[] = [
  /* ---------------------------------------------------------------- ONGOING */
  {
    id: "two20",
    slug: "kautilya-two20",
    name: "Kautilya Two20",
    status: "ongoing",
    typology: ["apartment"],
    microMarket: "Shilaj",
    addressLine: "Shilaj Circle, Shilaj, Ahmedabad",
    geo: { lat: 23.0364, lng: 72.4735 },
    bhkOptions: ["3 BHK"],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary:
      "Our own address, and the one we know best. Kautilya Two20 stands at Shilaj Circle, minutes from the SG Highway corridor and the schools and hospitals that have grown up around it.",
    usp: [
      "At Shilaj Circle, minutes from the SG Highway corridor",
      "Gated planning with dedicated resident parking",
      "Close to established schools, hospitals and daily retail",
      "Home to the Kautilya Group sales office — see finished common areas on the same visit",
    ],
    images: {
      hero: "/images/projects/two20-slider.webp",
      gallery: [
        "/images/projects/bird-view.webp",
        "/images/projects/day-corner-new.webp",
      ],
    },
    towers: [
      buildTower(
        "two20-a",
        "Tower A",
        14,
        [
          { bhk: "3 BHK", facing: "East" },
          { bhk: "3 BHK", facing: "North-East" },
        ],
        6,
      ),
    ],
    amenityIds: ["clubhouse", "gym", "kids", "parcel", "ev", "rainwater"],
    specifications: [],
    faqs: [
      {
        q: "Where exactly is Kautilya Two20?",
        a: "At Shilaj Circle, near Shridhar Corporate House, Shilaj, Ahmedabad 380059. Our sales office is in the building, so you can see finished common areas on the same visit.",
      },
      {
        q: "What configurations are available at Kautilya Two20?",
        a: "3 BHK apartments. Carpet areas and current availability come from our sales desk — call or message us and we will send the current stack rather than a brochure figure.",
      },
    ],
    progress: [],
  },

  {
    id: "one54",
    slug: "kautilya-one54",
    name: "Kautilya One54",
    status: "ongoing",
    typology: ["apartment"],
    microMarket: "Ahmedabad West",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0395, lng: 72.5066 },
    bhkOptions: ["3 BHK"],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "North-East",
    summary:
      "A residential development in west Ahmedabad, currently under construction.",
    usp: [
      "West Ahmedabad location with established connectivity",
      "Contemporary elevation and planned common areas",
      "Built by a group delivering in Ahmedabad since 1996",
    ],
    images: {
      hero: "/images/projects/one54-slider.webp",
      gallery: ["/images/projects/day-corner-new.webp"],
    },
    towers: [
      buildTower(
        "one54-a",
        "Tower A",
        12,
        [
          { bhk: "3 BHK", facing: "North-East" },
          { bhk: "3 BHK", facing: "East" },
        ],
        4,
      ),
    ],
    amenityIds: ["clubhouse", "gym", "kids", "seniors", "ev"],
    specifications: [],
    faqs: [
      {
        q: "Is Kautilya One54 ready to move in?",
        a: "No — it is under construction. Our sales desk can share the current stage and the committed possession date recorded on the project's registration.",
      },
    ],
    progress: [],
  },

  {
    id: "nilay",
    slug: "kautilya-nilay",
    name: "Kautilya Nilay",
    status: "ongoing",
    typology: ["apartment"],
    microMarket: "Ahmedabad West",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0421, lng: 72.4902 },
    bhkOptions: ["3 BHK"],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary:
      "Apartments planned around generous balconies and daylight, currently under construction in west Ahmedabad.",
    usp: [
      "Deep balconies to every principal room",
      "Planned for cross-ventilation and morning light",
      "Resident parking and a landscaped approach",
    ],
    images: {
      hero: "/images/projects/nilay-balcony.webp",
      gallery: ["/images/projects/nilay-road-corner.webp"],
    },
    towers: [
      buildTower(
        "nilay-a",
        "Tower A",
        13,
        [
          { bhk: "3 BHK", facing: "East" },
          { bhk: "3 BHK", facing: "North" },
        ],
        5,
      ),
    ],
    amenityIds: ["clubhouse", "gym", "pool", "kids", "rainwater"],
    specifications: [],
    faqs: [],
    progress: [],
  },

  /* --------------------------------------------------------------- UPCOMING */
  {
    id: "crystal",
    slug: "the-crystal-by-kautilya",
    name: "The Crystal by Kautilya",
    status: "upcoming",
    typology: ["apartment"],
    microMarket: "Ahmedabad West",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0348, lng: 72.4811 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary:
      "Announced and in planning. We do not quote prices or accept bookings on a project before it is registered.",
    usp: ["In planning — details follow registration"],
    images: { hero: "/images/projects/crystal-teaser.webp" },
    towers: [],
    amenityIds: [],
    specifications: [],
    faqs: [
      {
        q: "Can I book at The Crystal by Kautilya now?",
        a: "Not yet. Under RERA Act §3 a project cannot be advertised or sold before registration, so we are not taking bookings or advances. Join the interest list and we will contact you the day it is registered.",
      },
    ],
    progress: [],
  },

  {
    id: "kautilya-70",
    slug: "kautilya-70",
    name: "Kautilya 70",
    status: "upcoming",
    typology: ["apartment"],
    microMarket: "Ahmedabad West",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0457, lng: 72.4968 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary: "Announced and in planning. Details follow registration.",
    usp: ["In planning — details follow registration"],
    images: { hero: "/images/projects/coming-soon.webp" },
    towers: [],
    amenityIds: [],
    specifications: [],
    faqs: [],
    progress: [],
  },

  /* -------------------------------------------------------------- COMPLETED */
  {
    id: "kautilya-99",
    slug: "kautilya-99",
    name: "Kautilya 99",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0512, lng: 72.5121 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/kautilya-99.webp" },
    towers: [],
    amenityIds: ["clubhouse", "gym"],
    specifications: [],
    faqs: [
      {
        q: "Can I visit Kautilya 99?",
        a: "Yes. We arrange walkthroughs of delivered buildings for buyers considering our ongoing ones — it is the most useful hour you can spend with us, because you get to ask the residents rather than us.",
      },
    ],
    progress: [],
  },

  {
    id: "kautilya-56",
    slug: "kautilya-56",
    name: "Kautilya 56",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0498, lng: 72.5183 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "North-East",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/kautilya-56.webp" },
    towers: [],
    amenityIds: ["clubhouse"],
    specifications: [],
    faqs: [],
    progress: [],
  },

  {
    id: "royal",
    slug: "kautilya-royal",
    name: "Kautilya Royal",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0561, lng: 72.5247 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/royal.webp" },
    towers: [],
    amenityIds: ["clubhouse", "kids"],
    specifications: [],
    faqs: [],
    progress: [],
  },

  {
    id: "residency",
    slug: "kautilya-the-residency",
    name: "Kautilya The Residency",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0587, lng: 72.5309 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "North",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/residency.webp" },
    towers: [],
    amenityIds: ["clubhouse", "seniors"],
    specifications: [],
    faqs: [],
    progress: [],
  },

  {
    id: "eastface",
    slug: "eastface",
    name: "Eastface",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0473, lng: 72.5402 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "East",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/eastface.webp" },
    towers: [],
    amenityIds: [],
    specifications: [],
    faqs: [],
    progress: [],
  },

  {
    id: "westface",
    slug: "westface",
    name: "Westface",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0466, lng: 72.5138 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "West",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/westface.webp" },
    towers: [],
    amenityIds: [],
    specifications: [],
    faqs: [],
    progress: [],
  },

  {
    id: "mahogany",
    slug: "mahogany",
    name: "Mahogany",
    status: "completed",
    typology: ["apartment"],
    microMarket: "Ahmedabad",
    addressLine: "Ahmedabad",
    geo: { lat: 23.0629, lng: 72.5451 },
    bhkOptions: [],
    carpetAreaMin: 0,
    carpetAreaMax: 0,
    priceOnRequest: true,
    reraNumber: RERA_PENDING,
    vastuFacing: "North-East",
    summary: "Delivered and occupied. Resale only.",
    usp: ["Delivered and fully occupied"],
    images: { hero: "/images/projects/mahogany.webp" },
    towers: [],
    amenityIds: [],
    specifications: [],
    faqs: [],
    progress: [],
  },
];

/**
 * Earlier deliveries the client lists without individual pages. They matter:
 * a track record this long is the strongest trust signal a builder has
 * (CLAUDE.md §2).
 */
export const pastProjects = [
  { name: "Sakal Homes and Bungalows", location: "Chandkheda" },
  { name: "Podar School", location: "Chandkheda" },
  { name: "Podar School", location: "Vastral" },
  { name: "Utsav Complex", location: "Chandkheda" },
  { name: "Rajgiri Apartment", location: "Nava Vadaj" },
  { name: "Adishwar Apartment", location: "Nava Vadaj" },
  { name: "Tirthbhumi Apartment", location: "Thaltej" },
] as const;
