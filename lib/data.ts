import { amenities, amenityById } from "@/lib/placeholders/amenities";
import { projects } from "@/lib/placeholders/projects";
import { testimonials } from "@/lib/placeholders/testimonials";
import type { Amenity, Project, Testimonial } from "@/lib/types";

/**
 * The data access seam.
 *
 * Phase 1 reads from the local placeholder modules so the site is demo-ready
 * without any CMS credentials. Every function is async and returns the same
 * shapes a Sanity query would, so wiring the CMS in later means rewriting this
 * file alone — no component changes, no prop changes.
 */

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug);
}

export async function getProjectSlugs(): Promise<string[]> {
  return projects.map((project) => project.slug);
}

export async function getAmenities(ids?: string[]): Promise<Amenity[]> {
  if (!ids) return amenities;
  return ids
    .map((id) => amenityById.get(id))
    .filter((amenity): amenity is Amenity => Boolean(amenity));
}

export async function getTestimonials(projectSlug?: string): Promise<Testimonial[]> {
  if (!projectSlug) return testimonials;
  return testimonials.filter((t) => t.projectSlug === projectSlug);
}

/** Distinct micro-markets across the portfolio, for the listing filters. */
export async function getMicroMarkets(): Promise<string[]> {
  return [...new Set(projects.map((project) => project.microMarket))].sort();
}

/** Distinct BHK configurations across the portfolio, ordered numerically. */
export async function getBhkOptions(): Promise<string[]> {
  const all = new Set(projects.flatMap((project) => project.bhkOptions));
  return [...all].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}
