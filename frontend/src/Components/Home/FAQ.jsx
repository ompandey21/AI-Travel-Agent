import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { faqs } from './HomeData'



function FAQItem({ faq, index, isInView }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.09 }}
    >
      <motion.div
        animate={{
          background: open
            ? "rgba(61,154,155,0.06)"
            : "rgba(255,255,255,0.025)",
          boxShadow: open
            ? "0 8px 40px rgba(61,154,155,0.07), inset 0 0 0 1px rgba(61,154,155,0.18)"
            : "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden mb-3"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* Question row */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-7 py-6 text-left group"
        >
          <span
            className="text-base md:text-lg font-medium pr-6 transition-colors duration-300 leading-snug"
            style={{
              fontFamily: "'Sora', sans-serif",
              letterSpacing: "-0.01em",
              color: open ? "#ffffff" : "rgba(255,255,255,0.72)",
            }}
          >
            {faq.q}
          </span>

          {/* Icon */}
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: open ? "rgba(61,154,155,0.22)" : "rgba(255,255,255,0.06)",
              border: open ? "1px solid rgba(61,154,155,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: open ? "#3D9A9B" : "rgba(255,255,255,0.45)",
              transition: "background 0.35s ease, border 0.35s ease, color 0.35s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-7 pb-7">
                {/* Thin accent rule */}
                <div className="mb-5 h-px" style={{ background: "linear-gradient(90deg, rgba(61,154,155,0.4), transparent)" }} />
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    maxWidth: "640px",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function FAQSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const listRef = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const listInView = useInView(listRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: "linear-gradient(180deg, #020617 0%, #0a1425 50%, #0f172a 100%)" }}
    >
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Central radial glow behind heading */}
      <div
        className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 w-[600px] h-64 -z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(61,154,155,0.15) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Top fade-in from previous section */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(180deg, #020617 0%, transparent 100%)" }}
      />

      <div className="relative mx-auto max-w-3xl px-6">

        {/* Heading block */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 28 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8" style={{ background: "rgba(61,154,155,0.6)" }} />
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase"
              style={{ color: "#3D9A9B", fontFamily: "'DM Sans', sans-serif" }}
            >
              Support
            </span>
            <div className="h-px w-8" style={{ background: "rgba(61,154,155,0.6)" }} />
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white mb-5"
            style={{
              fontFamily: "'Sora', sans-serif",
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
            }}
          >
            Frequently Asked
            <br />
            <span style={{ color: "#3D9A9B" }}>Questions</span>
          </h2>

          <p
            className="text-base md:text-lg"
            style={{
              color: "rgba(255,255,255,0.38)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            Everything you need to know about how Iternation works.
          </p>

          {/* Animated accent line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headingInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ transformOrigin: "center" }}
            className="mt-10 mx-auto h-px max-w-xs"
          >
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(61,154,155,0.5), transparent)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* FAQ list */}
        <div ref={listRef}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} isInView={listInView} />
          ))}
        </div>

        {/* Bottom CTA nudge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={listInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
          className="mt-14 text-center"
        >
          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Still have questions?{" "}
            <a
              href="#contact"
              className="transition-colors duration-200"
              style={{ color: "rgba(61,154,155,0.8)" }}
              onMouseEnter={e => (e.target.style.color = "#3D9A9B")}
              onMouseLeave={e => (e.target.style.color = "rgba(61,154,155,0.8)")}
            >
              Talk to our team →
            </a>
          </p>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(0deg, #0f172a 0%, transparent 100%)" }}
      />
    </section>
  );
}