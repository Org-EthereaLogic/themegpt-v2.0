import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";

const BASE = "https://themegpt.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/themes`, priority: 0.9, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${BASE}/support`, priority: 0.5, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${BASE}/privacy`, priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
    { url: `${BASE}/terms`, priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
  ];

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  return [...staticPages, ...blogEntries];
}
