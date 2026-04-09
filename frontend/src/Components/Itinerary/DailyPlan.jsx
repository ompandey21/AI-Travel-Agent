import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Train, UtensilsCrossed, BedDouble, Compass,
  Sparkles, MapPin, Clock, X, Check, Loader2, CalendarX, Image,
} from "lucide-react";
import {
  getItinerary,
  getDays,
  createItineraryFun,
  createSlotFun,
} from "./ItineraryAPI";
import { getTripById } from "../Trip/TripAPI";
import TripPathCanvas from "./TripPathCanvas";

// ─── helpers ────────────────────────────────────────────────────────────────

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, meridiem] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + (m || 0);
}

function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function computeTripDayIndex(startDateStr) {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  transport: { Icon: Train,           dot: "#60a5fa", ring: "border-blue-400/30",   bg: "bg-blue-400/10",   text: "text-blue-300",   glow: "shadow-blue-500/20"   },
  food:      { Icon: UtensilsCrossed, dot: "#fbbf24", ring: "border-amber-400/30",  bg: "bg-amber-400/10",  text: "text-amber-300",  glow: "shadow-amber-500/20"  },
  stay:      { Icon: BedDouble,       dot: "#a78bfa", ring: "border-violet-400/30", bg: "bg-violet-400/10", text: "text-violet-300", glow: "shadow-violet-500/20" },
  explore:   { Icon: Compass,         dot: "#2dd4bf", ring: "border-teal-400/30",   bg: "bg-teal-400/10",   text: "text-teal-300",   glow: "shadow-teal-500/20"   },
  default:   { Icon: MapPin,          dot: "#94a3b8", ring: "border-slate-400/30",  bg: "bg-slate-400/10",  text: "text-slate-300",  glow: "shadow-slate-500/20"  },
};

function getTypeCfg(type) {
  return TYPE_CONFIG[type?.toLowerCase()] ?? TYPE_CONFIG.default;
}
// ─── Add Slot Modal ───────────────────────────────────────────────────────────

