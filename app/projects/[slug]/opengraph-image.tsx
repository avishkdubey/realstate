import { ImageResponse } from "next/og";

import { getProject } from "@/lib/data";
import { formatStatus, priceLabel } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project overview";

/**
 * Per-project Open Graph card.
 *
 * Rendered at build time from the same data as the page, so a link shared on
 * WhatsApp — which is how most of these conversations start — carries the
 * configuration and the price rather than a generic logo.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#141414",
            color: "#F5F1E8",
            fontSize: 56,
          }}
        >
          {siteConfig.name}
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #141414 0%, #2a2622 62%, #4a4038 100%)",
          color: "#F5F1E8",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Satori requires an explicit display on any element with more than
            one child, and interpolated text counts — so every line below is a
            single pre-composed string. */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
          <span style={{ letterSpacing: 4, color: "#C9AE7C" }}>
            {`${formatStatus(project.status).toUpperCase()} · ${project.microMarket.toUpperCase()}`}
          </span>
          <span style={{ letterSpacing: 4, color: "#9A9A9A" }}>
            {siteConfig.name.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05 }}>
            {project.name}
          </div>
          <div
            style={{ display: "flex", fontSize: 30, color: "#9A9A9A", marginTop: 20 }}
          >
            {`${project.bhkOptions.join(" · ")} · ${priceLabel(project)}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#9A9A9A",
          }}
        >
          <span>
            {`${project.carpetAreaMin.toLocaleString("en-IN")}–${project.carpetAreaMax.toLocaleString("en-IN")} sq ft carpet`}
          </span>
          <span>{`RERA ${project.reraNumber}`}</span>
        </div>
      </div>
    ),
    size,
  );
}
