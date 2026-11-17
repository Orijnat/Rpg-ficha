# Itens a fazer

## Bugs
- [x] Status não estão sendo salvos
- [x] Verificar a criação de mais de uma ficha por conta
- [x] Zerar os dados por usuário: hoje há vazamento (Mestre 1 vê dados do Mestre 2; inventário de um jogador aparece para outro)

## Conta e segurança
- [x] Arrumar o banco: a senha da ficha é a do login do dono (bcrypt, comparada no servidor) ou uma senha personalizada por ficha (hash em `dadosExtras.bankPasswordHash`, definida via `PUT /characters/:id/bank/password`); nunca armazenada em texto puro nem retornada pela API — verificado ao vivo (2026-11-14)
- [x] ~~Adicionar verificação por e-mail~~ — **implementado em 2026-11-14/17 e REMOVIDO em 2026-11-17** a pedido do usuário (código de 6 dígitos + link; HMAC; lockout de 5 tentativas). Colunas `email_verified`/`verification_*`/`reset_token_*` dropadas no Supabase via migration `20261117030000-remove-email-mail.js`; rotas `verify-email(-code)/resend-verification/forgot-password/reset-password` removidas; registro voltou a logar direto; páginas `/verificar-email`, `/esqueci-senha`, `/redefinir-senha` removidas; skill `email-api` deletada; `nodemailer` desinstalado; provedor de e-mail (Resend/SMTP) não é mais necessário
- [x] ~~Permitir pedir alteração de senha da conta via e-mail~~ — idem acima: **REMOVIDO em 2026-11-17** (`/esqueci-senha`, `/redefinir-senha`, `forgot-password`, `reset-password`). `password_changed_at` e a revogação de sessões no reset foram removidos junto; quem esquece a senha hoje precisa de um administrador

## Painel do Mestre
- [x] Mestre poder subir o nível de cada ficha individualmente, ou de todas as fichas da campanha (admin/personagens: ação única e em lote com confirmação)
- [x] Atribuir novamente o painel Perfil ao Mestre (navbar do mestre inclui Perfil; `/perfil` tem visão de mestre com acesso à Sala do Mestre)
- [x] Permitir compartilhar fichas de NPCs e heróis feitos pelo Mestre com os jogadores (`sharedWithPlayers`: toggle em NPC e herói; Mesa do mundo mostra heróis compartilhados somente leitura e NPCs compartilhados)
- [x] Iniciativa rolada pelo jogador ser enviada ao painel do Mestre, mostrando a ordem de combate da mesa (botão na ficha → backend espelha em `dadosMestre.iniciativa`; Sala de Guerra mescla a lista a cada 20s/foco preservando HP/condições locais)

## Ficha e regras
- [x] Bônus de proficiência (BP) por nível, somado às perícias (BP + bônus do atributo da perícia) — `calculateProficiencyBonusByLevel`: 1-4 +2, 5-8 +3, 9-12 +4, 13-16 +5, 17-20 +6; perícias treinadas somam BP ao modificador do atributo
- [x] Jogador poder adicionar a CA, e ela reduzir o dano automaticamente (CA editável em RecursosCombate; painel Dano/Cura absorve pelo CA por padrão)
- [x] Ao rolar o dado de vida, somar o resultado ao HP máximo automaticamente, após confirmação (modal de confirmação no botão de Dado de Vida; soma a `hpMax` e `hp`)
- [x] Jogador poder editar o PE máximo
- [x] Montarias: poder criar, com lista de montarias por jogador/ficha (página Montaria: adicionar/editar/dano/cura/morar/reviver/despedir; lista em `dadosExtras.mounts` por ficha)

## Interface
- [x] Mover a aba de gestão de vitalidade para a navbar, em um botão próximo à vida (Cabeçalho: barra de vida + botão Dano/Cura abrem a Gestão de Vitalidade)
- [x] Ajustar as cores dos temas (tema claro Pergaminho/Luz/Névoa com acentos escurecidos p/ WCAG AA/AAA; bloco `[data-theme="mist"]` adicionado ao globals.css (estava ausente); THEMES alinhado ao CSS; themes.test atualizado)

## Auditoria do sistema (2026-11-14) — detalhes em `docs/AUDITORIA-SISTEMA-2026-11-14.md`

