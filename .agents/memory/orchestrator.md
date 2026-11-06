# Memória do Agente Orquestrador (@orchestrator)

## Entrega — 2026-11-06 (Validação e Integração: Banco v2 Supabase, Migrations e Fluxo de Convites)

- **Especialistas Acionados**: `backend-database` (skills `supabase-database-config`, `banco-de-dados-ops`, `sequelize-model-generator`), `qa-tester`.
- **Implementações Entregues**:
  * **Idempotência DDL no `banco_v2.sql`**: Adicionados blocos `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` garantindo que instâncias previamente criadas no Supabase recebam colunas canônicas (`pontos_esforco`, `insanidade`, `bonus_pericia`, `classe_armadura`, `dado_vida`, `codigo_convite`, etc.) sem quebra de execução.
  * **Migration Sequelize Versionada**: Criada migration oficial `database/migrations/20261106150000-banco-v2-reformulacao.js` em `Rpg-backend`, permitindo execução programática via `npm run db:migrate`.
  * **Blindagem de Serialização no Auth Controller**: Corrigido método `usuarioParaResposta` e resposta de campanha para lidar com objetos normais e instâncias Sequelize (`.toJSON()`), eliminando risco de exceções 500 no registro.
  * **Suíte de Testes de Integração**: Criado `test/invite_flow.test.js` no backend cobrindo 6 cenários críticos do ciclo de convites e registro (código vazio, código inválido, mesa encerrada, sucesso na consulta pública e criação automática de vínculo de membro e personagem).
- **Validação**:
  * Backend: 17/17 testes aprovados (`node --test`).
  * Frontend: 38/38 testes aprovados (`node --test`).
  * Build Next.js 16 (Turbopack): 27 rotas compiladas com sucesso sem erros.

## Entrega — 2026-11-06 (Mecânica de Criação de Mesas, Links de Convite e Vínculo no Cadastro)

- **Especialistas Acionados**: `backend-database` (skill `gm-campaign-orchestrator`), `frontend-artisan` (skill `sheet-component-builder`), `audit-and-security` e `qa-tester`.
- **Implementações Entregues**:
  * Geração e cópia de links de convite no painel de campanhas e na Sala de Guerra (`/admin/campanhas` e `/admin`).
  * Mensagem pronta de convocação para envio em 1 clique via Discord / WhatsApp.
  * Cadastro integrado (`/registro`): captura automática do parâmetro `?invite=...` ou preenchimento manual do código de convite da mesa, com validação ao vivo e badge de mesa e mestre convocador.
  * Backend: validação de convite no registro, criação de vínculo em `CampaignMember` e atribuição de `campanhaId` à ficha do novo herói.
  * Nova página dedicada `/convite/[code]` para recepção de novos jogadores ou aceitação de convite por heróis já existentes.
  * Área do perfil (`/perfil`) com seção para jogadores entrarem em mesas com código a qualquer momento.
  * Seletor de mesas/sessões ativas na Sala de Guerra para isolamento de participantes e iniciativa por mesa.
- **Validação**: 31 testes unitários frontend + 10 testes unitários backend aprovados; build Next.js 16 compilado com sucesso.

## Entrega — 2026-11-05 (Blindagem da Atribuição de Perfil Mestre no Cadastro)

- Corrigido o fluxo ponta a ponta dos botões de seleção de perfil em `src/app/registro/page.jsx`, `src/lib/api.js` e `src/app/context/AuthContext.jsx`.
- Garantido que quem selecionar Mestre recebe `isMaster = true` imediatamente, redirecionamento para `/admin` e persistência no banco e na sessão.
- 27 testes aprovados e build 100% OK.


## Entrega — 2026-11-05 (Correção de Perfil no Cadastro)

- Corrigida a função `registerUser` em `src/lib/api.js` para repassar `perfil` e `role` na requisição de cadastro.
- Disponibilizado o SQL imediato de promoção de conta no Supabase.
- 27 testes aprovados e build 100% OK.


## Entrega — 2026-11-05 (Correção de Schema: Coluna forca Ausente na Tabela personagens)

- Analisado o stack trace do Render: o erro 500 no login provém de `column "forca" does not exist` disparado por `Character.findAll`.
- Acionado o agente `backend-database` com a skill `supabase-database-config` e `sequelize-model-generator`.
- Gerado script SQL de migração complementar para o Supabase SQL Editor garantindo alinhamento de 100% entre a tabela física `personagens` e o modelo Sequelize `Character`.


