# 🧠 Sessão Ativa — Grimorium RPG

**Última Atualização**: 2026-11-16T14:20:00-03:00  
**Branch Atual**: `main`  
**Status**: REGRESSÃO DE SCROLL CORRIGIDA — allowNestedScroll (commit 88e5372, no main publicado) matou a roda do mouse; revertido e aplicados data-lenis-prevent nos 15 containers internos. Corrigido e commitado (923f890) e pushed. Anterior: Log de Batalha implementado de ponta a ponta (2 repos) — tabela log_batalha, ACL por campanha, visão do jogador no mapa tático + visão do mestre na Sala de Guerra. Build OK, front 148/148, back 63/63. Commitado e pushed nos 2 repos (front: banco cofre, log de batalha, fix scroll, docs; back: log_batalha). CI workflows SEGREGADAS localmente (PAT sem scope workflow). migration log-batalha APLICADA no Supabase em 2026-11-16 (log_batalha + 3 índices criados e verificados; sequelize_meta registrado).
**Anterior**: Login em produção corrigido (trust proxy 04a2a5c + migrações prod). Mapa tático: bug da miniatura sumindo corrigido + ícones personalizáveis (e4b7eb9 back / 76243c7 front). Imagens do mapa: fix CORP (77cc96a). Fundo do mapa por sessão + URL externa commitado (c1c1365). Mandato autônomo "desenvolver até 17h": backend +26 testes (54/54: mapa_tatico ACL + security_auth), frontend +5 (145/145), refactor TOKEN_ICONS→lib/mapaTatico.js, skills `mapa-tatico` e `render-supabase-producao` (espelhadas), docs atualizados. Lote autônomo completo: 54/54 back, 145/145 front, build 31/31, lint 0 erros (42 warnings pré-existentes). text-[9px]→[10px] (54×); audit fix typescript-eslint; docs/COISAS/TROUBLESHOOTING/RUNBOOK atualizados; skills novas espelhadas. jwt.js hardening (timingSafeEqual, sem unsigned), sessão restaurada confia só em /auth/me, rpg_auth_user não persiste mais → 148/148. Tudo NÃO commitado (aguardar pedido de commit).

---

## ✅ Atualização 2026-11-16 (Inventário — modal de adicionar item)
- Pedido: modal para adicionar itens no inventário (formulário de item novo, escolhido pelo usuário).
- Novo `src/app/components/inventario/AddItemModal.jsx`: nome (obrigatório), quantidade, peso/unidade, perfil de uso opcional (corpo a corpo/à distância → durabilidade; mágico/consumível → cargas; consumível → efeito/duração/unidade). Padrão BankChestModal (Escape/backdrop fecha, autofocus, role=dialog, data-lenis-prevent).
- `CharacterContext.js`: `addItem(itemData)` agora aceita payload `{ name, qty, weight, use }` (retrocompatível sem args).
- `inventario/page.js`: botão "Novo Item" abre o modal; itens criados com perfil de uso já aparecem em "Usar & Consumir".
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-16 (Banco ↔ Inventário — ligação corrigida + seleção unidade a unidade)
- `depositToBank(slotIndex, itemId, qty)` / `withdrawFromBank(slotIndex, qty)`: depósito/saque **parcial** com clamp; `storedItem` no slot preserva o item inteiro (perfil `use`, peso, campos legados); saque devolve com id novo e qty da seleção; pilha restante mantém `qty/quantidade`.
- `BankChestModal.jsx` reescrito: seleção de item com destaque, **UnitPicker** (pips numerados clicáveis, 1..N unidade por unidade; entrada exata se pilha > 24) para depositar e devolver; slots antigos continuam compatíveis.
- Novo `src/app/components/ui/UnitPicker.jsx` (compartilhado, tema via --theme-accent).
- Atalho no Inventário: ícone de arquivo em cada linha abre `DepositToBankModal` (quantidade unidade a unidade + nº de espaços livres; deposita no 1º espaço vazio; avisa se cofre cheio). Banner de feedback na Mochila.
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-16 (Inventário — modal de cadastro COMPLETO do item)
- `AddItemModal.jsx` reescrito como cadastro completo: nome*, descrição (textarea), categoria (CATEGORIAS_ITEM), raridade (RARIDADES, com badge colorido ao vivo), quantidade, peso, preço + moeda (MOEDAS), perfil de uso (durabilidade/cargas/efeito/duração).
- `CharacterContext.addItem` persiste `descricao`, `categoria`, `raridade`, `preco`, `moeda` (campos aditivos, retrocompatíveis). Perfil de uso e `storedItem` do banco preservam tudo.
- Mochila: linha do item mostra badge de raridade + categoria + preço (ex.: "1.200 PO") e tooltip com a descrição.
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

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

