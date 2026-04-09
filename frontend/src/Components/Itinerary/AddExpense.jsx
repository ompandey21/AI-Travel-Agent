import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useState } from "react";
import { addExpense } from "../Trip/TripAPI";
import {
  Plus, ArrowRightLeft, X, Loader2, AlertCircle, CheckCircle2, Receipt,
} from "lucide-react";


function Avatar({ name, size = "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-teal-400/15 border border-teal-400/30
                    flex items-center justify-center text-teal-400 font-bold shrink-0`}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

export default function AddExpenseModal({ tripId, members, onClose, onSuccess }) {
  const [title, setTitle]                     = useState("");
  const [amount, setAmount]                   = useState("");
  const [splitType, setSplitType]             = useState("equal");
  const [selectedMembers, setSelectedMembers] = useState(members.map((m) => m.userId));
  const [customSplits, setCustomSplits]       = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [done, setDone]                       = useState(false);

  // Populate custom splits when switching to custom mode
  useEffect(() => {
    if (splitType === "custom") {
      setCustomSplits(members.map((m) => ({ userId: m.userId, name: m.name, amount: "" })));
    }
  }, [splitType, members]);

  const amountNum     = parseFloat(amount) || 0;
  const customTotal   = customSplits.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const splitMismatch = splitType === "custom" && amountNum > 0 && Math.abs(customTotal - amountNum) > 0.01;

  const toggleMember = (userId) =>
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

  const handleCustomChange = (userId, val) =>
    setCustomSplits((prev) => prev.map((s) => (s.userId === userId ? { ...s, amount: val } : s)));

  const handleSubmit = async () => {
    if (!title.trim() || amountNum <= 0) {
      setError("Please fill in a title and a valid amount.");
      return;
    }
    if (splitType === "equal" && selectedMembers.length === 0) {
      setError("Select at least one participant.");
      return;
    }
    if (splitType === "custom" && splitMismatch) {
      setError(`Custom splits must add up to ₹${amountNum.toLocaleString()}.`);
      return;
    }

    const payload = {
      title: title.trim(),
      amount: amountNum,
      splitType,
      ...(splitType === "equal"  && { participants: selectedMembers }),
      ...(splitType === "custom" && {
        splits: customSplits.map((s) => ({ userId: s.userId, amount: parseFloat(s.amount) || 0 })),
      }),
    };

    try {
      setLoading(true);
      setError(null);
      await addExpense(tripId, payload);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch (e) {
      setError(e.message || "Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  const perHead =
    splitType === "equal" && amountNum > 0 && selectedMembers.length > 0
      ? (amountNum / selectedMembers.length).toFixed(2)
      : null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 backdrop-blur-md bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto w-[80vw] max-w-2xl max-h-[85vh] overflow-y-auto
                     rounded-3xl bg-[#0d1a1a] border border-teal-400/20
                     shadow-[0_0_80px_rgba(45,212,191,0.12)] p-8 flex flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-teal-400 text-[10px] font-bold tracking-[0.14em] uppercase block mb-1">
                New Entry
              </span>
              <h2 className="text-xl font-bold text-white">Add Expense</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center
                         justify-center text-teal-100/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title + Amount + Split toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-teal-100/50 text-xs font-semibold uppercase tracking-wider">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Train Tickets, Hotel Stay…"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-teal-400/20
                           text-white placeholder-teal-100/25 text-sm outline-none
                           focus:border-teal-400/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-teal-100/50 text-xs font-semibold uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-teal-400/20
                           text-white placeholder-teal-100/25 text-sm outline-none
                           focus:border-teal-400/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-teal-100/50 text-xs font-semibold uppercase tracking-wider">Split Type</label>
              <div className="flex rounded-xl overflow-hidden border border-teal-400/20">
                {["equal", "custom"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSplitType(type)}
                    className={`flex-1 py-3 text-sm font-semibold capitalize transition-all
                      ${splitType === type
                        ? "bg-teal-400/20 text-teal-300"
                        : "text-teal-100/35 hover:text-teal-100/60 bg-white/[0.03]"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equal split — participant selector */}
          <AnimatePresence>
            {splitType === "equal" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-teal-100/50 text-xs font-semibold uppercase tracking-wider">
                      Split Among
                    </label>
                    {perHead && (
                      <span className="text-teal-400 text-xs font-semibold">
                        ₹{perHead} / person
                      </span>
                    )}
                  </div>
                  {members.length === 0 ? (
                    <p className="text-teal-100/35 text-sm">No members found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => {
                        const selected = selectedMembers.includes(m.userId);
                        return (
                          <button
                            key={m.userId}
                            onClick={() => toggleMember(m.userId)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                        text-xs font-semibold border transition-all
                              ${selected
                                ? "bg-teal-400/20 border-teal-400/50 text-teal-300"
                                : "bg-white/[0.04] border-teal-400/15 text-teal-100/40 hover:text-teal-100/70"}`}
                          >
                            <Avatar name={m.name} size="sm" />
                            {m.name}
                            {selected && <CheckCircle2 size={11} className="text-teal-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom split — amount per member */}
          <AnimatePresence>
            {splitType === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-teal-100/50 text-xs font-semibold uppercase tracking-wider">
                      Custom Split per Member
                    </label>
                    {amountNum > 0 && (
                      <span className={`text-xs font-semibold ${splitMismatch ? "text-red-400" : "text-teal-400"}`}>
                        ₹{customTotal.toFixed(0)} / ₹{amountNum.toFixed(0)}
                      </span>
                    )}
                  </div>
                  {members.length === 0 ? (
                    <p className="text-teal-100/35 text-sm">No members found.</p>
                  ) : (
                    customSplits.map((s) => (
                      <div key={s.userId} className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <span className="text-white text-sm flex-1">{s.name}</span>
                        <input
                          type="number"
                          min="0"
                          value={s.amount}
                          onChange={(e) => handleCustomChange(s.userId, e.target.value)}
                          placeholder="₹0"
                          className="w-28 px-3 py-2 rounded-lg bg-white/[0.05] border border-teal-400/20
                                     text-white placeholder-teal-100/25 text-sm text-right outline-none
                                     focus:border-teal-400/50 transition-all"
                        />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/25 text-red-300 text-sm"
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading || done}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all
                       bg-teal-400/20 border border-teal-400/40 text-teal-300
                       hover:bg-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {done ? (
              <><CheckCircle2 size={16} /> Added!</>
            ) : loading ? (
              <><Loader2 size={16} className="animate-spin" /> Adding…</>
            ) : (
              <><Plus size={16} /> Add Expense</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}