## Entrega — 2026-11-05 (Investigação de Erro Interno 500 no Login)

- Acionados os agentes `backend-database` e `qa-tester` com as skills `supabase-database-config` e `fullstack-web-publisher`.
- Mapeada a correlação direta entre o erro anterior (`password authentication failed for user postgres`) e o HTTP 500 ao tentar login: a query do Sequelize ao banco falha na autenticação ou faltam variáveis obrigatórias (`DATABASE_URL`, `JWT_SECRET`) no painel do Render.
- Instruído o checklist de verificação de logs no Render e a sequência de revalidação.


## Entrega — 2026-11-05 (Diagnóstico de Falha de Autenticação Supabase / Render)

- Analisada a falha `password authentication failed for user postgres`.
- Acionado o agente `backend-database` com a skill `supabase-database-config`.
- Mapeado o procedimento de redefinição de senha segura e alinhamento do Session Pooler (`postgres.ofkjgxnxmfwjmtscktts`) com a variável `DATABASE_URL` no Render.
- Frontend Grimorium validado: 27 testes unitários aprovados e build Next.js 16 (25 rotas) concluído com 100% de sucesso.


## Entrega — 2026-11-05 (Identidade Visual Renomeada para Grimorium)

- Aplicação renomeada para **"Grimorium"** em todos os pontos de contato da interface:
  * `AppShell.jsx` (título da aba do navegador e topo da barra lateral).
  * `Cabecalho.jsx` (cabeçalho central da ficha).
  * `page.js` (marca pública, hero e rodapé).
- 27 testes unitários aprovados com sucesso.

## Entrega — 2026-11-05 (Backend no Ar no Render: rpg-backend-pmhk.onrender.com)

- Backend Express ativo no Render: `https://rpg-backend-pmhk.onrender.com`.
- Conexão com Supabase e CORS vinculados ao frontend Vercel.
- Instruído o registro de `NEXT_PUBLIC_API_URL` na Vercel e o redeploy final.

## Entrega — 2026-11-05 (Frontend no Ar na Vercel: rpg-ficha-one.vercel.app)

- Frontend Next.js 16 verificado e ativo em `https://rpg-ficha-one.vercel.app/`.
- `CORS_ORIGIN` no Render alinhado com o domínio gerado pela Vercel.
- Aguardando URL final do Render para integração bidirecional com `NEXT_PUBLIC_API_URL`.

## Entrega — 2026-11-05 (Definição de CORS_ORIGIN para Deploy em Nuvem)

- Esclarecido o papel de `CORS_ORIGIN` apontando para o Frontend na Vercel (com suporte a múltiplas URLs separadas por vírgula e validação rigorosa que impede `*`).
- Próximo passo: conclusão do deploy no Render e geração do domínio da Vercel.

## Entrega — 2026-11-05 (Banco PostgreSQL Supabase Provisionado e Migrado com Sucesso)

- Conexão com o Supabase testada e aprovada com TLS/SSL.
- Migrações aplicadas com sucesso (`npm run db:migrate`): 20 tabelas relacionais criadas no banco de dados na nuvem.
- Commit e push realizados no repositório `Rpg-backend` com suporte universal a SSL para ambientes gerenciados.
- Pronto para o deploy do backend no Render e do frontend na Vercel.

## Entrega — 2026-11-05 (Validação da Connection String do Supabase)

- A Connection String do PostgreSQL foi validada com sucesso: formato Session Pooler (porta 5432), host `aws-0-us-east-1.pooler.supabase.com` e usuário correspondente ao ID do projeto (`postgres.ofkjgxnxmfwjmtscktts`).
- Pronto para inclusão na `DATABASE_URL` do `Rpg-backend` e execução das migrations Sequelize.

## Entrega — 2026-11-04 (Vinculação exclusiva ao Rpg-backend)

- O frontend agora removeu os Route Handlers locais em `src/app/api`.
- Todas as chamadas usam `src/lib/api.js` e `NEXT_PUBLIC_API_URL`.
- A tela de sessões consome os endpoints REST de `sessoes_jogo`, sem gravar
  sessões em `dadosExtras` da campanha.
- Validação: build do frontend e testes do backend aprovados; lint sem erros,
  com warnings preexistentes.
- Worktree contém somente as alterações desta integração; nenhum commit ou push
  foi criado nesta etapa.
- A pasta `src/app/api` foi removida fisicamente do frontend, deixando o
  `Rpg-backend` como única API da aplicação.