function AddSlotModal({ dayId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    activity: "",
    startTime: "",
    endTime: "",
    imgUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async () => {
    if (!form.activity.trim()) return setError("Activity description is required.");
    if (!form.startTime)       return setError("Start time is required.");
    if (!form.endTime)         return setError("End time is required.");
    if (form.startTime >= form.endTime) return setError("End time must be after start time.");

    setLoading(true);
    setError(null);
    try {
      await createSlotFun(dayId, {
        startTime: form.startTime,
        endTime:   form.endTime,
        activity:  form.activity.trim(),
        ...(form.imgUrl.trim() && { imgUrl: form.imgUrl.trim() }),
      });
      onSuccess();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md mx-4 rounded-2xl bg-[#0b1929] border border-teal-400/20 p-6 shadow-2xl"
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X size={18} />
        </button>

        <h3 className="text-white font-bold text-lg mb-1">Add New Slot</h3>
        <p className="text-teal-100/40 text-xs mb-5">Schedule an activity block for this day</p>

        <div className="space-y-3">
          {/* Activity */}
          <div>
            <label className="text-teal-100/40 text-[10px] uppercase tracking-wider mb-1 block">Activity *</label>
            <textarea
              rows={2}
              placeholder="e.g. Visit Meenakshi Temple, Lunch at Murugan Idli Shop…"
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              className="w-full bg-white/5 border border-teal-400/20 rounded-lg px-3 py-2 text-sm text-white
                         placeholder-slate-500 focus:outline-none focus:border-teal-400/50 resize-none transition-colors"
            />
          </div>

          {/* Time row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-teal-100/40 text-[10px] uppercase tracking-wider mb-1 block">Start Time *</label>
              <input
                type="time" value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="w-full bg-white/5 border border-teal-400/20 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-teal-400/50 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-teal-100/40 text-[10px] uppercase tracking-wider mb-1 block">End Time *</label>
              <input
                type="time" value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="w-full bg-white/5 border border-teal-400/20 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-teal-400/50 transition-colors"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-teal-100/40 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 block">
              <Image size={9} /> Image URL (optional)
            </label>
            <input
              type="url" placeholder="https://…"
              value={form.imgUrl}
              onChange={(e) => set("imgUrl", e.target.value)}
              className="w-full bg-white/5 border border-teal-400/20 rounded-lg px-3 py-2 text-sm text-white
                         placeholder-slate-500 focus:outline-none focus:border-teal-400/50 transition-colors"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs">
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 rounded-lg bg-teal-400/20 border border-teal-400/40 text-teal-400
                       text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {loading ? "Creating…" : "Add Slot"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Itinerary Empty State ─────────────────────────────────────────────

function EmptyItinerary({ tripId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await createItineraryFun(tripId, {});
      onCreated();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create itinerary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 min-h-[320px] gap-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-teal-400/10 border border-teal-400/25 flex items-center justify-center">
        <CalendarX size={28} className="text-teal-400/60" />
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold text-lg mb-1">No Itinerary Yet</h3>
        <p className="text-teal-100/40 text-sm">This trip doesn't have an itinerary. Create one to get started.</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={handleCreate} disabled={loading}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-400/20 border border-teal-400/40
                   text-teal-400 font-semibold text-sm disabled:opacity-50 cursor-pointer"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {loading ? "Creating…" : "Create Itinerary"}
      </motion.button>
    </motion.div>
  );
}

// ─── Slot Timeline Item ───────────────────────────────────────────────────────

function SlotItem({ slot, isActive, isLast }) {
  const cfg  = getTypeCfg(slot.type || slot.activityType);
  const Icon = cfg.Icon;

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center w-20 shrink-0">
        <span className="text-teal-100/40 text-[10px] font-semibold whitespace-nowrap mb-1.5">
          {slot.startTime || ""}
        </span>
        <div className="relative flex items-center justify-center">
          <div
            className={`w-3 h-3 rounded-full shrink-0 transition-all duration-300 ${isActive ? "scale-125" : ""}`}
            style={{ backgroundColor: cfg.dot, boxShadow: isActive ? `0 0 10px ${cfg.dot}` : undefined }}
          />
          {isActive && (
            <motion.div
              className="absolute rounded-full"
              style={{ width: 12, height: 12, backgroundColor: cfg.dot }}
              animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 min-h-[20px] bg-teal-400/10 my-1" />}
      </div>

      {/* Card */}
      <div
        className={`flex items-start gap-2 mb-3 flex-1 px-3 py-2.5 rounded-xl border transition-all duration-200
          ${cfg.bg} ${cfg.ring} ${isActive ? `shadow-lg ${cfg.glow}` : ""}`}
      >
        <Icon size={13} className={`${cfg.text} mt-0.5 shrink-0`} strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-teal-50/90 text-xs font-medium leading-snug">{slot.activity || slot.label}</p>
          {slot.endTime && (
            <span className="flex items-center gap-1 text-teal-100/35 text-[10px] mt-0.5">
              <Clock size={8} /> until {slot.endTime}
            </span>
          )}
        </div>
        {isActive && (
          <span className="ml-auto shrink-0 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5
                           rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Now
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyPlan() {
  const { tripId } = useParams();

  const [trip, setTrip]               = useState(null);
  const [itinerary, setItinerary]     = useState(null);
  const [days, setDays]               = useState([]);
  const [hasItinerary, setHasItinerary] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);

  const currentDayIndex = trip ? computeTripDayIndex(trip.startDate) : 0;
  const clampedDayIndex = Math.max(0, Math.min(currentDayIndex ?? 0, days.length - 1));
  const currentDay      = days[clampedDayIndex] ?? null;

  const now = nowMinutes();
  const activeSlotIndex = (() => {
    const slots = currentDay?.slots ?? [];
    for (let i = 0; i < slots.length; i++) {
      const start = timeToMinutes(slots[i].startTime);
      const end   = timeToMinutes(slots[i].endTime);
      if (end > start && now >= start && now < end) return i;
    }
    return null;
  })();

  const fetchAll = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const tripData = await getTripById(tripId);
      // console.log(tripData)
      setTrip(tripData);

      const itin = await getItinerary(tripId).catch((e) => {
        if (e?.response?.status === 404) return null;
        throw e;
      });

      if (!itin) {
        setHasItinerary(false);
        return;
      }

      setItinerary(itin.itinerary);
      setHasItinerary(true);
      // console.log(itin.itinerary.days); 
      const dayData =  await getDays(itin.itinerary.id);
      setDays(dayData.days);
      // console.log(days);
    } catch (e) {
      console.error(e);
      setError("Failed to load itinerary data.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  

  const handleCreateAISlots = () => {
    console.log("🤖 Create slots with AI — coming soon!", { tripId, itineraryId: itinerary?.id });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-teal-400">
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto text-white">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-teal-400 text-[10px] font-bold tracking-[0.12em] uppercase block mb-1.5">Daily Plan</span>
          <h2 className="text-2xl font-bold text-white mb-1">Trip Itinerary</h2>
          {trip && (
            <p className="text-teal-100/50 text-sm">
              {trip.source && trip.destination ? `${trip.source} → ${trip.destination} · ` : ""}
              {trip.totalDays ?? days.length} Days
              {trip.budget ? ` · ₹${Number(trip.budget).toLocaleString("en-IN")}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* No itinerary */}
      {!hasItinerary && <EmptyItinerary tripId={tripId} onCreated={fetchAll} />}

      {/* Itinerary exists */}
      {hasItinerary && (
        <>
          {/* Journey Path */}
          <div className="rounded-2xl bg-white/[0.03] border border-teal-400/10 p-4 mb-6">
            <span className="text-teal-100/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">
              Journey Path
            </span>
            <TripPathCanvas days={days} currentDayIndex={clampedDayIndex} />
            {/* Legend */}
            <div className="flex items-center gap-5 mt-3">
              {[
                { color: "bg-teal-400",  label: "Completed" },
                { color: "bg-amber-400", label: "Today"     },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400/70">
                  <span
                    className={`inline-block w-2.5 h-2.5 ${color}`}
                    style={{ transform: "rotate(45deg)", borderRadius: 2 }}
                  />
                  {label}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400/60">
                <span
                  className="inline-block w-2.5 h-2.5 border border-slate-500"
                  style={{ transform: "rotate(45deg)", borderRadius: 2 }}
                />
                Upcoming
              </span>
            </div>
          </div>

          {/* Today's Plan */}
          <div className="rounded-2xl bg-white/[0.04] border border-teal-400/12 p-5 mb-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <span className="text-teal-400 text-[10px] font-bold tracking-widest uppercase block mb-0.5">
                  Today's Plan
                </span>
                {currentDay && (
                  <h3 className="text-white font-semibold text-base">
                    Day {clampedDayIndex + 1}
                    {currentDay.title ? ` — ${currentDay.title}` : ""}
                    {currentDay.date && (
                      <span className="ml-2 text-teal-200/40 text-sm font-normal">
                        {formatDateShort(currentDay.date)}
                      </span>
                    )}
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Add Slot */}
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setShowAddSlot(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-400/10 border border-teal-400/30
                             text-teal-400 text-xs font-semibold cursor-pointer"
                >
                  <Plus size={13} /> Add Slot
                </motion.button>

                {/* AI Slots */}
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={handleCreateAISlots}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                             cursor-pointer overflow-hidden select-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(167,139,250,0.15) 50%, rgba(45,212,191,0.15) 100%)",
                    border: "1px solid rgba(251,191,36,0.40)",
                    color: "#fde68a",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.span
                    animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.25, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles size={13} />
                  </motion.span>
                  AI Slots
                </motion.button>
              </div>
            </div>

            {/* Timeline */}
            {currentDay?.slots?.length > 0 ? (
              <div className="flex flex-col">
                {currentDay.slots.map((slot, i) => (
                  <SlotItem
                    key={slot.id || slot._id || i}
                    slot={slot}
                    isActive={i === activeSlotIndex}
                    isLast={i === currentDay.slots.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
                  <Clock size={18} className="text-teal-400/40" />
                </div>
                <p className="text-teal-100/30 text-sm">No slots added yet for today</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showAddSlot && currentDay && (
          <AddSlotModal
            dayId={currentDay.id || currentDay._id}
            onClose={() => setShowAddSlot(false)}
            onSuccess={() => { setShowAddSlot(false); fetchAll(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}