## ✅ Atualização 2026-11-16 (Fix fundo do login)
- Causa-raiz das "barras pretas" no /login (inexistentes no /registro): as duas telas usam `AuthScaffold`, mas a camada de fundo era `absolute inset-0` — cobria apenas a altura do cartão. O cartão do registro é alto e preenche a viewport; o do login é curto, sobrava o fundo quase preto do body acima/abaixo.
- Fix: `src/components/auth/AuthScaffold.jsx` — camada de fundo ("Camada de fundo viva") de `absolute inset-0` para `fixed inset-0` (ancora na viewport, como `background-attachment: fixed` do body). Beneficia também `/esqueci-senha`, `/redefinir-senha` e `/verificar-email`.
- eslint limpo no arquivo. NÃO commitado. Recomendação: conferir /login no navegador.

## ✅ Atualização 2026-11-16 (Banco — botão Sair)
- Pedido do usuário: no Banco de Glenor, substituir o bloco "Senha personalizada" por apenas um botão de sair.
- `src/app/components/banco/BankUnlockedView.jsx`: header agora só tem `SectionHeader` + botão "Sair" (`LogOut`, `onLogout` = fechar cofre). Removidos form/feedback de senha e prop `characterId` (também no pai `src/app/banco/page.jsx`).
- `setBankPasswordOnBackend` (lib/api.js) e o endpoint backend `PUT /api/characters/:id/bank/password` permanecem intactos (capability preservada no servidor; só a UI foi removida).
- eslint limpo. NÃO commitado.

## ✅ Atualização 2026-11-16 (Banco — modal depositar/retirar)
- Pedido: clicar num espaço do banco abre modal listando o inventário e move o item para o cofre.
- `CharacterContext.js`: novos métodos `depositToBank(slotIndex, inventoryItemId)` e `withdrawFromBank(slotIndex)` — atômicos em um único `setData`; slot passa a guardar `{ item, qty, weight }` (retrocompatível: slots antigos só têm `item`).
- Novo `src/app/components/banco/BankChestModal.jsx`: slot vazio → busca + lista do inventário ("Guardar" move o item, removendo-o do inventário); slot ocupado → mostra item e "Devolver ao Inventário".
- `BankSlot.jsx`: window.prompt removido; exibe `nome ×qty`; clique abre o modal. `BankSlotGrid.jsx`: prop `onSlotClick`. `BankUnlockedView.jsx`: gerencia `activeSlot` e renderiza o modal. `banco/page.jsx`: conecta `data.inventory` + callbacks.
- Build OK, testes 148/148, eslint limpo. NÃO commitado.

## ✅ Atualização 2026-11-16 (Log de Batalha)

Pedido do usuário: log de batalha que persiste TODAS as ações de jogadores e do mestre durante a batalha. Escolhas validadas: rolagens+dano/cura+iniciativa+ações do mestre; jogador também vê o log; nova tabela `log_batalha` (não JSONB).

**Backend `../Rpg-backend`**:
- `models/LogBatalha.js` + migration `database/migrations/20261116000000-log-batalha.js` (PK uuid, FKs encontro/campanha ON DELETE CASCADE, usuario SET NULL, FK papel CHECK, índice (encontro_id, created_at ASC)). Aplicada e verificada em Postgres 16 descartável (Docker) — **produção (Supabase) NÃO migrada** (decisão de deploy).
- `services/batalhaLog.js`: `registrarEventoBatalha` (nunca derruba a requisição; rodada = combatRound do encontro), `resolverEncontroParaLog` (encontroId explícito → ativo mais recente → mais recente), `resolverCampanhasPermitidas` (suporta `campanhaId="ativa"` como o fluxo de iniciativa), `serializeBatalhaLogEntry`.
- `controllers/batalhaLogController.js`: GET `/campanhas/:id/batalha/log?encontroId=&limit=` (membro ativo lê; 403 fora da mesa; DESC→reverso ASC) e POST idem (membro registra; tipos reservados `turno`/`encontro`/`recursos` exigem posse da mesa → 403 para jogadores).
- `encontroController`: criar→ evento `encontro`; `atualizar` espelha `novoEventoLog` no log com `tipoEventoLog` (schema aceita o enum); `receberIniciativaFicha` grava evento `iniciativa` (papel mestre se dono da mesa).
- Rotas em `campanhaRoutes.js` (montadas em `/api/campanhas` e `/api/campanha`).
- Backwards-compat total: zod não-strict descarta tipoEventoLog em backends antigos; logHistorico mantido.
- Testes: 9 novos (`test/log_batalha.test.js`) → 63/63 verdes.

