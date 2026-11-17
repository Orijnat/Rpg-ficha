# 🧠 Sessão Ativa — Grimorium RPG

## 🔧 Atualização 2026-11-17 (Raça = bônus 5e aditivo + Classe define Dado de Vida e Habilidades de Nível) — NÃO commitado

### Pedidos
1. "Os status base poderiam ser definidos pelo jogador, mas a raça escolhida já aplica o bônus que vem dela no status em questão — ao selecionar a raça só adicione o bônus nos status base. Considere o D&D mais atual."
2. "As habilidades de nível poderiam ser atribuídas à classe — criei uma classe e as habilidades de nível são fixas para ela; outro usuário usando a mesma classe recebe a mesma progressão."

### Decisões do usuário (via perguntas)
- Bônus racial: **Clássico 5e** fixo, SOMADO na seleção (nunca sobrescreve).
- Classes: mestre cria no admin + catálogo seed; **global** (todos os usuários); ficha **referencia dinamicamente** o catálogo (nada é copiado); **qualquer mestre edita tudo**; classe define o **Dado de Vida** (a raça não define mais); troca de classe travada igual raça (1×, só mestre troca); habilidades de classe **desbloqueiam ao upar** (sem aprovação); habilidades criadas pelo jogador passam pelo mestre e ficam só naquela ficha.
- Status base: mantida a edição livre na ficha (StatBox); a raça só SOMA o bônus.

### Backend `../Rpg-backend` (NÃO commitado)
- Migration `20261117120000-classes.js`: tabelas `classes` (seed 8 classes; RLS) e `classe_habilidades` (nivel 1-20, nome/tipo/custo/atributo/formula/dano_tipo/alcance/descricao; RLS); `personagens.classe_id` FK SET NULL + índice; backfill determinístico por `job` exato (sem acento/caixa; estava quebrado por `p.job` inexistente — coluna real é `classe`).
- Models `Class`/`ClassAbility`; associações (`Class.hasMany(ClassAbility)`, `Character.belongsTo(Class)`); `Character.classeId` (coluna `classe_id`).
- `services/hitDie.js` (hitDieMax/isValidHitDie compartilhado), `services/classeService.js` (resolveClasse id/slug/nome sem acento, classeExtras → `{class, hitDie}`, slug único).
- `classController` + `/api/classes` (GET lista/item públicos com abilities; POST/PUT/DELETE requireMaster, abilities replace-all em transação).
- characterController: `classeGuardError` (mesmo contrato da raça → 403), `classId`/`classeId` aceitos (normalizeCharacterPayload), includeClasse, publicCharacter expõe `classId/classSlug/className/hitDie` (classe → extras.hitDie → "d8"); create/register com `classeId` opcional → HP = hitDieMax(dadoDaClasse); register response inclui `classe` (className não-nulo).
- apiSchemas: `classeId`/`classId`/`classe` em camposFicha + registroSchema (bug: payload `classId` era removido pelo zod — corrigido); novos `classeSchema`/`classeUpdateSchema`/`classeAbilitySchema`.
- Testes: novo `classe_lock.test.js` (7 casos); suíte **86/86**. Verificado AO VIVO em Postgres 16 descartável (container removido): migration do zero OK; register com classe → HP 6/8 conforme dado; pick do jogador 1×; troca/limpeza por jogador → 403; mestre da mesa troca/limpa → 200; segundo mestre edita classe alheia → 200; jogador criar classe → 403; dadoDeVida "1d7" → 422.

### Frontend (NÃO commitado)
- `lib/races.js` reescrito: `bonus` 5e clássico (Humano +1 tudo; Elfo +2DES/+1SAB; Anão +2CON/+1FOR; Halfling +2DES/+1CAR; Draconato +2FOR/+1CAR; Gnomo +2INT/+1CAR; Tiefling +2CAR/+1INT; Orc +2FOR/+1CON); `getRaceBonus/addRaceBonus/subtractRaceBonus/formatRaceBonus`; exports DEPRECATED removidos; fallback de bônus por slug p/ raças da API (sem `bonus`).
- `lib/classes.js` reescrito: seed 8 classes + `getClassById/getHitDieForClass/isValidHitDie/getClassAbilities/getClassAbilitiesLocked/findSelectedClass` (presets de habilidades removidos).
- `CharacterContext`: `updateRace` só SOMA o bônus (nível/HP intocados); novo `updateClass` (1ª escolha: grava classId+extras.class/hitDie e HP = hitDieMax da classe no nível 1); `normalizeCharacterForSync` envia `classId`/`class`.
- `/personagem`: card "Raça & Classe & Ascensão" — 2 selects travados após 1ª escolha (opções mostram bônus/dado; Classe aplica HP na 1ª escolha nível 1).
- `/habilidades`: nova `ClassProgression` (read-only, desbloqueio por nível, aviso "criadas pelo jogador passam pelo mestre e ficam na ficha"); Tipo 1 mostra "N da classe desbloqueadas · X de 20 slots próprios".
- `/admin/classes` (novo, no AppShell MASTER_NAV como "Classes & Níveis"): CRUD do catálogo global — cards + `ClassFormModal` (nome, Dado de Vida, primário/secundário, descrição, ordem + editor de habilidades de nível 1-20 com detalhes expansíveis); remoção via ConfirmDialog.
- `/admin/personagens/[id]/ficha`: card "Classe (somente o mestre altera)" (aplica hitDie; HP = máximo do dado no nível 1) + Raça agora ADITIVA (subtrai o bônus antigo, soma o novo).
- api.js: `listClasses/createClassOnBackend/updateClassOnBackend/deleteClassOnBackend`; perfil (quick-create) e registro ajustados (status base 10; HP 70 até a classe ser escolhida); leveling.js comentário → dado de vida vem da CLASSE.
- Verificação: front **160/160** testes (races-leveling/classes.test reescritos), build 30/30 OK (`/admin/classes` prerendered), lint 0 erros (44 warnings pré-existentes).
- **Re-verificado em 2026-11-17 (sessão seguinte)**: back **86/86**, front **160/160**, build 30/30 (`/admin/classes` prerendered), lint front 0 erros; backend não tem script lint.

### ✅ CONCLUÍDO 2026-11-17 (sessão seguinte)
- Migration `20261117120000-classes.js` APLICADA no Supabase de produção (`npm run db:migrate`): 8 classes seedadas (bruxeiro 1d10 … bardo 1d8), `personagens.classe_id` criada com índice, RLS habilitada em `classes`/`classe_habilidades`, sequelize_meta registrado. `classe_habilidades` vazia (o mestre preenche em /admin/classes).
- Commitado e pushed (2 repos): back `60ad3da` feat(classes)!; front `77a10a1` feat(classes)! + `36a812c` docs(memory). Vercel sobe automático; backend ainda precisa de Manual Deploy no Render para `/api/classes` e o guard 403 valerem em produção.

### Pendências
- ~~Deploy/migração~~ — migration APLICADA no Supabase em 2026-11-17. **Falta apenas o deploy do backend no Render** (Manual Deploy) para `/api/classes` e o guard 403 valerem em produção.
- Raças: coluna `dado_de_vida` de `racas` ficou legada (não lida mais pelo app). Novos ajustes de balanceamento de bônus racial são feitos em `lib/races.js` (frontend) — tabela 5e clássica.
- Nada commitado (2 repos); `.github/` permanece não rastreado.

---

## 🔧 Atualização 2026-11-17 (Botões "Finalizar Encontro" + desfecho vitória/derrota/fuga) — NÃO commitado
- Pedido: "adicione botões de finalizar encontro, que abre um modal para selecionar quais heróis receberam xp, a quantidade se algum perderam ou fugiram".
- Novo `components/admin/FinalizarEncounterModal.jsx`: lista os heróis do encontro (iniciativa, type Herói) com XP/Nv atual; checkbox "Recebe XP" (desmarcado → XP 0), seletor de desfecho por herói (Vitória ✓ verde / Derrota / Fugiu) — Derrota/Fuga zera o XP por padrão (mestre pode sobrescrever); input de XP individual (clamp 0..1M); ações rápidas "Todos: Vitória/Derrota/Fugiu"; contadores no rodapé (N heróis · total XP); Escape/backdrop/Cancelar fecham (bloqueados durante o envio); role=dialog + foco/trap como nos outros modais; Enter nos inputs confirma via botão.
- `admin/encontros/page.js`: novo `handleFinalizeEncounter(rows)` — re-busca fichas (listCharacters), soma XP por herói (updateCharacterOnBackend), grava no encontro `ativo:false`, `dadosExtras { finalizadoEm, xpDistribuidoEm, resultado { vitoria[], derrota[], fuga[], xpPorHeroi } }`, registra no log (tipo `recursos`) e marca sucesso. 2 botões ("botões" do pedido): (A) no cabeçalho do card do encontro ativo (Trophy "Finalizar", some quando já finalizado → badge "Finalizado"); (B) dentro do `EncounterXpPanel` (novo prop `onFinalizeEncounter`) abaixo do botão Distribuir. Página aparece embutida no mapa-tatico (Sala de Guerra) → botões funcionam nos dois lugares.
- Verificado: build 30/30, lint 0 erros (warnings pré-existentes; nenhum nos arquivos novos), testes 161/161. NÃO commitado. UX do modal ainda não conferida no navegador.

---

## 🔧 Atualização 2026-11-17 (Cadastro: Classe / Ocupação vira catálogo global de Classes) — NÃO commitado
- Pedido: "a classe que o jogador novo cadastrar será salva e mostrada no campo de administração da classe no menu do mestre".
- **Backend**: novo `findOrCreateClasseByNome(nome, criadoPorId)` em `classeService.js` — match sem acento/caixa no catálogo (slug ou nome); se não existir, CRIA entrada global (1d8 padrão, ordem 100, slug único via uniqueSlug, `criado_por` = novo usuário; nome capitalizado por palavra). Corrida única de cadastros com mesmo nome → catch de UniqueConstraintError → re-resolve (resolveClasse) e reutiliza. Job só símbolos → null (sem catálogo). Nunca bloqueia o cadastro (try/catch com log).
- `authController.register`: após criar o usuário e se ainda não há classe vinculada, job do herói ("Classe / Ocupação") é resolvido/criado no catálogo — ficha fica vinculada (classeId, extras.class/hitDie, HP = hitDieMax; classe nova → 8 PV), e a classe aparece automaticamente em `/api/classes` → `/admin/classes` (Classes & Níveis), editável por qualquer mestre (calibra dado de vida/atributos/habilidades).
- **Testes**: novo `classe_catalogo_cadastro.test.js` (4 casos: cria nova; reutiliza catalogada sem criar; job "!!!" não cria; corrida unique→reutiliza). `login_sync_integration` e `invite_flow` agora mockam Class (findAll/create). Suíte **90/90**.
- **Frontend**: dica no registro abaixo do campo Classe / Ocupação (classes novas entram no catálogo do mestre). Build OK, lint 0 erros.
- NÃO verificado ao vivo (o `.env` do backend aponta para o Supabase de PRODUÇÃO — sem teste de escrita lá); comportamento coberto pelos mocks. Nada commitado.

---

## ✅ Push 2026-11-17 (7) — Animação 3D do dado + remoção do d2 (frontend)
- `1d2d848` feat(dice) o dado em si rolando com todos os lados — 3D WebGL/Three.js (Dice3D.jsx; d10 bipirâmide pentagonal; números por face via CanvasTexture; d100 = par de dados; d2 removido) · `74f4fe4` docs(memory). Pushed: `6fbbdd8..74f4fe4`.
- Verificado antes do commit: front 161/161, build OK, lint 0 erros. **Sem conferência no navegador** — revisar visual/enquadramento/luzes e o fallback estático.

- **Migration `20261117210000-montaria-a-partir-de-json.js` APLICADA no Supabase de produção** (via `npm run db:migrate`; todas as incrementos re-aplicados com sucesso/idempotência). `montarias` passou de 0 → **1** linha ("sas", 20/20 PV, dono "wqw") — exatamente o que havia em dados_extras.mounts. `sequelize_meta` registra a migration. **Backend AINDA NÃO DEPLOYADO no Render** → os endpoints `/api/characters/:id/mounts` não existem em produção até o Manual Deploy (até lá, a página /montaria mostrará o erro + retry).
- **Estado do mapeamento**: achado principal = schema drift (tabelas relacionais nunca usadas: pericias_personagem, itens_inventario, contratos, cofres, imagens — candidatas a drop após decisão do operador; montarias agora É utilizada).

## ✅ 2026-11-17 (3ª limpeza total do banco Supabase — PRODUÇÃO, sem backup)
- Pedido: "limpe o banco novamente". Confirmação dupla do usuário: TRUNCATE de todas as tabelas public, SEM backup.
- Estado antes: usuarios 7, personagens 6, campanhas 1, atributos_personagem 6, auditoria 26, anotacoes 1, log_batalha 61, rolagens 31, sessoes_autenticacao 18, sessoes_jogo 2, encontros 3, recursos_campanha 3, mapa_tatico 1, npcs 1, montarias 1, classes 8, racas 8.
- Executado: `TRUNCATE … RESTART IDENTITY CASCADE` em 28 tabelas public EXCETO `sequelize_meta` (17) e `SequelizeMeta` (1) — via script de contagem dinâmica. `auth.*`/`storage.*` intactos (sempre vazios).
- **Re-semeadeiro aplicado**: `npm run db:migrate` rodou idempotentemente após o purge (nada de erros); `racas` (8) e `classes` (8) restabelecidas pelo seed das migrations; o app funciona do zero.
- **Sem backup** (decisão explícita). Nada mais foi tocado.
- Pendência de sempre: deploy do backend no Render.

