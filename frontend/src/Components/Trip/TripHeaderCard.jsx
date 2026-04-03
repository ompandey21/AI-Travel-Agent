import { MapPin, DollarSign, Calendar, User } from "lucide-react";
import { getUserById } from './TripAPI';
import { useEffect } from "react";
import { useState } from "react";

const TripHeaderCard = ({ trip }) => {
  const [createdBy, setCreatedBy] = useState("");
  useEffect(() => {
    getUserById(trip.created_by).then((e) => {setCreatedBy(e.name)}).catch((error) => console.log(error));
  }, []);
  return (
    <div style={styles.wrap}>
      <div style={styles.badge}>TRIP DETAILS</div>
      <h1 style={styles.title}>{trip.name}</h1>
      <p style={styles.destination}>
        <MapPin size={13} style={{ marginRight: 5, color: "#5eead4" }} />
        {trip.startLocation} → {trip.destination}
      </p>
      <div style={styles.grid}>
        <Stat icon={<DollarSign size={14} />} label="Budget" value={`₹${Number(trip.budget).toLocaleString("en-IN")}`} />
        <Stat icon={<Calendar size={14} />} label="Total Days" value={`${trip.totalDays ?? calcDays(trip.startDate, trip.endDate)} days`} />
        <Stat icon={<User size={14} />} label="Created By" value={createdBy ?? "—"} />
      </div>
    </div>
  );
};

const calcDays = (s, e) => {
  const diff = new Date(e) - new Date(s);
  return Math.max(1, Math.round(diff / 86400000) + 1);
};

const Stat = ({ icon, label, value }) => (
  <div style={styles.stat}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  </div>
);

const styles = {
  wrap: { height: "100%", display: "flex", flexDirection: "column", gap: 10 },
  badge: {
    display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 2,
    color: "#5eead4", border: "1px solid rgba(94,234,212,0.3)", borderRadius: 20,
    padding: "3px 10px", width: "fit-content"
  },
  title: { fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: 0, lineHeight: 1.2, fontFamily: "'Playfair Display', serif" },
  destination: { display: "flex", alignItems: "center", color: "#94a3b8", fontSize: 13, margin: 0 },
  grid: { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 },
  stat: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" },
  statIcon: { color: "#5eead4", display: "flex" },
  statLabel: { margin: 0, fontSize: 10, color: "#64748b", letterSpacing: 1, textTransform: "uppercase" },
  statValue: { margin: 0, fontSize: 14, fontWeight: 700, color: "#f1f5f9" }
};

export default TripHeaderCard;