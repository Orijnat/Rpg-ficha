---
name: mapa-tatico
description: Convenções e ACL do mapa tático compartilhado por campanha (frontend /mapa-tatico e backend /api/mapa-tatico) — regras de quem pode adicionar/mover/ocultar/remover miniaturas, contrato do schema zod, fundo por sessão e por URL, e armadilhas conhecidas.
user-invocable: true
---

# 🗺️ Skill: Mapa Tático (mesa compartilhada)

Guardiã das regras do mapa tático do Grimorium: implementação, ACL e manutenção.
Implementado em 2026-11-14/15 nos commits `5446faa`/`f8eb1e7` (back/front) e refinado em `e4b7eb9`/`76243c7`/`c1c1365`.

---

## 📐 Contrato de dados

- Tabela `mapa_tatico` — **1 por campanha** (`UNIQUE(campanha_id)`); `tokens` é **JSONB** (sem migration ao mudar o shape dos tokens).
- Token: `{ id: uuid, tipo: personagem|npc|monstro|efeito, refId: uuid|null, name: string(≤120), x: 0..1, y: 0..1, tamanho: P|M|G|E, hp: int≥0|null, hpMax: int≥0|null, oculto: bool, icone: enum de 24 chaves? }`.
- `icone` (opcional) — enum: `shield, shieldCheck, sword, swords, axe, wand, crown, skull, ghost, flame, zap, heart, star, eye, cat, sparkles, gem, bug, bird, paw, flask, moon, anchor, hammer`. Sem `icone` → padrão por tipo (`shield`=personagem, `sword`=monstro/npc).
- Schema backend: `tokenMapaSchema` / `mapaTaticoPatchSchema` (`src/schemas/apiSchemas.js`). Frontend espelha os mesmos 24 ícones em `TOKEN_ICONS` (Lucide).

## 👥 ACL (regra de ouro)

| Ação | Membro (jogador) | Mestre (dono) |
|---|---|---|
| Ver miniaturas | sim (ocultos **filtrados no servidor**, `podeGerenciar=false`) | sim, todas (`podeGerenciar=true`) |
| Criar miniatura | **sim** (criada com `oculto:false` forçado) | sim |
| Mover (`x,y`), tamanho, `hp`, `icone` | **sim** | sim |
| Renomear, `hpMax`, `oculto`, tipo, refId | **não** (ignorados silenciosamente no merge) | sim |
| Apagar (ausente do array) | **não** (mantidos; nunca subtrair) | sim (substituição total) |
| Título, grade (`gradePx`, `gradeVisivel`), fundo (`urlFundo`, `arquivoFundoId`) | **não** → 403 | sim |
| Paleta "Heróis" e "Monstros & NPCs" na UI | visível, com botões + | visível |

Semântica do merge de membro (`mapaTaticoController.atualizar`): parte da lista do servidor; tokens conhecidos são atualizados só nos campos permitidos; tokens ausentes são mantidos; tokens novos são anexados com `oculto:false`.
**Nunca** implemente merge "substituição total para membro" — foi exatamente a causa do bug "miniatura some ao adicionar".

## 🎨 Frontend (`/mapa-tatico`)

- Estado do mapa: `map` (resposta do GET/PATCH). `persist()` faz **debounce 650ms** e faz merge `{...current, ...updated}` com a resposta — por isso o servidor **tem** de devolver a lista completa autorizada.
- Arraste: pointer events com `setDragInfo` + listeners em `window` (`pointermove`/`pointerup`); `snap` encaixa na grade (`gradePx`).
- HP na base do token (barra cor dinâmica), ocultos com `opacity-60 saturate-0` + EyeOff (só mestre).
- Fundo do mapa (decisão do operador, 2026-11-15):
  - Botão **"Mapa"** → imagem local via `URL.createObjectURL` — **só nesta sessão/aba**, nada é gravado no servidor, `sessionBgRef` revoga ao trocar/limpar/desmontar. Tem precedência sobre o fundo salvo.
  - Botão **"URL"** → `persist({ urlFundo, arquivoFundoId: null })` — imagem externa pública, salva só como texto; **visível para toda a mesa**.
  - Botão lixeira → `persist({ arquivoFundoId: null, urlFundo: null })` + descarta `sessionBg`.
  - O caminho antigo `arquivoFundoId` (upload para `/api/arquivos`) continua válido no código, mas arquivos somem no Render (disco efêmero) e o `<img>` é bloqueado se CORP não estiver `cross-origin`.
