# Memória do Agente Orquestrador (@orchestrator)

## Entrega — 2026-11-20 (Backend das Anotações — CRUD + Privacidade com Testes)

- **Especialistas Acionados**: `backend-database`, `audit-and-security`, `qa-tester`.
- **Demanda do Usuário**: "faca o backend sobre as anotacoes".
- **Diagnóstico**: Backend de anotações **já implementado** (notaController CRUD, model Note, rotas `/campanhas/:id/notas` + `/notas/:id`, notaSchema, filtro server-side de privacidade, ownership mestre/autor). Frontend já consumia os endpoints.
- **Completude entregue**: criação da suíte backend `test/notas.test.js` (12 testes: listar mestre/jogador-sem-acesso/filtro privacidade; criar validação+normalização; atualizar 404/403/sucesso; remover 404/403/sucesso) → backend **123/123 passando**.
- **Validação**: backend 123/123 testes OK.

## Entrega — 2026-11-20 (Organização e Preparação de Sessões + Método de Escrita — /admin/sessoes)

- **Especialistas Acionados**: `frontend-artisan` (skill `sheet-component-builder`), `qa-tester`.
- **Demanda do Usuário**: "poderia melhorar a organizacao e porecar as sessoes, pois esta muito ruim o metodo de escrever".
- **Diagnóstico**: Backend já suportava `cenas`/`objetivos`/`recompensas` via `dadosExtras` JSONB — o FRONTEND não tinha UI de escrita (form mantinha defaults fixos e salvava sem input).
- **Implementações Entregues** (front `src/app/admin/sessoes/page.js`):
  * Form "Planejar Próxima Sessão" → editor real: cenas (título+descrição, adicionar/remover, "Cena N"), objetivos (texto, adicionar/remover), recompensa XP+tesouro, data prevista.
  * `handleSaveNewSession` monta payload (`cenas`→`{titulo,descricao,ordem,concluido}`, `objetivos`→`{descricao,concluido,tipo}`, filtra vazios) e envia ao backend.
  * Form resetado após salvar; `loadCampaign` ordena por `numero` ASC.
  * `SessionNotesField` → auto-save debounce 900ms (manual mantido).
- **Validação**: ESLint 0 erros (2 warnings pré-existentes no arquivo); testes **162/162**; `next build` OK (rota /admin/sessoes gerada).
- **Pendências**: conferência visual no navegador; nada commitado.

## Entrega — 2026-11-10 (Blindagem Canônica da Tela Inicial & Temas Claros de RPG)

- **Especialistas Acionados**: `frontend-artisan` (skill `sheet-component-builder` e `frontend-design`), `qa-tester`.
- **Demanda do Usuário**: Fazer com que a tela inicial pública (`/`) nunca sofra alteração de estilo ao mudar de tema na ficha enquanto logado.
- **Implementações Entregues**:
  * **Isolamento de Rota em `ThemeContext.jsx`**: Implementado efeito baseado em `usePathname()`. Sempre que a rota ativa for `"/"`, o atributo `data-theme` de `document.documentElement` é forçado para `"amber"`. Ao navegar para qualquer outra rota (ficha, painel, inventário, etc.), o tema configurado pelo jogador é restaurado instantaneamente.
  * **Casulo Canônico em `AppShell.jsx`**: Aplicação condicional de `data-theme={isLandingPage ? "amber" : undefined}`, cores fixas de fundo (`#090b0e`), texto canônico (`#ebd9be`) e auras de iluminação mística âmbar quando na landing page.
  * **Blindagem Raiz em `src/app/page.js`**: Elemento container raiz explicitamente configurado com `data-theme="amber"`, cores de fundo e texto fixas e auras de fundo em Âmbar Vulcânico, impossibilitando qualquer herança espúria ou vazamento de temas claros/alternativos.
  * **Suporte Prévio a Temas Claros**: Criação e integração dos temas `parchment` (Pergaminho Antigo) e `sunlight` (Catedral da Luz) no catálogo e nas variáveis globais CSS.
- **Validação de Integridade**:
  * ESLint: **0 erros, 0 avisos** nos arquivos alterados.
  * Testes Unitários de Temas: **100% aprovados** (`node --test src/lib/__tests__/themes.test.mjs`).
  * Next.js 16 Production Build: **28/28 rotas geradas com sucesso** em 2.4s.

