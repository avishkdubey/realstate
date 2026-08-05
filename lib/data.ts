import { amenities, amenityById } from "@/lib/placeholders/amenities";
import { locationBySlug, locations } from "@/lib/placeholders/locations";
import { postBySlug, posts, type BlogPost } from "@/lib/placeholders/posts";
import { projects } from "@/lib/placeholders/projects";
import { testimonials } from "@/lib/placeholders/testimonials";
import type { Amenity, Location, Project, Testimonial } from "@/lib/types";

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

/* -------------------------------------------------------------------------- */
/* Locations                                                                  */
/* -------------------------------------------------------------------------- */

export async function getLocations(): Promise<Location[]> {
  return locations;
}

export async function getLocation(slug: string): Promise<Location | undefined> {
  return locationBySlug.get(slug);
}

export async function getLocationSlugs(): Promise<string[]> {
  return locations.map((location) => location.slug);
}

/** Projects in a given corridor. `Location.name` joins to `Project.microMarket`. */
export async function getProjectsInLocation(name: string): Promise<Project[]> {
  return projects.filter((project) => project.microMarket === name);
}

/**
 * Corridors that currently have something to sell, newest interest first.
 * Used to decide which markers the overview map emphasises.
 */
export async function getLocationsWithProjects(): Promise<
  { location: Location; projectCount: number }[]
> {
  return locations.map((location) => ({
    location,
    projectCount: projects.filter((p) => p.microMarket === location.name).length,
  }));
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export type GalleryItem = {
  id: string;
  label: string;
  category: "exterior" | "interior" | "amenity" | "progress";
  projectSlug: string;
  projectName: string;
};

/**
 * Derived from the projects rather than stored separately, so the gallery
 * cannot drift out of sync with the portfolio. Real photography replaces the
 * generated entries without changing this signature.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return projects.flatMap((project) => {
    const base = { projectSlug: project.slug, projectName: project.name };

    const items: GalleryItem[] = [
      {
        ...base,
        id: `${project.id}-ext`,
        label: `${project.name} — elevation`,
        category: "exterior",
      },
      {
        ...base,
        id: `${project.id}-int`,
        label: `${project.name} — living`,
        category: "interior",
      },
    ];

    if (project.amenityIds.length > 0) {
      items.push({
        ...base,
        id: `${project.id}-amn`,
        label: `${project.name} — clubhouse`,
        category: "amenity",
      });
    }

    project.progress.slice(0, 2).forEach((entry, index) => {
      items.push({
        ...base,
        id: `${project.id}-prg-${index}`,
        label: `${project.name} — ${entry.caption}`,
        category: "progress",
      });
    });

    return items;
  });
}

/* -------------------------------------------------------------------------- */
/* Insights                                                                   */
/* -------------------------------------------------------------------------- */

export async function getPosts(): Promise<BlogPost[]> {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  return postBySlug.get(slug);
}

export async function getPostSlugs(): Promise<string[]> {
  return posts.map((post) => post.slug);
}
