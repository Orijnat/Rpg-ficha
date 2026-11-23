"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/**
 * Cenário compartilhado das telas de autenticação:
 * Carta náutica em azul-petróleo com anel de astrolábio gigante atrás do cartão.
 * Animação de entrada com GSAP (respeita reduced-motion).
 */
export default function AuthScaffold({ children }) {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".auth-shell-emblem", { scale: 0.55, opacity: 0, duration: 1.15, ease: "back.out(1.7)" })
        .from(".auth-shell-card", { y: 36, opacity: 0, duration: 0.95 }, "-=0.75");
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative w-full">
      {/* Camada de fundo viva */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(70% 55% at 50% 0%, var(--theme-glow-1), transparent 60%)",
              "radial-gradient(55% 50% at 8% 90%, var(--theme-glow-2), transparent 55%)",
              "radial-gradient(55% 50% at 92% 85%, var(--theme-glow-3), transparent 55%)",
            ].join(","),
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--primary) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--primary) 4%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 50% 42%, transparent 30%, color-mix(in srgb, var(--theme-bg) 88%, transparent) 78%, var(--theme-bg) 100%)",
          }}
        />
        {/* Astrolábio colossal girando atrás do cartão */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className="h-[125vmin] w-[125vmin] animate-[spin_120s_linear_infinite] text-[var(--theme-accent)] motion-reduce:animate-none"
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="194" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="1 7" />
            <circle cx="200" cy="200" r="168" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <circle cx="200" cy="200" r="136" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="3 9" />
            <g stroke="currentColor" strokeOpacity="0.06" strokeWidth="1">
              <path d="M200 32 L368 200 L200 368 L32 200 Z" />
              <path d="M32 32 L368 368 M368 32 L32 368" />
            </g>
            <g fill="currentColor" fillOpacity="0.07">
              <path d="M200 32 L208 190 L200 200 L192 190 Z" />
              <path d="M200 368 L192 210 L200 200 L208 210 Z" />
              <path d="M32 200 L190 192 L200 200 L190 208 Z" />
              <path d="M368 200 L210 208 L200 200 L210 192 Z" />
            </g>
            <circle cx="200" cy="200" r="7" stroke="currentColor" strokeOpacity="0.14" />
          </svg>
        </div>
        {/* Textura de papel de desenho técnico */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE_TEXTURE }}
        />
      </div>

      {/* Cartão */}
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
