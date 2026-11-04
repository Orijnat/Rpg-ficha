# Relatório de Status do Backend

**Data:** 04/11/2026
**Escopo:** backend Express, Sequelize, PostgreSQL, validação, testes e
hardening das fases 1 a 7 de `COISAS-A-FAZER-BACKEND.md`.

## Resumo executivo

A fundação do backend e o hardening inicial foram implementados. As fases 6 e
7 foram iniciadas e a infraestrutura de testes e segurança básica está
funcional. Ainda não é correto considerar o backend pronto para produção:
faltam testes de integração com PostgreSQL, algumas funcionalidades da área do
mestre, uploads seguros, sessões narrativas e melhorias de operação.

## O que foi alterado

### Banco e persistência

- Configurado Sequelize CLI com `.sequelizerc` e configuração por ambiente.
- Criada migration baseline em `database/migrations/`, usando
  `database/banco.sql`.
- Removido o uso de `sequelize.sync()` no bootstrap do servidor.
- Criado `npm run db:seed`, protegido por `SEED_PASSWORD`, para dados locais de
  demonstração.
- Mantidos modelos para usuários, personagens, campanhas, membros, NPCs,
  encontros, notas, mapas, sessões e auditoria.

### Validação e contratos

- Adicionado Zod para autenticação, personagens, campanhas, convites, membros,
  NPCs, notas e encontros.
- Payloads inválidos retornam HTTP 422 no formato:

  ```json
  {
    "status": "error",
    "statusCode": 422,
    "code": "VALIDATION_FAILED",
    "message": "Dados inválidos enviados na requisição.",
    "errors": [{ "field": "hp", "message": "Valor inválido." }]
  }
  ```

- Limite de JSON configurado em 2 MB.
- Aliases legados da ficha continuam aceitos quando compatíveis.

### Autenticação, autorização e privacidade

- JWT Bearer validado no middleware.
- Controle de proprietário de personagem e acesso a campanhas.
- Isolamento de mestres entre campanhas.
- Filtragem server-side de notas privadas.
- Senha do cofre protegida com bcrypt.
- Bloqueio temporário do cofre após cinco falhas consecutivas.
- Respostas públicas não serializam senhas, tokens ou senha do cofre.

### Área do mestre e recursos

- Campanhas, convites e membros.
- NPCs com CRUD, duplicação e auditoria.
- Encontros e sincronização de iniciativa da ficha.
- Mapas e marcadores.
- Auditoria de mutações sensíveis.
- Integração Google estruturada, ainda dependente de credenciais e teste real.

### Fase 6: testes

- Criados testes independentes de PostgreSQL para:
  - validação de login e ficha;
  - CORS;
  - healthcheck;
  - headers de segurança;
  - limite de payload.
- Estado verificado: `npm test` com **6 testes aprovados**.
- Sintaxe JavaScript e whitespace do diff aprovados.

### Fase 7: segurança e operação

- CORS com allowlist baseada em `FRONTEND_URL` e `CORS_ORIGIN`.
- Wildcard `*` rejeitado na configuração de CORS.
- Helmet habilitado.
- Rate limiting:
  - 100 requisições por minuto nas rotas gerais;
  - 5 requisições por minuto em login e cadastro.
- Endpoint `GET /api/health`.
- Healthchecks `GET /health/live` e `GET /health/ready`.
- Erros internos não retornam detalhes da exceção ao cliente.
- Logs revisados para evitar exposição direta de credenciais.

## O que ainda falta implementar

### Pendências funcionais

- Separar a migration baseline em migrations versionadas por entidade.
- Validar a migration e os modelos contra PostgreSQL real.
- Adicionar paginação e busca em `GET /api/characters`.
- Implementar logs de combate dedicados.
- Implementar sessões narrativas e conclusão com distribuição de recompensas.
- Completar upload de mapas/imagens com armazenamento privado.
- Validar MIME real, tamanho, extensão, autorização e limpeza de arquivos.

### Pendências de testes

- Testes de integração de registro, login, senha fraca e JWT expirado.
- Testes de sincronização da ficha com PostgreSQL.
- Testes de isolamento entre mestres e campanhas.
- Testes de notas privadas usando persistência real.
- Testes de ordem de iniciativa e avanço de rodada.
- Testes de logout, revogação e OAuth Google em ambiente configurado.

### Pendências de produção

- Trocar rate limiting em memória por Redis ou outro armazenamento
  compartilhado em múltiplas instâncias.
- Definir política de rotação e revogação de JWT.
- Considerar cookies HTTP-only para reduzir exposição do token no frontend.
- Configurar observabilidade: métricas, tracing, alertas e logs estruturados.
- Configurar backup, restauração e migração segura do PostgreSQL.
- Adicionar CI para testes, lint, build, migrations e auditoria de dependências.
- Configurar política de retenção e remoção de dados.

## Melhorias novas recomendadas

### Prioridade alta

1. Criar ambiente PostgreSQL de teste automatizado, por Docker ou serviço
   efêmero, para desbloquear os testes de integração.
2. Introduzir transações nos fluxos de campanha, membro, personagem e
   auditoria, evitando estados parcialmente persistidos.
3. Adicionar controle de concorrência otimista com `version` ou
   `last_modified_at` para impedir sobrescrita silenciosa da ficha.
4. Implementar idempotência em sincronização, entrada por convite e envio de
   iniciativa.
5. Centralizar autorização em middleware/serviços por recurso, reduzindo regras
   duplicadas em controladores.

### Prioridade média

1. Adicionar OpenAPI/Swagger com exemplos sem credenciais.
2. Criar correlation ID por requisição para correlacionar logs sem registrar
   tokens ou senhas.
3. Adicionar testes de contrato entre `src/lib/api.js` e o backend.
4. Criar paginação cursor-based para campanhas, NPCs, auditoria e personagens.
5. Adicionar soft delete e recuperação administrativa para recursos sensíveis.
6. Usar armazenamento de objetos privado para mapas e imagens, com URLs
   temporárias assinadas.

### Prioridade futura

1. WebSocket ou Server-Sent Events para iniciativa e cenas em tempo real.
2. Cache distribuído para catálogos de NPCs e campanhas.
3. Jobs assíncronos para thumbnails, limpeza de uploads e recompensas.
4. Exportação e restauração auditável de campanhas.
5. Testes de carga e testes de segurança autorizados em ambiente isolado.

## Comandos de validação

No backend:

```bash
npm test
find src config database test -type f \( -name '*.js' -o -name '*.cjs' \) \
  -print0 | xargs -0 -n1 node --check
git diff --check
npm run db:migrate
SEED_PASSWORD='use-um-segredo-local-com-12-caracteres-ou-mais' npm run db:seed
```

`npm run db:migrate` e `npm run db:seed` exigem PostgreSQL configurado e não
foram considerados aprovados apenas com o banco indisponível.

## Conclusão

O backend está em um estágio funcional de desenvolvimento, com validação,
autorização básica, persistência versionada por baseline e hardening inicial.
Para produção, a próxima etapa mais valiosa é configurar PostgreSQL de teste e
concluir os testes de integração antes de expandir recursos ou realizar deploy.
