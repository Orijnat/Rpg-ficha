# Changelog — Crônicas do Destino (Grimorium)

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/) · SemVer em `package.json` e tags git.

## [Não lançado] — 2026-11-15

### Segurança
- `lib/jwt.js`: verificação de assinatura com comparação em tempo constante (`TimingSafeEqual`) e fim do fallback silencioso de emissão `unsigned` (agora falha fechado); testes de round-trip/adulteração/expiração.
- Front: sessão restaurada usa exclusivamente o payload de `/auth/me` (o `sessionStorage` não promove mais `perfil` para mestre); `rpg_auth_user` não é mais persistido (menos PII em repouso).
- Backend com `trust proxy` (Render/proxies) — rate limiter funciona atrás do proxy (commit `04a2a5c`).
- `helmet` com `Cross-Origin-Resource-Policy: cross-origin` — imagens da API carregam na Vercel/front cross-origin (commit `77cc96a`).
- Mapa tático: ACL do `PATCH /api/mapa-tatico` — membro cria miniatura (oculto forçado `false`), move/tamanho/`hp`/`icone` de existentes; tokens ausentes nunca são apagados por membro; `hpMax`/renomear/ocultar/config de mesa ficam com o mestre (commit `e4b7eb9`).

### Adicionado
- Ícones de miniatura personalizáveis (24 chaves Lucide; enum compartilhado com o backend; seletor no painel do alvo).
- Fundo do mapa **por sessão** (object URL local) e por **URL externa** (`urlFundo` compartilhado com a mesa; commit `c1c1365`) — sem object storage.
- Suíte offline de ACL do mapa tático (`test/mapa_tatico.test.js`, 14 casos) e paridade de ícones no frontend (`mapa-tatico.test.mjs`).
- Skills do projeto: `mapa-tatico` e `render-supabase-producao` (`.agents/skills` + `.github/skills`).
- Troubleshooting: erros de produção (ERR_ERL_*, `email_verified` 42703, imagens CORP/efêmeras); runbook com notas de proxy/CORP/disco efêmero.

### Corrigido
- Bug "miniatura some ao adicionar": merge restrito do membro + paleta NPC visível a jogadores (commits `e4b7eb9`/`76243c7`).
- Login quebrando em produção (X-Forwarded-For + migrations ausentes no Supabase).
- 54× `text-[9px]` → `text-[10px]` (piso de legibilidade, A11y).

### Alterado
- Ícones do mapa extraídos para `src/lib/mapaTatico.js` com suíte de paridade (`mapa-tatico.test.mjs`); dead code removido da página.
- `npm audit fix` seguro aplicado (typescript-eslint 8.59.4 → 8.72.2, devDeps).

## [Não lançado] — 2026-11-14

### Segurança
- `bankPassword`/`bankPasswordHash` nunca retornam em payloads da API; cofre abre com senha personalizada (bcrypt por ficha) ou com a senha do login do dono; fallback legado `"133313"` eliminado.
- Sessões server-side (`sessoes_autenticacao`): logout e redefinição de senha revogam tokens de imediato; JWT válido ≠ sessão válida.
- `/api/npcs?q=` montado com `[Op.and]` — vazamento de NPCs/notas entre mesas eliminado.
- Uploads: validação por magic bytes (PNG/JPEG/GIF/WebP/PDF), bloqueio de extensões ativas, armazenamento fora do público, nomes internos aleatórios, autorização em leitura/escrita/exclusão, URLs de leitura assinadas (15 min).
- Sync com concorrência otimista: `updatedAt` ecoado; 409 com `serverCharacter`; UI "Manter da nuvem" / "Manter meus dados".

### Adicionado
- Verificação de e-mail no registro (link single-use, 24h; banner reenviável; reenvio anti-enumeração) e redefinição de senha por e-mail.
- Rolagens persistidas (`POST/GET /api/rolagens`) com ACL por mesa/ficha; histórico por sessão de combate.
- Runner de migrações idempotente `database/migrate.js` (baseline protegida; sem sequelize-cli).
- `database/backup.js` (backup `pg_dump`, `--restore` com confirmação, `--prune` com retenção de 30 dias).
- Índices de reforço: notas privadas por campanha, encontros ativos por campanha, iniciativa única por combatente/encontro.
- Catálogo de classes/hit die (`src/lib/classes.js`) com sugestão de `hitDie` no cadastro.
- Temas: tema claro **Névoa de Avalon** ganhou CSS próprio; acentos claros escurecidos para WCAG AA/AAA.

### Corrigido
- `PUT /encontros/:id` aceitava `dadosExtras`/`novoEventoLog` (combate salvava novamente).
- `?campanhaId=` exige posse/membership; `/campanhas/:id` não entrega mais banco/cofre/segredos a membros.
- "Restaurar padrão" não sobrescreve mais a ficha na nuvem; importação de backup confirma antes.
- `players` ↔ `jogadores` sincroniza; companheiros não somem no reload.
- `themes.test.mjs` desatualizado (paleta alinhada THEMES ↔ CSS).

### Alterado
- 270 cores hex canônicas substituídas por tokens `var(--theme-*)` (21 arquivos).
- `window.location` evitado; navegação via App Router; layout server + `next/font` (sem fontes render-blocking); `next/dynamic` para modais de dados.

## [1.0.0] — 2026-10 (linha de base anterior a este changelog)

Fichas, perícias, rolagem com vantagem/desvantagem, temas, inventário, banco, contratos, montaria, diário,
área do mestre, campanhas/convites, combate tático, sessões e notas com privacidade server-side.
