# 🔍 Auditoria do Sistema — Grimorium RPG (2026-11-14)

**Escopo**: banco de dados (`Rpg-backend/database/`, `banco.sql`, `banco_v2.sql`, migrations), backend Express/Sequelize (`Rpg-backend/src/`) e frontend Next.js 16 (`Rpg-ficha/src/`), mais contrato API ↔ frontend.

**Método**: leitura dirigida (file-economy), subagentes explore para backend/frontend, e **verificação empírica** num PostgreSQL local (Docker, `rpg_ficha_test`) com a migration chain aplicada. Nenhum arquivo de código foi modificado.

**Legenda de severidade**: S1 bloqueador · S2 grave · S3 moderado · S4 cosmético.

---

## 1. Inventário

- **Backend**: 3 roteiros montados em `/api` (`auth`, `characters`, `campanhas` + legado `/campanha`), `npcs`, `mestreRecursos` (notas/encontros/mapas), health público. 14 modelos Sequelize. `generalRateLimiter` global (100/min) + `authRateLimiter` (5/min) só em register/login.
- **Frontend**: 29 rotas (`page.*`, todas client exceto `/anotacao` — órfã), 48 funções em `src/lib/api.js`, 4 contexts. Layout raiz `"use client"`; Google Fonts via `@import` no CSS.
- **Banco**: `banco.sql` (baseline) + `banco_v2.sql` aplicados por migrations; tabelas `montarias`, `iniciativas`, `pericias_personagem`, `imagens`, `cofres`, `sessoes_autenticacao` **sem modelo**. `Rpg-ficha/database/migrations/*.js` criam um schema paralelo incompatível (`users/campaigns/characters`).

---

## 2. Achados verificados empiricamente (Docker + Postgres local, hoje)

### F-01 · S1 · `bankPassword` em texto puro vaza em todo payload de personagem ✅ verificado
`dadosExtras.bankPassword` **é devolvido** por `/api/auth/me`, `/characters/:id`, `/characters`, `/sync`, login e register. `publicCharacter` só faz `delete data.bankPassword` no top-level; `dadosExtras` inteiro (incluindo a senha do cofre) vai no JSON.
Evidência (registro → sync com `dadosExtras:{bankPassword:"segredo-do-cofre"}` → `GET /auth/me`):
```json
"dadosExtras":{"bankPassword":"segredo-do-cofre", ...}
```
Impacto: mestre/todos com acesso à resposta veem a senha; o frontend grava em `localStorage`; usuários caem no default hardcoded `"133313"` (characterController.js:397) porque o cliente nunca consegue enviar a senha (zod strippa `bankPassword`).
Fix: `delete data.dadosExtras.bankPassword` (ou allowlist) em `publicCharacter`; endpoint dedicado `PUT /characters/:id/bank/password` com bcrypt; remover default `"133313"`.

### F-02 · S1 · `/api/npcs?q=` perde o escopo por campanha → vazamento global ✅ verificado
Mestre B (campanha própria, sem acesso) buscando `?q=Xam` lista o NPC secreto do mestre A com `notasMestre`.
Evidência: `[('Xamã Secreto', 'NÚCLEO SECRETO DO A')]`.
Causa: `npcController.listar` define `where[Op.or]=[...]` de posse e depois **sobrescreve** `where[Op.or]` com a cláusula de busca `q` (npcController.js:40-54). Fix: `Op.and` (ou `where.ownScope = ...` separado).

### F-03 · S1 · Combate tático quebrado: `PUT /encontros/:id` sempre 422 ✅ verificado
Frontend envia `dadosExtras` + `novoEventoLog` (encontros/page.js:125-136); `encontroSchema` não declara nenhum dos dois → zod strip → `.refine` falha → **422 "Informe ao menos um campo do encontro."** Combate, iniciativa, PV e condições não salvam via encontro.
Fix: declarar `nome?/tipo/ativo/inimigos/recursos/dadosExtras/novoEventoLog` em `encontroSchema`.