## Entrega — 2026-11-09 (Mapeamento Completo da Aplicação e Correção de Erros de Runtime & Lint)

- **Especialistas Acionados**: `qa-tester`, `frontend-artisan` (skill `sheet-component-builder`).
- **Problema Inicial**: Erro em runtime `Crown is not defined` em `src/app/admin/layout.js:26:16`.
- **Diagnóstico & Causa Raiz**:
  * Em commit recente, o cabeçalho e navegação de `AdminLayout` foram reescritos utilizando componentes (`Crown`, `Link`), hooks (`usePathname`) e constantes (`NAV_ITEMS`), mas os respectivos `import` e declaração da constante não estavam presentes no arquivo.
  * O erro não quebrava o build SSG estático porque a linha `if (loading || !isAuthenticated || !isMaster) return null;` retornava `null` no SSR/prerender, manifestando-se apenas quando o usuário mestre autenticado navegava para `/admin`.
- **Varredura Completa da Aplicação**:
  * Desenvolvido e executado scanner AST em Babel percorrendo todos os arquivos `.js` e `.jsx` em busca de variáveis/identificadores não declarados no escopo.
  * Detectado e corrigido bug crítico similar em `CharacterContext.js`: `isMaster` não estava sendo extraído de `useAuth()`, provocando falhas ao aprovar/solicitar habilidades.
  * Detectado e corrigido erro sintático de parser `CoinDisplay has already been declared` em `Coin.jsx`.
  * Detectados e corrigidos caminhos relativos de importação quebrados em `AnotacoesImproved.jsx` (`./ui` e `../context/CharacterContext`).
  * Corrigidos erros de entidades não escapadas no JSX em `convite/[code]/page.js` e `AbilityCard.jsx`.
- **Validação de Integridade**:
  * ESLint: **0 erros** (reduzido de 11 erros para zero).
  * Scanner de identificadores não declarados: **0 erros**.
  * Scanner de imports e exports locais: **0 erros**.
  * 48 testes unitários passando (100%).
  * Build Next.js 16 (Turbopack): **28/28 rotas geradas com sucesso** em 4.3s.

## Entrega — 2026-11-09 (Reformulação Visual Artesanal Dark Fantasy: Jogador & Mestre)

- **Especialistas Acionados**: `frontend-artisan` (skill `sheet-component-builder` e `frontend-design`), `dice-mechanic` (skill `dice-roller`) e `qa-tester`.
- **Implementações Entregues**:
  * **Tipografia e Tokens Globais (`globals.css`)**: Ativação das famílias `Cinzel`, `Cinzel Decorative` e `Crimson Text` registradas no `@theme inline` com classes semânticas (`font-cinzel`, `font-decorative`, `font-journal`).
  * **Superfícies Folio & War Room**: Classes estruturais `.grimoire-card` (cartões velino com cantoneiras de metal e gradiente artesanal) e `.war-room-card` (acabamento obsidiana tático).
  * **Cabeçalho Contextual Inteligente (`Cabecalho.jsx`)**: Distingue a visão do Jogador (nome do aventureiro, nível, frasco de PV com gradiente fluido e tema) da visão do Mestre (insígnia da Soberania do Narrador, título de mesa e atalhos rápidos).
  * **Sidebar do Grimório (`AppShell.jsx`)**: Separação visual entre "Folio do Jogador" e a seção destacada "Narrador (Câmara do Mestre)" com glow âmbar realçado.
  * **Medalhões dos 7 Atributos (`StatBox` em `ui.js`)**: O modificador (ex: `+3`, `-1`) foi transformado no centro visual de ação, permitindo rolagem de teste com 1 clique direto e animação de d20.
  * **Sala de Guerra do Mestre (`admin/page.js` e `admin/layout.js`)**: Ribbon tático de navegação entre módulos, combate com indicação destacada de turno ativo, botões táteis de PV (`-5`, `-1`, `+1`, `+5`) e chips de condição em formato de selo de cera (`.wax-seal`).
  * **Alinhamento de Telas Secundárias**: Perícias, Quarto, Montaria e Mundo sem cores hexadecimais soltas, 100% integrados à paleta semântica dos 5 temas dinâmicos.
