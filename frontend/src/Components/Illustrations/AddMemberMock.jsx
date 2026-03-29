import { useState, useEffect } from "react";

const members = [
  { name: "Priya Sharma", role: "Designer", avatar: "PS", color: "#f97316", bg: "#fff7ed" },
  { name: "Leon Müller", role: "Engineer", avatar: "LM", color: "#0ea5e9", bg: "#f0f9ff" },
  { name: "Aiko Tanaka", role: "Product", avatar: "AT", color: "#8b5cf6", bg: "#f5f3ff" },
];

const roles = ["Designer", "Engineer", "Product", "Marketing", "Operations", "Research"];

const Blob = ({ style }) => (
  <div style={{
    position: "absolute",
    borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
    ...style,
    pointerEvents: "none",
  }} />
);

const Avatar = ({ initials, color, bg, size = 40, animate = false }) => (
  <div style={{
    width: size, height: size,
    borderRadius: "50%",
    background: bg,
    border: `2px solid ${color}33`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Fraunces', serif",
    fontWeight: 700,
    fontSize: size * 0.32,
    color,
    flexShrink: 0,
    animation: animate ? "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
    boxShadow: `0 2px 12px ${color}22`,
  }}>
    {initials}
  </div>
);

const Tag = ({ label, color }) => (
  <span style={{
    background: color + "15",
    color,
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.5,
    padding: "3px 9px",
    borderRadius: 99,
    border: `1px solid ${color}30`,
  }}>{label}</span>
);

