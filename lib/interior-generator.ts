import { FloorPlan, roomDimensions } from "./floor-plans";
import * as THREE from "three";

export type Wall = {
  x: number;
  y: number;
  w: number;
  h: number;
  isExterior: boolean;
};

export type Doorway = {
  x: number;
  y: number;
  vertical: boolean;
  fromRoom: number;
  toRoom: number;
};

/**
 * Metres per grid cell when the project has no carpet area on record.
 *
 * Every project in `lib/placeholders/projects.ts` currently ships
 * `carpetAreaMin: 0`, because the client has not supplied real figures yet. Fed
 * straight through, that made `gridToMeters` zero — zero-size walls and a camera
 * path collapsed onto a single point, so the walkthrough rendered pure black
 * with no error anywhere. A silent divide-by-nothing is a bad way to fail.
 *
 * 0.55 puts a 3 BHK's 26×18 grid at roughly 14m × 10m, which is plausible for
 * the configuration. It is deliberately *nominal*: it exists so the schematic
 * has sensible proportions, and the "not to scale" disclaimer on the section is
 * what keeps that honest. The moment real carpet areas land in the data this
 * fallback stops being used, and the geometry starts agreeing with the printed
 * dimensions instead — which is the behaviour RERA §12 actually wants.
 */
const NOMINAL_GRID_METRES = 0.55;

export function generateInterior(plan: FloorPlan, carpetAreaSqFt: number) {
  // Derive scale from the living room (or first room) to match printed dimensions.
  const baseRoom = plan.rooms.find((r) => r.kind === "living") || plan.rooms[0];
  const dimStr = roomDimensions(baseRoom, carpetAreaSqFt);
  const [wStr] = dimStr.replace(" m", "").split(" × ");
  const derived = parseFloat(wStr) / baseRoom.w;
  const gridToMeters =
    Number.isFinite(derived) && derived > 0.01 ? derived : NOMINAL_GRID_METRES;

  const grid = Array.from({ length: plan.height }, () => new Int32Array(plan.width).fill(-1));
  plan.rooms.forEach((room, i) => {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        grid[y][x] = i;
      }
    }
  });

  const walls: Wall[] = [];
  const doorways: Doorway[] = [];
  const boundaries = new Map<string, { x: number; y: number; vertical: boolean }[]>();

  // Extract horizontal boundaries
  for (let y = 0; y <= plan.height; y++) {
    for (let x = 0; x < plan.width; x++) {
      const top = y > 0 ? grid[y - 1][x] : -1;
      const bottom = y < plan.height ? grid[y][x] : -1;
      if (top !== bottom) {
        if (top !== -1 && bottom !== -1) {
          const key = [top, bottom].sort().join("-");
          let list = boundaries.get(key);
          if (!list) {
            list = [];
            boundaries.set(key, list);
          }
          list.push({ x, y, vertical: false });
        } else {
          walls.push({ x: x + 0.5, y, w: 1, h: 0.1, isExterior: true });
        }
      }
    }
  }

  // Extract vertical boundaries
  for (let x = 0; x <= plan.width; x++) {
    for (let y = 0; y < plan.height; y++) {
      const left = x > 0 ? grid[y][x - 1] : -1;
      const right = x < plan.width ? grid[y][x] : -1;
      if (left !== right) {
        if (left !== -1 && right !== -1) {
          const key = [left, right].sort().join("-");
          let list = boundaries.get(key);
          if (!list) {
            list = [];
            boundaries.set(key, list);
          }
          list.push({ x, y, vertical: true });
        } else {
          walls.push({ x, y: y + 0.5, w: 0.1, h: 1, isExterior: true });
        }
      }
    }
  }

  // Place doorways and internal walls
  for (const [key, segments] of boundaries.entries()) {
    // Sort segments to find the middle one reliably
    segments.sort((a, b) => (a.vertical ? a.y - b.y : a.x - b.x));
    const midIndex = Math.floor(segments.length / 2);
    const door = segments[midIndex];
    const [a, b] = key.split("-").map(Number);
    doorways.push({
      x: door.x + (door.vertical ? 0 : 0.5),
      y: door.y + (door.vertical ? 0.5 : 0),
      vertical: door.vertical,
      fromRoom: a,
      toRoom: b,
    });

    for (let i = 0; i < segments.length; i++) {
      if (i === midIndex) continue; // Leave a gap for the door
      const s = segments[i];
      if (s.vertical) {
        walls.push({ x: s.x, y: s.y + 0.5, w: 0.1, h: 1, isExterior: false });
      } else {
        walls.push({ x: s.x + 0.5, y: s.y, w: 1, h: 0.1, isExterior: false });
      }
    }
  }

  // Create waypoints for the camera tour
  // The origin is at the top-left of the grid.
  // Let's build an adjacency list of rooms
  const adj = Array.from({ length: plan.rooms.length }, () => [] as { to: number; door: Doorway }[]);
  for (const door of doorways) {
    adj[door.fromRoom].push({ to: door.toRoom, door });
    adj[door.toRoom].push({ to: door.fromRoom, door });
  }

  const waypoints: THREE.Vector3[] = [];
  const visited = new Set<number>();
  
  // Start near the entry. Find the closest room to the entry coordinate.
  let startRoom = 0;
  let minDist = Infinity;
  plan.rooms.forEach((room, i) => {
    const cx = room.x + room.w / 2;
    const cy = room.y + room.h / 2;
    const dist = Math.hypot(cx - plan.entry.x, cy - plan.entry.y);
    if (dist < minDist) {
      minDist = dist;
      startRoom = i;
    }
  });

  const EYE_HEIGHT = 1.6; // 1.6m eye height

  function getCentroid(roomId: number) {
    const room = plan.rooms[roomId];
    return new THREE.Vector3(
      (room.x + room.w / 2) * gridToMeters,
      EYE_HEIGHT,
      (room.y + room.h / 2) * gridToMeters
    );
  }

  function getDoorPt(door: Doorway) {
    return new THREE.Vector3(
      door.x * gridToMeters,
      EYE_HEIGHT,
      door.y * gridToMeters
    );
  }

  // Add an initial point right at the entry
  waypoints.push(new THREE.Vector3(plan.entry.x * gridToMeters, EYE_HEIGHT, plan.entry.y * gridToMeters));

  function dfs(u: number) {
    visited.add(u);
    waypoints.push(getCentroid(u));

    for (const edge of adj[u]) {
      if (!visited.has(edge.to)) {
        waypoints.push(getDoorPt(edge.door));
        dfs(edge.to);
        // Backtrack
        waypoints.push(getDoorPt(edge.door));
        waypoints.push(getCentroid(u));
      }
    }
  }

  dfs(startRoom);

  // Offset the whole scene so it's centered
  const cx = (plan.width / 2) * gridToMeters;
  const cy = (plan.height / 2) * gridToMeters;
  const offset = new THREE.Vector3(-cx, 0, -cy);
  
  for (const wp of waypoints) {
    wp.add(offset);
  }

  return {
    walls,
    gridToMeters,
    waypoints,
    offsetX: cx,
    offsetZ: cy,
    width: plan.width,
    height: plan.height,
  };
}
