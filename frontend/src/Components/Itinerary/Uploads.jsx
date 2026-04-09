import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Image, FileSpreadsheet, File, Download, Trash2, CloudUpload, Loader2, AlertCircle, X } from "lucide-react";
import { getDocuments, uploadDocument, deleteDocument, getDocumentById } from "../Trip/TripAPI";

// ─── helpers ────────────────────────────────────────────────────────────────

const inferType = (name = "") => {
  if (!name) return "doc";
  if (name.match(/\.pdf$/i)) return "pdf";
  if (name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return "image";
  if (name.match(/\.(xlsx|xls|csv)$/i)) return "sheet";
  return "doc";
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (raw) => {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return raw;
  }
};

const TYPE_CONFIG = {
  pdf:   { Icon: FileText,        bg: "bg-red-400/10",     border: "border-red-400/30",     text: "text-red-400"     },
  image: { Icon: Image,           bg: "bg-emerald-400/10", border: "border-emerald-400/30", text: "text-emerald-400" },
  sheet: { Icon: FileSpreadsheet, bg: "bg-green-400/10",   border: "border-green-400/30",   text: "text-green-400"   },
  doc:   { Icon: File,            bg: "bg-blue-400/10",    border: "border-blue-400/30",    text: "text-blue-400"    },
};

const rowVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.28 } }),
  exit:    { opacity: 0, x: -20, transition: { duration: 0.18 } },
};

// ─── Upload Title Modal ───────────────────────────────────────────────────────

function UploadModal({ file, onConfirm, onCancel, uploading }) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched]         = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const titleValid = title.trim().length > 0;
  const descValid  = description.trim().length > 0;
  const isValid    = titleValid && descValid;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm(title.trim(), description.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onCancel(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm mx-4 rounded-2xl bg-[#0d1f1e] border border-teal-400/20 shadow-2xl shadow-black/70 p-6"
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-base">Name your document</h3>
            <p className="text-teal-100/40 text-xs mt-0.5 truncate max-w-[220px]">{file.name}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-400/50
                       hover:text-teal-400 hover:bg-teal-400/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>

        {/* title input */}
        <div className="mb-5">
          <label className="text-teal-400 text-[10px] font-bold tracking-[0.1em] uppercase block mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape" && !uploading) onCancel(); }}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Hotel Booking Confirmation"
            className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-white text-sm
                       placeholder:text-teal-100/25 outline-none transition-colors
                       ${touched && !isValid
                         ? "border-red-400/50 focus:border-red-400"
                         : "border-teal-400/20 focus:border-teal-400/50"
                       }`}
          />
          <AnimatePresence>
            {touched && !isValid && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-1.5"
              >
                Title is required
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* description input */}
        <div className="mb-5">
          <label className="text-teal-400 text-[10px] font-bold tracking-[0.1em] uppercase block mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape" && !uploading) onCancel(); }}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Confirmed booking for 2 nights at Hotel Madurai"
            className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-white text-sm
                       placeholder:text-teal-100/25 outline-none transition-colors resize-none
                       ${touched && !descValid
                         ? "border-red-400/50 focus:border-red-400"
                         : "border-teal-400/20 focus:border-teal-400/50"
                       }`}
          />
          <AnimatePresence>
            {touched && !descValid && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-1.5"
              >
                Description is required
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 py-2 rounded-xl border border-teal-400/20 text-teal-300/60 text-sm font-semibold
                       hover:border-teal-400/40 hover:text-teal-300 transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 py-2 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-400 text-sm font-semibold
                       hover:bg-teal-400/25 transition-colors cursor-pointer flex items-center justify-center gap-2
                       disabled:opacity-60"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirmation Popover ─────────────────────────────────────────────

function DeletePopover({ fileName, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -6 }}
      transition={{ duration: 0.16 }}
      className="absolute right-0 top-12 z-50 w-64 rounded-xl bg-[#0f1f1e] border border-red-400/25
                 shadow-2xl shadow-black/60 p-4"
    >
      <div className="flex items-start gap-2.5 mb-3">
        <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
        <p className="text-white/80 text-xs leading-relaxed">
          Delete <span className="text-white font-semibold break-all">{fileName}</span>? This cannot be undone.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-1.5 rounded-lg border border-teal-400/25 text-teal-300/70 text-xs font-semibold
                     hover:border-teal-400/50 hover:text-teal-300 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-400 text-xs font-semibold
                     hover:bg-red-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : null}
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// ─── File Row ────────────────────────────────────────────────────────────────