- `urlFundoAssinada` (arquivo privado) é renderizada prefixada com a origem da API (`getApiBaseUrl()` sem `/api`).

## 🖥️ Backend (`/api/mapa-tatico`)

- `GET /:campanhaId` (membro lê; mestre tudo) → cria o mapa lazily na primeira leitura.
- `PATCH /:campanhaId` (zod `mapaTaticoPatchSchema`): mestre = substituição total; membro = merge restrito (ver acima). "Nada para atualizar" (sem campos reconhecidos) → 400; membro tentando `titulo|fundo|grade` → 403.
- `tokensVisiveis`: não-donos nunca recebem ocultos. `fundoParaCliente`: `arquivoFundoId` → `urlFundoAssinada` HMAC 15 min.
- `getCampaignAccess` (`src/services/campaignAccess.js`): dono = mestre da mesa; membro precisa de `CampaignMember` ativo não bloqueado; outro mestre (não dono) → 403.

## 🧪 Verificação (obrigatória ao mexer)

- Unit/offline: `npm test` no backend — suíte `test/mapa_tatico.test.js` (ACL do controller com models mockados + schema zod; 14 casos). Padrão: reatribuir métodos de `Campaign`/`CampaignMember`/`MapaTatico` em `test/` e restaurar em `finally`.
- Empírico: Postgres 16 descartável via Docker:
  ```
  docker run -d --name rpg_mapa_test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rpg_mapa_test -p 55432:5432 postgres:16-alpine
  DATABASE_URL=postgres://postgres:postgres@localhost:55432/rpg_mapa_test node database/migrate.js
  JWT_SECRET=... PORT=3999 DATABASE_URL=... node src/server.js
  ```
  Então: registrar mestre+membro, mestre cria mesa, membro entra por `codigoConvite`, exercitar PATCH (criar/mover/apagar/oculto/hpMax/título 403). Limpar: `docker rm -f rpg_mapa_test`.
- Frontend: `npm run build` + `npx eslint src/app/mapa-tatico/page.js` (1 warning pré-existente `react-hooks/set-state-in-effect` é aceito).

## ⚠️ Armadilhas conhecidas

1. **Bug "miniatura some"** (2026-11-15): merge total para membro + resposta sem o token novo ⇒ sumia. Corrigido com merge restrito; qualquer "otimização" que devolva lista parcial/substitua para membro reintroduz o bug.
2. **Helmet CORP**: default `same-origin` bloqueia `/api/arquivos/:id` no `<img>` cross-origin (Vercel→Render). Backend usa `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })` (commit `77cc96a`).
3. **Render disco efêmero**: uploads em `private_uploads/` somem a cada deploy/restart. Decisão do operador: não usar Supabase Storage ("vai lotar o banco") — fundo via sessão local ou URL externa.
4. **`trust proxy`**: sem `app.set("trust proxy", 1)` o `express-rate-limit` falha atrás do proxy do Render (erro `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) e o login quebra (commit `04a2a5c`).
5. **`updated_at` como oráculo**: PATCH de membro com lista vazia mantém tudo, mas **atualiza** `updated_at` — observar só o timestamp para depurar "salvou?" engana.
6. Merge do membro **ignora silenciosamente** campos não permitidos (hpMax/name/oculto/icone inválido o zod rejeita com 422). UI não deve oferecer essas ações a membros.
