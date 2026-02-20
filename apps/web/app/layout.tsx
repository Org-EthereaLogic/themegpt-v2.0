import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://themegpt.ai"),
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
        className={`${dmSans.variable} ${fraunces.variable} antialiased`}
        suppressHydrationWarning
      >
        <Analytics />
        <CookieConsent />
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