## 🔧 2026-11-17 — XP de encontro é TOTAL dividido pelos heróis; jogadores não alteram XP/nível; HP na navbar — commitado (lote de pus)
- Pedido: "ao criar um encontro, o xp ... sera o total do xp informado na cracao do encontro, dividido pela quantidade de pessoas no encontro".
- **XP de encontro agora é TOTAL** (`recursos.xp`): rótulo de criação virado para "XP Total do Encontro" (com title); `handleDistributeXp` divide por heróis na iniciativa (`Math.floor(reward/N)`) e distribui esse valor por herói (logs/mensagens/toast refletem "X XP cada"); `EncounterXpPanel`: entrada vira "XP total do encontro", mostra "÷N = Y XP cada", por herói "+Y com esta vitória", botão "Distribuir X XP para cada herói (total Y)"; `FinalizarEncounterModal`: default de cada linha = floor(reward/N) (vitoria/toggle/set-all também), rodapé mostra "XP do encontro: R ÷ N herói(s) = perHero XP cada"; modal de confirmação cita a divisão.
- **Jogadores NÃO alteram XP/nível (regra geral)**: backend `characterController.sync` → `normalizeCharacterPayload` descarta `experiencia`/`level`/`xp` para atores não-mestre (drop silencioso, nunca 403, preserva extras.xp legado); novo `test/xp_level_lock.test.js` (3 casos) → suíte **109/109**. Frontend: `XPBar` read-only para não-mestres (sem ✎, sem clique); botão "Subir de Nível" oculto para não-mestres → hint "Apenas o mestre promove o herói de nível".
- **Navbar**: barra de PV somente leitura restaurada ao lado do botão Dano/Cura (HPBar + "Nv/PV"); clique abre o modal de vitalidade; sem botões −/+.
- Verificado: back 109/109, front 161/161, build OK, lint 0 erros (44 warnings pré-existentes). NÃO conferido no navegador.

## 🔧 2026-11-17 — XP e nível do jogador bloqueados no servidor + frontend; HP na navbar restaurada — commitado junto ao lote de pus
- Pedido: "sim o jogador não pode alterar o xp dele mesmo" → confirmado: "o jogador não pode alterar o nível e nem o xp dele mesmo". Escolhida a regra completa (também trava o botão Subir de Nível para não-mestres).
- **Backend** `characterController.sync` via `normalizeCharacterPayload`: para atores NÃO-mestre, descarta `experiencia`/`level`/`xp` do payload (o jogador envia sempre esses campos na sync — por isso o drop é silencioso, nunca 403, evitando travar a ficha) e preserva `dadosExtras.xp` legado. Mestre mantém tudo como antes. Novo `test/xp_level_lock.test.js` (3 casos: jogador não altera, mestre altera, hp livre para dono) → suíte **109/109**.
- **Frontend**: `XPBar` — não-mestre não vê o botão ✎ (read-only); `/personagem` — botão "Subir de Nível" oculto para não-mestres, mostrando "Apenas o mestre promove o herói de nível". 
- **Navbar**: barra de PV somente leitura (+ PV atual) restaurada ao lado do botão Dano/Cura (na sub-linha mt-1.5) — clique na barra abre o modal de Dano/Cura; sem botões −/+ (controles vivem só no modal).
- Verificação: back 109/109, front 161/161, build OK, lint 0 erros (44 warnings pré-existentes). NÃO conferido no navegador.

