import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — ChatGPT Themes & Customization | ThemeGPT",
  description:
    "Guides and tips for customizing ChatGPT — dark mode, developer themes, token tracking, and more.",
  alternates: { canonical: "https://themegpt.ai/blog" },
  openGraph: {
    title: "Blog — ChatGPT Themes & Customization | ThemeGPT",
    description:
      "Guides and tips for customizing ChatGPT — dark mode, developer themes, token tracking, and more.",
    url: "https://themegpt.ai/blog",
  },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  return (
    <main className="pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            Blog
          </h1>
          <p className="text-lg" style={{ color: "#7A6555" }}>
            Guides and tips for getting the most out of ChatGPT.
          </p>
        </header>

        <ul className="space-y-8 list-none p-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <article>
                <Link href={`/blog/${post.slug}`} className="group no-underline block">
                  <div
                    className="rounded-2xl p-6 border transition-all duration-200 group-hover:shadow-md"
                    style={{ background: "#FFFFFF", borderColor: "#E5DDD5" }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: "#9B8070" }}>
                      {formatDate(post.date)} &middot; {post.readTime}
                    </p>
                    <h2
                      className="text-xl font-semibold mb-2 transition-colors group-hover:text-teal"
                      style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "#7A6555" }}>
                      {post.description}
                    </p>
                    <span
                      className="inline-block mt-4 text-sm font-medium"
                      style={{ color: "#5BB5A2" }}
                    >
                      Read article →
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
