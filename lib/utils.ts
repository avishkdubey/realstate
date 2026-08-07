import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about this project's custom scales.
 *
 * Out of the box it knows nothing about `text-h3` or `text-bronze`, so it
 * groups them both under "text-*" and treats them as conflicting — the README
 * documents this as the reason `.eyebrow` is not called `.text-luxury`. The
 * practical failure is silent: `cn("text-h3", "text-accent")` drops one of
 * them, and which one depends on argument order.
 *
 * Declaring the two scales separately means a size and a colour can coexist,
 * and two sizes still collapse to the last one, which is the whole point of
 * calling `cn()` in the first place.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["caption", "small", "base", "lead", "h1", "h2", "h3", "h4", "h5"] },
      ],
      "text-color": [
        {
          text: [
            "charcoal",
            "charcoal-2",
            "ivory",
            "cream",
            "gold",
            "gold-soft",
            "bronze",
            "forest",
            "forest-lift",
            "navy",
            "stone",
            "stone-2",
            "surface-0",
            "surface-1",
            "surface-2",
            "surface-3",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