## 🔧 2026-11-17 — Tema Lua de Sangue: vermelho mais escuro + ficha sem controles de vitalidade na navbar — NÃO commitado
- Pedido 1: "poderia deixar um vermelho mais escuro no tema dark que usa vermelo" — **bloodmoon** (Lua de Sangue) com accent muito mais escuro: `#e8503a` → **`#d53c25`** (on-bg 4.29); globals.css (–theme-accent/hover/glow/card border/primary), themes.js (accent + previewColors), themes.test.mjs. Contraste on-accent (texto #1f0a06) ainda 4.08 ✓.
- Pedido 2: "remova este campoGestão de Vitalidade da fica e deixe apenas no botao de dano/cura" — o cluster inline de vitalidade na navbar foi removido: HP bar clicável, leitura "Nv/PV", botões −1/+1 PV. Resta **somente o botão "Dano/Cura"** (abre o modal com o painel "Gestão de Vitalidade" do DanoCuraPainel, já compact). XPBar e nome/nível mantidos. `HPBar`/`Minus`/`Plus` não são mais usados no Cabecalho.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Temas claros: botões do mestre/dano·cura/ações com mais tinta + vitalidade fora da ficha (modal na navbar) — NÃO commitado
- **Escurecimento nos temas claros** (após feedback "está difícil de ver"): 
  - `--primary`/`--ring`: aurora #dc2626 → **#c91f1f** (5.08:1), sapphire #2563eb → **#1f4fce** (6.05:1).
  - Overrides de texto por tema nos claros (`!important`): `.text-amber-200/300/400` → #92400e/#b45309/#92400e (botões amarelos do mestre), `.text-rose-300/400` → #be123d/#9f123d, `.text-emerald-300/400` → #065f46/#047857 (botões curar/tomar dano) — antes eram -300/-400 sobre fundo claro (quase ilegíveis).
- **Vitalidade fora da ficha**: removido `<DanoCuraPainel />` (e o import) de `RecursosCombate.jsx` — o painel de Dano/Cura agora só vive no modal do botão "Dano/Cura" na navbar (Cabecalho, que já o renderizava em `isHpModalOpen`). A ficha (/personagem) NÃO tem mais o painel embutido.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Rolagem de Dado de Vida: apenas Normal — NÃO commitado
- Pedido: "para a rolaem de dado de vida, poderia deixar rolar apenas normal".
- `requestRoll` aceita `allowContest: false` — o `RollChooser` do DiceModal então exibe **apenas o botão Normal** (a seção "Usou o dado físico?" permanece, mas sem o seletor Normal/Vantagem/Desvantagem; `effectivePhysMode` trava em "normal" — Valores físicos ainda podem ser registrados, só no modo Normal).
- Aplicado em todos os 3 call sites de Dado de Vida via rolador: `handleLevelUp` (/personagem, "Dado de Vida · Nível X"), `handleRollHitDie` (RecursosCombate — descanso), `handleRollHitDieHeal` (DanoCuraPainel — cura com dado de vida). Promoção no admin já era virtual-normal via `rollDice` direto (sem modal) — inalterada.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Contraste em superfícies fixas-escuras + botão Dano/Cura com texto branco — NÃO commitado
- Pedido: "botoes por exemplo o do dano/cura que estao muito escuros, poderia colocar a fonte das letras em branco ali".
- `.btn-rpg` (botão glossy escuro usado no Dano/Cura do Cabeçalho e na ficha): texto agora **branco** (antes `var(--theme-title)` — ilegível nos temas claros, onde title é #450a0a sobre quase-preto).
- Substituição de `text-[var(--theme-title)]`→`#f5efdf` e `text-[var(--theme-subtitle)]`→`#cbb288` (cores fixas claras) nas superfícies FIXAS-escuras onde o tema não deve vazar: **DiceModal** (45 ocorrências), AddItemModal, AddMountModal, DepositToBankModal, consts.js do inventário, **login/registro/convite** (cards "pergaminho" sempre escuros), inputs de **/admin/personagens/[id]** e **/new** (fundo #0b0d12 fixo).
- Fora de escopo (corrigível sob demanda): demais superfícies escuras fixas em páginas do admin (campanhas, MarketItemModal, BankChestModal, ConfirmDialog, mapa-tatico — mesmo padrão) e auditoria completa de contraste nos temas claros.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Temas: Jade e Fogo Fátuo removidos; botões de AÇÃO mais claros nos claros — NÃO commitado
- Pedido: "retire o jade de avalon, foo fatuo, os temas claros continue usando a paleta de cor mas nos botoes que nao sejam os dos dados coloque uma cor mais clarar" (escolha: só botões de Ação ficam mais claros; dados mantêm a cor).
- **Removidos**: jade e felflame (CSS, themes.js, THEME_ICONS, themes.test.mjs; LEGACY_THEME_MAP: forest→amber, mist→sapphire). Catálogo final: amber, abyss, bloodmoon, frostfall, aurora, sapphire (6).
- **Claros (aurora/sapphire)**: `--primary`/`--ring` em tons mais claros do mesmo matiz (aurora `#dc2626`, sapphire `#2563eb`; `--accent` NÃO mudou — botões dos dados ficam com a cor atual).
- **StatBox neutral (botão de dado d20)**: override por tema — gradiente e borda travados no accent antigo via `.from-primary\/15.to-primary\/5` (não clareia com o --primary novo).
- **Transparência**: botões que usam `bg-primary` (maioria dos CTAs — Salvar/Registrar/Confirmar etc.) clarearam automaticamente. Botões de ação que referenciam `var(--theme-accent)` diretamente (ex.: rerrolar, distribuir XP — poucos) mantiveram a cor escura; para migrá-los é só trocá-los para `bg-primary` (conversão rápida sob pedido).
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Temas: só Âmbar Vulcânico e Cripta Abissal + 6 temas novos — NÃO commitado
- Pedido: "seure apenas o tema ambar vulcanico e cripta absisal, o resto dos temas remova e faca mais temas novos com outras cores".
- **Removidos**: forest (Floresta Ancestral), crimson (Sangue Carmesim), frost (Gelo Eterno), parchment (Pergaminho Antigo), sunlight (Catedral da Luz), mist (Névoa de Avalon) — blocos CSS e metadados.
- **Mantidos**: amber (Âmbar Vulcânico #d89b38) e abyss (Cripta Abissal). Nota: o accent do abyss em themes.js era #a855f7 mas o CSS usava #b05cf9 — alinhado para **#b05cf9** (CSS é o que renderiza).
- **Novos 6 temas** (contrastes WCAG calculados de verdade, todos AAA no título):
  - Dark: **bloodmoon** — Lua de Sangue (#e8503a, Eclipse, Complementary Ember) · **frostfall** — Gelo Eterno (#38bdf8, Snowflake, Análoga Polar) · **jade** — Jade de Avalon (#2dd4bf, Droplets, Análoga Aquática) · **felflame** — Fogo Fátuo (#a3e635, Zap, Triádica Will-o'-the-Wisp)
  - Light: **aurora** — Aurora Rubra (#b91c1c sobre #fbf0ec, Sunrise) · **sapphire** — Safira Real (#1d4ed8 sobre #eef1f7, Gem)
- `globals.css`: blocos novos (darks mínimos no padrão abyss; lights completos no padrão mist); grupo "Temas Claros" (.grimoire-card/.medallion-plate/body::before/body::after/.alchemy-vial/.gold-gradient-text) agora aurora+sapphire.
- `themes.test.mjs` reescrito (8 temas; asserts ids/nomes/accents/types; remove cheque de presença dos removidos). `SettingsModal` THEME_ICONS atualizado (novos ids → Eclipse/Snowflake/Droplets/Zap/Sunrise/Gem; removidos ícones órfãos). `LEGACY_THEME_MAP` mapeia ids antigos → novos equivalentes (crimson→amber, frost→frostfall, forest→jade, parchment→aurora, sunlight→sapphire, mist→jade). Landing (/) continua fixa em amber.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador (conferir /perfil → Aparência com os 8 temas).

## 🔧 2026-11-17 — Mapeamento geral do sistema + reformulação: MONTARIAS agora são no banco (tabela montarias) — COMMITADO E MIGRADO (2 repos)
- Pedido: "faça um mapeamento geral do sistema e use a skill de banco de dados e reformule o que julgar necessário para adicionar no banco de dados".
- **Mapeamento** (inventário completo banco × código): RLS OK em toda public (linter), 13 índices de FK (linter), tabelas v2 sólidas (CHECK NOT VALID/valid CHECK em personagens/atributos/npcs/encontros/rolagens…). **Achado principal — schema drift**: o app inteiro vive em `personagens.dados_extras` (JSONB); as tabelas relacionais feitas "para o futuro" (pericias_personagem, itens_inventario, contratos, cofres, imagens, **montarias**) estavam CRIADAS mas ZERO usadas (0 refs no src). Frontend: só rpg_auth_token/rpg_current_char_id/rpg-sheet-theme no storage — nada mais fiel fora do banco.
- **Reformulação aplicada (montarias relacionais)** — fecha o ciclo dos pedidos das Montarias:
  - **Backend** `../Rpg-backend` (7e64360): novo `Mount.js` (mapeia a tabela `montarias` do baseline — personagem_id FK CASCADE, CHECK vida<=hpMax); `Mount` registrado/exportado em models/index; `canManageCharacter` agora exportado de characterController (ACL idêntica à das fichas); NOVO `mountController` (list com ACL read = dono/mestre-mesa/sharedWithPlayers, create/update/remove com clamp HP≤hpMax e clamp atributos 1..30, merge raso de dadosExtras preservando campos); rotas nestadas `/api/characters/:id/mounts` (+/mountId PUT/DELETE); NOVA migration `20261117210000-montaria-a-partir-de-json.js` — backfill de `dados_extras.mounts` → linhas em `montarias` (idempotente por ficha; hp clampado ao max; hp>hpMax legado ok; down() remove apenas linhas com legadoId). **Testada AO VIVO em Postgres 16 descartável** (container removido): banco.sql → seed de 2 montarias → backfill → clamp 45→30 ✓, up idempotente ✓, down ✓.
  - **Frontend** (9f98922, push 21ce4ed..19d431f nos 2 repos; docs 19d431f): `lib/api.js` ganhou `listMounts/createMount/updateMount/deleteMount` (list trata 404→[]); `/montaria/page.js` REESCRITA: leitura via API com loading/error+retry, mutações optimistas com rollback (nome, espécie, PV, atributos via StatBox, alive, heal/dano), criação via modal → POST, delete via DELETE; `dadosExtras.mounts` legado NÃO é mais escrito (resíduo preservado; backfill migra tudo uma vez no deploy).
  - Verificação: back **106/106** (+11 mounts.test.js), front **161/161**, build OK, lint 0 erros (44/44 warnings pré-existentes).
- **Pendente (operador)**: `npm run db:migrate` no Supabase de produção e Manual Deploy do backend no Render — sem isso, produção ainda não tem `montarias` utilizáveis via API (front mostrará "Erro ao carregar montarias" com retry).
- **Recomendações (NÃO aplicadas — destrutivo/decisão do operador)**: decidir destino das tabelas legado sem uso (pericias_personagem/itens_inventario/contratos/cofres/imagens — candidatas a drop após backup); replicar o padrão "dados no banco" para itens_inventario/contratos/cofres/pericias se escalarem além de JSONB; invocar `npx supabase db lint`/advisors periodicamente.

## 🔧 2026-11-17 — Montarias ganham "Status Fundamentais" (iguais aos dos heróis) — NÃO commitado
- Pedido: "poderia adicionar apenas status para ela? similar a dos jogadores".
- `/montaria/page.js`: card "Status Fundamentais" entre Vitalidade e Anotações — 7 `StatBox` idênticos aos do jogador (valor, +/−, modificador, **clique no modificador rola d20** via DiceContext). Shape nova `mount.attributes { FOR..INT }` (default 10; legado sem o campo nasce com 10s; clamp 1..30). `mountAttributes()` preenche/lê; `patchMountAttribute` edita por atributo (persiste em dadosExtras.mounts).
- Modal de criação (AddMountModal) NÃO expõe status; montaria nasce com 10s — editável na ficha como a dos jogadores.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Modal de criação de montarias — NÃO commitado
- Pedido: "poderia fazer um modal para a criação de montarias?".
- Novo `src/app/components/montaria/AddMountModal.jsx`: cadastro completo no padrão AddItemModal (Escape fecha, autofocus no nome, role=dialog/aria-modal, data-lenis-prevent): Nome*, Espécie com sugestões (datalist: Corcel, Alce Real, Lobo de Pântano, Grifo, Quimera, Dragão jovem…), PV máximo (default 20, PV atual acompanha até ser tocado manualmente), PV atual (clamp 0..máx), Anotações. Confirma só entra na ficha após "Adotar montaria".
- `/montaria/page.js`: botões "Adicionar montaria" e "Adotar primeira montaria" agora abrem o modal; `handleAddMount` cria `{ id: uid(), name, species, hp, hpMax, notes, alive: hp>0 }` em dadosExtras.mounts. Preview ao vivo removido (antes criava "Nova montaria" instantaneamente).
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — NPC: botão "Acessar Ficha" abrindo a ficha NO LAYOUT DO JOGADOR — NÃO commitado
- Pedido: "para npc, poderia fazer um botao de acessar ficha, na qual o layout e igual ao dos players".
- Novo fluxo `/personagem?inspect=<id>&type=npc`: `AuthContext` (initAuth) agora detecta `type=npc`, busca o NPC com `fetchNpcById` e injeta um **personagem sintético** no `characters` — `{ __npc: true, userId: "npc:<id>" (≠ user.id → modo inspeção), name/nome/job espelho, FOR..INT a partir de dadosExtras.attributes, xp:0, level:1, abilities/dadosExtras}` — o /personagem renderiza o monstro **idêntico** a um herói (Cabecalho, StatBox com rolagens, Perícias, RecursosCombate, XP 0 bloqueado, Aparencia vazia).
- `CharacterContext`: fichas `__npc` são **CÓPIA de trabalho**: `isNpcSheet` troca o cache p/ `sessionStorage` (`rpg-npc-sheet:v1:<user>:<id>` — por aba, nunca compartilhado) e **desativa toda a sincronização** (`syncCharacterWithBackend` nunca é chamado; `reloadFromCloud`→false; `retrySync`→offline; status exibido "offline"). Original no catálogo INTOCADO; refresh mantém a cópia.
- Diálogos/banners: AppShell — "Modo Mestre · Ficha do Monstro" + badge "Cópia desta guia" + texto de rodapé; "Trocar Herói" NÃO lista o sintético (filtrado `!c.__npc`); jogadores comuns não veem (só mestre inspeciona).
- Botões "Acessar Ficha" (âncora `target=_blank` → `/personagem?inspect=<id>&type=npc`) adicionados: editor NPC (/admin/npcs/[id], ao lado de Editar/Duplicar), Ameaças & Heróis (cards de NPC), catálogo /admin/npcs (ao lado de "Editar"). Herois/jogadores inalterados (registro compartilhado, VS. NPC=local).
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — NPC: cada guia abre uma CÓPIA de trabalho (original intacto) — NÃO commitado
- Pedido: "as edições em fichas de herói e jogadores devem salvar e ser editada para ambos, mas as de NPC — caso forem abertas 3 fichas de esqueleto — eu gostaria que abrisse uma copia, e mantivesse a ficha original intacta". Decisão do usuário: **cópia temporária por aba** (sessionStorage).
- Herois/jogadores: INALTERADO (Salva/EDITA o registro compartilhado via backend; jogador vê).
- `/admin/npcs/[id]/page.js` — a guia sempre abre como **cópia de trabalho** (`draftKey = rpg-npc-draft:<id>` no sessionStorage da guia; restaura no mount; persiste a cada edição; refresh não perde). O catálogo NÃO muda por abrir/editar.
- Fluxo: banner âmbar "Cópia de trabalho desta guia" (origem intacta) + ações: **Salvar como novo NPC** (primário — cria entrada no catálogo via POST /npcs e abre a guia nela), **Sobrepor o original…** (escape, confirmação solene digitando o nome — sobrescreve o catálogo via PUT), **Restaurar do original** (descarta a cópia e recarrega do servidor), **Descartar cópia** (limpa draft e volta ao catálogo), **Excluir** mantida (confirm. digitando o nome; limpa o draft). **Duplicar/Variante agora nasce da CÓPIA desta guia** (inclui as edições atuais; HP dimensionado pelo multiplicador; tags Variante/Elite mescladas).
- `handleSave` (PUT direto) removido; Enter nos inputs não salva mais (form onSubmit preventDefault).
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador.

## 🔧 2026-11-17 — Sessão persistida no NAVEGADOR INTEIRO (localStorage) — NÃO commitado
- Pedido: "desenvolva um token por sessão, que fica salvo no navegador inteiro, pois ao abrir a nova aba, ele me pede para fazer login e me tira da tela da qual deveria ver" (nova guia do mestre via ?inspect=caía no /login porque o JWT era sessionStorage = por guia).
- `src/lib/api.js`: `rpg_auth_token` agora gravado/lido do **localStorage** (todo o navegador); migração automática (token legado de sessionStorage sobe uma vez). `clearAuth()` já limpava os dois — mantido. Comentários atualizados.
- `AuthContext`: novo `useEffect` com listener `storage` — **logout em uma guia desconecta as demais** (zera user/token e manda para /login). Leituras diretas de sessionStorage para ficha (`rpg_current_char_id`) NÃO mudaram (cada guia mantém o herói ativo próprio — era o comportamento desejado para inspeções paralelas).
- Trade-off de segurança (decisão do usuário): token JS-readable na origem por todo o navegador (antes: por guia). Mitigantes mantidos: revogação server-side (logout/troca de senha revoga), HTTPS-only (Vercel), /auth/me como fonte da verdade. Anterior decisão de endurecimento (sessionStorage) foi explicitamente revertida a pedido do usuário.
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO commitado, NÃO conferido no navegador. Comportamento esperado pós-deploy: abrir /personagem?inspect=<id> em nova guia restaura a sessão direto na ficha do herói; login em qualquer guia vale para todas; logout em qualquer guia desconecta todas.

## 🔧 2026-11-17 — Ficha aberta como mestre abre NOVA GUIA do navegador — NÃO commitado
- Pedido: "quando eu abrir uma ficha como mestre, abre uma nova guia no navegador com a ficha para ficar mais organizado... talvez precise abrir 3 fichas de esqueleto".
- `/personagem?inspect=<id>` — `AuthContext` (init) agora prioriza o parâmetro `inspect` (lido via `window.location.search`, sem useSearchParams → sem problema de SSG/Suspense): a guia abre já mostrando a ficha completa do herói da URL; refresh re-aplica (URL é a fonte da verdade da guia). Jogadores não são afetados (param só casa com a própria lista).
- `/admin/personagens` (Ameaças & Heróis): botão "Acessar Ficha Completa" agora faz `window.open(`/personagem?inspect=${id}`, _blank)` em vez de `inspectCharacter` (mesma sessão) — abas independentes por guia. "Visão Rápida" já era target=_blank ✓.
- **Correção 2026-11-17 (2)**: defini TODOS os acessos do mestre à ficha de jogador como âncoras `<a target="_blank">` para `/personagem?inspect=<id>` (nunca bloqueadas por popup blockers): Ameaças & Heróis (`Acessar Ficha Completa`), Painel do Mestre (`Acessar Ficha`), campanhas (`Acessar Ficha Completa`). `inspectCharacter` não é mais usado nessas telas (segue no contexto p/ o seletor do AppShell, mesmo fluxo proposital). Pushed `a808f04..ea5bab3` — aguardar build da Vercel + hard refresh.
- **Correção 2026-11-17**: a chamada `window.open` foi trocada por `<Link target="_blank" rel="noreferrer noopener">` (âncora pura — nunca bloqueada por popup blockers, igual aos outros links de ficha). O comportamento "ainda navega na mesma guia" descrito pelo usuário provavelmente era bundle antigo em produção (Vercel demorando/cached) — após push, usuários devem **aguardar o deploy e fazer hard refresh (Ctrl+Shift+R)**. `inspectCharacter` segue no contexto (uso legítimo no AppShell: seletor de herói inspecionado; banner de modo inspeção).
- Links de "Editar Ficha" (NPC no Ameaças & Heróis) e "Editar" (catálogo /admin/npcs) agora `target="_blank" rel="noreferrer"` — monstros em abas próprias (3 esqueletos = 3 abas `/admin/npcs/<id>`).
- `inspectCharacter` permanece no contexto (não removido; sem uso externo restante no Ameaças & Heróis).
- Verificado: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). NÃO conferido no navegador. NÃO commitado.

## ✅ 2026-11-17 (2) — Animação 3D WebGL do dado (rola com todos os lados) + d2 removido — commitado/pushado (Push 2026-11-17 (7))
- Pedido: "poderia fazer uma animação do dado em si rolando com todos os seus lados, e remover o d2". Depois: "de pus" (= commit e push). Estilo escolhido pelo usuário: **ado 3D real com Three.js**.
- **Removido d2**: DICE_TYPES=[4,6,8,10,12,20,100] (bandeja + dado físico), face SVG d2 (CARA/COROA), `.dice-coin`/`dice-coin-flip`/tumble CSS, JSDoc lib/dice.js.
- Novo `src/app/components/dice/Dice3D.jsx` (three 0.187, dependência adicionada): poliedros de verdade — d4 tetra / d6 cubo / d8 octa / d12 dodeca / d20 icosa (built-ins); **d10 = bipirâmide pentagonal** (a 1ª tentativa — trapezoedro com kites — NÃO era coplanar (desvio 0.39); corrigida por bipirâmide convexa, 10 faces isósceles); d12 lido como 3 tris/face com dedupe de vértices p/ centróide/normais/área. Números em cada face via `CanvasTexture` (Georgia 900, fill escuro + sombra clara — efeito gravado); corpo `MeshStandardMaterial` âmbar `--theme-accent` flatShading + `EdgesGeometry`. Queda com quique (`easeOutBounce`) + giro de ~2+ voltas desfeito por `slerp` (`easeInOutCubic`, 1.3s) até a face sorteada ficar virada p/ câmera (câmera 40° fov, fit por nº de dados, escala p/ 3+ dados). **d100 = par de bipirâmides** (dezenas 00–90 + unidades 0–9; 100 = "00"+"00"). Dados descartados (vantagem/desvantagem) = corpo cinza. `prefers-reduced-motion`/sem WebGL → fallback estático com `DiceFace` SVG.
- `DiceModal.jsx`: stage `.dice-roll-stage` preservado; `<DiceRoll3D roll={lastRoll}/>` no lugar dos dados CSS 2D; caption "d100 · Percentil" para percentile.
- `globals.css`: bloco `.dice-roll-*` reescrito p/ o palco 3D (stage, aura + variante crítico, caption, `.dice-3d-mount`, `.dice-static-die`, `.dice-roll-dice`, `.dice-roll-die-discarded`; keyframes de tumble/coin removidos).
- Geometrias verificadas em Node (7/7 tipos: contagem de faces exata, normais unitárias para fora, áreas>0). Verificado: testes **161/161**, build OK (30/30), lint **0 erros** (44 warnings pré-existentes). **NUNCA renderizado em navegador** — conferir visual (câmera, luzes, enquadramento, textures) em /personagem → rolar.
- Nada mais pendente exceto a conferência visual. Commitado e pushado (ver Push 2026-11-17 (7)).

## ✅ Push 2026-11-17 (6) — Comits separados: dados refeitos + skills + encontros + classes (2 repos)
- Pedido: "commite e ous" (= commit e push). Escopo validado pelo usuário: commits separados por assunto + push, excluindo `.github/workflows/` (PAT sem scope).
- **Frontend** (`main`): `02c243f` feat(dice) animação de rolagem refeita (DiceFace SVG por tipo + moeda d2) · `5cf9b11` chore(skills) audit-suite Orbit 1.1.0 + fe-rail sh5623 1.20.0 vendorizadas (.agents/skills + .github/skills + skills-lock.json, 165 arquivos) · `5d4eac3` feat(encontros) botões Finalizar Encontro (FinalizarEncounterModal: XP por herói, desfecho vitória/derrota/fuga, ações em lote; painel + header) · `01cc79f` feat(classes) hint no registro (classe criada entra no catálogo do mestre) + cadeado de remoção no /admin/classes (espelha guard 403).
- **Backend** `../Rpg-backend` (`main`): `22d5f26` feat(classes) findOrCreateClasseByNome — cadastro resolve/cria classe no catálogo global (testes 95/95) · `0a35fcb` feat(classes) remoção restrita ao criador (403 p/ seed/casas criadas via jogador) + criadoPor no payload.
- Verificado antes de commitar: front 161/161 + build OK + lint 0 erros; back 95/95.
- **Ainda pendente (operador)**: Manual Deploy do backend no Render (features de classe/catálogo valem em produção só após o deploy); UX do chooser/animação no navegador não conferida; `.github/workflows/` segue não rastreado (front e back).

## ✅ 2026-11-17 — Animação de rolagem de dados REFEITA (dados por tipo + moeda d2) — COMMITADA (02c243f)
- Pedido: "refaca a animacao de rolagem de dados"; direção escolhida pelo usuário: **vários dados, uma moeda para o d2**, mais d4, d6, d8, d10, d12, d20 e d100.
- **Causa-raiz encontrada**: o CSS antigo (`@layer components` em globals.css pré-rewrite) foi deletado em `231b39e` (out/26) — `.dice-roll-stage/.dice-cube/…` referenciados no DiceModal não existiam mais (animação invisível).
- Novo `src/app/components/dice/DiceFace.jsx`: SVG por tipo (viewBox 100×100, sem IDs de gradiente — flat + facetas `rgba(255,255,255,.x)`/`rgba(0,0,0,.x)` sobre `var(--theme-accent)`): d2 **moeda** (anel tracejado + CARA/COROA conforme face 1/2), d4 triângulo facetado, d6 **pips** 1-6 (fallback numeral), d8 losango, d10 e d100 kite (d100 fonte menor), d12 pentágono (externo+interno), d20 hexágono com wireframe (triângulos alternados). Texto em Cinzel, cor `--theme-accent-contrast`.
- `DiceModal.jsx`: `DiceRollAnimation` reescrito (stage novo, `data-crit="success|failure"` → glow esmeralda/rosa; die descartado em vantagem/desvantagem esmaecido; stagger `index*110ms`; tamanho do dado adaptativo para 4+/5+ dados; moeda usa `.dice-coin` (coin flip), demais `.dice-roll-die` + `dice-tumble-alt` ímpares; legenda "Moeda" para d2). `DICE_TYPES = [2,4,6,8,10,12,20,100]` (abas bandeja/físico, grids `sm:grid-cols-8`). JSDoc de `lib/dice.js` atualizado (lados inclui 2).
- `globals.css`: bloco novo `.dice-roll-*` + keyframes `dice-tumble`, `dice-tumble-alt`, `dice-coin-flip`, `dice-shadow-pulse` (aura pulsa no impacto); crítico reextra via drop-shadow no die e aura; `prefers-reduced-motion` respeitado.
- Verificado: testes **161/161**, build OK (30/30, CSS compilado), lint **0 erros** (44 warnings pré-existentes). UX no navegador AINDA não conferida (dev server parado) — abrir /personagem → rolar perícia e conferir todos os tipos.
- Commitado (`02c243f`) e incluído no push 2026-11-17 (6).

## ✅ 2026-11-17 — Plugins instalados como skills do projeto: audit-suite (Orbit v1.1.0) + fe-rail (sh5623 v1.20.0) — NÃO commitado
- Pedido: "instale este plugin audit-suite e este fe-rail". Escolha do usuário: **como skills do projeto** (não como plugins Claude Code — opencode não lê `.claude-plugin`; sem `claude` no PATH).
- Clone raso em /tmp: `Recusive/Orbit-plugin` (audit-suite 1.1.0, MIT — skills-only, zero deps) e `sh5623/fe-rail` (1.20.0, MIT). Varredura de segurança nos SKILL.md/scripts: **nenhuma** ocorrência de curl|sh, exfiltração ou leitura de segredos (gate-commands.mjs só LÊ package.json e imprime comandos — não executa).
- Vendorizadas **16 skills** do audit-suite (10 lentes `audit-as-*`, orquestrador `full-audit`, 5 referências: emil-design-engineering, vercel-react-best-practices, web-animation-design, web-design-guidelines, make-interfaces-feel-better) e **5 skills** do fe-rail (fe-spec, fe-build, fe-review, fe-start, fe-doc-sync — inclui `fe-start/scripts/gate-commands.mjs`, nunca executado nesta instalação).
- Copiadas para `.agents/skills/` **e espelhadas em `.github/skills/`** (convenção do projeto). `skills-lock.json` atualizado com as 21 entradas (source github, skillPath `skills/<nome>/SKILL.md`, computedHash = sha256 do SKILL.md vendorizado) — lock agora com 22 entries no total.
- **NÃO instalados (fora de escopo, por decisão do usuário)**: hooks shell e agentes Claude-Code-only do fe-rail (`hooks/*.sh` — guard, write-guard, config-protection, quality-gate, lint-fix, etc. — bloqueiam ações em sessões Claude Code); namespace de comandos `/fe-rail:*` não existe no opencode (skills invocáveis por nome: `fe-spec`, `fe-build`…). audit-suite não tem hooks.
- Ressalvas: skills em coreano no fe-rail; `vercel-react-best-practices` e `web-design-guidelines` duplicam (versões distintas) as que já existem em `~/.agents/skills/` (global); Orbit já aparece como reference skill do próprio full-audit — cópias locais do projeto garantem autocontenção.
- Limpeza: clones em /tmp/opencode/{orbit-plugin,fe-rail} podem ser removidos. Nada executado. Skills commitadas (`5cf9b11`) e incluídas no push 2026-11-17 (6).

## ✅ Re-verificação 2026-11-17 (sessão seguinte) — Dado físico: checklist já concluído e pushado
- Usuário reenviou o checklist do dado físico (item 1 [•], demais [ ]). Verificado: TODO o escopo (lib/dice.js manualRollResult + manual-roll.test.mjs; DiceContext requestRoll→Promise/resolveVirtualRoll/resolveManualRoll/executeManualRoll/cancelRollRequest, executeRoll/promptRoll/pendingTarget removidos; DiceModal RollChooser + aba "Dado Físico" + selo "Físico" + Cancelar; call sites migrados) já está no `main` pushado (`4bd15a8` feat(dice) + `fcd50d6`/`86636ff` docs) — `main...origin/main` sem ahead/behind.
- Re-verificado agora: testes **161/161** (18 suites), `npm run build` OK (páginas prerendered), `npm run lint` **0 erros** (44 warnings pré-existentes). Nenhum código alterado nesta sessão.
- Pendências do dado físico inalteradas: UX do chooser ainda não conferida no navegador (dev server parado).

## ✅ Push 2026-11-17 (5) — Dado físico (NÃO verificado no navegador)
- Pedido: "para cada rolamento, poderia colocar a opção de adicionar o valor manualmente, pois em alguns casos será usado o dado físico".
- **lib/dice.js**: novo `manualRollResult()` puro (valida faces 1..sides, vantagem/desvantagem kh1/kl1, críticos d20, fórmula idêntica à do virtual, `manual: true`); novo teste `manual-roll.test.mjs` (28 asserts) → suite 161.
- **DiceContext reescrito**: novo `requestRoll(config)` → Promise `result|null` — abre o modal em modo chooser (Normal/Vantagem/Desvantagem virtual OU seção "Usou o dado físico?" com inputs de faces). `resolveVirtualRoll`, `resolveManualRoll` (valida e retorna `{ok}|{ok:false,message}`), `executeManualRoll` (registro avulso na bandeja), `cancelRollRequest`/`closeModal` resolvem `null` (callers abortam limpo). `executeRoll`/`promptRoll`/`pendingTarget` REMOVIDOS — toda rolagem do jogo passa pelo chooser com opção física. Persist/log idênticos; battle log marca " (dado físico)" e `manual:true` no JSONB (payload do backend inalterado — schema strict).
- **DiceModal**: nova `RollChooser` (pré-rolagem: label/mod, 3 botões virtuais + seção âmbar expansível com modo Normal/Vantagem/Desvantagem, inputs por dado, validação inline, Cancelar) e aba permanente **"Dado Físico"** (sides/qtd/mod/label/modo/faces → registra avulso sem chooser). FaceInputs compartilhado (autoFocus, Enter confirma). Histórico e resultado exibem selo "Físico" e legenda "Valores informados do dado físico". Re-rolagem no resultado reabre o chooser.
- **Call sites migrados** (todos os rolamentos): personagem (subir de nível), DanoCuraPainel (cura com Dado de Vida), RecursosCombate (iniciativa ×2, enviar à mesa, Dado de Vida), Pericia, habilidades (sessão de treino; bug `naturalRoll`→`kept` corrigido), AbilityCard, LevelProgressionGrid, ui.js StatBox, inventario. Sites que consomem o resultado usam `await` e abortam em `null`.
- Verificação: front **161/161**, build 30/30, lint 0 erros (44 warnings pré-existentes, nenhum nos arquivos novos). Commitado e pushado: `4bd15a8` feat(dice) + `fcd50d6` docs(memory). UX do chooser ainda não verificada no navegador (dev server parado).

---


**Última Atualização**: 2026-11-17T16:30:00-03:00  
**Branch Atual**: `main`  
**Status**: REGRESSÃO DE SCROLL CORRIGIDA — allowNestedScroll (commit 88e5372, no main publicado) matou a roda do mouse; revertido e aplicados data-lenis-prevent nos 15 containers internos. Corrigido e commitado (923f890) e pushed. Anterior: Log de Batalha implementado de ponta a ponta (2 repos) — tabela log_batalha, ACL por campanha, visão do jogador no mapa tático + visão do mestre na Sala de Guerra. Build OK, front 148/148, back 63/63. Commitado e pushed nos 2 repos (front: banco cofre, log de batalha, fix scroll, docs; back: log_batalha). CI workflows SEGREGADAS localmente (PAT sem scope workflow). migration log-batalha APLICADA no Supabase em 2026-11-16 (log_batalha + 3 índices criados e verificados; sequelize_meta registrado).
**Anterior**: Removida a recomendação de classe no cadastro (`src/app/registro/page.jsx`): o `<datalist id="grimorium-classes">` (sugestões de `DEFAULT_CLASSES`) e o atributo `list` foram retirados do campo "Classe / Ocupação" (agora texto livre) e o import `DEFAULT_CLASSES` removido. Build OK, testes 159/159, eslint 0 erros (1 warning pré-existente). Commitado e pushado (d800e1e) — deploy automático da Vercel a partir do main.
**Anterior2**: Login em produção corrigido (trust proxy 04a2a5c + migrações prod). Mapa tático: bug da miniatura sumindo corrigido + ícones personalizáveis (e4b7eb9 back / 76243c7 front). Imagens do mapa: fix CORP (77cc96a). Fundo do mapa por sessão + URL externa commitado (c1c1365). Mandato autônomo "desenvolver até 17h": backend +26 testes (54/54: mapa_tatico ACL + security_auth), frontend +5 (145/145), refactor TOKEN_ICONS→lib/mapaTatico.js, skills `mapa-tatico` e `render-supabase-producao` (espelhadas), docs atualizados. Lote autônomo completo: 54/54 back, 145/145 front, build 31/31, lint 0 erros (42 warnings pré-existentes). text-[9px]→[10px] (54×); audit fix typescript-eslint; docs/COISAS/TROUBLESHOOTING/RUNBOOK atualizados; skills novas espelhadas. jwt.js hardening (timingSafeEqual, sem unsigned), sessão restaurada confia só em /auth/me, rpg_auth_user não persiste mais → 148/148. Tudo NÃO commitado (aguardar pedido de commit).

---

## ✅ Atualização 2026-11-16 (Inventário — modal de adicionar item)
- Pedido: modal para adicionar itens no inventário (formulário de item novo, escolhido pelo usuário).
- Novo `src/app/components/inventario/AddItemModal.jsx`: nome (obrigatório), quantidade, peso/unidade, perfil de uso opcional (corpo a corpo/à distância → durabilidade; mágico/consumível → cargas; consumível → efeito/duração/unidade). Padrão BankChestModal (Escape/backdrop fecha, autofocus, role=dialog, data-lenis-prevent).
- `CharacterContext.js`: `addItem(itemData)` agora aceita payload `{ name, qty, weight, use }` (retrocompatível sem args).
- `inventario/page.js`: botão "Novo Item" abre o modal; itens criados com perfil de uso já aparecem em "Usar & Consumir".
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-16 (Banco ↔ Inventário — ligação corrigida + seleção unidade a unidade)
- `depositToBank(slotIndex, itemId, qty)` / `withdrawFromBank(slotIndex, qty)`: depósito/saque **parcial** com clamp; `storedItem` no slot preserva o item inteiro (perfil `use`, peso, campos legados); saque devolve com id novo e qty da seleção; pilha restante mantém `qty/quantidade`.
- `BankChestModal.jsx` reescrito: seleção de item com destaque, **UnitPicker** (pips numerados clicáveis, 1..N unidade por unidade; entrada exata se pilha > 24) para depositar e devolver; slots antigos continuam compatíveis.
- Novo `src/app/components/ui/UnitPicker.jsx` (compartilhado, tema via --theme-accent).
- Atalho no Inventário: ícone de arquivo em cada linha abre `DepositToBankModal` (quantidade unidade a unidade + nº de espaços livres; deposita no 1º espaço vazio; avisa se cofre cheio). Banner de feedback na Mochila.
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-16 (Banco — campo simples de quantidade)
- A pedido do usuário, os pips do UnitPicker foram substituídos por **um único campo numérico**: "Quantidade que deseja deixar no banco" (depósito, nos dois modais) e "Quantidade que deseja retirar" (devolução); hint com o máximo; foco/seleciona o campo ao abrir; clamp 1..máx.
- `UnitPicker.jsx` e a pasta `components/ui/` removidos (sem uso).
- Build OK, testes 158/158, eslint limpo. NÃO commitado.

## ✅ Atualização 2026-11-16 (Dados fixos removidos + XP por encontro)
- **Zero dados fixos/demonstração**: `defaultData` (Geralt de Rívia) deletado; `createBlankCharacterData` é a única origem de fichas (HP unificado em 70 via `NEW_HERO_HP`); registro/admin/perfil/campanha exigem nome (e classe) informado pelo usuário; fallback "Aventureiro"/"Novo Herói"/"Novo Personagem"/"Novo contrato"/"Novo" eliminados (criação e exibição); "Mestre Garrick" no MarketItemModal → vendedor obrigatório; `schema.sql` sem bloco de seed comentado; Character model sem defaultValue "Novo Herói"; jwt sem fallback "Aventureiro". Testes backend atualizados (registro exige herói nomeado; 70/70). Frontend 158/158, build OK.
- **XP em encontros**: Sala de Guerra ganhou painel "Recompensa de XP" (`EncounterXpPanel.jsx`) — define XP por herói, mostra progresso de cada herói presente (Nv + barra até o próximo nível), botão "Distribuir XP" aplica a recompensa via `updateCharacterOnBackend` (xp/experiencia) e registra no log (tipo `recursos`); `dadosExtras.xpDistribuidoEm` marca distribuição (permite redistribuir com confirmação). Jogadores veem o progresso na XPBar da ficha (atualiza no próximo sync/refresh).
- Build OK, frontend 158/158, backend 70/70. NÃO commitado.

## ✅ Atualização 2026-11-16 (Raças + subida de nível com dado de vida)
- **Raças (clássicas D&D)** `src/lib/races.js`: Humano(+1 tudo), Elfo(+2 DES,+1 SAB), Anão(+2 CON,+1 FOR), Halfling(+2 DES,+1 CAR), Draconato(+2 FOR,+1 CAR), Gnomo(+2 INT,+1 CAR), Tiefling(+2 CAR,+1 INT), Orc(+2 FOR,+1 CON). Hit die vem da CLASSE (lib/classes.js), não da raça.
- **Criação**: registro (jogador) ganhou select de raça (obrigatória) + `AttributePointBuy` (27 pontos, base 8–15, bônus racial mostrado ao vivo; payload envia FOR..INT finais + race + hitDie). Quick-create do perfil idem (bônus sobre base 10; raça obrigatória). `personagem` (ficha) tem card "Raça & Ascensão" com select de raça (grava dadosExtras.race) + botão "Subir de Nível".
- **Subir de nível (jogador rola na ficha)**: exige XP suficiente (gate por `calculateLevelFromXP`), rola Dado de Vida da classe + Mod(CON) (mín. 1 HP), aumenta `hpMax` e `hp`, sobe `level`, loga no log de batalha (tipo recursos). `admin/personagens` (promoção individual/lote) faz a mesma rolagem por herói.
- **Backend**: register aceita atributos finais (clamp 1–30), `race` obrigatória para jogador, `hitDie` validado (`1d8` fallback); grava em `AtributosPersonagem` + `dadosExtras.race/hitDie`. Testes atualizados (70/70).
- Novos libs `races.js`/`leveling.js` + `races-leveling.test.mjs` (159/159 front). Build OK. NÃO commitado.

## ✅ Atualização 2026-11-16 (Dado de vida — mestre seta, jogador rola 1×/nível)
- Mestre seta o dado de vida: `/admin/personagens/[id]/ficha` (campo "Dado de vida") — antes era entrada livre; agora com datalist (1d4–1d20) e validação no save (regex), bloqueia gravação de formato inválido.
- Jogador rola 1× por nível: botão "Subir de Nível" na ficha (card Raça & Ascensão) — exige XP suficiente (gate por calculateLevelFromXP), rola dado de vida + Mod(CON) uma vez por nível e soma ao HP máximo/atual. Promoção em lote do admin também rola uma vez por nível por herói (sem clique extra). Fluxo único por nível garantido nas duas vias.
- Build OK, front 159/159, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-17 (Raça define status base e dado de vida)
- Mudança de design pedida pelo usuário: a RAÇA define os 7 status base (fixos por raça, soma ~80–82) e o DADO DE VIDA (Humano 1d8, Elfo 1d8, Anão 1d10, Halfling 1d6, Draconato 1d10, Gnomo 1d6, Tiefling 1d8, Orc 1d12). `lib/races.js` reescrito com `base` + `hitDie`; `AttributePointBuy` removido.
- Registro: sem point buy; preview ao vivo dos status e do dado de vida da raça; envia atributos base da raça + `hitDie` da raça. Quick-create do perfil idem. Ficha: select de raça apenas exibe (alterar não recalcula, hint exibido); `levelUp` continua rolando o hitDie de `dadosExtras.hitDie` (agora de origem racial).
- Classe não define mais dado de vida na criação (hitDie de classe permanece em lib/classes.js, apenas como referência legada).
- Testes atualizados (159/159), build OK, eslint 0 erros. NÃO commitado.

## ✅ Atualização 2026-11-17 (Subir de nível via rolador de dados)
- "Subir de Nível" agora usa o rolador de dados animado (`useDice().executeRoll`): modal/animação com o dado de vida (lados da raça) + modificador = bônus do dado + Mod(CON). O total já inclui o Mod(CON) e vira o HP ganho (mín. 1).
- `CharacterContext.levelUp` virou `applyLevelUp(gain, details)` — aplica o ganho pré-rolado pela UI (gate por XP continua, 1 rolagem/nível); rolagem vai para o log como tipo `rolagem` (via DiceContext) e a ascensão como `recursos`.
- `leveling.js` ganhou `levelUpGate(level, xp)` (compartilhado UI/contexto) — testes de gate cobertos (159/159). Build OK. NÃO commitado.

## 🔧 Atualização 2026-11-17 (NPC/criatura com atributos e habilidades iguais aos heróis) — NÃO commitado
- Pedido: cadastro de NPCs/criaturas igual ao dos jogadores: eles também têm status e habilidades.
- **Backend** (`../Rpg-backend`): `npcController.criar`/`atualizar` aceitam `atributos` ({FOR..INT} clamp 1–30; espelho curto/legenda + `attributes{}` em dados_extras) e `abilities` (array; ids UUID garantidos via crypto.randomUUID, monotarefa de aprovação do mestre `approvalStatus:"aprovada"`/`submittedBy:"mestre"`, máx. 60). Helpers `atributosParaExtras`/`abilitiesParaExtras`. Suíte back **79/79**.
- **Frontend**: novo `components/admin/NpcSheetBlocks.jsx` (`NpcAttributesCard` — grid 7 atributos com modificador ao vivo igual à ficha; `NpcAbilitiesCard` — habilidades no esquema do herói via AbilityFormModal em modo mestre, badge de aprovada, treino). Integrado em `/admin/npcs/new` (estados `atributos`/`abilities`, no payload) e `/admin/npcs/[id]` (lê/grava via dadosExtras; `atributosAtuais`/`abilitiesAtuais` entram no PUT). Duplicar NPC leva cartas junto (dadosExtras copiado). Ações & Golpes legado preservado (coexistem).
- Build OK, testes 159/159 front, eslint 0 erros. NÃO commitado.

## 🔧 Atualização 2026-11-17 (Brasas do mapa removidas) — NÃO commitado
- Pedido: "retire o efeito de brasas do mapa tático". Removido `<EmberCanvas />` e seu import do `/mapa-tatico`; componente `components/mapa/EmberCanvas.jsx` deletado (órfão). Build OK, testes 159/159, lint 0 erros (warnings pré-existentes). NÃO commitado.

## 🔧 Atualização 2026-11-17 (Mapa tático maior + adaptado à imagem) — NÃO commitado
- Pedido: "mapa tatico maior, que se adapte à imagem selecionada".
- `/mapa-tatico`: o canvas agora vive num wrap flex centralizado (`stageWrapRef`) e, quando há imagem de fundo (upload local ou URL/arquivo), o **palco assume a proporção exata da imagem** (`aspectRatio`) e é dimensionado para o maior retângulo que cabe no espaço disponível (ResizeObserver + `stageFit`; tokens são posicionados em %, então nada desloca). Sem imagem: preenche a área como antes. Altura útil do palco aumentada: `min-h-[calc(100vh-88px)]` → `calc(100vh-56px)`.
- Imagem carregada via `Image` para ler `naturalWidth/naturalHeight` (fallback silencioso: mantém tela cheia). 0 erros de lint (1 warning pré-existente + 1 do mesmo padrão set-state-in-effect). Build OK. NÃO commitado.

## 🔧 Atualização 2026-11-17 (Painel do mestre para habilidades dos jogadores) — NÃO commitado
- Novo `/admin/habilidades` ("Habilidades dos Heróis", Conselho do Mestre): lista heróis das campanhas do mestre via `listCharacters`, mostra contadores globais (pendentes/aprovadas/rejeitadas), filtro por abas (pendentes/aprovadas/rejeitadas/todas) + busca, cards de herói expansíveis (expande automático os com pendências) e botão "Aprovar todas (n)" por herói.
- Por habilidade: Aprovar (aprovarHabilidade), Rejeitar com justificativa inline (rejeitarHabilidade), Editar (AbilityFormModal em modo mestre — preserva status) — salva direto via `updateCharacterOnBackend(id, { dadosExtras: { abilities } })` (mesmo padrão do admin ficha; merge raso do backend substitui o array `abilities`). Feedback de salvo/erro com banner; `savingKey` por herói.
- Abilities vêm de `dadosExtras.abilities`; `isMaster` gate no AdminLayout existente; rota adicionada ao AppShell (MASTER_NAV_ITEMS, ícone Sparkles) após "Ameaças & Heróis". Reutiliza `STATUS_APROVACAO`/`TIPOS_HABILIDADE`/`calcularProgressoTreino` de lib/abilities. AbilityFormModal é puro em props (sem contexto).
- Build OK (`/admin/habilidades` prerendered), testes 159/159, eslint exit 0. NÃO commitado.

## 🔧 Atualização 2026-11-17 (Vida máxima inicial = valor do Dado de Vida) — NÃO commitado
- Pedido: "altere a vida máxima inicial para o valor do dado de vida".
- `lib/leveling.js`: novo helper puro `hitDieMax(hitDie, fallback=8)` (count×sides de parseHitDie).
- `CharacterContext.updateRace`: na 1ª escolha da raça + herói nível ≤ 1, `hp` e `hpMax` viram `hitDieMax(raca.hitDie)` (ex.: Anão→10, Orc→12). Heróis já acima do nível 1 NÃO têm a vida cortada. Base de atributos como antes; sync propaga.
- Fluxos que já aplicavam hit die no HP: register com raça (backend `hitDieMax`), quick-create do perfil, `characterController.create` com raceId. Placeholder pré-seleção continua 70 (`NEW_HERO_HP`) até a raça ser selada; convite auto-create idem.
- /personagem: hint do card de raça menciona vida máxima aplicada ao selecionar. Build OK, testes 159/159, eslint 0 erros (warnings pré-existentes). NÃO commitado.

## 🔧 Atualização 2026-11-17 (Raça: escolha única + trava por mestre) — NÃO commitado
- Pedido: "ao entrar no sistema, selecionar a raça apenas 1 vez; se escolhido errado, só o mestre pode alterar; após selecionar a raça, colocar o valor dos status nos status".
- **Backend** (`../Rpg-backend`): guard novo em `characterController` (`isMasterActor` + `raceGuardError`) no `update` e no `sync` — payload com raça diferente da atual de quem não é mestre → **403 "Apenas o mestre pode alterar a raça do herói."** Eco do estado do servidor (no-op) é liberado; primeira escolha do jogador liberada; mestre (perfil/role) altera/limpa livremente; limpar FK (`raceId:null`) zera também `dadosExtras.race` (sem fallback legado). Normalize payload inalterado (race slug → extras.race). Novo `test/raca_lock.test.js` (7 casos: player não troca/não limpa, eco sync permitido, primeira escolha, update player 403, mestre troca/limpa). Suíte **79/79**.
- **Frontend** (`Rpg-ficha`): `/personagem` (Raça & Ascensão) — select desabilitado após a 1ª escolha; hint "só o mestre pode alterar"; ao escolher, os status base da raça são aplicados (CharacterContext.updateRace — aplicado só na 1ª vez; depois é no-op; limpeza removida). `normalizeCharacterForSync` agora envia `race: dadosExtras.race` (slug) — garante persistência mesmo com fallback offline (raceId em formato de slug). Admin ficha do jogador (`/admin/personagens/[id]/ficha`) ganhou card "Raça (somente o mestre altera)" — select que aplica status base + hitDie ao salvar; "Sem raça" limpa. Build OK (28/28), testes 159/159, eslint 0 erros (warnings pré-existentes).
- **Não commitado** nos 2 repos; deploy backend no Render necessário para a trava valer em produção (até lá, só UI).

## 🔧 Atualização 2026-11-17 (Remoção TOTAL do envio/verificação de e-mail) — NÃO commitado
- Pedido do usuário: "retire tudo sobre envio de código e verificação por email" (incluiu reset de senha por e-mail, a skill email-api e drop de colunas no Supabase).
- **Backend** (`../Rpg-backend`, working tree): `src/services/mailer.js` DELETADO; controller `authController` sem register-com-verificação (registro voltou a emitir JWT/sessão e logar direto), sem bloqueio `EMAIL_NOT_VERIFIED` no login (flag `REQUIRE_EMAIL_VERIFICATION` extinta), endpoints `verify-email`, `verify-email-code`, `resend-verification`, `forgot-password`, `reset-password` REMOVIDOS (rotas + schemas zod correspondentes removidos); `User` sem `emailVerified/verification*/resetToken*`; `User.toJSON` simplificado; `revogarTodasSessoes` não é mais importado; `.env.example` sem seção de e-mail; `nodemailer` desinstalado; `password_changed_at` PRESERVADO.
- **Migration `20261117030000-remove-email-mail.js`** aplicada no Supabase via `npm run db:migrate` (idempotente): drop de `email_verified`, `verification_token_hash`, `verification_expires_at`, `verification_code_hash`, `verification_code_expires_at`, `verification_attempts`, `reset_token_hash`, `reset_token_expires_at`. Verificado: colunas sumiram de `usuarios`; sequelize_meta registra a migration.
- **Testes backend**: `test/mailer.test.js` e `test/verification_code.test.js` DELETADOS; `login_sync_integration` e `invite_flow` agora esperam `token` no register; `security_auth` sem `emailVerified`. Suíte **72/72**.
- **Frontend** (working tree): páginas `/verificar-email`, `/esqueci-senha`, `/redefinir-senha` DELETADAS; `api.js` sem `verifyEmailCodeOnBackend/verifyEmailOnBackend/resendVerificationOnBackend/forgotPasswordOnBackend/resetPasswordOnBackend`; `register` no AuthContext sem ramo `verify-email`; registro redireciona direto; login sem banner EMAIL_NOT_VERIFIED nem link "Esqueceu a senha?"; `AppShell` sem banner de verificação reenviável e sem `isEmailFlowRoute`; skill `email-api` (`.agents/skills/email-api` + `.github/skills/email-api`) DELETADA.
- **Docs**: INSTALACAO (bloco SMTP removido), AUDITORIA (marca reversão), SEGURANCA, RUNBOOK-PRODUCAO, TROUBLESHOOTING, REQUISITOS-ITENS-A-FAZER (1.2/1.3 REMOVIDAS), itens-a-fazer.md — atualizados.
- **Verificação**: front 159/159 testes, build 28/28 páginas, eslint 0 erros; back 72/72.
- **Não commitado** (2 repos). Deploy do backend no Render PENDENTE para a remoção valer em produção — até lá, produção (main) ainda tem o código de verificação (5aa7b65) enquanto o banco JÁ NÃO TEM as colunas → login/registro quebrariam se o deploy não subir. **Subir o backend no Render (Manual Deploy) o quanto antes.**

## 🔧 Atualização 2026-11-17 (Skill email-api + fortalecimento do código de verificação)
- **Skill `email-api`** criada e espelhada (`.agents/skills/email-api/SKILL.md` + `.github/skills/email-api/SKILL.md`): montagem de provedor (Resend/SMTP) do zero, fluxo do código de 6 dígitos, extensão para e-mails transacionais, checklist de segurança, verificação e troubleshooting de produção.
- **Fortalecimento do fluxo** (Rpg-backend, NÃO commitado): hash do código de 6 dígitos trocado de SHA-256 puro para **HMAC-SHA256** (`hashCodigo`, chave `EMAIL_CODE_SECRET || JWT_SECRET`); comparação timing-safe (`hashesIguais`); **limite de 5 tentativas por conta** (`VERIFICATION_MAX_ATTEMPTS`) com invalidação do código — migration `20261117020000-verification-attempts.js` (`verification_attempts smallint default 0`); `REQUIRE_EMAIL_VERIFICATION` agora é **lido de fato** (padrão true; antes era documentado mas ignorado — bloqueio era incondicional); `.env.example` corrigido; `User.toJSON`/`usuarioParaResposta` apagam `verificationAttempts`; sucesso no link legado/reset também limpa tentativas.
- **Testes**: novo `test/verification_code.test.js` (7 casos: HMAC≠SHA256, sucesso, lockout na 5ª tentativa + código certo deixa de valer, expiração, login com flag ausente→403 e flag=false→200). Suíte backend **81/81**.
- ⚠ **Produção (Supabase)**: a coluna `verification_attempts` foi aplicada e registrada via `npm run db:migrate` (sequelize_meta OK) — o .env local aponta para o pooler do Supabase; o runner foi idempotente. **Os commits/deploy do backend no Render ainda NÃO foram feitos** (o código novo — HMAC + lockout — só vale em produção após deploy; códigos emitidos antes da troca de hash invalidam, pedir reenvio).
- **Não commitado**: backend (mailer/authController/User/migration/testes) e a skill. Aguardar pedido do usuário para commitar/pushar.

## ✅ Push 2026-11-17 (3)
- `142ed96` (subir de nível via rolador de dados animado) enviado ao origin/main.

## ✅ Push 2026-11-17 (2)
- `06e285e` (raça define status base + dado de vida) + `1cf9f23` (docs memory) enviados.

## ✅ Push 2026-11-17
- `daa9eec` (seletor de raça sem traço + dado de vida validado) enviado ao origin/main.

## ✅ Push 2026-11-16 (3)
- Front `22e6d5f` (feat raças/nível) + `63fc6a5` (docs memory); back `506c9cd` (feat auth race/atributos) enviados.

## ✅ Push 2026-11-16 (2)
- Commits `b08ece0` (feat campo simples) e `b6e74ea` (docs memory) enviados ao origin/main.

## ✅ Push 2026-11-16
- Commits `4b5ab5d` (feat inventario/banco) e `cb68efc` (docs memory) enviados ao origin/main. `.github/workflows/ci.yml` segue untracked local (PAT sem scope workflow).

## ✅ Atualização 2026-11-16 (Inventário — modal de cadastro COMPLETO do item)
- `AddItemModal.jsx` reescrito como cadastro completo: nome*, descrição (textarea), categoria (CATEGORIAS_ITEM), raridade (RARIDADES, com badge colorido ao vivo), quantidade, peso, preço + moeda (MOEDAS), perfil de uso (durabilidade/cargas/efeito/duração).
- `CharacterContext.addItem` persiste `descricao`, `categoria`, `raridade`, `preco`, `moeda` (campos aditivos, retrocompatíveis). Perfil de uso e `storedItem` do banco preservam tudo.
- Mochila: linha do item mostra badge de raridade + categoria + preço (ex.: "1.200 PO") e tooltip com a descrição.
- Build OK, testes 158/158, eslint 0 erros. NÃO commitado.

## ✅ Concluído Nesta Sessão (S1 da auditoria)

| Item | Status |
|---|---|
| F-01/A-02: `bankPassword`/`bankPasswordHash` fora de todos os payloads (`publicCharacter`; `data.user`→subset; `includeUser` nunca seleciona `password`); endpoint `PUT /api/characters/:id/bank/password` (bcrypt, definir/remover senha personalizada por ficha) | ✅ verificado ao vivo |
| F-01: cofre abre com senha personalizada ou com a senha do login do dono; fallback `"133313"` removido; `tryUnlock` exige servidor; `defaultCharacter.js` limpo | ✅ verificado ao vivo |
| A-01: `resetCharacter` bloqueia sync (`skipSyncRef`); `targetId` sem fallback do personagem ativo; confirmação tipada "RESTAURAR"; `reloadFromCloud` reativa sync | ✅ |
| F-02: `/api/npcs?q=` com `[Op.and]` (posse + campanha + busca); notasMestre de outras campanhas não vazam | ✅ verificado ao vivo |
| F-03: `encontroSchema` com `tipo/ativo/inimigos/recursos/dadosExtras/novoEventoLog`; PUT /encontros/:id → 200 (combate salva) | ✅ verificado ao vivo |
| A-01/A-02: importação de backup com confirmação tipada "IMPORTAR", schema validado, restaura na ficha ativa (ids do arquivo descartados); `backup.test.mjs` atualizado | ✅ |

**Verificação**: front `npm test` 135/135, back `npm test` 17/17, `npm run build` OK, eslint 0 erros. Teste empírico em Postgres 16 descartável (Docker, removido ao final) — todos os cenários PASS (inclusive `sync` sem id recusado, herdado do trabalho anterior). obs: criar NPC sem campanha falha por `npcs.campanha_id NOT NULL` — isso é F-09 (S2, pendente); a migration `database/migrations/20261114130000-npc-campanha-nullable.js` já está no working tree.

---

## ✅ Concluído na Sessão Anterior (Remodelação visual)

## ✅ Concluído Nesta Sessão (Remodelação visual)

| Item | Status |
|---|---|
| Instalados `lenis` (scroll suave global), `gsap` e `@gsap/react` (SplitText livre desde GSAP 3.13) | ✅ |
| React Bits NÃO é pacote npm: componentes JS+Tailwind vendored em `src/components/react-bits/` (`Aurora`, `SplitText`, `ShinyText`, `SpotlightCard`) + README com atribuição; pasta excluída do ESLint | ✅ |
| Landing (`/`) remodelada: fundo vivo Aurora WebGL (âmbar/violeta), vinheta, headline SplitText com rise por palavras, CTA principal com ShinyText (hover), CTA final com ShinyText (view), seções com reveal GSAP ScrollTrigger, pilares Jogador/Mestre em SpotlightCard | ✅ |
| Login e Registro: `src/components/auth/AuthScaffold.jsx` — fundo Aurora + anel de runas gigante girando + entrada GSAP (emblema/card), gsap respeitando reduced-motion | ✅ |
| Lenis global via `src/components/SmoothScroll.jsx`, desativado em `prefers-reduced-motion` | ✅ |
| Fundo das páginas públicas: substituídas auroras multicoloridas por gradientes âmbar sutis (landing e AuthScaffold) após feedback do usuário | ✅ |
| Incidente resolvido: `src/` havia sumido do worktree (deleção externa, não deste trabalho); restaurado via `git checkout` de stash dangling `0c3d4ca` (04:54, pós-build) — todas as correções de bugs preservadas | ✅ |

---

## 📌 Contexto
- **Stack visual**: Next 16/App Router, Tailwind v4, Aurora WebGL2, GSAP/ScrollTrigger, Lenis (lenis/react), React Bits vendored (variantes JS-TW).
- **Regras**: componentes React Bits mantêm código original e ficam FORA do lint; `prefers-reduced-motion` respeitado globalmente (Lenis, AuthScaffold, useGSAP de sections).
- **Build**: `npm run build` OK; `npm run lint` 2 erros + 40 warnings (todos pré-existentes); testes libs 134/135 (única falha: `themes.test.mjs`, pré-existente no HEAD).

## ⚠️ Pendências / Avisos
- Visual ainda não verificado por screenshot (sem browser no ambiente); rotas responderam 200 no dev server; recomendável abrir no navegador.
- TiltedCard foi descartado (não combina com conteúdo interativo do showcase); pode adicionar depois em superfícies estáticas.
- Dados demo no Supabase ainda precisam de limpeza one-time (decisão pendente do usuário).
- `.opencode/` não rastreado, não commitar sem revisão. Nada foi commitado nesta sessão.

## 📋 Checklist de Continuidade
- [x] Itens S1 da auditoria
- [x] Itens S2 (F-04..F-10) — verificados ao vivo (Postgres 16 descartável)
- [x] S3/S4 (F-11..F-15, A-09..A-17 exceto A-12/A-13 parciais)
- [x] Conta: e-mail de verificação + redefinição (revoga JWT)
- [x] Ficha: BP/nível, CA absorve dano, dado de vida→HP máx, PE máx, montarias
- [x] Mestre: nível individual/lote, iniciativa→Sala de Guerra, compartilhar fichas/NPCs
- [x] Interface: vitalidade na navbar, temas claros AA/AAA + tema mist, 270 hex→tokens
- [x] COISAS-A-FAZER lote 1/2: docs completas, exports CSV, rolagens, uploads seguros, sessões server-side (logout/reset revogam), migrações novas (rolagens/arquivos/índices/cenario), backup+restore testados, CI nos 2 repos
- [ ] COISAS-A-FAZER lote 2: Google API real (bloqueado por credenciais do operador), E2E/a11y/mobile (sem browser), cookies HTTP-only, A-12/A-13 parciais
- [ ] Deploy do backend no Render (operador); limpeza dos dados demo (decisão pendente)
- [ ] Revisar visual no navegador; nada foi commitado ainda

## Próximo passo recomendado
Abrir `/`, `/login` e `/registro` no navegador com o backend local, revisar o visual com o usuário e, se aprovado, considerar commitar em conjunto com os fixes de bugs do itens-a-fazer.

## ✅ Atualização (Skill File Economy)
- Criada skill **file-economy** (`.agents/skills/file-economy/SKILL.md`, espelhada em `.github/skills/file-economy/SKILL.md`): protocolo de economia de acesso a arquivos/tokens — escada Glob→Grep→Read estreito, zonas proibidas (node_modules, lockfiles, .next), orçamento de leitura, cache mental e delegação a subagentes. Complementa `token-optimizer`.

## ✅ Atualização (Agente QA Judge)
- Criado agente **qa-judge** (Tribunal de Qualidade): `.github/agents/qa-judge.agent.md` (GitHub) + `.opencode/agent/qa-judge.md` (OpenCode, `mode: subagent`, `edit: deny`) + memória `.agents/memory/qa-judge.md` + referência em `AGENTS.md`.
- Rubrica: Responsividade 25% · Beleza/coerência 25% · Falhas/robustez 40% · Acessibilidade 10%. Veredictos APROVADO/APROVADO COM RESSALVAS/REPROVADO; severidade S1–S4; saída padronizada; não corrige código (delega ao especialista).

## ✅ Atualização (Auditoria do Sistema)
- Relatório `docs/AUDITORIA-SISTEMA-2026-11-14.md`: inventário + achados F-01…F-15 (backend) e A-01…A-17 (frontend) com severidade S1–S4 e file:line; 5 achados verificados em Postgres local (container `rpg_ficha_test`, removido ao final): vazamento de bankPassword em todo payload, vazamento de NPCs/notasMestre via `?q=` (escopo perdido por sobrescrita de Op.or), PUT /encontros/:id e criação de sessão sempre 422 (zod), sync sem id sobrescrevendo ficha mais recente.
- Top-10 de prioridades definido; sugestão de ataque em 4 fases (S1 → contrato/schema → persistência → higiene).
- Nenhuma correção de código aplicada (escopo desta demanda era mapear e achar falhas).

## ✅ Atualização (itens-a-fazer)
- Achados da auditoria incorporados a `itens-a-fazer.md` na seção "Auditoria do sistema (2026-11-14)": 6 itens S1, 12 S2, 13 S3, 2 S4 — cada um referenciando o ID do achado (F-xx/A-xx) e o doc `docs/AUDITORIA-SISTEMA-2026-11-14.md`.

## ✅ Atualização 2026-11-16 (Fix fundo do login)
- Causa-raiz das "barras pretas" no /login (inexistentes no /registro): as duas telas usam `AuthScaffold`, mas a camada de fundo era `absolute inset-0` — cobria apenas a altura do cartão. O cartão do registro é alto e preenche a viewport; o do login é curto, sobrava o fundo quase preto do body acima/abaixo.
- Fix: `src/components/auth/AuthScaffold.jsx` — camada de fundo ("Camada de fundo viva") de `absolute inset-0` para `fixed inset-0` (ancora na viewport, como `background-attachment: fixed` do body). Beneficia também `/esqueci-senha`, `/redefinir-senha` e `/verificar-email`.
- eslint limpo no arquivo. NÃO commitado. Recomendação: conferir /login no navegador.

## ✅ Atualização 2026-11-16 (Banco — botão Sair)
- Pedido do usuário: no Banco de Glenor, substituir o bloco "Senha personalizada" por apenas um botão de sair.
- `src/app/components/banco/BankUnlockedView.jsx`: header agora só tem `SectionHeader` + botão "Sair" (`LogOut`, `onLogout` = fechar cofre). Removidos form/feedback de senha e prop `characterId` (também no pai `src/app/banco/page.jsx`).
- `setBankPasswordOnBackend` (lib/api.js) e o endpoint backend `PUT /api/characters/:id/bank/password` permanecem intactos (capability preservada no servidor; só a UI foi removida).
- eslint limpo. NÃO commitado.

## ✅ Atualização 2026-11-16 (Banco — modal depositar/retirar)
- Pedido: clicar num espaço do banco abre modal listando o inventário e move o item para o cofre.
- `CharacterContext.js`: novos métodos `depositToBank(slotIndex, inventoryItemId)` e `withdrawFromBank(slotIndex)` — atômicos em um único `setData`; slot passa a guardar `{ item, qty, weight }` (retrocompatível: slots antigos só têm `item`).
- Novo `src/app/components/banco/BankChestModal.jsx`: slot vazio → busca + lista do inventário ("Guardar" move o item, removendo-o do inventário); slot ocupado → mostra item e "Devolver ao Inventário".
- `BankSlot.jsx`: window.prompt removido; exibe `nome ×qty`; clique abre o modal. `BankSlotGrid.jsx`: prop `onSlotClick`. `BankUnlockedView.jsx`: gerencia `activeSlot` e renderiza o modal. `banco/page.jsx`: conecta `data.inventory` + callbacks.
- Build OK, testes 148/148, eslint limpo. NÃO commitado.

## ✅ Atualização 2026-11-16 (Log de Batalha)

Pedido do usuário: log de batalha que persiste TODAS as ações de jogadores e do mestre durante a batalha. Escolhas validadas: rolagens+dano/cura+iniciativa+ações do mestre; jogador também vê o log; nova tabela `log_batalha` (não JSONB).

**Backend `../Rpg-backend`**:
- `models/LogBatalha.js` + migration `database/migrations/20261116000000-log-batalha.js` (PK uuid, FKs encontro/campanha ON DELETE CASCADE, usuario SET NULL, FK papel CHECK, índice (encontro_id, created_at ASC)). Aplicada e verificada em Postgres 16 descartável (Docker) — **produção (Supabase) NÃO migrada** (decisão de deploy).
- `services/batalhaLog.js`: `registrarEventoBatalha` (nunca derruba a requisição; rodada = combatRound do encontro), `resolverEncontroParaLog` (encontroId explícito → ativo mais recente → mais recente), `resolverCampanhasPermitidas` (suporta `campanhaId="ativa"` como o fluxo de iniciativa), `serializeBatalhaLogEntry`.
- `controllers/batalhaLogController.js`: GET `/campanhas/:id/batalha/log?encontroId=&limit=` (membro ativo lê; 403 fora da mesa; DESC→reverso ASC) e POST idem (membro registra; tipos reservados `turno`/`encontro`/`recursos` exigem posse da mesa → 403 para jogadores).
- `encontroController`: criar→ evento `encontro`; `atualizar` espelha `novoEventoLog` no log com `tipoEventoLog` (schema aceita o enum); `receberIniciativaFicha` grava evento `iniciativa` (papel mestre se dono da mesa).
- Rotas em `campanhaRoutes.js` (montadas em `/api/campanhas` e `/api/campanha`).
- Backwards-compat total: zod não-strict descarta tipoEventoLog em backends antigos; logHistorico mantido.
- Testes: 9 novos (`test/log_batalha.test.js`) → 63/63 verdes.

**Front `Rpg-ficha`**:
- `lib/api.js`: `listBattleLog(campId, { encontroId, limit })`, `postBattleLogEvent`.
- `lib/battleLog.js`: metas (tipos/papéis, cores) + `normalizeLegacyBattleLogEntry` (fallback logHistorico).
- `components/batalha/BattleLogPanel.jsx`: visão de log compartilhada (jogadores e mestre) — polling 5s, auto-scroll, rodada/hora/autor/papel/tipo; `BattleLogEntryRow` exportado p/ Sala de Guerra. Auto-detecta campanha se prop ausente.
- `DiceContext`: toda rolagem com ficha vinculada à mesa posta evento `rolagem` (silêncio fora de combate).
- `DanoCuraPainel`: dano (com absorção CA), cura, cura total e Dado de Vida postam eventos `dano`/`cura` com PV antes/depois.
- `admin/encontros/page.js`: painel "Histórico de Alterações" lê o log do servidor (fallback legado), badges de papel/tipo, polling 5s, `tipoEventoLog` por ação (entrada/dano/cura/condicao/iniciativa/turno).
- `mapa-tatico/page.js`: widget **Log da Batalha** (todos os papéis) injetando `selectedCampaignId`.
- Build 31/31, testes 148/148, lint 0 erros (warnings restantes são da classe pré-existente de fetch-em-effect).

**Verificar no navegador**: abrir `/mapa-tatico` como jogador e mestre, rolar dados, tomar dano, avançar turno — eventos devem aparecer em ~5s nos dois painéis.

## ✅ Atualização 2026-11-16 (Fix scroll)
- Sintoma: em alguns pontos o scroll não funcionava (painéis do mapa tático, modais, listas internas).
- Causa: Lenis root com `smoothWheel` interceptava todos os wheel events e dava preventDefault — containers `overflow-y-auto` internos ficavam sem scroll nativo.
- Fix: `allowNestedScroll: true` em `src/components/SmoothScroll.jsx` — Lenis cede o scroll aos descendants scrolláveis sob o cursor e reassume na borda (scroll chaining para a página).
- Build OK (31/31), lint 0 erros. NÃO commitado. Verificar no navegador: rolar listas do mapa-tatico e modais com o wheel.

## ✅ Atualização 2026-11-16 (Regressão da roda do scroll — corrigida)
- Relato pós-push: "a roda de rolagem não está funcionando mais no site" (culpa do commit 88e5372 / allowNestedScroll).
- Fix definitivo: revertido `allowNestedScroll` em `SmoothScroll.jsx` (site volta ao comportamento anterior — página volta a rolar) + `data-lenis-prevent` (atributo oficial do Lenis) injetado nos 15 containers internos `overflow-y-auto`/`overflow-auto` (mapa tático, FloatingWindow, modais, log de batalha, encontros).
- Comportamento: sobre containers marcados, Lenis ignora o wheel → scroll nativo funciona dentro; fora deles, a página rola como antes.
- Build OK 31/31, lint 0 erros. Commitado como 923f890 e pushed.

## ✅ Atualização 2026-11-16 (Consumo automático de itens)
- Pedido: cálculo automático de consumo — atacar com arma/arco, cargas, durabilidade, duração de poções.
- Decisões: mecânicas = 4 (munição automática, cargas/usos, durabilidade, duração de poções); config = painel dedicado "Usar & Consumir" na ficha (/inventario); efeitos de poção = lista "Efeitos Ativos" na ficha; gatilho = botão de dados do item + botão Atacar/Usar no painel.
- `src/lib/items.js` (novo): `applyItemUse` puro (consome munição detectada/vinculada, cargas, durabilidade com quebra em 0, cria activeEffect com duração) + `tickActiveEffects`. Testes: 10 novos (items.test.mjs) → 158/158.
- `CharacterContext`: `configureItemUse`, `consumeItem`, `tickActiveEffect`, `advanceRoundEffects` (Rodada +1 em todos de rodadas, expira e loga), `removeActiveEffect`. Efeitos ativos em `data.dadosExtras.activeEffects` (round-trip pela sync existente, sem migration). Postam battle log tipo `recursos` ("Usou X", "Flecha consumida (11 rest.)", "Efeito Y expirou").
- `/inventario`: 2 cards novos — "Efeitos Ativos" (lista com −1, Rodada +1, remover) e "Usar & Consumir" (configurar perfil por item: tipo arma/à distância/consumível/mágico; munição vinculada; cargas; durabilidade; efeito+duração; botão Atacar/Usar; gatilho no dado do item também consome). Containers com data-lenis-prevent.
- Build OK 31/31, lint 0 erros. Commitado (ed36c11) e pushed.

## ✅ Atualização 2026-11-16 (Linter Supabase — ajustes aplicados)
- Diagnóstico read-only no Supabase: 5 tabelas public sem RLS (arquivos, log_batalha, mapa_tatico, rolagens, sequelize_meta); 13 FKs de tabelas da aplicação sem índice de cobertura; 4 índices exatamente duplicados (auditoria_usuario_idx, auditoria_campanha_idx, mapa_tatico_campanha_idx, sessoes_jogo_campanha_idx); grant padrão anon/authenticated/service_role em tudo (175 cada).
- Criada migration `20261116100000-supabase-linter-ajustes.js` e APLICADA no Supabase (up): RLS enabled nas 5 tabelas (backend Express usa role postgres = bypassrls → zero impacto), 13 índices de FK criados, 4 duplicados removidos. Verificação ao vivo: 0 tabelas public sem RLS, 13/13 índices, duplicados sumiram, sequelize_meta registrado.
- NÃO tocados: auth.* e storage.* (gerenciados pelo Supabase), índices só parcialmente duplicados (predicados diferentes), tabelas legado sem uso (todas com 0 linhas — candidata a limpeza futura, destrutivo demais p/ esta missão; NÃO dropar sem decisão do operador).
- Health/ready da API de produção OK; testes back 63/63.
- Migration commitada e pushed (c0ec3e0 backend).

## ✅ Atualização 2026-11-16 (Rename Banco)
- Pedido do usuário: renomear "Banco de Glenor" para "Banco de Azedarack" (as vezes grafado "lenor").
- Alteradas todas as ocorrências do banco: `src/app/page.js` (landing), `banco/page.jsx` (comentário), `BankLockedView.jsx`, `BankUnlockedView.jsx`, `BankChestModal.jsx` (comentário + "Cofre de Azedarack"), `constants.js` (bankTitle, não mais referenciado em lugar nenhum).
- "Crônicas de Glenor" no placeholder de admin/campanhas também trocado para "Crônicas de Azedarack: O Eclipse de Sangue" (pedido seguinte do usuário). Backend sem ocorrências.
- Commitado e pushed junto com COISAS-A-FAZER.md (seção 6: Google → "permitir criar conta de maneira dinamica com um email") a pedido do usuário. `.github/workflows/` NÃO incluída (CI segregada localmente por falta de scope do PAT).

## ✅ Atualização 2026-11-16 (Limpeza total do banco Supabase — PRODUÇÃO)
- Pedido do usuário (com confirmação solene em 3 etapas): apagar TODOS os dados do banco de produção (Supabase pooler, db `postgres`).
- pg_dump prévio gerado: `/tmp/opencode/backup-pre-purge-2026-11-16.dump` (120 KB, chmod 600, custom format, schema public — contém hashes de senha; manter em local seguro ou apagar).
- Executado `TRUNCATE ... RESTART IDENTITY CASCADE` em TODAS as tabelas public, EXCETO `sequelize_meta` (10) e `SequelizeMeta` (1) (histórico de migrações preservado). Verificado ao vivo: count=0 em todas as demais; migrations intactas.
- auth.* e storage.* já estavam vazios (verificado antes). Uploads em disco (private_uploads) não são apagados por este procedimento.
- Todos os 10 usuários/13 personagens/1 campanha foram apagados; sessões invalidadas — app volta a exigir registro do zero.
- `/tmp/opencode/dburl.txt` removido (continha a connection string).

## ✅ Atualização 2026-11-16 (Mercado do Mundo → banco; dados mockados removidos)
- Pedido do usuário: "não existam mais dados mockados, e sim que puxem tudo do banco". Escopo aprovado: Mercado do Mundo + 2 extras (NPC placeholder do /admin; seed.js demo).
- BACKEND `../Rpg-backend`: novas tabelas `mercado_vendedores` e `mercado_itens` (migration `20261116170000-mercado.js`, RLS enabled, índices FK; criado_por_id por mestre, sem FK item→vendedor — formulário aceita vendedor em texto livre). Models `MercadoVendedor`/`MercadoItem`; schemas zod strict; controller `mercadoController` (listar/criar/atualizar/remover, owner-scoped 404 para não-dono); rotas `/api/mercado/{vendedores,itens}` atrás de authMiddleware+requireMaster; montado em server.js. `database/seed.js` DELETADO e script `db:seed` removido do package.json (COISAS-A-FAZER-BACKEND.md atualizado).
- Migration APLICADA no Supabase (produção) via `node database/migrate.js` (todas as incrementais re-aplicadas idempotentemente; sequelize_meta registrado; RLS verificado t/t).
- FRONTEND: `/admin/mercado` reescrito para persistir no banco (list no mount; create/update/delete via API; estoque com atualização otimista + reconciliação; botão "Restaurar Catálogo Padrão" e localStorage removidos; banners de erro/loading). `api.js`: 8 novas funções market CRUD + comentário atualizado. `src/lib/market.js`: VENDEDORES_PADRAO e DEFAULT_MARKET_ITEMS REMOVIDOS (restam REGIOES_CANONICAS/CATEGORIAS/RARIDADES/MOEDAS + funções puras). `/admin/page.js`: defaultTable.npcs agora `[]` (NPC placeholder removido). `market.test.mjs` ajustado (158/158). api.js comment atualizado. lint limpo; build 31/31.
- Verificado end-to-end em Postgres 16 descartável (Docker, container removido ao final): migrations do zero OK; registro jogador cria ficha; registro MESTRE NÃO cria ficha (characters undefined); CRUD mercado OK; outro mestre → 404 em item/vendedor alheio; DECIMAL volta como string→convertido para number no serializer.
- ATENÇÃO: nada commitado. Backend precisa ser DEPLOYADO (Render) para /api/mercado e o fix de registro de mestre valerem em produção; frontend na Vercel na sequência. `.github/workflows/` permanece local (PAT sem scope).
- Detalhe: resposta de register de MESTRE agora omite `character` e retorna `characters: []`; frontend AuthContext já tolerava (chars=[]).

## ✅ Atualização 2026-11-16 (Commits e push do mercado)
- Commitado e pushed nos 2 repos (nada pendente de código): back `0d8da1b` fix(auth) registro de mestre sem ficha + `ce94916` feat(mercado) (tabelas/CRUD/RLS; Supabase já migrado); front `3dd84f6` feat(mercado) página conectada ao banco, `085ab95` chore(admin) placeholder removido, `cc3a4be` docs(memory).
- .github/ e .github/workflows/ permanecem não rastreados nos 2 repos (PAT sem scope workflow — push falharia).
- PRODUÇÃO ainda precisa de deploy do backend (Render) e frontend (Vercel) para /api/mercado e o fix de registro de mestre valerem ao vivo.

## ✅ Atualização 2026-11-16 (2ª limpeza total do banco Supabase — PRODUÇÃO, sem backup)
- Pedido do usuário: limpar novamente o banco, SEM backup (2 usuários/2 personagens criados desde a 1ª limpeza foram apagados mediante confirmação solene dupla).
- Mesmo procedimento da 1ª vez: TRUNCATE ... RESTART IDENTITY CASCADE em todas as tabelas public EXCETO sequelize_meta (11) e SequelizeMeta (1). Inclui as novas mercado_vendedores/mercado_itens. Verificado ao vivo: zero linhas em todas as demais tabelas; migrations intactas. auth.*/storage.* não tocados.
- Sem backup desta vez (decisão explícita do usuário).

## ✅ Atualização 2026-11-16 (Relatório simples do sistema)
- Pedido do usuário: "me faca um relatorio simples do sistema". Relatório apresentado no chat (stack, arquitetura, módulos, estado de produção/testes). Nenhum arquivo criado.

---

## 🔧 Atualização 2026-11-17 (Raças — vínculo por ID no cadastro e na ficha, tabela `racas`) — APLICADA EM PRODUÇÃO (2026-11-17)

### Pedido
Criar tabela de raças no banco; selects de raça passam a enviar o ID da raça; atribuir à ficha.

### Backend (Rpg-backend) — NÃO commitado
- Migration `database/migrations/20261117000000-racas.js`: tabela `racas` (PK uuid `gen_random_uuid()`, `slug` unique, `nome`, `dado_de_vida`, 7 atributos `smallint` CHECK 1-30, `traco`, `ordem`); seed idempotente das 8 raças; `personagens.raca_id uuid FK → racas(id) ON DELETE SET NULL` + índice; backfill por `dados_extras->>race`; RLS habilitada. `down()` remove coluna e tabela.
- Validada em banco local `localhost:5432/rpg_ficha` (up 8 raças + backfill 3 fichas por slug; down limpo; re-up idempotente). Registro local no `sequelize_meta`. ATENÇÃO: Supabase de produção AINDA NÃO recebeu a migração.
- Novo modelo `Race.js`; `models/index.js` registra associações (`Character belongsTo Race as "raca"`); `Character` ganhou `racaId` (field `raca_id`).
- `services/racaService.js`: `resolveRaca()` aceita `raceId` (uuid) ou slug legado.
- Rotas públicas `GET /api/racas` e `GET /api/racas/:id` (`racasRoutes.js`, `racasController.js`) — o cadastro é público e precisa da lista.
- `authController.register`: resolve a raça no banco; grava `raca_id` e espelha `dados_extras.race/hitDie` (antes validava só a presença da string).
- `characterController` (create/update/sync): mesma resolução; `racaExtras()` espelha slug/hitDie e grava FK; `normalizeCharacterPayload` aceita `raceId`; `includeRaca` nas consultas; `publicCharacter` expõe `raceId`/`race`/`raceName`/`hitDie` via FK (fallback dados_extras).
- `registroSchema`/`fichaSchema`: campos `raceId`/`race` aceitos.
- Testes: 72/72 PASS (mocks de `Race` adicionados em `login_sync_integration` e `invite_flow`).

### Frontend (Rpg-ficha) — NÃO commitado
- `lib/api.js`: `listRaces()` pública; `registerUser` envia `raceId`.
- `registro/page.jsx`: lista raças via API com fallback `DEFAULT_RACES` (aviso não-bloqueante); select controlado enviando `raceId`/`race`; preview lê da lista carregada.
- `perfil/page.js`: idem (quick-create).
- `personagem/page.js`: select da ficha carrega raças da API; `updateRace()` no `CharacterContext` grava `raceId` top-level + `dadosExtras { race slug, hitDie }`; sync (debounce) propaga o FK ao backend.
- Build OK (31/31), testes 159/159, lint 0 erros (warnings pré-existentes).

### Próximos passos
1. Commitar nos 2 repos quando o usuário pedir.
2. ✅ Migração `20261117000000-racas.js` APLICADA no Supabase de produção em 2026-11-17 (`npm run db:migrate`: 8 raças seedadas, `personagens.raca_id` criada, backfill vinculou a ficha 'sas' → Humano; sequelize_meta registrado). Falta apenas o deploy do backend (Render) a partir do main `8992ce4` para expor `/api/racas` e aceitar `raceId`.
3. Deploy frontend Vercel automático a partir do main após commit.

## 🔧 Atualização 2026-11-17 (Raça movida para a ficha)
- Pedido: "ao invés de escolher a raça no cadastro, faça um campo onde o jogador poderá selecionar a raça" + "vida base inicial = máximo do Dado de Vida".
- Raça NÃO obrigatória no registro nem na criação rápida do perfil; o jogador escolhe/troca na ficha (`/personagem`, card "Raça & Ascensão"), onde grava `raca_id` (FK → `racas`) e espelha `dadosExtras.race`/`hitDie`.
- HP inicial na criação passa a ser `hitDieMax(dadoDeVida)` quando há raça (ex.: Elfo→8, Orc→12); sem raça, 70. Backend (`4ca0914`) e perfil (`66f7a65`, `parseHitDie`).
- Migração `20261117000000-racas.js` APLICADA no Supabase (2026-11-17): tabela `racas` seedada, `personagens.raca_id` criada, backfill `sas`→Humano; fichas criadas hoje (`sas`→Anão, `sas1`→Gnomo) já vinculadas.
- ⚠ Deploy do backend (Render) PENDENTE: precisa subir `4ca0914` (inclui `8992ce4`: `/api/racas`, vínculo por FK). Sem esse deploy, o vínculo por FK não acontece e `/api/racas` não existe em produção.

## 🔧 Atualização 2026-11-17 (Verificação de e-mail por CÓDIGO)
- Pedido: implementar verificação de e-mail por código antes do 1º login (o registro não deve mais logar 1ª vez), senhas coincidem no cadastro, status base da raça na ficha e HP do dado de vida.
- Backend (`5faaebf`): registro gera código de 6 dígitos (hash SHA-256, expira 15min), grava `verification_code_hash/expires_at` nos novos campos; e-mail enviado inclui o código e link alternativo; `POST /api/auth/verify-email-code` valida; `login` bloqueia com `403 EMAIL_NOT_VERIFIED` até verificar; `register` não emite JWT; senhas verificadas (confirmPassword) no schema; resposta pública de usuário sanitizada (sem hashes/tokens). Migration `20261117010000-verification-code.js` aplicada no Supabase.
- Frontend (`11bfd95`): registro envia `confirmPassword` e nunca loga automaticamente; pós-cadastro redireciona para `/verificar-email?email=...` (aceita código + reenvio; mantém link legado); login mostrar link para página de código em `403 EMAIL_NOT_VERIFIED`; ficha aplica status base da raça na 1ª seleção (`updateRace`).
- Testes: back 72/72, front 159/159, build 31/31, lint 0 erros.

## 🔧 Atualização 2026-11-17 (Resend + fix sync sem raça)
- Commits Rpg-backend: `3a35a2a` (Resend no mailer.js: EMAIL_PROVIDER=resend + RESEND_API_KEY, HTTP API; SMTP fallback; testes unitários; .env.example), `9107f3f` (fix do sync sem raça: hasRaceInput + nullable() em race; null/vazio = "sem raça", corrige "status param de salvar").
- Falta deploy no Render (Manual Deploy) para as 3 camadas do backend subirem em produção: Resend, verificação de código, fix de sync.
- O e-mail em produção só funcionará com EMAIL_PROVIDER=resend + RESEND_API_KEY + SMTP_FROM no Render e FRONTEND_URL apontando para o Vercel.

## ✅ Push 2026-11-17 (4)
- `60ad3da` (back: catálogo de classes + guard 403 + migration) e `77a10a1` (front: raça aditiva + classe como dado de vida) enviados ao origin/main; `36a812c` docs(memory). Migration aplicada no Supabase antes do push.