function FileRow({ file, index, onDelete }) {
  const [showPopover, setShowPopover] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [downloading, setDownloading] = useState(false);
  const rowRef = useRef(null);

  const displayName = file.title || file.name || file.fileName || file.originalName || "Unnamed file";
  const fileName    = file.name || file.fileName || file.originalName || displayName;
  const type        = inferType(fileName);
  const cfg         = TYPE_CONFIG[type] || TYPE_CONFIG.doc;
  const Icon        = cfg.Icon;
  const uploader    = file.uploadedBy || file.uploader || file.uploaderName || "Member";
  const dateStr     = formatDate(file.uploadedAt || file.createdAt || file.date);
  const sizeStr     = formatSize(file.size || file.fileSize);

  useEffect(() => {
    if (!showPopover) return;
    const handler = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) setShowPopover(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopover]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const doc = await getDocumentById(file.id || file._id);
      const fileUrl = doc.fileUrl || doc.url;
      if (!fileUrl) throw new Error("No fileUrl in response");
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(file.id || file._id);
      onDelete(file.id || file._id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
      setShowPopover(false);
    }
  };

  return (
    <motion.div
      ref={rowRef}
      key={file.id || file._id}
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="relative flex items-center gap-4 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-teal-400/10
                 hover:border-teal-400/20 transition-colors"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
        <Icon size={17} className={cfg.text} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{displayName}</p>
        <p className="text-teal-100/40 text-xs mt-0.5">
          {sizeStr !== "—" ? `${sizeStr} · ` : ""}
          Uploaded by <span className="text-teal-300/60">{uploader}</span> · {dateStr}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={handleDownload}
          disabled={downloading}
          title="Download"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-400/10 border border-teal-400/25
                     text-teal-400/70 hover:text-teal-400 cursor-pointer transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setShowPopover((v) => !v)}
          title="Delete"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-400/10 border border-red-400/25
                     text-red-400/70 hover:text-red-400 cursor-pointer transition-colors"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showPopover && (
          <DeletePopover
            fileName={displayName}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowPopover(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Uploads() {
  const PARAMS = useParams();
  const tripId = PARAMS.tripId;

  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  // pendingFile: the File object waiting for a title — null means modal is closed
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!tripId) return;
    fetchDocs();
  }, [tripId]);

  const fetchDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments(tripId);
      setFiles(Array.isArray(data) ? data : data.documents ?? data.files ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilePicked = (file) => {
    if (!file) return;
    setPendingFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFilePicked(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFilePicked(file);
  };

  // Triggered by modal after user provides a valid title + description
  const handleModalConfirm = async (title, description) => {
    if (!pendingFile || uploading) return;
    setUploading(true);
    try {
      const res = await uploadDocument(tripId, pendingFile, title, description);
      const newDoc = res.doc || res;
      setFiles((prev) => [newDoc, ...prev]);
      setPendingFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => (f.id || f._id) !== id));
  };

  return (
    <div className="p-8 h-full overflow-y-auto text-white">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-teal-400 text-[10px] font-bold tracking-[0.12em] uppercase block mb-1.5">Uploads</span>
          <h2 className="text-2xl font-bold text-white mb-1">Shared Files</h2>
          <p className="text-teal-100/50 text-sm">
            {loading ? "Loading…" : `${files.length} file${files.length !== 1 ? "s" : ""} shared by trip members`}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-400/15 border border-teal-400/40
                     text-teal-400 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-opacity"
        >
          <Upload size={14} />
          Upload File
        </motion.button>

        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
      </div>

      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        animate={{
          borderColor: dragging ? "rgba(45,212,191,0.6)" : "rgba(45,212,191,0.22)",
          backgroundColor: dragging ? "rgba(45,212,191,0.08)" : "rgba(45,212,191,0.03)",
        }}
        transition={{ duration: 0.2 }}
        className="mb-7 rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-2 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-2xl bg-teal-400/10 border border-teal-400/25 flex items-center justify-center mb-1">
          <CloudUpload size={22} className="text-teal-400/60" />
        </div>
        <span className="text-teal-50/75 text-sm font-semibold">Drag & drop or click to upload</span>
        <span className="text-teal-100/35 text-xs">PDF, Images, Docs supported</span>
      </motion.div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-teal-400/60" />
          <p className="text-teal-100/40 text-sm">Fetching documents…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle size={28} className="text-red-400/60" />
          <p className="text-red-300/60 text-sm">{error}</p>
          <button
            onClick={fetchDocs}
            className="mt-1 text-xs text-teal-400/70 hover:text-teal-400 underline cursor-pointer transition-colors"
          >
            Try again
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <CloudUpload size={36} className="text-teal-400/20 mb-1" />
          <p className="text-teal-100/40 text-sm font-medium">No files yet</p>
          <p className="text-teal-100/25 text-xs">Upload the first document for this trip</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence>
            {files.map((file, i) => (
              <FileRow
                key={file.id || file._id || i}
                file={file}
                index={i}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Title Modal — rendered at root level so it overlays everything */}
      <AnimatePresence>
        {pendingFile && (
          <UploadModal
            file={pendingFile}
            onConfirm={handleModalConfirm}
            onCancel={() => setPendingFile(null)}
            uploading={uploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}