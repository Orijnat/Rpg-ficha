"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { THEMES } from "../../lib/themes";

export { THEMES };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("rpg-sheet-theme");
        if (saved && THEMES.some((t) => t.id === saved)) {
          return saved;
        }
      } catch {
        // Fallback
      }
    }
    return "amber";
  });
  const pathname = usePathname();

  // Controla o atributo data-theme no documentElement conforme a rota
  useEffect(() => {
    // A tela inicial ("/") sempre mantém a identidade canônica "amber" e nunca sofre alteração de estilo
    if (pathname === "/") {
      document.documentElement.setAttribute("data-theme", "amber");
    } else {
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  }, [pathname, currentTheme]);

  const changeTheme = (themeId) => {
    if (!THEMES.some((t) => t.id === themeId)) return;
    setCurrentTheme(themeId);
    try {
      window.localStorage.setItem("rpg-sheet-theme", themeId);
      if (pathname !== "/") {
        document.documentElement.setAttribute("data-theme", themeId);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme: changeTheme,
        themes: THEMES,
        activeThemeObj: THEMES.find((t) => t.id === currentTheme) || THEMES[0],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser utilizado dentro de um ThemeProvider");
  }
  return ctx;
}
