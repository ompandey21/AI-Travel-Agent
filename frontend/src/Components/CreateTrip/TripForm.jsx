import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, DollarSign, ImageIcon, Plane,
  Search, Upload, CheckCircle, ArrowRight, Loader2,
  Sparkles, X
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&family=Cormorant+Garamond:wght@400;600;700&display=swap');
    * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
    .serif { font-family: 'Cormorant Garamond', serif !important; }
    .mono  { font-family: 'DM Mono', monospace !important; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.55) sepia(1) hue-rotate(140deg); cursor: pointer; }
    input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 20px; height: 20px; border-radius: 50%;
      background: #3D9A9B; border: 2px solid rgba(255,255,255,0.2);
      box-shadow: 0 0 0 4px rgba(61,154,155,0.25), 0 0 16px rgba(61,154,155,0.4);
      cursor: pointer;
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(61,154,155,0.3); border-radius: 4px; }
    .focus-ring:focus {
      border-color: rgba(61,154,155,0.65) !important;
      box-shadow: 0 0 0 3px rgba(61,154,155,0.1), 0 0 20px rgba(61,154,155,0.06) !important;
      outline: none;
    }
  `}</style>
);

const DESTINATIONS = [
  "Paris, France","Tokyo, Japan","New York, USA","Bali, Indonesia",
  "Rome, Italy","Barcelona, Spain","Santorini, Greece","Kyoto, Japan",
  "London, UK","Dubai, UAE","Maldives","Prague, Czech Republic",
  "Amsterdam, Netherlands","Istanbul, Turkey","Sydney, Australia",
  "Cape Town, South Africa","Lisbon, Portugal","Vienna, Austria",
  "Copenhagen, Denmark","Singapore",
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
  }),
};

function FieldLabel({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Icon size={11} strokeWidth={2.5} style={{ color: "#3D9A9B" }} />
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3D9A9B" }}>
        {text}
      </span>
    </div>
  );
}


const inputBase = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#15A0A2",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.25s, box-shadow 0.25s",
};


function TripNameInput({ value, onChange }) {
  return (
    <motion.div variants={fadeUp} custom={1}>
      <FieldLabel icon={Plane} text="Trip Name" />
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="My Summer Adventure"
          className="focus-ring"
          style={{ ...inputBase, padding: "14px 44px 14px 16px" }}
        />
        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <CheckCircle size={16} style={{ color: "#3D9A9B" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


function DestinationSearch({ value, onChange }) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const filtered = query.length > 0
    ? DESTINATIONS.filter(d => d.toLowerCase().includes(query.toLowerCase()) && d !== query)
    : [];
  const showDrop = focused && filtered.length > 0;

  return (
    <motion.div variants={fadeUp} custom={2}>
      <FieldLabel icon={MapPin} text="Destination" />
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ color: "#3D9A9B" }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 160)}
          placeholder="Search destination..."
          className="focus-ring"
          style={{
            ...inputBase,
            padding: "14px 44px 14px 38px",
            borderRadius: showDrop ? "12px 12px 0 0" : "12px",
          }}
        />
        {value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wider px-2 py-1 rounded-full"
            style={{ background: "rgba(61,154,155,0.15)", color: "#3D9A9B", border: "1px solid rgba(61,154,155,0.25)" }}>
            ✓ Set
          </span>
        )}

        <AnimatePresence>
          {showDrop && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="absolute z-50 w-full max-h-48 overflow-y-auto"
              style={{
                background: "rgba(5,13,28,0.98)",
                border: "1px solid rgba(61,154,155,0.25)",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                backdropFilter: "blur(20px)",
              }}
            >
              {filtered.slice(0, 7).map((dest, i) => (
                <motion.div
                  key={i}
                  onMouseDown={() => { setQuery(dest); onChange(dest); }}
                  whileHover={{ backgroundColor: "rgba(61,154,155,0.1)" }}
                  className="flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", color: "rgba(226,232,240,0.8)", fontSize: "13px" }}
                >
                  <MapPin size={12} style={{ color: "#3D9A9B", flexShrink: 0 }} />
                  {dest}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DatePair({ startDate, endDate, onStart, onEnd }) {
  const today = new Date().toISOString().split("T")[0];
  const days = startDate && endDate && endDate >= startDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)
    : null;

  return (
    <motion.div variants={fadeUp} custom={3}>
      <FieldLabel icon={Calendar} text="Travel Dates" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Departure", val: startDate, change: onStart, min: today },
          { label: "Return", val: endDate, change: onEnd, min: startDate || today },
        ].map(({ label, val, change, min }) => (
          <div key={label}>
            <p className="text-slate-500 text-[10px] font-medium tracking-wider uppercase mb-1.5 pl-0.5">{label}</p>
            <div className="relative">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(61,154,155,0.5)" }} />
              <input
                type="date"
                value={val}
                min={min}
                onChange={e => change(e.target.value)}
                className="focus-ring"
                style={{ ...inputBase, padding: "13px 12px 13px 30px", colorScheme: "dark" }}
              />
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {days && (
          <motion.p
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 mt-2.5 pl-0.5 text-xs"
            style={{ color: "rgba(61,154,155,0.7)" }}
          >
            <Sparkles size={11} />
            {days} day{days !== 1 ? "s" : ""} of adventure
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BudgetSlider({ value, onChange }) {
  const min = 500, max = 10000;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <motion.div variants={fadeUp} custom={4}>
      <div className="flex justify-between items-center mb-4">
        <FieldLabel icon={DollarSign} text="Budget" />
        <motion.span
          key={value}
          initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="mono text-sm font-bold px-3.5 py-1 rounded-full"
          style={{
            background: "rgba(61,154,155,0.12)",
            border: "1px solid rgba(61,154,155,0.28)",
            color: "#3D9A9B",
          }}
        >
          ${value.toLocaleString()}
        </motion.span>
      </div>

      <div className="relative h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, rgba(61,154,155,0.5), #3D9A9B)", transition: "width 0.05s" }}
        />
        <input
          type="range" min={min} max={max} step={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "100%" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full pointer-events-none"
          style={{
            left: `${pct}%`,
            background: "#3D9A9B",
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 0 0 4px rgba(61,154,155,0.25), 0 0 16px rgba(61,154,155,0.4)",
            transition: "left 0.05s",
          }}
        />
      </div>

      <div className="flex justify-between px-0.5 text-slate-600 text-xs">
        <span>$500</span>
        <span>$10,000</span>
      </div>
    </motion.div>
  );
}

function CoverUpload({ preview, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlVal, setUrlVal] = useState("");
  const inputRef = useRef();

  const handleFile = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  return (
    <motion.div variants={fadeUp} custom={5}>
      <div className="flex items-center justify-between mb-2.5">
        <FieldLabel icon={ImageIcon} text="Cover Image" />
        <button
          onClick={() => setUrlMode(!urlMode)}
          className="text-xs transition-colors"
          style={{ color: urlMode ? "#3D9A9B" : "rgba(61,154,155,0.5)", background: "none", border: "none", cursor: "pointer" }}
        >
          {urlMode ? "← Upload" : "Use URL →"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {urlMode ? (
          <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
            <input
              value={urlVal}
              onChange={e => setUrlVal(e.target.value)}
              placeholder="https://..."
              className="focus-ring flex-1"
              style={{ ...inputBase, padding: "12px 14px" }}
            />
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => urlVal && onChange(urlVal)}
              className="rounded-xl px-4 text-sm font-semibold transition-colors"
              style={{
                background: "rgba(61,154,155,0.18)",
                border: "1px solid rgba(61,154,155,0.3)",
                color: "#3D9A9B", cursor: "pointer",
              }}
            >
              Apply
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }} animate={{ opacity: 1 ,borderColor: dragging ? "rgba(61,154,155,0.7)" : "rgba(61,154,155,0.2)"}} exit={{ opacity: 0 }}
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            
            className="relative rounded-2xl cursor-pointer overflow-hidden transition-all"
            style={{
              border: `1.5px dashed ${dragging ? "rgba(61,154,155,0.7)" : "rgba(61,154,155,0.22)"}`,
              background: dragging ? "rgba(61,154,155,0.07)" : "rgba(255,255,255,0.02)",
              minHeight: preview ? "160px" : "118px",
            }}
          >
            {preview ? (
              <>
                <img src={preview} alt="Cover" className="w-full object-cover" style={{ height: "160px" }} />
                <div
                  className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity text-white text-sm rounded-xl"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <Upload size={14} /> Change image
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onChange(null); }}
                  className="absolute top-2 right-2 rounded-full p-1 transition-colors"
                  style={{ background: "rgba(0,0,0,0.65)", border: "none", cursor: "pointer", color: "white" }}
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-7 gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(61,154,155,0.1)", border: "1px solid rgba(61,154,155,0.18)" }}>
                  <Upload size={19} style={{ color: "rgba(61,154,155,0.6)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
                    Drag & drop or{" "}
                    <span style={{ color: "#3D9A9B" }}>click to upload</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.5)" }}>
                    JPG, PNG, WEBP · up to 10MB
                  </p>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SuccessScreen({ destination, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center gap-5 py-10 px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 260, damping: 18 }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "rgba(61,154,155,0.12)", border: "2px solid rgba(61,154,155,0.4)" }}
      >
        <CheckCircle size={34} style={{ color: "#3D9A9B" }} />
      </motion.div>
      <div>
        <h2 className="serif text-3xl font-bold mb-2" style={{ color: "#f1f5f9" }}>Trip Created!</h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
          Your AI itinerary is being crafted for{" "}
          <span className="font-semibold" style={{ color: "#3D9A9B" }}>{destination || "your destination"}</span>.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onReset}
        className="mt-1 rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
        style={{
          background: "rgba(61,154,155,0.12)",
          border: "1px solid rgba(61,154,155,0.28)",
          color: "#3D9A9B", cursor: "pointer",
        }}
      >
        Plan Another Trip
      </motion.button>
    </motion.div>
  );
}
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export default function TripCreationPage() {
  const [form, setForm] = useState({
    name: "", destination: "", startDate: "", endDate: "", budget: 2500, cover: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = key => val => setForm(f => ({ ...f, [key]: val }));
  const navigate = useNavigate();
  const handleSubmit = async () => {
    setSubmitting(true);
    try{
        const res = await axios.post(`${API_BASE}/api/trips/create-trip`, form, {withCredentials : true});
        if(res.status == 201){
            console.log("Suucessfully created");
            navigate('/myTrip');
            setSubmitted(true);
        }

    }catch(e){
        console.log(e);;
    }
    
  };

  return (
    <>
      <FontStyle />

      <div
        className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #73FBD3 0%, #ADEBFF 40%,#44E5E7 70%, #81EDEF 100%)" }}
      >
        <motion.div
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(61,154,155,0.09) 0%, transparent 70%)", filter: "blur(48px)" }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute bottom-8 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(61,154,155,0.07) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(61,154,155,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(61,154,155,0.035) 1px, transparent 1px)",
            backgroundSize: "58px 58px",
          }}
        />
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(61,154,155,0.1)", border: "1px solid rgba(61,154,155,0.2)" }}
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#3D9A9B" }}
              />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3D9A9B" }}>
                AI Planning Active
              </span>
            </motion.div>

            <h1 className="serif font-bold leading-tight mb-3" style={{ fontSize: "clamp(32px,6vw,46px)", color: "#0E6B6C", letterSpacing: "-0.02em" }}>
              Create Your Trip
            </h1>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#15A0A2" }}>
              Start planning your next adventure with AI-powered travel planning.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl overflow-visible"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="absolute top-0 rounded-t-2xl pointer-events-none"
              style={{
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(61,154,155,0.5), transparent)",
              }}
            />

            <div className="p-8 md:p-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessScreen
                    key="success"
                    destination={form.destination}
                    onReset={() => {
                      setSubmitted(false);
                      setForm({ name: "", destination: "", startDate: "", endDate: "", budget: 2500, cover: null });
                    }}
                  />
                ) : (
                  <motion.div
                    key="form"
                    initial="hidden" animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                    className="flex flex-col gap-7"
                  >
                    <TripNameInput value={form.name} onChange={update("name")} />
                    <DestinationSearch value={form.destination} onChange={update("destination")} />

                    <motion.div variants={fadeUp} custom={2.5}
                      className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <DatePair
                      startDate={form.startDate} endDate={form.endDate}
                      onStart={update("startDate")} onEnd={update("endDate")}
                    />

                    <motion.div variants={fadeUp} custom={3.5}
                      className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <BudgetSlider value={form.budget} onChange={update("budget")} />

                    <motion.div variants={fadeUp} custom={4.5}
                      className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <CoverUpload preview={form.cover} onChange={update("cover")} />

                    {/* CTA */}
                    <motion.div variants={fadeUp} custom={6} className="pt-1">
                      <motion.button
                        whileHover={{
                          y: -2,
                          boxShadow: "0 12px 40px rgba(61,154,155,0.45), 0 0 0 1px rgba(61,154,155,0.5)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-sm text-white transition-all duration-300"
                        style={{
                          background: submitting
                            ? "rgba(61,154,155,0.3)"
                            : "linear-gradient(135deg, #3D9A9B 0%, #2d7e7f 100%)",
                          border: "1px solid rgba(61,154,155,0.4)",
                          boxShadow: "0 4px 24px rgba(61,154,155,0.2)",
                          letterSpacing: "0.02em",
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating your trip...
                          </>
                        ) : (
                          <>
                            Create Trip
                            <ArrowRight size={16} />
                          </>
                        )}
                      </motion.button>

                      <p className="text-center mt-3 text-xs flex items-center justify-center gap-1.5"
                        style={{ color: "rgba(100,116,139,0.55)" }}>
                        <Sparkles size={10} style={{ color: "rgba(61,154,155,0.5)" }} />
                        Your AI itinerary will be ready in seconds
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}