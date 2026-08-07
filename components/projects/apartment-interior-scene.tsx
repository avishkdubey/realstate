"use client";

import { useRef, useMemo, useLayoutEffect, Suspense, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateInterior } from "@/lib/interior-generator";
import { furnishPlan, type Piece } from "@/lib/interior-furniture";
import { getFloorPlan } from "@/lib/floor-plans";
import { CityBackdrop } from "@/components/three/city-backdrop";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { SceneFrame } from "@/components/three/scene-frame";

type Props = {
  sectionRef: React.RefObject<HTMLElement | null>;
  bhk: string;
  carpetAreaSqFt: number;
};

/* Scratch objects. Module scope, recycled every frame — CLAUDE.md §7. */
const dummy = new THREE.Object3D();
const vLook = new THREE.Vector3();
const vPos = new THREE.Vector3();
const vPrev = new THREE.Vector3();
/* Persists between frames so the aim can lag the position. */
const vAim = new THREE.Vector3();
/** Fraction of the route to look ahead by — roughly five metres. */
const LOOK_AHEAD = 0.12;
/* Plaster, not concrete. The first pass used #444/#666, which on a near-black
   page produced a cave — and a buyer looking at a dark flat is not being sold
   anything. Real interiors are the brightest thing in frame; the drama has to
   come from the contrast against the page, not from underexposing the room. */
const WALL_EXTERIOR = new THREE.Color("#b3aa9c");
const WALL_INTERIOR = new THREE.Color("#c8c0b2");
const WALL_HEIGHT = 3.0; // metres
const SILL = 0.9; // window sill height
const HEAD = 2.1; // window head height