## Entrega — 2026-11-04 (OAuth Google)

- Ajustado o fluxo de login/cadastro Google no frontend para consumir
  `GET /api/auth/google/url` como JSON e redirecionar à URL retornada.
- Corrigido o callback para extrair corretamente `#token=...`.
- Validação: build frontend aprovado, testes backend 9/9 aprovados e lint sem
  erros (warnings preexistentes).

## Entrega — 2026-11-04 (Remoção de integrações Google)

- Removidas as funcionalidades Google OAuth e Google Workspace do frontend e
  backend, incluindo callback, rotas, services, dependência `googleapis` e
  configuração `GOOGLE_*`.
- O login/cadastro permanece disponível por usuário/e-mail e senha.
- Validação: frontend build/lint aprovados (warnings preexistentes), backend
  `npm test` 9/9 e `node --check` aprovados.

## Entrega — 2026-11-05 (Refinamento visual transversal)

- Atualizados tokens e acabamentos globais em `globals.css`.
- Reforçados consistência visual e responsividade em `AppShell`, `Cabecalho` e
  `Card`; nenhum endpoint ou contrato foi alterado.
- Validação: build frontend aprovado, lint sem erros e `git diff --check`
  aprovado.

## Entrega — 2026-11-05 (Identidade Visual: Fichas de RPG: Grimório)

- Aplicação renomeada de "Coração da Montanha" para "Fichas de RPG: Grimório".
- Pontos de contato atualizados: `AppShell.jsx`, `Cabecalho.jsx`, `page.js` e documentação de sessão.
- Validação: 27 testes unitários aprovados e build Next.js 16 (25 rotas) concluído com sucesso.

## Entrega — 2026-11-05 (Skills de Publicação Web: Vercel, Supabase e Fullstack)

- Criadas 3 skills especializadas para publicação web e infraestrutura em nuvem:
  1. `vercel-deployment`: deploy de frontend Next.js 16 na Vercel (CLI e Git).
  2. `supabase-database-config`: PostgreSQL em nuvem no Supabase, Session Pooler, SSL e migrations Sequelize.
  3. `fullstack-web-publisher`: roteiro completo ponta a ponta (Supabase + Render + Vercel) com CORS e checklist.
- Criado `vercel.json` na raiz da aplicação.
- Backend Sequelize atualizado com suporte e auto-detecção nativa a URLs Supabase.
- Validação: testes front 27/27, testes back 9/9 e build Next.js 25/25 rotas estáticas/dinâmicas 100% OK.

## Entrega — 2026-11-05 (Commit & Push: Sidebar Dark Fantasy)

- Commit e envio das alterações validadas: sidebar fixa no desktop com estética Dark Fantasy restaurada.
- Branch `main` sincronizada com `origin/main`.

## Entrega — 2026-11-05 (Restauração das Cores Dark Fantasy com Sidebar Mantida)

- Atendendo à preferência do usuário: preservada a nova sidebar desktop e navegação responsiva mobile, com retorno integral do padrão de cores Dark Fantasy anterior.
- Restaurados tokens, auras de iluminação temática, fundo escuro (`var(--theme-bg, #0b0d12)`), molduras ornamentadas (`ornate-frame`), sombras profundas e tipografia clássica (Cinzel e Inter).
- Topo da sidebar no desktop estilizado com o brasão/título temático "Grimório - Coração da Montanha".
- Validação: 27 testes unitários 100% aprovados, build Turbopack Next.js (25 rotas) concluído com sucesso e `git diff --check` aprovado.

## Entrega — 2026-11-05 (Repaginação editorial/tática)

- Commit anterior registrado em `06dcdc0` antes da nova etapa.
- Aplicada nova linguagem visual global, sem ornamentos de grimório: base clara,
  contraste editorial, terracota/azul-petróleo, cards planos e rail lateral.
- Nova etapa ainda não commitada; build e lint aprovados.

Este arquivo é a fonte de memória persistente da liderança técnica do projeto. Deve ser lido no início de cada sessão e atualizado ao final de cada entrega.

---

## 📌 Estado Atual do Projeto
- **Fase Atual**: Preparação da Fase 1 (Motor de Regras e Rolagem de Dados).
- **Stack Consolidada**: Next.js 16 (App Router), React 19, Tailwind CSS v4, PostgreSQL, Sequelize ORM.
- **Foco Principal**: Área do Jogador (Mobile-first e Desktop) para sistema próprio baseado em d20 (7 atributos).