- **Validação**: 38 testes de regras/dados aprovados; build Next.js 16 (26 rotas) executado com sucesso em 4.1s; `git diff --check` sem erros.

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

## Entrega — 2026-11-14 (Mapeamento de ambiente e orquestrador OpenCode)

- **Demanda do usuário**: acessar/mapeiar o projeto e gerar o orquestrador para OpenCode antes de iniciar o desenvolvimento.
- **Ações realizadas**:
  - Mapeado ambiente: stack (Next.js 16/React 19/Tailwind v4, Node deps), estrutura (`src/app`, `src/layouts`, `src/lib`, `docs`), integrações (`NEXT_PUBLIC_API_URL` para `Rpg-backend`), ecossistema de agentes/skills/memórias (`.agents/`, `.github/agents/`) e estado de sessão prévio.
  - Criado `.opencode/agent/orquestrador.md` (agente `primary`) com protocolo obrigatório de leitura/atualização de memória, roteamento para especialistas/skills do Grimorium, guardrails de arquitetura/segurança e exigência de validação.
  - Atualizados `.agents/memory/active_session.md` e `.agents/memory/last_prompt.json` com contexto, ações e próximo passo.
- **Validações**: inspeção estrutural e conferência dos artefatos gerados; sem alterações de código de aplicação.
- **Pendências/observações**: OpenCode requer reinício para carregar novos agentes/configs; worktree possui alterações pré-existentes de outras sessões (não tocadas).
- **Próximo passo**: reiniciar OpenCode, selecionar/usar `orquestrador` e iniciar desenvolvimento conforme demanda, delegando aos especialistas adequados.


## Entrega — 2026-11-14 (Bugs do itens-a-fazer: atributos, fichas duplicadas, vazamento)

- **Demanda do usuário**: continuar o desenvolvimento a partir de `itens-a-fazer.md` (escopo: "Bugs").
- **Causas-raiz encontradas**:
  - `/auth/me`, `login` e `register` devolviam o personagem cru (sem atributos/aliases/flattening) → frontend gravava `undefined` → backend regravava 10 → "status não salvavam".
  - `/characters/sync` sem `id` criava um personagem novo a cada chamada → fichas duplicadas; frontend nunca adotava o id criado.
  - Dados demo "Geralt de Rívia" (`defaultData`) vazavam para fichas reais + chaves de cache globais (`bruxeiro-sheet:*`, `rpg-gm-dashboard`, mercado) compartilhadas entre usuários no mesmo navegador.
- **Correções**:
  - Backend: novo `services/characterPublic.js` (serialização canônica compartilhada); `authController` usa `publicCharacter` e cria `AtributosPersonagem` no register; `normalizeCharacterPayload` mapeia `xp`→`experiencia`; `fichaSchema` aceita `xp` + mirrors; sync idempotente (sem id reutiliza ficha mais recente do usuário; id inexistente → 404).
  - Frontend: `createBlankCharacterData()` no lugar do demo; guard de sync sem id; adoção do id retornado (`AuthContext.upsertCharacter`); cache `bruxeiro-sheet:v2:` + purge das chaves v1; `clearAuth` zera caches por usuário; dashboard GM e mercado namespaceados por `userId`.
- **Validações**: backend `npm test` 10/10; frontend build OK; `themes.test.mjs` falha pré-existente; smoke test E2E em Postgres local docker (registro → sync atributos/xp/inventário/moedas → `/auth/me` round-trip; sem duplicação; 404; bankPassword não vaza). Containers de teste removidos.
- **Pendências**: dados demo já persistidos no Supabase exigem limpeza one-time (a definir com o usuário); lint XPBar pré-existente.
- **Correção extra**: `normalizeCharacterPayload` zerava atributos ausentes para 10 em PATCHes parciais; agora `atributosPatchFromPayload` atualiza só os atributos enviados (verificado com PUT `{hp:55}` mantendo FOR/DES/xp).


## Entrega — 2026-11-14 (Remodelação visual: React Bits + GSAP + Lenis)

