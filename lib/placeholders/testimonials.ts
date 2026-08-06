import type { Testimonial } from "@/lib/types";

/**
 * Customer testimonials.
 *
 * Deliberately empty. The client's current site renders its testimonials
 * client-side, so none could be carried across, and writing quotes and
 * attributing them to named buyers would be fabricating reviews for a real
 * business — not something to ship and quietly hope gets replaced.
 *
 * The carousel and the NRI page both hide themselves when this is empty, so
 * the site reads correctly until the real quotes arrive.
 *
 * TODO(client): supply quotes with a real name, role and locality. Anonymous
 * testimonials carry no weight with this audience and are worse than none
 * (CLAUDE.md §2).
 */
export const testimonials: Testimonial[] = [];
