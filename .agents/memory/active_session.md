# Sessão Ativa — Mapeamento Fullstack & Criação do Checklist de Backend

## Reformulação Profissional de Banco de Dados PostgreSQL (`banco-de-dados-ops`) — 2026-11-06

- **Diagnóstico de DBA & Engenharia de Dados**:
  * Mapeamento completo dos 6 domínios de negócio: IAM/Segurança, Campanhas/Mesas, Ficha/Regras d20, Sessões Narrativas, Tático/Iniciativa e Recursos/Mídia.
  * Identificação e resolução de anti-patterns:
    1. Descontinuação do uso de `JSONB` amorfo para colunas funcionais de combate (`pontos_esforco`, `insanidade`, `bonus_pericia`, `classe_armadura`, `moedas`), promovendo-as a colunas fortemente tipadas e validadas com `CHECK`.
    2. Eliminação da redundância de `usuarios.dados_mestre` em favor das tabelas relacionais dedicadas (`sessoes_jogo`, `npcs`, `encontros`, `iniciativas`).
    3. Indexação sistemática de todas as Foreign Keys (prevenindo table locks em cascata) e criação de índices parciais para códigos de convite e sessões JWT ativas.
    4. Garantia estrita do princípio de reversibilidade: DDL estruturado com script bidirecional (`UP` e `DOWN`).
