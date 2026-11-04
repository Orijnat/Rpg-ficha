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

## 🤝 Coordenação entre agentes
- Agente operacional: `.github/agents/backend-database.agent.md`.
- Skill principal: `.github/skills/backend-rpg/SKILL.md`.
- Antes de alterar modelos, rotas ou schema, consultar `.agents/memory/contrato-integracao.md`.
- Registrar no contrato mudanças de DTO, status HTTP, aliases e regras de autorização.
- O arquivo canônico de planejamento SQL é `database/banco.sql` no backend.

## Investigação de integração — 2026-11-04

- O backend existente foi comparado com `src/lib/api.js`: autenticação, personagens,
  campanha legada (`/api/campanha`) e NPCs usam os mesmos caminhos esperados pelo
  frontend.
- Correções cirúrgicas aplicadas no backend (sem tocar no frontend): respostas de
  login/registro/me não expõem `bankPassword`; cadastro público não aceita promoção
  de perfil; atualização de perfil não permite autoelevação; vínculo de personagem
  a campanha valida proprietário/membro; mestres ficam isolados às próprias
  campanhas; membros só podem ser listados por usuário autorizado; e NPCs validam
  proprietário/membro antes de ler ou alterar.
- `/api/campanha` passou a encaminhar GET/PUT para o controlador legado, mantendo
  `/api/campanhas` para a coleção moderna.
- O backend já possuía alterações locais amplas antes desta análise; elas foram
  preservadas e não houve reset/commit.

## Implementação inicial — 2026-11-04

- Adicionados `database/migrations/20261104120000-inicial.js`, `.sequelizerc`
  e `config/config.cjs`; a migration usa `banco.sql` como baseline e é
  executada por `npm run db:migrate`. O servidor não usa `sequelize.sync`.
- Adicionados `src/schemas/apiSchemas.js` e `src/middlewares/validate.js`.
  Registro/login e mutações de personagens filtram payloads e retornam 422
  padronizado em falha de schema.
- Healthchecks live/ready e limite JSON de 1 MB foram adicionados.
- Validação executada com `node --check`; os testes do backend são executados com
  `npm test`.
- Pendente: executar migration contra PostgreSQL disponível e criar testes de
  contrato; validar o baseline contra todas as colunas físicas esperadas pelos
  modelos atuais.

## Entrega dos requisitos do backend — 2026-11-04

- Migrations agora são descobertas pelo Sequelize CLI em
  `database/migrations/20261104120000-inicial.js`; o bootstrap não chama
  `sequelize.sync()`.
- Validação Zod foi ampliada para campanhas, convites, membros, NPCs, notas e
  encontros, com resposta 422 em `{ status, statusCode, code, message, errors }`.
- Atributos canônicos e aliases da ficha aceitos pela API ficam restritos a
  inteiros de 1 a 30; payloads de autenticação continuam estritos.
- Verificação do cofre usa bcrypt para novos valores e bloqueia temporariamente
  após cinco falhas consecutivas por usuário/personagem.
- Incluídos `npm test` com testes de schema e `npm run db:seed`, que exige
  `SEED_PASSWORD` de pelo menos 12 caracteres e não grava credenciais no código.
- Validação executada: 3 testes, `node --check`, `git diff --check`, descoberta
  do Sequelize CLI e smoke tests dos endpoints `/health/live`, `/health/ready`
  e validação 422. PostgreSQL não está disponível nesta máquina, portanto a
  aplicação da migration permanece pendente em ambiente de banco real.

## Gaps P0/P1 implementados — 2026-11-04

- `GET /api/characters` mantém a resposta legada em array sem parâmetros; com
  `page`, `limit`, `search`/`q` retorna `{ characters, pagination }`, limita
  `limit` a 100 e pesquisa por `name`/`job` com `ILIKE`.
- A entidade de sessão de jogo foi corrigida para `sessoes_jogo`; o nome
  `sessoes_autenticacao` do banco é reservado a tokens. O modelo foi exportado,
  a tabela/índices/checks foram adicionados a `database/banco.sql` e as rotas
  existentes do controlador foram registradas em
  `/api/campanhas/:campanhaId/sessoes` e `/api/campanhas/sessoes/:id`.
- Encontros, mapas, notas e sessões agora verificam proprietário ou membro
  ativo da campanha no servidor. Mestres não acessam campanhas de terceiros;
  mutações ficam restritas ao proprietário. A sincronização de iniciativa não
  busca/cria mais encontro em campanha arbitrária.
- Adicionados testes sem banco para parser de paginação e guard de perfil.
- Validação local: `npm test` (9 testes), `node --check` em `src`/`test` e
  `git diff --check` passaram.
- Pendente: aplicar `database/banco.sql` em PostgreSQL e testar constraints,
  índice, `findAndCountAll`, associação de membros e todos os endpoints com
  dados reais; não há PostgreSQL disponível neste ambiente.
