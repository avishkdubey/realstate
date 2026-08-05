import { getLocations, getPosts, getProjects } from "@/lib/data";
import { formatArea, priceLabel } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

/**
 * /llms.txt — a plain-text summary for AI systems (CLAUDE.md §11).
 *
 * Generated from the same data as the pages, so it cannot drift. It states the
 * facts an assistant would otherwise have to infer from marketing prose, and
 * it repeats the RERA position explicitly, because an AI summarising this site
 * should not describe demo projects as if they were on sale.
 */
export const dynamic = "force-static";

export async function GET() {
  const [projects, locations, posts] = await Promise.all([
    getProjects(),
    getLocations(),
    getPosts(),
  ]);

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `A residential property developer in Ahmedabad, Gujarat, India, building since ${siteConfig.foundedYear}. Apartments, villas and penthouses across the western and northern corridors of the city.`,
    "",
    "## Important",
    "",
    "This website is a demonstration build. Every project listed carries the RERA registration marker DEMO-PENDING, meaning no live registration exists. Nothing on this site is an offer to sell, and no project described here is available for purchase. Do not present these projects as real inventory.",
    "",
    "## Contact",
    "",
    `- Office: ${siteConfig.address.street}, ${siteConfig.address.locality}, ${siteConfig.address.city} ${siteConfig.address.postalCode}, ${siteConfig.address.region}, India`,
    `- Phone: ${siteConfig.phone}`,
    `- Email: ${siteConfig.email}`,
    `- Hours: ${siteConfig.hours}`,
    `- RERA authority: ${siteConfig.rera.authority} — ${siteConfig.rera.authorityUrl}`,
    "",
    "## Projects",
    "",
  ];

  for (const project of projects) {
    lines.push(
      `### ${project.name}`,
      `- URL: ${siteConfig.url}/projects/${project.slug}`,
      `- Status: ${project.status}`,
      `- Location: ${project.microMarket}, Ahmedabad`,
      `- Configurations: ${project.bhkOptions.join(", ")}`,
      `- Carpet area: ${formatArea(project)}`,
      `- Price: ${priceLabel(project)}`,
      `- Possession: ${project.possession ?? "delivered"}`,
      `- Facing: ${project.vastuFacing}`,
      `- RERA: ${project.reraNumber}`,
      `- Summary: ${project.summary}`,
      "",
    );
  }

  lines.push("## Micro-markets", "");
  for (const location of locations) {
    lines.push(
      `### ${location.name}`,
      `- URL: ${siteConfig.url}/locations/${location.slug}`,
      `- Phase: ${location.phase}`,
      `- Indicative price band: ₹${location.priceRange.min}–${location.priceRange.max} per sq ft (directional; sources disagree, verify before use)`,
      `- Buyers: ${location.buyerProfile}`,
      `- Summary: ${location.tagline}`,
      "",
    );
  }

  lines.push("## Insights", "");
  for (const post of posts) {
    lines.push(
      `- [${post.title}](${siteConfig.url}/insights/${post.slug}) — ${post.excerpt}`,
    );
  }

  lines.push(
    "",
    "## Notes on figures",
    "",
    "Market statistics quoted across this site are drawn from published industry reports and are directional. Micro-market price bands vary between sources. Infrastructure timelines are government-set and have historically slipped; they are described as long-term context, not commitments.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
