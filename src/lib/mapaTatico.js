import {
  Shield,
  ShieldCheck,
  Sword,
  Swords,
  Axe,
  Wand,
  Crown,
  Skull,
  Ghost,
  Flame,
  Zap,
  Heart,
  Star,
  Eye,
  Cat,
  Sparkles,
  Gem,
  Bug,
  Bird,
  PawPrint,
  FlaskConical,
  Moon,
  Anchor,
  Hammer,
} from "lucide-react";

export const TOKEN_ICONS = {
  shield: Shield,
  shieldCheck: ShieldCheck,
  sword: Sword,
  swords: Swords,
  axe: Axe,
  wand: Wand,
  crown: Crown,
  skull: Skull,
  ghost: Ghost,
  flame: Flame,
  zap: Zap,
  heart: Heart,
  star: Star,
  eye: Eye,
  cat: Cat,
  sparkles: Sparkles,
  gem: Gem,
  bug: Bug,
  bird: Bird,
  paw: PawPrint,
  flask: FlaskConical,
  moon: Moon,
  anchor: Anchor,
  hammer: Hammer,
};

export const ICON_OPTIONS = Object.keys(TOKEN_ICONS);

export const ICONES_BACKEND_KEYS = [
  "shield", "shieldCheck", "sword", "swords", "axe", "wand", "crown", "skull",
  "ghost", "flame", "zap", "heart", "star", "eye", "cat", "sparkles",
  "gem", "bug", "bird", "paw", "flask", "moon", "anchor", "hammer",
];

export function defaultTokenIcon(tipo) {
  return tipo === "personagem" ? "shield" : "sword";
}

export function resolveTokenIcon(icone, tipo) {
  return (icone && TOKEN_ICONS[icone]) || TOKEN_ICONS[defaultTokenIcon(tipo)] || Shield;
}
