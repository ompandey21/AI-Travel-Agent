import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const images = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
];

/* ---------- CARD ---------- */

const Card = ({ src, rotate, xOffset, speed, progress }) => {
  const y = useTransform(progress, [0, 1], [-200 * speed, 800 * speed]);

  return (
    <motion.img
      src={src}
      style={{
        y,
        rotate,
        x: xOffset,
      }}
      className="absolute w-40 md:w-52 lg:w-60 rounded-2xl shadow-2xl border border-[#3D9A9B]/25"
    />
  );
};

/* ---------- CTA ---------- */

export default function CTA() {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={ref}
      className="relative h-[170vh] bg-gradient-to-b from-[#020617] to-[#020617] overflow-hidden flex items-center justify-center"
    >
      {/* FALLING CARDS */}
      <div className="absolute inset-0 pointer-events-none">

        <Card src={images[0]} rotate={-18} xOffset="-35vw" speed={1} progress={scrollYProgress}/>
        <Card src={images[1]} rotate={-8}  xOffset="-15vw" speed={0.8} progress={scrollYProgress}/>
        <Card src={images[2]} rotate={6}   xOffset="0vw"   speed={1.2} progress={scrollYProgress}/>
        <Card src={images[3]} rotate={12}  xOffset="20vw"  speed={0.9} progress={scrollYProgress}/>
        <Card src={images[4]} rotate={18}  xOffset="40vw"  speed={1.1} progress={scrollYProgress}/>

      </div>

      {/* CTA CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-2xl">

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          Plan Smarter. Travel Better.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.9 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mb-10 text-lg"
        >
          Let intelligent planning handle the details while you focus on the journey.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="px-10 py-4 rounded-full bg-[#3D9A9B] text-white font-semibold shadow-lg"
        >
          Start Planning →
        </motion.button>
      </div>
    </section>
  );
}