### Crítico (S1)
- [x] [F-01/A-02] Senha do cofre vazando em todos os payloads de personagem (`dadosExtras.bankPassword` em `/auth/me`, `/characters`, sync) — sanitizado em `publicCharacter` (remove `bankPassword`/`bankPasswordHash` de `dadosExtras` e converte `user` para subset seguro); nunca selecionar `password` em includes; criado endpoint `PUT /characters/:id/bank/password` com bcrypt (senha personalizada por ficha) — verificado empiricamente em Postgres descartável (nenhum payload contém a senha/hash; 2026-11-14)
- [x] [F-01] Senha do cofre nunca persiste + fallback `"133313"` e cofre abrindo com senha vazia offline — removidos: cofre abre com senha personalizada da ficha (hash bcrypt em `dadosExtras.bankPasswordHash`) ou com a senha do login do DONO; `tryUnlock` exige validação no servidor; `"133313"` removido do `defaultData`; verificado empiricamente (senha vazia/errada rejeitadas; 2026-11-14)
- [x] [A-01] "Restaurar dados padrão" (`resetCharacter`) sobrescreve a ficha remota com dados em branco — `skipSyncRef` bloqueia todo sync nesse fluxo; `targetId` não cai mais no fallback do personagem ativo; confirmação tipada ("RESTAURAR") no `ConfirmDialog`; `reloadFromCloud` reidona a ficha real e reativa o sync
- [x] [F-02] `GET /api/npcs?q=` perde o escopo de campanha → mestre vê NPCs e `notasMestre` de outras campanhas — escopo montado com `[Op.and]` (posse + campanha + busca); verificado empiricamente: mestre B não vê o NPC/`notasMestre` de A via `?q=` nem via `?campanhaId=` (2026-11-14)
- [x] [F-03] Combate tático quebrado: `PUT /encontros/:id` sempre retorna 422 (zod descarta `dadosExtras`/`novoEventoLog`) — `encontroSchema` declara `tipo/ativo/inimigos/recursos/dadosExtras/novoEventoLog`; verificado empiricamente (PUT com `dadosExtras`+`novoEventoLog` retorna 200; 2026-11-14)
- [x] [A-01/A-02] `loadCharacter` aceita JSON arbitrário por cima da ficha — validação `validateCharacterSchema` mantida; importação exige confirmação tipada ("IMPORTAR") e restaura o backup NA ficha ativa (identidade do arquivo descartada); identidade/id remoto nunca é adotado de arquivo

### Grave (S2)
- [x] [F-04] Criação de sessões — `dataAgendada` aceita `YYYY-MM-DD` ou ISO datetime; verificado ao vivo (201 para os dois, 422 para data BR)
- [x] [F-05] Nota privada não escapa: `privada` no `notaSchema`; enum `tipo_anotacao` unificado (`diario`/`anotacao`/`handout`) — nota privada invisível ao jogador e visível ao mestre (verificado ao vivo)
- [x] [F-06] `GET /characters?campanhaId=` exige posse (ou membership ativa); 403 para mestre de outra mesa (verificado ao vivo)
- [x] [F-07] `GET /campanhas/:id` sanitizado via `publicCharacter` + notas do mestre filtradas para não donos (verificado com membro jogador: sem banco/cofre/hash/segredos)
- [x] [A-03] `players` ↔ `jogadores` mapeado no backend; companheiros persistem após reload (verificado ao vivo)
- [x] [A-05] Logout não apaga mais o Mercado do Mundo (chaves namespaceadas preservadas)
- [x] [A-06] `upsertCharacter` apenas faz merge na lista local; nunca troca a seleção ativa (mestre inspecionando herói não perde o contexto)
- [x] [A-07] Conflito de sync (409) real e acionável: `updatedAt` ecoado pelo cliente é comparado no servidor; 409 traz `serverCharacter`; UI oferece "Manter da nuvem" (reloadFromCloud) e "Manter meus dados" (force); autosave carrega a versão remota; verificado ao vivo + testes de contrato `test/sync_conflict.test.js`
- [x] [F-08] `sync` sem id é recusado (400); verificado ao vivo
- [x] [F-09] Schema drift resolvido: migration `20261114130000-npc-campanha-nullable.js` (DROP NOT NULL, idempotente); `Character.userId` alinhado a `allowNull:false` (NOT NULL no banco); NPC sem campanha criado em 201 (verificado ao vivo)
- [x] [F-10] Uma fonte de verdade: schema legado do frontend (`database/migrations` users/campaigns/characters) removido; `database/migrate.js` (ESM, sem sequelize-cli) aplica baseline+v2+incrementais de forma **idempotente** e transacional (baseline só em banco sem `usuarios`); `npm run db:migrate` usa o runner — testado 2× em Postgres limpo