### F-04 · S2 · Criação de sessão sempre 422 ✅ verificado
Frontend envia `dataAgendada:"2026-11-20"` (date-only); schema exige `z.string().datetime()`. Resposta: `422 ... "Invalid ISO datetime"`.
Fix: aceitar `YYYY-MM-DD` (regex + refine) ou o frontend enviar ISO completo.

### F-08 · S2 · `sync` sem id sobrescreve a ficha mais recente ✅ verificado
Além de criar duplicatas antes, a variante atual do sync (sem id) faz `Character.findOne({userId, order: updated_at DESC})` e atualiza — usuário com **2 fichas** teve a mais recente sobrescrita pela payload da outra (`FICHA_SOBRESCRITA`).
Fix: sync deve exigir `id` (frontend novo já garante); para legados, recusar (4xx) ou exigir `X-Confirm-Target`.

---

## 3. Achados por inspeção de código (mesma severidade/confiança alta)

### Frontend
- **A-01 · S1 · `resetCharacter` apaga a ficha remota.** `CharacterContext.js:620` → botão "Restaurar dados padrão" (`SettingsModal.jsx:162`) carrega blank, `hydrated` continua true e o efeito de sync (203-241) usa `targetId = data?.id || activeCharacter?.id` → `PUT` de ficha vazia sobre o personagem ativo. Perda silenciosa de HP/moedas/notas/inventário. Fix: flag `skipSync` após reset; nunca fallback para `activeCharacter.id`; confirmação tipada.
- **A-02 · S1 · Senha do cofre jamais persiste + senha vazia abre offline.** `banco/page.jsx:36` → `upd("bankPassword")`; backend sempre apaga; `CharacterContext.js:603` abre o cofre se `bankInput === data.bankPassword` com `""`. (Ver F-01/F-08.) Fix: endpoint dedicado com bcrypt; remover fallback local fraca.
- **A-03 · S2 · `players` (companheiros) nunca sincroniza** — backend só mapeia `jogadores`; reload perde a party. Fix: enviar `jogadores` ou mapear no backend.
- **A-04 · S2 · `loadCharacter` sem guard/validação** — importa JSON arbitrário por cima da ficha; pode disparar A-01 (overwrite remoto).
- **A-05 · S2 · Logout destrói o "Mercado do Mundo"** (`clearAuth` apaga `rpg_world_market_*`, que só vivem no localStorage). Fix: persistir no backend ou exportar antes de sair.
- **A-06 · S2 · `upsertCharacter` troca o personagem ativo à força** (`selectCharacter` sempre) — mestre inspecionando herói tem o contexto trocado; cadeia extra de PUT re-agendada.
- **A-07 · S2 · 409/conflito nunca resolvido**; `retrySync` reenvia o local descartando o remoto; sem merge/`updatedAt`.
- **A-08 · S3 · Assimetrias de sync**: `bankPassword` (ver), `players`, `hitDie` default `d8`≠`1d10`, `pe/bp/insanity` implícitos via spread sem teste.
- **A-09 · S3 · Layout raiz 100% client** → sem metadata/SEO/`viewport`; Google Fonts por `@import` (render-blocking); → layout server + `next/font`.
- **A-10 · S3 · `SmoothScroll` remonta a árvore** pós-mount (fragment→ReactLenis) → init dupla dos providers. Fix: sempre renderizar `<ReactLenis>` com flag interna.
- **A-11 · S3 · Código morto/órfão**: `/anotacao` vs `/anotacoes` (dois cadernos), `AnotacoesImproved.jsx`, `ThemeSelector.jsx`, `BarrraHp.jsx` (typo no nome), `Aurora.jsx` (484 l. sem uso), export de `defaultData` demo (usado pelos testes).
- **A-12 · S3 · Perf**: páginas de 700–1156 linhas (admin/mercado 1156); GSAP eager; zero `next/dynamic`; fontes `@import` bloqueando FCP.
- **A-13 · S3 · A11y**: `ConfirmDialog` sem role/Escape/focus-trap; `<img>` sem `next/image` nem dimensões (CLS); 232 textos `text-[9px]/[10px]` como texto principal.
- **A-14 · S3 · Hex hardcoded** ignorando tokens: `registro` (63), `DiceModal` (46), `login` (38), `SettingsModal` (32)…
- **A-16 · S4 · Higiene API**: alias legado `/campanha` ainda usado (`/campanhas` existe); `deleteGameSession` envia body em DELETE nunca lido.
- **A-17 · S3 · Testes**: `themes.test.mjs` falha desde antes (THEMES.length 6 ≠ ≥7; accents divergem); sem `npm test` (script inexistente); zero teste do sync de `CharacterContext` e do contrato api↔backend.

