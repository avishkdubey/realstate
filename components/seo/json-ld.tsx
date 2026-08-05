import type { Thing, WithContext } from "schema-dts";

/**
 * Renders structured data as a server component so it lands in the initial
 * HTML — most AI crawlers never execute JS (CLAUDE.md §11).
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is authored in this codebase, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