export default function AddMemberMock() {
  const [inputVal, setInputVal] = useState("");
  const [selectedRole, setSelectedRole] = useState("Designer");
  const [team, setTeam] = useState(members);
  const [phase, setPhase] = useState("idle"); // idle | sending | done
  const [newEntry, setNewEntry] = useState(null);
  const [focused, setFocused] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const colors = ["#e11d48", "#0d9488", "#d97706", "#6366f1", "#ec4899", "#10b981"];
  const getColor = (name) => colors[name.charCodeAt(0) % colors.length];
  const getBg = (color) => color + "12";
  const getInitials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleAdd = () => {
    if (!inputVal.trim() || phase !== "idle") return;
    setPhase("sending");
    setTimeout(() => {
      const color = getColor(inputVal.trim());
      const entry = { name: inputVal.trim(), role: selectedRole, avatar: getInitials(inputVal.trim()), color, bg: getBg(color) };
      setNewEntry(entry);
      setTeam(prev => [...prev, entry]);
      setInputVal("");
      setPhase("done");
      setTimeout(() => { setPhase("idle"); setNewEntry(null); }, 2200);
    }, 1300);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@400;500&display=swap');
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(12px,-18px) scale(1.04); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes tagSlide {
          from { opacity:0; transform: translateX(-8px); }
          to { opacity:1; transform: translateX(0); }
        }
        .role-chip:hover { opacity: 0.85; transform: translateY(-1px); }
        .add-btn:hover { transform: scale(1.04); box-shadow: 0 8px 32px #f9731644; }
        .add-btn:active { transform: scale(0.97); }
        .member-row { animation: slideUp 0.4s ease both; }
        .member-row:hover { background: #faf9f7; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#fdfcf9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', monospace",
        position: "relative",
        overflow: "hidden",
        padding: 24,
      }}>
        {/* Background blobs */}
        <Blob style={{ width: 420, height: 380, background: "#fde68a33", top: -80, right: -100, animation: "blobFloat 9s ease-in-out infinite" }} />
        <Blob style={{ width: 300, height: 340, background: "#fbcfe822", bottom: -60, left: -80, animation: "blobFloat 11s ease-in-out 2s infinite" }} />
        <Blob style={{ width: 200, height: 200, background: "#bfdbfe22", top: "40%", right: "8%", animation: "blobFloat 7s ease-in-out 1s infinite" }} />

        {/* Dot pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3, pointerEvents: "none" }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#d1c5b0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: 28,
          padding: "36px 36px 28px",
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 2,
          boxShadow: "0 4px 6px #0000000a, 0 24px 80px #00000010, 0 0 0 1px #f0ebe3",
          animation: "slideUp 0.5s ease both",
        }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: "linear-gradient(135deg, #fed7aa, #fb923c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "wiggle 3s ease-in-out infinite",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#fff"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 900, color: "#1c1917", margin: 0, lineHeight: 1 }}>
                  Add to Team
                </h1>
                <p style={{ color: "#a8a29e", fontSize: 10, letterSpacing: 1, margin: "4px 0 0", textTransform: "uppercase" }}>
                  Workspace · {team.length} members
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#a8a29e", marginBottom: 8, textTransform: "uppercase" }}>
              Full Name
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: focused ? "#fffbf5" : "#fafaf9",
              border: `1.5px solid ${focused ? "#f97316" : "#e7e2db"}`,
              borderRadius: 14, padding: "10px 14px",
              transition: "all 0.2s ease",
              boxShadow: focused ? "0 0 0 3px #f9731620" : "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="4" stroke="#d4c8ba" strokeWidth="1.8"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#d4c8ba" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Jamie Rivera"
                style={{
                  flex: 1, border: "none", background: "transparent", outline: "none",
                  fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#1c1917",
                  "::placeholder": { color: "#c4b9ad" },
                }}
              />
            </div>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: "#a8a29e", marginBottom: 8, textTransform: "uppercase" }}>
              Role
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {roles.map((r, i) => (
                <button
                  key={r}
                  className="role-chip"
                  onClick={() => setSelectedRole(r)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11, padding: "5px 12px",
                    borderRadius: 99, cursor: "pointer",
                    border: selectedRole === r ? "1.5px solid #f97316" : "1.5px solid #e7e2db",
                    background: selectedRole === r ? "#fff7ed" : "#fafaf9",
                    color: selectedRole === r ? "#ea580c" : "#78716c",
                    fontWeight: selectedRole === r ? 500 : 400,
                    transition: "all 0.18s ease",
                    animation: `tagSlide 0.3s ease ${i * 0.05}s both`,
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Add button */}
          <button
            className="add-btn"
            onClick={handleAdd}
            disabled={!inputVal.trim() || phase !== "idle"}
            style={{
              width: "100%", padding: "13px",
              borderRadius: 14, border: "none", cursor: inputVal.trim() && phase === "idle" ? "pointer" : "not-allowed",
              background: inputVal.trim() && phase === "idle"
                ? "linear-gradient(135deg, #f97316, #ea580c)"
                : "#f5f0eb",
              color: inputVal.trim() && phase === "idle" ? "#fff" : "#c4b9ad",
              fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 14,
              letterSpacing: 0.5,
              transition: "all 0.22s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {phase === "idle" && (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Invite Member
              </>
            )}
            {phase === "sending" && (
              <>
                <div style={{ width: 15, height: 15, border: "2px solid #fff5", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Sending invite…
              </>
            )}
            {phase === "done" && (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset="0" style={{ animation: "checkDraw 0.4s ease both" }} />
                </svg>
                Member added!
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#f0ebe3" }} />
            <span style={{ color: "#c4b9ad", fontSize: 10, letterSpacing: 2 }}>TEAM</span>
            <div style={{ flex: 1, height: 1, background: "#f0ebe3" }} />
          </div>

          {/* Team list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {team.map((m, i) => (
              <div
                key={m.name + i}
                className="member-row"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 12,
                  transition: "background 0.15s",
                  animationDelay: `${i * 0.07}s`,
                }}>
                <Avatar initials={m.avatar} color={m.color} bg={m.bg} size={36} animate={m === newEntry} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: "#1c1917", lineHeight: 1.2 }}>
                    {m.name}
                  </div>
                </div>
                <Tag label={m.role} color={m.color} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 20, paddingTop: 16,
            borderTop: "1px solid #f0ebe3",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ color: "#c4b9ad", fontSize: 10, letterSpacing: 1 }}>
              Invites expire in 7 days
            </span>
            <span style={{ color: "#f97316", fontSize: 10, letterSpacing: 1, cursor: "pointer" }}>
              Manage →
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
