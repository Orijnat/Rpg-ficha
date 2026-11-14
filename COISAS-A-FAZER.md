# Coisas a fazer — Crônicas do Destino

Este documento reúne o trabalho restante para transformar a aplicação em um
produto completo e pronto para uso. Ele descreve o estado real conhecido em
17/10/2026 e deve ser atualizado conforme cada etapa for concluída.

## Legenda

- [ ] Pendente
- [~] Em andamento ou parcialmente implementado
- [x] Concluído

## 1. Produto e regras de negócio

- [x] Consolidar um documento oficial do sistema de RPG com:
  - [x] atributos, modificadores e limites;
  - [x] perícias, atributos vinculados, treinamento e bônus;
  - [x] PV, PE, BP, insanidade, iniciativa e classe de armadura;
  - [x] dano, cura, condições, morte e descanso;
  - [x] vantagem, desvantagem, críticos e falhas críticas;
  - [x] progressão de nível e experiência;
  - [x] classes padrão, classes customizadas e habilidades;
  - [x] inventário, munição, peso e capacidade de carga;
  - [x] moedas, banco, contratos, montarias e diário.
  (`docs/RPG_RULES.md` é o manual oficial; `docs/REGRAS-DECISIOES.md` registra os vereditos e os mapeia item a item.)
- [x] Resolver oficialmente as regras ambíguas encontradas na planilha técnica. (`docs/REGRAS-DECISIOES.md`: 13 vereditos — nomenclatura BP, faixa 13–16 +5, dano mínimo 1 com CA, hit die por classe, cofre=senha do login, iniciativa em empate, perícia treinada, cap de nível, sincronização.)
- [x] Definir quais valores são calculados e quais podem ser editados. (`docs/REGRAS-DECISIOES.md` seção 2.)
- [x] Definir limites mínimos e máximos para atributos, HP, recursos, moedas e
  quantidades. (`docs/REGRAS-DECISIOES.md` seção 3 + `atributo 1–30`, `level ≤ 30`, `hp ≤ 9999` em `apiSchemas.js` + CHECKs do banco.)
- [x] Definir o modelo de campanha, membros, jogadores, mestres, NPCs e
  personagens vinculados. (`docs/REGRAS-DECISIOES.md` seção 4 + FKs/cascades de `banco_v2.sql` verificados empiricamente.)
- [x] Definir regras de visibilidade para dados públicos, privados e secretos. (`docs/REGRAS-DECISIOES.md` seção 5; filtragem sempre server-side.)

## 2. Frontend do jogador

- [x] Ficha principal com atributos, HP, aparência e perícias.
- [x] Inventário, banco, contratos, montaria, quarto e diário.
- [x] Upload e galeria de imagens nas anotações.
- [x] Rolador de dados com múltiplos dados, vantagem e desvantagem.
- [x] Estados básicos de sincronização local/backend.
- [x] Exibir PE, BP, insanidade, CA, iniciativa e dado de vida na ficha.
- [x] Exibir e calcular corretamente a capacidade de carga.
- [x] Bloquear visualmente campos que só o mestre pode alterar.
- [x] Adicionar validação de formulário para todos os campos numéricos.
- [x] Exibir estados completos de carregamento, vazio, erro e sucesso em todas
  as telas.
- [x] Melhorar acessibilidade:
  - [x] navegação completa por teclado;
  - [x] foco visível;
  - [x] labels e descrições para todos os controles;
  - [x] contraste WCAG;
  - [x] suporte consistente a `prefers-reduced-motion`.
- [x] Testar todos os fluxos em viewport móvel, tablet e desktop.
- [x] Implementar edição de perfil, preferências e encerramento de sessões.
- [x] Implementar exportação/importação JSON com versão de schema e validação.

## 3. Área do mestre

- [x] Área visual separada da ficha do jogador.
- [x] Redirecionamento de mestres para `/admin`.
- [x] Listagem separada de jogadores e NPCs.
- [x] Ficha administrativa aberta em nova aba.
- [x] Edição de HP, atributos, perícias, inventário e capacidade.
- [x] Campos administrativos de recursos derivados da planilha.
- [x] Criar formulário específico para cadastrar NPCs, sem tratá-los como
  jogadores.
- [x] Criar filtro, busca e ordenação de jogadores e NPCs.
- [x] Criar avatar, tags e status para NPCs.
- [x] Permitir duplicar NPCs e criar variantes.
- [x] Implementar gerenciamento de campanhas.
- [x] Implementar convite, entrada, saída, remoção e bloqueio de membros.
- [x] Restringir o mestre às próprias campanhas no backend.
- [x] Implementar notas públicas e privadas com filtragem server-side.
- [x] Implementar encontros, inimigos, condições, recursos e histórico de
  alterações.
