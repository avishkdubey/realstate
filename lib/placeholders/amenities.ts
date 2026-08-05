import type { Amenity } from "@/lib/types";

/** Demo amenity library. Replace wholesale when real project data arrives. */
export const amenities: Amenity[] = [
  {
    id: "clubhouse",
    name: "Clubhouse",
    category: "social",
    description:
      "A double-height community room for celebrations, society meetings and festival gatherings.",
  },
  {
    id: "pool",
    name: "Swimming Pool",
    category: "wellness",
    description: "Temperature-controlled lap pool with a separate children's pool.",
  },
  {
    id: "gym",
    name: "Fitness Centre",
    category: "wellness",
    description: "Equipped gym with a dedicated yoga and meditation deck.",
  },
  {
    id: "padel",
    name: "Padel Court",
    category: "outdoor",
    description: "Floodlit court, bookable through the residents' app.",
  },
  {
    id: "cowork",
    name: "Co-working Lounge",
    category: "convenience",
    description:
      "Quiet desks and two call booths, for the days working from home means working from downstairs.",
  },
  {
    id: "ev",
    name: "EV Charging",
    category: "sustainability",
    description: "Charging points provisioned across visitor and resident parking.",
  },
  {
    id: "kids",
    name: "Children's Play Zone",
    category: "outdoor",
    description: "Shaded, soft-surfaced play area within sight of the seating court.",
  },
  {
    id: "seniors",
    name: "Senior Citizens' Court",
    category: "outdoor",
    description: "Level walking loop with seating, away from vehicle movement.",
  },
  {
    id: "parcel",
    name: "Parcel Room",
    category: "convenience",
    description: "Attended delivery room with cold storage for grocery orders.",
  },
  {
    id: "temple",
    name: "Community Temple",
    category: "social",
    description: "A quiet shrine at the garden's east edge.",
  },
  {
    id: "rainwater",
    name: "Rainwater Harvesting",
    category: "sustainability",
    description: "Recharge pits and a treated-water loop for landscape irrigation.",
  },
  {
    id: "pet",
    name: "Pet Park",
    category: "outdoor",
    description: "Fenced run with a wash station at the entry.",
  },
];

export const amenityById = new Map(amenities.map((a) => [a.id, a]));