### Entrega — 2026-11-04 (Skill de adaptação de estruturas GitHub)
- Criada [`github-structure-adapter`](../.github/skills/github-structure-adapter/SKILL.md) em `.github/skills/`.
- A skill orienta análise arquitetural, verificação de licença, clone temporário seguro, matriz de adaptação, implementação incremental e validação.
- Ela proíbe copiar segredos, `.git`, artefatos, dependências sem revisão e substituir o workspace inteiro por um clone.

### Entrega — 2026-11-04 (Adaptação da referência hospital)
- Analisado `Orijnat/teste-crs/sistema/hospitalFront/hospital` no commit `39533638b450ec0b7d5cf1ded04bcd8d4468021f`.
- Aplicada a separação estrutural de layouts ao criar [`src/layouts/AppShell.jsx`](../src/layouts/AppShell.jsx).
- `src/app/layout.js` agora compõe providers e delega a moldura global ao shell; nenhuma tela ou dependência específica do hospital foi importada.

### Entrega — 2026-11-04 (Melhorias prioritárias de segurança)
- Criado [`src/lib/server-auth.js`](../src/lib/server-auth.js) para validação centralizada de Bearer JWT e perfil mestre.
- Protegidas as rotas de personagens, campanhas e NPCs contra acesso anônimo; jogadores ficam limitados aos próprios personagens/campanhas.
- Cache da ficha isolado pela combinação de usuário/personagem em [`CharacterContext.js`](../src/app/context/CharacterContext.js).
- Testes de autenticação server-side adicionados.

### Entrega — 2026-11-04 (Hardening P0)
- Criado [`src/lib/server-security.js`](../src/lib/server-security.js) com scrypt, `JWT_SECRET` obrigatório e rate limiting básico.
- Removido segredo JWT conhecido, bloqueada promoção pública a mestre e protegidos campanha/logout.
- Fixtures de autenticação não armazenam senha em texto simples.
- Persistência PostgreSQL, cookies HTTP-only, uploads privados, auditoria e E2E permanecem pendentes por dependerem do backend separado e decisões de contrato.

### Entrega — 2026-11-04 (Fundação do backend e banco)
- No backend separado [`Rpg-backend`](/home/cledi/rp/Rpg-backend), substituído o
  `sequelize.sync()` por migration baseline executável via Sequelize CLI.
- Adicionados schemas/middleware Zod com contrato de erro 422, validação nas rotas
  de autenticação, ficha, campanhas, membros, NPCs, notas e encontros.
- Adicionados healthchecks live/ready, limite JSON configurável de 1 MB, seed
  seguro com `SEED_PASSWORD` e bloqueio de brute force do cofre.
- Validação: 3 testes unitários, `node --check`, `git diff --check`, CLI Sequelize
  e smoke tests HTTP aprovados. Aplicação real da migration aguarda PostgreSQL.
- Próximo passo: staging PostgreSQL para validar o baseline e testes de contrato
  de isolamento multi-tenant, notas privadas e combate.

### Entrega: Sessões e Perfis via JWT Tokens — 2026-10-27
- Criado o módulo de utilitário criptográfico e gerenciamento de claims JWT em `src/lib/jwt.js`:
  * Assinatura HS256 (`signJwt`), validação de integridade e tempo (`verifyJwt`), decodificação segura (`decodeJwt`) e normalização canônica de papéis (`mestre` / `jogador`, `master` / `player`).
- Implementadas rotas de autenticação independentes no Next.js App Router (`src/app/api/auth/`):
  * `POST /api/auth/login`: autenticação, busca de usuário e emissão de JWT com claims de perfil e sessão.
  * `POST /api/auth/register`: criação de usuário, ficha inicial e geração de JWT.
  * `GET /api/auth/me`: validação de Bearer token e retorno de usuário, personagens e metadados de sessão.
  * `PUT /api/auth/me`: atualização de nome, e-mail e perfil, com renovação automática do JWT token.
  * `POST /api/auth/logout`: invalidação e confirmação de encerramento de sessão.
- Atualizado o backend Express em `Rpg-backend`:
  * `authController.js`: adicionados métodos `updateProfile` e `logout`.
  * `authMiddleware.js`: implementados `requireMaster` e `requirePlayer`, anexado `tokenPayload` e métodos `isMestre()` / `isJogador()`.
  * `authRoutes.js`: adicionadas as rotas `PUT /me` e `POST /logout`.