**Front `Rpg-ficha`**:
- `lib/api.js`: `listBattleLog(campId, { encontroId, limit })`, `postBattleLogEvent`.
- `lib/battleLog.js`: metas (tipos/papéis, cores) + `normalizeLegacyBattleLogEntry` (fallback logHistorico).
- `components/batalha/BattleLogPanel.jsx`: visão de log compartilhada (jogadores e mestre) — polling 5s, auto-scroll, rodada/hora/autor/papel/tipo; `BattleLogEntryRow` exportado p/ Sala de Guerra. Auto-detecta campanha se prop ausente.
- `DiceContext`: toda rolagem com ficha vinculada à mesa posta evento `rolagem` (silêncio fora de combate).
- `DanoCuraPainel`: dano (com absorção CA), cura, cura total e Dado de Vida postam eventos `dano`/`cura` com PV antes/depois.
- `admin/encontros/page.js`: painel "Histórico de Alterações" lê o log do servidor (fallback legado), badges de papel/tipo, polling 5s, `tipoEventoLog` por ação (entrada/dano/cura/condicao/iniciativa/turno).
- `mapa-tatico/page.js`: widget **Log da Batalha** (todos os papéis) injetando `selectedCampaignId`.
- Build 31/31, testes 148/148, lint 0 erros (warnings restantes são da classe pré-existente de fetch-em-effect).

**Verificar no navegador**: abrir `/mapa-tatico` como jogador e mestre, rolar dados, tomar dano, avançar turno — eventos devem aparecer em ~5s nos dois painéis.

## ✅ Atualização 2026-11-16 (Fix scroll)
- Sintoma: em alguns pontos o scroll não funcionava (painéis do mapa tático, modais, listas internas).
- Causa: Lenis root com `smoothWheel` interceptava todos os wheel events e dava preventDefault — containers `overflow-y-auto` internos ficavam sem scroll nativo.
- Fix: `allowNestedScroll: true` em `src/components/SmoothScroll.jsx` — Lenis cede o scroll aos descendants scrolláveis sob o cursor e reassume na borda (scroll chaining para a página).
- Build OK (31/31), lint 0 erros. NÃO commitado. Verificar no navegador: rolar listas do mapa-tatico e modais com o wheel.

## ✅ Atualização 2026-11-16 (Regressão da roda do scroll — corrigida)
- Relato pós-push: "a roda de rolagem não está funcionando mais no site" (culpa do commit 88e5372 / allowNestedScroll).
- Fix definitivo: revertido `allowNestedScroll` em `SmoothScroll.jsx` (site volta ao comportamento anterior — página volta a rolar) + `data-lenis-prevent` (atributo oficial do Lenis) injetado nos 15 containers internos `overflow-y-auto`/`overflow-auto` (mapa tático, FloatingWindow, modais, log de batalha, encontros).
- Comportamento: sobre containers marcados, Lenis ignora o wheel → scroll nativo funciona dentro; fora deles, a página rola como antes.
- Build OK 31/31, lint 0 erros. Commitado como 923f890 e pushed.

