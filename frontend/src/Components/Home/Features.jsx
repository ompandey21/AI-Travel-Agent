import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { DashboardMockup } from "../Illustrations/DashboardMock";
import { features } from "./HomeData";





// Animated dashboard mockup SVG


export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mockupRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const mockupInView = useInView(mockupRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const mockupY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      ref={sectionRef}
      style={{ background: "linear-gradient(180deg, teal 0%, #020617 60%, #0a1628 100%)" }}
      className="relative overflow-hidden py-28 md:py-36"
    >
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow — top left */}
      <div
        className="pointer-events-none absolute -left-40 top-0 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(61,154,155,0.13) 0%, transparent 70%)" }}
      />
      {/* Ambient glow — bottom right */}
      <div
        className="pointer-events-none absolute -right-32 bottom-10 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(61,154,155,0.09) 0%, transparent 70%)" }}
      />

      {/* Thin horizontal accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ transformOrigin: "left center" }}
        className="absolute left-0 top-0 h-px w-full"
      >
        <div className="h-full w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(61,154,155,0.35), transparent)" }} />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">

        {/* Section heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 md:mb-28 max-w-xl"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ background: "#3D9A9B" }} />
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase"
              style={{ color: "#3D9A9B", fontFamily: "'DM Sans', sans-serif" }}
            >
              Platform Features
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
          >
            Why Choose<br />
            <span style={{ color: "#3D9A9B" }}>Iternation</span>
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Intelligent travel planning designed for modern explorers.
          </p>
        </motion.div>

        {/* Main layout — staggered asymmetric split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">

          {/* LEFT — Features */}
          <div className="lg:col-span-7 space-y-0">
            {features.map((feat, i) => (
              <FeatureRow key={feat.number} feat={feat} index={i} isInView={isInView} />
            ))}
          </div>

          {/* RIGHT — Dashboard mockup */}
          <motion.div
            ref={mockupRef}
            initial={{ opacity: 0, x: 40 }}
            animate={mockupInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ y: mockupY }}
            className="lg:col-span-5 relative lg:sticky lg:top-28"
          >
            {/* Glow behind mockup */}
            <div
              className="absolute inset-0 -z-10 blur-3xl"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(61,154,155,0.18) 0%, transparent 70%)", transform: "scale(1.1)" }}
            />
            {/* Glass panel behind */}
            <div
              className="absolute -inset-3 rounded-3xl -z-10"
              style={{
                background: "linear-gradient(135deg, rgba(61,154,155,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(61,154,155,0.1)",
                backdropFilter: "blur(4px)",
              }}
            />
            <DashboardMockup />

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={mockupInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
              className="absolute -bottom-5 -left-5 px-5 py-3 rounded-2xl"
              style={{
                background: "rgba(10,22,40,0.92)",
                border: "1px solid rgba(61,154,155,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3D9A9B", boxShadow: "0 0 6px #3D9A9B" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
                  AI planning active
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={mockupInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
              className="absolute -top-5 -right-5 px-5 py-3 rounded-2xl"
              style={{
                background: "rgba(10,22,40,0.92)",
                border: "1px solid rgba(61,154,155,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="text-center">
                <div className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>94%</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Trip satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(0deg, #020617 0%, transparent 100%)" }}
      />
    </section>
  );
}

function FeatureRow({ feat, index, isInView }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.12 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex gap-6 py-8 cursor-default"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          transformOrigin: "left center",
          position: "absolute",
          left: 0, top: 0, bottom: 0, width: "2px",
          background: "#3D9A9B",
          borderRadius: "0 2px 2px 0",
        }}
      />

      {/* Number */}
      <div
        className="flex-shrink-0 w-8 pt-1"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "rgba(61,154,155,0.45)",
        }}
      >
        {feat.number}
      </div>

      <motion.div
        animate={{ scale: hovered ? 1.15 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
        style={{
          background: hovered ? "rgba(61,154,155,0.18)" : "rgba(61,154,155,0.08)",
          border: "1px solid rgba(61,154,155,0.2)",
          color: "#3D9A9B",
          transition: "background 0.35s ease",
        }}
      >
        <Icon />
      </motion.div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-white text-lg font-semibold mb-2 transition-colors duration-300"
          style={{
            fontFamily: "'Sora', sans-serif",
            letterSpacing: "-0.01em",
            color: hovered ? "#ffffff" : "rgba(255,255,255,0.85)",
          }}
        >
          {feat.title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.38)",
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: "460px",
          }}
        >
          {feat.description}
        </p>
      </div>

      {/* Arrow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-shrink-0 self-center"
        style={{ color: "#3D9A9B" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}