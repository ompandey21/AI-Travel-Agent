import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Train, UtensilsCrossed, BedDouble, Compass,
  Sparkles, MapPin, Clock, X, Check, Loader2, CalendarX, Image,
  ChevronLeft, ChevronRight, Trash2,
} from "lucide-react";
import {
  getItinerary,
  getDays,
  createItineraryFun,
  createSlotFun,
  deleteSlotFun,
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

function AddSlotModal({ dayId, dayLabel, onClose, onSuccess }) {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl bg-[#0b1929] border border-teal-400/20 p-5 sm:p-6 shadow-2xl"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 rounded-full bg-teal-400/20 mx-auto mb-4 sm:hidden" />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X size={18} />
        </button>

        <h3 className="text-white font-bold text-lg mb-0.5">Add New Slot</h3>
        {dayLabel && (
          <p className="text-teal-400 text-xs font-semibold mb-1">{dayLabel}</p>
        )}
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ slot, onClose, onConfirm, loading }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl bg-[#0b1929] border border-red-400/20 p-5 sm:p-6 shadow-2xl"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-red-400/20 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/25 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">Delete Slot?</h3>
            <p className="text-red-200/40 text-xs">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-5 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 line-clamp-2">
          {slot?.activity || slot?.label || "This slot"}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-400/20 border border-red-400/40 text-red-400 text-sm font-semibold
                       flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:bg-red-400/30 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? "Deleting…" : "Delete"}
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

function SlotItem({ slot, isActive, isLast, onDelete }) {
  const cfg  = getTypeCfg(slot.type || slot.activityType);
  const Icon = cfg.Icon;
  const imgUrl = slot.imgUrl || slot.imageUrl || slot.image || null;

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center w-14 sm:w-20 shrink-0">
        <span className="text-teal-100/40 text-[9px] sm:text-[10px] font-semibold whitespace-nowrap mb-1.5">
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
        className={`flex gap-2 sm:gap-3 mb-3 flex-1 px-3 py-2.5 rounded-xl border transition-all duration-200
          ${cfg.bg} ${cfg.ring} ${isActive ? `shadow-lg ${cfg.glow}` : ""}`}
      >
        {/* Image or Icon */}
        <div className="shrink-0 mt-0.5">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={slot.activity || "slot"}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-white/10"
              onError={(e) => {
                // Fallback to icon on broken image
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`${imgUrl ? "hidden" : "flex"} w-10 h-10 sm:w-12 sm:h-12 rounded-lg items-center justify-center ${cfg.bg} border ${cfg.ring}`}
          >
            <Icon size={16} className={cfg.text} strokeWidth={2} />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="text-teal-50/90 text-xs sm:text-sm font-medium leading-snug">{slot.activity || slot.label}</p>
          {slot.endTime && (
            <span className="flex items-center gap-1 text-teal-100/35 text-[10px] mt-0.5">
              <Clock size={8} /> until {slot.endTime}
            </span>
          )}
        </div>

        {/* Right side — Now badge + delete */}
        <div className="flex flex-col items-end justify-between gap-1 shrink-0">
          {isActive && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5
                             rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Now
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onDelete(slot)}
            className="p-1 rounded-md text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
            title="Delete slot"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
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

  // Day navigation: controlled index (initialised to today's day once trip loads)
  const [viewDayIndex, setViewDayIndex] = useState(null);

  // Delete modal state
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentDayIndex = trip ? computeTripDayIndex(trip.startDate) : 0;
  const clampedTodayIndex = Math.max(0, Math.min(currentDayIndex ?? 0, days.length - 1));

  // The displayed day index: user-controlled, falls back to today's clamped index
  const displayDayIndex = viewDayIndex !== null
    ? Math.max(0, Math.min(viewDayIndex, days.length - 1))
    : clampedTodayIndex;

  const currentDay = days[displayDayIndex] ?? null;

  const isToday = displayDayIndex === clampedTodayIndex;

  const now = nowMinutes();
  const activeSlotIndex = (() => {
    if (!isToday) return null; // only show "active" highlight on today
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
      const dayData = await getDays(itin.itinerary.id);
      setDays(dayData.days);
    } catch (e) {
      console.error(e);
      setError("Failed to load itinerary data.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Initialise viewDayIndex to today once days are available
  useEffect(() => {
    if (days.length > 0 && viewDayIndex === null) {
      setViewDayIndex(clampedTodayIndex);
    }
  }, [days, clampedTodayIndex]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateAISlots = () => {
    console.log("🤖 Create slots with AI — coming soon!", { tripId, itineraryId: itinerary?.id });
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteSlotFun(slotToDelete.id || slotToDelete._id);
      setSlotToDelete(null);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const goToPrevDay = () => setViewDayIndex((i) => Math.max(0, (i ?? displayDayIndex) - 1));
  const goToNextDay = () => setViewDayIndex((i) => Math.min(days.length - 1, (i ?? displayDayIndex) + 1));
  const goToToday   = () => setViewDayIndex(clampedTodayIndex);

  const dayLabel = currentDay
    ? `Day ${displayDayIndex + 1}${currentDay.title ? ` — ${currentDay.title}` : ""}`
    : null;

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
    <div className="p-4 sm:p-6 md:p-8 h-full overflow-y-auto text-white">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-teal-400 text-[10px] font-bold tracking-[0.12em] uppercase block mb-1.5">Daily Plan</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Trip Itinerary</h2>
          {trip && (
            <p className="text-teal-100/50 text-xs sm:text-sm">
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
            <TripPathCanvas days={days} currentDayIndex={displayDayIndex} />
            {/* Legend */}
            <div className="flex items-center gap-4 sm:gap-5 mt-3 flex-wrap">
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

          {/* Day Plan Panel */}
          <div className="rounded-2xl bg-white/[0.04] border border-teal-400/12 p-4 sm:p-5 mb-5">

            {/* Day header row */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">

              {/* Left: Day nav */}
              <div className="flex items-center gap-2 min-w-0">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={goToPrevDay}
                  disabled={displayDayIndex === 0}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-teal-400/20 flex items-center justify-center
                             text-teal-300 disabled:opacity-30 cursor-pointer hover:bg-teal-400/10 transition-colors shrink-0"
                >
                  <ChevronLeft size={16} />
                </motion.button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-teal-400 text-[10px] font-bold tracking-widest uppercase">
                      {isToday ? "Today's Plan" : "Day Plan"}
                    </span>
                    {!isToday && (
                      <button
                        onClick={goToToday}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-semibold cursor-pointer hover:bg-amber-400/25 transition-colors"
                      >
                        Go to Today
                      </button>
                    )}
                  </div>
                  {currentDay && (
                    <h3 className="text-white font-semibold text-sm sm:text-base leading-tight truncate">
                      Day {displayDayIndex + 1}
                      {currentDay.title ? ` — ${currentDay.title}` : ""}
                      {currentDay.date && (
                        <span className="ml-2 text-teal-200/40 text-sm font-normal">
                          {formatDateShort(currentDay.date)}
                        </span>
                      )}
                    </h3>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={goToNextDay}
                  disabled={displayDayIndex === days.length - 1}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-teal-400/20 flex items-center justify-center
                             text-teal-300 disabled:opacity-30 cursor-pointer hover:bg-teal-400/10 transition-colors shrink-0"
                >
                  <ChevronRight size={16} />
                </motion.button>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Add Slot */}
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setShowAddSlot(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-teal-400/10 border border-teal-400/30
                             text-teal-400 text-xs font-semibold cursor-pointer"
                >
                  <Plus size={13} />
                  <span className="hidden xs:inline sm:inline">Add Slot</span>
                </motion.button>

                {/* AI Slots */}
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={handleCreateAISlots}
                  className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold
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
                  <span className="hidden xs:inline sm:inline">AI Slots</span>
                </motion.button>
              </div>
            </div>

            {/* Day indicator dots */}
            {days.length > 1 && (
              <div className="flex items-center gap-1 mb-4 flex-wrap">
                {days.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setViewDayIndex(i)}
                    className={`transition-all duration-200 rounded-full cursor-pointer
                      ${i === displayDayIndex
                        ? "w-5 h-2 bg-teal-400"
                        : i === clampedTodayIndex
                          ? "w-2 h-2 bg-amber-400/70"
                          : "w-2 h-2 bg-white/15 hover:bg-white/30"
                      }`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Timeline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={displayDayIndex}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {currentDay?.slots?.length > 0 ? (
                  <div className="flex flex-col">
                    {currentDay.slots.map((slot, i) => (
                      <SlotItem
                        key={slot.id || slot._id || i}
                        slot={slot}
                        isActive={i === activeSlotIndex}
                        isLast={i === currentDay.slots.length - 1}
                        onDelete={(s) => setSlotToDelete(s)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
                      <Clock size={18} className="text-teal-400/40" />
                    </div>
                    <p className="text-teal-100/30 text-sm">No slots added yet for this day</p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAddSlot(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-400/10 border border-teal-400/25 text-teal-400 text-xs font-semibold cursor-pointer"
                    >
                      <Plus size={12} /> Add First Slot
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Add Slot Modal — uses currentDay (the viewed day) */}
      <AnimatePresence>
        {showAddSlot && currentDay && (
          <AddSlotModal
            dayId={currentDay.id || currentDay._id}
            dayLabel={dayLabel}
            onClose={() => setShowAddSlot(false)}
            onSuccess={() => { setShowAddSlot(false); fetchAll(); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {slotToDelete && (
          <DeleteConfirmModal
            slot={slotToDelete}
            loading={deleteLoading}
            onClose={() => setSlotToDelete(null)}
            onConfirm={handleDeleteSlot}
          />
        )}
      </AnimatePresence>
    </div>
  );
}