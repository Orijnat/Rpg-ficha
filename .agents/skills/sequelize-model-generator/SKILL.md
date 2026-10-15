---
name: sequelize-model-generator
description: Gera modelos e migrations do Sequelize para PostgreSQL adaptados ao Next.js e à ficha de RPG.
---

# Skill: Sequelize Model Generator

Esta skill orienta a criação de tabelas e modelos no PostgreSQL utilizando o Sequelize ORM.

## Padrões Arquiteturais:
1. **Singleton de Conexão no Next.js**:
   - Manter a instância do Sequelize global em desenvolvimento para evitar estouro de conexões com hot-reloading:
   ```javascript
   // src/db/sequelize.js
   import { Sequelize } from 'sequelize';
   import pg from 'pg';

   let sequelize;
   if (!global._sequelizeInstance) {
     global._sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
       dialect: 'postgres',
       dialectModule: pg,
       logging: process.env.NODE_ENV === 'development' ? console.log : false,
     });
   }
   sequelize = global._sequelizeInstance;
   export default sequelize;
   ```
2. **Campos do Modelo Character**:
   - `id`: UUID ou INTEGER PK.
   - `name`: STRING(100), not null.
   - `hp`, `hpMax`: INTEGER, not null.
   - `attributes`: JSONB contendo `{ FOR, DES, CON, SAB, ESP, CAR, INT }`.
   - `skills`: JSONB contendo array de perícias.
   - `currencies`: JSONB `{ latina, ouro, prata, cobre }`.
   - `bankSlots`: JSONB (array de 80 posições).
   - `bankPassword`: STRING(20).
