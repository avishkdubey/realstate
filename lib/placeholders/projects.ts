import type { Facing, Project, Tower, Unit, UnitStatus } from "@/lib/types";

/**
 * Six demo projects — two ongoing, two completed, two upcoming — spread across
 * the west Ahmedabad corridors the brief targets (CLAUDE.md §14).
 *
 * Everything here is fabricated for demonstration. Prices are directional
 * figures from the micro-market table in CLAUDE.md §1 and must be replaced
 * with verified numbers before launch. Every RERA number is the DEMO-PENDING
 * marker, never an invented registration.
 */

const DEMO_RERA = "DEMO-PENDING";

/**
 * Builds a tower's unit stack deterministically, so the availability matrix is
 * stable between server and client renders and across builds.
 */
function buildTower(
  id: string,
  name: string,
  floors: number,
  perFloor: { bhk: string; carpetArea: number; facing: Facing; price?: number }[],
  soldThroughFloor: number,
): Tower {
  const units: Unit[] = [];

  for (let floor = 1; floor <= floors; floor++) {
    perFloor.forEach((spec, index) => {
      // Lower floors sell first; a couple of mid-stack units read as blocked.
      let status: UnitStatus = "available";
      if (floor <= soldThroughFloor) status = "sold";
      else if (floor === soldThroughFloor + 1 && index === 0) status = "blocked";

      units.push({
        id: `${id}-${floor}${String.fromCharCode(65 + index)}`,
        bhk: spec.bhk,
        carpetArea: spec.carpetArea,
        facing: spec.facing,
        status,
        // Higher floors carry a modest premium.
        price: spec.price
          ? spec.price + (floor - 1) * 75_000
          : undefined,
      });
    });
  }

  return { id, name, floors, units };
}