export function ApartmentInteriorScene({ sectionRef, bhk, carpetAreaSqFt }: Props) {
  const plan = getFloorPlan(bhk);

  const { walls, gridToMeters, waypoints, offsetX, offsetZ, width, height } = useMemo(
    () => generateInterior(plan, carpetAreaSqFt),
    [plan, carpetAreaSqFt],
  );

  const spline = useMemo(
    () => new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5),
    [waypoints],
  );
  const scrollProgress = useScrollProgress(sectionRef);

  /**
   * Wall segments, resolved into the boxes actually drawn.
   *
   * The generator emits one unit-length segment per wall cell. Most become a
   * single full-height box, but every other *exterior* segment is opened up
   * into a window bay — a sill below and a lintel above, with nothing between.
   *
   * That aperture is the whole reason the room works. Sealed, this was a black
   * box: no daylight could reach the interior, and the city built outside the
   * window was invisible from the one place it was meant to be seen from.
   */
  const pieces = useMemo(() => {
    const out: {
      px: number;
      pz: number;
      sx: number;
      sz: number;
      cy: number;
      sy: number;
      exterior: boolean;
    }[] = [];

    let exteriorSeen = 0;
    for (const wall of walls) {
      const px = wall.x * gridToMeters - offsetX;
      const pz = wall.y * gridToMeters - offsetZ;
      const sx = wall.w === 1 ? gridToMeters : 0.15; // 15cm partitions
      const sz = wall.h === 1 ? gridToMeters : 0.15;

      // Alternate bays rather than glazing every panel: an unbroken glass band
      // reads as an office, and this is meant to read as a home.
      const isWindow = wall.isExterior && exteriorSeen++ % 2 === 0;

      if (!isWindow) {
        out.push({ px, pz, sx, sz, cy: WALL_HEIGHT / 2, sy: WALL_HEIGHT, exterior: wall.isExterior });
        continue;
      }

      // Sill, then lintel. Standard Indian residential proportions: 0.9m sill,
      // 2.1m head, which also happens to sit either side of a 1.6m eye line.
      out.push({ px, pz, sx, sz, cy: SILL / 2, sy: SILL, exterior: true });
      out.push({
        px,
        pz,
        sx,
        sz,
        cy: HEAD + (WALL_HEIGHT - HEAD) / 2,
        sy: WALL_HEIGHT - HEAD,
        exterior: true,
      });
    }
    return out;
  }, [walls, gridToMeters, offsetX, offsetZ]);

  const wallMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!wallMesh.current) return;
    pieces.forEach((piece, i) => {
      dummy.position.set(piece.px, piece.cy, piece.pz);
      dummy.scale.set(piece.sx, piece.sy, piece.sz);
      dummy.updateMatrix();
      wallMesh.current!.setMatrixAt(i, dummy.matrix);
      wallMesh.current!.setColorAt(i, piece.exterior ? WALL_EXTERIOR : WALL_INTERIOR);
    });
    wallMesh.current.instanceMatrix.needsUpdate = true;
    if (wallMesh.current.instanceColor) wallMesh.current.instanceColor.needsUpdate = true;
  }, [pieces]);

  const furniture = useMemo(
    () => furnishPlan(plan, gridToMeters, offsetX, offsetZ),
    [plan, gridToMeters, offsetX, offsetZ],
  );

  /** Room centroids, for placing a warm practical light in each. */
  const roomLights = useMemo(
    () =>
      plan.rooms.map((room) => ({
        key: room.name,
        x: (room.x + room.w / 2) * gridToMeters - offsetX,
        z: (room.y + room.h / 2) * gridToMeters - offsetZ,
      })),
    [plan.rooms, gridToMeters, offsetX, offsetZ],
  );

  return (
    /* Fog has to clear the room but still reach the skyline: nothing within 20m
       is touched, so the interior stays crisp, and the furthest buildings at
       ~105m sit deep in it. The previous far plane of 50 hid the view entirely. */
    /* fov 62, not the 38 default. A 38mm-equivalent lens inside a 14m flat is a
       telephoto: it crops to a slice of wall and makes the place feel like a
       corridor. Interiors are shot wide — estate photography lives around
       16–24mm — and 62 is about as wide as we can go before the barrel
       distortion starts looking like a fisheye. */
    <SceneFrame camera={{ position: [0, 1.6, 0], fov: 62 }} fog={{ near: 20, far: 165 }}>
      {(tier) => (
        <>
          {/* The camera rig has to be its own component. R3F hooks only work
              *inside* the Canvas, and this component is the one that renders it
              — a useFrame up there throws "Hooks can only be used within the
              Canvas component" and takes the whole page down to the error
              boundary. */}
          <CameraRig spline={spline} progress={scrollProgress} />

          {/* Floor. Low roughness and a strong environment response, because a
              polished vitrified tile is *the* signifier of a finished Indian
              flat — and a glossy floor doubles the apparent light in the room
              by bouncing the windows back up at you. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
            <meshStandardMaterial
              color="#6b6259"
              roughness={0.18}
              metalness={0.15}
              envMapIntensity={1.4}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, 0]}>
            <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
            <meshStandardMaterial color="#efe9df" roughness={0.95} />
          </mesh>

          <instancedMesh
            ref={wallMesh}
            args={[undefined, undefined, pieces.length]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial roughness={0.85} metalness={0} />
          </instancedMesh>

          <Furniture pieces={furniture} />

          {/* The city outside. Tier-gated, and scaled from measured bounding
              boxes — see components/three/city-backdrop.tsx for why that matters. */}
          <Suspense fallback={null}>
            <CityBackdrop tier={tier} />
          </Suspense>

          {/* Daylight, angled low so it rakes in through the window band rather
              than landing on the roof. This is the light doing the real work —
              the apertures above exist so it has somewhere to enter. */}
          <directionalLight
            position={[14, 6, 10]}
            intensity={3.2}
            color="#fff4e6"
            castShadow={tier === "high"}
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0008}
          />
          {/* Cool skylight from the opposite side, so shadowed walls read as
              shadowed rather than dead. */}
          <directionalLight position={[-10, 8, -8]} intensity={0.9} color="#9fb6d4" />
          <ambientLight intensity={0.85} />

          {/* One warm practical per room, at pendant height. Real lights in real
              positions is what stops an interior looking like a lit diagram. */}
          {roomLights.map((light) => (
            <pointLight
              key={light.key}
              position={[light.x, 2.55, light.z]}
              intensity={tier === "low" ? 5 : 8}
              distance={7}
              decay={2}
              color="#ffc98f"
            />
          ))}
        </>
      )}
    </SceneFrame>
  );
}

