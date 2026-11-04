# ⚔️ Coisas a Fazer no Backend & Banco de Dados — Crônicas do Destino

> **Status do Documento**: Mapeamento arquitetural consolidado (Frontend ↔ Backend ↔ Banco de Dados).  
> **Última Atualização**: 04/11/2026.
> **Escopo**: Especificação técnica de todas as pendências para o backend REST (Express/Next.js Route Handlers) e banco relacional PostgreSQL com Sequelize ORM.

---

## 🗺️ 1. Mapeamento Geral do Sistema (Fullstack Tracing)

Este mapeamento conecta diretamente cada tela da interface com as necessidades de backend e as estruturas de persistência necessárias no PostgreSQL:

| Módulo / Tela Frontend | Entidade / Rota de API Necessária | Tabela PostgreSQL | Status Atual |
| :--- | :--- | :--- | :--- |
| **`/login` & `/registro`** | `POST /api/auth/login`<br>`POST /api/auth/register`<br>`GET /api/auth/me` | `users` | [x] Básico funcional<br>[ ] Refresh Token & Rate Limit |
| **`/personagem` (Ficha)** | `GET /api/characters/:id`<br>`POST /api/characters/sync`<br>`PUT /api/characters/:id` | `characters`<br>`character_attributes`<br>`character_skills` | [~] Sync otimista ativo<br>[x] Migrations & Schemas Zod |
| **`/inventario`** | `GET /api/characters/:id/inventory`<br>`PUT /api/characters/:id/inventory` | `inventory_items` | [~] Persistido em JSONB<br>[ ] Tabela relacional normalizada |
| **`/banco` (Cofre)** | `POST /api/characters/:id/bank/verify`<br>`PUT /api/characters/:id/bank` | `characters.bank_password_hash`<br>`bank_slots` | [~] Verificação básica<br>[x] Hash bcrypt na senha do cofre |
| **`/contratos` (Missões)** | `GET/POST/PUT /api/characters/:id/contracts` | `contracts` | [~] Embutido na ficha<br>[ ] Relacionamento 1:N |
| **`/anotacoes` & Imagens** | `POST /api/uploads/images`<br>`GET /api/characters/:id/notes` | `character_notes`<br>`media_uploads` | [ ] Validação MIME real e storage privado |
| **`/admin/campanhas`** | `GET/POST /api/campanhas`<br>`GET/PUT/DELETE /api/campanhas/:id` | `campaigns` | [~] Mock nativo criado<br>[x] Isolamento multi-tenant real |
| **Gestão de Membros** | `POST /api/campanhas/join`<br>`GET /api/campanhas/:id/membros`<br>`PUT/DELETE /api/campanhas/:id/membros/:userId` | `campaign_members` | [x] Controle de acesso e bloqueio |
| **`/admin/npcs` (Bestiário)**| `GET/POST /api/npcs`<br>`GET/PUT/DELETE /api/npcs/:id`<br>`POST /api/npcs/:id/duplicar` | `npcs` | [~] Mock nativo criado<br>[x] Model PostgreSQL com tags e variantes |
| **`/admin/encontros`** | `GET/POST /api/campanhas/:id/encontros`<br>`PUT /api/encontros/:id`<br>`POST /api/campanhas/:id/iniciativa/ficha` | `encounters`<br>`encounter_combatants`<br>`combat_logs` | [~] Sincronização de ficha criada<br>[ ] Persistência de rodadas e histórico |
| **`/admin/mapas` & Névoa** | `GET/POST /api/campanhas/:id/mapas`<br>`PUT/DELETE /api/mapas/:id` | `maps`<br>`map_markers` | [ ] Revelação controlada server-side |
| **`/admin/notas` (Segredos)** | `GET/POST /api/campanhas/:id/notas`<br>`PUT/DELETE /api/notas/:id` | `campaign_notes` | [ ] Filtragem estrita de `is_private` no controller |
| **`/admin/sessoes`** | `GET/POST /api/campanhas/:id/sessoes`<br>`PUT /api/sessoes/:id` | `game_sessions`<br>`session_objectives` | [ ] Checklist e cálculo de XP/recompensas |
| **Auditoria & Confirmação** | `GET /api/campanhas/:id/auditoria` | `audit_logs` | [ ] Tabela de log de mutações sensíveis |
| **Google Drive / Sheets** | `GET /api/google/oauth/url`<br>`GET /api/google/status`<br>`DELETE /api/google/connection` | `google_integrations` | [~] OAuth estruturado<br>[ ] Sincronização bidirecional de planilhas |

