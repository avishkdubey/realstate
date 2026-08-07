import { STAGE_FILL, STAGE_LABELS } from "@/lib/construction-stages";
import { formatMonth } from "@/lib/format";
import type { Project } from "@/lib/types";

type Entry = Project["progress"][number];

/**
 * Dated construction updates.
 *
 * Possession delay is the single biggest fear this audience brings to a
 * builder, and dated site photography is the most effective answer to it
 * (CLAUDE.md §2). Until real photographs exist, each entry carries a schematic
 * that shows how far up the building has got.
 */
export function ProgressTimeline({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="divide-y divide-border">
      {entries.map((entry) => (
        <li
          key={entry.date}
          className="grid items-start gap-6 py-8 sm:grid-cols-[160px_1fr_120px]"
        >
          <span className="eyebrow text-muted-foreground">
            {formatMonth(entry.date)}
          </span>
          <span>
            <span className="block text-base">{entry.caption}</span>
            {entry.stage && (
              <span className="eyebrow text-accent mt-2 block">
                {STAGE_LABELS[entry.stage]}
              </span>
            )}
          </span>
          {entry.stage && <StageGlyph stage={entry.stage} />}
        </li>
      ))}
    </ol>
  );
}

function StageGlyph({ stage }: { stage: NonNullable<Entry["stage"]> }) {
  const fill = STAGE_FILL[stage];
  const floors = 6;
  const built = Math.round(floors * fill);

  return (
    <svg
      viewBox="0 0 40 48"
      className="h-12 w-10 justify-self-start sm:justify-self-end"
      role="img"
      aria-label={`${STAGE_LABELS[stage]} — schematic progress indicator`}
    >
      {Array.from({ length: floors }, (_, i) => {
        const y = 44 - (i + 1) * 7;
        return (
          <rect
            key={i}
            x={6}
            y={y}
            width={28}
            height={6}
            className={
              i < built ? "fill-[var(--forest-lift)]" : "fill-[var(--border)]"
            }
          />
        );
      })}
      <rect x={2} y={44} width={36} height={2} className="fill-[var(--stone-2)]" />
    </svg>
  );
}
