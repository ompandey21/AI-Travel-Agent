import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(API_BASE + "/api/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    axios
      .post(API_BASE + "/api/auth/logout", {}, { withCredentials: true })
      .catch(() => {})
      .finally(() => {
        setUser(null);
        navigate("/");
      });
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "";

  return (
    <nav
      style={{
        position: "fixed",          /* fixed — stays on top regardless of scroll */
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,                /* high enough to clear any page content layer */
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 56px",
        fontFamily: "'Satoshi', sans-serif",
      }}
    >
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700&f[]=satoshi@400,500,700&display=swap');`}</style>

      {/* LOGO */}
      <h1
        style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: 18,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
          margin: 0,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Iternation
      </h1>

      {/* NAV LINKS */}
      <div
        style={{
          display: "flex",
          gap: 36,
          fontSize: 13.5,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {[
          { label: "Home", to: "/" },
          { label: "Explore", to: "#" },
          { label: "Destinations", to: "#" },
          { label: "Contact", to: "#" },
        ].map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            style={{
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#fff")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* AUTH AREA */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {!user ? (
          <button
            onClick={() => navigate("/auth")}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "7px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            Login / Sign up
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
              {user.name}
            </span>

            {/* avatar circle */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5eead4, #3D9A9B)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                color: "#04161a",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>

            <button
              onClick={handleLogout}
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.38)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 500,
                padding: 0,
              }}
              onMouseEnter={(e) => (e.target.style.color = "rgba(255,255,255,0.75)")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.38)")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;