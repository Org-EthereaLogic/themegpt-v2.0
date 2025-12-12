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
    } catch (error) {
      console.error('Checkout error', error)
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
          {[
            { label: "Themes", href: "#themes" },
            { label: "Pricing", href: "#pricing" },
            { label: "Features", href: "#features" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="#waitlist" className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30">
            Join Waitlist
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
          <a href="#waitlist" className="cursor-pointer rounded-full bg-brown-900 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-px">
            Join Waitlist
          </a>
          <a href="#themes" className="cursor-pointer rounded-full border-[2px] border-brown-900 bg-transparent px-6 py-3 text-base font-semibold text-brown-900 transition-all hover:bg-brown-900 hover:text-white">
            View Themes
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-cream px-8 pt-[30px] pb-[30px] text-center">
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
      </section>

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

      {/* Features */}
      <section id="features" className="border-t border-cream-dark bg-cream px-8 py-[70px] text-center">
        <h2 className="mb-9 text-[32px] font-bold text-brown-900">
          Why ThemeGPT?
        </h2>
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🎨"
            title="One-Click Themes"
            description="Transform ChatGPT instantly with beautiful, professionally designed themes. No coding required."
          />
          <FeatureCard
            icon="🔒"
            title="Privacy First"
            description="Everything runs locally in your browser. We never collect your data or track your conversations."
          />
          <FeatureCard
            icon="📊"
            title="Token Tracking"
            description="Monitor your ChatGPT usage in real-time. Know exactly how many tokens each conversation uses."
          />
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="bg-brown-900 px-8 py-[70px] text-center">
        <h2 className="mb-4 text-[32px] font-bold text-cream">
          Join the Waitlist
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-lg text-cream/80">
          Be the first to know when ThemeGPT launches. Get early access and exclusive themes.
        </p>
        <div className="mx-auto flex max-w-md gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full bg-white/10 px-5 py-3 text-cream placeholder:text-cream/50 border border-cream/20 focus:outline-none focus:border-teal-500"
          />
          <button className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition-colors">
            Notify Me
          </button>
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] bg-white p-8 shadow-[0_4px_24px_rgba(75,46,30,0.08)]">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-brown-900">{title}</h3>
      <p className="text-sm leading-relaxed text-brown-600">{description}</p>
    </div>
  );
}
