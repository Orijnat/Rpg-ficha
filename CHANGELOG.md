# Changelog — Crônicas do Destino (Grimorium)

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/) · SemVer em `package.json` e tags git.

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