- Atualizado `AuthContext.jsx` e `src/app/perfil/page.js`:
  * Contexto captura token renovado automaticamente ao atualizar perfil e expõe `sessionInfo` e `switchProfile`.
  * Tela de perfil exibe painel informativo de sessão JWT ativa (ID da sessão, expiração e papel de acesso) e permite alterar perfil no sistema.
- Validação: 23 testes automatizados (100% de sucesso em `node --test`), Next.js build aprovado com 33 rotas e `node --check` no backend aprovado.

### Entrega do roadmap do jogador — 2026-10-27 (Concluída 100%)
- Todos os itens da Seção 2 (Frontend do jogador) de `COISAS-A-FAZER.md` foram verificados, ajustados e marcados como concluídos:
  * Recursos e combate: PE, BP, Insanidade, CA, Iniciativa e Dado de Vida integrados com rolagens interativas e envio à mesa do mestre.
  * Carga e inventário: cálculo ponderado `qty * weight` com avisos de sobrecarga e filtros/ordenação avançados.
  * Proteção do mestre: campos restritos (`hpMax`, `peMax`, `insanityMax`, `bpMax`, `armorClass`) exibem bloqueio visual com ícone de cadeado e tooltip explicativo quando acessados por jogadores.
  * Validação universal de números inteiros, clamping de limites e sinalização `aria-invalid`.
  * Estados visuais completos em todas as telas (loading, vazio, erro, sucesso e sincronização).
  * Acessibilidade reforçada: foco visível com outline de 2px, suporte a `prefers-reduced-motion`, touch targets mínimos de 44px e atributos ARIA semânticos em perícias, contratos e inventário.
  * Gestão de conta: edição de perfil, seletor de 5 temas visuais dark fantasy e encerramento seguro de sessão.
  * Backup & Integridade: exportação e importação JSON com validação rigorosa de Schema v2.
  * Navegação global aprimorada: atalhos para Diário e Perfil adicionados diretamente na barra de navegação superior (`TABS`).
- Verificações automatizadas: `npm run build` (29 rotas estáticas/dinâmicas), `node --test` (18 suítes/testes 100% OK), ESLint (0 erros).
- Próximo passo recomendado: iniciar as migrations versionadas e schemas Zod da Fase 1 do backend (`COISAS-A-FAZER-BACKEND.md`).

### Diagnóstico mais recente — 2026-10-20
- A página raiz (`src/app/page.js`) contém somente um redirecionamento server-side
  para `/login` e não apresenta problema funcional.
- Melhorias restantes prioritárias estão documentadas em
  `docs/MELHORIAS-FUTURAS-RPG.md`, com foco em segurança, persistência,
  sincronização e testes.

### Relatório consolidado — 2026-10-22
- Implementações recentes abrangem a área do jogador, diário/anotações,
  inventário, contratos, área do mestre, perfis, persistência/sincronização,
  schema v2, regras d20, backup JSON e refinamento visual.
- `npm run build`: aprovado, com 18 rotas geradas.
- `node --test src/lib/__tests__/*.mjs`: aprovado, 2 arquivos e 73 asserções.
- `npm test`: indisponível porque não há script `test` no `package.json`.
- `npm run lint`: pendente, com 6 erros e 5 avisos.
- Pendências prioritárias: regras oficiais, campanhas e autorização completa,
  migrations, hardening de segurança, uploads privados, Google Drive/Sheets/Docs,
  acessibilidade e testes de integração/E2E.
- **Segurança web (2026-10-26)**: agentes workspace criados para ataque controlado
  (`ataque-web-controlado`) e defesa/hardening (`defesa-web-hardening`). Auditoria
  autorizada concluída; Next.js atualizado, headers defensivos aplicados e
  `npm audit --omit=dev` sem vulnerabilidades.
- **Entrega**: hardening publicado em `origin/main` no commit `0fd75a2`.

### Entrega — Limpeza de arquivos legados
- Removidos, após confirmação do usuário, os dois componentes monolíticos de ficha sem referências no runtime, o modelo legado não importado e os cinco SVGs padrão do scaffold não referenciados.
- Arquivos não rastreados e alterações recentes foram preservados.
- Validação pós-limpeza: 27 testes aprovados, lint aprovado sem erros (28 avisos preexistentes), build aprovado com 34 rotas e `git diff --check` aprovado.

