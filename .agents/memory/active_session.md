# 🧠 Sessão Ativa — Grimorium RPG

**Última Atualização**: 2026-11-15T15:50:00-03:00  
**Branch Atual**: `main`  
**Status**: Login em produção corrigido (trust proxy 04a2a5c + migrações prod). Mapa tático: bug da miniatura sumindo corrigido + ícones personalizáveis (e4b7eb9 back / 76243c7 front). Imagens do mapa: fix CORP (77cc96a). Fundo do mapa por sessão + URL externa commitado (c1c1365). Mandato autônomo "desenvolver até 17h": backend +26 testes (54/54: mapa_tatico ACL + security_auth), frontend +5 (145/145), refactor TOKEN_ICONS→lib/mapaTatico.js, skills `mapa-tatico` e `render-supabase-producao` (espelhadas), docs atualizados. Lote autônomo completo: 54/54 back, 145/145 front, build 31/31, lint 0 erros (42 warnings pré-existentes). text-[9px]→[10px] (54×); audit fix typescript-eslint; docs/COISAS/TROUBLESHOOTING/RUNBOOK atualizados; skills novas espelhadas. jwt.js hardening (timingSafeEqual, sem unsigned), sessão restaurada confia só em /auth/me, rpg_auth_user não persiste mais → 148/148. Tudo NÃO commitado (aguardar pedido de commit).

---

## ✅ Concluído Nesta Sessão (S1 da auditoria)

| Item | Status |
|---|---|
| F-01/A-02: `bankPassword`/`bankPasswordHash` fora de todos os payloads (`publicCharacter`; `data.user`→subset; `includeUser` nunca seleciona `password`); endpoint `PUT /api/characters/:id/bank/password` (bcrypt, definir/remover senha personalizada por ficha) | ✅ verificado ao vivo |
| F-01: cofre abre com senha personalizada ou com a senha do login do dono; fallback `"133313"` removido; `tryUnlock` exige servidor; `defaultCharacter.js` limpo | ✅ verificado ao vivo |
| A-01: `resetCharacter` bloqueia sync (`skipSyncRef`); `targetId` sem fallback do personagem ativo; confirmação tipada "RESTAURAR"; `reloadFromCloud` reativa sync | ✅ |
| F-02: `/api/npcs?q=` com `[Op.and]` (posse + campanha + busca); notasMestre de outras campanhas não vazam | ✅ verificado ao vivo |
| F-03: `encontroSchema` com `tipo/ativo/inimigos/recursos/dadosExtras/novoEventoLog`; PUT /encontros/:id → 200 (combate salva) | ✅ verificado ao vivo |
| A-01/A-02: importação de backup com confirmação tipada "IMPORTAR", schema validado, restaura na ficha ativa (ids do arquivo descartados); `backup.test.mjs` atualizado | ✅ |

**Verificação**: front `npm test` 135/135, back `npm test` 17/17, `npm run build` OK, eslint 0 erros. Teste empírico em Postgres 16 descartável (Docker, removido ao final) — todos os cenários PASS (inclusive `sync` sem id recusado, herdado do trabalho anterior). obs: criar NPC sem campanha falha por `npcs.campanha_id NOT NULL` — isso é F-09 (S2, pendente); a migration `database/migrations/20261114130000-npc-campanha-nullable.js` já está no working tree.

---

## ✅ Concluído na Sessão Anterior (Remodelação visual)

## ✅ Concluído Nesta Sessão (Remodelação visual)

| Item | Status |
|---|---|
| Instalados `lenis` (scroll suave global), `gsap` e `@gsap/react` (SplitText livre desde GSAP 3.13) | ✅ |
| React Bits NÃO é pacote npm: componentes JS+Tailwind vendored em `src/components/react-bits/` (`Aurora`, `SplitText`, `ShinyText`, `SpotlightCard`) + README com atribuição; pasta excluída do ESLint | ✅ |
| Landing (`/`) remodelada: fundo vivo Aurora WebGL (âmbar/violeta), vinheta, headline SplitText com rise por palavras, CTA principal com ShinyText (hover), CTA final com ShinyText (view), seções com reveal GSAP ScrollTrigger, pilares Jogador/Mestre em SpotlightCard | ✅ |
| Login e Registro: `src/components/auth/AuthScaffold.jsx` — fundo Aurora + anel de runas gigante girando + entrada GSAP (emblema/card), gsap respeitando reduced-motion | ✅ |
| Lenis global via `src/components/SmoothScroll.jsx`, desativado em `prefers-reduced-motion` | ✅ |
| Fundo das páginas públicas: substituídas auroras multicoloridas por gradientes âmbar sutis (landing e AuthScaffold) após feedback do usuário | ✅ |
| Incidente resolvido: `src/` havia sumido do worktree (deleção externa, não deste trabalho); restaurado via `git checkout` de stash dangling `0c3d4ca` (04:54, pós-build) — todas as correções de bugs preservadas | ✅ |

---

