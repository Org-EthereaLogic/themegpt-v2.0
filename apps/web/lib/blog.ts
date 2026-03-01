export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  keywords: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "chatgpt-dark-mode",
    title: "ChatGPT Dark Mode: The Complete Guide (2026)",
    description:
      "How to get dark mode on ChatGPT — and why ThemeGPT's 7 dark themes beat the built-in option for developers and power users.",
    date: "2026-03-01",
    readTime: "7 min read",
    keywords: [
      "chatgpt dark mode",
      "chatgpt dark theme",
      "dark mode chatgpt extension",
      "chatgpt dark mode chrome extension",
    ],
  },
  {
    slug: "developer-chatgpt-themes",
    title: "Dracula, Monokai Pro, and Solarized Dark for ChatGPT",
    description:
      "Bring your favorite IDE themes to ChatGPT. A developer's guide to Dracula, Monokai Pro, Solarized Dark, and One Dark themes for ChatGPT.",
    date: "2026-03-01",
    readTime: "5 min read",
    keywords: [
      "dracula theme chatgpt",
      "monokai chatgpt",
      "solarized dark chatgpt",
      "one dark chatgpt theme",
      "chatgpt developer themes",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
