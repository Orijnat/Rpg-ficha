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