/**
 * Furniture, as shared-material boxes.
 *
 * Seven materials for the whole flat, created once. Silhouettes rather than
 * models: at walking distance in a dim room the eye reads proportion and
 * placement long before it reads detail, so the cost of a real furniture asset
 * buys almost nothing here.
 */
const FURNITURE_MATERIALS: Record<Piece["kind"], THREE.MeshStandardMaterial> = {
  soft: new THREE.MeshStandardMaterial({ color: "#4a4740", roughness: 0.95 }),
  timber: new THREE.MeshStandardMaterial({ color: "#4b3a2a", roughness: 0.7 }),
  stone: new THREE.MeshStandardMaterial({ color: "#7d766c", roughness: 0.35, metalness: 0.1 }),
  metal: new THREE.MeshStandardMaterial({ color: "#8d8a85", roughness: 0.3, metalness: 0.8 }),
  textile: new THREE.MeshStandardMaterial({ color: "#5d5346", roughness: 1 }),
  foliage: new THREE.MeshStandardMaterial({ color: "#2f4a33", roughness: 0.9 }),
  // Emissive, so a television reads as switched on rather than as a black slab.
  screen: new THREE.MeshStandardMaterial({
    color: "#0b1016",
    emissive: "#6f8fb5",
    emissiveIntensity: 0.9,
    roughness: 0.25,
  }),
};

function Furniture({ pieces }: { pieces: Piece[] }) {
  return (
    <>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          position={piece.position}
          rotation={[0, piece.rotationY ?? 0, 0]}
          material={FURNITURE_MATERIALS[piece.kind]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}
    </>
  );
}

/** Walks the camera along the path on scroll. Level, damped, never rolling. */
function CameraRig({
  spline,
  progress,
}: {
  spline: THREE.CatmullRomCurve3;
  progress: RefObject<number>;
}) {
  useFrame(({ camera }, delta) => {
    const t = Math.max(0, Math.min(1, progress.current));

    spline.getPointAt(t, vPos);

    /* Look a long way down the path, not at your own feet.
       The first version sampled t + 0.02 — with 22 waypoints over roughly forty
       metres of route that is a target under a metre in front of the lens, so
       the camera spent the whole tour staring at whatever surface it was about
       to walk into. Estate walkthroughs read well when the eye is carried into
       the depth of the room, which means looking several metres ahead. */
    spline.getPointAt(Math.min(1, t + LOOK_AHEAD), vLook);

    // Pin the target to eye level. Any vertical component reads as the camera
    // tilting through a floor, which is the fastest way to make an interior
    // walkthrough nauseating (CLAUDE.md §7).
    vLook.y = vPos.y;

    // At the very end the look-ahead sample collapses onto the position, which
    // would leave lookAt() undefined. Push it out along the last direction.
    if (t > 1 - LOOK_AHEAD) {
      spline.getPointAt(1, vLook);
      spline.getPointAt(1 - LOOK_AHEAD, vPrev);
      vLook.sub(vPrev).normalize().multiplyScalar(4).add(vPos);
      vLook.y = vPos.y;
    }

    /* Damp both, and damp the target more slowly than the position. The lag is
       deliberate: it makes a corner feel like a head turning to follow the room
       rather than the whole view whipping round. */
    const kPos = 1 - Math.exp(-9 * delta);
    const kAim = 1 - Math.exp(-5 * delta);
    camera.position.lerp(vPos, kPos);
    vAim.lerp(vLook, kAim);
    camera.lookAt(vAim);
  });

  return null;
}
