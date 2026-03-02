import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────
const LINKS = {
  Explore: ["Top Destinations", "Hidden Gems", "Seasonal Picks", "AI Itineraries", "Travel Guides"],
  Company:  ["About Us", "How It Works", "Careers", "Press", "Blog"],
  Support:  ["Help Center", "Privacy Policy", "Terms of Use", "Cookie Settings", "Contact"],
};

const SOCIALS = [
  { label: "X",         href: "#", icon: "𝕏" },
  { label: "Instagram", href: "#", icon: "◎" },
  { label: "TikTok",    href: "#", icon: "♪" },
  { label: "Youtube",   href: "#", icon: "▶" },
];

const MARQUEE_ITEMS = [
  "Santorini", "Kyoto", "Patagonia", "Amalfi", "Bali",
  "Machu Picchu", "Serengeti", "Reykjavik", "Maldives", "Lisbon",
];

// ── Marquee strip ──────────────────────────────────────────────────────────
function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden py-5 border-y border-white/10">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to right, #07080f, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to left, #07080f, transparent)" }} />

      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((name, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Georgia', serif", color: i % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(96,165,250,0.6)" }}>
            <span className="text-blue-400/40">✦</span>
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Newsletter ─────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);

  const submit = () => {
    if (!email) return;
    setSent(true);
    setEmail("");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs tracking-widest uppercase text-white/40 font-semibold mb-1">
        AI Travel Digest
      </p>
      <h3 className="text-lg font-bold text-white leading-snug" style={{ fontFamily: "'Georgia', serif" }}>
        Get personalised<br />destination drops
      </h3>
      <p className="text-sm text-white/45 leading-relaxed">
        Weekly AI-curated picks, secret spots, and trip inspo — straight to your inbox.
      </p>

      {sent ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-blue-400 font-semibold mt-1"
        >
          ✓ You're in — adventures incoming!
        </motion.p>
      ) : (
        <div className="flex mt-1 rounded-lg overflow-hidden border border-white/10 focus-within:border-blue-500/60 transition-colors">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="your@email.com"
            className="flex-1 bg-white/5 text-sm text-white placeholder-white/25 px-4 py-3 outline-none"
          />
          <button
            onClick={submit}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-400 transition-colors text-sm font-semibold text-white"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Footer ────────────────────────────────────────────────────────────
export default function Footer() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stagger = (i) => ({
    initial:  { opacity: 0, y: 28 },
    animate:  inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  });

  return (
    <footer
      ref={ref}
      style={{ background: "linear-gradient(180deg, #020617 0%, #0a1425 0%, #0f172a 0%)", fontFamily: "'DM Sans', sans-serif" }}
      className="relative overflow-hidden text-white"
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
      />

    

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand column */}
          <motion.div {...stagger(0)} className="lg:col-span-2 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
           
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Iter<span className="text-blue-400">Nation</span>
              </span>
            </div>

            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Your intelligent travel companion — crafting journeys as unique as you are,
              powered by AI that actually understands adventure.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200 text-sm"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-2 pt-6 border-t border-white/8">
              <Newsletter />
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links], ci) => (
            <motion.div key={category} {...stagger(ci + 1)} className="flex flex-col gap-4">
              <p className="text-xs tracking-widest uppercase text-white/35 font-semibold">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/55 hover:text-white transition-colors duration-150 hover:translate-x-0.5 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom bar */}
        <motion.div {...stagger(5)}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/28"
        >
          <p>© 2026 InterNation. All rights reserved.</p>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI systems operational</span>
          </div>

          <p className="text-center sm:text-right">
            Made with 🤍 for curious travellers worldwide
          </p>
        </motion.div>
      </div>
    </footer>
  );
}