"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const handleCheckout = async (type: 'subscription' | 'one-time', themeId?: string) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, themeId })
      })
      const data = await res.json()
      if (data.success) {
        // Redirect to success page with key
        router.push(`/success?key=${data.licenseKey}`)
      } else {
        alert('Checkout failed: ' + data.message)
      }
    } catch (e) {
      alert('Checkout error')
    }
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/mascot-48.png"
            alt="ThemeGPT mascot"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full shadow-sm"
            priority
          />
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
          <a href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba" target="_blank" className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30">
            Get Extension
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-8 py-[70px] text-center">

        <h1 className="mb-4.5 text-5xl font-bold leading-[1.15] text-brown-900">
          Make ChatGPT <span className="text-teal-500">yours</span>
        </h1>
        <p className="mx-auto mb-7 max-w-[520px] text-lg leading-relaxed text-brown-600">
          Beautiful themes that match your style. No coding, no hassle—just click
          and transform your ChatGPT experience.
        </p>
        <div className="flex justify-center gap-3.5">
          <a href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba" target="_blank" className="cursor-pointer rounded-full bg-brown-900 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-px">
            Add to Chrome — Free
          </a>
          <a href="#themes" className="cursor-pointer rounded-full border-[2px] border-brown-900 bg-transparent px-6 py-3 text-base font-semibold text-brown-900 transition-all hover:bg-brown-900 hover:text-white">
            View Themes
          </a>
        </div>
      </section>

      {/* Pricing Section (New) */}
      <div className="bg-cream px-8 pt-[30px] pb-[30px] text-center">
        <h2 className="mb-6 text-[32px] font-bold text-brown-900">
          ✨ Simple Pricing
        </h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {/* Subscription Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[280px] border-2 border-teal-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                    Best Value
                </div>
                <h3 className="text-xl font-bold mb-2">Infinite Style</h3>
                <div className="text-4xl font-bold text-brown-900 mb-2">$1.99<span className="text-base font-normal opacity-60">/mo</span></div>
                <p className="opacity-70 text-sm mb-6 min-h-[40px]">Access to 3 active premium themes at once. Swap anytime.</p>
                <button 
                  onClick={() => handleCheckout('subscription')}
                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
                >
                    Subscribe Now
                </button>
            </div>

            {/* Pay Per Theme Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[280px] border border-brown-900/10">
                <h3 className="text-xl font-bold mb-2">Single Theme</h3>
                <div className="text-4xl font-bold text-brown-900 mb-2">$0.99<span className="text-base font-normal opacity-60">/ea</span></div>
                <p className="opacity-70 text-sm mb-6 min-h-[40px]">Own a specific theme forever. One-time purchase.</p>
                <button 
                   onClick={() => {
                        const themeId = prompt("Enter Theme ID to buy (e.g., 'synth-wave'):", "synth-wave")
                        if(themeId) handleCheckout('one-time', themeId)
                   }}
                   className="w-full py-3 rounded-xl bg-brown-900 text-white font-bold hover:bg-brown-800 transition-colors"
                >
                    Buy One Theme
                </button>
            </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-cream px-8 pt-[50px] pb-[30px] text-center">
        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
          Premium Gallery
        </h2>
        <p className="text-base text-brown-600 max-w-2xl mx-auto">
          Unlock our full collection of professionally designed themes.
        </p>
      </div>

      {/* Theme Gallery */}
      <section id="themes" className="px-8 pb-[70px] pt-5">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          
          <ThemeCard
            name="Dracula"
            type="🌙 Dark Theme"
            bg="bg-[#282a36]"
            bubble="bg-[#343746] text-[#f8f8f2]"
            label="text-[#bd93f9]"
            input="bg-[#21222c] text-[#6272a4] border-[#44475a]"
            onBuy={() => handleCheckout('one-time', 'dracula')}
          />
          <ThemeCard
            name="Rose Garden"
            type="☀️ Light Theme"
            bg="bg-[#FFF0F3]"
            bubble="bg-[#FFFFFF] text-[#5C374C]"
            label="text-[#E91E63]"
            input="bg-[#FFFFFF] text-[#8B6B7B] border-[#F8D7DA]"
             onBuy={() => handleCheckout('one-time', 'rose-garden')}
          />
          <ThemeCard
            name="Ocean Breeze"
            type="☀️ Light Theme"
            bg="bg-[#E8F4F8]"
            bubble="bg-[#FFFFFF] text-[#1A535C]"
            label="text-[#00A896]"
            input="bg-[#FFFFFF] text-[#4A7C82] border-[#B8D8E0]"
             onBuy={() => handleCheckout('one-time', 'ocean-breeze')}
          />
          <ThemeCard
            name="Monokai Pro"
            type="🌙 Dark Theme"
            bg="bg-[#2D2A2E]"
            bubble="bg-[#403E41] text-[#FCFCFA]"
            label="text-[#FFD866]"
            input="bg-[#221F22] text-[#939293] border-[#49474A]"
            onBuy={() => handleCheckout('one-time', 'monokai-pro')}
          />
          <ThemeCard
            name="Lavender Dreams"
            type="☀️ Light Theme"
            bg="bg-[#F3E8FF]"
            bubble="bg-[#FFFFFF] text-[#4A3560]"
            label="text-[#9333EA]"
            input="bg-[#FFFFFF] text-[#7C6B8E] border-[#E2D1F0]"
             onBuy={() => handleCheckout('one-time', 'lavender-dreams')}
          />
          <ThemeCard
            name="Midnight Blue"
            type="🌙 Dark Theme"
            bg="bg-[#0F172A]"
            bubble="bg-[#1E293B] text-[#E2E8F0]"
            label="text-[#38BDF8]"
            input="bg-[#0F172A] text-[#64748B] border-[#334155]"
             onBuy={() => handleCheckout('one-time', 'midnight-blue')}
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
  onBuy?: () => void;
}

function ThemeCard({ name, type, bg, bubble, label, input, onBuy }: ThemeCardProps) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_4px_24px_rgba(75,46,30,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(75,46,30,0.15)]">
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
        <button 
          onClick={(e) => {
              e.stopPropagation()
              onBuy?.()
          }}
          className="cursor-pointer rounded-[20px] bg-teal-500/10 text-teal-600 hover:bg-teal-500 hover:text-white px-4 py-2 text-[13px] font-medium transition-colors"
        >
          Buy $0.99
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
