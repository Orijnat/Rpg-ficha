# Relatório para revisão dos agentes — Crônicas do Destino

**Data:** 22/10/2026  
**Status:** revisão técnica do estado atual e definição das próximas etapas.

## Disclaimer obrigatório sobre a mecânica do RPG

> A mecânica atual do RPG é provisória e não deve ser tratada como a versão
> definitiva das regras do sistema. O proprietário do projeto ainda irá
> descrever detalhadamente como atributos, perícias, recursos, combate,
> progressão, rolagens, classes e demais regras deverão funcionar.
>
> Até essa especificação ser fornecida e aprovada, os agentes devem preservar
> compatibilidade, evitar ampliar ou reinterpretar regras de negócio e separar
> claramente melhorias técnicas de decisões de design do RPG. Refatorações no
> motor de regras deverão aguardar a especificação oficial, salvo correções
> necessárias de segurança, integridade, tipagem ou bugs comprovados.

## Estado geral

O projeto possui um MVP funcional da área do jogador e uma base inicial da área
do mestre. Ficha, rolagem, inventário, contratos, diário, perfis,
sincronização e backup estão implementados. O build de produção passa e os
testes direcionados passam.

### Evidências atuais

- `npm run build`: aprovado.
- 18 rotas geradas no build.
- `node --test src/lib/__tests__/*.mjs`: 2 arquivos, 73 asserções aprovadas.
- `npm test`: indisponível; não existe script `test` no `package.json`.
- `npm run lint`: pendente, com 6 erros e 5 avisos.

## Entregas realizadas

### Ficha, regras provisórias e dados

- Sete atributos: FOR, DES, CON, SAB, ESP, CAR e INT.
- Modificadores de atributos e 19 perícias canônicas.
- Bônus de treinamento e bônus adicionais.
- Schema versionado da ficha, atualmente na versão 2.
- Validação básica de integridade.
- Capacidade de carga e iniciativa.
- Controle básico de HP, dano, cura, morte e condições.
- Turnos e rodadas de combate.

Arquivos relacionados:

- [`src/lib/modifiers.js`](../src/lib/modifiers.js)
- [`src/lib/defaultCharacter.js`](../src/lib/defaultCharacter.js)
- [`src/lib/__tests__/rules-and-dice.test.mjs`](../src/lib/__tests__/rules-and-dice.test.mjs)

### Rolador de dados

- Dados d4, d6, d8, d10, d12, d20 e d100.
- Fórmulas como `2d6+4`.
- Múltiplos dados.
- Vantagem e desvantagem.
- Aleatoriedade injetável para testes.
- Detecção visual de resultados críticos.
- Histórico e apresentação animada.
- Suporte a `prefers-reduced-motion`.

### Área do jogador

- Ficha principal.
- Inventário com pesquisa, filtros e capacidade.
- Banco/cofre.
- Contratos com busca e filtros.
- Montaria.
- Quarto.
- Diário e anotações independentes.
- Tags e ordenação do diário.
- Upload e galeria de imagens.
- Perfil.
- Login e registro.
- Backup e restauração em JSON.
- Sincronização local/backend e indicador de estado.

### Área do mestre

- Dashboard administrativo.
- Listagem de personagens.
- Separação inicial entre jogadores e NPCs.
- Ficha administrativa em nova rota.
- Edição de HP, atributos, perícias, inventário, capacidade e recursos
  derivados.
- Redirecionamento de mestres para `/admin`.

### Autenticação, perfis e interface

- Perfis `player` e `master`.
- Login e registro.
- Redirecionamento de usuários não autenticados.
- Filtragem básica conforme o perfil.
- Tema Dark Fantasy.
- Molduras, divisores, texturas e navegação ornamentada.
- Layout responsivo inicial.

## Pendências prioritárias

### Produto e regras

- Criar o documento oficial completo do sistema.
- Aguardar a futura especificação do proprietário antes de refatorar a mecânica.
- Definir limites, campos calculados e campos editáveis.
- Resolver regras ambíguas da planilha.
- Formalizar campanhas, membros, NPCs e visibilidade de dados.

### Frontend do jogador

- Exibir e calcular PE, BP, insanidade, CA, iniciativa e dado de vida.
- Bloquear visualmente campos exclusivos do mestre.
- Validar todos os campos numéricos.
- Completar estados de carregamento, vazio, erro e sucesso.
- Melhorar teclado, foco, labels, contraste e acessibilidade.
- Testar mobile, tablet e desktop.
- Implementar preferências e encerramento de sessões.
- Finalizar exportação/importação JSON com validação formal.

