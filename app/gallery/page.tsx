import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getGalleryItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Elevations, interiors, amenities and dated construction photography across our Ahmedabad projects.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-accent">Imagery</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Gallery</h1>
        <p className="measure text-muted-foreground mt-6">
          Elevations, interiors, amenities and site progress, filterable by
          project. Every render is an artist&apos;s impression; construction
          photographs are dated and unretouched.
        </p>

        <div className="mt-16">
          <GalleryGrid items={items} />
        </div>

        <p className="measure text-caption text-muted-foreground mt-20 leading-relaxed">
          All images on this page are placeholders pending client photography.
          Renders are an artist&apos;s impression and for representational
          purposes only.
        </p>
      </div>
    </section>
  );
}
