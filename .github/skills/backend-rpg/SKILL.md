---
name: backend-rpg
description: "Workflow para evoluir Express, Sequelize, PostgreSQL, banco.sql, autenticação, autorização, campanhas e persistência completa da ficha RPG."
argument-hint: "Informe a entidade, endpoint ou regra de persistência."
user-invocable: true
---

# Skill Backend RPG

Use para modelos, schema, migrations, APIs, perfis jogador/mestre e dados
privados da campanha.

## Procedimento

1. Ler `.agents/memory/backend-database.md`.
2. Ler `.agents/memory/contrato-integracao.md`.
3. Mapear requisito para entidade, relacionamento e regra de acesso.
4. Preferir migrations versionadas e atualizar `banco.sql` quando solicitado.
5. Validar entrada, autorização, serialização e erros HTTP.
6. Rodar `node --check`, testes, validação SQL disponível e `git diff --check`.
7. Atualizar memória do backend e o handoff do contrato.