- **Demanda do usuário**: instalar React Bits, Lenis e GSAP e remodelar o design da aplicação, deixando-a mais temática (escopo escolhido: landing + login/registro + identidade global).
- **Ações**:
  - React Bits esclarecido: não é npm; JSONs de `reactbits.dev/r/*-JS-TW.json` vendored em `src/components/react-bits/` (Aurora, SplitText, ShinyText, SpotlightCard) + README de atribuição; pasta isenta do ESLint.
  - `npm install lenis gsap @gsap/react`.
  - Landing: fundo Aurora WebGL (âmbar/violeta) + vinheta; hero SplitText (rise por palavras); ShinyText nos CTAs; SpotlightCard nos pilares; reveal GSAP ScrollTrigger nas seções; copy e funcionalidade interativa preservadas.
  - Login/Registro: `AuthScaffold` compartilhado (Aurora + anel de runas + entrada GSAP); `<SmoothScroll>` Lenis global em `layout.js` respeitando reduced-motion.
  - **Incidente**: `src/` sumiu do worktree durante a sessão (deleção externa); restaurado de stash dangling `0c3d4ca` via `git checkout <sha> -- src/`; fixes de bugs preservados; nada commitado.
- **Validações**: build OK; dev server 200 em `/`, `/login`, `/registro`, `/personagem`; lint sem erros novos; testes 134/135 (1 falha pré-existente).
- **Pendências**: revisão visual em navegador; limpeza de dados demo no Supabase; `.opencode/` não rastreado.


## Entrega — 2026-11-14 (Agente QA Judge)

- **Demanda**: criar agente especialista em QA para julgar qualidade, responsividade, beleza e falhas das aplicações.
- **Artefatos**: `.github/agents/qa-judge.agent.md`, `.opencode/agent/qa-judge.md`, `.agents/memory/qa-judge.md`, referência em `AGENTS.md`.
- **Rubrica**: Responsividade 25% · Beleza/coerência 25% · Falhas/robustez 40% · Acessibilidade 10%; veredicto com severidade S1–S4 e evidências literais (build, lint, testes, curl, grep de anti-padrões); modo somente julgamento (`edit: deny`), correções delegadas.
- **Validação**: artefatos criados e integrados ao ecossistema de agentes; sem execução de julgamento real ainda (pendente: usar em uma tela de referência e calibrar a rubrica).


## Entrega — 2026-11-14 (Auditoria banco+back+front)

- **Demanda**: mapear o sistema completo (banco, backend, frontend) e achar falhas e detalhes a ajustar.
- **Artefato**: `docs/AUDITORIA-SISTEMA-2026-11-14.md` (relatório completo S1–S4, top-10, plano em 4 fases).
- **Verificado empíricamente** (Postgres local docker, descartado ao final): bankPassword em claro vaza em /auth/me etc.; `/api/npcs?q=` perde escopo de posse e vaza NPCs+notasMestre entre mestres; PUT /encontros/:id sempre 422; criação de sessão sempre 422; sync sem id sobrescreve ficha errada.
- **Sem alteração de código** (escopo de mapeamento). Próximo passo recomendado: sessão de hardening S1 (F-01, A-01, F-02, F-03) com validação empírica.

## Entrega — 2026-11-14 (Hardening S1 da auditoria)

- **Demanda**: "implemente as alteracoes presentes no coisas a fazer" — escopo confirmado com o usuário: somente os itens S1 (críticos).
- **Ações** (working tree, nada commitado):
  - F-01/A-02: `publicCharacter` nunca retorna `bankPassword`/`bankPasswordHash`; `data.user` vira subset; `includeUser` sem `password`; `PUT /characters/:id/bank/password` (bcrypt) define/remove senha personalizada por ficha; `verificarBankPassword` usa hash personalizado ou a senha do login do dono.
  - A-01: `skipSyncRef` no `CharacterContext` bloqueia sync após "Restaurar padrão"; `targetId` sem fallback do personagem ativo; confirmação tipada; `reloadFromCloud` reidona e reativa sync.
  - A-01/A-02: importação de JSON com confirmação tipada; identidade do arquivo descartada; restaura na ficha ativa; `defaultData` sem `"133313"`; `backup.test.mjs` atualizado.
  - F-02/F-03: verificados empiricamente (já corrigidos no working tree anterior: Op.and; encontroSchema completo).
