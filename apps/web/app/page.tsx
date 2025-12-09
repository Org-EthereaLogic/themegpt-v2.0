export default function Home() {
  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900">
      {/* Option Label - For Review Context */}
      <div className="fixed top-3 right-3 z-50 rounded-lg bg-orange-accent px-4 py-2 text-[13px] font-bold text-white shadow-lg shadow-orange-accent/30">
        OPTION B: Frame Method
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-brown-900 bg-gradient-to-br from-[#E8956A] via-[#1F9E8F] to-[#1F9E8F] text-base shadow-sm">
            😊
          </div>
          <span className="text-xl font-bold text-brown-900">ThemeGPT</span>
        </div>
        <nav className="flex items-center gap-7">
          {["Themes", "Pricing", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
            >
              {item}
            </a>
          ))}
          <button className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30">
            Get Extension
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-8 py-[70px] text-center">
        {/* Zone Label */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 rounded bg-brown-900/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-cream">
          All Cream Background
        </div>

        <h1 className="mb-4.5 text-5xl font-bold leading-[1.15] text-brown-900">
          Make ChatGPT <span className="text-teal-500">yours</span>
        </h1>
        <p className="mx-auto mb-7 max-w-[520px] text-lg leading-relaxed text-brown-600">
          Beautiful themes that match your style. No coding, no hassle—just click
          and transform your ChatGPT experience.
        </p>
        <div className="flex justify-center gap-3.5">
          <button className="cursor-pointer rounded-full bg-brown-900 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-px">
            Add to Chrome — Free
          </button>
          <button className="cursor-pointer rounded-full border-[2px] border-brown-900 bg-transparent px-6 py-3 text-base font-semibold text-brown-900 transition-all hover:bg-brown-900 hover:text-white">
            View Themes
          </button>
        </div>
      </section>

      {/* Section Header */}
      <div className="bg-cream px-8 pt-[50px] pb-[30px] text-center">
        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
          ✨ Premium Themes
        </h2>
        <p className="text-base text-brown-600">
          Each theme sits in a white &quot;frame&quot; against the cream background
        </p>
      </div>

      {/* Theme Gallery */}
      <section className="relative px-8 pb-[70px] pt-5">
        <div className="absolute top-3 left-3 rounded bg-orange-accent/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white">
          Cream BG + White Card Frames
        </div>

        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Theme Card Components */}
          <ThemeCard
            name="Dracula"
            type="🌙 Dark Theme"
            bg="bg-[#282a36]"
            bubble="bg-[#343746] text-[#f8f8f2]"
            label="text-[#bd93f9]"
            input="bg-[#21222c] text-[#6272a4] border-[#44475a]"
            indicator={true}
          />
          <ThemeCard
            name="Rose Garden"
            type="☀️ Light Theme"
            bg="bg-[#FFF0F3]"
            bubble="bg-[#FFFFFF] text-[#5C374C]"
            label="text-[#E91E63]"
            input="bg-[#FFFFFF] text-[#8B6B7B] border-[#F8D7DA]"
          />
          <ThemeCard
            name="Ocean Breeze"
            type="☀️ Light Theme"
            bg="bg-[#E8F4F8]"
            bubble="bg-[#FFFFFF] text-[#1A535C]"
            label="text-[#00A896]"
            input="bg-[#FFFFFF] text-[#4A7C82] border-[#B8D8E0]"
          />
          <ThemeCard
            name="Monokai Pro"
            type="🌙 Dark Theme"
            bg="bg-[#2D2A2E]"
            bubble="bg-[#403E41] text-[#FCFCFA]"
            label="text-[#FFD866]"
            input="bg-[#221F22] text-[#939293] border-[#49474A]"
          />
          <ThemeCard
            name="Lavender Dreams"
            type="☀️ Light Theme"
            bg="bg-[#F3E8FF]"
            bubble="bg-[#FFFFFF] text-[#4A3560]"
            label="text-[#9333EA]"
            input="bg-[#FFFFFF] text-[#7C6B8E] border-[#E2D1F0]"
          />
          <ThemeCard
            name="Midnight Blue"
            type="🌙 Dark Theme"
            bg="bg-[#0F172A]"
            bubble="bg-[#1E293B] text-[#E2E8F0]"
            label="text-[#38BDF8]"
            input="bg-[#0F172A] text-[#64748B] border-[#334155]"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-cream-dark bg-cream px-8 py-[70px] text-center">
        <h2 className="mb-9 text-[32px] font-bold text-brown-900">
          Loved by everyday users
        </h2>
        <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-6">
          <Testimonial
            quote="Finally, ChatGPT matches my aesthetic! The Rose Garden theme is exactly what I wanted."
            author="Sarah, College Student"
          />
          <Testimonial
            quote="So easy to use. Changed themes in seconds and my students love seeing the different colors."
            author="Mike, High School Teacher"
          />
          <Testimonial
            quote="Love that they don't collect my data. Simple, safe, and my ChatGPT finally has personality!"
            author="Jen, Professor"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-900 p-7 text-center text-sm text-cream">
        <span className="opacity-85">
          No tracking • No data collection • Just beautiful themes
        </span>
      </footer>
    </div>
  );
}

// --- Helper Components ---

interface ThemeCardProps {
  name: string;
  type: string;
  bg: string;
  bubble: string;
  label: string;
  input: string;
  indicator?: boolean;
}

function ThemeCard({ name, type, bg, bubble, label, input, indicator }: ThemeCardProps) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_4px_24px_rgba(75,46,30,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(75,46,30,0.15)]">
      {indicator && (
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 rounded bg-brown-900 px-2 py-0.5 text-[9px] font-semibold text-cream z-10">
          White Frame
        </div>
      )}
      <div className="overflow-hidden rounded-xl">
        <div className={`flex min-h-[160px] flex-col gap-2.5 p-[22px] ${bg}`}>
          <div className={`rounded-[14px] p-3.5 text-xs leading-relaxed ${bubble}`}>
            <span className={`mr-1.5 font-semibold ${label}`}>ChatGPT:</span>
            Here&apos;s a quick summary of your notes from today...
          </div>
          <div className={`rounded-[22px] border border-solid px-4 py-3 text-[11px] ${input}`}>
            Message ChatGPT...
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white px-1.5 pt-3.5 pb-1.5">
        <div>
          <div className="text-[15px] font-semibold text-brown-900">{name}</div>
          <div className="mt-0.5 text-xs text-brown-600">{type}</div>
        </div>
        <button className="cursor-pointer rounded-[20px] bg-teal-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-teal-600">
          Preview
        </button>
      </div>
    </div>
  );
}

function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="flex flex-1 min-w-[240px] max-w-[280px] flex-col rounded-[14px] bg-white p-6 text-left shadow-[0_2px_16px_rgba(75,46,30,0.06)]">
      <p className="mb-3.5 text-[15px] leading-relaxed text-brown-900">
        &quot;{quote}&quot;
      </p>
      <div className="mt-auto text-sm font-semibold text-teal-500">
        — {author}
      </div>
    </div>
  );
}