## ✅ Atualização 2026-11-16 (Consumo automático de itens)
- Pedido: cálculo automático de consumo — atacar com arma/arco, cargas, durabilidade, duração de poções.
- Decisões: mecânicas = 4 (munição automática, cargas/usos, durabilidade, duração de poções); config = painel dedicado "Usar & Consumir" na ficha (/inventario); efeitos de poção = lista "Efeitos Ativos" na ficha; gatilho = botão de dados do item + botão Atacar/Usar no painel.
- `src/lib/items.js` (novo): `applyItemUse` puro (consome munição detectada/vinculada, cargas, durabilidade com quebra em 0, cria activeEffect com duração) + `tickActiveEffects`. Testes: 10 novos (items.test.mjs) → 158/158.
- `CharacterContext`: `configureItemUse`, `consumeItem`, `tickActiveEffect`, `advanceRoundEffects` (Rodada +1 em todos de rodadas, expira e loga), `removeActiveEffect`. Efeitos ativos em `data.dadosExtras.activeEffects` (round-trip pela sync existente, sem migration). Postam battle log tipo `recursos` ("Usou X", "Flecha consumida (11 rest.)", "Efeito Y expirou").
- `/inventario`: 2 cards novos — "Efeitos Ativos" (lista com −1, Rodada +1, remover) e "Usar & Consumir" (configurar perfil por item: tipo arma/à distância/consumível/mágico; munição vinculada; cargas; durabilidade; efeito+duração; botão Atacar/Usar; gatilho no dado do item também consome). Containers com data-lenis-prevent.
- Build OK 31/31, lint 0 erros. Commitado (ed36c11) e pushed.

## ✅ Atualização 2026-11-16 (Linter Supabase — ajustes aplicados)
- Diagnóstico read-only no Supabase: 5 tabelas public sem RLS (arquivos, log_batalha, mapa_tatico, rolagens, sequelize_meta); 13 FKs de tabelas da aplicação sem índice de cobertura; 4 índices exatamente duplicados (auditoria_usuario_idx, auditoria_campanha_idx, mapa_tatico_campanha_idx, sessoes_jogo_campanha_idx); grant padrão anon/authenticated/service_role em tudo (175 cada).
- Criada migration `20261116100000-supabase-linter-ajustes.js` e APLICADA no Supabase (up): RLS enabled nas 5 tabelas (backend Express usa role postgres = bypassrls → zero impacto), 13 índices de FK criados, 4 duplicados removidos. Verificação ao vivo: 0 tabelas public sem RLS, 13/13 índices, duplicados sumiram, sequelize_meta registrado.
- NÃO tocados: auth.* e storage.* (gerenciados pelo Supabase), índices só parcialmente duplicados (predicados diferentes), tabelas legado sem uso (todas com 0 linhas — candidata a limpeza futura, destrutivo demais p/ esta missão; NÃO dropar sem decisão do operador).
- Health/ready da API de produção OK; testes back 63/63.
- Migration commitada e pushed (c0ec3e0 backend).

## ✅ Atualização 2026-11-16 (Rename Banco)
- Pedido do usuário: renomear "Banco de Glenor" para "Banco de Azedarack" (as vezes grafado "lenor").
- Alteradas todas as ocorrências do banco: `src/app/page.js` (landing), `banco/page.jsx` (comentário), `BankLockedView.jsx`, `BankUnlockedView.jsx`, `BankChestModal.jsx` (comentário + "Cofre de Azedarack"), `constants.js` (bankTitle, não mais referenciado em lugar nenhum).
- "Crônicas de Glenor" no placeholder de admin/campanhas também trocado para "Crônicas de Azedarack: O Eclipse de Sangue" (pedido seguinte do usuário). Backend sem ocorrências.
- Commitado e pushed junto com COISAS-A-FAZER.md (seção 6: Google → "permitir criar conta de maneira dinamica com um email") a pedido do usuário. `.github/workflows/` NÃO incluída (CI segregada localmente por falta de scope do PAT).

## ✅ Atualização 2026-11-16 (Limpeza total do banco Supabase — PRODUÇÃO)
- Pedido do usuário (com confirmação solene em 3 etapas): apagar TODOS os dados do banco de produção (Supabase pooler, db `postgres`).
- pg_dump prévio gerado: `/tmp/opencode/backup-pre-purge-2026-11-16.dump` (120 KB, chmod 600, custom format, schema public — contém hashes de senha; manter em local seguro ou apagar).
- Executado `TRUNCATE ... RESTART IDENTITY CASCADE` em TODAS as tabelas public, EXCETO `sequelize_meta` (10) e `SequelizeMeta` (1) (histórico de migrações preservado). Verificado ao vivo: count=0 em todas as demais; migrations intactas.
- auth.* e storage.* já estavam vazios (verificado antes). Uploads em disco (private_uploads) não são apagados por este procedimento.
- Todos os 10 usuários/13 personagens/1 campanha foram apagados; sessões invalidadas — app volta a exigir registro do zero.
- `/tmp/opencode/dburl.txt` removido (continha a connection string).

