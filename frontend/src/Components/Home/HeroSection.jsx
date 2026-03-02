import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {useNavigate} from "react-router-dom";

const destinations = [
  { name: "Santorini",  img: import.meta.env.VITE_HOME_IMG1, tag: "Greece" },
  { name: "Kyoto",      img: import.meta.env.VITE_HOME_IMG3, tag: "Japan" },
  { name: "Patagonia",  img: import.meta.env.VITE_HOME_IMG2, tag: "Argentina" },
  { name: "Amalfi",     img: import.meta.env.VITE_HOME_IMG4, tag: "Italy" },
];

const SideProgress = ({ index, total }) => (
  <div className="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-40">
    <div className="w-[2px] h-44 bg-white/20 relative overflow-hidden rounded-full">
      <motion.div
        className="absolute bottom-0 w-full bg-white rounded-full"
        animate={{ height: `${((index + 1) / total) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
    {destinations.map((_, i) => (
      <motion.div
        key={i}
        animate={{ scale: i === index ? 1.4 : 1, opacity: i === index ? 1 : 0.35 }}
        transition={{ duration: 0.3 }}
        className="w-2 h-2 rounded-full bg-white cursor-pointer"
      />
    ))}
  </div>
);

// ── Carousel cards ─────────────────────────────────────────────────────────

const CARD_W   = 176;
const GAP      = 20;
const SLOTS    = 3;

const cardVariants = {
  enter: { x: CARD_W + GAP, opacity: 0, scale: 0.85, filter: "blur(4px)" },
  center: (slot) => ({
    x: 0,
    opacity: slot === 0 ? 1 : 0.55,
    scale: slot === 0 ? 1 : 0.88,
    y: slot === 0 ? -16 : 0,
    filter: slot === 0 ? "blur(0px)" : "blur(1.5px)",
  }),
  exit: { x: -(CARD_W + GAP) * 1.5, opacity: 0, scale: 0.8, filter: "blur(4px)" },
};

const DestinationCards = ({ index, setIndex }) => {
  const slots = Array.from({ length: SLOTS }, (_, i) =>
    destinations[(index + i) % destinations.length]
  );

  return (
    <div className="absolute right-1/2 translate-x-1/2 md:translate-x-0 md:right-20 bottom-16 md:bottom-24 flex gap-4 md:gap-5 z-40 items-end">
      <AnimatePresence mode="popLayout" initial={false}>
        {slots.map((item, slot) => (
          <motion.div
            key={`${item.name}-${slot}`}
            custom={slot}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => setIndex(destinations.findIndex(d => d.name === item.name))}
            className="w-32 h-44 sm:w-36 sm:h-52 md:w-44 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-2xl relative flex-shrink-0"
            style={{ willChange: "transform, opacity" }}
          >
            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
            {/* overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* active card glow border */}
            {slot === 0 && (
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/50 pointer-events-none" />
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold text-sm md:text-base tracking-wide leading-tight">
                {item.name}
              </p>
              <p className="text-white/60 text-xs mt-0.5">{item.tag}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ── Dot navigation ─────────────────────────────────────────────────────────
const Dots = ({ index, setIndex }) => (
  <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-40">
    {destinations.map((_, i) => (
      <motion.div
        key={i}
        onClick={() => setIndex(i)}
        animate={{ width: i === index ? 24 : 8, opacity: i === index ? 1 : 0.4 }}
        transition={{ duration: 0.35 }}
        className="h-2 rounded-full bg-white cursor-pointer"
      />
    ))}
  </div>
);

// ── Main hero ──────────────────────────────────────────────────────────────
const bgVariants = {
  enter:  { opacity: 0, scale: 1.06 },
  center: { opacity: 1,  scale: 1    },
  exit:   { opacity: 0,  scale: 0.98 },
};

export default function HeroSection() {
  const [index, setIndex]   = useState(0);
  const [dir, setDir]       = useState(1);
  const timerRef            = useRef(null);

  const go = (next) => {
    setDir(next > index ? 1 : -1);
    setIndex(next);
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(autoAdvance, 5000);
  };

  const autoAdvance = () =>
    setIndex(prev => (prev + 1) % destinations.length);

  useEffect(() => {
    timerRef.current = setInterval(autoAdvance, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) go((index + 1) % destinations.length);
    if (info.offset.x >  60) go((index - 1 + destinations.length) % destinations.length);
  };
  const navigate = useNavigate();

  const dest = destinations[index];

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.08}
      onDragEnd={handleDragEnd}
      className="relative w-full h-screen overflow-hidden text-white touch-pan-y select-none"
    >
      {/* ── Background ── */}
      <AnimatePresence mode="sync">
        <motion.img
          key={index}
          src={dest.img}
          alt={dest.name}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "transform, opacity" }}
        />
      </AnimatePresence>

      {/* ── Gradients ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* ── Ambient glow accent ── */}
      <motion.div
        key={index + "-glow"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }}
      />

      {/* ── Side progress ── */}
      <SideProgress index={index} total={destinations.length} />

      {/* ── Text block ── */}
      <div className="absolute px-6 md:px-0 left-1/2 md:left-32 -translate-x-1/2 md:translate-x-0 top-[52%] md:top-1/2 -translate-y-1/2 z-40 text-center md:text-left max-w-lg">

        {/* Tag pill */}
        <AnimatePresence mode="wait">
          <motion.span
            key={dest.tag}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="inline-block mb-3 md:mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/10 backdrop-blur-sm border border-white/20 text-white/80"
          >
            ✦ {dest.tag}
          </motion.span>
        </AnimatePresence>

        {/* Destination name */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={dest.name}
            initial={{ opacity: 0, y: 55, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30,  filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 md:mb-5 leading-none"
            style={{ fontFamily: "'Georgia', serif", textShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
          >
            {dest.name}
          </motion.h1>
        </AnimatePresence>

        {/* Description */}
        <motion.p
          key={index + "-desc"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.75, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm md:text-base text-white/75 mb-7 leading-relaxed mx-auto md:mx-0"
        >
          AI-curated journeys tailored to you — hidden gems, local secrets,
          and unforgettable moments await.
        </motion.p>

        {/* CTA row */}
        <div className="flex items-center gap-4 justify-center md:justify-start">
          <button onClick={() => navigate('/auth')} className="cursor-pointer px-7 py-3 bg-blue-500 hover:bg-blue-400 active:scale-95 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-900/30">
            Plan my trip →
          </button>
          <button className="text-sm text-white/60 hover:text-white transition underline underline-offset-4">
            Explore all
          </button>
        </div>
      </div>

      {/* ── Cards ── */}
      <DestinationCards index={index} setIndex={go} />

      {/* ── Dots ── */}
      <Dots index={index} setIndex={go} />
    </motion.div>
  );
}
