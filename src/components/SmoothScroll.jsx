"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/**
 * Scroll suave global via Lenis.
 * Desativa automaticamente quando o usuário pede menos animação (prefers-reduced-motion).
 */
export default function SmoothScroll({ children }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: true,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
