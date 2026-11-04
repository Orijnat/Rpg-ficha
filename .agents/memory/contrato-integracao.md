# Memória do agente Contrato de Integração RPG

## Missão

Manter alinhamento entre frontend, backend, banco e regras de autorização.

## Contratos canônicos atuais

- Autenticação: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`.
- Personagens: `/api/characters`, `/api/characters/:id`,
  `/api/characters/sync`.
- Campanha do mestre: `/api/campanha`.
- Perfis: banco canônico `jogador`/`mestre`; alias legado `player`/`master`.
- Frontend ainda consome aliases como `FOR`, `DES`, `inventory`, `contracts` e
  `notesImages`; backend deve serializar compatibilidade.
- Moedas públicas devem existir tanto no formato legado plano
  (`latina`, `ouro`, `prata`, `cobre`) quanto agrupado (`moedas`/`currencies`).
- `POST /api/characters/sync` responde `{ success, message, character }`;
  o cliente normaliza e entrega `character` ao consumidor.

## Regras de privacidade

- Jogador acessa somente seus personagens e dados públicos da campanha.
- Mestre acessa recursos da campanha conforme sua associação.
- Senhas, tokens, senha do cofre e notas privadas nunca entram em respostas de
  jogador.

## Checklist de cada handoff

- [ ] Request e response documentados
- [ ] Status 401/403/404/409/422 definidos
- [ ] Campos nullable/default conferidos
- [ ] Propriedade e perfil validados no servidor
- [ ] Alias legado preservado ou migração definida
- [ ] Frontend e backend validados juntos

## Pendências conhecidas

- Consolidar migrations versionadas para substituir `sequelize.sync({ alter: true })`.
- Adicionar testes automatizados de contrato para `/api/campanha` e perfis.
- Validar em ambiente com PostgreSQL uma ficha antiga que possua somente os
  campos em inglês/agrupados; a normalização foi adicionada, mas não há fixture
  de banco neste repositório.

## Ajustes de integração — 2026-11-04

- Mantidos os aliases `/api/campanha` (legado, dados do mestre) e
  `/api/campanhas` (coleção de campanhas). O primeiro aceita GET/PUT para
  compatibilidade com `fetchCampaignData`/`updateCampaignData`.
- Respostas de autenticação que incluem personagens removem `bankPassword`.
- Cadastro público sempre cria `jogador`; tentativa de alterar `perfil`/`role`
  para outro perfil retorna 403.
- Criação/atualização de personagem não permite apontar `campanhaId` para uma
  campanha sem associação válida. NPCs ficam limitados ao mestre proprietário
  (leitura de campanha pode ser feita por membro autorizado).
- Ainda pendente: migrations versionadas e fixture PostgreSQL para verificar a
  compatibilidade entre `database/banco.sql` e todas as colunas Sequelize.

## Hardening P0/P1 — 2026-11-04

- `GET /api/characters` sem parâmetros continua retornando array para
  compatibilidade. Ao enviar `page`, `limit`, `search` ou `q`, retorna
  `{ characters, pagination: { page, limit, total, totalPages } }`; `limit`
  máximo é 100 e a busca é por nome/classe.
- Sessões de jogo foram registradas em
  `/api/campanhas/:campanhaId/sessoes` (GET/POST) e
  `/api/campanhas/sessoes/:id` (GET/PUT/DELETE). A tabela é `sessoes_jogo`;
  `sessoes_autenticacao` continua exclusivamente para tokens.
- Recursos de encontros, mapas, notas e sessões exigem campanha própria ou
  associação ativa. Jogadores veem somente conteúdo permitido; mutações de
  campanha ficam restritas ao proprietário. Respostas 403/404 preservam o
  padrão existente.
- Testes offline cobrem parser de paginação e aliases de perfil. A execução
  com PostgreSQL ainda é necessária para validar SQL, associações e autorização
  multiusuário real.

## Fases iniciais do backend — 2026-11-04

- O backend passou a usar migrations Sequelize versionadas em
  `database/migrations/`; o servidor não chama mais `sequelize.sync()`.
- `POST /api/auth/register`, `POST /api/auth/login` e mutações de personagens
  usam schemas Zod. Campos desconhecidos são filtrados (segredos como
  `bankPassword` não entram no schema) e erros retornam `422` com
  `{ error, code: "VALIDATION_ERROR", details }`.
- Foram adicionados `/health/live` e `/health/ready`; o último retorna `503`
  se o PostgreSQL não estiver disponível. O JSON HTTP padrão foi limitado a
  `1mb` (`JSON_BODY_LIMIT` pode ajustar explicitamente).

## Contrato de backend — 2026-11-04

- O backend separado usa `npm run db:migrate` com Sequelize CLI; o servidor não
  cria ou altera tabelas automaticamente.
- Payloads inválidos em rotas validadas retornam HTTP 422 com
  `status: "error"`, `statusCode: 422`, `code: "VALIDATION_FAILED"`,
  `message` e lista `errors[{ field, message }]`.
- Rotas de campanhas, NPCs, notas e encontros passaram a validar payloads Zod;
  aliases legados de personagem seguem aceitos.
- `/health/live` não depende do banco; `/health/ready` retorna 503 quando a
  conexão PostgreSQL está indisponível.
- A verificação de cofre retorna 429 durante bloqueio temporário após cinco
  falhas; segredos continuam fora da serialização pública.

## Hardening e testes — 2026-11-04

- Backend aplica allowlist CORS por `FRONTEND_URL`/`CORS_ORIGIN`, Helmet,
  limite JSON de 2 MB e rate limiting de 100/min geral e 5/min em login/cadastro.
- `/api/health` responde sem depender do PostgreSQL; erros internos não retornam
  detalhes da exceção ao cliente.
- Testes locais cobrem CORS, healthcheck, headers e payload excedente; testes de
  integração de autenticação, multi-tenant, notas e combate exigem PostgreSQL.

## Investigação 2026-10-16

- Causa raiz confirmada: o Sequelize mantém campos canônicos em português
  (`pericias`, `itensInventario`, `contratosDados`, `moedas`), enquanto as telas
  editam aliases (`skills`, `inventory`, `contracts`, moedas planas). Como os
  arrays canônicos têm default `[]`, o frontend podia escolher esse array vazio
  e esconder o alias populado; moedas editadas no frontend também não eram
  copiadas para `moedas`/`currencies` no sync.
- Correção cirúrgica: `characterController.publicCharacter` agora preenche os
  dois lados dos aliases e expõe moedas planas sem expor `bankPassword`;
  `normalizeCharacterPayload` persiste moedas planas nos campos agrupados;
  `CharacterContext` escolhe aliases legados quando o array canônico está vazio.
- O cliente de sync agora desembrulha a resposta `character`, sem alterar a
  resposta pública da API.
- Autorização permanece server-side: personagens exigem Bearer e são limitados
  ao dono/mestre; campanha exige mestre. O segredo do cofre continua fora do
  DTO público.

## Correção de hidratação — 2026-10-16

- A ficha do jogador deve priorizar o personagem retornado por `/api/auth/me`
  ou `/api/auth/login` quando existe sessão válida.
- `localStorage` é somente fallback offline e deve usar a chave
  `bruxeiro-sheet:<characterId>` para impedir mistura entre personagens.
- Arrays vazios retornados pelo backend são dados válidos e não devem ser
  substituídos por cache anterior.
- O frontend mantém aliases (`FOR`, `inventory`, `contracts`, `notesImages`)
  para compatibilidade, mas deve preservar os campos canônicos recebidos.

## Correção de listagem — 2026-10-16

- `GET /api/characters` retorna o resumo sem `updatedAt`, pois a coluna física
  é `updated_at` e a seleção do alias Sequelize causava erro SQL.
- A ordenação continua usando `updated_at DESC`.
