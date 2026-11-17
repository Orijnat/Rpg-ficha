"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

/**
 * O Lenis mede o limite de scroll (altura do documento − altura da janela) na montagem.
 * O app renderiza conteúdo dinamicamente (hidratação, fontes, listas que crescem),
 * então o limite ficava menor que a página real e a rolagem parava antes do fim.
 * Este componente força uma nova medição na montagem, a cada troca de rota e no load.
 */
function ResizeNudge() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return undefined;
    const bump = () => lenis.resize();
    bump();
    const raf = requestAnimationFrame(bump);
    const later = window.setTimeout(bump, 400);
    window.addEventListener("load", bump);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(later);
      window.removeEventListener("load", bump);
    };
  }, [lenis, pathname]);

  return null;
}

/**
 * Scroll suave global via Lenis.
 * Desativa a suavização quando o usuário pede menos animação (prefers-reduced-motion),
 * mantendo o componente sempre montado para não remontar a árvore.
 */
export default function SmoothScroll({ children }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: enabled ? 0.09 : 1,
        smoothWheel: enabled,
        anchors: enabled,
      }}
    >
      <ResizeNudge />
      {children}
    </ReactLenis>
  );
}
