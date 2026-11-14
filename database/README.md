# database/ (legado — não usar)

As migrations CJS `users/campaigns/characters` que existiam aqui criavam um schema
**incompatível** com o banco real (`usuarios`, `personagens`, `campanhas`...). A
fonte de verdade do schema é o backend:

- `Rpg-backend/database/banco.sql` (baseline) → `banco_v2.sql` (reformulação)
- `Rpg-backend/database/migrations/*.js` (ESM, transacionais, via `npm run db:migrate`)
- Modelos Sequelize em `Rpg-backend/src/models/`

Este diretório permanece apenas como histórico no git (ver `git log -- database/`).