- **Validações**: front 135/135, back 17/17, build OK, eslint 0 erros; Postgres 16 descartável via docker para testes ao vivo (removido ao final).
- **Pendências**: itens S2+ da auditoria (F-04…F-10, A-03, A-05…A-07, etc.); migration `20261114130000-npc-campanha-nullable.js` ainda não aplicada; conferência visual no navegador.

## Entrega — 2026-11-14 (Restantes do itens-a-fazer — escopo total, sem consulta)

- **Demanda**: "continue com o resto das alteracoes pendentes ... pode executar sem me consultar".
- **Banco/Backend**: `database/migrate.js` (ESM, idempotente, sem sequelize-cli; baseline+v2+incrementais); baseline protegida (só sem `usuarios`); migration `20261114140000-auth-tokens-email.js` (email_verified/token hashes/password_changed_at; contas legadas grandfathered); `mailer.js` (nodemailer, SMTP_*, devPreviewUrl fora de produção); `/auth/verify-email|resend-verification|forgot-password|reset-password`; authMiddleware revoga JWT por `password_changed_at` (iat <= floor(...) → 401); logout revoga; sync com concorrência otimista (`updatedAt`, 409 + serverCharacter, `force:true`); publicCharacter emite alias `updatedAt`; sessões com retry de numeração; `requireMaster` nas rotas mestre; legado com allowlist; auditoria com log estruturado. 22 testes (novo `sync_conflict.test.js`).
- **Frontend**: conflict UI (Manter da nuvem / Manter meus dados); `Critério de payload`: remoteVersionRef; páginas `/verificar-email`, `/esqueci-senha`, `/redefinir-senha`; banner reenviável no AppShell; telas de auth com link "Esqueci a senha"; BP/nível já funcionava (2/3/4/5/6 confirmado); Montarias + PE máx + dado de vida (já na árvore) confirmados; iniciativa mescla na Sala de Guerra (20s/foco, aditivo, HP/condições locais preservados); vitalidade na navbar; temas: `[data-theme="mist"]` criado + acentos claros AA/AAA; 270 hex→tokens; DiceModal/DanoCuraPainel via next/dynamic. Build 30/30, testes 135/135.
- **Verificação empírica** (Postgres 16 descartável, removido): registro/verify/reset completos, revogação JWT 401, rate limiter (AUTH_RATE_LIMIT configurável), F-04…F-10, A-03, A-07 (409 real).
- **Pendências**: A-12/A-13 parciais (páginas gigantes, sweep img/text-[9px] — pedem browser); SMTP real e deploy são do operador; nada commitado.

## Entrega — 2026-11-14 (COISAS-A-FAZER — fase 1)

- **Demanda**: "comece a imoplementar o coisas a fazer".
- **Docs criadas**: INSTALACAO, BACKUP-RESTORE (round-trip testado), TROUBLESHOOTING, CHANGELOG (semver), RUNBOOK-PRODUCAO, SEGURANCA (LGPD + incidente), MIGRACAO-LEGADA, REGRAS-DECISIOES (13 vereditos + calculado×editável + limites + campanha + visibilidade), GOOGLE-INTEGRATION, IMPORTACAO-PLANILHA.
- **Backend**: rolagens persistidas (`POST/GET /api/rolagens`, ACL mesa/ficha); uploads seguros (`/api/arquivos`, magic bytes, no public dir, URLs assinadas HMAC 15min, cleanup de órfãos); `SessaoAutenticacao` real (revogação no logout/reset); migrações novas (rolagens, arquivos, índices reforço, cenario em campanhas); `backup.js` (pg_dump round-trip); exports CSV ficha/bestiário/campanha (testado live); CI com Postgres 16 (migrações + 28 testes).
- **Frontend**: galeria do Diário via upload real; `classes.js` + datalist no cadastro; 0 lint errors (XPBar→React Compiler); 140/140 testes; build OK.
- **Verificado ao vivo** (Postgres descartável, removido ao final): rolagens ACL, uploads (magic bytes/extension/assinatura/ACL), sessões (logout→401, reset→todas revogadas), exports CSV, S2 completa, e-mail, restauração de backup.
- **Pendente (operador)**: credenciais Google/SMTP/deploy; E2E/a11y/mobile sem browser; cookies HTTP-only; A-12/A-13 parciais. Nada commitado; `backups/`, `private_uploads/` removidos/gitignored; body-parser atualizado (high→0; 8 moderate dev-deps aceitas).