---

## 🗄️ 2. Arquitetura do Banco de Dados Relacional (PostgreSQL)

### 2.1. Tabelas Centrais a Modelar / Migrar

#### `users` (Controle de Acesso e Autenticação)
- `id`: UUID (PK, `gen_random_uuid()`)
- `username`: VARCHAR(50) UNIQUE NOT NULL
- `email`: VARCHAR(120) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL (bcrypt)
- `role`: VARCHAR(20) NOT NULL DEFAULT 'jogador' (`jogador` | `mestre` | `admin`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### `characters` (Ficha do Herói)
- `id`: UUID (PK)
- `user_id`: UUID (FK -> `users.id` ON DELETE CASCADE)
- `campaign_id`: UUID (FK -> `campaigns.id` ON DELETE SET NULL, NULLABLE)
- `name`: VARCHAR(100) NOT NULL
- `job`: VARCHAR(60) NOT NULL (Classe/Ocupação)
- `level`: INTEGER NOT NULL DEFAULT 1
- `hp`: INTEGER NOT NULL DEFAULT 10
- `hp_max`: INTEGER NOT NULL DEFAULT 10
- `pe`: INTEGER NOT NULL DEFAULT 0 (Pontos de Esforço)
- `pe_max`: INTEGER NOT NULL DEFAULT 0
- `bp`: INTEGER NOT NULL DEFAULT 0 (Bônus de Proficiência / Bravura)
- `attributes`: JSONB NOT NULL (FOR, DES, CON, SAB, ESP, CAR, INT)
- `skills`: JSONB NOT NULL (19 perícias canônicas)
- `currencies`: JSONB NOT NULL (`latina`, `ouro`, `prata`, `cobre`)
- `bank_password_hash`: VARCHAR(255) NULLABLE (senha criptografada do cofre)
- `notes`: TEXT NULLABLE
- `room_notes`: TEXT NULLABLE
- `appearance`: JSONB NULLABLE (idade, olhos, pele, peso, altura, cabelo, descrição)
- `created_at` / `updated_at` / `deleted_at`: TIMESTAMPS (Soft delete)

#### `campaigns` (Mundo & Mesas do Mestre)
- `id`: UUID (PK)
- `mestre_id`: UUID (FK -> `users.id` ON DELETE RESTRICT)
- `nome`: VARCHAR(120) NOT NULL
- `descricao`: TEXT NULLABLE
- `cenario`: VARCHAR(100) NULLABLE
- `estado`: VARCHAR(30) NOT NULL DEFAULT 'planejamento' (`planejamento` | `ativa` | `pausada` | `arquivada`)
- `codigo_convite`: VARCHAR(20) UNIQUE NOT NULL
- `banner_url`: VARCHAR(255) NULLABLE
- `dados_extras`: JSONB NULLABLE
- `created_at` / `updated_at`: TIMESTAMPS

#### `campaign_members` (Associação Jogadores ↔ Campanhas)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE)
- `user_id`: UUID (FK -> `users.id` ON DELETE CASCADE)
- `character_id`: UUID (FK -> `characters.id` ON DELETE SET NULL, NULLABLE)
- `papel`: VARCHAR(30) NOT NULL DEFAULT 'jogador' (`jogador` | `co-mestre`)
- `status`: VARCHAR(30) NOT NULL DEFAULT 'aprovado' (`pendente` | `aprovado` | `bloqueado`)
- `bloqueado`: BOOLEAN NOT NULL DEFAULT FALSE
- `joined_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- *Constraint*: `UNIQUE(campanha_id, user_id)`

#### `npcs` (Bestiário e Personagens do Mestre)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE, NULLABLE para monstros globais)
- `mestre_id`: UUID (FK -> `users.id` ON DELETE CASCADE)
- `nome`: VARCHAR(120) NOT NULL
- `papel`: VARCHAR(80) NOT NULL (Ex: Chefe, Lacaio, Guarda)
- `hp`: INTEGER NOT NULL DEFAULT 10
- `hp_max`: INTEGER NOT NULL DEFAULT 10
- `ca`: INTEGER NOT NULL DEFAULT 10
- `iniciativa`: INTEGER NOT NULL DEFAULT 0
- `attitude`: VARCHAR(30) NOT NULL DEFAULT 'Hostil' (`Aliado` | `Neutro` | `Hostil` | `Chefe`)
- `status`: VARCHAR(30) NOT NULL DEFAULT 'Ativo' (`Ativo` | `Inconsciente` | `Derrotado` | `Fugiu`)
- `tags`: JSONB NOT NULL DEFAULT '[]'
- `avatar`: VARCHAR(255) NULLABLE
- `acoes`: JSONB NOT NULL DEFAULT '[]'
- `habilidades_especiais`: JSONB NOT NULL DEFAULT '[]'
- `notas_mestre`: TEXT NULLABLE (Segredos restritos ao mestre)
- `duplicado_de`: UUID (Self-reference FK -> `npcs.id`, NULLABLE)
- `last_modified_by`: JSONB NULLABLE
- `created_at` / `updated_at`: TIMESTAMPS

#### `encounters` (Combates e Encontros Táticos)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE)
- `nome`: VARCHAR(120) NOT NULL
- `status`: VARCHAR(30) NOT NULL DEFAULT 'preparando' (`preparando` | `em_andamento` | `pausado` | `encerrado`)
- `rodada_atual`: INTEGER NOT NULL DEFAULT 1
- `turno_indice`: INTEGER NOT NULL DEFAULT 0
- `combatentes`: JSONB NOT NULL DEFAULT '[]'
- `historico_acoes`: JSONB NOT NULL DEFAULT '[]' (Log de dano, cura, turnos)
- `recompensas`: JSONB NOT NULL DEFAULT '{"xp": 0, "ouro": 0, "itens": []}'
- `created_at` / `updated_at`: TIMESTAMPS

#### `maps` (Mapas Táticos & Névoa de Guerra)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE)
- `titulo`: VARCHAR(120) NOT NULL
- `imagem_url`: VARCHAR(255) NOT NULL
- `descricao`: TEXT NULLABLE
- `publico`: BOOLEAN NOT NULL DEFAULT FALSE
- `nevoa_ativa`: BOOLEAN NOT NULL DEFAULT TRUE
- `marcadores`: JSONB NOT NULL DEFAULT '[]' (Coordenadas X%, Y%, título, tipo, oculto)
- `areas_ocultas`: JSONB NOT NULL DEFAULT '[]'
- `created_at` / `updated_at`: TIMESTAMPS

#### `game_sessions` (Sessões e Registro Narrativo)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE)
- `numero`: INTEGER NOT NULL
- `titulo`: VARCHAR(120) NOT NULL
- `data_agendada`: DATE NULLABLE
- `status`: VARCHAR(30) NOT NULL DEFAULT 'planejada' (`planejada` | `em_andamento` | `finalizada`)
- `resumo_pos_jogo`: TEXT NULLABLE
- `cenas`: JSONB NOT NULL DEFAULT '[]'
- `objetivos`: JSONB NOT NULL DEFAULT '[]' (Checklist de metas)
- `recompensas`: JSONB NOT NULL DEFAULT '{"xp": 0, "ouro": 0, "itens": []}'
- `created_at` / `updated_at`: TIMESTAMPS

#### `campaign_notes` (Diário & Segredos)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE)
- `autor_id`: UUID (FK -> `users.id` ON DELETE CASCADE)
- `titulo`: VARCHAR(150) NOT NULL
- `conteudo`: TEXT NOT NULL
- `tipo`: VARCHAR(30) NOT NULL DEFAULT 'anotacao' (`anotacao` | `pista` | `lore` | `segredo`)
- `is_private`: BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` / `updated_at`: TIMESTAMPS

#### `audit_logs` (Trilha de Auditoria Solene)
- `id`: UUID (PK)
- `campanha_id`: UUID (FK -> `campaigns.id` ON DELETE CASCADE, NULLABLE)
- `usuario_id`: UUID (FK -> `users.id` ON DELETE SET NULL)
- `usuario_nome`: VARCHAR(80) NOT NULL
- `usuario_role`: VARCHAR(30) NOT NULL
- `acao`: VARCHAR(80) NOT NULL (Ex: `EXCLUSAO_NPC`, `BANIMENTO_MEMBRO`, `ALTERACAO_HP`)
- `entidade`: VARCHAR(60) NOT NULL (Ex: `npcs`, `campaign_members`, `characters`)
- `entidade_id`: VARCHAR(100) NOT NULL
- `dados_anteriores`: JSONB NULLABLE
- `dados_novos`: JSONB NULLABLE
- `ip_address`: VARCHAR(45) NULLABLE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

---

## 📋 3. Checklist de Implementação do Backend & Banco

### 🧱 Fase 1: Banco de Dados & Migrations Versionadas
- [x] Configurar Sequelize CLI e criar migration baseline em `database/migrations/`.
- [~] Consolidar migrations das entidades em arquivos separados; atualmente existe
  uma migration baseline que aplica `database/banco.sql`.
- [x] Substituir o uso de `sequelize.sync({ alter: true })` por execução formal de migrations.
- [~] Criar script de Seeds (`npm run db:seed`) com mestre, dois jogadores,
  personagens, campanha e NPC; o mapa de exemplo ainda não é criado pelo seed.

---

### 🛡️ Fase 2: Schemas de Validação (Zod) & DTOs Padronizados
- [x] Instalar e configurar `zod` para validação em nível de middleware.
- [x] Criar schemas de autenticação, ficha, campanhas, NPCs, encontros e notas.
- [x] Criar middleware de validação para rejeitar payloads inválidos com `422 Unprocessable Entity`.
- [x] Padronizar o formato de erro da API:
  ```json
  {
    "status": "error",
    "statusCode": 400,
    "code": "VALIDATION_FAILED",
    "message": "Dados inválidos enviados na requisição.",
    "errors": [{ "field": "hp", "message": "HP deve ser um número positivo." }]
  }
  ```

---

### 🔒 Fase 3: Autenticação, Autorização e Isolamento Multi-Tenancy
- [x] Implementar middleware de autenticação (extração e verificação do JWT Bearer).
- [x] Implementar controle `requireMaster` e autorização equivalente nos controladores de campanha.
- [x] Implementar controle de acesso às campanhas:
  - Garante que mestres só acessem campanhas criadas por eles (`mestre_id === req.user.id`);
  - Garante que jogadores só acessem campanhas onde constam em `campaign_members` com status `aprovado`.
- [x] Implementar controle de proprietário do personagem:
  - Jogador só altera a própria ficha (`character.user_id === req.user.id`), a menos que o mestre da campanha ativa esteja editando administrativamente.
- [x] Implementar filtragem server-side estrita de anotações:
  - Na rota `GET /api/campanhas/:id/notas`, se `req.user.role !== 'mestre'`, aplicar filtro SQL `WHERE is_private = false OR autor_id = :userId`.
- [x] Criptografar a senha do cofre bancário com `bcrypt` antes de salvar.
- [x] Implementar proteção contra Brute Force na rota de verificação de cofre com bloqueio temporário após 5 tentativas incorretas.

---

### ⚡ Fase 4: Endpoints da Ficha do Jogador & Sincronização
- [x] Refatorar `POST /api/characters/sync`:
  - Normalizar aliases legado (`FOR`, `DES`, `inventory`, `contracts`) salvando em colunas canônicas;
  - Responder `{ success: true, character: { ... } }`;
  - Gravar `last_modified_by` e `last_modified_at`.
- [x] Implementar `GET /api/characters` com isolamento por usuário/campanha.
- [x] Adicionar paginação (`?page=1&limit=20`) e busca por nome (`?busca=Thorne`).
  - Retornar apenas personagens do usuário autenticado (ou todos se for mestre em sua campanha);
- [x] Implementar `POST /api/campanhas/:id/iniciativa/ficha`:
  - Recebe o valor de iniciativa rolado na ficha do jogador e insere/atualiza na lista de combatentes do encontro ativo da mesa.

---

### 👑 Fase 5: Endpoints da Área do Mestre
- [x] **Campanhas**:
  - `GET /api/campanhas`: Lista campanhas autorizadas;
  - `POST /api/campanhas`: Cria campanha com código de convite único;
  - `PUT /api/campanhas/:id`: Atualiza dados da campanha;
  - `DELETE /api/campanhas/:id`: Exclui com registro em `audit_logs`.
- [x] **Membros & Convites**:
  - `POST /api/campanhas/join`: Jogador entra com código de convite;
  - `GET /api/campanhas/:id/membros`: Lista membros autorizados;
  - `PUT /api/campanhas/:id/membros/:userId`: Promove ou bloqueia membro;
  - `DELETE /api/campanhas/:id/membros/:userId`: Expulsa membro da campanha.
- [x] **Bestiário & NPCs**:
  - `GET /api/npcs`: Catálogo de NPCs;
  - `POST /api/npcs`: Cadastro de criatura;
  - `POST /api/npcs/:id/duplicar`: Cria clone ou variante;
  - `DELETE /api/npcs/:id`: Remove criatura com auditoria.
- [x] **Combate & Encontros**:
  - `GET /api/campanhas/:id/encontros`: Lista encontros;
  - `POST /api/campanhas/:id/encontros`: Cria novo combate;
  - `PUT /api/encontros/:id`: Atualiza o encontro;
  - `POST /api/encontros/:id/log`: Registro de eventos permanece pendente.
- [~] **Mapas & Névoa de Guerra**:
  - [x] `GET/POST /api/campanhas/:id/mapas`: Lista e cadastra mapas;
  - [x] `PUT /api/mapas/:id`: Atualiza marcadores e revelação;
  - [ ] Upload com validação MIME e armazenamento privado.
- [x] **Sessões Narrativas**:
  - `GET/POST /api/campanhas/:id/sessoes`: implementado;
  - `PUT /api/sessoes/:id/concluir`: implementado pelo endpoint de atualização.
- [x] **Auditoria**:
  - `GET /api/campanhas/:id/auditoria`: Retorna histórico de mutações sensíveis.

---

### 🧪 Fase 6: Testes Automatizados & Qualidade de Backend
- [ ] Testes de integração de autenticação (registro com sucesso, senha fraca, login inválido, JWT expirado).
- [ ] Testes de integridade de ficha (sync com atributos calculados, recusa de atributos negativos ou corrompidos).
- [x] Testes de barreira multi-tenant nos guards offline.
- [x] Testes de filtragem de notas privadas nos guards offline.
- [ ] Testes de combate (ordem de iniciativa, avanço de rodada ao atingir o último combatente).
- [x] Testes de carga e limites de payload (`express.json({ limit: '2mb' })`).

> **Estado da Fase 6**: testes unitários de schemas, CORS, healthcheck e limite
> de payload implementados. Os testes de integração com PostgreSQL continuam
> pendentes até existir um banco de teste configurado.

---

### 🚀 Fase 7: Segurança de Produção & Infraestrutura
- [x] Configurar CORS restrito com lista de origens confiáveis (`FRONTEND_URL`).
- [x] Adicionar headers de segurança com `helmet` (Content-Security-Policy, HSTS, X-Content-Type-Options).
- [x] Configurar Rate Limiting (`express-rate-limit`):
  - 100 requisições/minuto por IP em rotas gerais;
  - 5 tentativas/minuto em `/api/auth/login` e `/api/auth/register`.
- [x] Mascarar dados sensíveis em logs (senhas, tokens e respostas completas nunca entram no console).
- [x] Adicionar Healthcheck probe (`GET /api/health`) para orquestradores (Docker/Kubernetes).

> **Estado da Fase 7**: hardening aplicado no Express. As configurações de
> origem, limite JSON e segredo JWT devem ser fornecidas pelas variáveis de
> ambiente em produção.
