import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { Analytics } from "@/components/Analytics";
import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import { GoogleAdsAnalytics } from "@/components/GoogleAdsAnalytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { CookieConsent } from "@/components/CookieConsent";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://themegpt.ai"),
  title: "ChatGPT Themes & Dark Mode — ThemeGPT",
  description: "Customize ChatGPT with 15 handcrafted themes — including dark mode and animated effects. Free Chrome extension, one-click install.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Give ChatGPT a Dark Mode (and 14 Other Themes) — ThemeGPT",
    description: "Customize ChatGPT with 15 handcrafted themes — including dark mode and animated effects. Free Chrome extension, one-click install.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Give ChatGPT a Dark Mode (and 14 Other Themes) — ThemeGPT",
    description: "Customize ChatGPT with 15 handcrafted themes — including dark mode and animated effects. Free Chrome extension, one-click install.",
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
        className={`${dmSans.variable} ${fraunces.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        <Analytics />
        <ClarityAnalytics />
        <GoogleAdsAnalytics />
        <CookieConsent />
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
