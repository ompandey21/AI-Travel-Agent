import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Map } from "lucide-react";
import { checkItineraryExists } from "./TripAPI";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const glowIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px ${color},0 0 20px ${color}60"></div>`,
  iconAnchor: [7, 7],
});

const FitBounds = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) map.fitBounds([start, end], { padding: [40, 40] });
  }, [start, end]);
  return null;
};

const TripMap = ({ trip }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [hasItinerary, setHasItinerary] = useState(null);

  useEffect(() => {
    if (!trip?.id) return;
    checkItineraryExists(trip.id)
      .then(setHasItinerary)
      .catch(() => setHasItinerary(false)); // on unexpected error, default to create
  }, [trip?.id]);

  const start = trip.startLat && trip.startLng ? [trip.startLat, trip.startLng] : null;
  const end   = trip.endLat   && trip.endLng   ? [trip.endLat,   trip.endLng]   : null;

  const handleOverlayClick = () => {
    if (hasItinerary === null) return; // still loading, do nothing
    const base = `/trip/${trip.id}`;
    navigate(`${base}/itinerary`);
  };

  if (!start || !end) {
    return (
      <div style={{ ...styles.mapWrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#475569", fontSize: 13 }}>Map data unavailable</p>
      </div>
    );
  }

  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;

  const overlaySubtext = hasItinerary === null
    ? "Checking..."
    : hasItinerary
      ? "Open existing plan"
      : "Start planning";

  return (
    <div style={styles.wrap}>
      <div style={styles.badge}>ROUTE MAP</div>

      <div
        style={styles.mapWrap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <MapContainer
          center={[midLat, midLng]}
          zoom={5}
          style={styles.map}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <FitBounds start={start} end={end} />
          <Marker position={start} icon={glowIcon("#5eead4")} />
          <Marker position={end}   icon={glowIcon("#f472b6")} />
          <Polyline
            positions={[start, end]}
            pathOptions={{ dashArray: "8 10", color: "#5eead4", weight: 2, opacity: 0.8 }}
          />
        </MapContainer>

        <div
          onClick={handleOverlayClick}
          style={{
            ...styles.overlay,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            cursor: hasItinerary === null ? "default" : "pointer",
          }}
        >
          <div style={styles.overlayInner}>
            <Map size={22} style={{ color: "#5eead4" }} />
            <span style={styles.overlayText}>View Itinerary</span>
            <span style={styles.overlaySubtext}>{overlaySubtext}</span>
          </div>
        </div>
      </div>

      <div style={styles.routeRow}>
        <div style={styles.routePoint}>
          <span style={{ ...styles.routeDot, background: "#5eead4", boxShadow: "0 0 8px #5eead4" }} />
          <span style={styles.routeName}>{trip.startLocation}</span>
        </div>
        <div style={styles.dashes}>- - - - -</div>
        <div style={styles.routePoint}>
          <span style={{ ...styles.routeDot, background: "#f472b6", boxShadow: "0 0 8px #f472b6" }} />
          <span style={styles.routeName}>{trip.destination}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:  { height: "100%", display: "flex", flexDirection: "column", gap: 10 },
  badge: {
    fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#5eead4",
    border: "1px solid rgba(94,234,212,0.3)", borderRadius: 20,
    padding: "3px 10px", width: "fit-content",
  },
  mapWrap: {
    position: "relative", borderRadius: 14, overflow: "hidden",
    flex: 1, minHeight: 220, border: "1px solid rgba(255,255,255,0.08)",
  },
  map: { height: "100%", width: "100%", minHeight: 220 },
  overlay: {
    position: "absolute", inset: 0, zIndex: 1000,
    background: "rgba(2, 6, 23, 0.72)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.25s ease",
    borderRadius: 14,
  },
  overlayInner: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  },
  overlayText: {
    fontSize: 18, fontWeight: 800, color: "#f8fafc",
    letterSpacing: 1, fontFamily: "'Playfair Display', serif",
  },
  overlaySubtext: {
    fontSize: 11, color: "#5eead4", letterSpacing: 2,
    fontWeight: 600, textTransform: "uppercase",
  },
  routeRow:   { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  routePoint: { display: "flex", alignItems: "center", gap: 7 },
  routeDot:   { width: 10, height: 10, borderRadius: "50%", display: "inline-block", flexShrink: 0 },
  routeName:  { fontSize: 12, fontWeight: 700, color: "#e2e8f0" },
  dashes:     { color: "rgba(255,255,255,0.15)", fontSize: 12, flex: 1, textAlign: "center", letterSpacing: 3 },
};

export default TripMap;