### Entrega — Documento de alterações recomendadas
- Criado `docs/ALTERACOES-RECOMENDADAS.md`, consolidando melhorias já realizadas, prioridades de produção, pendências conhecidas e sequência sugerida de implementação.

### Entrega — Landing pública
- A rota raiz agora apresenta o serviço Coração da Montanha antes da autenticação, com conteúdo público responsivo e CTAs para login/cadastro.
- O `AppShell` não renderiza cabeçalho, abas autenticadas ou dados flutuantes na landing.
- Validação: 27 testes aprovados, build aprovado com 34 rotas, `git diff --check`
  aprovado e lint aprovado sem erros, mantendo apenas avisos preexistentes.

---

## 📜 Histórico de Decisões Arquiteturais (ADRs)
1. **[ADR-001] Sistema de 7 Atributos**:
   - Atributos: `FOR`, `DES`, `CON`, `SAB`, `ESP`, `CAR`, `INT`.
   - Modificador: $\lfloor(\text{Valor} - 10) / 2\rfloor$.
2. **[ADR-002] Mecânica de Rolagens Virtuais**:
   - Vantagem: Rolar 2d20 e descartar o menor (`2d20kh1`).
   - Desvantagem: Rolar 2d20 e descartar o maior (`2d20kl1`).
   - Retorno estruturado contendo dados rolados, dados descartados, modificadores e detecção de críticos (1 e 20 natural).
3. **[ADR-003] Persistência Híbrida**:
   - Estado reativo com React Context (`CharacterContext`) no frontend com hidratação local e sincronização otimista via endpoints de API (`/api/characters/...`) salvando no PostgreSQL através do Sequelize.
4. **[ADR-004] Memória de Agentes**:
   - Cada sub-agente mantém um arquivo em `.agents/memory/<subagente>.md` registrando arquivos tocados, decisões e pendências para manter continuidade entre sessões.
5. **[ADR-005] Backend Desacoplado**:
   - O backend foi estruturado em pasta própria fora do frontend: `/home/crs/projetos/aa/Rpg-backend`.
   - Utiliza Express.js, Sequelize ORM e PostgreSQL, com CORS aberto para o frontend e auto-sync das tabelas.

6. **[ADR-006] Continuidade Entre Sessões e Uso Obrigatório de Sub-Agentes**:
   - Toda requisição tem seu prompt e estado capturados e salvos em `.agents/memory/active_session.md` e `last_prompt.json` via hook de ciclo de vida (`PreInvocation` / `SessionStart`) e regras no `AGENTS.md` / `GEMINI.md`.
   - Ao iniciar qualquer atendimento, é mandatório consultar as memórias ativas e orquestrar os subagentes especializados (`frontend-artisan`, `rpg-rules-engine`, `dice-mechanic`, `backend-database`, `qa-tester`).

7. **[ADR-007] Agentes e Skills Especialistas da Área do Mestre (Tópico 3)**:
   - Cobertura completa do roadmap da Área do Mestre através de 4 frentes:
     - `npc-curator`: formulário dedicado, badges de tags, status, filtros/busca e variantes táticas.
     - `gm-campaign-orchestrator`: ciclo de campanhas, códigos de convite, membros e sessões com cenas/objetivos.
     - `tactical-encounter-engine`: combate tático, sincronização de iniciativa das fichas, condições e mapas com névoa de guerra.
     - `audit-and-security`: multi-tenancy no backend, notas privadas filtradas server-side, quem alterou e quando, e confirmação solene.

---