## Entrega — 2026-11-15 (Mapa tático: membros podem criar/mover miniaturas; fix trust proxy + migrações em produção)

- Render/Supabase: login 502 corrigido — `app.set("trust proxy", 1)` (commit `04a2a5c`) + migrações aplicadas no Supabase de produção (`email_verified` etc. existiam localmente mas não na prod).
- Bug "miniatura some ao adicionar" (mapa-tatico): causa raiz = backend descartava PATCH de membro sem `id` existente (merge só movia) e a UI fazia merge `{...current, ...updated}` substituindo pela lista sem a nova miniatura.
- Correção (trabalhando): `mapaTaticoController.atualizar` — membro cria miniatura nova (forçando `oculto:false`), move/ajusta `x,y,tamanho,hp` de existentes; não apaga (tokens ausentes são mantidos), não oculta/renomeia/hpMax. Mestre inalterado (substituição total). Verificado ao vivo em Postgres descartável: criar/mover/ocultar bloqueado/hpMax bloqueado/titulo 403/mestre vê tudo. Frontend: paleta "Monstruos & NPCs" visível para jogadores.
- Regra de ACL do mapa: jogador+mestre adicionam e movem; só mestre altera o mapa (fundo/grade/título/ocultar/remover).
- Pendente: commit/push + redeploy no Render; commit do frontend (mapa-tatico/page.js).

## Entrega — 2026-11-15 (Mapa tático: ícones de miniatura personalizáveis)

- Backend: `tokenMapaSchema` aceita `icone` (enum de 24 chaves: shield, shieldCheck, sword, swords, axe, wand, crown, skull, ghost, flame, zap, heart, star, eye, cat, sparkles, gem, bug, bird, paw, flask, moon, anchor, hammer); membro pode alterar `icone` de token existente (junto a x/y/tamanho/hp); mestre via substituição total. Sem migration (tokens JSONB).
- Frontend: `TOKEN_ICONS` + grade de 24 ícones Lucide no painel "Alvo selecionado"; `addToken` define `icone` padrão (shield=personagem, sword=monstro); tokens legados sem `icone` renderizam o padrão.
- Verificado em Postgres descartável: criar com icone, trocar icone (membro), icone inválido → 422, mestre cria com crown. `next build` OK, eslint só o warning pré-existente.
- Pendente: commit/push (front e back) + redeploy no Render.

## Entrega — 2026-11-15 (Mapa tático: fundo por sessão + URL; decisão anti-Storage do operador)

- Incidente: imagens do mapa não carregavam na Vercel — causa raiz: helmet default `Cross-Origin-Resource-Policy: same-origin` bloqueava o `/api/arquivos/:id` cross-origin. Fix commit `77cc96a` (helmet CORP cross-origin), verificado com curl (200 + header `cross-origin`, 403 sem `rt`).
- Solução anterior (Supabase Storage) descartada pelo operador ("vai lotar o banco"); segundo fator é Render disco efêmero (arquivos somem a cada deploy).
- Decisão do operador: armazenamento **por sessão**. Frontend: botão "Mapa" virou object URL local (não envia nada ao servidor, só nesta aba; revoga ao limpar/trocar/desmontar); novo botão "URL" persiste `urlFundo` (imagem externa pública, salva só como texto — visível a toda a mesa); lixeira limpa ambos. sessionBg tem precedência sobre o fundo salvo; fundo existente por arquivo (`arquivoFundoId`) continua suportado por compatibilidade (pode 410 no Render).
- `next build` OK; eslint só o warning pré-existente. NÃO commitado ainda.

## Entrega — 2026-11-15 (Mandato autônomo do operador: desenvolver até as 17h; lote 1)