- **Artefatos Entregues**:
  * Relatório e Dicionário de Dados 3NF no artefato `reformulacao-postgresql-dba.md`.
  * Script SQL canônico compilado em [`/home/cledi/rp/Rpg-backend/database/banco_v2.sql`](file:///home/cledi/rp/Rpg-backend/database/banco_v2.sql).

## Instalação da Skill Especialista `banco-de-dados-ops` — 2026-11-06

- **Origem**: Repositório `flowgrammers-skills` (`https://github.com/ricardonevesbraga/flowgrammers-skills/tree/main/codigo-automacao/banco-de-dados-ops`).
- **Detecção de Agentes e Ambientes**:
  * **Claude Code**: Identificado diretório `~/.claude/skills/`. Arquivo gravado em [`~/.claude/skills/banco-de-dados-ops.md`](file:///home/cledi/.claude/skills/banco-de-dados-ops.md).
  * **Google Antigravity / Projeto RPG**: Gravado e integrado ao ecossistema em [`/home/cledi/rp/Rpg-ficha/.agents/skills/banco-de-dados-ops/SKILL.md`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/banco-de-dados-ops/SKILL.md) e espelhado em [`/home/cledi/rp/Rpg-ficha/.github/skills/banco-de-dados-ops/SKILL.md`](file:///home/cledi/rp/Rpg-ficha/.github/skills/banco-de-dados-ops/SKILL.md).
- **Conteúdo da Skill**:
  * Princípios de modelagem relacional (1NF, 2NF, 3NF e desnormalização consciente).
  * Tipos de dados brasileiros padronizados (CPF, CNPJ, CEP em VARCHAR; moeda em DECIMAL; TIMESTAMPTZ).
  * Estratégias de indexação e uso mandatório de `EXPLAIN ANALYZE`.
  * Migrations versionadas estritas com UP e DOWN (rollback garantido).
  * Boas práticas de LGPD, Charset UTF-8 pt_BR e políticas de retenção.
- **Validação**: Criação física e integridade dos arquivos confirmadas em todos os diretórios.

## Mecânica Completa de Criação de Mesas, Links de Convite e Vínculo no Cadastro — 2026-11-06

- **Demanda do Usuário**:
  * Implementação de mecânica de criação de campanhas/mesas ("RPs") e links de convite compartilháveis gerados pelo mestre.
  * Suporte a múltiplas sessões/mesas simultâneas para evitar que qualquer usuário entre na mesma sessão sem restrição.
  * O jogador informa o código de convite (ou acessa diretamente via link de convite) ao criar a conta, vinculando a conta e o novo personagem à mesa específica.

- **Arquitetura Implementada**:
  1. **Backend (`Rpg-backend`)**:
     - [`src/schemas/apiSchemas.js`](file:///home/cledi/rp/Rpg-backend/src/schemas/apiSchemas.js): `registroSchema` atualizado para aceitar `inviteCode`, `codigoConvite`, `perfil` e `role`.
     - [`src/controllers/authController.js`](file:///home/cledi/rp/Rpg-backend/src/controllers/authController.js):
       * `register`: valida o código de convite na tabela `campanhas`.
       * Se válido, associa imediatamente o novo usuário à mesa via `CampaignMember` (`papel: "jogador"`), vincula a coluna `campanhaId` do primeiro personagem criado à campanha e registra auditoria (`ENTRADA_MEMBRO_CADASTRO`).
     - [`src/controllers/campanhaController.js`](file:///home/cledi/rp/Rpg-backend/src/controllers/campanhaController.js):
       * Adicionado método público `consultarConvitePublico`: retorna dados sanitizados da mesa (`nome`, `descricao`, `estado`, `mestre`, `codigoConvite`) sem requerer autenticação prévia.
       * `entrarPorCodigo`: atualizado para vincular o personagem do usuário à campanha caso ainda esteja sem `campanhaId`.
     - [`src/routes/campanhaRoutes.js`](file:///home/cledi/rp/Rpg-backend/src/routes/campanhaRoutes.js): registrada rota pública `GET /api/campanhas/convite/:codigo` antes do middleware de autenticação.
     - [`test/validation.test.js`](file:///home/cledi/rp/Rpg-backend/test/validation.test.js): adicionado teste unitário para cadastro com código de convite.
  2. **Frontend (`Rpg-ficha`)**:
     - [`src/lib/api.js`](file:///home/cledi/rp/Rpg-ficha/src/lib/api.js):
       * `registerUser`: repassa `inviteCode` no payload JSON.
       * Adicionadas funções `fetchInviteInfo(inviteCode)` e `generateInviteLink(inviteCode)`.
     - [`src/app/admin/campanhas/page.js`](file:///home/cledi/rp/Rpg-ficha/src/app/admin/campanhas/page.js):
       * Exibição do código de convite, botão "Copiar Link de Convite" com URL canônica e botão "Texto p/ Discord / WhatsApp" com mensagem pronta de convocação.
     - [`src/app/admin/page.js`](file:///home/cledi/rp/Rpg-ficha/src/app/admin/page.js):
       * Adicionado seletor de mesa/sessão ativa ("Todas as Mesas" ou campanhas específicas).
       * Filtro em tempo real de heróis e iniciativa por campanha.
       * Botão de cópia rápida do link de convite diretamente na Sala de Guerra do mestre.
     - [`src/app/registro/page.jsx`](file:///home/cledi/rp/Rpg-ficha/src/app/registro/page.jsx):
       * Captura automática de `?invite=...` ou `?convite=...` da URL.
       * Seção IV "Mesa de RPG & Convite" com validação em tempo real e badge ilustrada com o nome da mesa e mestre convocado.
       * Fallback elegante protegido por `<Suspense>`.
     - [`src/app/login/page.jsx`](file:///home/cledi/rp/Rpg-ficha/src/app/login/page.jsx):
       * Preservação do parâmetro de convite e redirecionamento para aceitação de mesa pós-login.
     - [`src/app/convite/[code]/page.js`](file:///home/cledi/rp/Rpg-ficha/src/app/convite/[code]/page.js):
       * Nova página temática Dark Fantasy para recepção de convidados.
       * Para não-autenticados: botão "Criar Conta & Ingressar" (direcionando para cadastro com convite preenchido) e "Fazer Login".
       * Para autenticados: botão "Aceitar Convocação e Entrar na Mesa" vinculando o herói ativo.
     - [`src/app/perfil/page.js`](file:///home/cledi/rp/Rpg-ficha/src/app/perfil/page.js):
       * Seção "Sua Mesa & Convites" para ingresso manual de jogadores já registrados através de código.
     - [`src/lib/__tests__/invite.test.mjs`](file:///home/cledi/rp/Rpg-ficha/src/lib/__tests__/invite.test.mjs):
       * 3 testes unitários para geração de links e consumo seguro de dados de convite.
- **Validação**:
  * Backend: 10/10 testes unitários aprovados (`npm test`).
  * Frontend: 31/31 testes unitários aprovados (`node --test`).
  * Build de produção Next.js 16 (Turbopack): compilado com sucesso com todas as 25 rotas.
  * Validação de integridade Git (`git diff --check`): 0 erros.

## Blindagem Completa da Atribuição de Perfil Mestre/Jogador no Cadastro — 2026-11-05

- **Ajustes Implementados**:
  1. [`src/app/registro/page.jsx`](file:///home/cledi/rp/Rpg-ficha/src/app/registro/page.jsx):
     - Botões de seleção de papel ("Mestre" e "Jogador") reforçados com semântica acessível (`role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label`).
     - Badge visual dourada explícita de "Ativo" e realce de borda ao selecionar.
     - Payload de cadastro atualizado para enviar `perfil` (`mestre`/`jogador`) e `role` (`master`/`player`).
  2. [`src/lib/api.js`](file:///home/cledi/rp/Rpg-ficha/src/lib/api.js):
     - `registerUser` agora repassa fielmente `perfil` e `role` no corpo da requisição JSON para o backend.
  3. [`src/app/context/AuthContext.jsx`](file:///home/cledi/rp/Rpg-ficha/src/app/context/AuthContext.jsx):
     - Ao cadastrar com a opção Mestre, o contexto garante `perfil: "mestre"` no estado, sincroniza imediatamente com o backend via `updateProfileOnBackend` e persiste em `sessionStorage`.
     - No `initAuth`, a reidratação preserva o perfil de mestre mesmo em atualizações de página.
- **Validação**: 27 testes unitários 100% aprovados e build Next.js 16 (25 rotas) compilado sem erros.


## Correção de Perfil de Mestre no Cadastro (`registerUser`) — 2026-11-05

- **Problema Reportado**: Ao selecionar a opção "Mestre" na tela de cadastro, o usuário não tem acesso à tela de mestre (`/admin`).
- **Diagnóstico**:
  * Em `src/lib/api.js`, a função `registerUser` desestruturava apenas `{ username, email, password, characterName, characterJob, customClass }`, descartando as propriedades `perfil` e `role`.
  * Com isso, o payload enviado ao backend via `POST /api/auth/register` chegava sem a indicação de perfil, e o backend atribuía o perfil padrão `jogador`.
- **Correções Aplicadas**:
  1. `src/lib/api.js`: `registerUser` atualizada para repassar `perfil` (`mestre`/`jogador`) e `role` (`master`/`player`) no body JSON.
  2. Fornecido comando SQL para promover a conta já criada diretamente no Supabase (`UPDATE usuarios SET role = 'mestre'`).
  3. Alternativa via tela `/perfil` (seletor de perfil no sistema e salvar).
- **Validação**: 27 testes unitários aprovados com 100% de sucesso e build Turbopack concluído com 25 rotas.


## Resolução de Falha no Schema: Colunas de Atributos Faltantes em `personagens` — 2026-11-05

- **Diagnóstico Preciso via Log do Render**:
  * Autenticação de usuário e conexão SSL com o Supabase **funcionaram 100%** (usuário `0b1b3bc2-7f3f-41eb-9905-3559b3b6c16c` localizado e validado).
  * O erro 500 no login ocorreu em `authController.js:156:26` ao executar `Character.findAll`:
    `SequelizeDatabaseError: column "forca" does not exist` na tabela `personagens`.
  * **Causa**: O model Sequelize `Character` define os 7 atributos em colunas diretas (`forca`, `destreza`, `constituicao`, `sabedoria`, `espirito`, `carisma`, `inteligencia`) e campos legados em camelCase (`"bankSlots"`, `"bankPassword"`, `"roomNotes"`, `"mountName"`, etc.), mas a tabela baseline `personagens` no Supabase foi criada sem essas colunas.
- **Solução Arquitetural Aplicada**:
  * Fornecido script SQL idempotente com `ADD COLUMN IF NOT EXISTS` para ser executado no **SQL Editor** do Supabase.
  * O script adiciona todos os campos de atributos e metadados que o Sequelize `Character` requisita no `SELECT`, resolvendo a consulta do login e das fichas de uma vez por todas.


## Diagnóstico de Erro Interno (HTTP 500) no Login — 2026-11-05

- **Problema Reportado**: "Erro interno no servidor ao tentar login."
- **Causa Raiz Identificada**:
  * O erro 500 retornado pelo endpoint `POST /api/auth/login` no backend (`https://rpg-backend-pmhk.onrender.com/api/auth/login`) é a consequência direta do problema de autenticação do PostgreSQL no Supabase (`password authentication failed for user postgres`) ou ausência de variáveis essenciais (`JWT_SECRET` / `DATABASE_URL`) no Render.
  * Quando a `DATABASE_URL` no Render está com senha incorreta ou caracteres especiais não codificados, ou quando o banco não consegue autenticar, qualquer query (`User.findOne`) falha com `SequelizeConnectionError`, resultando no status HTTP 500.
  * Se o banco estiver ok mas o usuário tentar fazer login sem antes ter criado a conta (ou rodado seed), um banco conectado normalmente retornaria 401 ("Usuário ou senha incorretos"); o retorno 500 confirma falha na infraestrutura/banco.
- **Ações Imediatas Orientadas**:
  1. Corrigir a variável `DATABASE_URL` no painel do Render com a senha redefinida no Supabase;
  2. Garantir que a variável `JWT_SECRET` esteja preenchida no Render (chave secreta longa para assinatura dos tokens);
  3. Checar a aba **Logs** do Render para confirmar o status da conexão do Sequelize (`Database connection established`);
  4. Realizar o primeiro cadastro na tela `/registro` do frontend (Vercel) para criar o usuário inicial.


## Resolução de Falha de Autenticação do PostgreSQL (Supabase/Render) — 2026-11-05

- **Diagnóstico do erro `password authentication failed for user postgres`**:
  * Identificado que o erro ocorre na conexão do backend (`Rpg-backend` no Render ou local) com o PostgreSQL do Supabase via `DATABASE_URL`.
  * Causas mapeadas com a skill `supabase-database-config` e agente `backend-database`:
    1. Senha com caracteres especiais (`@`, `#`, `%`, etc.) que não foram codificados via URL-encode na string URI;
    2. Usuário incompleto no Session Pooler (`postgres` em vez do formato exigido pelo Supavisor: `postgres.ofkjgxnxmfwjmtscktts`);
    3. Senha incorreta ou divergente da definida no provisionamento do Supabase.
- **Plano de Resolução**:
  * Orientar o reset imediato da senha do banco no painel do Supabase (Project Settings ➔ Database ➔ Reset database password).
  * Instruir o uso de senha alfanumérica limpa e a montagem da `DATABASE_URL` canônica no Render.
  * Checklist e validação de continuidade.


## Renomeação da Aplicação para Grimorium — 2026-11-05

- Atendendo à solicitação do usuário, o título da aplicação foi atualizado de "Fichas de RPG: Grimório" para **"Grimorium"**.
- Atualizados os componentes:
  * [`src/layouts/AppShell.jsx`](../src/layouts/AppShell.jsx): `document.title = "Grimorium"` e título da sidebar desktop.
  * [`src/app/components/Cabecalho.jsx`](../src/app/components/Cabecalho.jsx): título principal da ficha (`Grimorium`).
  * [`src/app/page.js`](../src/app/page.js): logotipo, cabeçalho e rodapé da landing page.
- Validação: 27 testes unitários 100% aprovados e build em execução.

## Backend Publicado no Render & Integração Final com Vercel — 2026-11-05

- Usuário disponibilizou a URL do backend gerada pelo Render: `https://rpg-backend-pmhk.onrender.com`.
- Confirmada a estrutura das rotas: a base de API é `https://rpg-backend-pmhk.onrender.com/api`.
- Instruído o usuário a registrar a variável de ambiente `NEXT_PUBLIC_API_URL` na Vercel e disparar o Redeploy para injetar as credenciais no build do Next.js 16.
- Sistema fullstack completo atingido: Frontend (Vercel) ➔ Backend (Render) ➔ Banco Relacional (Supabase PostgreSQL).

## Frontend Publicado na Vercel — 2026-11-05

- Usuário disponibilizou a URL pública da Vercel: `https://rpg-ficha-one.vercel.app/` (HTTP 200 validado com sucesso).
- Configuração exata para o `CORS_ORIGIN` no Render: `https://rpg-ficha-one.vercel.app` (ou em conjunto com `http://localhost:3000`).
- Próximo passo: obter a URL do backend gerada pelo Render para atualizar a variável `NEXT_PUBLIC_API_URL` na Vercel e re-deployar.

## Orientação sobre Configuração de CORS no Render — 2026-11-05

- Usuário questionou qual valor deve ser inserido em `CORS_ORIGIN` no Render.
- Esclarecido que o CORS precisa ser o endereço do **Frontend** (Vercel), sem wildcard (`*`), pois a validação de segurança em `src/middlewares/security.js` proíbe `*`.
- Instruído a utilizar inicialmente `http://localhost:3000` e adicionar a URL definitiva da Vercel (separada por vírgula) assim que o deploy do frontend for realizado.

## Execução das Migrations e Criação das Tabelas no Supabase — 2026-11-05

- Usuário salvou a `DATABASE_URL` no arquivo `.env` do backend (`Rpg-backend`).
- Testada a conectividade com o Supabase: autenticação e conexão estabelecidas com sucesso via Session Pooler (porta 5432).
- Ajustado `config/config.cjs` no backend com auto-detecção de SSL para Supabase em todos os ambientes e comitado/enviado para o GitHub (`origin/main`).
- Executada com êxito a migration baseline (`npm run db:migrate`), criando todas as 20 tabelas relacionais do sistema no Supabase:
  `usuarios`, `personagens`, `campanhas`, `membros_campanha`, `atributos_personagem`, `pericias_personagem`, `itens_inventario`, `contratos`, `npcs`, `encontros`, `iniciativas`, `anotacoes`, `imagens`, `cofres`, `montarias`, `recursos_campanha`, `auditoria`, `sessoes_jogo`, `sessoes_autenticacao`, `SequelizeMeta`.
- Próximo passo: subir o backend no Render (Web Service) e apontar o frontend na Vercel para a URL gerada.

## Validação da Connection String do Supabase — 2026-11-05

- Usuário forneceu a Connection String obtida no Supabase: `postgresql://postgres.ofkjgxnxmfwjmtscktts:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`.
- Confirmada a exatidão da URI (Session Pooler na porta `5432`, com host `aws-0-us-east-1.pooler.supabase.com` e usuário `postgres.ofkjgxnxmfwjmtscktts`).
- Instruído o preenchimento da senha real no lugar de `[YOUR-PASSWORD]` e os próximos passos para aplicar na `DATABASE_URL` do `Rpg-backend` e rodar as migrações.

## Modal de Conexão do Supabase Localizado — 2026-11-05

- Usuário acessou com sucesso o modal "Connect to your project".
- Orientado a clicar na opção **"ORM"** (selecionando Sequelize ou Node) ou em **"Direct (Connection string)"** para exibir a string URI do PostgreSQL.

## Navegação no Novo Layout do Supabase — 2026-11-05

- Usuário relatou o menu do novo design do painel Supabase (onde `Database` foi movido ou integrado).
- Orientado o caminho no novo layout: o botão destacado **"Connect"** no cabeçalho superior do projeto, ou o menu lateral principal **Database** (ícone de cilindro de banco).

## Identificação do Projeto Supabase — 2026-11-05

- Usuário enviou a URL REST do projeto Supabase: `https://ofkjgxnxmfwjmtscktts.supabase.co/rest/v1/`.
- Identificado o ID do projeto Supabase: `ofkjgxnxmfwjmtscktts`.
- Orientado o usuário que esta é a URL da API REST (PostgREST), e fornecida a estrutura exata da Connection String PostgreSQL (`DATABASE_URL`) necessária para o Sequelize, faltando apenas a senha definida por ele na criação.

## Guia Rápido: O que é necessário do Supabase — 2026-11-05

- Usuário perguntou objetivamente o que é necessário extrair do Supabase.
- Sintetizado em um único dado essencial: a **Connection String (URI) do PostgreSQL**, com instruções exatas de onde copiar no painel do Supabase.

## Renomeação da Aplicação — 2026-11-05 (Fichas de RPG: Grimório)

- Atendendo à solicitação do usuário, o título da aplicação foi alterado de "Coração da Montanha" para "Fichas de RPG: Grimório".
- Atualizados: `src/layouts/AppShell.jsx` (título da página e topo da sidebar), `src/app/components/Cabecalho.jsx` (cabeçalho da ficha) e `src/app/page.js` (marca, hero e rodapé da landing page).
- Validação: 27 testes unitários aprovados, build Next.js 16 (Turbopack) 100% OK e `git diff --check` aprovado.

## Esclarecimento sobre API Key vs Connection String — 2026-11-05

- Usuário perguntou se o valor solicitado seria uma "API Key".
- Esclarecida a diferença entre:
  1. Connection String / URI do banco de dados PostgreSQL (que começa com `postgres://...`).
  2. API Key / Anon Key do Supabase (usada apenas quando se usa o SDK frontend do Supabase, o que não é o caso aqui, pois usamos Sequelize).
  3. JWT Secret (chave secreta simétrica HMAC-SHA256 para assinatura dos tokens).

## Consulta sobre Hospedagem do Backend — 2026-11-05

- Usuário perguntou como hospedar o backend (`Rpg-backend`).
- Apresentado o guia passo a passo para hospedar o backend Express no Render (gratuito) conectado ao PostgreSQL no Supabase, utilizando a skill `fullstack-web-publisher`.

## Continuidade — 2026-11-05 (Definição do Método de Hospedagem)

- O usuário escolheu a importação direta pelo site da Vercel conectada ao GitHub.
- Fornecido o passo a passo com o link direto para publicação e orientações para o backend/banco de dados.

## Consulta sobre Hospedagem — 2026-11-05

- Usuário perguntou se o agente pode hospedar o sistema.
- Explicada a necessidade de autenticação de conta na nuvem (Vercel/Render) por envolver credenciais pessoais e infraestrutura externa.
- Disponibilizados os métodos: via Token de API no terminal ou via conexão direta com o repositório GitHub.

## Solicitação de Deploy — 2026-11-05 (Upar a Aplicação)

- Usuário solicitou a publicação direta da aplicação na web.
- Ambos os repositórios (`Rpg-ficha` e `Rpg-backend`) encontram-se comitados, validados e sincronizados em suas respectivas branches `main` no GitHub (`https://github.com/Orijnat/Rpg-ficha` e `https://github.com/Orijnat/Rpg-backend`).
- Verificada a ausência de tokens pré-autenticados de nuvem (`VERCEL_TOKEN` / `~/.vercel`) no terminal local.
- Apresentadas as duas vias imediatas: importação via GitHub na Vercel (1 clique) ou autenticação via Vercel CLI com token.

## Criação das Skills de Deploy Web & Nuvem (Vercel, Supabase, Fullstack) — 2026-11-05

- Criada a skill `vercel-deployment`: procedimentos de deploy de Next.js na Vercel (CLI e Git integration), variáveis de ambiente (`NEXT_PUBLIC_API_URL`), headers e troubleshooting de CORS/build.
- Criada a skill `supabase-database-config`: provisionamento de PostgreSQL no Supabase, Session Pooler (porta 5432), SSL obrigatório no Sequelize e execução de migrations versionadas.
- Criada a skill `fullstack-web-publisher`: fluxo integrado de 5 fases para colocar no ar o sistema completo (Supabase DB + Render/Railway Backend + Vercel Frontend), variáveis mútuas e smoke test.
- Todas as skills foram espelhadas tanto em `.agents/skills/` quanto em `.github/skills/`.
- Adicionado arquivo `vercel.json` na raiz para compatibilidade otimizada.
- No backend (`Rpg-backend`), adicionada auto-detecção inteligente de SSL para conexões com Supabase (`pooler.supabase.com`).
- Validação: 27 testes frontend aprovados, 9 testes backend aprovados e build Turbopack concluído com sucesso.

## Publicação e Commit — 2026-11-05 (Sidebar Dark Fantasy)

- Consolidadas as alterações da sidebar desktop integrada ao padrão visual Dark Fantasy.
- Realizado commit e push para `origin/main` após validação completa de testes e build.

## Restauração do Padrão de Cores Dark Fantasy com Sidebar Mantida — 2026-11-05

- O usuário aprovou a sidebar (rail lateral desktop), mas solicitou o retorno do padrão de cores anterior.
- Restaurados todos os tokens, fontes (Cinzel / Crimson Text / Inter), auras radiais de iluminação ambiente dinâmicas e o tema Dark Fantasy original (`--theme-bg`, `#0b0d12`, etc.).
- Preservada a sidebar fixa à esquerda no desktop (`lg:w-64`) e barra móvel horizontal em telas menores no `AppShell.jsx`, com topo temático "Grimório - Coração da Montanha".
- `Cabecalho.jsx` restaurado com moldura `ornate-frame` e fontes serifadas, mantendo o recuo `lg:ml-64` para perfeita harmonia com a barra lateral.
- `Card` em `ui.js` e tokens de scrollbar e campos em `globals.css` restaurados para a identidade dark fantasy.
- Validação: 27 testes unitários aprovados com 100% de sucesso e `git diff --check` aprovado.

## Continuidade — 2026-11-04 (Frontend vinculado ao Rpg-backend)

- Cliente HTTP confirmado em `src/lib/api.js` com `NEXT_PUBLIC_API_URL`.
- Route Handlers locais de `src/app/api` removidos para manter uma única API.
- Sessões migradas da campanha JSON para os endpoints de sessões do backend.
- Frontend build aprovado; lint mantém apenas warnings preexistentes.
- Backend `npm test` aprovado (9 testes).
- Estado final: `git diff --check`, build do frontend e testes do backend aprovados.
- A pasta local `src/app/api` foi removida após confirmar que estava vazia e sem
  consumidores; o frontend permanece dependente de `Rpg-backend`.

## Refinamento visual transversal — 2026-11-05

- Aprimorados tokens globais, textura/iluminação, scrollbar e seleção.
- Refinados shell, navegação, cabeçalho e componente `Card` sem alterar API ou
  regras de negócio.
- Build aprovado; lint sem erros com warnings preexistentes.

## Repaginação visual — 2026-11-05

- Alterações anteriores foram commitadas em `06dcdc0`.
- Nova direção visual aplicada: editorial/tática clara, diferente do tema
  ornamentado anterior, com navegação lateral desktop e barra horizontal mobile.
- Build aprovado, lint sem erros e `git diff --check` aprovado.
- Nova repaginação permanece não commitada para revisão.

## Correção OAuth Google — 2026-11-04

- Corrigida a busca da URL OAuth: o frontend não redireciona mais para o JSON do
  endpoint; ele extrai `data.url` e segue para o Google.
- Corrigida a leitura do token no callback, removendo o prefixo `#`.
- Build, lint e testes do backend aprovados; lint mantém somente warnings
  preexistentes.

## Remoção do Google — 2026-11-04

- Removido o botão e callback Google do frontend, incluindo Google Workspace da
  sala do mestre.
- Removidos rotas, controllers, services, dependência `googleapis` e variáveis
  Google do backend.
- Testes backend 9/9, build frontend e diff check aprovados.

**Data/Hora**: 2026-10-27T11:35:30-03:00  
**Agente Responsável**: `backend-database` + `frontend-artisan`

---

## 🗺️ Entregas Realizadas Nesta Etapa

### Continuidade — 2026-10-27 (Correção da Navbar em Telas de Autenticação)
- **Diagnóstico**: O componente `AppChrome` em [`src/app/layout.js`](../src/app/layout.js) renderizava incondicionalmente o `Cabecalho`, a `nav` (com as abas de personagem) e o botão flutuante de dados em todas as rotas, inclusive em `/login` e `/registro`.
- **Ajustes Implementados**:
  * Condicionada a exibição de `Cabecalho`, `nav` e `DiceFloatingTrigger` através de `hideNavigation = isAuthRoute || isStandaloneSheet`.
  * Em telas de autenticação (`/login` e `/registro`), `<main>` agora utiliza `min-h-screen flex items-center justify-center p-4`, centralizando com perfeição o card temático de login na tela.
  * Adicionado hook de proteção de rotas no `AppChrome`, redirecionando usuários não autenticados para `/login` e usuários autenticados para `/personagem` ou `/admin`.
- **Validação**: `npm run build` aprovado (33 rotas); `node --test` aprovado (23 testes).

### Continuidade — 2026-10-27 (Sessões e Perfis via JWT Tokens)
- **Implementação do Módulo JWT**:
  * [`src/lib/jwt.js`](../src/lib/jwt.js): emissão assinado HMAC-SHA256 (`signJwt`), validação criptográfica e temporal (`verifyJwt`), decodificação client-side segura (`decodeJwt`), extração de sessão (`getUserFromToken`) e normalização canônica dos perfis `mestre`/`jogador` e roles `master`/`player`.
  * [`src/lib/__tests__/jwt.test.mjs`](../src/lib/__tests__/jwt.test.mjs): 5 testes unitários cobrindo normalização, emissão/verificação, detecção de adulteração, expiração e extração de sessão.
- **Backend Express (`Rpg-backend`)**:
  * [`src/controllers/authController.js`](file:///home/cledi/rp/Rpg-backend/src/controllers/authController.js): adicionados métodos `updateProfile` (com emissão de novo token com perfil atualizado) e `logout` (com registro de data de encerramento).
  * [`src/middlewares/authMiddleware.js`](file:///home/cledi/rp/Rpg-backend/src/middlewares/authMiddleware.js): `req.user.isMestre()`, `req.user.isJogador()`, `req.tokenPayload` e middlewares de controle de acesso `requireMaster` e `requirePlayer`.
  * [`src/routes/authRoutes.js`](file:///home/cledi/rp/Rpg-backend/src/routes/authRoutes.js): rotas `PUT /me` e `POST /logout` registradas.
- **Next.js App Router (Rotas Standalone em `src/app/api/auth/`)**:
  * Rotas criadas: [`login/route.js`](../src/app/api/auth/login/route.js), [`register/route.js`](../src/app/api/auth/register/route.js), [`me/route.js`](../src/app/api/auth/me/route.js) (GET e PUT) e [`logout/route.js`](../src/app/api/auth/logout/route.js).
- **Interface e Contexto**:
  * [`src/app/context/AuthContext.jsx`](../src/app/context/AuthContext.jsx): reidratação de perfil a partir do JWT, método `switchProfile` e captura de novo token em updates.
  * [`src/app/perfil/page.js`](../src/app/perfil/page.js): seletor de perfil no sistema e painel informativo da sessão ativa (ID da sessão, expiração e perfil codificado).
- **Validação**: `node --test` aprovado com 23 testes (100%); `npm run build` aprovado com 33 rotas; `node --check` no backend aprovado.

### Continuidade — 2026-10-27 (Verificação e Conclusão dos Itens do Jogador)
- Verificados minuciosamente todos os 9 tópicos da **Seção 2 (Frontend do jogador)** de [`COISAS-A-FAZER.md`](../COISAS-A-FAZER.md).
- Ajustes finos implementados:
  * [`src/app/components/BarrraHp.jsx`](../src/app/components/BarrraHp.jsx): `hpMax` agora respeita `disabled={!isMaster}`, bloqueando visualmente com cadeado e tooltip quando visualizado por jogador.
  * [`src/app/components/Pericia.jsx`](../src/app/components/Pericia.jsx), [`src/app/contratos/page.js`](../src/app/contratos/page.js), [`src/app/inventario/page.js`](../src/app/inventario/page.js): adicionados `role="checkbox"`, `aria-checked` e `aria-label` descritivos para navegação completa por teclado e leitores de tela.
  * [`src/app/layout.js`](../src/app/layout.js): integradas abas de **Diário** (`/anotacoes`) e **Perfil** (`/perfil`) na barra de navegação global rápida (`TABS`).
- [`COISAS-A-FAZER.md`](../COISAS-A-FAZER.md): marcados todos os itens da Seção 2 como concluídos (`[x]`).
- Validação: `npm run build` aprovado (29 rotas); bateria de testes `node --test src/lib/__tests__/*.test.mjs` aprovada (18 suítes / testes 100% OK); `npm run lint` concluído com 0 erros.
- Próximo passo recomendado: avançar para a Fase 1 do backend em [`COISAS-A-FAZER-BACKEND.md`](../COISAS-A-FAZER-BACKEND.md) (migrations versionadas e seeds) ou consolidar documento de regras oficiais da Seção 1.

### Continuidade — 2026-10-27 (Etapa Anterior)
- Implementados recursos/validações da ficha: peso por item na capacidade de carga, limites numéricos inteiros, dependências HP/PE/Insanidade/BP, bloqueios visuais de campos do mestre e aliases de perfil `mestre`/`jogador`.
- Adicionadas edição de perfil e encerramento remoto de sessão em [`src/app/perfil/page.js`](../src/app/perfil/page.js), [`src/app/context/AuthContext.jsx`](../src/app/context/AuthContext.jsx) e [`src/lib/api.js`](../src/lib/api.js).
- Exportação JSON agora usa `character` e remove `bankPassword`; desbloqueio do banco tenta verificação remota antes do fallback offline.
- A navegação Admin fica oculta para jogadores; foco visível, alvos mínimos e `prefers-reduced-motion` foram reforçados em [`src/app/globals.css`](../src/app/globals.css).
- Validação: `npm run build` aprovado; testes `node --test src/lib/__tests__/*.test.mjs` aprovados; lint sem erros, com warnings preexistentes de efeitos React.
- Próximo passo recomendado: validar manualmente login/perfil/logout, importação sem segredo, banco online/offline e fluxos responsivos; considerar testes E2E e corrigir warnings de `setState` em efeitos.

### Continuidade — 2026-11-04 (Criação da skill de adaptação GitHub)
- Criada a skill compartilhada [`github-structure-adapter`](../.github/skills/github-structure-adapter/SKILL.md).
- Objetivo: analisar a arquitetura de um repositório GitHub e adaptar sua estrutura ao projeto atual, sem copiar cegamente código, segredos, histórico Git ou identidade visual.
- Incluído fluxo de inspeção, obtenção segura, matriz `reutilizar/adaptar/substituir/ignorar/bloqueado`, implementação incremental e validação.
- Próximo passo recomendado: usar `/github-structure-adapter` com uma URL e escopo concretos.

### Continuidade — 2026-11-04 (Adaptação da estrutura do projeto hospital)
- Analisado `Orijnat/teste-crs`, subpasta `sistema/hospitalFront/hospital`, commit `39533638b450ec0b7d5cf1ded04bcd8d4468021f`.
- A referência usa Next.js App Router com separação em `src/layouts`, `src/utils` e `src/middlewares`.
- Adaptado somente o padrão estrutural útil: criado [`src/layouts/AppShell.jsx`](../src/layouts/AppShell.jsx) e extraído o shell global de [`src/app/layout.js`](../src/app/layout.js).
- Mantidos `src/lib/api.js`, `AuthContext`, rotas RPG e regras existentes; não foram copiados telas hospitalares, Axios, tokens ou dependências alheias.
- Documentação atualizada em [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
- Validação concluída: `npm run lint` sem erros (28 warnings preexistentes), `node --test src/lib/__tests__/*.test.mjs` aprovado e `npm run build` aprovado com 33 rotas.
- Próximo passo recomendado: revisar visualmente o shell em desktop/mobile caso seja desejada uma segunda rodada de adaptação estética.
- Esclarecimento: a adaptação de componentização foi limitada ao shell global (`src/layouts/AppShell.jsx`). Os componentes de domínio continuam em `src/app/components`, pois os layouts da referência eram específicos do hospital e não foram copiados.

### Continuidade — 2026-11-04 (Implementação dos requisitos do backend)
- Requisitos recebidos em `COISAS-A-FAZER-BACKEND.md`, cobrindo migrations, validação Zod,
  autorização multi-tenant, endpoints, segurança de produção e testes.
- Backend separado alvo: `/home/cledi/rp/Rpg-backend`.
- Implementação em andamento com prioridade para fundação executável e compatível:
  migrations versionadas, validação padronizada, remoção de sync automático e healthcheck.
- Próximo passo: revisar as alterações realizadas, completar lacunas diretamente relacionadas e
  executar `node --check`, testes disponíveis e `git diff --check`.

### Continuidade — fechamento da implementação do backend
- Implementados migrations/CLI, schemas Zod, middleware de erro 422, healthchecks,
  limite de payload, seed controlado por ambiente, proteção de brute force do cofre
  e validação das rotas de campanha/NPC/notas/encontros.
- Validação concluída no backend separado: 3 testes passando, sintaxe JavaScript,
  diff sem whitespace inválido, CLI Sequelize descoberto e smoke tests live/ready/422.
- Bloqueio conhecido: sem PostgreSQL local para aplicar a migration e validar o
  baseline fisicamente; executar `SEED_PASSWORD=... npm run db:seed` somente após
  subir o banco.
- Próximo passo recomendado: aplicar migration em PostgreSQL de staging e criar
  testes de contrato multi-tenant/notas privadas.

### Continuidade — atualização do checklist backend
- [`COISAS-A-FAZER-BACKEND.md`](../COISAS-A-FAZER-BACKEND.md) atualizado em
  04/11/2026, marcando somente as migrations baseline, validações Zod,
  autorização, sincronização, campanhas, membros, NPCs, auditoria e segurança
  do cofre efetivamente implementadas.
- Migrations separadas por entidade, paginação/busca, upload privado, sessões
  narrativas, logs de combate e segurança de produção continuam pendentes.

### Continuidade — Fases 6 e 7 do backend
- Aplicado hardening em [`Rpg-backend`](../../Rpg-backend): CORS com allowlist,
  Helmet, rate limiting geral/auth, limite JSON de 2 MB, `/api/health` e
  tratamento de erros internos sem ecoar detalhes sensíveis.
- Adicionados testes independentes de PostgreSQL para CORS, healthcheck, headers
  de segurança e limite de payload. `npm test` aprovou 6 testes.
- O checklist foi atualizado: limite de payload e itens da Fase 7 marcados como
  concluídos; testes de integração com PostgreSQL permanecem pendentes.

### Continuidade — relatório consolidado do backend
- Criado [`docs/RELATORIO-BACKEND-STATUS.md`](../docs/RELATORIO-BACKEND-STATUS.md)
  com alterações verificadas, pendências, comandos de validação e melhorias
  recomendadas para evolução do backend.

### Continuidade — implementação incremental do checklist fullstack
- Mapeamento completo confirmou que o checklist ainda possui lacunas P0:
  PostgreSQL real/migrations incrementais, uploads privados, regras oficiais,
  refresh/revogação de sessão, Google Drive/Sheets/Docs, integração/E2E e CI.
- Backend recebeu paginação/busca de personagens, endpoints persistidos de
  sessões, guards de campanha e testes offline; frontend passou a preferir
  `sessionStorage`, preservar conflitos HTTP 409 e expor retry/sincronização.
- Validação: backend `npm test` com 9 testes aprovados; frontend build
  aprovado, testes unitários aprovados e lint sem erros (avisos preexistentes).
- `COISAS-A-FAZER.md` foi atualizado marcando somente itens com evidência;
  requisitos dependentes de PostgreSQL, credenciais Google ou infraestrutura
  continuam parciais/pendentes.

### Continuidade — atualização dos tópicos implementados
- Marcados nos checklists os guards de autorização e isolamento horizontal já
  implementados nos endpoints.
- Marcados no checklist backend a paginação/busca de personagens, sessões
  narrativas e os testes offline de barreira multi-tenant/notas privadas.
- Integrações PostgreSQL reais, uploads, Google, E2E e demais itens sem
  evidência verificável continuam pendentes ou parciais.

### Continuidade — commit e publicação
- Commit criado: `f530c0b` (`chore: consolidar implementacoes fullstack`).
- Alterações publicadas com sucesso em `origin/main`.
- A validação `git diff --cached --check` foi corrigida e aprovada antes do
  commit; os relatórios Markdown tiveram apenas whitespace ajustado.

### Continuidade — 2026-11-04 (Melhorias prioritárias)
- Revisado [`docs/MELHORIAS-FUTURAS-RPG.md`](../docs/MELHORIAS-FUTURAS-RPG.md).
- Implementada autenticação server-side e autorização de mestre em personagens, campanhas e NPCs por meio de [`src/lib/server-auth.js`](../src/lib/server-auth.js).
- O cache da ficha em [`src/app/context/CharacterContext.js`](../src/app/context/CharacterContext.js) agora é isolado por usuário/personagem e impede persistência do estado anterior durante troca de personagem.
- Adicionados testes em [`src/lib/__tests__/server-auth.test.mjs`](../src/lib/__tests__/server-auth.test.mjs).
- Documentada a melhoria de segurança e isolamento no roadmap.
- Validação concluída: testes focados 12/12, `npm run lint` sem erros (warnings preexistentes) e `npm run build` aprovado com 33 rotas.
- Próximo passo recomendado: implementar migrations versionadas e substituir o armazenamento mock por persistência PostgreSQL real.

### Continuidade — 2026-11-04 (Pendências após melhorias prioritárias)
- Ainda existem melhorias relevantes: persistência PostgreSQL com migrations, remoção de senhas em texto e segredo JWT padrão, proteção das demais rotas API, cookies HTTP-only, rate limiting, validação de payloads, notas privadas filtradas no servidor, uploads seguros, auditoria, indicador de sincronização e testes de integração/E2E.
- Prioridade recomendada: primeiro persistência/autenticação segura e autorização completa; depois uploads/notas/auditoria; por fim experiência e observabilidade.

### Continuidade — 2026-11-04 (Hardening P0)
- Criado [`src/lib/server-security.js`](../src/lib/server-security.js) com exigência de `JWT_SECRET`, hash/validação scrypt e rate limiting básico.
- Removido o fallback de segredo JWT em [`src/lib/jwt.js`](../src/lib/jwt.js).
- Login/registro agora validam hash, limitam tentativas e cadastro público não pode criar mestre.
- [`src/app/api/campanha/route.js`](../src/app/api/campanha/route.js) e logout exigem autenticação server-side.
- Adicionados testes de hash e validação; suíte completa passou.
- Limitações mantidas: persistência PostgreSQL/migrations pertencem ao backend separado, cookies HTTP-only exigem migração coordenada do cliente, e uploads/auditoria/E2E ainda não estão implementados.

### Continuidade — 2026-11-04 (Integração com backend Express existente)
- O frontend usa [`src/lib/api.js`](../src/lib/api.js) com `NEXT_PUBLIC_API_URL=http://localhost:3333/api`.
- O backend `/home/cledi/rp/Rpg-backend` expõe os prefixos compatíveis de auth, personagens, campanha, campanhas e NPCs.
- O agente backend reforçou autenticação, autorização por usuário/campanha, serialização privada, vínculo de personagem e hash bcrypt da senha do cofre.
- Corrigida a leitura de `JWT_SECRET` em controllers/middleware Google/Auth para ocorrer no momento da operação, após carregamento do ambiente.
- Adicionado `.env.example` no frontend e `JWT_SECRET` no exemplo do backend; documentação atualizada em [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
- Validação: sintaxe de todo `src` do backend aprovada; testes do frontend aprovados; build do frontend aprovado com 33 rotas; não há script de testes no backend e não foi feita conexão PostgreSQL nesta sessão.

### Continuidade — 2026-11-04 (Login e cadastro com Google)
- Implementado OAuth de identidade separado do Google Workspace.
- Backend: criado [`googleIdentity.js`](../../Rpg-backend/src/services/googleIdentity.js), endpoints `/api/auth/google/url` e `/api/auth/google/callback`, vínculo por `google_id`/e-mail verificado e criação automática de jogador com personagem inicial.
- Frontend: botão em [`src/app/login/page.jsx`](../src/app/login/page.jsx), callback em [`src/app/auth/google/callback/page.jsx`](../src/app/auth/google/callback/page.jsx), adoção segura do JWT no `AuthContext` e helper `getGoogleLoginUrl`.
- Banco/modelo: campo `google_id` e índice único parcial adicionados; `googleId` não é serializado para o cliente.
- Configuração necessária: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_AUTH_REDIRECT_URI` e `FRONTEND_URL` no backend; cadastrar o redirect URI no Google Cloud Console.
- Validação: sintaxe backend aprovada, testes frontend aprovados, build aprovado com 34 rotas e diff sem whitespace inválido.

### Continuidade — Limpeza de arquivos legados
- Removidos após confirmação explícita: `src/app/character-sheet.js`, `src/app/components/character-sheet-full.js`, `src/models/character.js` e os SVGs padrão não referenciados em `public/`.
- Preservados todos os arquivos não rastreados/criados durante a sessão.
- Validação concluída: 27 testes aprovados, lint aprovado sem erros (28 avisos preexistentes), build aprovado com 34 rotas e `git diff --check` aprovado.

### Continuidade — Documento de alterações recomendadas
- Criado `docs/ALTERACOES-RECOMENDADAS.md` com o estado implementado, pendências críticas e ordem recomendada para cookies HTTP-only, migrations, validação, autorização, sincronização, auditoria, uploads, testes e CI.

### Continuidade — Landing pública
- A rota `/` passou a apresentar o serviço antes do login, com hero, recursos,
  demonstração visual de ficha e chamadas para login/cadastro.
- `AppShell` foi ajustado para ocultar navegação autenticada e botão de dados na
  landing.
- Validação concluída: 27 testes aprovados, build aprovado com 34 rotas,
  `git diff --check` aprovado e lint aprovado sem erros, mantendo apenas os
  avisos preexistentes.

1. **Mapeamento Arquitetural Completo (Front ↔ Back ↔ Banco)**:
   - Mapeadas 19 telas da interface (Área do Jogador e Câmara do Mestre).
   - Identificados 34 contratos de endpoints HTTP (REST).
   - Modeladas 10 tabelas relacionais centrais no PostgreSQL com Sequelize (`users`, `characters`, `campaigns`, `campaign_members`, `npcs`, `encounters`, `maps`, `game_sessions`, `campaign_notes`, `audit_logs`).

2. **Criação do Documento Especializado ([`COISAS-A-FAZER-BACKEND.md`](file:///home/cledi/rp/Rpg-ficha/COISAS-A-FAZER-BACKEND.md))**:
   - Tabela de rastreabilidade ponta a ponta (*Fullstack Tracing*).
   - Dicionário de dados de cada tabela PostgreSQL com tipos de coluna, constraints e chaves estrangeiras.
   - Checklist cronológico dividido em 7 Fases:
     - Fase 1: Migrations versionadas e seeds;
     - Fase 2: Schemas de validação Zod e padronização de erros;
     - Fase 3: Autenticação, autorização granular e multi-tenancy;
     - Fase 4: Endpoints da ficha do herói e sincronização;
     - Fase 5: Endpoints da Área do Mestre (campanhas, membros, combate, mapas, sessões, segredos e auditoria);
     - Fase 6: Testes automatizados de backend;
     - Fase 7: Segurança de produção, CORS, Rate Limiting e observabilidade.

3. **Sincronização no Roadmap Geral**:
   - Atualizado [`COISAS-A-FAZER.md`](file:///home/cledi/rp/Rpg-ficha/COISAS-A-FAZER.md) com link direto para o novo documento na Seção 4 (Backend e API).