## 🗺️ Roadmap e Status das Fases
- [x] **Fase 1**: Motor de Regras e Rolador Virtual (`src/lib/modifiers.js`, `src/lib/dice.js`, 25 testes com 100% de aprovação).
- [x] **Fase 2**: Integração UI da Ficha & Disparo de Rolagens (Bandeja flutuante, histórico, triggers em perícias e atributos).
- [x] **Fase 3**: Persistência PostgreSQL & Sequelize em backend desacoplado (`/home/crs/projetos/aa/Rpg-backend`).
- [x] **Fase 4**: Módulos do Jogador (Inventário com pesquisa, Contratos com filtros, Montaria com controles de HP, Quarto com descansos curto/longo).
- [x] **Fase 5**: QA Final, Backup/Exportação JSON, Sincronização e Polimento (43 testes aprovados).
- [x] **Fase 6**: Sistema de Memória Contínua Entre Sessões & Hook de Início com Agentes (`.agents/hooks.json`, `.agents/scripts/sync_session_memory.js`, `AGENTS.md`, `GEMINI.md`).
- [x] **Fase 7**: Reformulação visual do front-end com layout mais organizado, ornamentado (Dark Fantasy) e menos minimalista via `frontend-artisan`.
- [x] **Fase 8**: Aba dedicada de anotações, navegação refinada e galeria de imagens persistida no personagem.
- [x] **Fase 9**: Diário de campanha com registros datados, relatos e imagens por entrada.
- [x] **Fase 10**: Ambientação visual global com textura, molduras, divisores e cabeçalho ornamentado.
- [x] **Fase 11**: Fundo dark fantasy mais nítido com textura em camadas, pontos rúnicos, rails e vinheta.
- [x] **Fase 12**: Redesign visual não minimalista com selos arcanos, molduras de pergaminho e palco ornamentado.
- [x] **Fase 13**: Migração global para identidade de grimório/guilda, com placas, faixa de navegação e medalhões.
- [x] **Fase 14**: MVP inicial da Sala do Mestre com campanha, NPCs, iniciativa e gestão de personagens.
- [x] **Fase 15**: Perfis `player`/`master`, autorização por proprietário e filtragem server-side de dados sensíveis.
- [x] **Fase 16**: Redirecionamento global de usuários não autenticados para a tela de login.
- [x] **Fase 17**: Mapeamento completo do domínio e persistência PostgreSQL/Sequelize ampliada com campos canônicos em português.
- [x] **Fase 18**: Criação da equipe especializada de frontend, backend, contrato de integração e orquestração fullstack.
- [x] **Fase 19**: Implementação das Melhorias do Roadmap (Ficha do Jogador, Inventário com Carga/Filtros, Contratos com Busca, Diário com Tags/Ordenação, Indicador de Sincronização Global no Cabeçalho e Schema v2 com Validação de Integridade).

---

## 📝 Registro de Mudanças Recentes
- **2026-10-15**:
  - Criação do documento mestre `CLAUDE.md` e documentação técnica em `docs/`.
  - Registro e inicialização dos 5 sub-agentes e criação das skills em `.agents/skills/`.
  - Configuração da infraestrutura de memória persistente em `.agents/memory/`.
  - **Fase 1 Concluída**: Regras d20 customizadas e engine de dados.
  - **Fase 2 Concluída**: Integração de rolagens com vantagens/desvantagens na interface e bandeja flutuante.
  - **Fase 3 Concluída**: Backend independente com Express, Sequelize e PostgreSQL em `/home/crs/projetos/aa/Rpg-backend`.
  - **Fase 4 Concluída**: Módulos de Inventário, Contratos, Montaria e Quarto totalmente funcionais.
  - **Fase 5 Concluída**:
    * Modal de Backup e Exportação/Importação JSON em `BackupModal.jsx` acessível no cabeçalho.
    * 43 testes automatizados (regras, dados, integridade de backup e atributos) com 100% de aprovação.
    * Build de produção Turbopack do Next.js 16 validado com 0 erros em todas as 16 rotas.
  - **Fase de Temas & Layout Dinâmico Concluída**:
    * `ThemeProvider` integrado ao `src/app/layout.js` com persistência automática no `localStorage`.
    * `ThemeSelector` integrado no `Cabecalho.jsx` permitindo escolha entre 5 temas visuais: Pergaminho Dourado, Sangue de Dragão, Floresta Élfica, Arcano Púrpura e Gelo do Norte.
    * Fundos com gradientes radiais dinâmicos e iluminação ambiente adaptativa reativa ao tema selecionado via tokens de `--glow-primary` e `var(--primary)`.
    * Remoção de cores hardcoded em favor de classes semânticas em `ui.js`, `BackupModal.jsx`, `Aparencia.jsx`, `BarrraHp.jsx` e `banco/constants.js`.
  - **Fase 6 Concluída (Persistência de Memória & Agentes)**:
    * Criação do hook de ciclo de vida `.agents/hooks.json` com `PreInvocation` e `SessionStart`.
    * Criação do script `.agents/scripts/sync_session_memory.js` para registrar prompts e injetar instruções.
    * Definição de regras estritas em `AGENTS.md` e `GEMINI.md` para obrigatoriedade de salvamento do prompt para continuidade entre sessões e uso incondicional dos agentes especializados.
  - **Equipe especializada fullstack**:
    * Agentes em `.github/agents/` para frontend, backend, contrato de integração e orquestração.
    * Skills em `.github/skills/` para frontend RPG, backend RPG e contrato API RPG.