### Backend / Contrato
- **F-05 · S2 · Nota "privada" sempre vira pública** — `privada` não declarada em `notaSchema` → strippada; e `tipo: lore/segredo/pista` diverge do `ENUM tipo_anotacao('diario','anotacao','handout')` → erro 500.
- **F-06 · S2 · `GET /characters?campanhaId=`** usa o valor sem checar posse — qualquer mestre lista fichas (e dadosExtras) de campanha alheia. Fix: exigir `proprietarioId === req.user.id`.
- **F-07 · S2 · `GET /campanhas/:id`** inclui Character e NPC **completos** (dadosExtras→bankPassword; notasMestre) para qualquer membro; sem `publicCharacter`. Fix: sanitizar + restringir notas do mestre.
- **F-09 · S2 · Schema drift**: `npcs.campanha_id NOT NULL` no banco vs `NPC.campanhaId allowNull:true`; `personagens.usuario_id NOT NULL` vs model nullable → 500 em caminhos válidos.
- **F-10 · S2 · 3 fontes de verdade de schema**: `banco.sql` → `banco_v2.sql` (migration `20261106150000` **sem transação**; `down()` DROPA tabelas reais), e `Rpg-ficha/database/migrations/*.js` criando `users/campaigns/characters` incompatíveis. Backend migrations ESM + sequelize-cli (CJS) = frágil.
- **F-11 · S3 · Enums zod↔PG divergentes**: `arquivada` ∉ `estado_campanha`; `co-mestre` ∉ `papel_membro`; `encontroSchema` é "fantasia" (`combatentes/rodadaAtual…`) e não declara os campos reais → 422/500.
- **F-12 · S3 · Autorização ad hoc**: `requireMaster`/`requireRole`/`requirePlayer` (middlewares) nunca usados; `npcController.obterPorId` exige leitura **e** gestão (jogador recebe 403 em NPC que o list podia ver); `receberIniciativaFicha` deixa jogador criar "Combate Tático" ativo em campanha que participa (e inimigos ficam visíveis a qualquer membro).
- **F-13 · S3 · Legado silencioso**: `/api/campanha` GET/PUT sem validação (PUT aceita JSON arbitrário → `dados_mestre`); logout responde `revoked:true` sem revogar; `sessoes_jogo(campanha_id,numero)` UNIQUE sem constraint no model → race de numeração → 23505; `sessaoController` autentica jogador? não — só valida master.
- **F-15 · S4 · Higiene**: `console.log` de boot; `registrarAuditoria` engole falhas (só `console.error`); `googleapis` não usada; `getJwtSecret()` duplicado; N+1 em `canManageCharacter` (consulta campanha por candidato); zod `.strict()` só em register/login; demais stripam silenciosamente.

---

## 4. Top-10 prioridades

| # | ID | Sev | Resumo |
|---|---|---|---|
| 1 | F-01/A-02 | S1 | bankPassword em texto puro vaza em todo payload + nunca persiste |
| 2 | A-01 | S1 | `resetCharacter` sobrescreve ficha remota com blank |
| 3 | F-02 | S1 | `?q=` em `/npcs` vaza NPCs e notasMestre entre mestres |
| 4 | F-03 | S1 | `PUT /encontros/:id` sempre 422 — combate não salva |
| 5 | F-04 | S2 | Sessões de jogo não podem ser criadas (422 datetime) |
| 6 | F-06/F-07 | S2 | Fichas de campanha alheia e dadosExtras de jogadores acessíveis a qualquer mestre/membro |
| 7 | F-05 | S2 | "Nota privada" vira pública; enums divergem (500) |
| 8 | A-03 | S2 | Companheiros (players) somem no reload |
| 9 | A-05/A-06 | S2 | Logout apaga Mercado; upsert troca personagem à força |
| 10 | F-10 | S2 | 3 fontes de schema; migration sem transação com `down()` destrutivo |

