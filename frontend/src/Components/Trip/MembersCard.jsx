import { useState, useEffect } from "react";
import { UserPlus, Users, Loader } from "lucide-react";
import { getMembers, sendInvite } from "./TripAPI";

const STATUS_COLORS = {
  pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  accepted: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  declined: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  invited:  { color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
};

const MembersCard = ({ trip }) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]     = useState("");

  // Fetch real members from server on mount
  useEffect(() => {
    if (!trip?.id) return;
    setFetching(true);
    getMembers(trip.id)
      .then(setMembers)
      .catch(() => setError("Could not load members."))
      .finally(() => setFetching(false));
  }, [trip?.id]);

  const add = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      await sendInvite(trip.id, trimmed);
      // Re-fetch from server so state stays consistent with DB
      const updated = await getMembers(trip.id);
      setMembers(updated);
      setEmail("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send invite. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !loading) add();
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <Users size={13} style={{ color: "#5eead4" }} />
        <span style={styles.label}>MEMBERS</span>
        <span style={styles.count}>{members.length}</span>
      </div>

      <div style={styles.inputRow}>
        <input
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={handleKey}
          placeholder="Enter email to invite..."
          style={{
            ...styles.input,
            borderColor: error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)",
          }}
          disabled={loading || fetching}
        />
        <button onClick={add} style={styles.addBtn} disabled={loading || fetching}>
          {loading
            ? <Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} />
            : <UserPlus size={15} />
          }
        </button>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.list}>
        {fetching && (
          <p style={styles.empty}>Loading members...</p>
        )}
        {!fetching && members.length === 0 && (
          <p style={styles.empty}>No members yet. Invite someone!</p>
        )}
        {!fetching && members.map((m, i) => {
          const sc = STATUS_COLORS[m.status] || STATUS_COLORS.pending;
          return (
            <div key={m.id ?? i} style={styles.member}>
              <div style={styles.avatar}>
                {(m.email || m.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {m.name && <p style={styles.memberName}>{m.name}</p>}
                <p style={styles.memberEmail}>{m.email}</p>
              </div>
              <span style={{ ...styles.statusBadge, color: sc.color, background: sc.bg }}>
                {m.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  wrap:        { height: "100%", display: "flex", flexDirection: "column", gap: 12 },
  header:      { display: "flex", alignItems: "center", gap: 6 },
  label:       { fontSize: 10, letterSpacing: 2, color: "#64748b", fontWeight: 700, flex: 1 },
  count:       { fontSize: 11, background: "rgba(94,234,212,0.15)", color: "#5eead4", borderRadius: 20, padding: "2px 8px", fontWeight: 700 },
  inputRow:    { display: "flex", gap: 8 },
  input: {
    flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid",
    borderRadius: 10, padding: "9px 14px", color: "#f1f5f9", fontSize: 12,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  },
  addBtn: {
    background: "linear-gradient(135deg, #5eead4, #38bdf8)", border: "none",
    borderRadius: 10, padding: "9px 14px", cursor: "pointer", color: "#0f172a",
    display: "flex", alignItems: "center", fontWeight: 700, flexShrink: 0,
  },
  errorText:   { margin: 0, fontSize: 11, color: "#f87171", paddingLeft: 2 },
  list:        { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 },
  empty:       { color: "#334155", fontSize: 12, textAlign: "center", marginTop: 20 },
  member:      { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" },
  avatar: {
    width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #5eead4, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
    fontWeight: 800, color: "#0f172a", flexShrink: 0,
  },
  memberName:  { margin: 0, fontSize: 12, color: "#f1f5f9", fontWeight: 600 },
  memberEmail: { margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  statusBadge: { fontSize: 9, fontWeight: 700, letterSpacing: 1, borderRadius: 20, padding: "3px 8px", textTransform: "uppercase", flexShrink: 0 },
};

export default MembersCard;