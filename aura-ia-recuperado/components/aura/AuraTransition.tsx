"use client";
import { useEffect, useRef, useState } from "react";

const TRAVEL = 4600;
const DURATION = 6400;
const phrases = [
  "Toda grande ideia começa com uma pergunta.",
  "Um prompt abre novos caminhos.",
  "Dê forma ao que você imagina.",
  "Seja bem-vindo à AURA.",
];
/** Two finite phases: travel through a tunnel, then assemble Aura from particles. */
export default function AuraTransition({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const [stage, setStage] = useState<"tunnel" | "arrival">("tunnel");
  const [phrase, setPhrase] = useState(0);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) {
      callback.current();
      return;
    }
    let finished = false,
      frame = 0,
      width = innerWidth,
      height = innerHeight;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const complete = () => {
      if (!finished) {
        finished = true;
        callback.current();
      }
    };
    if (reduced.matches) {
      complete();
      return;
    }
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      el.width = width * ratio;
      el.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const motionChange = () => {
      if (reduced.matches) complete();
    };
    reduced.addEventListener("change", motionChange);
    const start = performance.now();
    let arrived = false,
      lastPhrase = 0;
    // Completion never depends on requestAnimationFrame running in a background tab.
    const fallback = setTimeout(complete, DURATION + 150);
    const particles = Array.from({ length: 150 }, (_, i) => ({
      angle: i * 2.399963,
      radius: 0.15 + ((i * 73) % 101) / 101,
      depth: ((i * 37) % 97) / 97,
    }));
    const draw = (now: number) => {
      if (finished) return;
      const elapsed = now - start;
      const nextPhrase =
        elapsed < 1600 ? 0 : elapsed < 3100 ? 1 : elapsed < TRAVEL ? 2 : 3;
      if (nextPhrase !== lastPhrase) {
        lastPhrase = nextPhrase;
        setPhrase(nextPhrase);
      }
      if (elapsed >= DURATION) {
        complete();
        return;
      }
      const cx = width / 2,
        cy = height / 2,
        extent = Math.hypot(width, height) * 0.58;
      ctx.fillStyle = "#0d0915";
      ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.min(width, height) * 0.7,
      );
      glow.addColorStop(0, "#63309944");
      glow.addColorStop(0.5, "#341b552b");
      glow.addColorStop(1, "#0d091500");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      if (elapsed < TRAVEL) {
        const p = elapsed / TRAVEL,
          speed = p * p * 2.2;
        // Perspective rings keep the center open, like a curved passage through space.
        for (let ring = 23; ring >= 0; ring--) {
          const depth = (ring / 24 + 1 - (speed % 1)) % 1;
          const radius = 20 + Math.pow(depth, 2.4) * extent * 1.25;
          const twist = p * 1.4 + depth * 1.6;
          const ox = Math.sin(depth * 4 + p) * width * 0.045 * depth,
            oy = Math.cos(depth * 3 + p) * height * 0.045 * depth;
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const ripple = 1 + Math.sin(angle * 3 + twist) * 0.045;
            const x = cx + ox + Math.cos(angle + twist) * radius * ripple,
              y = cy + oy + Math.sin(angle + twist) * radius * 0.8 * ripple;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.lineWidth = 0.6 + depth * 1.4;
          ctx.strokeStyle = `hsla(${265 + depth * 25},75%,${58 + depth * 20}%,${(0.12 + depth * 0.45) * Math.min(1, (1 - p) * 6)})`;
          ctx.stroke();
        }
        particles.forEach((particle, index) => {
          const depth = (particle.depth + speed * 0.65) % 1,
            r = 30 + depth * depth * extent;
          const angle = particle.angle + p * 0.22,
            length = 2 + depth * depth * (18 + p * 80);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.85);
          ctx.lineTo(
            cx + Math.cos(angle) * (r + length),
            cy + Math.sin(angle) * (r + length) * 0.85,
          );
          ctx.strokeStyle = `rgba(210,180,255,${0.12 + depth * 0.5})`;
          ctx.lineWidth = index % 7 === 0 ? 1.3 : 0.65;
          ctx.stroke();
        });
      } else {
        if (!arrived) {
          arrived = true;
          setStage("arrival");
        }
        const p = (elapsed - TRAVEL) / (DURATION - TRAVEL),
          ease = 1 - Math.pow(1 - p, 3),
          radius = Math.min(width, height) * 0.17;
        particles.forEach((particle, index) => {
          const angle = particle.angle + (1 - ease) * 2;
          const target = radius * (0.85 + particle.radius * 0.23),
            r = target + (1 - ease) * extent * (0.2 + particle.radius);
          const x = cx + Math.cos(angle) * r,
            y = cy + Math.sin(angle) * r * 0.93;
          ctx.beginPath();
          ctx.arc(x, y, index % 9 === 0 ? 1.7 : 0.85, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(213,183,255,${0.35 + ease * 0.5})`;
          ctx.fill();
        });
        for (let ring = 0; ring < 19; ring++) {
          ctx.beginPath();
          const k = ring / 19;
          for (let i = 0; i <= 100; i++) {
            const a = (i / 100) * Math.PI * 2;
            const r =
              radius * (0.87 + k * 0.24 + Math.sin(a * 3 + k * 8 + p) * 0.035);
            const x = cx + Math.cos(a) * r,
              y = cy + Math.sin(a) * r * 0.93;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.strokeStyle = `hsla(${270 + k * 25},80%,75%,${ease * (0.12 + Math.sin(k * Math.PI) * 0.25)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      finished = true;
      clearTimeout(fallback);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", motionChange);
    };
  }, []);
  return (
    <div className="aura-transition" data-phase={stage}>
      <canvas ref={canvas} aria-hidden="true" />
      <button className="transition-skip" onClick={() => callback.current()}>
        Pular animação
      </button>
      <div
        className={`transition-caption transition-phrase-${phrase}`}
        role="status"
      >
        <span className="eyebrow">
          {stage === "tunnel"
            ? "DA IMAGINAÇÃO À CRIAÇÃO"
            : "SEU PRÓXIMO PROJETO COMEÇA AQUI"}
        </span>
        <p key={phrase}>{phrases[phrase]}</p>
      </div>
    </div>
  );
}
