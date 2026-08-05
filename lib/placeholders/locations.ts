import type { Location } from "@/lib/types";

/**
 * The six west-Ahmedabad corridors the portfolio sits in.
 *
 * Price bands are the directional figures from the CLAUDE.md §1 table, drawn
 * from developer and portal sources that disagree with one another (§17 records
 * the conflicts — South Bopal in particular is quoted anywhere from ₹4,200 to
 * ₹7,500). Every number here must be verified against GujRERA and live listings
 * before this site is published.
 *
 * `name` must match `Project.microMarket` exactly — that string is the join.
 */
export const locations: Location[] = [
  {
    id: "sg-highway",
    slug: "sg-highway",
    name: "SG Highway",
    tagline: "The corporate spine, and the city's most rented address.",
    description:
      "Sarkhej–Gandhinagar Highway is where Ahmedabad's offices went, and housing followed. It carries the highest rental yields in the city and the tightest premium supply, which is a polite way of saying good stock does not sit here long. What you are buying is proximity: to work, to the airport road, and to the GIFT City approach.",
    geo: { lat: 23.0435, lng: 72.5372 },
    priceRange: { min: 5500, max: 12000 },
    priceTrend: { window: "2020–25", changePercent: 33 },
    phase: "Mature · premium",
    buyerProfile: "Corporate executives and high-net-worth buyers",
    driveTimes: [
      { place: "GIFT City", minutes: 35 },
      { place: "SVP International Airport", minutes: 30 },
      { place: "Prahlad Nagar", minutes: 12 },
      { place: "Ahmedabad Junction", minutes: 25 },
    ],
    landmarks: [
      { name: "Zydus Hospital", type: "hospital", distanceKm: 2.1 },
      { name: "Udgam School", type: "school", distanceKm: 3.4 },
      { name: "Ahmedabad One Mall", type: "retail", distanceKm: 4.2 },
      { name: "Corporate Road offices", type: "work", distanceKm: 5.0 },
    ],
    catalysts: [
      "Metro Phase 2 extends the network towards Gandhinagar and GIFT City",
      "Continued office absorption along Corporate Road and Prahlad Nagar",
    ],
    faqs: [
      {
        q: "What does a 3 BHK on SG Highway cost?",
        a: "Premium projects along the corridor trade between roughly ₹5,500 and ₹12,000 per sq ft, so a 1,650 sq ft 3 BHK typically lands between ₹1.6 crore and ₹2.2 crore depending on the project and the floor. Verify against current listings — the range is wide and moves.",
      },
      {
        q: "Is SG Highway a good rental investment?",
        a: "It carries among the strongest yields in Ahmedabad, roughly 3.5–5%, because the tenant pool is corporate and close to work. That said, yields are a function of purchase price, and premium stock here is not cheap.",
      },
    ],
  },

  {
    id: "shela",
    slug: "shela",
    name: "Shela",
    tagline: "Room to plan properly, and roads wide enough to prove it.",
    description:
      "Shela is what happens when a corridor gets planned before it gets built. Plots are larger, setbacks are real, and the SP Ring Road interchange puts the rest of the city within reach without putting it outside your window. It suits families who want space more than they want a postcode.",
    geo: { lat: 23.0107, lng: 72.4796 },
    priceRange: { min: 4500, max: 7000 },
    priceTrend: { window: "2020–25", changePercent: 28 },
    phase: "High growth · mid-premium",
    buyerProfile: "Nuclear families and young professionals",
    driveTimes: [
      { place: "SP Ring Road interchange", minutes: 6 },
      { place: "SG Highway", minutes: 15 },
      { place: "GIFT City", minutes: 45 },
      { place: "Bopal", minutes: 10 },
    ],
    landmarks: [
      { name: "Anand Niketan School", type: "school", distanceKm: 2.8 },
      { name: "Shalby Hospital", type: "hospital", distanceKm: 5.5 },
      { name: "ISKCON Temple", type: "temple", distanceKm: 6.0 },
      { name: "Shela retail strip", type: "retail", distanceKm: 1.2 },
    ],
    catalysts: [
      "SP Ring Road has already re-rated land here — ₹500–1,000 per sq yd before it, ₹3,500–5,500 after",
      "Social infrastructure is still arriving; schools have outpaced healthcare",
    ],
    faqs: [
      {
        q: "Is Shela better value than SG Highway?",
        a: "On rupees per square foot, comfortably — roughly ₹4,500–7,000 against ₹5,500–12,000. You are trading immediate proximity to offices for space and newer planning. Whether that is 'better' depends on how you commute.",
      },
      {
        q: "What is missing in Shela today?",
        a: "Healthcare, mostly. Schools and daily retail have arrived; the nearest major hospitals are still a fifteen-minute drive. We would rather say so than let you find out after moving.",
      },
    ],
  },

  {
    id: "south-bopal",
    slug: "south-bopal",
    name: "South Bopal",
    tagline: "Established, dense, and genuinely walkable.",
    description:
      "South Bopal filled in years ago, and that is the point: the schools, clinics and grocers are already here and already good. Buildings sit closer together than in Shela and the roads are busier, but nothing you need requires a car.",
    geo: { lat: 23.0281, lng: 72.4658 },
    priceRange: { min: 5100, max: 7500 },
    priceTrend: { window: "2020–25", changePercent: 26 },
    phase: "Established · high density",
    buyerProfile: "Salaried professionals and value-focused investors",
    driveTimes: [
      { place: "SG Highway", minutes: 12 },
      { place: "Shela", minutes: 10 },
      { place: "Prahlad Nagar", minutes: 18 },
      { place: "SVP International Airport", minutes: 40 },
    ],
    landmarks: [
      { name: "Zebar School", type: "school", distanceKm: 1.5 },
      { name: "Sterling Hospital", type: "hospital", distanceKm: 2.2 },
      { name: "Shukan Mall", type: "retail", distanceKm: 1.0 },
      { name: "Bopal BRTS stop", type: "transit", distanceKm: 1.8 },
    ],
    catalysts: [
      "Little new land left — future supply is largely redevelopment",
      "Rental demand stays firm at roughly 3.5–4.5% on the back of the schools",
    ],
    faqs: [
      {
        q: "Why do price quotes for South Bopal vary so much?",
        a: "Because the corridor spans older mid-market societies and newer premium towers on the same roads. Published averages between ₹4,200 and ₹7,500 per sq ft are both defensible depending on which stock is sampled. Ask what a specific building trades at, not what the area averages.",
      },
    ],
  },

  {
    id: "sindhu-bhavan-road",
    slug: "sindhu-bhavan-road",
    name: "Sindhu Bhavan Road",
    tagline: "Where the city goes out to dinner.",
    description:
      "A short, dense, watched stretch of restaurants, studios and offices, with very little residential stock and almost no new land. Living here means walking to everything and paying for the privilege. Supply is measured in individual buildings, not in projects.",
    geo: { lat: 23.0388, lng: 72.5052 },
    priceRange: { min: 7000, max: 11000 },
    priceTrend: { window: "2020–25", changePercent: 31 },
    phase: "Ultra-premium · supply constrained",
    buyerProfile: "High-net-worth buyers and returning NRIs",
    driveTimes: [
      { place: "SG Highway", minutes: 8 },
      { place: "Bodakdev", minutes: 5 },
      { place: "SVP International Airport", minutes: 28 },
      { place: "GIFT City", minutes: 38 },
    ],
    landmarks: [
      { name: "Sindhu Bhavan restaurant strip", type: "retail", distanceKm: 0.3 },
      { name: "CIMS Hospital", type: "hospital", distanceKm: 3.0 },
      { name: "Calorx Olive School", type: "school", distanceKm: 4.1 },
      { name: "Bodakdev offices", type: "work", distanceKm: 2.0 },
    ],
    catalysts: [
      "Effectively no undeveloped land — scarcity is the corridor's defining feature",
      "Commercial demand along the strip continues to lead the western suburbs",
    ],
    faqs: [
      {
        q: "Can I still buy new construction on Sindhu Bhavan Road?",
        a: "Rarely. Most activity here is resale, because there is almost nothing left to build on. If new stock appears it tends to be a single boutique building rather than a project.",
      },
    ],
  },

  {
    id: "gift-city-corridor",
    slug: "gift-city-corridor",
    name: "GIFT City Corridor",
    tagline: "Housing that follows a payroll.",
    description:
      "The stretch between Koba and Gandhinagar exists because GIFT City is hiring. That is its strength and its risk in the same sentence: demand here tracks an employment number rather than an established neighbourhood. Buy it understanding that.",
    geo: { lat: 23.1608, lng: 72.6845 },
    priceRange: { min: 4000, max: 6500 },
    priceTrend: { window: "2020–25", changePercent: 42 },
    phase: "Emerging · speculative",
    buyerProfile: "Investors and financial-sector professionals",
    driveTimes: [
      { place: "GIFT City towers", minutes: 12 },
      { place: "Gandhinagar", minutes: 15 },
      { place: "SVP International Airport", minutes: 25 },
      { place: "SG Highway", minutes: 40 },
    ],
    landmarks: [
      { name: "GIFT City business district", type: "work", distanceKm: 6.5 },
      { name: "Metro Phase 2 alignment", type: "transit", distanceKm: 1.8 },
      { name: "Infocity retail", type: "retail", distanceKm: 4.0 },
      { name: "Apollo Hospital, Gandhinagar", type: "hospital", distanceKm: 8.0 },
    ],
    catalysts: [
      "GIFT City employs over 25,000 people, against a stated target of 75,000 by 2028",
      "Metro Phase 2 links the district to Ahmedabad and Gandhinagar",
      "These are government timelines, and government timelines here have slipped before",
    ],
    faqs: [
      {
        q: "Is the GIFT City corridor a safe investment?",
        a: "It is the highest-growth and highest-variance corridor in this portfolio. The employment story is real and measurable; the infrastructure timelines behind it are not in anyone's control and have moved before. Size the position accordingly.",
      },
      {
        q: "How far is the corridor from the GIFT City towers?",
        a: "Around twelve minutes by road from the projects we build here, and roughly two kilometres from the planned Metro Phase 2 station.",
      },
    ],
  },

  {
    id: "chandkheda",
    slug: "chandkheda",
    name: "Chandkheda",
    tagline: "North of the river, on the metro.",
    description:
      "Chandkheda has the thing most of west Ahmedabad is still waiting for: an operating metro station. It is more affordable than the western corridors, denser than Shela, and increasingly the practical answer for anyone working towards Gandhinagar.",
    geo: { lat: 23.1069, lng: 72.5851 },
    priceRange: { min: 3800, max: 5500 },
    priceTrend: { window: "2020–25", changePercent: 24 },
    phase: "Established · improving",
    buyerProfile: "First-time buyers and Gandhinagar commuters",
    driveTimes: [
      { place: "Chandkheda metro station", minutes: 4 },
      { place: "Gandhinagar", minutes: 20 },
      { place: "GIFT City", minutes: 25 },
      { place: "SG Highway", minutes: 35 },
    ],
    landmarks: [
      { name: "Chandkheda metro station", type: "transit", distanceKm: 1.2 },
      { name: "Swaminarayan Temple", type: "temple", distanceKm: 2.4 },
      { name: "Tapovan School", type: "school", distanceKm: 1.9 },
      { name: "New CG Road retail", type: "retail", distanceKm: 0.8 },
    ],
    catalysts: [
      "Operating metro, not a promised one",
      "Suburban commercial demand along New CG Road continues to build",
    ],
    faqs: [
      {
        q: "Why build in Chandkheda when west Ahmedabad is stronger?",
        a: "Because a working metro station changes how a corridor lives, and Chandkheda has one today rather than on a slide. It also opens a price point the western corridors no longer offer.",
      },
    ],
  },
];

export const locationBySlug = new Map(locations.map((l) => [l.slug, l]));
export const locationByName = new Map(locations.map((l) => [l.name, l]));
