/**
 * The tower, as numbers.
 *
 * Deliberately free of Three.js and React so the layout can be checked by
 * reading it. Everything is derived from `TOWER` below — change the bay count
 * and the columns, slabs, facade and glazing all follow.
 *
 * Nothing here is a real Kautilya building. It is an abstract massing study,
 * captioned as such wherever it appears: under RERA §12 a visual that implies a
 * specific building is a representation the promoter is liable for, and a
 * disclaimer does not waive that. Keeping it obviously schematic is the point,
 * not a limitation.
 */

export const TOWER = {
  floors: 18,
  /** Storey height in world units. */
  storey: 1.15,
  /** Structural bays across each axis. */
  baysX: 5,
  baysZ: 3,
  /** Bay spacing. */
  spanX: 1.5,
  spanZ: 1.6,
  columnSize: 0.17,
  slabThickness: 0.12,
  /** The lift and stair core, offset from centre so the massing is not symmetrical. */
  core: { w: 1.5, d: 1.4, x: -1.4, z: 0 },
} as const;

export const FOOTPRINT = {
  width: (TOWER.baysX - 1) * TOWER.spanX,
  depth: (TOWER.baysZ - 1) * TOWER.spanZ,
};

export const TOWER_HEIGHT = TOWER.floors * TOWER.storey;

export type Placement = {
  position: [number, number, number];
  /** Y-rotation, for facade panels that face out along different edges. */
  rotationY: number;
  /** Which floor this belongs to — drives the staggered rise. */
  floor: number;
};

/** Column grid, repeated per floor. One instance per column per storey. */
export function columnPlacements(): Placement[] {
  const out: Placement[] = [];
  for (let floor = 0; floor < TOWER.floors; floor++) {
    for (let ix = 0; ix < TOWER.baysX; ix++) {
      for (let iz = 0; iz < TOWER.baysZ; iz++) {
        out.push({
          position: [
            (ix - (TOWER.baysX - 1) / 2) * TOWER.spanX,
            floor * TOWER.storey + TOWER.storey / 2,
            (iz - (TOWER.baysZ - 1) / 2) * TOWER.spanZ,
          ],
          rotationY: 0,
          floor,
        });
      }
    }
  }
  return out;
}

/** One slab per floor, sitting on top of that floor's columns. */
export function slabPlacements(): Placement[] {
  return Array.from({ length: TOWER.floors }, (_, floor) => ({
    position: [0, (floor + 1) * TOWER.storey, 0] as [number, number, number],
    rotationY: 0,
    floor,
  }));
}

/**
 * Facade panels around the perimeter, one per bay per floor.
 *
 * Walking the perimeter rather than filling a grid means corners get exactly
 * one panel instead of two fighting for the same space.
 */
export function facadePlacements(): Placement[] {
  const out: Placement[] = [];
  const halfW = FOOTPRINT.width / 2;
  const halfD = FOOTPRINT.depth / 2;

  for (let floor = 0; floor < TOWER.floors; floor++) {
    const y = floor * TOWER.storey + TOWER.storey / 2;

    // Long faces, front and back.
    for (let ix = 0; ix < TOWER.baysX - 1; ix++) {
      const x = (ix - (TOWER.baysX - 2) / 2) * TOWER.spanX;
      out.push({ position: [x, y, halfD], rotationY: 0, floor });
      out.push({ position: [x, y, -halfD], rotationY: Math.PI, floor });
    }
    // Short faces, left and right.
    for (let iz = 0; iz < TOWER.baysZ - 1; iz++) {
      const z = (iz - (TOWER.baysZ - 2) / 2) * TOWER.spanZ;
      out.push({ position: [halfW, y, z], rotationY: Math.PI / 2, floor });
      out.push({ position: [-halfW, y, z], rotationY: -Math.PI / 2, floor });
    }
  }
  return out;
}

/** Pile caps under the column grid, the first thing to appear. */
export function pileCapPlacements(): Placement[] {
  const out: Placement[] = [];
  for (let ix = 0; ix < TOWER.baysX; ix++) {
    for (let iz = 0; iz < TOWER.baysZ; iz++) {
      out.push({
        position: [
          (ix - (TOWER.baysX - 1) / 2) * TOWER.spanX,
          0.12,
          (iz - (TOWER.baysZ - 1) / 2) * TOWER.spanZ,
        ],
        rotationY: 0,
        floor: 0,
      });
    }
  }
  return out;
}

/**
 * A deterministic pseudo-random number in [0, 1).
 *
 * mulberry32. Seeded so the tower is byte-identical on every load — jitter that
 * changes between refreshes makes it impossible to tell whether a tweak
 * improved the composition or the dice did.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Which windows are lit at handover, as a stable per-panel 0/1.
 *
 * Roughly a third, scattered — a fully lit tower reads as a render, a sparsely
 * lit one reads as an evening.
 */
export function litWindows(count: number, fraction = 0.34): Float32Array {
  const random = seededRandom(0x9e3779b9);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) out[i] = random() < fraction ? 1 : 0;
  return out;
}