- Backend: suíte offline nova `test/mapa_tatico.test.js` (ACL: membro cria forçando oculto:false, move x/y/tamanho/hp/icone, mantém ausentes, não renomeia/hpMax/título 403; mestre substitui total; ocultos filtrados no GET; mestre intruso 403; schema zod aceita/rejeita ícones) — 54/54 PASS. `test/security_auth.test.js` (login anti-enumeração, JWT expirado/secret errada/usuário removido/passwordChangedAt/sessão revogada → 401; válido → next()) — junto no total 54/54.
- Frontend: refatorado ícones do mapa para `src/lib/mapaTatico.js` (TOKEN_ICONS/ICON_OPTIONS/ICONES_BACKEND_KEYS/defaultTokenIcon/resolveTokenIcon) + suíte `mapa-tatico.test.mjs` (paridade das 24 chaves com o enum do backend) — 145/145 PASS; build e lint OK.
- Docs: TROUBLESHOOTING (ERR_ERL_*, email_verified 42703, imagens CORP/efêmeras), RUNBOOK-PRODUCAO (trust proxy, CORP, disco efêmero), CHANGELOG (não lançado 2026-11-15), itens/COISAS-A-FAZER-BACKEND atualizados.
- Skills novas (espelhadas `.agents/skills` ↔ `.github/skills`): `mapa-tatico` (ACL, contrato, fundo por sessão/URL, armadilhas) e `render-supabase-producao` (sintoma→causa→correção do stack Vercel/Render/Supabase).
- npm audit: uuid <11.1.1 transitivo de sequelize (moderado; `--force` trocaria para sequelize@3 — NÃO fazer).
- Tudo NÃO commitado (mandato sem pedidos de commit); working tree: back (testes + .env.example), front (mapaTatico.js, page.js, docs, skills).

## Entrega — 2026-11-15 (Lote 2 — verificação empírica do fix do proxy)

- `trust proxy` verificado: servidor local atrás de header `X-Forwarded-For: 203.0.113.7` — `GET /api/health` 200, `POST /api/auth/login` chega ao controller (401 credenciais), ZERO ocorrências de `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` no log. Container descartável removido.
- Cleanup de código morto no `/mapa-tatico` (`activeTool`/`focusMapField` não usados); build 31/31, lint só o warning pré-existente, 145/145 testes front.

## Entrega — 2026-11-15 (Lote 3 — A11y de tipografia)

- 54× `text-[9px]` → `text-[10px]` em 21 arquivos (piso de legibilidade); build 31/31 OK, eslint 0 erros (42 warnings, todos pré-existentes), 145/145 testes.

## Entrega — 2026-11-15 (Lote 4 — higiene)

- `npm audit fix` seguro no frontend: typescript-eslint 8.59.4 → 8.72.2 (devDeps, resolve 5/7 moderadas restantes ficaram por exigir major do eslint-config — não forçar).
- Validation docs atualizados em COISAS-A-FAZER (npm test front 145 / back 54; audit remanescente documentado).
- Changelog 2026-11-15 atualizado (a11y text-[10px], refactor mapaTatico.js, audit fix).
- EmberCanvas confirmado acessível (prefers-reduced-motion + aria-hidden).
- Texto menor: `text-[9px]` → `text-[10px]` (54 ocorrências, 21 arquivos).

## Entrega — 2026-11-15 (Lote 5 — hardening do JWT legado do frontend)

- `src/lib/jwt.js`: HMAC comparado com `crypto.timingSafeEqual` (+ checagem de tamanho) em vez de `===`; `signJwt` não emite mais token `unsigned` quando o módulo criptográfico falha (falha fechado). `server-auth.js` permanece só para testes (API routes legadas removidas; JWT real é validado no backend).
- Testes `server-auth.test.mjs` ampliados (adulteração → throw, expirado → throw, round-trip ok): **148/148 PASS**. Build OK.
- Nota: frontend usa `jwt.js` client-side apenas para UX (decodificação não-verificada documentada no código); a segurança real está no backend.

## Entrega — 2026-11-15 (Lote 6 — sessão client-side confia só no servidor)

- AuthContext: removido o "upgrade" client-side de perfil via `sessionStorage` (mestre falsável no próprio navegador); perfil/role vêm de `/auth/me` (fonte única, servidor).
- `storeAuth` não persiste mais `rpg_auth_user` (cópia de PII em repouso); limpeza legada mantida. 148/148 testes, build OK, lint limpo.

