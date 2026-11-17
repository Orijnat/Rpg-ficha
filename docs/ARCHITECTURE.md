# Arquitetura do Sistema: Grimorium — Ficha de RPG Web

Documentação completa do sistema para manutenção futura. Descreve os dois repositórios, como a ficha sincroniza com a nuvem, como o deploy funciona e onde estão as armadilhas conhecidas.

**Repositórios:**

| Repo | Papel | Stack |
|:---|:---|:---|
| [`Rpg-ficha`](https://github.com/Orijnat/Rpg-ficha) (este) | Frontend (SPA/SSR) | Next.js 16 · React 19 · Tailwind CSS 4 |
| [`Rpg-backend`](https://github.com/Orijnat/Rpg-backend) | API REST + persistência | Node 18+ · Express 4 · Sequelize 6 · PostgreSQL |

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Mapa de componentes](#2-mapa-de-componentes)
3. [Fluxo da ficha: do input ao banco](#3-fluxo-da-ficha-do-input-ao-banco)
4. [Protocolo de sincronização (sync)](#4-protocolo-de-sincronização-sync)
5. [Autenticação e sessões](#5-autenticação-e-sessões)
6. [Contrato da API e serialização](#6-contrato-da-api-e-serialização)
7. [Modelo de dados (resumo)](#7-modelo-de-dados-resumo)
8. [Infraestrutura e deploy](#8-infraestrutura-e-deploy)
9. [Testes e comandos](#9-testes-e-comandos)
10. [Armadilhas conhecidas (sintoma → causa → fix)](#10-armadilhas-conhecidas-sintoma--causa--fix)
11. [Onde mexer em cada tipo de mudança](#11-onde-mexer-em-cada-tipo-de-mudança)
12. [Índice de documentos](#12-índice-de-documentos)

---

## 1. Visão geral

```
+-------------------------+         HTTPS          +-----------------------------+
|  Vercel (este repo)     |  --------------------> |  Render (Rpg-backend)       |
|  Next.js 16 App Router  |   NEXT_PUBLIC_API_URL  |  Express 4 + Sequelize 6    |
|  React 19 + Tailwind 4  |   .../api              |  validação zod + JWT        |
+-------------------------+                         +--------------+--------------+
                                                                   | pg
                                                                   v
                                                          +------------------+
                                                          | Supabase         |
                                                          | PostgreSQL       |
                                                          +------------------+
```

Primeiro fluxo útil (rodar localmente):

```bash
# Terminal 1 — backend (porta 3333)
cd ../Rpg-backend && npm install && npm run dev
# Terminal 2 — frontend (porta 3000)
cd Rpg-ficha && npm install && npm run dev
# Abra http://localhost:3000 → login/registro → /personagem → edite um atributo
# e veja o indicador de sync no cabeçalho mudar para "Salvo na nuvem".
```

O frontend **não tem Route Handlers locais** — todo acesso a dados passa pelo backend Express. A ficha funciona offline com `localStorage` e sincroniza quando a rede volta.

---

## 2. Mapa de componentes

### 2.1 Frontend (`Rpg-ficha`)

| Área | Arquivos | Responsabilidade |
|:---|:---|:---|
| Rotas (App Router) | `src/app/{page.js,layout.js,providers.jsx,globals.css}` | Landing page (`/`), shell global, providers, CSS dos temas |
| Ficha do jogador | `src/app/personagem/page.js` | 7 atributos, HP, perícias, raça/classe, popover de erros de sync |
| Demais módulos | `src/app/{inventario,banco,contratos,mundo,quarto,montaria,anotacoes,habilidades,mapa-tatico,perfil}/` | Inventário, cofre (80 slots + senha), contratos, NPCs, notas, montaria, habilidades, mapa tático, perfil |
| Auth | `src/app/{login,registro,convite}/` | Login, cadastro (com convite de campanha), aceitar convite |
| Painel do mestre | `src/app/admin/**` | Personagens, fichas dos jogadores, sessões, encontros, classes, mercado, mapa tático, NPCs, campanhas, notas, habilidades, auditoria |
| Contextos | `src/app/context/CharacterContext.js` · `AuthContext.jsx` · `DiceContext.jsx` · `ThemeContext.jsx` | **Estado global da ficha + sync** · sessão/perfil · rolador de dados · tema visual |
| Shell | `src/layouts/AppShell.jsx` | Navegação, guarda de rotas autenticadas, cabeçalho com HP/XP/sync |
| Componentes | `src/app/components/**` | Cabeçalho, SettingsModal, perícias, aparência, barra de HP, banco, dados (d20) |
| Lib (pura) | `src/lib/**` | `modifiers.js` (d20), `dice.js`, `api.js` (HTTP), `races.js`, `classes.js`, `abilities.js`, `items.js`, `leveling.js`, `mapaTatico.js`, `encounter.js`, `market.js`, `battleLog.js`, `themes.js`, `defaultCharacter.js`, `jwt.js` |
| Testes | `src/lib/__tests__/*.test.mjs` | 162 testes (node test runner, 18 arquivos) |

Padrões inegociáveis: regras de negócio vivem em `src/lib/` (puras, sem React); estado da ficha vive **somente** no `CharacterContext`; estilos via Tailwind 4 + CSS variables do tema (`data-theme` no `<html>`).

### 2.2 Backend (`Rpg-backend`)

| Área | Arquivos | Responsabilidade |
|:---|:---|:---|
| Bootstrap | `src/server.js` | Express, `trust proxy`, helmet, CORS por allowlist, rate limit, `/api/health` |
| Rotas | `src/routes/*.js` | `auth`, `characters`, `campanhas`, `classes`, `racas`, `mercado`, `mapaTatico`, `npc`, `encontros`, `sessoes`, `rolagem`, `arquivos`, `export`, `mestreRecursos` |
| Controllers | `src/controllers/*.js` | Regras de negócio por domínio (ex.: `characterController.sync`) |
| Models | `src/models/*.js` | Sequelize: User, Character, AtributosPersonagem, Campaign(Member), Class(Ability), Race, NPC, Encounter, Session/`SessaoAutenticacao`, AuditLog, LogBatalha, MapaTatico, Mercado*, Mount, Note… |
| Schemas | `src/schemas/apiSchemas.js` | **zod** — `fichaSchema` (todas as rotas de ficha usam o mesmo schema) |
| Serialização | `src/services/characterPublic.js` | `publicCharacter()` — formato canônico devolvido em TODO payload de personagem |
| Banco | `database/migrations/`, `database/migrate.js`, `database/backup.js` | Migrações idempotentes, backup/restore com retenção |
| Testes | `test/*.test.js` | 111 testes (node test runner) |

---

## 3. Fluxo da ficha: do input ao banco

1. **Hidratação** — ao logar, `AuthContext` chama `/auth/me`; o `CharacterContext` escolhe o personagem ativo (apenas fichas **do próprio usuário**; mestre sem ficha própria vê estado vazio) e `buildSheetFromActive()` monta o estado local a partir do retorno do backend (spread de `activeChar` + `dadosExtras` + atributos).
2. **Espelho local** — cada alteração grava no `localStorage` (`bruxeiro-sheet:v2:{userId}:{characterId}`) antes de qualquer rede — nada se perde com F5 ou offline. Chaves v1 legadas são limpas na montagem.
3. **Sync** — mudanças disparam um `useEffect` com **debounce de 800ms** → `normalizeCharacterForSync()` → `POST /api/characters/sync`.
4. **Concorrência otimista** — o payload leva `updatedAt` (versão do servidor conhecida). Se o servidor avançou (ex.: o mestre editou a ficha), o sync responde **409** e o jogador escolhe: *Manter da nuvem* (`reloadFromCloud`) ou *Manter meus dados* (`overwriteCloud`, reenvia com `force: true`).
5. **Rate limit / erros** — 4xx determinísticos (400/401/403/404/409/422) **não** repetem sozinhos; 401/403 exibem "Sair e entrar de novo".

### O que `normalizeCharacterForSync()` faz (e por quê)

- Recalcula os 7 atributos e espelha os aliases (`FOR`↔`forca`, `attributes.*`) — o backend consome os dois formatos.
- `raceId`/`classId`/`classeId` só vão no payload se casarem o regex de UUID (`asUuid()`); ids slug ("humano", "bruxeiro") do fallback estático seriam **422** no zod do backend.
- `classe` nunca vai como objeto (a associação Sequelize do backend chega como objeto; `asTextoCurto()` reduz a slug/nome/string curta).
- `race`/`class` vão como **slug** (`dadosExtras.race`/`dadosExtras.class`) — o backend refaz o vínculo FK pelo slug.

---

## 4. Protocolo de sincronização (sync)

| Situação | Comportamento |
|:---|:---|
| Sync com sucesso | `updatedAt` remoto guardado em `remoteVersionRef`; status "Salvo na nuvem"; contador de retentativa zera |
| 409 (conflito) | status `conflict`; UI âmbar "Conflito: revisão necessária" com os botões *Manter da nuvem* / *Manter meus dados*. Nunca sobrescreve automaticamente |
| Erro genérico (rede, 5xx, 408, 429) | status `error`; **retentativa automática** com backoff 5s → 10s → 20s → 40s → 60s, máx. 5 tentativas; o rascunho LOCAL é sempre preservado. Indicador mostra "tentativa automática n/5" |
| 401 / 403 | sem retentativa; botão "Sair e entrar de novo" (o token é inútil — ver seção 5) |
| 422 | sem retentativa; popover "N campo(s)" lista `field: message` retornado pelo servidor |
| Evento `online` do navegador | se a última falha era retentável, dispara nova tentativa imediatamente |
| Mestre / NPC `?inspect=<id>&type=npc` | ficha de monstro trabalha sobre cópia no `sessionStorage` e **nunca sincroniza** |
| Mestre sem ficha própria | cache anônimo **nunca** sincroniza (guard `!activeCharacter && !isNpcSheet`) |

Arquivos-chave: `src/app/context/CharacterContext.js` (efeito de sync, `retrySync`, `reloadFromCloud`, `overwriteCloud`, `scheduleAutoRetry`), `src/app/personagem/page.js` (indicador e popover).

---

## 5. Autenticação e sessões

- **Login/registro** retornam JWT (validade 7 dias) + sessão **server-side revogável** (`sessoes_autenticacao`, token guardado como hash SHA-256 no banco). Toda rota autenticada chama `verificarSessao()` — **apagar sessões no banco invalida o token na hora** (retorna 401 "Sessão revogada ou expirada"), mesmo que o JWT ainda seja válido.
- O frontend guarda o token em `localStorage` (`rpg_auth_token`) e valida contra `/auth/me` a cada carga; expiração local só esconde botões, o servidor é a fonte da verdade.
- **Consequência operacional**: campanhas/banco restaurados de dump antigo ou limpezas do `sessoes_autenticacao` deslogam todos os usuários silenciosamente — orientar re-login (e a própria ficha mostra o botão adequado no 401).
- Registro vincula a campanha via código de convite (`?convite=`); cadastro público cria perfil jogador.

---

## 6. Contrato da API e serialização

Regras que todo cliente deve respeitar (o frontend já respeita — se for tocar nele, leia antes):

- **Mesmo zod para create/update/sync**: `validar(fichaSchema)` → `fichaSchema` rejeita tipos errados com 422 e lista `errors[]` por campo. `z.object` faz strip silencioso de chaves desconhecidas — enviar chaves extras é inofensivo; enviar tipo errado em campo conhecido é 422.
- **`publicCharacter()`** é o formato de TODO payload de personagem (login, /auth/me, list, sync, PUT). Ele:
  - achata atributos (`forca…inteligencia` + aliases `FOR…INT`) — lê da associação `atributos` ou de `dadosExtras`;
  - resolve `raceId`/`classId`/`classSlug`/`className`/`hitDie` a partir das FKs `raca`/`classe` (ou dos slugs em `dadosExtras`);
  - **remove a chave `classe`** (a associação Sequelize chega como objeto e não é consumível por JSON de ficha — `className`/`classSlug` são os campos públicos);
  - remove `bankPassword`; mantém `pericias`/`inventory`/… em `dadosExtras`.
- **Jogador não altera progressão**: no sync, para não-mestres o backend descarta `xp`/`experiencia`/`level` (e preserva `dadosExtras.xp` do servidor). Mestres alteram normalmente.
- **Raça e classe**: o jogador escolhe **uma única vez**; depois só o mestre altera (`raceGuardError`/`classGuardError`). A classe define o **Dado de Vida**.
- **XP**: só o mestre distribui (encontros/sessões); o frontend faz `fetchCharacterFromBackend` antes de qualquer PUT e aborta se algum fetch falhar — nunca sobrescreve XP com baseline velho.

---

## 7. Modelo de dados (resumo)

- `personagens` — dados escalares da ficha (`name`, `hp`, `hpMax`, `level`, `experiencia`, `job`, FKs `racaId`/`classeId`, timestamps).
- `atributos_personagens` — os 7 atributos 1:1 com `personagens`.
- `dados_extras` (JSONB na própria `personagens`) — tudo que é da ficha mas não merece coluna: perícias, inventário, moedas, habilidades, `class`/`race` (slug), `hitDie`, anotações, cofre, montaria, `lastModifiedBy`.
- Catálogos: `classes`, `racas`, `classe_habilidades` (progressão por classe), `campanhas`, `campanha_membros`, `npcs`, `encontros`, `sessoes`, `mapa_tatico`, `mercado_*`, `itens_inventario` etc. Migrações idempotentes em `Rpg-backend/database/migrations/`; rodar `npm run db:migrate` no deploy.

Documentos detalhados: [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

---

## 8. Infraestrutura e deploy

| Camada | Plataforma | Deploy | Observações |
|:---|:---|:---|:---|
| Frontend | Vercel (projeto `front-rp`) | **automático** a cada push na `main` | `NEXT_PUBLIC_API_URL=https://rpg-backend-pmhk.onrender.com/api` (com `/api`!) |
| Backend | Render (Web Service) | **Manual Deploy** (não sobe sozinho no push) | `trust proxy` obrigatório (rate limit); health em `GET /api/health` |
| Banco | Supabase (PostgreSQL) | migrações via `npm run db:migrate` (idempotente) | idealmente antes do deploy da API |

Variáveis de ambiente:

| Var | Onde | Nota |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | Vercel / `.env.local` | deve terminar em `/api` (ex.: `http://localhost:3333/api`) |
| `DATABASE_URL` | Render | com SSL |
| `JWT_SECRET` | Render | ≥ 32 chars; rotacionar invalida todas as sessões |
| `CORS_ORIGIN` | Render | domínio exato do frontend (sem wildcard) |
| `AUTH_RATE_LIMIT` | Render | opcional; subir temporariamente sob abuso |
| `GOOGLE_CLIENT_ID/SECRET` | Render (se usado) | OAuth opcional |

Armadilhas de produção: disco do Render é **efêmero** (`private_uploads/` evapora — imagens privadas exigem object storage; o mapa-tático usa fundo por sessão/URL); `/api/arquivos/:id` serve com `Cross-Origin-Resource-Policy: cross-origin` para `<img>` da Vercel; Supabase já foi restaurado/truncado e derrubou sessões — o front exibe 401 com botão de re-login.

Detalhes operacionais: [`RUNBOOK-PRODUCAO.md`](./RUNBOOK-PRODUCAO.md) · [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) · [`BACKUP-RESTORE.md`](./BACKUP-RESTORE.md) · [`SEGURANCA.md`](./SEGURANCA.md).

---

## 9. Testes e comandos

```bash
# Frontend — 162 testes, node test runner
npm test                 # src/lib/__tests__/*.test.mjs
npm run build            # build de produção (Turbopack)
npm run lint             # eslint (0 erros; warnings pré-existentes são tolerados)
npm run dev              # desenvolvimento

# Backend — 111 testes
cd ../Rpg-backend && npm test
```

CI não roda os testes — **sempre rode local antes de commitar** (o padrão do repo é: build + lint + test verdes e só então commit/push).

---

## 10. Armadilhas conhecidas (sintoma → causa → fix)

| Sintoma | Causa raiz | Fix |
|:---|:---|:---|
| 422 "Dados inválidos" em todo save de ficha | `raceId`/`classId` no payload eram slugs não-UUID ("humano", "bruxeiro") do fallback estático | `asUuid()` no `normalizeCharacterForSync()` — omitir; backend refaz o vínculo pelo slug |
| 422 "`classe`: expected string, received object" | Backend serializava a associação Sequelize `classe` como objeto em `publicCharacter()` | `delete data.classe` no backend + `asTextoCurto()` no front; **backend exige Manual Deploy no Render** |
| 401 "Sessão revogada" em toda rota | Banco truncado/restaurado sem `sessoes_autenticacao` | Re-login; front mostra o botão no 401 |
| XP sempre 0 / mestre zerava XP ao editar | listagem não selecionava `experiencia` → `publicCharacter` mapeava `xp: 0` | Selecionar `experiencia` no `findAll`; PUT do mestre passa a trabalhar com o XP real |
| Mestre via a ficha de um jogador como se fosse dele | `AuthContext` selecionava `allChars[0]` (fichas de campanhas incluídas) | Seleção só de fichas próprias (`data.characters`); mestre vê estado vazio |
| Tela "levantava" a cada +/- de atributo | Linha de erro/indicador aparecia/sumia mudando o layout | Altura constante no cluster de sync (`min-h-8`/`h-4`) |
| Scroll parava antes do fim após conteúdo dinâmico | Lenis com limite stale | `lenis.resize()` na montagem, na troca de rota e no load |
| Mestre distribuir XP sobrescrevia XP com baseline velho | PUT direto sem refetch | Fresh-fetch de todos os heróis antes de qualquer PUT; aborta se algum falha |
| `?inspect=` do mestre sincronizava a cópia local na nuvem | guard `isNpcSheet` ausente | Cópia de trabalho em `sessionStorage`; nunca sincroniza |
| Ficha em branco/apagada após ações destrutivas | cache anônimo sincronizando | Guards `!activeCharacter && !isNpcSheet` |

---

## 11. Onde mexer em cada tipo de mudança

| Mudança | Arquivos |
|:---|:---|
| Regra de cálculo (atributo, perícia, nível) | `src/lib/modifiers.js`, `leveling.js`, `abilities.js` + testes em `__tests__/` |
| Novo campo na ficha | model `Character.js` + migration + `apiSchemas.js` (zod) + `defaultCharacter.js` + UI; sync precisa conhecê-lo (`normalizeCharacterForSync`) |
| Novo endpoint | `Rpg-backend/src/routes/*` + controller + zod schema + (se personagem) `publicCharacter()` |
| Comportamento de sync/erros | `CharacterContext.js` (`scheduleAutoRetry`, `retrySync`, efeito debounce) + `personagem/page.js` (indicador) |
| Visual/tema | `src/lib/themes.js`, `globals.css`, componentes em `src/app/components/` |
| Painel do mestre | `src/app/admin/**` (+ `AppShell.jsx` para navegação) |
| Mapa tático compartilhado | `mapa-tatico/page.js`, `src/lib/mapaTatico.js`, backend `mapaTaticoRoutes/Controller/Model` — ler a skill `mapa-tatico` do repo antes |

---

## 12. Índice de documentos

| Documento | Conteúdo |
|:---|:---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Este documento — sistema completo |
| [`RPG_RULES.md`](./RPG_RULES.md) | Regras: 7 atributos, fórmulas, modificadores, perícias |
| [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Modelo relacional e modelos Sequelize |
| [`RUNBOOK-PRODUCAO.md`](./RUNBOOK-PRODUCAO.md) | Deploy, monitoramento, incidentes, rotação de chaves |
| [`SEGURANCA.md`](./SEGURANCA.md) | Políticas de segurança |
| [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | Problemas comuns e soluções |
| [`AGENTS_AND_WORKFLOW.md`](./AGENTS_AND_WORKFLOW.md) | Equipe de agentes IA e workflow do repo |
| [`INSTALACAO.md`](./INSTALACAO.md) | Instalação detalhada do ambiente |
| [`docs/`](../docs) | Demais relatórios e auditorias históricas |
