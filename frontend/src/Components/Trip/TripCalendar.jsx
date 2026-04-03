import { useState } from "react";
import { eachDayOfInterval, format, startOfMonth, endOfMonth, getDay, isSameDay, addMonths, subMonths, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TripCalendar = ({ trip }) => {
  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);
  const [current, setCurrent] = useState(new Date(tripStart));

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const blanks = Array(getDay(monthStart)).fill(null);

  const isTripDay = (d) => isWithinInterval(d, { start: tripStart, end: tripEnd });
  const isStartDay = (d) => isSameDay(d, tripStart);
  const isEndDay = (d) => isSameDay(d, tripEnd);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={() => setCurrent(subMonths(current, 1))}>
          <ChevronLeft size={14} />
        </button>
        <span style={styles.monthLabel}>{format(current, "MMMM yyyy")}</span>
        <button style={styles.navBtn} onClick={() => setCurrent(addMonths(current, 1))}>
          <ChevronRight size={14} />
        </button>
      </div>

      <div style={styles.weekRow}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={styles.weekLabel}>{d}</div>
        ))}
      </div>

      <div style={styles.grid}>
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((d, i) => {
          const trip = isTripDay(d);
          const start = isStartDay(d);
          const end = isEndDay(d);
          return (
            <div key={i} style={{
              ...styles.day,
              ...(trip ? styles.tripDay : {}),
              ...(start ? styles.edgeDay : {}),
              ...(end ? styles.edgeDay : {}),
            }}>
              {format(d, "d")}
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <span style={styles.dot} />
        <span style={styles.legendText}>Trip days</span>
      </div>
    </div>
  );
};

const styles = {
  wrap: { height: "100%", display: "flex", flexDirection: "column", gap: 10 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { fontSize: 13, fontWeight: 700, color: "#e2e8f0", letterSpacing: 0.5 },
  navBtn: { background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: 8, padding: "4px 6px", display: "flex" },
  weekRow: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 },
  weekLabel: { textAlign: "center", fontSize: 9, color: "#475569", fontWeight: 700, letterSpacing: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 },
  day: { textAlign: "center", fontSize: 11, padding: "5px 0", borderRadius: 7, color: "#64748b", fontWeight: 500 },
  tripDay: { background: "rgba(94,234,212,0.18)", color: "#5eead4", fontWeight: 700 },
  edgeDay: { background: "rgba(94,234,212,0.5)", color: "#0f172a", fontWeight: 800 },
  legend: { display: "flex", alignItems: "center", gap: 6, marginTop: "auto" },
  dot: { width: 8, height: 8, borderRadius: 2, background: "rgba(94,234,212,0.4)", display: "inline-block" },
  legendText: { fontSize: 10, color: "#64748b" }
};

export default TripCalendar;