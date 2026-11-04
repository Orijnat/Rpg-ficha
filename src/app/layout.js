"use client";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CharacterProvider } from "./context/CharacterContext";
import { DiceProvider } from "./context/DiceContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "../layouts/AppShell";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <ThemeProvider>
            <CharacterProvider>
              <DiceProvider>
                <AppShell>{children}</AppShell>
              </DiceProvider>
            </CharacterProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
