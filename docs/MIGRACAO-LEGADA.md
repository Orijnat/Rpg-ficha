# 🔄 Estratégia de migração dos dados legados

## O que existe

- **`database/banco.sql`** — baseline: cria tipos/tabelas atuais **e migra tabelas legadas em inglês**
  (`users`, `characters`, `inventory_items`, `contracts`, `characters`…) para o schema canônico
  português, preservando dados (`dados_extras` recebe os JSONs antigos), e por último **remove as
  tabelas legadas** (`DROP TABLE IF EXISTS … CASCADE`).
- **`database/banco_v2.sql`** — reformulação idempotente (adiciona colunas novas, ajustes
  incrementais; só `ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS`).
- **`database/migrate.js`** — runner idempotente: aplica baseline (só se `usuarios` não existir),
  `banco_v2.sql`, depois as incrementais de `database/migrations/` em ordem.

## Caminho para bancos de dados antigos

1. Faça backup antes de tudo: `npm run db:backup`.
2. Rode `npm run db:migrate` — se o banco está no formato v2, a baseline é ignorada;
   para legado pré-v1, `banco.sql` roda e migra.
3. `bankPassword` legado em texto puro **não é migrado** (por desenho): a senha antiga
   é invalidada; o cofre passa a usar a senha do login ou uma personalizada nova.
4. Dados sensíveis em `dados_extras` (ex.: `bankPassword`) são removidos/saneados no v2.

## Dados legados do frontend (localStorage)

- `bruxeiro-sheet:v2:<userId>:<charId>` — cache local da ficha; sincronizado a cada edição
  (debounce 800ms). Ao restaurar a página com backend acessível, o servidor é a fonte da verdade.

## Verificação pós-migração

```bash
psql "$DATABASE_URL" -c "\dt"                 # tabelas esperadas presentes
psql "$DATABASE_URL" -c "SELECT count(*) FROM personagens"
psql "$DATABASE_URL" -c "SELECT count(*) FROM usuarios"
```

Se algo divergir, restaura-se o backup pré-migração (BACKUP-RESTORE.md).
