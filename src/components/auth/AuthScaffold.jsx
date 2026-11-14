"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Aurora from "../react-bits/Aurora";

const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/**
 * Cenário compartilhado das telas de autenticação:
 * Aurora arcana viva (WebGL) + vinheta cinematográfica + anel de runas gigante
 * girando atrás do cartão. Animação de entrada com GSAP (respeita reduced-motion).
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Aurora
          colorStops={["#d89b38", "#7a3a12", "#4a2a8a"]}
          amplitude={1.1}
          blend={0.6}
          speed={0.45}
          height={0.95}
          scale={1.08}
          glow={0.8}
          brightness={0.95}
          layers={2}
          direction="top"
          opacity={0.65}
          mouseInteraction
          intro
        />
        {/* Vinheta para manter a leitura do cartão */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 50% 42%, transparent 30%, rgba(4,5,8,0.66) 72%, rgba(3,4,7,0.93) 100%)",
          }}
        />
        {/* Anel de runas colossal girando atrás do cartão */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className="h-[125vmin] w-[125vmin] animate-[spin_90s_linear_infinite] text-[#d69a3d]"
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="192" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="2 10" />
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
            <path id="authRuneRing" d="M 200,200 m -171,0 a 171,171 0 1,1 342,0 a 171,171 0 1,1 -342,0" />
            <text
              fontSize="14"
              letterSpacing="12"
              className="fill-[#d69a3d]/15"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              <textPath href="#authRuneRing">
                ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛈ ᛇ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛈ ᛇ ᛉ
              </textPath>
            </text>
          </svg>
        </div>
        {/* Textura de pergaminho sutil */}
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
