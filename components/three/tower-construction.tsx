"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { usePointerLook } from "@/components/three/use-pointer-look";
import {
  clamp01,
  smoothstep,
  stageProgress,
  staggeredReveal,
} from "@/lib/construction-stages";
import { COLORS, HEX } from "@/lib/three-palette";
import {
  columnPlacements,
  facadePlacements,
  FOOTPRINT,
  litWindows,
  pileCapPlacements,
  slabPlacements,
  TOWER,
  TOWER_HEIGHT,
} from "@/lib/tower-geometry";
import type { QualityTier } from "@/lib/webgl";

/**
 * A tower assembling itself from pile caps to lit windows, driven by scroll.
 *
 * Everything is `InstancedMesh` — about 1,300 instances across seven meshes, so
 * roughly ten draw calls for the whole building. That is what makes it possible
 * to animate every column and panel individually without the frame budget
 * noticing.
 *
 * The animation writes instance matrices directly in `useFrame`. There is not a
 * single allocation in that path: the scratch objects below are created once at
 * module scope and recycled, per `CLAUDE.md` §7 ("never allocate inside
 * useFrame — new THREE.Vector3() → GC stutter").
 */

/* Scratch objects. Module scope, reused every frame, never reassigned. */
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

/** Unit height of the crane mast mesh; it is scaled from this, never rebuilt. */
const CRANE_MAST_HEIGHT = 24;

/**
 * The camera route, as position/target pairs against scroll progress.
 *
 * A drone shot, not a turntable: it starts at street level looking up at an
 * empty site, lifts as the core rises, comes in close alongside the frame at
 * the busiest moment, then pulls back to reveal the finished mass. Damped
 * toward these points rather than snapped to them, so a fast scroll flick
 * glides instead of cutting — `CLAUDE.md` §7 rules out jarring cuts and
 * free-roam outright, on motion-sickness grounds.
 */
const CAMERA_KEYS: {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}[] = [
  /* Targets sit left of the tower's centre line so the building composes into
     the right of frame, leaving the left third clear for the headline. On a
     narrow screen the copy stacks over the whole width anyway, and the scrim
     handles it. */
  /* Distances are set against a tower 20 units tall: at fov 46 it takes roughly
     24 units of standoff to hold the whole thing in frame, so anything nearer
     is a deliberate crop. The first pass sat at 9 and the building spilled out
     of every edge. */
  { at: 0.0, position: [11, 5, 16], target: [-2, 4.5, 0] },
  { at: 0.3, position: [12, 7, 18], target: [-3, 7, 0] },
  { at: 0.6, position: [9, 16, 14], target: [-2.5, 13, 0] },
  { at: 0.85, position: [15, 17, 23], target: [-3, 12, 0] },
  /* The final reveal has to hold all 20 units of tower plus the crown, so it
     sits ~35 units out — noticeably further than the working shots. */
  { at: 1.0, position: [17, 12, 29], target: [-3, 10.5, 0] },
];

