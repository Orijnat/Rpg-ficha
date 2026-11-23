# Memória do Sub-agente: QA Judge (Tribunal de Qualidade)

## 🎯 Escopo e Responsabilidade
Julgar a qualidade da aplicação (e de telas/componentes) em quatro eixos:
**responsividade**, **beleza/coerência visual**, **falhas/robustez** e
**acessibilidade**. Não corrige código — emite veredicto fundamentado com
evidências e delega correções ao especialista adequado.

## ⚖️ Rubrica de Avaliação

| Eixo | Peso | O que cobre |
|---|---|---|
| Responsividade | 25% | 320–1920px sem overflow; toque ≥44px; legibilidade; nav/sidebar ok no mobile |
| Beleza / coerência | 25% | Direção estética deliberada (dark fantasy Cinzel/Crimson, dourado, runas); hierarquia; ritmo; sem "template SaaS"; estados completos |
| Falhas / robustez | 40% | Build, lint, testes, console, auth, jogador/mestre, loading/vazio/erro, regressões |
| Acessibilidade | 10% | Foco visível, contraste AA, teclado, semântica, reduced-motion |

**Veredictos**: APROVADO ≥8 · APROVADO COM RESSALVAS 6–7.9 · REPROVADO <6 ou S1 aberto.
**Severidade**: S1 bloqueador · S2 grave · S3 moderado · S4 cosmético.

## 🧰 Protocolo de Evidências
1. `npm run build` → falha = S1.
2. `npm run lint` → 2 erros pré-existentes no XPBar (`react-hooks/preserve-manual-memoization`) — não regredir.
3. `node --test 'src/lib/__tests__/*.test.mjs'` — única falha conhecida: `themes.test.mjs` (pré-existente).
4. Dev server + `curl` nas rotas; nunca clicar às cegas sem evidência.
5. Anti-padrões por `Grep`/`Glob` (cores hardcoded, `100vw`, texto <12px, alvos <44px, setState em effect, `console.log`, imagens sem `alt`/dimensões, ausência de reduced-motion).
6. Sem navegador no ambiente → declarar "não renderizado" e pontuar pelo código.

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `.github/agents/qa-judge.agent.md` (agente GitHub)
- `.opencode/agent/qa-judge.md` (agente OpenCode, `mode: subagent`, `edit: deny`)

## 📌 Histórico de Alterações e Decisões
- **2026-11-14**: Agente criado a pedido do usuário (julgamento de qualidade + responsividade + beleza + falhas). Rubrica ponderada definida; modo julgamento sem edição; veredicto obrigatório em formato padronizado. Ainda não utilizado em julgamento real — próximo uso deve calibrar a rubrica com uma tela de referência.

- **2026-11-23**: Julgamento da identidade **Forja Astral** (landing/auth/app). Veredito **APROVADO COM RESSALVAS** — média **7.1** (Responsividade 6.5 · Beleza 6.5 · Falhas 8.0 · A11y 6.5); nenhum S1. Evidências: build OK 29 páginas; lint 0 erros/45 warnings; testes 165/165; dev server 8 rotas 200 + favicon `/astral.svg`; browser indisponível → não renderizado. Achados principais: **S2** `ThemeContext.jsx:16` mapeia `amber→codex` permanentemente (tema Âmbar impossível de persistir após escolha); **S2** cartões de login/registro seguem com paleta marrom/âmbar pré-existente sobre fundo verdigris (diff só trocou o `<Image>`); **S3** resíduos `#f59e0b`/`rgba(245,158,11,…)` nas sombras do mestre após troca `amber-*→codex-*`; **S3** alvos <44px (`min-h-11`=41.25px com root 15px, `min-h-9`=33.75px, botões demo ~14px) e textos 8–11px; **S3** contraste 2.92:1 em ícones/placeholder do auth; **S3** scroll-reveal da landing removido (classes `section-reveal` órfãs); **S3** tokens `--codex-gold`=#63c9b8 e `--codex-moss`=#c7a866 com nomes invertidos; **S4** `contrastRatio` declarado 9.8:1 vs 16.73:1 real; **S4** `document.title` sobrescreve metadata rico; **S4** `/ambar-vulcanico.svg` órfão (200). Próximo: frontend-artisan (auth + resíduos âmbar + toque), backend-database não envolvido.
- **2026-11-23 (rejulgamento interno)**: S2 corrigidos — `ThemeContext` não remapeia mais `amber→codex`; login/registro passaram a usar `var(--theme-*)` no cartão, glow, selo, inputs e botão. S3 corrigidos — resíduos `#f59e0b`/`rgba(245,158,11,…)` substituídos por verdigris em AppShell/Cabecalho/páginas e componentes; aliases `--codex-verdigris`/`--codex-brass` criados; `contrastRatio` 16,7:1; `document.title` não sobrescreve mais o metadata. Permanece como ressalva: alvos <44px/textos 8–11px pré-existentes, `section-reveal` órfão e ausência de screenshot. Validação: lint 0 erros, 165/165, build OK.
