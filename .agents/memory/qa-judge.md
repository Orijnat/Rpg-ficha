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

- **2026-11-24**: Julgamento das alterações não commitadas da **ficha de NPC** (7 arquivos: `AuthContext`, `AppShell`, `Cabecalho`, `personagem/page`, 3 páginas admin). Veredito **APROVADO COM RESSALVAS** — média **7.3** (Responsividade 7.0 · Beleza 7.5 · Falhas 7.5 · A11y 7.0); nenhum S1. Evidências: build OK 29 páginas; lint 0 erros/45 warnings pré-existentes; testes 165/165 em 18 suítes; dev server :3117 → `/personagem?inspect=1&type=npc`, `/admin/npcs`, `/admin/npcs/1`, `/admin/personagens`, `/personagem` = 200, log limpo, processo encerrado; browser indisponível → não renderizado. Achados: **S2** `AuthContext.jsx:112` (`unshift`) + `:313-317` (merge preserva `__npc`) — IDs numéricos independentes em `api.js:419` (`/characters/:id`) e `:607` (`/npcs/:id`) permitem herói com id colidido herdar identidade de monstro; **S2** `:115-117` falha silenciosa no fetch do NPC cai para outra ficha; **S3** `AppShell.jsx:275-276` e `personagem/page.js:151` mantêm `Crown` em contexto de monstro; **S3** `Cabecalho.jsx:66` flash de "Nv. 1"+XPBar durante `authLoading`; **S3** `Cabecalho.jsx:84` papel sem `truncate` em 320px e textos 10px em `personagem/page.js:435,480`. Pontos fortes: cache `rpg-npc-sheet:v1` isolado (`CharacterContext.js:208-210`), sync desligado (`:362-366`), `playerCharacters` filtra `__npc` (`AuthContext.jsx:361`), `stopInspecting` por `userId` (`:334`), aria-labels e bloqueio de progressão. Próximo: `frontend-artisan` + `backend-database`. Nenhum código editado.
- **2026-11-24 (rejulgamento final)**: **APROVADO** — média **8.3** (Responsividade 8.0 · Beleza 8.5 · Falhas 8.5 · A11y 8.0); nenhum S1/S2. Correções verificadas: id composto `npc:${npc.id}` em `AuthContext.jsx:86` e limpeza de `__npc`/`npcId` no merge (`:323-326`); `npcInspectFailed` zera `activeCharacterId` e `rpg_current_char_id` antes do fallback (`:78,121,138-141`), erro exibido com `role="alert"` em `personagem/page.js:108-132` (`:124`); `heroCharacters = characters.filter(c => !c.__npc)` em `convite/[code]/page.js:35-36,247`; alvos `min-h-11`, `py-0.5`, badge com `truncate`, XPBar oculto no loading, ícones Skull. Evidências: build 29/29; lint 0 erros/45 warnings; testes 165/165; `git diff --check` OK; dev server :3121 com 8 rotas 200 e log limpo; browser indisponível → não renderizado. Ressalvas opcionais: `inspectError` persiste ao sair via `<Link>` (limpar ao trocar de rota), textos 9–10px pré-existentes, alvos `min-h-8` na barra de sync, `py-0.2` inválido fora do diff. Nenhum arquivo editado neste julgamento.
