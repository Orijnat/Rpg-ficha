import Link from "next/link";
import { BookOpen, Dices, Map, Shield, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Sua lenda em um só lugar",
    description: "Organize atributos, perícias, inventário, contratos, montaria e diário sem perder o fio da aventura.",
  },
  {
    icon: Dices,
    title: "Regras que acompanham você",
    description: "Role dados, calcule modificadores e registre decisões com uma experiência feita para o seu sistema d20.",
  },
  {
    icon: Users,
    title: "Mesa conectada",
    description: "Jogadores e mestres compartilham campanhas, personagens e momentos importantes com segurança.",
  },
  {
    icon: Map,
    title: "Prepare o próximo capítulo",
    description: "Mestres podem organizar campanhas, NPCs, sessões e o mundo que aguarda o grupo.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--theme-glow-1),transparent_35%),radial-gradient(circle_at_85%_25%,var(--theme-glow-2),transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--theme-accent-glow)] blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Fichas de RPG: Grimório, início">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--theme-accent)]/40 bg-black/30 text-2xl shadow-[0_0_24px_var(--theme-accent-glow)]">
            ⚔
          </span>
          <span>
            <span className="block font-['Cinzel'] text-sm font-bold tracking-[0.18em] text-[var(--theme-title)]">
              Fichas de RPG: Grimório
            </span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-[var(--theme-subtitle)]">
              Grimório digital de aventuras
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navegação pública">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-[var(--theme-subtitle)] transition hover:text-[var(--theme-title)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] sm:px-4"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="rounded-lg border border-[var(--theme-accent)]/60 bg-[var(--theme-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--theme-accent-contrast)] shadow-lg shadow-[var(--theme-accent-glow)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2 focus:ring-offset-[var(--theme-bg)]"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-24">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-accent)]">
              <Sparkles size={15} aria-hidden="true" />
              A aventura começa aqui
            </p>
            <h1 className="max-w-3xl font-['Cinzel'] text-4xl font-bold leading-tight text-[var(--theme-title)] sm:text-6xl">
              Transforme cada sessão em uma{" "}
              <span className="text-[var(--theme-accent)]">lenda memorável.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-['Crimson_Text'] text-xl leading-relaxed text-[var(--theme-body)]/80 sm:text-2xl">
              Uma casa digital para sua ficha de RPG, sua campanha e todas as
              histórias que ainda serão contadas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--theme-accent)] bg-[var(--theme-accent)] px-6 text-sm font-bold text-[var(--theme-accent-contrast)] shadow-xl shadow-[var(--theme-accent-glow)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2 focus:ring-offset-[var(--theme-bg)]"
              >
                Começar minha jornada
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--theme-accent)]/40 bg-black/20 px-6 text-sm font-semibold text-[var(--theme-title)] transition hover:border-[var(--theme-accent)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
              >
                Já tenho uma conta
              </Link>
            </div>
            <p className="mt-5 text-xs text-[var(--theme-subtitle)]/80">
              Cadastro gratuito · Feito para jogadores e mestres
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-[var(--theme-accent-glow)] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-[var(--theme-accent)]/30 bg-black/35 p-5 shadow-2xl backdrop-blur-md sm:p-7">
              <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--theme-subtitle)]">
                    Ficha ativa
                  </p>
                  <h2 className="mt-2 font-['Cinzel'] text-2xl font-bold text-[var(--theme-title)]">
                    Kael, Andarilho
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  Em campanha
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["FOR", "16", "+3"],
                  ["DES", "14", "+2"],
                  ["ESP", "13", "+1"],
                ].map(([label, value, modifier]) => (
                  <div key={label} className="rounded-xl border border-[var(--theme-accent)]/20 bg-white/[0.04] p-3 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-[var(--theme-subtitle)]">{label}</p>
                    <p className="mt-1 font-['Cinzel'] text-2xl font-bold text-[var(--theme-title)]">{value}</p>
                    <p className="text-xs text-[var(--theme-accent)]">{modifier}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--theme-subtitle)]">Pontos de vida</span>
                  <span className="font-semibold text-[var(--theme-title)]">28 / 34</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-rose-700 to-rose-400" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--theme-accent)]/15 bg-[var(--theme-accent)]/5 p-3 text-xs text-[var(--theme-body)]/80">
                  <Shield size={15} className="shrink-0 text-[var(--theme-accent)]" aria-hidden="true" />
                  Tudo pronto para a próxima sessão.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-black/15" aria-labelledby="features-title">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--theme-accent)]">
                Tudo que a mesa precisa
              </p>
              <h2 id="features-title" className="mt-3 font-['Cinzel'] text-3xl font-bold text-[var(--theme-title)] sm:text-4xl">
                Menos planilhas. Mais narrativa.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-[var(--theme-accent)]/40 hover:bg-white/[0.05]">
                  <Icon size={22} className="text-[var(--theme-accent)]" aria-hidden="true" />
                  <h3 className="mt-5 font-['Cinzel'] text-lg font-bold text-[var(--theme-title)]">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--theme-body)]/70">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="font-['Crimson_Text'] text-2xl italic text-[var(--theme-body)]/80 sm:text-3xl">
            “Toda grande campanha começa com uma página em branco.”
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--theme-accent)] bg-[var(--theme-accent)] px-7 text-sm font-bold text-[var(--theme-accent-contrast)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2 focus:ring-offset-[var(--theme-bg)]"
          >
            Abrir meu grimório
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-6 text-center text-xs text-[var(--theme-subtitle)]/70">
        Fichas de RPG: Grimório · Seu mundo, suas regras, sua lenda.
      </footer>
    </div>
  );
}