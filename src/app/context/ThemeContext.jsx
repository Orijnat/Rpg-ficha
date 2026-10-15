"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES } from "../../lib/themes";

export { THEMES };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("amber");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("rpg-sheet-theme");
        if (saved && THEMES.some((t) => t.id === saved)) {
          setCurrentTheme(saved);
          document.documentElement.setAttribute("data-theme", saved);
        } else {
          document.documentElement.setAttribute("data-theme", "amber");
        }
      } catch {
        // Fallback
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const changeTheme = (themeId) => {
    if (!THEMES.some((t) => t.id === themeId)) return;
    setCurrentTheme(themeId);
    try {
      window.localStorage.setItem("rpg-sheet-theme", themeId);
      document.documentElement.setAttribute("data-theme", themeId);
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