export const projects: Project[] = [
  {
    id: "vantage",
    slug: "aarambh-vantage",
    name: "Aarambh Vantage",
    status: "ongoing",
    typology: ["apartment", "penthouse"],
    microMarket: "SG Highway",
    addressLine: "Off SG Highway, Near Gurukul Road, Ahmedabad",
    geo: { lat: 23.0435, lng: 72.5372 },
    bhkOptions: ["3 BHK", "4 BHK"],
    carpetAreaMin: 1650,
    carpetAreaMax: 2850,
    startingPrice: 18_500_000,
    priceOnRequest: false,
    possession: "December 2027",
    reraNumber: DEMO_RERA,
    brochureUrl: "/brochures/demo-brochure.pdf",
    vastuFacing: "East",
    summary:
      "Twenty-two floors on the city's primary corporate artery, planned so every apartment holds a corner and an east light.",
    usp: [
      "Eight minutes from the GIFT City approach road",
      "Three-side open plot, no shared walls between towers",
      "Every home east or north-east facing",
      "Double-height entrance lobby with attended concierge",
    ],
    towers: [
      buildTower(
        "vantage-a",
        "Tower A",
        22,
        [
          { bhk: "3 BHK", carpetArea: 1650, facing: "East", price: 18_500_000 },
          { bhk: "3 BHK", carpetArea: 1780, facing: "North-East", price: 19_800_000 },
          { bhk: "4 BHK", carpetArea: 2400, facing: "East", price: 26_400_000 },
        ],
        9,
      ),
      buildTower(
        "vantage-b",
        "Tower B",
        22,
        [
          { bhk: "3 BHK", carpetArea: 1720, facing: "North-East", price: 19_100_000 },
          { bhk: "4 BHK", carpetArea: 2850, facing: "East", price: 31_200_000 },
        ],
        6,
      ),
    ],
    amenityIds: ["clubhouse", "pool", "gym", "cowork", "ev", "parcel", "kids", "temple"],
    specifications: [
      {
        group: "Structure",
        items: [
          "RCC framed structure, seismic zone III compliant",
          "AAC block masonry with external texture finish",
        ],
      },
      {
        group: "Flooring",
        items: [
          "800×1600mm double-charged vitrified tiles in living and bedrooms",
          "Anti-skid ceramic in balconies and utility",
        ],
      },
      {
        group: "Fittings",
        items: [
          "CP and sanitaryware from Jaquar or equivalent",
          "Modular switches from Legrand or equivalent",
          "Provision for split AC in all bedrooms and living",
        ],
      },
      {
        group: "Safety",
        items: [
          "Fire sprinklers and addressable alarm on every floor",
          "CCTV across common areas with 30-day retention",
          "Video door phone in every apartment",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the carpet area of a 3 BHK at Aarambh Vantage?",
        a: "Carpet areas for the 3 BHK range from 1,650 to 1,780 sq ft, measured to the RERA definition. Super built-up figures are not used in our pricing.",
      },
      {
        q: "When is possession at Aarambh Vantage?",
        a: "The committed possession date is December 2027. It is recorded on the project's RERA registration, and delayed possession carries interest at SBI MCLR plus 2% under the RERA Act.",
      },
      {
        q: "Are the apartments Vastu compliant?",
        a: "Every apartment is east or north-east facing, with the kitchen placed in the south-east and the main entry avoiding the south-west corner.",
      },
      {
        q: "Is home loan funding approved for this project?",
        a: "The project is approved by leading public and private sector lenders. Our sales desk can share the current list and arrange an in-principle sanction.",
      },
    ],
    progress: [
      { date: "2026-06-30", caption: "Tower A — 14th floor slab cast", stage: "structure" },
      {
        date: "2026-03-31",
        caption: "Tower A — 9th floor slab cast; Tower B plinth complete",
        stage: "structure",
      },
      {
        date: "2025-12-20",
        caption: "Excavation and raft foundation complete across both towers",
        stage: "foundation",
      },
    ],
  },

  {
    id: "meadows",
    slug: "aarambh-meadows",
    name: "Aarambh Meadows",
    status: "ongoing",
    typology: ["villa"],
    microMarket: "Shela",
    addressLine: "Shela–Shilaj Road, Ahmedabad",
    geo: { lat: 23.0107, lng: 72.4796 },
    bhkOptions: ["4 BHK", "5 BHK"],
    carpetAreaMin: 3200,
    carpetAreaMax: 4400,
    startingPrice: 24_000_000,
    priceOnRequest: false,
    possession: "June 2028",
    reraNumber: DEMO_RERA,
    brochureUrl: "/brochures/demo-brochure.pdf",
    vastuFacing: "North-East",
    summary:
      "Forty-eight independent villas on a low-density plot, each with its own courtyard and a garden wall you can actually plant against.",
    usp: [
      "Ground-plus-two villas, none sharing a wall",
      "Private courtyard and terrace garden with every home",
      "Six minutes to the SP Ring Road interchange",
      "Underground utilities — no overhead cabling anywhere on site",
    ],
    towers: [
      buildTower(
        "meadows-cluster-1",
        "Cluster 1",
        12,
        [
          { bhk: "4 BHK", carpetArea: 3200, facing: "North-East", price: 24_000_000 },
          { bhk: "5 BHK", carpetArea: 4400, facing: "East", price: 33_500_000 },
        ],
        4,
      ),
      buildTower(
        "meadows-cluster-2",
        "Cluster 2",
        12,
        [
          { bhk: "4 BHK", carpetArea: 3350, facing: "North", price: 25_200_000 },
          { bhk: "5 BHK", carpetArea: 4400, facing: "North-East", price: 34_800_000 },
        ],
        2,
      ),
    ],
    amenityIds: ["clubhouse", "pool", "padel", "kids", "seniors", "pet", "rainwater", "ev"],
    specifications: [
      {
        group: "Structure",
        items: [
          "RCC framed structure with load-bearing compound walls",
          "Terrace waterproofing with 10-year warranty",
        ],
      },
      {
        group: "Flooring",
        items: [
          "Imported marble in living and dining",
          "Engineered wood in master bedroom",
        ],
      },
      {
        group: "Services",
        items: [
          "Individual underground water tank and pump per villa",
          "Solar water heating provision on every terrace",
          "Rainwater recharge pit per cluster",
        ],
      },
    ],
    faqs: [
      {
        q: "How many villas are there at Aarambh Meadows?",
        a: "Forty-eight villas across two clusters, in 4 BHK and 5 BHK configurations from 3,200 to 4,400 sq ft carpet area.",
      },
      {
        q: "Do the villas share walls?",
        a: "No. Every villa is independent, with a private courtyard on the east and a setback on all four sides.",
      },
      {
        q: "What is the possession timeline?",
        a: "June 2028, as registered with GujRERA.",
      },
    ],
    progress: [
      {
        date: "2026-07-15",
        caption: "Cluster 1 — superstructure complete on 8 villas",
        stage: "structure",
      },
      { date: "2026-04-10", caption: "Internal roads and stormwater lines laid", stage: "foundation" },
      { date: "2026-01-05", caption: "Site levelling and boundary wall complete", stage: "excavation" },
    ],
  },

  {
    id: "corniche",
    slug: "aarambh-corniche",
    name: "Aarambh Corniche",
    status: "completed",
    typology: ["apartment"],
    microMarket: "South Bopal",
    addressLine: "South Bopal, Near Shukan Cross Road, Ahmedabad",
    geo: { lat: 23.0281, lng: 72.4658 },
    bhkOptions: ["2 BHK", "3 BHK"],
    carpetAreaMin: 1050,
    carpetAreaMax: 1620,
    startingPrice: 8_900_000,
    priceOnRequest: false,
    reraNumber: DEMO_RERA,
    brochureUrl: "/brochures/demo-brochure.pdf",
    vastuFacing: "North",
    summary:
      "Handed over in 2023 and fully occupied. A working example of what our drawings turn into — and of what we hand over on time.",
    usp: [
      "Delivered four months ahead of the committed date",
      "Full occupancy within eleven months of handover",
      "Society-managed since 2024 with no open snag list",
      "Walking distance to three schools and a hospital",
    ],
    towers: [
      buildTower(
        "corniche-a",
        "Tower A",
        14,
        [
          { bhk: "2 BHK", carpetArea: 1050, facing: "North", price: 8_900_000 },
          { bhk: "3 BHK", carpetArea: 1620, facing: "North-East", price: 13_400_000 },
        ],
        14,
      ),
    ],
    amenityIds: ["clubhouse", "gym", "kids", "seniors", "parcel", "rainwater"],
    specifications: [
      {
        group: "Structure",
        items: ["RCC framed structure", "External weatherproof texture paint"],
      },
      {
        group: "Flooring",
        items: ["600×1200mm vitrified tiles throughout", "Granite kitchen platform"],
      },
    ],
    faqs: [
      {
        q: "Is Aarambh Corniche still selling?",
        a: "No. The project was handed over in 2023 and is fully occupied. Resale units occasionally come to market through the society — our desk can point you to them.",
      },
      {
        q: "Can I visit Aarambh Corniche?",
        a: "Yes. We arrange walkthroughs of delivered projects for buyers considering our ongoing ones. It is the most useful hour you can spend with us.",
      },
    ],
    progress: [
      {
        date: "2023-08-14",
        caption: "Handover complete — occupancy certificate received",
        stage: "handover",
      },
    ],
  },

  {
    id: "sindhu-house",
    slug: "aarambh-sindhu-house",
    name: "Aarambh Sindhu House",
    status: "completed",
    typology: ["apartment", "penthouse"],
    microMarket: "Sindhu Bhavan Road",
    addressLine: "Sindhu Bhavan Road, Bodakdev, Ahmedabad",
    geo: { lat: 23.0388, lng: 72.5052 },
    bhkOptions: ["3 BHK", "4 BHK"],
    carpetAreaMin: 1900,
    carpetAreaMax: 3600,
    priceOnRequest: true,
    reraNumber: DEMO_RERA,
    brochureUrl: "/brochures/demo-brochure.pdf",
    vastuFacing: "East",
    summary:
      "Eighteen apartments and two penthouses on the city's most-watched restaurant street. Delivered 2021; resale only.",
    usp: [
      "One apartment per floor in the east wing",
      "Two duplex penthouses with private plunge pools",
      "Basement plus stilt parking, three cars per home",
    ],
    towers: [
      buildTower(
        "sindhu-a",
        "The House",
        10,
        [
          { bhk: "3 BHK", carpetArea: 1900, facing: "East" },
          { bhk: "4 BHK", carpetArea: 3600, facing: "North-East" },
        ],
        10,
      ),
    ],
    amenityIds: ["gym", "pool", "cowork", "parcel", "ev"],
    specifications: [
      {
        group: "Flooring",
        items: ["Italian marble in living and dining", "Engineered wood in all bedrooms"],
      },
      {
        group: "Services",
        items: ["Two lifts per core, one service", "100% DG backup"],
      },
    ],
    faqs: [
      {
        q: "Why is pricing on request for Aarambh Sindhu House?",
        a: "The project is sold out and delivered. Any price we quoted would be a resale figure set by the owner, not by us, so we would rather connect you directly.",
      },
    ],
    progress: [{ date: "2021-11-02", caption: "Handover complete", stage: "handover" }],
  },

  {
    id: "riverline",
    slug: "aarambh-riverline",
    name: "Aarambh Riverline",
    status: "upcoming",
    typology: ["apartment"],
    microMarket: "GIFT City Corridor",
    addressLine: "Koba–Gandhinagar Highway, near GIFT City, Gandhinagar",
    geo: { lat: 23.1608, lng: 72.6845 },
    bhkOptions: ["2 BHK", "3 BHK"],
    carpetAreaMin: 980,
    carpetAreaMax: 1580,
    startingPrice: 7_200_000,
    priceOnRequest: false,
    possession: "March 2030",
    reraNumber: DEMO_RERA,
    vastuFacing: "North-East",
    summary:
      "Planned for the people GIFT City is hiring. Compact, efficient layouts within a twelve-minute drive of the financial district.",
    usp: [
      "Twelve minutes to the GIFT City tower cluster",
      "Layouts designed around hybrid work — a study alcove in every home",
      "Metro Phase 2 station within two kilometres",
    ],
    towers: [
      buildTower(
        "riverline-a",
        "Tower A",
        18,
        [
          { bhk: "2 BHK", carpetArea: 980, facing: "North-East", price: 7_200_000 },
          { bhk: "3 BHK", carpetArea: 1580, facing: "East", price: 11_600_000 },
        ],
        0,
      ),
    ],
    amenityIds: ["cowork", "gym", "ev", "parcel", "pet", "rainwater"],
    specifications: [
      {
        group: "Structure",
        items: ["Mivan aluminium formwork construction", "AAC block internal partitions"],
      },
    ],
    faqs: [
      {
        q: "Can I book at Aarambh Riverline now?",
        a: "Not yet. The project is pre-registration; we are not accepting bookings or advances until GujRERA registration is granted, as required by RERA Act §3. Join the interest list and we will contact you the day it is.",
      },
      {
        q: "What makes the GIFT City corridor worth watching?",
        a: "GIFT City employs over 25,000 people today with a stated target of 75,000 by 2028. Residential demand follows employment. That said, infrastructure timelines in the corridor have slipped before, and we would rather you weigh that than have us gloss over it.",
      },
    ],
    progress: [],
  },

  {
    id: "north-quarter",
    slug: "aarambh-north-quarter",
    name: "Aarambh North Quarter",
    status: "upcoming",
    typology: ["apartment"],
    microMarket: "Chandkheda",
    addressLine: "New CG Road, Chandkheda, Ahmedabad",
    geo: { lat: 23.1069, lng: 72.5851 },
    bhkOptions: ["2 BHK", "3 BHK"],
    carpetAreaMin: 920,
    carpetAreaMax: 1450,
    priceOnRequest: true,
    possession: "September 2029",
    reraNumber: DEMO_RERA,
    vastuFacing: "East",
    summary:
      "Our first project north of the river. Design is in progress; pricing follows registration.",
    usp: [
      "Four minutes from the Chandkheda metro station",
      "Ground-floor retail kept separate from the residential lobby",
      "Planned to IGBC Gold criteria",
    ],
    towers: [
      buildTower(
        "north-a",
        "Tower A",
        16,
        [
          { bhk: "2 BHK", carpetArea: 920, facing: "East" },
          { bhk: "3 BHK", carpetArea: 1450, facing: "North-East" },
        ],
        0,
      ),
    ],
    amenityIds: ["clubhouse", "gym", "kids", "ev", "rainwater"],
    specifications: [],
    faqs: [
      {
        q: "When will pricing for Aarambh North Quarter be announced?",
        a: "After GujRERA registration. We do not quote prices on unregistered projects.",
      },
    ],
    progress: [],
  },
];