## ✅ Atualização 2026-11-16 (Mercado do Mundo → banco; dados mockados removidos)
- Pedido do usuário: "não existam mais dados mockados, e sim que puxem tudo do banco". Escopo aprovado: Mercado do Mundo + 2 extras (NPC placeholder do /admin; seed.js demo).
- BACKEND `../Rpg-backend`: novas tabelas `mercado_vendedores` e `mercado_itens` (migration `20261116170000-mercado.js`, RLS enabled, índices FK; criado_por_id por mestre, sem FK item→vendedor — formulário aceita vendedor em texto livre). Models `MercadoVendedor`/`MercadoItem`; schemas zod strict; controller `mercadoController` (listar/criar/atualizar/remover, owner-scoped 404 para não-dono); rotas `/api/mercado/{vendedores,itens}` atrás de authMiddleware+requireMaster; montado em server.js. `database/seed.js` DELETADO e script `db:seed` removido do package.json (COISAS-A-FAZER-BACKEND.md atualizado).
- Migration APLICADA no Supabase (produção) via `node database/migrate.js` (todas as incrementais re-aplicadas idempotentemente; sequelize_meta registrado; RLS verificado t/t).
- FRONTEND: `/admin/mercado` reescrito para persistir no banco (list no mount; create/update/delete via API; estoque com atualização otimista + reconciliação; botão "Restaurar Catálogo Padrão" e localStorage removidos; banners de erro/loading). `api.js`: 8 novas funções market CRUD + comentário atualizado. `src/lib/market.js`: VENDEDORES_PADRAO e DEFAULT_MARKET_ITEMS REMOVIDOS (restam REGIOES_CANONICAS/CATEGORIAS/RARIDADES/MOEDAS + funções puras). `/admin/page.js`: defaultTable.npcs agora `[]` (NPC placeholder removido). `market.test.mjs` ajustado (158/158). api.js comment atualizado. lint limpo; build 31/31.
- Verificado end-to-end em Postgres 16 descartável (Docker, container removido ao final): migrations do zero OK; registro jogador cria ficha; registro MESTRE NÃO cria ficha (characters undefined); CRUD mercado OK; outro mestre → 404 em item/vendedor alheio; DECIMAL volta como string→convertido para number no serializer.
- ATENÇÃO: nada commitado. Backend precisa ser DEPLOYADO (Render) para /api/mercado e o fix de registro de mestre valerem em produção; frontend na Vercel na sequência. `.github/workflows/` permanece local (PAT sem scope).
- Detalhe: resposta de register de MESTRE agora omite `character` e retorna `characters: []`; frontend AuthContext já tolerava (chars=[]).

## ✅ Atualização 2026-11-16 (Commits e push do mercado)
- Commitado e pushed nos 2 repos (nada pendente de código): back `0d8da1b` fix(auth) registro de mestre sem ficha + `ce94916` feat(mercado) (tabelas/CRUD/RLS; Supabase já migrado); front `3dd84f6` feat(mercado) página conectada ao banco, `085ab95` chore(admin) placeholder removido, `cc3a4be` docs(memory).
- .github/ e .github/workflows/ permanecem não rastreados nos 2 repos (PAT sem scope workflow — push falharia).
- PRODUÇÃO ainda precisa de deploy do backend (Render) e frontend (Vercel) para /api/mercado e o fix de registro de mestre valerem ao vivo.

## ✅ Atualização 2026-11-16 (2ª limpeza total do banco Supabase — PRODUÇÃO, sem backup)
- Pedido do usuário: limpar novamente o banco, SEM backup (2 usuários/2 personagens criados desde a 1ª limpeza foram apagados mediante confirmação solene dupla).
- Mesmo procedimento da 1ª vez: TRUNCATE ... RESTART IDENTITY CASCADE em todas as tabelas public EXCETO sequelize_meta (11) e SequelizeMeta (1). Inclui as novas mercado_vendedores/mercado_itens. Verificado ao vivo: zero linhas em todas as demais tabelas; migrations intactas. auth.*/storage.* não tocados.
- Sem backup desta vez (decisão explícita do usuário).

## ✅ Atualização 2026-11-16 (Relatório simples do sistema)
- Pedido do usuário: "me faca um relatorio simples do sistema". Relatório apresentado no chat (stack, arquitetura, módulos, estado de produção/testes). Nenhum arquivo criado.
