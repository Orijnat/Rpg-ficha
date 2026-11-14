"use client";

import { AuthProvider } from "./context/AuthContext";
import { CharacterProvider } from "./context/CharacterContext";
import { DiceProvider } from "./context/DiceContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "../layouts/AppShell";
import SmoothScroll from "../components/SmoothScroll";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CharacterProvider>
          <DiceProvider>
            <SmoothScroll>
              <AppShell>{children}</AppShell>
            </SmoothScroll>
          </DiceProvider>
        </CharacterProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
