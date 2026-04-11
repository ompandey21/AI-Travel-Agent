import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowRightLeft, X, Loader2, AlertCircle, CheckCircle2, Receipt, Clock,
} from "lucide-react";
import {
  getTripExpenses,
  getSettlements,
  getMembers,
  addExpense,
  settleExpense,
  confirmSettlement,
  getUserBalance,
  getTripById
} from "../Trip/TripAPI";
import { getMe } from "../Auth/authApi";
import { useParams } from "react-router-dom";
import AddExpenseModal from "./AddExpense";


function Skeleton({ className }) {
  return <div className={`animate-pulse bg-white/[0.07] rounded-lg ${className}`} />;
}

function Avatar({ name, size = "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-teal-400/15 border border-teal-400/30
                    flex items-center justify-center text-teal-400 font-bold shrink-0`}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

export default function ExpenseSplitter() {
  const [expenses,          setExpenses]          = useState([]);
  const [balances,          setBalances]          = useState([]);
  const [suggested,         setSuggested]         = useState([]);
  const [recentSettlements, setRecentSettlements] = useState([]);
  const [members,           setMembers]           = useState([]);
  const [myBalance,         setMyBalance]         = useState(null);
  const [currentUserId,     setCurrentUserId]     = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [showModal,         setShowModal]         = useState(false);
  const [actionLoading,     setActionLoading]     = useState(null);
  const [activePanel,       setActivePanel]       = useState("myExpenses");
  const [budget, setBudget] = useState(null);
  const PARAMS = useParams();
  const tripId = PARAMS.tripId;

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [expRes, settleRes, memberRes, balanceRes, meRes, tripRes] = await Promise.all([
        getTripExpenses(tripId),
        getSettlements(tripId),
        getMembers(1),
        getUserBalance(tripId),
        getMe(),
        getTripById(tripId)
      ]);

      

      setExpenses(expRes.expenses || []);
      setBudget(tripRes.budget || []);

      setBalances(settleRes.balances || []);
      setSuggested(settleRes.suggestedSettlements || []);
      setRecentSettlements(settleRes.recentSettlements || []);

      setMembers(memberRes || []);
      console.log(memberRes);
      setMyBalance(balanceRes.balance || null);

      // getMe → { data: { id, ... } }
      setCurrentUserId(meRes.id);
    } catch (e) {
      setError(e.message || "Failed to load trip data.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function Avatar({ name, size = "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-teal-400/15 border border-teal-400/30
                    flex items-center justify-center text-teal-400 font-bold shrink-0`}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}


  const handleSettle = async (suggestion) => {
    const key = `${suggestion.from}-${suggestion.to}`;
    try {
      setActionLoading(key);
      await settleExpense(tripId, {
        receiverId: suggestion.to,
        amount: suggestion.amount,
      });
      await fetchAll();
    } catch (e) {
      setError(e.message || "Failed to initiate settlement.");
    } finally {
      setActionLoading(null);
    }
  };

  // Receiver confirms a pending settlement record
  const handleConfirm = async (settlementId) => {
    try {
      setActionLoading(settlementId);
      await confirmSettlement(settlementId);
      await fetchAll();
    } catch (e) {
      setError(e.message || "Failed to confirm settlement.");
    } finally {
      setActionLoading(null);
    }
  };

  const total     = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetPct = Math.min((total / budget) * 100, 100);

  const myExpenses = expenses.filter((exp) => {
    const paidById = exp.paidBy?.id ?? exp.paidBy?.userId;
    return paidById === currentUserId;
  });

  const mySettlements = recentSettlements.filter((s) => {
    const payerId = s.payer?.id ?? s.payer?.userId;
    const receiverId = s.receiver?.id ?? s.receiver?.userId;
    return payerId === currentUserId || receiverId === currentUserId;
  });

  const myOutgoingSettlements = mySettlements.filter((s) => {
    const payerId = s.payer?.id ?? s.payer?.userId;
    return payerId === currentUserId;
  });

  const myIncomingSettlements = mySettlements.filter((s) => {
    const receiverId = s.receiver?.id ?? s.receiver?.userId;
    return receiverId === currentUserId;
  });

  return (
    <>
      <div className={`p-8 h-full overflow-hidden text-white transition-all duration-300 ${showModal ? "blur-sm pointer-events-none" : ""}`}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-teal-400 text-[10px] font-bold tracking-[0.12em] uppercase block mb-1.5">
              Expense Split
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">Trip Expenses</h2>
            {loading ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <p className="text-teal-100/50 text-sm">
                ₹{total.toLocaleString()} spent of ₹{budget.toLocaleString()} budget
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-400/15 border border-teal-400/40
                       text-teal-400 text-sm font-semibold cursor-pointer hover:bg-teal-400/25 transition-colors"
          >
            <Plus size={14} />
            Add Expense
          </motion.button>
        </div>

        {/* ── Global error ── */}
        {error && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/25 text-red-300 text-sm">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Budget progress ── */}
        <div className="mb-1">
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-teal-400 text-xs font-semibold">₹{total.toLocaleString()} spent</span>
            <span className="text-teal-100/40 text-xs">₹{Math.max(budget - total, 0).toLocaleString()} remaining</span>
          </div>
        </div>

        {!loading && myBalance && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 mb-4 p-4 rounded-2xl bg-white/[0.04] border border-teal-400/12 flex items-center gap-4"
          >
            <div className="flex-1">
              <p className="text-teal-100/45 text-[10px] font-bold uppercase tracking-widest mb-1">My Balance</p>
              <p className={`text-xl font-bold ${myBalance.netBalance >= 0 ? "text-teal-400" : "text-red-400"}`}>
                {myBalance.netBalance >= 0 ? "+" : ""}₹{Math.abs(myBalance.netBalance).toFixed(0)}
              </p>
              <p className={`text-xs mt-0.5 ${myBalance.netBalance >= 0 ? "text-teal-400/55" : "text-red-400/55"}`}>
                {myBalance.status === "owed"  ? "you are owed money" :
                 myBalance.status === "owes"  ? "you owe money"      :
                                                "all settled up"}
              </p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-teal-100/35 text-[10px] uppercase tracking-wider">Paid</p>
                <p className="text-white text-sm font-semibold">₹{parseFloat(myBalance.totalPaid || 0).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-teal-100/35 text-[10px] uppercase tracking-wider">Owed</p>
                <p className="text-white text-sm font-semibold">₹{parseFloat(myBalance.totalOwed || 0).toFixed(0)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Member Balances Grid ── */}
        <div className="grid grid-cols-2 gap-4 mt-2 mb-6">
          {loading
            ? [0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
            : balances.map((b, i) => (
              <motion.div
                key={b.userId || b.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-teal-400/12"
              >
                <Avatar name={b.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{b.name || b.email}</p>
                  <p className="text-teal-100/40 text-xs">Paid ₹{parseFloat(b.totalPaid || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold ${b.balance >= 0 ? "text-teal-400" : "text-red-400"}`}>
                    {b.balance >= 0 ? "+" : ""}₹{Math.abs(b.balance || 0).toFixed(0)}
                  </p>
                  <p className={`text-[10px] font-medium ${b.balance >= 0 ? "text-teal-400/55" : "text-red-400/55"}`}>
                    {b.balance >= 0 ? "gets back" : "owes"}
                  </p>
                </div>
              </motion.div>
            ))
          }
        </div>

        <div className="mb-6">
          <div className="inline-flex rounded-2xl bg-white/[0.04] border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setActivePanel("allExpenses")}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${activePanel === "allExpenses"
                ? "bg-teal-400/15 text-teal-100 border border-teal-400/20"
                : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              All Expenses
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("allSettlements")}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${activePanel === "allSettlements"
                ? "bg-teal-400/15 text-teal-100 border border-teal-400/20"
                : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              All Settlements
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("myExpenses")}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${activePanel === "myExpenses"
                ? "bg-teal-400/15 text-teal-100 border border-teal-400/20"
                : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              My Expenses
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("mySettlements")}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${activePanel === "mySettlements"
                ? "bg-teal-400/15 text-teal-100 border border-teal-400/20"
                : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              My Settlements
            </button>
          </div>

          <div className="mt-4 h-[min(62vh,calc(100vh-28rem))] min-h-[320px] rounded-3xl bg-white/[0.04] border border-white/10 overflow-hidden">
            <div className="h-full overflow-y-auto theme-scrollbar rounded-3xl p-4">
              <AnimatePresence mode="wait">
                {activePanel === "allExpenses" ? (
              <div className="space-y-4">
                <div className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
                  All Expenses
                </div>
                <div className="space-y-3">
                  {loading
                    ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)
                    : expenses.length === 0
                      ? <p className="text-teal-100/35 text-sm py-6 text-center">No expenses yet. Add your first one!</p>
                      : expenses.map((exp, i) => {
                          const perPerson = exp.participants?.length > 0
                            ? (exp.amount / exp.participants.length).toFixed(0)
                            : null;

                          return (
                            <motion.div
                              key={exp.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4"
                            >
                              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-teal-400/10 border border-teal-400/30">
                                <Receipt size={16} className="text-teal-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{exp.title}</p>
                                <p className="text-teal-100/40 text-xs mt-1">
                                  Paid by <span className="text-teal-300/70">{exp.paidBy?.name || exp.paidBy?.email || "Unknown"}</span>
                                  {perPerson && ` · ₹${perPerson}/person`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-teal-400/15 text-teal-300">
                                  {exp.splitType}
                                </span>
                                <span className="text-white text-sm font-bold w-16 text-right">
                                  ₹{exp.amount.toLocaleString()}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })
                  }
                </div>
              </div>
            ) : activePanel === "allSettlements" ? (
              <div className="space-y-4">
                <div className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
                  Settlement History
                </div>
                {loading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
                  : recentSettlements.length === 0
                    ? <p className="text-teal-100/35 text-sm py-6 text-center">No settlement activity yet.</p>
                    : recentSettlements.map((s, i) => {
                        const isPending  = s.status === "pending";
                        const isReceiver = s.receiver?.id === currentUserId;
                        const isActing   = actionLoading === s.id;

                        return (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="flex items-center gap-4 rounded-2xl bg-teal-400/[0.07] border border-teal-400/25 p-4"
                          >
                            <div className="w-11 h-11 rounded-2xl bg-teal-400/15 border border-teal-400/25 flex items-center justify-center shrink-0">
                              <ArrowRightLeft size={16} className="text-teal-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Settlement</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isPending ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                                  {s.status}
                                </span>
                              </div>
                              <p className="text-teal-50/85 text-sm">
                                <span className="font-semibold text-white">{s.payer?.name || s.payer?.id}</span>
                                {" paid "}
                                <span className="font-semibold text-white">{s.receiver?.name || s.receiver?.id}</span>
                                {"  "}
                                <span className="text-teal-400 font-bold">₹{parseFloat(s.amount).toFixed(0)}</span>
                              </p>
                            </div>
                            {isReceiver && isPending && (
                              <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleConfirm(s.id)}
                                disabled={isActing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                              >
                                {isActing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                Confirm
                              </motion.button>
                            )}
                          </motion.div>
                        );
                      })
                }
              </div>
            ) : activePanel === "myExpenses" ? (
              <div className="space-y-4">
                <div className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
                  My Expenses
                </div>
                {loading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)
                  : myExpenses.length === 0
                    ? <p className="text-teal-100/35 text-sm py-6 text-center">You haven't added any expenses yet.</p>
                    : myExpenses.map((exp, i) => {
                        const perPerson = exp.participants?.length > 0
                          ? (exp.amount / exp.participants.length).toFixed(0)
                          : null;

                        return (
                          <motion.div
                            key={`mine-exp-${exp.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4"
                          >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-teal-400/10 border border-teal-400/30">
                              <Receipt size={16} className="text-teal-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{exp.title}</p>
                              <p className="text-teal-100/40 text-xs mt-1">
                                Paid by you
                                {perPerson && ` · ₹${perPerson}/person`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-teal-400/15 text-teal-300">
                                {exp.splitType}
                              </span>
                              <span className="text-white text-sm font-bold w-16 text-right">
                                ₹{exp.amount.toLocaleString()}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                }
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
                      Settlements I Paid
                    </div>
                    {loading
                      ? [0, 1, 2].map((i) => <Skeleton key={`out-set-${i}`} className="h-20 rounded-2xl" />)
                      : myOutgoingSettlements.length === 0
                        ? <p className="text-teal-100/35 text-sm py-6 text-center">No outgoing settlements yet.</p>
                        : myOutgoingSettlements.map((s, i) => {
                            const receiverId = s.receiver?.id ?? s.receiver?.userId;
                            const isPending  = s.status === "pending";
                            const isActing   = actionLoading === s.id;

                            return (
                              <motion.div
                                key={`out-set-${s.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex items-center gap-4 rounded-2xl bg-teal-400/[0.07] border border-teal-400/25 p-4"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-teal-400/15 border border-teal-400/25 flex items-center justify-center shrink-0">
                                  <ArrowRightLeft size={16} className="text-teal-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Settlement</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isPending ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                                      {s.status}
                                    </span>
                                  </div>
                                  <p className="text-teal-50/85 text-sm">
                                    <span className="font-semibold text-white">You paid</span>
                                    <span className="font-semibold text-white"> {s.receiver?.name || receiverId}</span>
                                    {"  "}
                                    <span className="text-teal-400 font-bold">₹{parseFloat(s.amount).toFixed(0)}</span>
                                  </p>
                                </div>
                                {isPending && (
                                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 shrink-0">
                                    Awaiting
                                  </span>
                                )}
                              </motion.div>
                            );
                          })
                    }
                  </div>

                  <div className="space-y-4">
                    <div className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
                      Settlements Paid To Me
                    </div>
                    {loading
                      ? [0, 1, 2].map((i) => <Skeleton key={`in-set-${i}`} className="h-20 rounded-2xl" />)
                      : myIncomingSettlements.length === 0
                        ? <p className="text-teal-100/35 text-sm py-6 text-center">No incoming settlements yet.</p>
                        : myIncomingSettlements.map((s, i) => {
                            const payerId     = s.payer?.id ?? s.payer?.userId;
                            const receiverId  = s.receiver?.id ?? s.receiver?.userId;
                            const isPending   = s.status === "pending";
                            const isReceiver  = receiverId === currentUserId;
                            const isActing    = actionLoading === s.id;

                            return (
                              <motion.div
                                key={`in-set-${s.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex items-center gap-4 rounded-2xl bg-teal-400/[0.07] border border-teal-400/25 p-4"
                              >
                                <div className="w-11 h-11 rounded-2xl bg-teal-400/15 border border-teal-400/25 flex items-center justify-center shrink-0">
                                  <ArrowRightLeft size={16} className="text-teal-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Settlement</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isPending ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                                      {s.status}
                                    </span>
                                  </div>
                                  <p className="text-teal-50/85 text-sm">
                                    <span className="font-semibold text-white">You received from</span>
                                    <span className="font-semibold text-white"> {s.payer?.name || payerId}</span>
                                    {"  "}
                                    <span className="text-teal-400 font-bold">₹{parseFloat(s.amount).toFixed(0)}</span>
                                  </p>
                                </div>
                                {isReceiver && isPending && (
                                  <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleConfirm(s.id)}
                                    disabled={isActing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                  >
                                    {isActing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                    Confirm
                                  </motion.button>
                                )}
                              </motion.div>
                            );
                          })
                    }
                  </div>
                </div>
              </div>
            )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {!loading && suggested.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <h3 className="text-teal-100/40 text-[10px] font-bold tracking-widest uppercase">
              Suggested Settlements
            </h3>
            {suggested.map((s, i) => {
              const isMyDebt  = s.from === currentUserId;
              const actionKey = `${s.from}-${s.to}`;
              const isActing  = actionLoading === actionKey;
              const fromName  = balances.find((b) => b.userId === s.from)?.name || `User ${s.from}`;
              const toName    = balances.find((b) => b.userId === s.to)?.name   || `User ${s.to}`;

              // Check if the payer already initiated this settlement and it's awaiting confirmation
              const hasPendingSettlement = recentSettlements.some(
                (r) => r.payer?.id === s.from && r.receiver?.id === s.to && r.status === "pending"
              );

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-teal-400/15"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center shrink-0">
                    <ArrowRightLeft size={16} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-teal-100/40 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                      Suggested
                    </p>
                    <p className="text-teal-50/85 text-sm">
                      <span className="font-semibold text-white">{fromName}</span>
                      {" should pay "}
                      <span className="font-semibold text-white">{toName}</span>
                      {"  "}
                      <span className="text-teal-400 font-bold">₹{parseFloat(s.amount).toFixed(0)}</span>
                    </p>
                  </div>
                  {isMyDebt && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSettle(s)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400/20 border border-teal-400/40 text-teal-300 text-xs font-semibold hover:bg-teal-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isActing && <Loader2 size={12} className="animate-spin" />}
                      Pay
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Expense Modal ── */}
      <AnimatePresence>
        {showModal && (
          <AddExpenseModal
            tripId={tripId}
            members={members}
            onClose={() => setShowModal(false)}
            onSuccess={fetchAll}
            Avatar={Avatar}
          />
        )}
      </AnimatePresence>
    </>
  );
}