import type { ReactNode } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-cream)" }}>
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}
