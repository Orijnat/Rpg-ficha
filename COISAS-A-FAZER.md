# Coisas a fazer — Crônicas do Destino

Este documento reúne o trabalho restante para transformar a aplicação em um
produto completo e pronto para uso. Ele descreve o estado real conhecido em
17/10/2026 e deve ser atualizado conforme cada etapa for concluída.

## Legenda

- [ ] Pendente
- [~] Em andamento ou parcialmente implementado
- [x] Concluído

## 1. Produto e regras de negócio

- [ ] Consolidar um documento oficial do sistema de RPG com:
  - [ ] atributos, modificadores e limites;
  - [ ] perícias, atributos vinculados, treinamento e bônus;
  - [ ] PV, PE, BP, insanidade, iniciativa e classe de armadura;
  - [ ] dano, cura, condições, morte e descanso;
  - [ ] vantagem, desvantagem, críticos e falhas críticas;
  - [ ] progressão de nível e experiência;
  - [ ] classes padrão, classes customizadas e habilidades;
  - [ ] inventário, munição, peso e capacidade de carga;
  - [ ] moedas, banco, contratos, montarias e diário.
- [ ] Resolver oficialmente as regras ambíguas encontradas na planilha técnica.
- [ ] Definir quais valores são calculados e quais podem ser editados.
- [ ] Definir limites mínimos e máximos para atributos, HP, recursos, moedas e
  quantidades.
- [ ] Definir o modelo de campanha, membros, jogadores, mestres, NPCs e
  personagens vinculados.
- [ ] Definir regras de visibilidade para dados públicos, privados e secretos.

## 2. Frontend do jogador

- [x] Ficha principal com atributos, HP, aparência e perícias.
- [x] Inventário, banco, contratos, montaria, quarto e diário.
- [x] Upload e galeria de imagens nas anotações.
- [x] Rolador de dados com múltiplos dados, vantagem e desvantagem.
- [x] Estados básicos de sincronização local/backend.
- [ ] Exibir PE, BP, insanidade, CA, iniciativa e dado de vida na ficha.
- [ ] Exibir e calcular corretamente a capacidade de carga.
- [ ] Bloquear visualmente campos que só o mestre pode alterar.
- [ ] Adicionar validação de formulário para todos os campos numéricos.
- [ ] Exibir estados completos de carregamento, vazio, erro e sucesso em todas
  as telas.
- [ ] Melhorar acessibilidade:
  - [ ] navegação completa por teclado;
  - [ ] foco visível;
  - [ ] labels e descrições para todos os controles;
  - [ ] contraste WCAG;
  - [ ] suporte consistente a `prefers-reduced-motion`.
- [ ] Testar todos os fluxos em viewport móvel, tablet e desktop.
- [ ] Implementar edição de perfil, preferências e encerramento de sessões.
- [ ] Implementar exportação/importação JSON com versão de schema e validação.

## 3. Área do mestre

- [x] Área visual separada da ficha do jogador.
- [x] Redirecionamento de mestres para `/admin`.
- [x] Listagem separada de jogadores e NPCs.
- [x] Ficha administrativa aberta em nova aba.
- [x] Edição de HP, atributos, perícias, inventário e capacidade.
- [x] Campos administrativos de recursos derivados da planilha.
- [ ] Criar formulário específico para cadastrar NPCs, sem tratá-los como
  jogadores.
- [ ] Criar filtro, busca e ordenação de jogadores e NPCs.
- [ ] Criar avatar, tags e status para NPCs.
- [ ] Permitir duplicar NPCs e criar variantes.
- [ ] Implementar gerenciamento de campanhas.
- [ ] Implementar convite, entrada, saída, remoção e bloqueio de membros.
- [ ] Restringir o mestre às próprias campanhas no backend.
- [ ] Implementar notas públicas e privadas com filtragem server-side.
- [ ] Implementar encontros, inimigos, condições, recursos e histórico de
  alterações.
- [ ] Implementar mapas, marcadores, áreas ocultas e revelação controlada.
- [ ] Implementar sessões com cenas, objetivos, recompensas e registro.
- [ ] Permitir atualizar a iniciativa diretamente a partir das fichas.
- [ ] Mostrar quem alterou cada dado e quando.
- [ ] Criar confirmação e auditoria para exclusão e alterações sensíveis.

## 4. Backend e API