- **2026-10-16 — Animação do rolador**:
  - `DiceModal` recebeu dados numerados com rotação 3D, quique e aura temática.
  - Vantagem/desvantagem preservam a distinção entre resultado mantido e descartado; múltiplos dados são exibidos sem alterar o motor.
  - `globals.css` inclui keyframes dedicados e fallback para `prefers-reduced-motion`.
  - Build de produção e verificação de whitespace passaram.

- **2026-10-16 — Equipe expandida do ecossistema RPG**:
  - Criados agentes especializados para Área do Jogador, Área do Mestre, motor de regras, mecânica de dados, segurança, QA e documentação.
  - Criadas skills de frontend jogador/mestre, regras d20, dados, autenticação, autorização, uploads, QA, segurança e documentação.
  - Criadas memórias persistentes correspondentes em `.agents/memory/`.
  - O orquestrador foi atualizado para poder acionar os novos agentes.

- **2026-10-16 — Primeira melhoria geral do sistema**:
  - Rolador revisado com aleatoriedade injetável, múltiplos dados, acessibilidade e animação d20.
  - Área do Mestre reforçada com proteção de rota, cliente autenticado e tratamento de falhas.
  - Área do Jogador recebeu indicador de sincronização local/backend.
  - Backend teve correções de associação de personagens, filtro de dados privados, segredo JWT obrigatório e bloqueio de usuários inativos.
  - Criado `docs/MELHORIAS-FUTURAS-RPG.md` com diagnóstico e roadmap priorizado.

- **2026-10-17 — Continuidade da integração backend/frontend**:
  - Retomada a correção de dados ausentes no carregamento do backend.
  - Confirmados os aliases canônicos/legados, moedas e preservação de arrays vazios no `CharacterContext` e cliente de API.
  - `npm run build` e `git diff --check` passaram novamente.
  - Ajustada a normalização para preservar explicitamente coleções canônicas vazias vindas do backend.
  - Testes direcionados de regras e dados: 26 aprovados.
  - Área do Mestre ampliada com central visual de personagens, ficha administrativa em nova aba e edição de inventário, capacidade de carga, atributos, HP e perícias.
  - Build passou com a rota dinâmica `/admin/personagens/[id]/ficha`.
  - Planilha técnica analisada e regras adicionais incorporadas em `dadosExtras`, incluindo classe customizada, BP, PE, insanidade, CA, iniciativa e dado de vida.
  - NPC Eldric Rawlins criado para o mestre existente; senha não utilizada porque o usuário esclareceu que Eldric é controlado pelo mestre.
  - Integração Google Workspace iniciada com OAuth mestre, tokens criptografados, status/desconexão e configuração de sincronização bidirecional.
- **2026-10-20 — Implementação das Melhorias Futuras (Roadmap do Jogador & Sistema)**:
  - Ficha Principal do Jogador: Novo componente `RecursosCombate.jsx` exibindo PE (Pontos de Energia), Insanidade, BP (Proficiência), CA (Classe de Armadura), Iniciativa (com rolagem d20 integrada) e Dado de Vida (com rolagem de descanso/cura).
  - Inventário & Mochila: Cálculo em tempo real da capacidade de carga (`calculateCapacity`) com alerta de sobrecarga, barra de progresso visual, filtros por categoria (Armas/Fórmulas, Consumíveis/Munições, Outros) e ordenação (A-Z, Quantidade asc/desc, Ordem original).
  - Painel de Contratos: Adicionada busca textual por título e recompensa combinada com filtros de status (Todos, Ativos, Concluídos).
  - Diário de Campanha: Adicionada busca textual por relato/título, tags/categorias temáticas (Missão, Rumor, Lore, Combate, Pessoal) com contadores, e ordenação (Mais recentes, Mais antigos, Título A-Z).
  - Cabeçalho Global: Indicador dinâmico de status de sincronização (`syncStatus`: Salvando, Salvo na Nuvem, Cache Local, Erro) visível em todas as telas.
  - Backup & Exportação JSON: Versionamento canônico de Schema v2 com metadados e validação estrita com saneamento automático via `validateCharacterSchema`.
  - Suíte de Testes: 59 testes automatizados de QA aprovados com 100% de sucesso em `backup.test.mjs` e `rules-and-dice.test.mjs`.
  - Build de Produção: 17 rotas estáticas e dinâmicas geradas com sucesso sem erros.