## 📌 Contexto
- **Stack visual**: Next 16/App Router, Tailwind v4, Aurora WebGL2, GSAP/ScrollTrigger, Lenis (lenis/react), React Bits vendored (variantes JS-TW).
- **Regras**: componentes React Bits mantêm código original e ficam FORA do lint; `prefers-reduced-motion` respeitado globalmente (Lenis, AuthScaffold, useGSAP de sections).
- **Build**: `npm run build` OK; `npm run lint` 2 erros + 40 warnings (todos pré-existentes); testes libs 134/135 (única falha: `themes.test.mjs`, pré-existente no HEAD).

## ⚠️ Pendências / Avisos
- Visual ainda não verificado por screenshot (sem browser no ambiente); rotas responderam 200 no dev server; recomendável abrir no navegador.
- TiltedCard foi descartado (não combina com conteúdo interativo do showcase); pode adicionar depois em superfícies estáticas.
- Dados demo no Supabase ainda precisam de limpeza one-time (decisão pendente do usuário).
- `.opencode/` não rastreado, não commitar sem revisão. Nada foi commitado nesta sessão.

## 📋 Checklist de Continuidade
- [x] Itens S1 da auditoria
- [x] Itens S2 (F-04..F-10) — verificados ao vivo (Postgres 16 descartável)
- [x] S3/S4 (F-11..F-15, A-09..A-17 exceto A-12/A-13 parciais)
- [x] Conta: e-mail de verificação + redefinição (revoga JWT)
- [x] Ficha: BP/nível, CA absorve dano, dado de vida→HP máx, PE máx, montarias
- [x] Mestre: nível individual/lote, iniciativa→Sala de Guerra, compartilhar fichas/NPCs
- [x] Interface: vitalidade na navbar, temas claros AA/AAA + tema mist, 270 hex→tokens
- [x] COISAS-A-FAZER lote 1/2: docs completas, exports CSV, rolagens, uploads seguros, sessões server-side (logout/reset revogam), migrações novas (rolagens/arquivos/índices/cenario), backup+restore testados, CI nos 2 repos
- [ ] COISAS-A-FAZER lote 2: Google API real (bloqueado por credenciais do operador), E2E/a11y/mobile (sem browser), cookies HTTP-only, A-12/A-13 parciais
- [ ] SMTP real, deploy e limpeza dos dados demo do Supabase (operador)
- [ ] Revisar visual no navegador; nada foi commitado ainda

## Próximo passo recomendado
Abrir `/`, `/login` e `/registro` no navegador com o backend local, revisar o visual com o usuário e, se aprovado, considerar commitar em conjunto com os fixes de bugs do itens-a-fazer.

## ✅ Atualização (Skill File Economy)
- Criada skill **file-economy** (`.agents/skills/file-economy/SKILL.md`, espelhada em `.github/skills/file-economy/SKILL.md`): protocolo de economia de acesso a arquivos/tokens — escada Glob→Grep→Read estreito, zonas proibidas (node_modules, lockfiles, .next), orçamento de leitura, cache mental e delegação a subagentes. Complementa `token-optimizer`.

## ✅ Atualização (Agente QA Judge)
- Criado agente **qa-judge** (Tribunal de Qualidade): `.github/agents/qa-judge.agent.md` (GitHub) + `.opencode/agent/qa-judge.md` (OpenCode, `mode: subagent`, `edit: deny`) + memória `.agents/memory/qa-judge.md` + referência em `AGENTS.md`.
- Rubrica: Responsividade 25% · Beleza/coerência 25% · Falhas/robustez 40% · Acessibilidade 10%. Veredictos APROVADO/APROVADO COM RESSALVAS/REPROVADO; severidade S1–S4; saída padronizada; não corrige código (delega ao especialista).

## ✅ Atualização (Auditoria do Sistema)
- Relatório `docs/AUDITORIA-SISTEMA-2026-11-14.md`: inventário + achados F-01…F-15 (backend) e A-01…A-17 (frontend) com severidade S1–S4 e file:line; 5 achados verificados em Postgres local (container `rpg_ficha_test`, removido ao final): vazamento de bankPassword em todo payload, vazamento de NPCs/notasMestre via `?q=` (escopo perdido por sobrescrita de Op.or), PUT /encontros/:id e criação de sessão sempre 422 (zod), sync sem id sobrescrevendo ficha mais recente.
- Top-10 de prioridades definido; sugestão de ataque em 4 fases (S1 → contrato/schema → persistência → higiene).
- Nenhuma correção de código aplicada (escopo desta demanda era mapear e achar falhas).

## ✅ Atualização (itens-a-fazer)
- Achados da auditoria incorporados a `itens-a-fazer.md` na seção "Auditoria do sistema (2026-11-14)": 6 itens S1, 12 S2, 13 S3, 2 S4 — cada um referenciando o ID do achado (F-xx/A-xx) e o doc `docs/AUDITORIA-SISTEMA-2026-11-14.md`.