- [x] Autenticação com usuário, senha, hash bcrypt e JWT.
- [x] Perfis de jogador e mestre.
- [x] CRUD básico de personagens.
- [x] Sincronização de fichas.
- [x] Filtro básico de dados privados.
- [x] Compatibilidade entre aliases em português e inglês.
- [ ] Criar schemas formais de validação de entrada e saída.
- [ ] Padronizar formato de erro, códigos e mensagens da API.
- [ ] Separar controllers, services, DTOs e validadores.
- [ ] Implementar paginação, filtros e busca na listagem de personagens.
- [ ] Implementar endpoints próprios para:
  - [ ] campanhas;
  - [ ] membros;
  - [ ] NPCs;
  - [ ] encontros;
  - [ ] sessões;
  - [ ] mapas;
  - [ ] notas privadas;
  - [ ] histórico de alterações;
  - [ ] rolagens persistidas.
- [ ] Aplicar autorização por sujeito, recurso, ação e campanha em todos os
  endpoints.
- [ ] Impedir acesso horizontal entre mestres e campanhas.
- [ ] Não confiar em `role`, `userId` ou `campanhaId` enviados pelo cliente.
- [ ] Implementar refresh token, expiração, revogação e rotação de sessão.
- [ ] Adicionar rate limiting, proteção contra brute force e bloqueio gradual.
- [ ] Configurar logs estruturados sem senhas, tokens ou dados sensíveis.
- [ ] Definir limites de payload, paginação e tempo de requisição.
- [ ] Corrigir os pontos restantes que dependem de `localStorage` para dados
  sensíveis.

## 5. Banco de dados

- [x] Schema principal de usuários e personagens.
- [x] Modelos Sequelize básicos.
- [x] Constraints iniciais de vida e integridade.
- [ ] Criar migrations versionadas para todas as tabelas.
- [ ] Remover dependência operacional de `sequelize.sync()` em produção.
- [ ] Modelar tabelas relacionais para:
  - [ ] campanhas;
  - [ ] membros;
  - [ ] classes;
  - [ ] habilidades;
  - [ ] perícias;
  - [ ] itens;
  - [ ] encontros;
  - [ ] sessões;
  - [ ] mapas;
  - [ ] notas;
  - [ ] auditoria;
  - [ ] integrações externas.
- [ ] Definir foreign keys, índices, cascatas e unicidade.
- [ ] Criar estratégia de migração dos dados legados.
- [ ] Criar seed seguro para desenvolvimento sem credenciais reais.
- [ ] Criar backup, restauração e retenção.
- [ ] Testar instalação do banco do zero e atualização de uma instalação
  existente.

## 6. Google Drive, Sheets e Docs

