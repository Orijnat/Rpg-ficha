"use client";

import { useEffect, useRef } from "react";

/**
 * Partículas de brasas flutuantes (embers) subindo pela lateral do mapa.
 * Respeita prefers-reduced-motion (desativado).
 */
export default function EmberCanvas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return undefined; // reduzido: sem animação

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = Math.max(1, Math.floor(rect?.width || 600));
      height = Math.max(1, Math.floor(rect?.height || 600));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ~70 brasas grandes e lentas
    const embers = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      vy: 0.00035 + Math.random() * 0.0009,
      vx: (Math.random() - 0.5) * 0.0003,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      alpha: 0.35 + Math.random() * 0.55,
    }));

    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      for (const e of embers) {
        e.y -= e.vy * e.speed;
        e.x += e.vx * e.speed + Math.sin((frame / 120) * e.speed + e.phase) * 0.0006;
        if (e.y < -0.02) {
          e.y = 1.02;
          e.x = Math.random();
        }
        const wobble = 0.75 + Math.sin(frame / 26 + e.phase) * 0.25;
        const px = e.x * width;
        const py = e.y * height;
        const radius = e.r * (1 + wobble * 0.35);
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius * 3.2);
        gradient.addColorStop(0, `rgba(255, 214, 130, ${e.alpha * wobble})`);
        gradient.addColorStop(0.35, `rgba(230, 140, 60, ${e.alpha * 0.7 * wobble})`);
        gradient.addColorStop(1, "rgba(120, 40, 10, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, radius * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
