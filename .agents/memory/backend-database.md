# Memória do Sub-agente: backend-database

## 🎯 Escopo e Responsabilidade
Modelagem de dados, PostgreSQL, Sequelize ORM e endpoints de Route Handlers no Next.js 16 para persistência e sincronização de fichas.

---

## 🗄️ Esquema de Dados Planejado
- **Entidade `Character`**:
  - `id`: UUID (Primary Key).
  - `name`: VARCHAR(100).
  - `hp`: INTEGER, `hpMax`: INTEGER.
  - `age`, `eyes`, `height`, `skin`, `weight`, `hair`, `appearance`: VARCHAR/TEXT.
  - `attributes`: JSONB (`FOR, DES, CON, SAB, ESP, CAR, INT`).
  - `skills`: JSONB (Array de perícias com `trained`, `bonus`).
  - `currencies`: JSONB (`latina, ouro, prata, cobre`).
  - `bankSlots`: JSONB (80 slots de cofre).
  - `bankPassword`: VARCHAR(30).
  - `notes`, `roomNotes`: TEXT.
  - `mountName`, `mountHP`, `mountHPMax`, `mountNotes`: campos ou relação de montaria.

---

## 📂 Arquivos Sob Gestão Deste Sub-agente
- **Backend Separado** (`/home/crs/projetos/aa/Rpg-backend/`):
  * `src/config/database.js` (Conexão Sequelize + PostgreSQL com pooling)
  * `src/models/Character.js` (Entidade com os 7 atributos e módulos)
  * `src/models/InventoryItem.js` (Itens do inventário)
  * `src/models/Contract.js` (Missões e contratos)
  * `src/models/index.js` (Relacionamentos e exportação)
  * `src/controllers/characterController.js` (CRUD, sync otimista e verificação do cofre)
  * `src/routes/characterRoutes.js` (Rotas REST)
  * `src/server.js` (Express com auto-sync do PostgreSQL)
- **Frontend** (`/home/crs/projetos/aa/Rpg-ficha/`):
  * `src/lib/api.js` (Cliente HTTP com debounce para o backend)
  * `src/app/context/CharacterContext.js` (Sincronização em segundo plano)

---

## 📌 Histórico de Alterações e Decisões
- **2026-10-15**:
  - Definição da stack de persistência: PostgreSQL + Sequelize ORM.
  - **Decisão Arquitetural (ADR-005)**: Backend desacoplado em diretório próprio (`/home/crs/projetos/aa/Rpg-backend`) rodando Express.js com Sequelize v6.
  - Criação completa da API REST com suporte a auto-sync do banco (`sequelize.sync({ alter: true })`).
  - Integração do frontend Next.js com sincronização em segundo plano via `CharacterContext` mantendo fallback offline local no `localStorage`.

---

## 📋 Próximas Ações
- [x] Configurar conexão inicial do Sequelize com PostgreSQL.
- [x] Criar os models `Character`, `InventoryItem` e `Contract` com Sequelize e validações.
- [x] Criar endpoint `POST /api/characters/sync` e `GET /api/characters/:id`.
- [x] Criar cliente de sincronização no frontend com debounce.

