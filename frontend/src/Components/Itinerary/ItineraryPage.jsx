import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  MessageCircle,
  Paperclip,
  Receipt,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import travelVideo from "../../media/profile_bg.mp4";
import DailyPlan from "./DailyPlan"; // Eagerly loaded — shown on first render
import { getTripById } from "../Trip/TripAPI";
import { useNavigate, useParams } from "react-router-dom";

// Lazy-loaded tabs — only bundled/fetched when the user navigates to them
const GroupChat = lazy(() => import("./GroupChat"));
const Uploads = lazy(() => import("./Uploads"));
const ExpenseSplitter = lazy(() => import("./ExpenseSplitter"));

const NAV_ITEMS = [
  { id: "daily",   label: "Daily Plan",    icon: CalendarDays },
  { id: "chat",    label: "Chat",          icon: MessageCircle },
  { id: "uploads", label: "Uploads",       icon: Paperclip },
  { id: "expense", label: "Expense Split", icon: Receipt },
];

// Fallback shown while a lazy component is loading
function TabLoader() {
  return (
    <div className="flex items-center justify-center h-64 text-teal-400/60">
      <Loader2 size={28} className="animate-spin" />
    </div>
  );
}

// Resolve the correct component for the active tab
function ActiveTab({ id }) {
  if (id === "daily")   return <DailyPlan />;
  if (id === "chat")    return <GroupChat />;
  if (id === "uploads") return <Uploads />;
  if (id === "expense") return <ExpenseSplitter />;
  return null;
}

export default function ItineraryPage() {
  const [active, setActive]       = useState("daily");
  const [collapsed, setCollapsed] = useState(false);
  const [trip, setTrip]           = useState(null); // null = not yet loaded

  const { tripId } = useParams();
  useEffect(() => {
    if (!tripId) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await getTripById(tripId);
        if (!cancelled) setTrip(data);
      } catch (err) {
        console.error("Failed to load trip:", err);
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [tripId]);
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full flex overflow-hidden font-sans">
      {/* Background video */}
      <video
        autoPlay loop muted playsInline
        style={{
          position: "fixed", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
        }}
      >
        <source src={travelVideo} type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#081c28]/95 via-[#0a2632]/92 to-[#05141e]/97" />

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10 flex flex-col h-screen sticky top-0 shrink-0
                   bg-[#0a2837]/75 backdrop-blur-xl border-r border-teal-400/15 overflow-hidden"
      >
        {/* Logo + collapse button */}
        <div className="px-4 py-7 border-b border-teal-400/10 flex items-center justify-between min-w-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="text-white text-xl font-bold tracking-wide whitespace-nowrap overflow-hidden cursor-pointer"
                onClick={() => navigate('/')}
              >
                Iternation
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setCollapsed((p) => !p)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            className={`shrink-0 w-6 h-6 rounded-full bg-teal-400/15 border border-teal-400/30
                        flex items-center justify-center text-teal-400 hover:bg-teal-400/25
                        transition-colors cursor-pointer ${collapsed ? "mx-auto" : ""}`}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </motion.button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item, i) => {
            const Icon     = item.icon;
            const isActive = active === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                whileHover={{ x: collapsed ? 0 : 3 }}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 py-3 w-full text-left text-sm font-medium
                            transition-colors duration-200 cursor-pointer border-none bg-transparent
                            ${collapsed ? "justify-center px-0" : "px-6"}
                            ${isActive
                              ? "text-teal-400 bg-teal-400/10"
                              : "text-teal-100/50 hover:text-teal-200/80 hover:bg-white/5"
                            }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-teal-400 rounded-r-full"
                  />
                )}
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && isActive && (
                  <ChevronRight size={13} className="text-teal-400/60 shrink-0" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Trip info card — expanded sidebar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="m-4 p-4 rounded-xl bg-teal-400/[0.08] border border-teal-400/20 flex flex-col gap-1"
            >
              <span className="text-teal-400 text-[9px] font-bold tracking-widest uppercase">
                Trip Details
              </span>

              {/* ✅ Guarded: show placeholder until trip data arrives */}
              <span className="text-white text-sm font-bold truncate">
                {trip?.name ?? "Loading…"}
              </span>

              <div className="flex items-center gap-1 text-teal-100/50 text-xs">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">
                  {trip
                    ? `${trip.startLocation ?? trip.start_location ?? "—"} → ${trip.destination ?? "—"}`
                    : "—"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed trip indicator */}
        <AnimatePresence>
          {collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex justify-center"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" title="Trip ongoing" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="min-h-[calc(100vh-4rem)] rounded-2xl border border-teal-400/15
                     bg-[#0a2634]/72 backdrop-blur-2xl overflow-hidden"
        >
          {/* Suspense wraps ALL tabs; DailyPlan is eager so it never triggers the fallback */}
          <Suspense fallback={<TabLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <ActiveTab id={active} />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </motion.div>
      </main>
    </div>
  );
}