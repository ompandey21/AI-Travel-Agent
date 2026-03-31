import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, ArrowUpRight,
  ChevronLeft, ChevronRight, Plane,
  Clock, Wallet, Globe, CheckCheck, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const getStatus = (s, e) => {
  const now = Date.now(), st = +new Date(s), en = +new Date(e);
  if (now < st) return "upcoming";
  if (now > en) return "completed";
  return "ongoing";
};
const daysBetween = (a, b) =>
  Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
    : "—";

const S = {
  completed: { label: "Completed", dot: "#34d399", color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"  },
  ongoing:   { label: "Ongoing",   dot: "#fbbf24", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  upcoming:  { label: "Upcoming",  dot: "#60a5fa", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)"  },
};


const TripCard = ({ trip, index , useBreakpoint}) => {
  const st   = getStatus(trip.startDate, trip.endDate);
  const cfg  = S[st];
  const days = daysBetween(trip.startDate, trip.endDate) || trip.totalDays || 0;
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.36, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      style={{
        position: "relative",
        height: isMobile ? 172 : 152,
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}
    >
      {/* full-bleed image */}
      <img
        src={trip.cover_img}
        alt={trip.name}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "right center",
        }}
      />

      {/* glass layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: isMobile
          ? "rgba(8,14,32,0.82)"
          : "linear-gradient(105deg, rgba(8,14,32,0.9) 0%, rgba(8,14,32,0.82) 46%, rgba(8,14,32,0.0) 70%)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        ...(isMobile ? {} : {
          WebkitMaskImage: "linear-gradient(90deg, black 0%, black 50%, transparent 70%)",
          maskImage: "linear-gradient(90deg, black 0%, black 50%, transparent 70%)",
        }),
      }} />

      {/* content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: isMobile ? "14px 16px" : "16px 20px",
        ...(isMobile ? {} : {
          WebkitMaskImage: "linear-gradient(90deg, black 0%, black 48%, transparent 66%)",
          maskImage: "linear-gradient(90deg, black 0%, black 48%, transparent 66%)",
        }),
      }}>
        {/* top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "#f1f5f9",
              letterSpacing: "-0.02em", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {trip.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <MapPin size={11} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Satoshi', sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {trip.destination}
              </span>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            padding: "4px 10px", borderRadius: 999,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 5px ${cfg.dot}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: "0.05em", fontFamily: "'Satoshi', sans-serif" }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* date */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Calendar size={11} color="rgba(255,255,255,0.28)" strokeWidth={2} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Satoshi', sans-serif" }}>
            {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}
          </span>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: isMobile ? 16 : 24 }}>
            <div>
              <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", margin: "0 0 3px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif" }}>
                Budget
              </p>
              <p style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "#5eead4", margin: 0, fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: "-0.01em" }}>
                {(trip.budget || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", margin: "0 0 3px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif" }}>
                Days
              </p>
              <p style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                {days}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ background: "rgba(94,234,212,0.16)", borderColor: "rgba(94,234,212,0.4)", scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/trip/${trip.id}`)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.85)", fontSize: isMobile ? 11 : 12, fontWeight: 700,
              padding: isMobile ? "6px 12px" : "7px 14px", borderRadius: 10, cursor: "pointer",
              fontFamily: "'Satoshi', sans-serif", letterSpacing: "0.02em",
              transition: "background 0.2s, border-color 0.2s",
              flexShrink: 0,
            }}
          >
            Open <ArrowUpRight size={13} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};


export default TripCard;