### Moderado (S3)
- [x] [F-11] Enums zod↔PG unificados (`encerrada`/`observador`/`encontroSchema` declara `tipo/ativo/inimigos/recursos`)
- [x] [F-12] `requireMaster` aplicado às rotas mestre (campanhas, NPCs, encontros, sessões, mapas); `obterPorId` de NPC usa `podeLerCampanha` (jogador do grupo lê, mestre donovê tudo); jogador não cria mais encontro ativo (recebe instrução para o mestre iniciar); middlewares em uso
- [x] [F-13] `/api/campanha` restrito por allowlist de chaves (`sanitizeDadosMestre`); **logout revoga JWTs** (`passwordChangedAt`) e redefinição de senha também revoga tudo; numeração de sessões com retry em corrida (2–3 tentativas) — unique no PG continua; legado `/campanha` segue disponível mas sanitizado
- [x] [F-05/F-13] `tipo` da nota unificado com PG (`diario`/`anotacao`/`handout`); `lore`/`segredo`/`pista` agora retornam 422 (não 500)
- [x] [A-09] Layout raiz virou server component com metadata/viewport + `next/font` (Cinzel/Crimson); `@import` do Google Fonts removido (globals.css só importa tailwind)
- [x] [A-10] `SmoothScroll` sempre renderiza `<ReactLenis>` com flag interna de reduced-motion (sem remount da árvore)
- [x] [A-11] Código órfão removido (`/anotacao`, `AnotacoesImproved`, `ThemeSelector`, `BarrraHp`, `Aurora`); `defaultData` demo fica só para testes
- [~] [A-12] Páginas gigantes (admin/mercado 1156 l.), GSAP eager, zero `next/dynamic`, fontes render-blocking — progresso: fontes já via `next/font`; `DiceModal`/`DiceFloatingTrigger`/`DanoCuraPainel` agora carregam via `next/dynamic`; quebra das páginas gigantes pendente
- [~] [A-13] A11y — progresso: `ConfirmDialog` com role/aria-modal/Escape/focus-trap/foco inicial; `<img>` sem `next/image` e textos `text-[9px]` → `text-[10px]` (54 ocorrências resolvidas 2026-11-15)
- [x] [A-14] Cores hex hardcoded dos tokens canônicos substituídas por `var(--theme-accent|title|subtitle)` em posição de classe (270 substituições/21 arquivos); hexes restantes em estilos inline/SVG e no tema interno do auth permanecem — tokens novos exigiriam varredura visual
- [x] [A-16] Frontend usa `/campanhas/legado` (não mais o alias cru); `deleteGameSession` sem body
- [x] [A-17] `npm test` (145/145 front, 54/54 back — 42 anteriores + mapa_tatico 14, segurança auth 12; 2026-11-15); `themes.test.mjs` corrigido; contrato do sync coberto por `test/sync_conflict.test.js`; backup/export test atualizado (senha nunca vaza)

### Cosmético/menor (S4)
- [x] [F-15] Higiene: `getJwtSecret` unificado; falha de `registrarAuditoria` vira log estruturado com contexto; `canManageCharacter` sem roundtrip extra; `googleapis` ausente do projeto; `.strict()` intencional onde importa (register/login/resets) — schemas de ficha são não-estritos de propósito (aliases do cliente)
- [x] [A-15] `upd` não coage `"0"` para string; `uid()` com `crypto.getRandomValues`; feedback de rejeição de habilidade coerente ("Rejeitada pelo mestre.")
- [x] adicionar o campo perfil para o mestre (navbar mestre + /perfil com visão de mestre e acesso à Sala do Mestre)