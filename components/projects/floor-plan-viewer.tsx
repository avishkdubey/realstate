"use client";

import { useCallback, useRef, useState } from "react";
import { Minus, Move, Plus, RotateCcw } from "lucide-react";

import {
  compassRotation,
  getFloorPlan,
  roomDimensions,
  vastuNote,
  type Room,
} from "@/lib/floor-plans";
import type { Facing } from "@/lib/types";
import { cn } from "@/lib/utils";

type PlanOption = {
  bhk: string;
  carpetArea: number;
  facing: Facing;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * Floor-plan viewer with zoom, pan and Vastu labelling.
 *
 * Rendered as SVG rather than an image so it stays crisp at every zoom level
 * and costs a couple of kilobytes. Room dimensions are computed from the unit's
 * real carpet area even though the drawing itself is schematic — the label has
 * to be true even when the picture is only indicative.
 *
 * Keyboard-operable throughout: the plan is focusable, arrows pan, +/- zoom,
 * and 0 resets. Dragging is a progressive enhancement on top of that.
 */
export function FloorPlanViewer({ options }: { options: PlanOption[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ x: number; y: number } | null>(null);

  const option = options[active];
  const plan = getFloorPlan(option.bhk);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const changeZoom = useCallback((delta: number) => {
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta));
      // Snapping back to 1 should also recentre, or the plan drifts off-frame.
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = 12 / zoom;
    switch (event.key) {
      case "+":
      case "=":
        changeZoom(0.5);
        break;
      case "-":
        changeZoom(-0.5);
        break;
      case "0":
        reset();
        break;
      case "ArrowLeft":
        setOffset((o) => ({ ...o, x: o.x + step }));
        break;
      case "ArrowRight":
        setOffset((o) => ({ ...o, x: o.x - step }));
        break;
      case "ArrowUp":
        setOffset((o) => ({ ...o, y: o.y + step }));
        break;
      case "ArrowDown":
        setOffset((o) => ({ ...o, y: o.y - step }));
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (zoom === MIN_ZOOM) return;
    dragState.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragState.current) return;
    setOffset({
      x: event.clientX - dragState.current.x,
      y: event.clientY - dragState.current.y,
    });
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  return (
    <div>
      {options.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {options.map((item, index) => (
            <button
              key={`${item.bhk}-${item.carpetArea}`}
              type="button"
              onClick={() => {
                setActive(index);
                reset();
              }}
              aria-pressed={index === active}
              className={cn(
                "eyebrow rounded-sm border px-4 py-2 transition-colors duration-200",
                index === active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {item.bhk} · {item.carpetArea.toLocaleString("en-IN")} sq ft
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div
            role="img"
            aria-label={`Schematic floor plan for the ${option.bhk}, ${option.facing} facing`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={cn(
              "bg-card relative overflow-hidden border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              zoom > MIN_ZOOM ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default",
            )}
          >
            <svg
              viewBox={`-2 -2 ${plan.width + 4} ${plan.height + 4}`}
              className="block h-auto w-full"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "center",
              }}
            >
              {plan.rooms.map((room) => (
                <RoomShape
                  key={room.name}
                  room={room}
                  carpetArea={option.carpetArea}
                />
              ))}

              {/* Entry marker */}
              <g>
                <circle
                  cx={plan.entry.x}
                  cy={plan.entry.y}
                  r={0.6}
                  className="fill-[var(--gold)]"
                />
                <text
                  x={plan.entry.x + 1}
                  y={plan.entry.y + 0.3}
                  className="fill-[var(--stone-2)]"
                  style={{ fontSize: 0.9 }}
                >
                  Entry
                </text>
              </g>
            </svg>

            <Compass facing={option.facing} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ControlButton onClick={() => changeZoom(0.5)} label="Zoom in">
              <Plus size={16} aria-hidden />
            </ControlButton>
            <ControlButton onClick={() => changeZoom(-0.5)} label="Zoom out">
              <Minus size={16} aria-hidden />
            </ControlButton>
            <ControlButton onClick={reset} label="Reset view">
              <RotateCcw size={16} aria-hidden />
            </ControlButton>
            <p className="text-caption text-muted-foreground ml-2 flex items-center gap-2">
              <Move size={14} aria-hidden />
              Drag to pan when zoomed · arrows, +, − and 0 also work
            </p>
          </div>

          <p className="text-caption text-muted-foreground mt-4">
            Schematic — not to scale. Artist&apos;s impression for
            representational purposes only. Room dimensions are derived from the
            RERA carpet area and are indicative; refer to the agreement for
            final measurements.
          </p>
        </div>

        <div>
          <dl className="space-y-6">
            <div className="border-t border-border pt-4">
              <dt className="eyebrow text-muted-foreground">Configuration</dt>
              <dd className="mt-2 text-lead">{option.bhk}</dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="eyebrow text-muted-foreground">Carpet area</dt>
              <dd className="mt-2 text-lead">
                {option.carpetArea.toLocaleString("en-IN")} sq ft
              </dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="eyebrow text-muted-foreground">Facing</dt>
              <dd className="mt-2 text-lead">{option.facing}</dd>
            </div>
          </dl>

          <p className="measure text-small text-muted-foreground mt-8 leading-relaxed">
            {vastuNote(option.facing)}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoomShape({ room, carpetArea }: { room: Room; carpetArea: number }) {
  /* On the ivory site the habitable rooms were tinted cream and ivory — lighter
     than the page, so they read as "floor". Inverted, the same idea is a step
     *up* the elevation ramp: living is the brightest surface, bedrooms one
     below, wet and service areas left as open ground. */
  const fill =
    room.kind === "living"
      ? "fill-[var(--surface-3)]"
      : room.kind === "bedroom"
        ? "fill-[var(--surface-2)]"
        : "fill-transparent";

  return (
    <g>
      <rect
        x={room.x}
        y={room.y}
        width={room.w}
        height={room.h}
        className={cn(fill, "stroke-[var(--stone-2)]")}
        strokeWidth={0.12}
      />
      <text
        x={room.x + room.w / 2}
        y={room.y + room.h / 2 - 0.3}
        textAnchor="middle"
        className="fill-[var(--ivory)]"
        style={{ fontSize: 0.85, letterSpacing: 0.02 }}
      >
        {room.name}
      </text>
      <text
        x={room.x + room.w / 2}
        y={room.y + room.h / 2 + 1}
        textAnchor="middle"
        className="fill-[var(--stone-2)]"
        style={{ fontSize: 0.7 }}
      >
        {roomDimensions(room, carpetArea)}
      </text>
    </g>
  );
}

/** North arrow, rotated to the unit's facing so Vastu reads at a glance. */
function Compass({ facing }: { facing: Facing }) {
  return (
    <div className="bg-background/90 absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full border border-border">
      <svg
        viewBox="-12 -12 24 24"
        className="h-10 w-10"
        style={{ transform: `rotate(${compassRotation(facing)}deg)` }}
        aria-hidden
      >
        <path d="M0,-9 L2.6,2 L0,0.4 L-2.6,2 Z" className="fill-[var(--bronze)]" />
        <text
          x={0}
          y={-9.5}
          textAnchor="middle"
          className="fill-[var(--stone-2)]"
          style={{ fontSize: 4 }}
        >
          N
        </text>
      </svg>
      <span className="sr-only">North is towards the {facing.toLowerCase()}</span>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="border-border hover:border-foreground flex h-9 w-9 items-center justify-center rounded-sm border transition-colors duration-200"
    >
      {children}
    </button>
  );
}
