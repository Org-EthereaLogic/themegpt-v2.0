import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "@/lib/blog";
import { ChatGPTDarkModeContent } from "../_content/chatgpt-dark-mode";
import { DeveloperThemesContent } from "../_content/developer-chatgpt-themes";
import type { FC } from "react";

const contentMap: Record<string, FC> = {
  "chatgpt-dark-mode": ChatGPTDarkModeContent,
  "developer-chatgpt-themes": DeveloperThemesContent,
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | ThemeGPT`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://themegpt.ai/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://themegpt.ai/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Content = contentMap[slug];
  if (!Content) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "ThemeGPT" },
    publisher: {
      "@type": "Organization",
      name: "ThemeGPT",
      url: "https://themegpt.ai",
    },
    url: `https://themegpt.ai/blog/${post.slug}`,
  };

  return (
    <main className="pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/blog"
            className="text-sm no-underline transition-colors"
            style={{ color: "#7A6555" }}
          >
            ← Blog
          </Link>
        </nav>
        <article>
          <header className="mb-10">
            <p className="text-xs font-medium mb-4" style={{ color: "#9B8070" }}>
              {formatDate(post.date)} &middot; {post.readTime}
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              {post.title}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "#7A6555" }}>
              {post.description}
            </p>
          </header>
          <div className="border-t mb-10" style={{ borderColor: "#E5DDD5" }} />
          <Content />
          <div className="border-t mt-12 pt-10" style={{ borderColor: "#E5DDD5" }}>
            <p className="text-sm mb-4" style={{ color: "#7A6555" }}>
              Ready to transform your ChatGPT experience?
            </p>
            <a
              href="https://chromewebstore.google.com/detail/themegpt-chatgpt-themes/dlphknialdlpmcgoknkcmapmclgckhba"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "#5BB5A2",
                boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
              }}
            >
              Install ThemeGPT Free →
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}
