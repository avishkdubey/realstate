import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Article, WithContext } from "schema-dts";

import { JsonLd } from "@/components/seo/json-ld";
import { getPost, getPostSlugs, getPosts } from "@/lib/data";
import { formatMonth } from "@/lib/format";
import { faqSchema } from "@/lib/project-schema";
import { siteConfig } from "@/lib/site-config";
import type { BlogPost } from "@/lib/placeholders/posts";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const others = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      {post.faqs.length > 0 && <JsonLd data={faqSchema(post.faqs)} />}

      <article className="section pt-40">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="eyebrow text-muted-foreground">
            <Link href="/insights" className="hover:text-foreground">
              Insights
            </Link>
            <span aria-hidden> / </span>
            <span className="text-foreground">{post.category}</span>
          </nav>

          <p className="eyebrow text-accent mt-10">
            {formatMonth(post.publishedAt)} · {post.readingMinutes} min read
          </p>
          <h1 className="measure mt-6 text-h3 md:text-h2">{post.title}</h1>
          <p className="measure text-lead text-muted-foreground mt-8">
            {post.excerpt}
          </p>

          <div className="measure mt-16 space-y-10">
            {post.body.map((block, index) => (
              <section key={index}>
                {block.heading && (
                  <h2 className="mt-4 text-h5">{block.heading}</h2>
                )}
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {post.faqs.length > 0 && (
            <div className="measure mt-20 border-t border-border pt-10">
              <h2 className="text-h5">Common questions</h2>
              <dl className="mt-8">
                {post.faqs.map((faq) => (
                  <div key={faq.q} className="border-b border-border py-6">
                    <dt className="text-lead">{faq.q}</dt>
                    <dd className="text-muted-foreground mt-3">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <p className="measure text-caption text-muted-foreground mt-16 leading-relaxed">
            Written for general information and not as investment, tax or legal
            advice. Market figures are drawn from published industry reports and
            are directional; verify before acting on them.
          </p>
        </div>
      </article>

      {others.length > 0 && (
        <section className="section bg-surface-2">
          <div className="container-page">
            <p className="eyebrow text-accent">Keep reading</p>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link href={`/insights/${other.slug}`} className="group block">
                    <span className="eyebrow text-muted-foreground">
                      {other.category}
                    </span>
                    <span className="measure mt-3 block text-h5 group-hover:text-accent transition-colors">
                      {other.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function articleSchema(post: BlogPost): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: `${siteConfig.url}/insights/${post.slug}`,
  };
}
