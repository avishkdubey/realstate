import type { FloorPlan, Room } from "@/lib/floor-plans";

/**
 * Furniture for the walkthrough, derived from the plan.
 *
 * An empty flat reads as a shell, and a shell is the opposite of the sales
 * message — a buyer needs to see somewhere to live, not somewhere to move into.
 * These are silhouettes rather than models: at walking distance in a dim room
 * the eye reads proportion and placement, not detail, so a well-sized box in
 * the right place does the work of a furniture asset at none of the cost.
 *
 * Everything is positioned relative to its room's rectangle, so it follows the
 * plan for any BHK without a second layout table to keep in sync.
 */

export type Piece = {
  /** Drives material choice in the scene. */
  kind: "soft" | "timber" | "stone" | "metal" | "screen" | "textile" | "foliage";
  /** Centre position in metres, already offset into world space. */
  position: [number, number, number];
  /** Full extents in metres. */
  size: [number, number, number];
  rotationY?: number;
};

type RoomBox = {
  room: Room;
  /** World centre. */
  cx: number;
  cz: number;
  /** World extents. */
  w: number;
  d: number;
};

/**
 * Room rectangles in world space.
 *
 * The scene subtracts the plan centre from every wall, so furniture has to do
 * the same or it lands half a flat away — the mistake that had the camera path
 * and the walls disagreeing earlier in this file's history.
 */
function roomBoxes(
  plan: FloorPlan,
  g: number,
  offsetX: number,
  offsetZ: number,
): RoomBox[] {
  return plan.rooms.map((room) => ({
    room,
    cx: (room.x + room.w / 2) * g - offsetX,
    cz: (room.y + room.h / 2) * g - offsetZ,
    w: room.w * g,
    d: room.h * g,
  }));
}

/**
 * Refuses to place anything that would swallow its room.
 *
 * The plans are schematic, so a "bedroom" on a small configuration can come out
 * genuinely tiny. A double bed wedged wall-to-wall reads as a mistake, and it
 * would also block the camera path, so undersized rooms are simply left bare.
 */
function fits(box: RoomBox, footprint: number): boolean {
  return footprint <= box.w * box.d * 0.55;
}

export function furnishPlan(
  plan: FloorPlan,
  gridToMeters: number,
  offsetX: number,
  offsetZ: number,
): Piece[] {
  const out: Piece[] = [];
  const boxes = roomBoxes(plan, gridToMeters, offsetX, offsetZ);

  for (const box of boxes) {
    const { cx, cz, w, d } = box;
    // Long axis of the room, so seating and beds run the sensible way.
    const alongX = w >= d;
    const rot = alongX ? 0 : Math.PI / 2;
    // Half-extents with a walking margin kept clear of the walls.
    const hx = (alongX ? w : d) / 2 - 0.35;
    const hz = (alongX ? d : w) / 2 - 0.35;
    if (hx <= 0.4 || hz <= 0.4) continue;

    const place = (
      kind: Piece["kind"],
      along: number,
      across: number,
      y: number,
      size: [number, number, number],
    ): Piece => ({
      kind,
      position: alongX ? [cx + along, y, cz + across] : [cx + across, y, cz + along],
      size: alongX ? size : [size[2], size[1], size[0]],
      rotationY: rot,
    });

    switch (box.room.kind) {
      case "living": {
        if (!fits(box, 2.0 * 0.9)) break;
        // Sofa: seat plus back plus two arms, set against one long wall.
        const sofaZ = -hz + 0.45;
        out.push(place("soft", 0, sofaZ, 0.22, [2.0, 0.44, 0.85]));
        out.push(place("soft", 0, sofaZ - 0.3, 0.52, [2.0, 0.6, 0.22]));
        out.push(place("soft", -1.0, sofaZ, 0.32, [0.18, 0.62, 0.85]));
        out.push(place("soft", 1.0, sofaZ, 0.32, [0.18, 0.62, 0.85]));
        // Rug, then a low table on it.
        out.push(place("textile", 0, sofaZ + 1.1, 0.008, [2.6, 0.01, 1.7]));
        out.push(place("timber", 0, sofaZ + 1.0, 0.19, [1.1, 0.38, 0.55]));
        // Media wall opposite, with a screen that reads as switched on.
        out.push(place("timber", 0, hz - 0.25, 0.24, [1.9, 0.48, 0.42]));
        out.push(place("screen", 0, hz - 0.16, 1.05, [1.25, 0.72, 0.05]));
        break;
      }

      case "bedroom": {
        if (!fits(box, 1.6 * 2.0)) break;
        const headZ = -hz + 0.15;
        // Headboard, base, mattress, two pillows.
        out.push(place("timber", 0, headZ, 0.55, [1.75, 1.1, 0.1]));
        out.push(place("timber", 0, headZ + 1.05, 0.15, [1.6, 0.3, 2.0]));
        out.push(place("soft", 0, headZ + 1.05, 0.38, [1.58, 0.22, 1.98]));
        out.push(place("textile", -0.38, headZ + 0.32, 0.53, [0.62, 0.14, 0.34]));
        out.push(place("textile", 0.38, headZ + 0.32, 0.53, [0.62, 0.14, 0.34]));
        // Side tables, if the room is wide enough to want them.
        if (hx > 1.25) {
          out.push(place("timber", -1.08, headZ + 0.25, 0.24, [0.42, 0.48, 0.42]));
          out.push(place("timber", 1.08, headZ + 0.25, 0.24, [0.42, 0.48, 0.42]));
        }
        break;
      }

      case "kitchen": {
        // Counter run along the long wall, with uppers above it.
        out.push(place("stone", 0, -hz + 0.32, 0.45, [hx * 1.8, 0.9, 0.62]));
        out.push(place("stone", 0, -hz + 0.32, 0.92, [hx * 1.8, 0.04, 0.66]));
        out.push(place("timber", 0, -hz + 0.22, 1.75, [hx * 1.6, 0.7, 0.36]));
        break;
      }

      case "bath": {
        out.push(place("stone", 0, -hz + 0.25, 0.42, [Math.min(1.1, hx * 1.4), 0.84, 0.5]));
        out.push(place("metal", 0, -hz + 0.06, 1.5, [Math.min(0.9, hx * 1.2), 0.85, 0.03]));
        break;
      }

      case "utility": {
        out.push(place("metal", 0, -hz + 0.35, 0.42, [0.62, 0.84, 0.62]));
        break;
      }

      case "balcony": {
        // Railing verticals plus a planter — enough to read as outside.
        const span = alongX ? w : d;
        const count = Math.max(3, Math.floor(span / 0.22));
        for (let i = 0; i < count; i++) {
          const t = -span / 2 + 0.11 + (i * (span - 0.22)) / (count - 1);
          out.push(place("metal", t, hz, 0.55, [0.03, 1.1, 0.03]));
        }
        out.push(place("metal", 0, hz, 1.1, [span, 0.05, 0.06]));
        out.push(place("foliage", -hx + 0.3, hz - 0.35, 0.28, [0.42, 0.56, 0.42]));
        break;
      }
    }
  }

  return out;
}