## 5. Detalhes de ambiente / baseline

- `npm run lint` → 2 erros **pré-existentes** (`XPBar.jsx` `react-hooks/preserve-manual-memoization`), 40 warnings.
- `src/lib/__tests__/themes.test.mjs` **falha** no HEAD (themes 6 vs ≥7; accents divergem).
- Não há script `test` no `package.json`.
- Migration chain (`banco.sql` → `banco_v2.sql`) aplicada fresca num Postgres limpo: ambos migram OK; schema final é o v2 (atendido pelos modelos, salvo F-09/F-13).
- Nenhuma correção de código foi aplicada; todos os achados F (backend) foram observados num ambiente de teste que foi destruído ao final.

## 6. Sugestão de ataque

1. **Sessão de hardening S1** (F-01, A-01, F-02, F-03) — baixo risco, alta criticidade, testável com os mesmos scripts usados aqui.
2. **Fase de contrato/schema** (F-04, F-05, F-11, F-06/F-07 sanitizar payloads).
3. **Higiene de persistência** (A-03, A-07, F-08, F-13).
4. **Limpeza estrutural** (A-09…A-14, A-16/A-17) e correção do `themes.test.mjs`.

---

## 7. Registro de remediação (hardening S1/S2 + pendências) — 2026-11-14

Todos os achados S1 e S2, grande parte dos S3/S4 e os itens de conta/mestres/ficha de `itens-a-fazer.md` foram implementados e verificados (Postgres 16 descartável em Docker + `npm test` nos dois repos + build de produção). Resumo:

- **F-01/A-02 (S1)**: `bankPassword`/`bankPasswordHash` nunca retornam em payloads; endpoint `PUT /characters/:id/bank/password` (bcrypt, definido/removido por ficha); cofre usa senha personalizada ou a senha do login do dono; `"133313"` eliminado.
- **A-01 (S1)**: "Restaurar padrão" não sincroniza a ficha em branco; `targetId` sem fallback; confirmação tipada; importação de backup com confirmação tipada e restauração na ficha ativa.
- **F-02 (S1)**: `/api/npcs?q=` montado com `[Op.and]` (posse + campanha + busca).
- **F-03 (S1)**: `encontroSchema` completo — combate salva.
- **F-04…F-10 (S2)**: sessões aceitam date-only/ISO; nota privada persiste; enums zod↔PG unificados; `/characters?campanhaId=` exige posse; `/campanhas/:id` sanitizado; `players↔jogadores`; logout/Mercado preservado; `upsertCharacter` sem troca forçada; **409 real com `updatedAt` + force**; migration `npc-campanha-nullable`; **uma** fonte de verdade de schema + `database/migrate.js` idempotente.
- **S3/S4**: `requireMaster` em rotas mestre; legado `/campanha` com allowlist; logout e reset de senha **revogam JWTs** (`passwordChangedAt`); numeração de sessão com retry; `publicCharacter` com alias `updatedAt`; contrato de sync coberto por `test/sync_conflict.test.js`.
- **Conta**: verificação por e-mail e redefinição de senha completas (token sha256, single-use, banner reenviável, SMTP via env, `devPreviewUrl` em dev).
- **Ficha**: BP por nível nas perícias; CA absorve dano automaticamente; Dado de Vida soma ao PV máx com confirmação; PE máx editável; montarias (criar/matar/reviver).
- **Mestre**: subida de nível individual/em lote; iniciativa de fichas mesclada na Sala de Guerra (merge aditivo, HP/condições locais preservados).
- **UI**: vitalidade na navbar do Cabeçalho; temas claros em AA/AAA + `[data-theme="mist"]` ausente foi adicionado; acentos alinhados THEMES↔CSS; 270 hex canônicos → tokens `var(--theme-*)`.
- **Pendentes honestas**: A-12 (páginas gigantes, GSAP eager) e A-13 (sweep `<img>`/`text-[9px]`) seguem parciais; registry formal de sessões (refresh token) segue pendente; SMTP real e deploy são do operador.
