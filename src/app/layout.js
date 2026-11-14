import { Cinzel, Cinzel_Decorative, Crimson_Text } from "next/font/google";
import "./globals.css";
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

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-crimson-text",
  display: "swap",
});

export const metadata = {
  title: "Grimorium — Grimório Digital & Sala de Guerra",
  description:
    "Ficha de RPG d20 customizada e tática em tempo real: códice vivo para aventureiros e sala de guerra para mestres. 7 atributos, 19 perícias, combate tático, iniciativa ao vivo.",
  openGraph: {
    title: "Grimorium — Grimório Digital & Sala de Guerra",
    description: "A ficha de RPG d20 definitiva para mesas dark fantasy.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport = {
  themeColor: "#090b0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${cinzel.variable} ${cinzelDecorative.variable} ${crimsonText.variable}`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
