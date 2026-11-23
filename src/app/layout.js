import { Cinzel, Cinzel_Decorative, Cormorant_Garamond, Crimson_Text, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import AppProviders from "./providers";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel-decorative",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-codex",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-crimson-text",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Grimorium — Atlas de Campanha & Sala de Guerra",
  description:
    "Ficha de RPG d20 e tática em tempo real: um atlas de campanha para aventureiros e uma sala de guerra para mestres. 7 atributos, 19 perícias, mapa tático e iniciativa ao vivo.",
  icons: {
    icon: [{ url: "/astral.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/astral.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Grimorium — Atlas de Campanha & Sala de Guerra",
    description: "Fichas, NPCs e combate tático para mesas de RPG d20.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport = {
  themeColor: "#08171C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${cinzel.variable} ${cinzelDecorative.variable} ${cormorant.variable} ${crimsonText.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