### Área do mestre

- Criar cadastro específico de NPCs.
- Adicionar busca, filtros, ordenação, avatar, tags e status.
- Permitir duplicação e variantes de NPC.
- Implementar gerenciamento de campanhas e membros.
- Implementar notas públicas e privadas.
- Implementar encontros, inimigos, condições, mapas e revelação controlada.
- Implementar sessões, cenas, objetivos e recompensas.
- Adicionar histórico e auditoria de alterações.

### Backend e autorização

- Criar schemas formais, DTOs e formato padronizado de erros.
- Separar controllers, services e validadores.
- Implementar paginação, filtros e busca.
- Criar endpoints de campanhas, membros, NPCs, encontros, sessões, mapas,
  notas privadas, auditoria e rolagens persistidas.
- Aplicar autorização por usuário, recurso, ação e campanha.
- Impedir acesso horizontal entre mestres, jogadores e campanhas.
- Nunca confiar em `role`, `userId` ou `campanhaId` enviados pelo cliente.
- Implementar refresh token, expiração, revogação e rotação.
- Adicionar rate limiting e proteção contra brute force.
- Configurar logs estruturados sem dados sensíveis.

### Banco de dados

- Criar migrations versionadas para todas as tabelas.
- Remover dependência operacional de `sequelize.sync()` em produção.
- Modelar campanhas, membros, classes, habilidades, perícias, itens, encontros,
  sessões, mapas, notas e auditoria.
- Definir foreign keys, índices, cascatas e unicidade.
- Criar migração de dados legados, seed seguro e estratégia de backup.
- Testar instalação limpa e atualização de instalações existentes.

### Google Workspace

- Configurar e testar o Google Cloud Console.
- Configurar variáveis de ambiente sem versionar credenciais.
- Listar arquivos permitidos do Drive.
- Criar seletor de pasta, planilha e documento.
- Importar e mapear a planilha técnica.
- Criar template oficial.
- Exportar e importar jogadores, NPCs e campanhas.
- Implementar sincronização bidirecional e resolução de conflitos por campo.
- Registrar origem, data, resultado, falhas e reautorização.
- Exportar diário e ficha para Google Docs.

### Uploads

- Validar MIME real, extensão, tamanho e quantidade.
- Rejeitar executáveis e conteúdo ativo.
- Armazenar fora do diretório público.
- Usar nomes internos aleatórios e metadados seguros.
- Associar arquivos a usuário, personagem e campanha.
- Autorizar leitura, alteração e exclusão.
- Limpar arquivos órfãos e definir retenção.

### Testes, segurança e operação

- Corrigir os 6 erros e 5 avisos atuais do lint.
- Adicionar script `test` ao `package.json`.
- Criar testes unitários de validadores e serviços.
- Criar testes de integração de login, personagem e sincronização.
- Testar autorização permitida, negada e acesso horizontal.
- Criar testes de campanhas, uploads, privacidade e Google.
- Criar testes de acessibilidade, E2E, mobile, desktop e carga.
- Configurar CI com lint, testes, build, migrations e auditoria.
- Restringir CORS, configurar HTTPS, headers de segurança e CSP.
- Avaliar cookies HTTP-only.
- Fazer revisão de segurança antes do deploy.
- Criar política de privacidade, runbook e procedimento de incidentes.

## Ordem sugerida para os agentes

1. Preservar as regras atuais como provisórias e não refatorar a mecânica sem a
   especificação futura do proprietário.
2. Corrigir lint e adicionar o comando oficial de testes.
3. Consolidar a especificação oficial quando ela for fornecida.
4. Implementar autorização completa e isolamento por campanha.
5. Criar migrations e estabilizar a persistência.
6. Reforçar autenticação, sessões, uploads e segurança.
7. Completar a área do mestre.
8. Criar testes de integração, autorização, acessibilidade e E2E.
9. Finalizar Google Workspace.
10. Preparar documentação, CI e operação de produção.

## Documentos de referência

- [`COISAS-A-FAZER.md`](../COISAS-A-FAZER.md)
- [`docs/MELHORIAS-FUTURAS-RPG.md`](./MELHORIAS-FUTURAS-RPG.md)
- [`docs/RPG_RULES.md`](./RPG_RULES.md)
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`docs/AGENTS_AND_WORKFLOW.md`](./AGENTS_AND_WORKFLOW.md)
