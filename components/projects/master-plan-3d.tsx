"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { formatPrice } from "@/lib/format";
import type { Tower } from "@/lib/types";

/**
 * Interactive master plan.
 *
 * Towers are clickable; selecting one shows what is actually available in it.
 * The availability table below this component carries the same numbers and is
 * the crawlable, keyboard-complete version — this is an alternative view of
 * that data, never the only one (CLAUDE.md §7, §11).
 */
export function MasterPlan3D({ towers }: { towers: Tower[] }) {
  const [selected, setSelected] = useState(towers[0]?.id ?? null);
  const active = towers.find((tower) => tower.id === selected) ?? towers[0];

  const available = active
    ? active.units.filter((unit) => unit.status === "available")
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="bg-surface-1 aspect-[4/3] w-full border border-border">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [7, 6, 9], fov: 40 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#141414"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 6]} intensity={1.5} color="#f5f1e8" />
          <directionalLight position={[-6, 4, -5]} intensity={0.35} color="#b99c6b" />

          <Site />
          {towers.map((tower, index) => (
            <TowerMesh
              key={tower.id}
              tower={tower}
              index={index}
              count={towers.length}
              selected={tower.id === selected}
              onSelect={() => setSelected(tower.id)}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={18}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </div>

      <div>
        {/* Keyboard-operable tower selection — OrbitControls alone is not
            accessible, so the same choice exists as buttons. */}
        <div className="flex flex-wrap gap-2">
          {towers.map((tower) => (
            <button
              key={tower.id}
              type="button"
              onClick={() => setSelected(tower.id)}
              aria-pressed={tower.id === selected}
              className={
                tower.id === selected
                  ? "eyebrow bg-primary text-primary-foreground border-primary rounded-sm border px-4 py-2"
                  : "eyebrow border-border text-muted-foreground hover:border-foreground rounded-sm border px-4 py-2 transition-colors"
              }
            >
              {tower.name}
            </button>
          ))}
        </div>

        {active && (
          <div className="mt-8">
            <h3 className="text-h5">{active.name}</h3>
            <p className="text-small text-muted-foreground mt-2">
              {active.floors} floors · {available.length} of {active.units.length}{" "}
              available
            </p>

            {available.length > 0 && (
              <dl className="mt-6 space-y-4">
                <div className="border-t border-border pt-4">
                  <dt className="eyebrow text-muted-foreground">
                    Configurations available
                  </dt>
                  <dd className="mt-2">
                    {[...new Set(available.map((unit) => unit.bhk))].join(" · ")}
                  </dd>
                </div>
                <div className="border-t border-border pt-4">
                  <dt className="eyebrow text-muted-foreground">From</dt>
                  <dd className="mt-2">
                    {available[0].price
                      ? formatPrice(
                          Math.min(
                            ...available
                              .map((u) => u.price)
                              .filter((p): p is number => Boolean(p)),
                          ),
                        )
                      : "On request"}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        )}

        <p className="text-caption text-muted-foreground mt-8 leading-relaxed">
          Massing model — artist&apos;s impression, not to scale. Drag to orbit.
          The table below carries the same availability in full.
        </p>
      </div>
    </div>
  );
}

function TowerMesh({
  tower,
  index,
  count,
  selected,
  onSelect,
}: {
  tower: Tower;
  index: number;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Height tracks the real floor count so the model is at least directionally
  // honest about which tower is taller.
  const height = Math.max(2, tower.floors * 0.28);
  const spread = 3.2;
  const x = (index - (count - 1) / 2) * spread;

  // Each tower owns its material so hover state cannot leak between them.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2622",
        roughness: 0.35,
        metalness: 0.55,
      }),
    [],
  );

  // Target colours are built once. Allocating a THREE.Color inside the frame
  // loop is the classic way to turn a smooth scene into a stuttering one —
  // it hands the garbage collector work sixty times a second (CLAUDE.md §7).
  const palette = useMemo(
    () => ({
      idle: new THREE.Color("#2a2622"),
      hover: new THREE.Color("#8c6a3f"),
      selected: new THREE.Color("#b99c6b"),
    }),
    [],
  );

  useFrame(() => {
    if (!mesh.current) return;
    const target = selected
      ? palette.selected
      : hovered
        ? palette.hover
        : palette.idle;
    (mesh.current.material as THREE.MeshStandardMaterial).color.lerp(target, 0.12);
  });

  return (
    <mesh
      ref={mesh}
      position={[x, height / 2, 0]}
      material={material}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <boxGeometry args={[1.6, height, 1.6]} />
    </mesh>
  );
}

function Site() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
    </mesh>
  );
}
