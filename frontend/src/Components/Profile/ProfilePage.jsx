import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, ArrowUpRight,
  ChevronLeft, ChevronRight, Plane,
  Clock, Wallet, Globe, CheckCheck, Plus,
} from "lucide-react";
import video from "../../media/profile_bg.mp4";
import TripCard from "./TripCard";
import Header from "./Header";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PER_PAGE = 5;

/* ── responsive hook ── */
const useBreakpoint = () => {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 480, isTablet: w >= 480 && w < 768, isDesktop: w >= 768 };
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

/* ── TRIP CARD ── */


/* ── STAT ITEM ── */
const StatItem = ({ icon: Icon, label, value, note, accent, compact }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <Icon size={12} color={accent} strokeWidth={2.5} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif" }}>
        {label}
      </span>
    </div>
    <p style={{
      fontFamily: "'Cabinet Grotesk', sans-serif",
      fontSize: compact ? 24 : 36,
      fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.04em", lineHeight: 1,
    }}>
      {value}
    </p>
    {note && (
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 5, fontFamily: "'Satoshi', sans-serif" }}>
        {note}
      </span>
    )}
  </div>
);

const Divider = () => (
  <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
);

const NavBtn = ({ children, onClick, disabled }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.08 } : {}}
    whileTap={!disabled ? { scale: 0.93 } : {}}
    onClick={onClick} disabled={disabled}
    style={{
      width: 34, height: 34, borderRadius: 9,
      border: "1px solid rgba(255,255,255,0.09)",
      background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.07)",
      color: disabled ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: disabled ? "default" : "pointer",
    }}
  >
    {children}
  </motion.button>
);