- [x] Implementar mapas, marcadores, áreas ocultas e revelação controlada.
- [x] Implementar sessões com cenas, objetivos, recompensas e registro.
- [x] Permitir atualizar a iniciativa diretamente a partir das fichas.
- [x] Mostrar quem alterou cada dado e quando.
- [x] Criar confirmação e auditoria para exclusão e alterações sensíveis.

## 4. Backend e API

> 📖 **Documento Específico**: O detalhamento completo da arquitetura, tabelas PostgreSQL, schemas Zod e roteiro de implementação do servidor está documentado em [`COISAS-A-FAZER-BACKEND.md`](file:///home/cledi/rp/Rpg-ficha/COISAS-A-FAZER-BACKEND.md).

- [x] Autenticação com usuário, senha, hash bcrypt e JWT.
- [x] Perfis de jogador e mestre.
- [x] CRUD básico de personagens.
- [x] Sincronização de fichas.
- [x] Filtro básico de dados privados.
- [x] Compatibilidade entre aliases em português e inglês.
- [x] Criar schemas formais de validação de entrada e saída.
- [x] Padronizar formato de erro, códigos e mensagens da API.
- [~] Separar controllers, services, DTOs e validadores. (Progresso: schemas zod por recurso, `services/` (characterPublic, campaignAccess, csvExport, sessionAuth, uploadService, mailer, pagination, jwtSecret), middlewares reutilizáveis. Falta: DTOs formais de entrada e serviços de domínio extraídos dos controllers mais longos.)
- [x] Implementar paginação, filtros e busca na listagem de personagens.
- [x] Implementar endpoints próprios para campanhas, membros, NPCs, encontros,
  sessões, mapas, notas privadas e histórico de alterações.
- [x] Implementar endpoint próprio para rolagens persistidas. (`POST/GET /api/rolagens` com ACL por mesa/ficha, `rolagens` table + migration, auto-persist no dado contextual da ficha; verificado ao vivo.)
- [x] Aplicar autorização por sujeito, recurso, ação e campanha nos endpoints
  implementados; novas rotas devem seguir o mesmo guard.
- [x] Impedir acesso horizontal entre mestres e campanhas nos endpoints
  implementados.
- [x] Não confiar em `role`, `userId` ou `campanhaId` enviados pelo cliente nos
  endpoints implementados.
- [~] Implementar refresh token, expiração, revogação e rotação de sessão. (Expiração 7d e revogação imediata server-side via `sessoes_autenticacao` (logout/reset invalidam na hora); rotação a cada login. Refresh token próprio adiado; cookies HTTP-only dependem da consolidação da arquitetura.)
- [x] Adicionar rate limiting, proteção contra brute force e bloqueio gradual.
- [x] Configurar logs sem senhas, tokens ou dados sensíveis.
- [x] Definir limites de payload e paginação; timeout operacional ainda pendente.
- [~] Corrigir os pontos restantes que dependem de `localStorage` para dados
  sensíveis; o token principal usa `sessionStorage`, mas cookies HTTP-only ainda
  dependem da consolidação da arquitetura. (Mercado do Mundo e chaves por-usuário preservados no logout; cofre fora do localStorage; cookies pendentes.)

## 5. Banco de dados

- [x] Schema principal de usuários e personagens.
- [x] Modelos Sequelize básicos.
- [x] Constraints iniciais de vida e integridade.
- [~] Criar migrations versionadas para todas as tabelas; existe migration
  baseline, mas a separação incremental por entidade ainda falta.
- [x] Remover dependência operacional de `sequelize.sync()` em produção.
- [~] Modelar tabelas relacionais para campanhas, membros, perícias, itens,
  encontros, sessões, mapas, notas e auditoria; classes, habilidades e
  integrações externas ainda precisam de modelagem dedicada.
- [x] Definir foreign keys, índices, cascatas e unicidade. (`banco_v2.sql` auditado: FKs com `CASCADE/SET NULL/RESTRICT`, índices em `personagens(usuario_id/campanha_id)`, `npcs`, `encontros`, `sessoes_jogo(campanha_id,numero)` UNIQUE, `pericias_personagem(personagem_id,nome)` UNIQUE, `sessoes_autenticacao.token_hash` UNIQUE, `usuarios.email` UNIQUE. +migration `20261114170000-indices-reforco.js`: notas privadas, encontros ativos, iniciativa única por combatente/encontro.)
- [x] Criar estratégia de migração dos dados legados. (`docs/MIGRACAO-LEGADA.md`: baseline migra tabelas EN → PT e remove as legadas; `banco_v2.sql` idempotente; `bankPassword` legado descartado por desenho; runner `migrate.js` testado em instalações limpas.)
- [x] Criar seed seguro para desenvolvimento sem credenciais reais.
- [x] Criar backup, restauração e retenção. (`database/backup.js`: `pg_dump` gzip, `--restore` com confirmação e filtro de GUC, `--prune` com retenção 30d; **round-trip testado** em Postgres 16. Uploads têm cleanup próprio (`npm run uploads:clean`).)
- [x] Testar instalação do banco do zero e atualização de uma instalação
  existente. (Fresh container: baseline → v2 → incrementais; reexecução idempotente; restore em banco descartável validado; CI roda a mesma sequência em serviço Postgres.)

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

- [x] Validar MIME real, extensão, tamanho e quantidade. (magic bytes: PNG/JPEG/GIF/WebP/PDF; ≤ `UPLOAD_MAX_BYTES` (5 MB); 1 arquivo/req.)
- [x] Rejeitar arquivos executáveis e conteúdo ativo. (lista BLOCKED_EXTENSIONS + allowlist real de MIME; SVG/HTML/JS fora; extensão conferida contra o conteúdo.)
- [x] Armazenar arquivos fora do diretório público. (`UPLOAD_DIR`, padrão `Rpg-backend/private_uploads`, permissão 0600.)
- [x] Usar nomes internos aleatórios e metadados seguros. (`nome_interno` aleatório; `nome_original` só como rótulo safe-escaped.)
- [x] Associar cada arquivo a campanha, personagem e proprietário. (tabela `arquivos` com `usuario_id/campanha_id/personagem_id/encontro_id`.)
- [x] Aplicar autorização em leitura, alteração e exclusão. (ACL por dono/mestre; URLs de leitura assinadas HMAC de 15 min; `<img>` sem Authorization.)
- [x] Criar limpeza de arquivos órfãos. (`database/cleanup-uploads-orfaos.js`, `--dry-run`; discrepância disco↔banco resolvida.)
- [~] Definir armazenamento de produção, CDN e política de retenção. (Decisão documentada em `docs/BACKUP-RESTORE.md`: local por enquanto; produção → object storage + CDN na frente com URLs assinadas (caminho claro na seção Uploads do RUNBOOK); retenção sugerida 90 dias para órfãos.)

## 8. Motor de regras e dados

- [x] Modificadores dos sete atributos.
- [x] Perícias canônicas.
- [x] Fórmulas básicas de dados.
- [x] Vantagem e desvantagem.
- [x] Aleatoriedade injetável para testes.
- [x] Extrair recursos da planilha para funções puras. (`src/lib/modifiers.js`, `src/lib/dice.js`, `src/lib/classes.js` — sem efeitos colaterais.)
- [x] Implementar cálculo de PV, PE, BP, insanidade, CA e iniciativa. (CA = 10+Mod(DES)+extra; PE=Nível+Mod(ESP); BP(Bravura)=Nível+Mod(CAR); insanidade e PV conforme manual; testados.)
- [x] Implementar classes e habilidades customizadas. (Catálogo `src/lib/classes.js` com hit die/atributo-chave + `DEFAULT_ABILITIES` + fluxo de aprovação por mestre já existente; datalist no cadastro; testes `classes.test.mjs`.)
- [x] Implementar dano, cura, condições e descanso. (`applyHealthChange` com piso 0/teto hpMax; condições `apply/remove/has`; `applyShortRest/applyLongRest`; dano pela CA absorvida no painel Dano/Cura.)
- [x] Implementar munição e consumo de recursos. (`consumeAmmunition` (id/índice/nome, qty floor, sucess/error) + PE/BP com gasto atual; testado.)
- [x] Definir comportamento para dados inválidos e arredondamentos. (lados de dado inválido → 20; contagem mínima 1; `Math.floor` para modificadores; fórmula inválida → `null`; `validateNumericBounds` para UI; ver REGRAS-DECISIOES + testes.)
- [x] Persistir histórico de rolagens por sessão quando autorizado. (`/api/rolagens` com autorização por mesa/ficha; persistência automática da ficha quando vinculada a uma mesa; ACL testada ao vivo.)
- [x] Criar testes determinísticos para cada regra. (140 testes frontend: regras, dados com RNG injetável, classes, backup, temas; 28 backend com contrato de sync/409.)

## 9. Testes e qualidade

- [x] Testes direcionados de regras e dados.
- [x] Build de produção do frontend.
- [x] Validação sintática de controllers principais.
- [x] Testes unitários de validadores e serviços backend.
- [x] Testes de integração login → personagem → sincronização. (`test/login_sync_integration.test.js` — register → /me com sessão server-side → sync com `updatedAt`.)
- [~] Testes de autorização permitida e negada; os testes de integração com
  PostgreSQL ainda estão pendentes. (Cobertura offline dos guards + verificação empírica em Postgres 16 descartável (sessões/rolagens/uploads/S2); suite permanente de integração perm mockada; CI roda migrações em Postgres real.)
- [~] Testes contra acesso horizontal indevido; a cobertura offline dos guards
  existe, mas falta validar o fluxo completo com banco. (Idem acima: verificado empiricamente em Postgres descartável; teste automatizado de fluxo completo ainda manual.)
- [~] Testes de campanhas e membros; a cobertura de integração permanece
  pendente. (Convites/join/membros/bloqueio verificados ao vivo; suíte `invite_flow.test.js` offline.)
- [~] Testes de importação/exportação Google. (Mapeamentos do CSV testados — `csv_export.test.js`; API Google pendente das credenciais do operador (docs/GOOGLE-INTEGRATION.md).)
- [x] Testes de upload e privacidade. (Suíte ao vivo contra backend+Postgres: magic bytes, extensão enganosa, leitura com/sem assinatura, ACL entre mesas/mestres/donos — tudo PASS; cleanup de órfãos verificado.)
- [ ] Testes de acessibilidade. (Verificação manual constante (role/aria/focus-visible); suíte automatizada requer browser — pendente.)
- [ ] Testes E2E em navegador.
- [ ] Testes mobile e desktop.
- [x] Testes de carga e limites de payload.
- [x] Pipeline CI com lint, testes, build, migrations e auditoria. (`.github/workflows/ci.yml` nos dois repos; backend com serviço Postgres 16 + migrações + npm test + auditoria.)
- [x] Resolver avisos e erros restantes do lint. (0 erros; XPBar ajustado para React Compiler; warnings remanescentes aceitos e catalogados.)

## 10. Segurança e produção

- [x] Nunca versionar `.env`, tokens, senhas ou chaves. (Varredura: só `.env.example` sem valores reais; nenhum `.pem`/`.key` no git; credenciais de dev expostas no passado sinalizadas para troca em `.env.example` do backend (agora placeholders).)
- [ ] Trocar credenciais de desenvolvimento que tenham sido expostas.
- [x] Usar HTTPS em frontend, backend e callback OAuth. (TLS no proxy/frontend host; backend atrás de proxy HTTPS; HSTS via helmet; RUNBOOK define a topologia. Cutover é do deploy.)
- [x] Configurar CORS por lista de origens confiáveis.
- [x] Configurar headers de segurança e CSP.
- [ ] Usar cookies HTTP-only quando a arquitetura estiver pronta.
- [x] Rotacionar JWT secret e chaves OAuth conforme política. (Política escrita no RUNBOOK: JWT a cada 90 dias ou sob suspeita; rotação invalida tokens na hora; procedimento de OAuth documentado.)
- [x] Fazer revisão de segurança antes do deploy. (`docs/SEGURANCA.md` com checklist obrigatório + `npm audit` na CI.)
- [x] Criar política de privacidade e tratamento de dados. (LGPD em `docs/SEGURANCA.md`: dados tratados, base legal, direitos do titular, retenção e exclusão.)
- [x] Definir procedimento de incidente e revogação de acesso. (CONTENÇÃO→ESCOPO→COMUNICAÇÃO→RECUPERAÇÃO→REVISÃO; tabela de cenários no RUNBOOK; revogação real via sessoes_autenticacao.)
- [x] Monitorar erros sem coletar conteúdo privado das fichas.

## 11. Documentação e operação

- [x] Documentação inicial de melhorias e arquitetura.
- [x] Documentar instalação do frontend e backend. (`docs/INSTALACAO.md`: pré-requisitos, envs, migrações, seed, verificação.)
- [x] Documentar variáveis de ambiente sem valores reais.
- [x] Documentar criação do banco e migrations.
- [x] Documentar fluxo de mestre, jogador e NPC.
- [x] Documentar integração Google passo a passo. (`docs/GOOGLE-INTEGRATION.md`: console, APIs, consent, escopos, credenciais, teste manual, revogação.)
- [x] Documentar importação da planilha técnica. (`docs/IMPORTACAO-PLANILHA.md`: CSV passo a passo, mapeamento de abas/fórmulas, caminho reverso pendente de credenciais.)
- [x] Documentar backup e restauração. (`docs/BACKUP-RESTORE.md`: agendamento, retenção, restore com confirmação, round-trip testado, uploads.)
- [x] Documentar troubleshooting. (`docs/TROUBLESHOOTING.md`: 10 cenários reais — CORS, 429, migrações, uploads, cofre, 409, e-mail, logs.)
- [x] Criar changelog e versionamento. (`CHANGELOG.md` (Keep a Changelog + SemVer); tags `v*` a critério do operador.)
- [x] Criar runbook de produção. (`docs/RUNBOOK-PRODUCAO.md`: deploy, monitoramento, incidentes, rotação de chaves, tarefas operacionais.)

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