## Entrega — 2026-11-15 (Skills globais instaladas via `npx skills -g`)

- Instaladas em ~/.agents/skills (OpenCode e agentes que leem esse diretório): vercel-react-best-practices, web-design-guidelines, vercel-composition-patterns (vercel-labs/agent-skills), frontend-design, skill-creator (anthropics/skills), supabase-postgres-best-practices (supabase/agent-skills), grill-me, improve-codebase-architecture, code-review (mattpocock/skills), systematic-debugging (obra/superpowers), agent-browser (vercel-labs/agent-browser). find-skills já existia.
- Descartadas por fora do stack do projeto: séries de vídeo/imagem (heygen, remotion, superpowers-ai), Azure, Lark/Feishu, Prisma (sequelize no projeto). `skills-lock.json` (projeto) não foi tocado; instalações foram globais e privadas do usuário (~/.agents).
- Nota: `npx skills add` falhou com target automático ("PromptScript does not support global"); corrigido com `-a opencode -g -y`.

## Entrega — 2026-11-16 (Remover recomendação de classe no cadastro)

- `src/app/registro/page.jsx`: removidos o `<datalist id="grimorium-classes">` (sugestões de `DEFAULT_CLASSES`) e o atributo `list` do campo "Classe / Ocupação" (texto livre); import `DEFAULT_CLASSES` removido. Build OK, 159/159 testes, eslint 0 erros. NÃO commitado.
Commitado e pushado: `d800e1e` (fix(registro): remover recomendação de classe no cadastro). Deploy automático da Vercel a partir do main; produção ainda não verificada ao vivo (CLI Vercel deslogada).
- 2026-11-17: remoção TOTAL de envio/verificação de e-mail e reset de senha por e-mail (a pedido do usuário); migration `20261117030000-remove-email-mail.js` aplicada no Supabase (colunas dropadas); suíte back 72/72, front 159/159 + build OK; NÃO commitado; deploy Render pendente.

## Entrega — 2026-11-17 (422 · campo `classe` como objeto)

- Causa raiz: backend `publicCharacter` vazava a associação Sequelize `classe` como objeto (`{id,slug,nome,dadoDeVida}`) — zod `classe: texto(80)` rejeitava com "expected string, received object".
- Fix backend: `delete data.classe` em `characterPublic.js` (após derivar classId/classSlug/className/hitDie) + novo teste `public_classe.test.js` → back **111/111**.
- Fix frontend (defesa em profundidade): `asTextoCurto()` em `normalizeCharacterForSync` (classe só vai como slug/nome/string curta); `/admin/personagens/[id]/ficha` sanitiza `payload.classe` no PUT. **162/162**, build OK, lint 0 erros. NÃO commitado.
- Deploy: backend precisa de Manual Deploy no Render (o fix do front já segura o 422 sem ele).

## Entrega — 2026-11-17 (Documentação completa do sistema + README)

- docs/ARCHITECTURE.md reescrito (manual completo do sistema: front/back/infra, sync, auth, contrato API, deploy, armadilhas).
- README.md reescrito (stack, / landing, NEXT_PUBLIC_API_URL com /api, 162 testes, seção Produção, troubleshooting).
- Fix colateral: retrySyncRef movido para useEffect (lint 0 erros). NÃO commitado.

## Entrega — 2026-11-17 (Liberação de ascensão por feito)

- Subir de nível exige XP (tabela existente, inalterada) + flag `dadosExtras.levelUpLiberado` setada pelo mestre.
- Botões: /personagem ("Liberar Ascensão", cadeado) e /admin/personagens (cadeado por herói; +1 Nv. e Nível da Mesa só promovem liberados). Liberação consumida a cada subida. 162/162, build OK. NÃO commitado.

## Entrega — 2026-11-17 (Logo/favicon Âmbar Vulcânico)

- public/ambar-vulcanico.svg (do Downloads do Windows) vira favicon (metadata.icons; favicon.ico removido) e logo da app (AppShell, Cabecalho, landing, login, registro, rodapé). 162/162, build OK. NÃO commitado.
