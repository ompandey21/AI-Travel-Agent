import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const CountdownCard = ({ trip }) => {
  const [status, setStatus] = useState({ type: "counting", d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);

      if (now > end) { setStatus({ type: "done" }); return; }
      if (now >= start) { setStatus({ type: "ongoing" }); return; }

      const diff = start - now;
      setStatus({
        type: "counting",
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [trip]);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <Timer size={13} style={{ color: "#5eead4" }} />
        <span style={styles.label}>TRIP STARTS IN</span>
      </div>

      {status.type === "done" && <p style={styles.badge}>✓ COMPLETED</p>}
      {status.type === "ongoing" && <p style={{ ...styles.badge, color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}>● ONGOING</p>}

      {status.type === "counting" && (
        <div style={styles.timerGrid}>
          <Unit value={status.d} label="DAYS" />
          <Sep />
          <Unit value={status.h} label="HRS" />
          <Sep />
          <Unit value={status.m} label="MIN" />
          <Sep />
          <Unit value={status.s} label="SEC" />
        </div>
      )}
    </div>
  );
};

const Unit = ({ value, label }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 34, fontWeight: 800, color: "#5eead4", lineHeight: 1, fontVariantNumeric: "tabular-nums", fontFamily: "'Playfair Display', serif" }}>
      {String(value).padStart(2, "0")}
    </div>
    <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, marginTop: 4 }}>{label}</div>
  </div>
);

const Sep = () => <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(94,234,212,0.3)", alignSelf: "flex-start", paddingTop: 4 }}>:</div>;

const styles = {
  wrap: { height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 },
  header: { display: "flex", alignItems: "center", gap: 6 },
  label: { fontSize: 10, letterSpacing: 2, color: "#64748b", fontWeight: 700 },
  timerGrid: { display: "flex", alignItems: "center", gap: 10 },
  badge: { fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 20, padding: "6px 14px", width: "fit-content" }
};

export default CountdownCard;