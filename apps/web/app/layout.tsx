import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://themegpt.app"),
  title: "ThemeGPT - Custom Themes for ChatGPT",
  description: "Personalize your ChatGPT experience with beautiful, one-click themes. No coding required.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ThemeGPT - Custom Themes for ChatGPT",
    description: "Personalize your ChatGPT experience with beautiful, one-click themes. No coding required.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThemeGPT - Custom Themes for ChatGPT",
    description: "Personalize your ChatGPT experience with beautiful, one-click themes. No coding required.",
    images: ["/twitter-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
