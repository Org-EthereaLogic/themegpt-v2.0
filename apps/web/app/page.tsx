import dynamic from "next/dynamic";
import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";

const ThemesSection = dynamic(() =>
  import("@/components/sections/ThemesSection").then((m) => ({ default: m.ThemesSection }))
);
const FeaturesSection = dynamic(() =>
  import("@/components/sections/FeaturesSection").then((m) => ({ default: m.FeaturesSection }))
);
const CheckoutController = dynamic(() => import("@/components/CheckoutController"));

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <CustomCursor />
      <Navigation />
      <Hero />
      <ThemesSection />
      <CheckoutController />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
