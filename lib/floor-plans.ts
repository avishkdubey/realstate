import type { Facing } from "@/lib/types";

/**
 * Schematic floor-plan geometry.
 *
 * These are diagrams, not drawings. They exist so the plan viewer, the Vastu
 * labelling and the zoom controls are real and testable before a client hands
 * over surveyed CAD files — at which point this module is replaced by real
 * assets and the viewer keeps its interface.
 *
 * Rooms are laid out on a unitless grid that the viewer scales to its viewport;
 * dimensions shown to the visitor are derived from the unit's actual carpet
 * area, so the labels are honest even though the drawing is not to scale.
 */

export type Room = {
  name: string;
  /** Grid coordinates, origin top-left. */
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Share of the unit's carpet area, used to derive the printed dimensions.
   * Shares deliberately sum to less than 1 — bathrooms, balconies and
   * circulation are real area that these schematics do not draw.
   */
  share: number;
  kind: "living" | "bedroom" | "kitchen" | "bath" | "utility" | "balcony";
};

export type FloorPlan = {
  id: string;
  label: string;
  /** Grid extents. */
  width: number;
  height: number;
  rooms: Room[];
  /** Where the front door sits, for the entry marker. */
  entry: { x: number; y: number };
};

const PLANS: Record<string, FloorPlan> = {
  "2bhk": {
    id: "2bhk",
    label: "2 BHK",
    width: 20,
    height: 14,
    entry: { x: 0, y: 9 },
    rooms: [
      { name: "Living / Dining", x: 0, y: 0, w: 11, h: 8, share: 0.3, kind: "living" },
      { name: "Kitchen", x: 0, y: 8, w: 6, h: 6, share: 0.12, kind: "kitchen" },
      { name: "Utility", x: 6, y: 8, w: 5, h: 6, share: 0.07, kind: "utility" },
      { name: "Master Bedroom", x: 11, y: 0, w: 9, h: 7, share: 0.22, kind: "bedroom" },
      { name: "Bedroom 2", x: 11, y: 7, w: 9, h: 7, share: 0.19, kind: "bedroom" },
    ],
  },

  "3bhk": {
    id: "3bhk",
    label: "3 BHK",
    width: 26,
    height: 18,
    entry: { x: 0, y: 12 },
    rooms: [
      { name: "Living / Dining", x: 0, y: 0, w: 14, h: 10, share: 0.26, kind: "living" },
      { name: "Kitchen", x: 0, y: 10, w: 7, h: 8, share: 0.1, kind: "kitchen" },
      { name: "Utility", x: 7, y: 10, w: 7, h: 8, share: 0.06, kind: "utility" },
      { name: "Master Bedroom", x: 14, y: 0, w: 12, h: 8, share: 0.2, kind: "bedroom" },
      { name: "Bedroom 2", x: 14, y: 8, w: 12, h: 5, share: 0.15, kind: "bedroom" },
      { name: "Bedroom 3", x: 14, y: 13, w: 12, h: 5, share: 0.14, kind: "bedroom" },
    ],
  },

  "4bhk": {
    id: "4bhk",
    label: "4 BHK",
    width: 30,
    height: 22,
    entry: { x: 0, y: 15 },
    rooms: [
      { name: "Living / Dining", x: 0, y: 0, w: 16, h: 12, share: 0.24, kind: "living" },
      { name: "Kitchen", x: 0, y: 12, w: 8, h: 10, share: 0.09, kind: "kitchen" },
      { name: "Utility", x: 8, y: 12, w: 8, h: 10, share: 0.05, kind: "utility" },
      { name: "Master Bedroom", x: 16, y: 0, w: 14, h: 8, share: 0.18, kind: "bedroom" },
      { name: "Bedroom 2", x: 16, y: 8, w: 14, h: 5, share: 0.13, kind: "bedroom" },
      { name: "Bedroom 3", x: 16, y: 13, w: 14, h: 5, share: 0.12, kind: "bedroom" },
      { name: "Bedroom 4 / Study", x: 16, y: 18, w: 14, h: 4, share: 0.11, kind: "bedroom" },
    ],
  },

  "5bhk": {
    id: "5bhk",
    label: "5 BHK",
    width: 32,
    height: 26,
    entry: { x: 0, y: 18 },
    rooms: [
      { name: "Living", x: 0, y: 0, w: 17, h: 10, share: 0.18, kind: "living" },
      { name: "Dining", x: 0, y: 10, w: 17, h: 6, share: 0.11, kind: "living" },
      { name: "Kitchen", x: 0, y: 16, w: 9, h: 10, share: 0.08, kind: "kitchen" },
      { name: "Utility", x: 9, y: 16, w: 8, h: 10, share: 0.05, kind: "utility" },
      { name: "Master Suite", x: 17, y: 0, w: 15, h: 9, share: 0.18, kind: "bedroom" },
      { name: "Bedroom 2", x: 17, y: 9, w: 15, h: 6, share: 0.12, kind: "bedroom" },
      { name: "Bedroom 3", x: 17, y: 15, w: 15, h: 6, share: 0.11, kind: "bedroom" },
      { name: "Bedroom 4", x: 17, y: 21, w: 8, h: 5, share: 0.09, kind: "bedroom" },
      { name: "Study", x: 25, y: 21, w: 7, h: 5, share: 0.08, kind: "bedroom" },
    ],
  },
};

/** Resolves a layout from a configuration string such as "3 BHK". */
export function getFloorPlan(bhk: string): FloorPlan {
  const rooms = parseInt(bhk, 10);
  const key = `${Math.min(Math.max(rooms || 3, 2), 5)}bhk`;
  return PLANS[key] ?? PLANS["3bhk"];
}

/**
 * Prints a room's dimensions in metres, derived from its share of the unit's
 * real carpet area. The proportions are schematic; the areas are not.
 */
export function roomDimensions(room: Room, carpetAreaSqFt: number): string {
  const areaSqM = carpetAreaSqFt * room.share * 0.092903;
  // Recover a plausible rectangle from the area using the drawn aspect ratio.
  const aspect = room.w / room.h;
  const height = Math.sqrt(areaSqM / aspect);
  const width = areaSqM / height;
  return `${width.toFixed(1)} × ${height.toFixed(1)} m`;
}

/**
 * Degrees to rotate the compass needle so north points correctly relative to
 * the plan, given which way the home faces. The plan is drawn with its entry
 * on the left, so an east-facing home has north at the top.
 */
export function compassRotation(facing: Facing): number {
  const bearings: Record<Facing, number> = {
    East: 0,
    "North-East": -45,
    North: -90,
    "North-West": -135,
    West: 180,
    "South-West": 135,
    South: 90,
    "South-East": 45,
  };
  return bearings[facing];
}

/**
 * Vastu commentary for a facing. East and north-east are the prized
 * orientations and can carry a resale premium; the rest are stated plainly
 * rather than dressed up (CLAUDE.md §2).
 */
export function vastuNote(facing: Facing): string {
  switch (facing) {
    case "East":
      return "East-facing. The most sought-after orientation in Gujarat — morning light through the main rooms, and the entry away from the south-west.";
    case "North-East":
      return "North-East facing. Considered the most auspicious corner in Vastu, and the orientation buyers ask for first.";
    case "North":
      return "North-facing. Well regarded, with even light through the day and no harsh afternoon sun on the living areas.";
    case "West":
      return "West-facing. Less sought-after than east, and warmer in the afternoon, which is usually reflected in the price.";
    case "South":
    case "South-West":
      return "South-facing. Not the preferred orientation in Vastu terms; we mention it because you would find out anyway.";
    default:
      return `${facing} facing.`;
  }
}
