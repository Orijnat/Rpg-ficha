# Sessão Ativa — Mapeamento Fullstack & Criação do Checklist de Backend

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
