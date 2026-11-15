"use client";

import { useCallback, useState } from "react";

/**
 * Gerenciador de janelas flutuantes: z-order, posição, tamanho, minimizar.
 * Estado efêmero (não persistido) por sessão de uso.
 */
export function useWindowManager() {
  const [windows, setWindows] = useState({});
  const [zCounter, setZCounter] = useState(30);

  const focusWindow = useCallback((id) => {
    setZCounter((z) => {
      const next = z + 1;
      setWindows((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], z: next } } : prev));
      return next;
    });
  }, []);

  const openWindow = useCallback((id, defaults = {}) => {
    setZCounter((z) => {
      const next = z + 1;
      setWindows((prev) => {
        const current = prev[id];
        if (current) {
          return { ...prev, [id]: { ...current, minimized: false, z: next } };
        }
        const viewport = typeof window !== "undefined" ? window.innerWidth : 1200;
        const count = Object.keys(prev).length;
        const w = defaults.w ?? 440;
        return {
          ...prev,
          [id]: {
            x: Math.max(16, Math.min(viewport - w - 16, 96 + count * 40)),
            y: 76 + count * 44,
            w,
            h: defaults.h ?? 540,
            z: next,
            minimized: false,
          },
        };
      });
      return next;
    });
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggleMinimize = useCallback((id) => {
    setWindows((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], minimized: !prev[id].minimized } } : prev));
  }, []);

  const moveWindow = useCallback((id, x, y) => {
    setWindows((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], x, y } } : prev));
  }, []);

  const resizeWindow = useCallback((id, w, h) => {
    setWindows((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], w, h } } : prev));
  }, []);

  return { windows, openWindow, closeWindow, toggleMinimize, focusWindow, moveWindow, resizeWindow };
}
