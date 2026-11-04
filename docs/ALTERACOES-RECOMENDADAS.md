# Alterações recomendadas

Este documento consolida as melhorias identificadas após a integração do
frontend com o backend Express e o hardening inicial de autenticação.

## Estado atual já implementado

- Autorização server-side inicial para personagens, campanhas e NPCs.
- Isolamento do cache local por usuário e personagem.
- `JWT_SECRET` obrigatório no frontend mock e no backend.
- Hash seguro nas fixtures locais e hash bcrypt para a senha do cofre no backend.
- Rate limiting básico em memória para login e cadastro local.
- Cadastro público restrito ao perfil de jogador.
- Login e cadastro com Google por OAuth/OpenID.
- Shell global separado em `src/layouts/AppShell.jsx`.
- Build, lint, testes unitários e verificação de whitespace executados com sucesso.

## Prioridade crítica

### 1. Migrar o token para cookie HTTP-only

O token atualmente é armazenado em `localStorage` por
`src/lib/api.js`. A implementação de produção deve:

- emitir o token em cookie `HttpOnly`;
- usar `Secure` em produção;
- definir `SameSite=Lax` ou `Strict`;
- configurar expiração curta;
- implementar revogação ou rotação de sessão;
- proteger requisições mutáveis contra CSRF.

O frontend não deve precisar ler o JWT diretamente para determinar a sessão.
Uma rota autenticada como `/auth/me` deve ser a fonte de validação da sessão.

### 2. Criar migrations versionadas

O backend ainda depende de sincronização automática do Sequelize em parte do
fluxo de inicialização. Devem ser criadas migrations para:

- usuários e vínculo Google;
- personagens;
- campanhas e membros;
- NPCs;
- sessões e encontros;
- notas e auditoria;
- uploads e metadados de arquivos.

Depois da migração, `sequelize.sync({ alter: true })` não deve ser usado em
produção.

### 3. Validar payloads no backend

Adicionar schemas formais, preferencialmente com Zod ou biblioteca equivalente,
para:

- login e cadastro;
- perfil e troca de papel;
- personagens;
- campanhas e convites;
- NPCs, encontros e sessões;
- notas;
- uploads.

Os schemas devem rejeitar campos desconhecidos quando apropriado, limitar
tamanhos e validar IDs, enums, números inteiros e valores máximos.

### 4. Consolidar a origem da API

O cliente HTTP principal usa `NEXT_PUBLIC_API_URL`, mas ainda existem Route
Handlers locais com stores em memória. Eles devem ser:

1. removidos quando o backend Express for obrigatório; ou
2. explicitamente marcados como mocks de desenvolvimento, sem serem tratados
   como persistência real.

Não deve haver comportamento diferente de autorização entre mock e produção.

## Prioridade alta

### 5. Expandir autorização por recurso

Aplicar autorização no backend para cada campanha e recurso:

- jogador só acessa personagens próprios e campanhas associadas;
- mestre só gerencia campanhas próprias;
- notas privadas só são retornadas a usuários autorizados;
- mapas, encontros e sessões respeitam a campanha;
- auditoria não pode ser alterada pelo cliente;
- uploads verificam proprietário, personagem e campanha em cada operação.

Nunca confiar em `role`, `userId` ou `campanhaId` enviados pelo navegador.

### 6. Adicionar estado de sincronização

O contexto da ficha deve expor estado explícito para:

- salvo;
- salvando;
- offline;
- erro;
- sincronização pendente;
- conflito de atualização.

Alterações locais devem ser reconciliadas com o backend sem sobrescrever dados
mais recentes silenciosamente.

### 7. Implementar auditoria persistente

Registrar no banco:

- usuário responsável;
- campanha e recurso afetados;
- ação executada;
- data e hora;
- identificador do recurso;
- valores anteriores e novos quando necessário;
- resultado da operação.

Segredos, senhas, tokens e conteúdo privado não devem ser gravados nos logs.

### 8. Proteger uploads

Para avatares, mapas e imagens:

- validar MIME real e extensão;
- limitar tamanho e quantidade;
- rejeitar executáveis e conteúdo ativo;
- gerar nome interno aleatório;
- armazenar fora do diretório público;
- verificar autorização de leitura, alteração e exclusão;
- limpar arquivos órfãos;
- definir retenção.

## Prioridade média

### 9. Criar testes de integração

Cobrir, no mínimo:

- login e cadastro;
- login Google;
- expiração e encerramento de sessão;
- criação e atualização de personagem;
- sincronização com PostgreSQL;
- isolamento entre usuários;
- isolamento entre campanhas;
- permissões de mestre, jogador, membro e não membro;
- notas privadas e auditoria.

### 10. Criar testes E2E e de acessibilidade

Executar em viewport mobile e desktop:

- fluxo de login;
- seleção de personagem;
- edição da ficha;
- inventário;
- contratos;
- rolagem de dados;
- formulários administrativos;
- modais de confirmação.

Também verificar navegação por teclado, foco visível, labels, contraste,
leitores de tela e `prefers-reduced-motion`.

### 11. Configurar CI

O pipeline deve executar:

```bash
npm ci
npm run lint
node --test src/lib/__tests__/*.test.mjs
npm run build
git diff --check
```

O backend deve possuir comandos equivalentes para lint, testes, migrations e
verificação de dependências.

### 12. Melhorar a área do mestre

Evoluções recomendadas:

- gerenciamento de membros e convites;
- sessões e cenas;
- encontros e iniciativa;
- condições, efeitos e recursos;
- mapas com marcadores e névoa de guerra;
- notas públicas e privadas;
- histórico de alterações;
- preparação de objetivos, inimigos e recompensas.

## Ordem de execução recomendada

1. Cookies HTTP-only, expiração e revogação de sessão.
2. Migrations e alinhamento entre banco, modelos e DTOs.
3. Schemas de validação e formato único de erros.
4. Testes de integração de autenticação e autorização.
5. Decisão final sobre remoção dos mocks locais.
6. Indicadores de sincronização e resolução de conflitos.
7. Auditoria persistente e uploads seguros.
8. Testes E2E, acessibilidade e CI.
9. Recursos avançados da área do mestre.

## Pendências conhecidas

- OAuth Google ainda requer teste com credenciais reais configuradas no Google
  Cloud Console.
- A integração real com PostgreSQL ainda precisa de smoke tests em ambiente
  configurado.
- O backend separado ainda precisa de migrations versionadas.
- O rate limiting local em memória não substitui um limitador distribuído em
  produção.
- O lint passa sem erros, mas mantém avisos preexistentes.