- [~] OAuth do mestre implementado.
- [~] Tokens OAuth criptografados com AES-256-GCM.
- [~] Status e desconexão da conta Google.
- [ ] Configurar e testar Google Cloud Console.
- [ ] Cadastrar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_REDIRECT_URI` e `GOOGLE_TOKEN_ENCRYPTION_KEY`.
- [ ] Listar arquivos permitidos do Drive.
- [ ] Criar seletor de pasta, planilha e documento.
- [ ] Importar a planilha técnica enviada.
- [ ] Mapear células, abas e fórmulas para o modelo da aplicação.
- [ ] Criar um template oficial de planilha.
- [ ] Exportar jogador, NPC e campanha para Google Sheets.
- [ ] Importar alterações de Sheets para a aplicação.
- [ ] Implementar sincronização bidirecional real.
- [ ] Aplicar “última alteração vence” por campo, não apenas por documento.
- [ ] Registrar data, origem e resultado de cada sincronização.
- [ ] Mostrar conflitos, falhas e reautorização para o mestre.
- [ ] Exportar diário e anotações para Google Docs.
- [ ] Criar cópia visual da ficha no Google Docs.
- [ ] Tratar revogação, expiração e renovação de token.
- [ ] Testar permissões mínimas e remoção da conexão.

## 7. Uploads e arquivos

- [ ] Validar MIME real, extensão, tamanho e quantidade.
- [ ] Rejeitar arquivos executáveis e conteúdo ativo.
- [ ] Armazenar arquivos fora do diretório público.
- [ ] Usar nomes internos aleatórios e metadados seguros.
- [ ] Associar cada arquivo a campanha, personagem e proprietário.
- [ ] Aplicar autorização em leitura, alteração e exclusão.
- [ ] Criar limpeza de arquivos órfãos.
- [ ] Definir armazenamento de produção, CDN e política de retenção.

## 8. Motor de regras e dados

- [x] Modificadores dos sete atributos.
- [x] Perícias canônicas.
- [x] Fórmulas básicas de dados.
- [x] Vantagem e desvantagem.
- [x] Aleatoriedade injetável para testes.
- [ ] Extrair recursos da planilha para funções puras.
- [ ] Implementar cálculo de PV, PE, BP, insanidade, CA e iniciativa.
- [ ] Implementar classes e habilidades customizadas.
- [ ] Implementar dano, cura, condições e descanso.
- [ ] Implementar munição e consumo de recursos.
- [ ] Definir comportamento para dados inválidos e arredondamentos.
- [ ] Persistir histórico de rolagens por sessão quando autorizado.
- [ ] Criar testes determinísticos para cada regra.

## 9. Testes e qualidade

- [x] Testes direcionados de regras e dados.
- [x] Build de produção do frontend.
- [x] Validação sintática de controllers principais.
- [ ] Testes unitários de validadores e serviços backend.
- [ ] Testes de integração login → personagem → sincronização.
- [ ] Testes de autorização permitida e negada.
- [ ] Testes contra acesso horizontal indevido.
- [ ] Testes de campanhas e membros.
- [ ] Testes de importação/exportação Google.
- [ ] Testes de upload e privacidade.
- [ ] Testes de acessibilidade.
- [ ] Testes E2E em navegador.
- [ ] Testes mobile e desktop.
- [ ] Testes de carga e limites de payload.
- [ ] Pipeline CI com lint, testes, build, migrations e auditoria.
- [ ] Resolver avisos e erros restantes do lint.

## 10. Segurança e produção

- [ ] Nunca versionar `.env`, tokens, senhas ou chaves.
- [ ] Trocar credenciais de desenvolvimento que tenham sido expostas.
- [ ] Usar HTTPS em frontend, backend e callback OAuth.
- [ ] Configurar CORS por lista de origens confiáveis.
- [ ] Configurar headers de segurança e CSP.
- [ ] Usar cookies HTTP-only quando a arquitetura estiver pronta.
- [ ] Rotacionar JWT secret e chaves OAuth conforme política.
- [ ] Fazer revisão de segurança antes do deploy.
- [ ] Criar política de privacidade e tratamento de dados.
- [ ] Definir procedimento de incidente e revogação de acesso.
- [ ] Monitorar erros sem coletar conteúdo privado das fichas.

## 11. Documentação e operação

- [x] Documentação inicial de melhorias e arquitetura.
- [ ] Documentar instalação do frontend e backend.
- [ ] Documentar variáveis de ambiente sem valores reais.
- [ ] Documentar criação do banco e migrations.
- [ ] Documentar fluxo de mestre, jogador e NPC.
- [ ] Documentar integração Google passo a passo.
- [ ] Documentar importação da planilha técnica.
- [ ] Documentar backup e restauração.
- [ ] Documentar troubleshooting.
- [ ] Criar changelog e versionamento.
- [ ] Criar runbook de produção.

## 12. Critérios para considerar a aplicação completa

A aplicação só deve ser considerada pronta quando:

- [ ] jogador e mestre possuem fluxos separados e completos;
- [ ] autorização é aplicada no backend em todas as rotas;
- [ ] campanhas isolam corretamente seus membros e dados;
- [ ] ficha, NPC, inventário, perícias e recursos persistem sem perda;
- [ ] regras da planilha estão documentadas e cobertas por testes;
- [ ] Google Drive, Sheets e Docs importam/exportam de forma verificável;
- [ ] uploads são privados, validados e removíveis;
- [ ] migrations permitem instalar e atualizar o banco com segurança;
- [ ] build, lint, testes, revisão de segurança e E2E passam;
- [ ] backups e restauração foram testados;
- [ ] não existem segredos no repositório;
- [ ] existe monitoramento e documentação operacional.

## Comandos de validação atuais

Frontend:

```bash
cd Rpg-ficha
npm run build
git diff --check
```

Backend:

```bash
cd Rpg-backend
node --check src/server.js
npm audit
```

> Este checklist é deliberadamente mais amplo que uma lista de tarefas
> imediatas. Cada item deve ser implementado, testado e marcado somente quando
> houver evidência verificável.
