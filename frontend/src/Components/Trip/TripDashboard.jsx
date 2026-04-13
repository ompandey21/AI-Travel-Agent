import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { getTripById } from "./TripAPI";
import TripHeaderCard from "./TripHeaderCard";
import CountdownCard from "./CountdownCard";
import TripCalendar from "./TripCalendar";
import TripMap from "./TripMap";
import MembersCard from "./MembersCard";
import Header from "../Profile/Header";


const STAGGER = [0, 0.08, 0.16, 0.24, 0.32];

// ── responsive hook ────────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

// breakpoints
const BP = { sm: 480, md: 768, lg: 1024 };

// ── GlassCard ──────────────────────────────────────────────────────────────────
const GlassCard = ({ children, delay = 0, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{ ...cardStyle, ...style }}
  >
    {children}
  </motion.div>
);

// ── TripDashboard ──────────────────────────────────────────────────────────────
const TripDashboard = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const width = useWindowWidth();

  useEffect(() => {
    getTripById(id).then(setTrip).catch(() => setError("Failed to load trip."));
  }, [id]);

  if (error) return <Screen><p style={{ color: "#f87171", fontSize: 14 }}>{error}</p></Screen>;
  if (!trip)  return <Screen><Spinner /></Screen>;

  // ── layout decisions ─────────────────────────────────────────────────────────
  const isMobile = width < BP.md;      // < 768  → single column
  const isTablet = width < BP.lg;      // < 1024 → two-col bottom, stacked top

  // top row:  mobile → 1 col | tablet → 1 col | desktop → 3 col
  const topGridStyle = {
    display: "grid",
    gap: 16,
    alignItems: "stretch",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
        ? "1fr 1fr"        
        : "1.1fr 1fr 1.2fr",
  };

  // bottom row: mobile → 1 col | tablet+ → map wide, members narrow
  const bottomGridStyle = {
    display: "grid",
    gap: 16,
    alignItems: "stretch",
    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
  };

  // on tablet the header card should span both columns
  const headerCardStyle = isTablet && !isMobile ? { gridColumn: "1 / -1" } : {};

  return (
    <div style={styles.root}>
      <Header />
      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={import.meta.env.VITE_PROFILE_BG} type="video/mp4" />
      </video>
      <div style={styles.overlay} />

      <div style={{
        ...styles.page,
        padding: isMobile ? "12px 12px 24px" : isTablet ? "16px 20px 28px" : "20px 28px 32px",
      }}>
        {/* ── top grid ── */}
        <div style={topGridStyle}>
          <GlassCard delay={STAGGER[0]} style={headerCardStyle}>
            <TripHeaderCard trip={trip} />
          </GlassCard>
          <GlassCard delay={STAGGER[1]}>
            <CountdownCard trip={trip} />
          </GlassCard>
          <GlassCard delay={STAGGER[2]}>
            <TripCalendar trip={trip} />
          </GlassCard>
        </div>

        {/* ── bottom grid ── */}
        <div style={bottomGridStyle}>
          <GlassCard delay={STAGGER[3]}>
            <TripMap trip={trip} />
          </GlassCard>
          <GlassCard delay={STAGGER[4]}>
            <MembersCard trip={trip} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ── helpers ────────────────────────────────────────────────────────────────────
const Screen = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
    {children}
  </div>
);

const Spinner = () => (
  <div style={{ width: 36, height: 36, border: "3px solid rgba(94,234,212,0.2)", borderTop: "3px solid #5eead4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
);

// ── shared card style ──────────────────────────────────────────────────────────
const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.07)",
  padding: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
  overflow: "hidden",
};

const styles = {
  root: { position: "relative", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  video: { position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 },
  overlay: { position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(2,6,23,0.75) 0%, rgba(15,23,42,0.65) 100%)", zIndex: 1 },
  page: {
    position: "relative",
    zIndex: 2,
    // paddingTop is handled inline above; this gives clearance for a ~64px navbar
    paddingTop: "calc(8vh)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxSizing: "border-box",
  },
};

export default TripDashboard;