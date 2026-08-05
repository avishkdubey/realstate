import type { Metadata } from "next";
import Link from "next/link";

import { FadeInView } from "@/components/motion/fade-in-view";
import { getPosts } from "@/lib/data";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Market notes, Vastu guides, locality guides and home-loan explainers for buyers in Ahmedabad.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const posts = await getPosts();

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Journal</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Insights</h1>
        <p className="measure text-muted-foreground mt-6">
          What we have actually learned about this market, including the parts
          that do not flatter us. No listings, no offers.
        </p>

        <ul className="mt-16 divide-y divide-border border-t border-border">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <FadeInView delay={index * 0.05}>
                <Link href={`/insights/${post.slug}`} className="group block py-10">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <span className="eyebrow text-bronze">{post.category}</span>
                    <span className="eyebrow text-muted-foreground">
                      {formatMonth(post.publishedAt)} · {post.readingMinutes} min
                    </span>
                  </div>
                  <h2 className="measure mt-4 text-h4 group-hover:text-bronze transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="measure text-muted-foreground mt-3">
                    {post.excerpt}
                  </p>
                </Link>
              </FadeInView>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