/* ── PAGE ── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [user, setUser]   = useState(null);
  const [trips, setTrips] = useState([]);
  const [page, setPage]   = useState(1);

  useEffect(() => { fetchUser(); fetchTrips(); }, []);

  const fetchUser = async () => {
    try {
      const r = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
      setUser(r.data);
    } catch (e) { console.log(e); }
  };
  const getStatus = (s, e) => {
  const now = Date.now(), st = +new Date(s), en = +new Date(e);
  if (now < st) return "upcoming";
  if (now > en) return "completed";
  return "ongoing";
};

  const fetchTrips = async () => {
    try {
      const r = await axios.get(`${API_BASE}/api/read-trips/my-trips`, { withCredentials: true });
      setTrips(r.data.data);
      
    } catch (e) { console.log(e); }
  };

  const completed  = trips.filter(t => getStatus(t.startDate, t.endDate) === "completed");
  const upcoming   = trips.filter(t => getStatus(t.startDate, t.endDate) === "upcoming");
  const ongoing    = trips.filter(t => getStatus(t.startDate, t.endDate) === "ongoing");
  const totalSpent = completed.reduce((a, t) => a + (t.budget || 0), 0);
  const daysTravd  = completed.reduce((a, t) => a + daysBetween(t.startDate, t.endDate), 0);
  const spentFmt   = totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}k` : `${totalSpent}`;

  const totalPages = Math.ceil(trips.length / PER_PAGE);
  const paginated  = trips.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Satoshi', sans-serif" }}>
        <Header/>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700&f[]=satoshi@400,500,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
      `}</style>

      {/* VIDEO */}
      <video autoPlay loop muted playsInline style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0,
      }}>
        <source src={video} type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "linear-gradient(160deg, rgba(4,8,22,0.55) 0%, rgba(4,8,22,0.75) 50%, rgba(4,8,22,0.96) 100%)",
      }} />

      {/* CONTENT */}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 900, margin: "0 auto",
        padding: isMobile ? "72px 16px 80px" : isTablet ? "80px 24px 80px" : "88px 32px 90px",
      }}>

        {/* ── HEADER + NEW TRIP BUTTON ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginBottom: isMobile ? 24 : 48,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 18 : 16,
          }}
        >
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#5eead4", marginBottom: 10,
            }}>
              {greeting}
            </p>
            <h1 style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: isMobile ? "1.9rem" : isTablet ? "2.6rem" : "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 800, lineHeight: 1.0,
              letterSpacing: "-0.03em", color: "#fff",
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}>
              Hello, {user?.name || "Traveler"}!
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.42)", marginTop: 10,
              fontSize: isMobile ? 14 : 15, fontWeight: 500,
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            }}>
              Let's travel around the world again
            </p>
          </div>

          {/* NEW TRIP BUTTON */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(94,234,212,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/createTrip")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg, #3D9A9B 0%, #5eead4 100%)",
              color: "#04161a",
              fontSize: 13.5, fontWeight: 800,
              padding: "12px 22px",
              borderRadius: 14,
              border: "none", cursor: "pointer",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              letterSpacing: "-0.01em",
              boxShadow: "0 4px 20px rgba(94,234,212,0.3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "box-shadow 0.2s",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Plus size={16} strokeWidth={3} />
            New Trip
          </motion.button>
        </motion.div>

        {/* ── STATS PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: isMobile ? "18px 16px" : isTablet ? "22px 24px" : "26px 32px",
            background: "rgba(8,14,32,0.55)",
            backdropFilter: "blur(32px) saturate(1.4)",
            WebkitBackdropFilter: "blur(32px) saturate(1.4)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.09)",
            marginBottom: isMobile ? 24 : 48,
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          }}
        >
          {isSmall ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>
              <StatItem icon={Globe}      label="Total Trips"    value={trips.length}      note={`${upcoming.length} upcoming`}    accent="#5eead4"  compact />
              <StatItem icon={CheckCheck} label="Completed"      value={completed.length}  note={ongoing.length ? `${ongoing.length} ongoing` : "None ongoing"} accent="#34d399" compact />
              <StatItem icon={Clock}      label="Days Travelled" value={daysTravd}          note="Finished trips only"              accent="#a78bfa"  compact />
              <StatItem icon={Wallet}     label="Total Spent"    value={spentFmt}           note="Completed only"                  accent="#fb923c"  compact />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center" }}>
              <StatItem icon={Globe}      label="Total Trips"    value={trips.length}      note={`${upcoming.length} upcoming`}    accent="#5eead4" />
              <Divider />
              <StatItem icon={CheckCheck} label="Completed"      value={completed.length}  note={ongoing.length ? `${ongoing.length} ongoing` : "None ongoing"} accent="#34d399" />
              <Divider />
              <StatItem icon={Clock}      label="Days Travelled" value={daysTravd}          note="Finished trips only"              accent="#a78bfa" />
              <Divider />
              <StatItem icon={Wallet}     label="Total Spent"    value={spentFmt}           note="Completed only"                  accent="#fb923c" />
            </div>
          )}
        </motion.div>

        {/* ── TRIPS LIST ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: isMobile ? 17 : 20, fontWeight: 800, letterSpacing: "-0.02em",
              color: "#fff", textShadow: "0 1px 12px rgba(0,0,0,0.4)",
            }}>
              Your Trips
            </h2>
            {totalPages > 1 && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, trips.length)} of {trips.length}
              </span>
            )}
          </div>

          {trips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 0", color: "rgba(255,255,255,0.22)" }}>
              <Plane size={34} style={{ marginBottom: 14 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>No trips yet. Start planning your first adventure.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {paginated.map((trip, i) => (
                  <TripCard key={trip.id || i} trip={trip} index={i} useBreakpoint={useBreakpoint} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 30 }}>
              <NavBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={15} strokeWidth={2.5} />
              </NavBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <motion.button key={p}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
                  onClick={() => setPage(p)}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: p === page ? "#5eead4" : "rgba(255,255,255,0.07)",
                    color: p === page ? "#04161a" : "rgba(255,255,255,0.42)",
                    fontWeight: 800, fontSize: 13, cursor: "pointer",
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    border: p === page ? "none" : "1px solid rgba(255,255,255,0.09)",
                    boxShadow: p === page ? "0 0 16px rgba(94,234,212,0.4)" : "none",
                    transition: "background 0.15s",
                  }}
                >
                  {p}
                </motion.button>
              ))}
              <NavBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={15} strokeWidth={2.5} />
              </NavBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}