function sampleRoute(progress: number, out: THREE.Vector3, key: "position" | "target") {
  let lower = CAMERA_KEYS[0];
  let upper = CAMERA_KEYS[CAMERA_KEYS.length - 1];

  for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
    if (progress >= CAMERA_KEYS[i].at && progress <= CAMERA_KEYS[i + 1].at) {
      lower = CAMERA_KEYS[i];
      upper = CAMERA_KEYS[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const t = span <= 0 ? 0 : smoothstep((progress - lower.at) / span);
  const a = lower[key];
  const b = upper[key];
  out.set(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  );
}

/** Writes one instance matrix. `reveal` 0→1 grows the element from its base. */
function writeInstance(
  mesh: THREE.InstancedMesh,
  index: number,
  x: number,
  y: number,
  z: number,
  rotationY: number,
  reveal: number,
  height: number,
) {
  // Scaling from the centre would make elements grow downward through the
  // slab below, so the Y offset compensates to keep the base pinned.
  const scaleY = Math.max(reveal, 0.0001);
  _position.set(x, y - (height * (1 - scaleY)) / 2, z);
  _euler.set(0, rotationY, 0);
  _quaternion.setFromEuler(_euler);
  _scale.set(reveal > 0 ? 1 : 0.0001, scaleY, reveal > 0 ? 1 : 0.0001);
  _matrix.compose(_position, _quaternion, _scale);
  mesh.setMatrixAt(index, _matrix);
}

export function TowerConstruction({
  progress,
  tier,
}: {
  /** 0→1 scroll position, sampled in the frame that draws it. */
  progress: RefObject<number>;
  tier: QualityTier;
}) {
  const { camera } = useThree();
  const look = usePointerLook({ lambda: 2.5, strength: 1 });

  /* Layout is computed once. On the low tier the facade is dropped entirely —
     it is the largest instance count and the least legible element on a small
     screen, so it is the right thing to lose first. */
  const layout = useMemo(() => {
    const columns = columnPlacements();
    const slabs = slabPlacements();
    const facade = tier === "low" ? [] : facadePlacements();
    const caps = pileCapPlacements();
    return { columns, slabs, facade, caps, lit: litWindows(facade.length) };
  }, [tier]);

  const columnsRef = useRef<THREE.InstancedMesh>(null);
  const slabsRef = useRef<THREE.InstancedMesh>(null);
  const facadeRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const capsRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const craneRef = useRef<THREE.Group>(null);
  const craneMastRef = useRef<THREE.Mesh>(null);
  const craneJibRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Mesh>(null);

  /* Per-instance colour, so individual windows can warm up at handover without
     needing a material each. Held in a ref and attached to the geometry by
     hand: it is mutated every frame, and a ref is the one place React sanctions
     keeping something mutable. */
  const glassColor = useRef<THREE.InstancedBufferAttribute | null>(null);

  // Start every element hidden, so the first painted frame is an empty site
  // rather than a finished tower that then collapses to nothing.
  useLayoutEffect(() => {
    for (const mesh of [columnsRef, slabsRef, facadeRef, glassRef, capsRef]) {
      const instanced = mesh.current;
      if (!instanced) continue;
      _matrix.makeScale(0.0001, 0.0001, 0.0001);
      for (let i = 0; i < instanced.count; i++) instanced.setMatrixAt(i, _matrix);
      instanced.instanceMatrix.needsUpdate = true;
    }

    const glass = glassRef.current;
    if (glass && layout.facade.length > 0) {
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(layout.facade.length * 3),
        3,
      );
      for (let i = 0; i < layout.facade.length; i++) {
        attribute.setXYZ(i, COLORS.glass.r, COLORS.glass.g, COLORS.glass.b);
      }
      glass.geometry.setAttribute("color", attribute);
      glassColor.current = attribute;
    }

    return () => {
      glassColor.current = null;
    };
  }, [layout]);

  useFrame((_, delta) => {
    /* Scroll 0→1 is mapped onto stage 0.34→1, not 0→1.
       Read against `STAGE_FILL`, that starts the hero a third of the way into
       the superstructure: core up, first two floors of frame standing. The
       earlier stages are real but they are not *watchable* — excavation draws
       nothing at all, and pile caps are 0.6-unit boxes seen from seventeen
       units away, so the opening frame was a black rectangle with a crane in
       it. This is also literally the brief: pillars to finished building.
       The shared stage scale is untouched; only the hero's entry into it moves. */
    const scroll = clamp01(progress.current);
    const p = 0.34 + scroll * 0.66;

    /* ---- Camera ------------------------------------------------------ */
    /* Keyed to raw scroll, NOT to the remapped stage. The two are different
       clocks and conflating them is a real bug: feeding `p` in here put the
       camera at its floor-8 framing on the very first frame, staring at empty
       sky above a two-storey stub. `CAMERA_KEYS` are authored against what the
       visitor has scrolled, so that is what they must be sampled with. */
    sampleRoute(scroll, _camTarget, "position");
    sampleRoute(scroll, _lookTarget, "target");

    // Pointer parallax rides on top of the route, so the shot breathes with
    // the cursor without ever leaving the authored path.
    const pointer = look.current;
    _camTarget.x += pointer.x * 1.1;
    _camTarget.y += pointer.y * 0.6;

    // Frame-rate independent damping. This is what turns a scroll flick into a
    // glide instead of a cut.
    const k = 1 - Math.exp(-3 * delta);
    camera.position.lerp(_camTarget, k);
    camera.lookAt(_lookTarget);

    /* ---- Foundation -------------------------------------------------- */
    const caps = capsRef.current;
    if (caps) {
      const stage = stageProgress(p, "foundation");
      for (let i = 0; i < layout.caps.length; i++) {
        const [x, y, z] = layout.caps[i].position;
        const reveal = staggeredReveal(stage, i, layout.caps.length, 4);
        writeInstance(caps, i, x, y, z, 0, reveal, 0.24);
      }
      caps.instanceMatrix.needsUpdate = true;
    }

    // The core leads the frame — it is the first thing up on a real site.
    if (coreRef.current) {
      const stage = stageProgress(p, "foundation") * 0.35 + stageProgress(p, "structure") * 0.65;
      const reveal = Math.max(clamp01(stage), 0.0001);
      coreRef.current.scale.y = reveal;
      coreRef.current.position.y = (TOWER_HEIGHT * reveal) / 2;
      coreRef.current.visible = reveal > 0.01;
    }

    /* ---- Superstructure ---------------------------------------------- */
    const structure = stageProgress(p, "structure");
    const columns = columnsRef.current;
    if (columns) {
      for (let i = 0; i < layout.columns.length; i++) {
        const item = layout.columns[i];
        const [x, y, z] = item.position;
        const reveal = staggeredReveal(structure, item.floor, TOWER.floors, 3);
        writeInstance(columns, i, x, y, z, 0, reveal, TOWER.storey);
      }
      columns.instanceMatrix.needsUpdate = true;
    }

    const slabs = slabsRef.current;
    if (slabs) {
      for (let i = 0; i < layout.slabs.length; i++) {
        const item = layout.slabs[i];
        const [x, y, z] = item.position;
        // Slabs trail their columns slightly — the deck is poured after the
        // frame is stood, and the offset is what makes the sequence legible.
        const reveal = staggeredReveal(structure - 0.04, item.floor, TOWER.floors, 3);
        writeInstance(slabs, i, x, y, z, 0, reveal, TOWER.slabThickness);
      }
      slabs.instanceMatrix.needsUpdate = true;
    }

    /* ---- Cladding ----------------------------------------------------- */
    const finishing = stageProgress(p, "finishing");
    const handover = stageProgress(p, "handover");
    const facade = facadeRef.current;
    const glass = glassRef.current;

    if (facade && glass) {
      const colors = glassColor.current;
      for (let i = 0; i < layout.facade.length; i++) {
        const item = layout.facade[i];
        const [x, y, z] = item.position;
        const reveal = staggeredReveal(finishing, item.floor, TOWER.floors, 3);
        writeInstance(facade, i, x, y, z, item.rotationY, reveal, TOWER.storey);
        writeInstance(glass, i, x, y, z, item.rotationY, reveal, TOWER.storey);

        // Windows warm up one by one through handover rather than all at once —
        // a tower that lights up in a single frame reads as a light switch, one
        // that fills in over a few seconds reads as an evening.
        if (colors) {
          const on = layout.lit[i] * smoothstep((handover - (i % 7) / 9) * 2);
          colors.setXYZ(
            i,
            THREE.MathUtils.lerp(COLORS.glass.r, COLORS.lamp.r, on),
            THREE.MathUtils.lerp(COLORS.glass.g, COLORS.lamp.g, on),
            THREE.MathUtils.lerp(COLORS.glass.b, COLORS.lamp.b, on),
          );
        }
      }
      facade.instanceMatrix.needsUpdate = true;
      glass.instanceMatrix.needsUpdate = true;
      if (colors) colors.needsUpdate = true;
    }

    /* ---- Crane -------------------------------------------------------- */
    /* Present from the very first frame, which is the point: without it the
       opening of the hero is an empty ground plane, and "nothing yet" is a poor
       thing to greet someone with. It also does most of the work of explaining
       that this is a building site rather than an abstract shape. */
    const crane = craneRef.current;
    if (crane) {
      // Dismantled through handover, as it would be on a real site.
      const retract = smoothstep((handover - 0.35) * 2.2);
      crane.visible = retract < 0.99;
      crane.scale.setScalar(Math.max(1 - retract, 0.0001));
    }
    if (craneMastRef.current) {
      /* Starts tall rather than growing from nothing. A crane is erected before
         the first pour, so this is what actually happens on site — and it means
         the hero's opening frame is a site with a crane on it rather than an
         empty ground plane, which was the first version's worst moment. */
      const built = Math.max(structure, stageProgress(p, "foundation") * 0.3);
      const height = 11 + built * (TOWER_HEIGHT - 8);
      craneMastRef.current.scale.y = height / CRANE_MAST_HEIGHT;
      craneMastRef.current.position.y = height / 2;
      if (craneJibRef.current) craneJibRef.current.position.y = height;
    }
    if (craneJibRef.current) {
      // A slow slew. Real cranes are almost never still, and a static one
      // reads as a prop.
      craneJibRef.current.rotation.y += delta * 0.12;
    }
    if (hookRef.current) {
      // The hook rides up and down as if placing the current floor.
      hookRef.current.position.y = -1.4 - (Math.sin(p * 40) * 0.5 + 0.5) * 2.2;
    }

    /* ---- Crown -------------------------------------------------------- */
    if (crownRef.current) {
      const reveal = smoothstep(handover * 1.6);
      crownRef.current.scale.setScalar(Math.max(reveal, 0.0001));
      crownRef.current.visible = reveal > 0.01;
    }
  });

  const shadows = tier === "high";

  return (
    <group>
      {/* Key light. Warm, low and off to one side — the single dramatic source
          the cinematic-gallery look is built on. */}
      <directionalLight
        position={[7, 16, 6]}
        intensity={3.6}
        color={HEX.ivory}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={26}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0005}
      />
      {/* Cool fill from the opposite side, so shadow faces are not dead black. */}
      <directionalLight position={[-8, 5, -6]} intensity={1.1} color={0x6f86a8} />
      <ambientLight intensity={0.55} />

      {/* Ground. Large enough that the fog eats its edge rather than the
          viewer seeing a floating slab. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadows}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={HEX.ground} roughness={0.95} metalness={0} />
      </mesh>

      <instancedMesh
        ref={capsRef}
        args={[undefined, undefined, Math.max(layout.caps.length, 1)]}
        castShadow={shadows}
      >
        <boxGeometry args={[0.62, 0.24, 0.62]} />
        <meshStandardMaterial color={HEX.concrete} roughness={0.95} metalness={0} />
      </instancedMesh>

      <mesh ref={coreRef} position={[TOWER.core.x, 0, TOWER.core.z]} castShadow={shadows}>
        <boxGeometry args={[TOWER.core.w, TOWER_HEIGHT, TOWER.core.d]} />
        {/* Darker than the frame around it. Lit to the same value it read as a
            featureless slab pushed in front of the columns, when what it should
            do is sit behind them and give the frame something to be read against. */}
        <meshStandardMaterial color={0x3d3933} roughness={0.95} metalness={0} />
      </mesh>

      <instancedMesh
        ref={columnsRef}
        args={[undefined, undefined, Math.max(layout.columns.length, 1)]}
        castShadow={shadows}
      >
        <boxGeometry args={[TOWER.columnSize, TOWER.storey, TOWER.columnSize]} />
        <meshStandardMaterial color={HEX.concreteLit} roughness={0.88} metalness={0} />
      </instancedMesh>

      <instancedMesh
        ref={slabsRef}
        args={[undefined, undefined, Math.max(layout.slabs.length, 1)]}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <boxGeometry
          args={[FOOTPRINT.width + 0.7, TOWER.slabThickness, FOOTPRINT.depth + 0.7]}
        />
        <meshStandardMaterial color={HEX.concrete} roughness={0.92} metalness={0} />
      </instancedMesh>

      {layout.facade.length > 0 && (
        <>
          {/* Spandrel — the solid band between windows. */}
          <instancedMesh
            ref={facadeRef}
            args={[undefined, undefined, layout.facade.length]}
            castShadow={shadows}
          >
            <boxGeometry args={[TOWER.spanX * 0.94, TOWER.storey * 0.34, 0.09]} />
            <meshStandardMaterial color={HEX.concreteLit} roughness={0.6} metalness={0.15} />
          </instancedMesh>

          {/* Glazing. Low roughness with no real transmission: at this scale the
              environment reflection sells glass far better than refraction, and
              costs a fraction as much. */}
          <instancedMesh ref={glassRef} args={[undefined, undefined, layout.facade.length]}>
            <boxGeometry args={[TOWER.spanX * 0.94, TOWER.storey * 0.58, 0.06]} />
            <meshStandardMaterial
              vertexColors
              roughness={0.08}
              metalness={0.55}
              envMapIntensity={2.4}
            />
          </instancedMesh>
        </>
      )}

      {/* Tower crane. Six meshes for a disproportionate amount of legibility —
          it is the difference between "an abstract mass" and "a site". */}
      <group ref={craneRef} position={[5.4, 0, -3.2]}>
        <mesh ref={craneMastRef} position={[0, CRANE_MAST_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.2, CRANE_MAST_HEIGHT, 0.2]} />
          <meshStandardMaterial color={0x6b5636} roughness={0.7} metalness={0.5} />
        </mesh>

        <group ref={craneJibRef} position={[0, 8, 0]}>
          {/* Jib */}
          <mesh position={[4.4, 0, 0]}>
            <boxGeometry args={[8, 0.16, 0.16]} />
            <meshStandardMaterial color={0x6b5636} roughness={0.7} metalness={0.5} />
          </mesh>
          {/* Counter-jib and its weight */}
          <mesh position={[-1.9, 0, 0]}>
            <boxGeometry args={[3.4, 0.2, 0.2]} />
            <meshStandardMaterial color={0x6b5636} roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[-3.3, -0.2, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.6]} />
            <meshStandardMaterial color={HEX.concrete} roughness={0.9} metalness={0} />
          </mesh>
          {/* Operator cab */}
          <mesh position={[0.55, -0.35, 0]}>
            <boxGeometry args={[0.7, 0.6, 0.5]} />
            <meshStandardMaterial color={HEX.concreteLit} roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Hoist line and hook */}
          <mesh ref={hookRef} position={[6.2, -2.2, 0]}>
            <boxGeometry args={[0.12, 0.5, 0.12]} />
            <meshStandardMaterial color={HEX.goldSoft} roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      </group>

      {/* Crown. The one place the brand gold appears in the scene. */}
      <mesh ref={crownRef} position={[0, TOWER_HEIGHT + 0.22, 0]}>
        <boxGeometry args={[FOOTPRINT.width + 0.9, 0.28, FOOTPRINT.depth + 0.9]} />
        <meshStandardMaterial
          color={HEX.gold}
          roughness={0.25}
          metalness={0.9}
          emissive={HEX.gold}
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}
