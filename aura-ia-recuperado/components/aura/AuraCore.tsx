"use client";
import { useEffect, useRef } from "react";
export type AuraState =
  "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "PROCESSING";
export default function AuraCore({
  state = "IDLE",
  level = 0,
  motion = true,
  className = "",
}: {
  state?: AuraState;
  level?: number;
  motion?: boolean;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ state, level, motion });
  live.current = { state, level, motion };
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;
    let raf = 0,
      w = 500,
      h = 500,
      t = 0,
      last = 0,
      mx = 0,
      my = 0,
      tx = 0,
      ty = 0,
      energy = 0,
      slow = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let low = innerWidth < 700 || navigator.hardwareConcurrency < 5;
    let visible = true,
      dirty = true,
      previousState = "";
    const resize = new ResizeObserver(([r]) => {
      dirty = true;
      w = r.contentRect.width;
      h = r.contentRect.height;
      const d = Math.min(devicePixelRatio, 1.7);
      el.width = w * d;
      el.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    });
    resize.observe(el);
    const move = (e: PointerEvent) => {
      if (reduced.matches || !live.current.motion) return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - r.left - w / 2) / w));
      ty = Math.max(-1, Math.min(1, (e.clientY - r.top - h / 2) / h));
    };
    window.addEventListener("pointermove", move, { passive: true });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirty = true;
    });
    observer.observe(el);
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(now - last || 16, 50);
      last = now;
      if (document.hidden || !visible) return;
      const frozen = reduced.matches || !live.current.motion;
      if (frozen && !dirty && previousState === live.current.state) return;
      dirty = false;
      previousState = live.current.state;
      if (dt > 25) slow++;
      if (slow > 100) low = true;
      t += frozen ? 0 : dt * 0.00013;
      if (!frozen) {
        mx += (tx - mx) * 0.035;
        my += (ty - my) * 0.035;
      } else {
        mx = 0;
        my = 0;
      }
      const s = live.current.state;
      energy +=
        ((s === "LISTENING" || s === "SPEAKING"
          ? live.current.level
          : s === "THINKING"
            ? 0.28
            : s === "PROCESSING"
              ? 0.45
              : 0) -
          energy) *
        0.07;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + mx * 10,
        cy = h / 2 + my * 10;
      const radius =
        Math.min(w, h) * 0.292 * (1 + Math.sin(t * 2) * 0.016 + energy * 0.1);
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.3,
        cx,
        cy,
        radius * 1.65,
      );
      glow.addColorStop(0, "rgba(83,38,115,0.03)");
      glow.addColorStop(0.6, "rgba(135,76,210,0.09)");
      glow.addColorStop(0.79, "rgba(167,95,235,0.12)");
      glow.addColorStop(1, "rgba(70,35,90,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const rings = low ? 25 : 43;
      const steps = low ? 150 : 220;
      for (let j = 0; j < rings; j++) {
        const k = j / rings;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const wave =
            Math.sin(a * 3 + t * 2 + k * 8) * 0.038 +
            Math.sin(a * 7 - t * 1.3 + k * 13) * 0.013 +
            Math.sin(a * 2 + t + k * 3) * 0.017;
          const rr = radius * (0.86 + k * 0.22 + wave * (1 + energy));
          const x =
            cx +
            Math.cos(a) * rr +
            Math.sin(a * 2 + t + k * 8) * radius * 0.025;
          const y =
            cy +
            Math.sin(a) * rr * 0.93 +
            Math.cos(a * 3 + t + k * 6) * radius * 0.025;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.lineWidth = j % 5 === 0 ? 1.2 : 0.55;
        ctx.strokeStyle = `hsla(${265 + k * 30 + Math.sin(t) * 5},78%,${55 + k * 24}%,${0.1 + Math.sin(k * Math.PI) * 0.22})`;
        ctx.stroke();
      }
      const count = low ? 100 : 210;
      for (let i = 0; i < count; i++) {
        const a = i * 2.39996 + t * (s === "THINKING" ? 1.4 : 0.22);
        const r = radius * (0.65 + (Math.sin(i * 73.13) * 0.5 + 0.5) * 0.8);
        const z = Math.sin(a * 2 + t + i);
        const x = cx + Math.cos(a) * r,
          y = cy + Math.sin(a) * r * 0.92;
        ctx.fillStyle = `rgba(${175 + (i % 70)},${140 + (i % 60)},255,${0.1 + (z + 1) * 0.22})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 17 === 0 ? 1.5 : 0.65, 0, 7);
        ctx.fill();
      }
      for (let j = 0; j < 6; j++) {
        const a = t * 0.32 + j * 1.047;
        ctx.beginPath();
        ctx.fillStyle = "rgba(225,200,255,.9)";
        ctx.shadowColor = "#bda0ff";
        ctx.shadowBlur = 12;
        ctx.arc(
          cx + Math.cos(a) * radius * (1.1 + j * 0.028),
          cy + Math.sin(a) * radius * 0.95,
          1.5,
          0,
          7,
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div className={`aura-core ${className}`} data-state={state}>
      <canvas ref={canvas} aria-hidden="true" />
      <span className="sr-only">Aura {state.toLowerCase()}</span>
    </div>
  );
}
