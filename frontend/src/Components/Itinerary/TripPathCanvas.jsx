import { useEffect, useRef, useState, useCallback } from "react";

// ─── Trip Path Canvas (Snake layout) ─────────────────────────────────────────

const NODES_PER_ROW = 5;
const NODE_HALF = 9;         // half-side of the diamond square
const CURRENT_HALF = 13;
const ROW_GAP = 76;
const SIDE_PAD = 48;

function computeSnakePoints(W, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / NODES_PER_ROW);
    const posInRow = i % NODES_PER_ROW;
    const colCount = Math.min(NODES_PER_ROW, n - row * NODES_PER_ROW);
    const isRTL = row % 2 === 1;
    const spacing = colCount > 1 ? (W - SIDE_PAD * 2) / (colCount - 1) : 0;
    const col = isRTL ? colCount - 1 - posInRow : posInRow;
    const x = colCount > 1 ? SIDE_PAD + col * spacing : W / 2;
    const y = ROW_GAP / 2 + row * ROW_GAP;
    pts.push({ x, y });
  }
  return pts;
}
export default function TripPathCanvas({ days, currentDayIndex }) {
  const canvasRef = useRef(null);
  const n = days.length;
  const rowCount = Math.ceil(n / NODES_PER_ROW);
  const canvasHeight = Math.max(100, rowCount * ROW_GAP + 36);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !n) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pts = computeSnakePoints(W, n);

    // ── Path segments ──────────────────────────────────────────────────────
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      const segIsPast     = i < currentDayIndex;
      const segIsOncoming = i === currentDayIndex - 1 || i === currentDayIndex;

      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 7]);
      ctx.strokeStyle = segIsPast
        ? "rgba(45,212,191,0.55)"
        : segIsOncoming
        ? "rgba(251,191,36,0.65)"
        : "rgba(148,163,184,0.45)"; // future path — clearly visible

      const sameRow = Math.floor(i / NODES_PER_ROW) === Math.floor((i + 1) / NODES_PER_ROW);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);

      if (sameRow) {
        // straight horizontal line within a row
        ctx.lineTo(p2.x, p2.y);
      } else {
        // smooth S-bend going to next row
        const cy1 = p1.y + ROW_GAP * 0.6;
        const cy2 = p2.y - ROW_GAP * 0.6;
        ctx.bezierCurveTo(p1.x, cy1, p2.x, cy2, p2.x, p2.y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ── Nodes (diamonds) ──────────────────────────────────────────────────
    pts.forEach((p, i) => {
      const isPast    = i < currentDayIndex;
      const isCurrent = i === currentDayIndex;
      const half      = isCurrent ? CURRENT_HALF : NODE_HALF;

      // Ambient glow for current
      if (isCurrent) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, half * 3);
        grad.addColorStop(0, "rgba(251,191,36,0.28)");
        grad.addColorStop(1, "rgba(251,191,36,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, half * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Diamond via rotated rect
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      const s = half * 1.42; // side = half * sqrt(2)
      ctx.beginPath();
      ctx.rect(-s / 2, -s / 2, s, s);

      if (isCurrent) {
        ctx.fillStyle   = "rgba(251,191,36,1)";       // bright amber — most prominent
        ctx.strokeStyle = "rgba(255,230,120,0.80)";
        ctx.lineWidth   = 2.5;
      } else if (isPast) {
        ctx.fillStyle   = "rgba(45,212,191,0.60)";    // teal, slightly dimmer vs current
        ctx.strokeStyle = "rgba(45,212,191,0.35)";
        ctx.lineWidth   = 1.5;
      } else {
        ctx.fillStyle   = "rgba(148,163,184,0.18)";   // light slate fill — visible but calm
        ctx.strokeStyle = "rgba(148,163,184,0.75)";   // bright border so diamond reads clearly
        ctx.lineWidth   = 1.8;
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner detail
      if (isPast) {
        // checkmark
        ctx.save();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth   = 1.8;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        const sc = half * 0.38;
        ctx.beginPath();
        ctx.moveTo(p.x - sc, p.y + sc * 0.1);
        ctx.lineTo(p.x - sc * 0.15, p.y + sc * 0.9);
        ctx.lineTo(p.x + sc, p.y - sc * 0.6);
        ctx.stroke();
        ctx.restore();
      } else if (isCurrent) {
        // pulsing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
      } else {
        // bright center dot for upcoming days
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148,163,184,0.75)";
        ctx.fill();
      }

      // Label: day number + date
      // Alternate above/below per row to avoid clash with path
      const row       = Math.floor(i / NODES_PER_ROW);
      const labelAbove = row % 2 === 0;
      const numY  = labelAbove ? p.y - half - 11 : p.y + half + 14;
      const dateY = labelAbove ? numY - 11         : numY + 11;

      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      ctx.font      = `bold ${isCurrent ? 11 : 9}px ui-monospace, monospace`;
      ctx.fillStyle = isCurrent
        ? "rgba(251,191,36,0.95)"
        : isPast
        ? "rgba(45,212,191,0.70)"
        : "rgba(148,163,184,0.85)";   // future — bright and legible
      ctx.fillText(String(i + 1), p.x, numY);

      if (days[i]?.date) {
        ctx.font      = `${isCurrent ? 9 : 7.5}px sans-serif`;
        ctx.fillStyle = isCurrent
          ? "rgba(251,191,36,0.60)"
          : isPast
          ? "rgba(45,212,191,0.45)"
          : "rgba(148,163,184,0.60)";  // future date — visible
        ctx.fillText(formatDateShort(days[i].date), p.x, dateY);
      }
    });
  }, [days, currentDayIndex, n]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
    return () => ro.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: canvasHeight }} />;
}