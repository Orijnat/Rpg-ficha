"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

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
      {children}
    </ReactLenis>
  );
}
