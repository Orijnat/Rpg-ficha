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
