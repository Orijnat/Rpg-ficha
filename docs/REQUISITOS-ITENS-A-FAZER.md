# 📐 Requisitos — Itens a Fazer (Grimorium RPG)

Mapa de requisitos de cada item pendente de `itens-a-fazer.md` (2026-11-14),
com esforço estimado (**P** < 0.5 dia · **M** < 2 dias · **G** > 2 dias),
dependências e critérios de aceite. IDs `F-xx`/`A-xx` referem-se a
`docs/AUDITORIA-SISTEMA-2026-11-14.md`.

Legenda de estado: `[ ]` pendente · `[x]` implementado · `[~]` parcial · `[!]` bloqueado.

---

## 1. Conta e segurança

### 1.1 Senha da ficha = senha do login, ou personalizada por ficha `[x]`
- Regras: se há senha personalizada configurada para a ficha → valida ela (bcrypt); se não → valida a senha do login (`users.senha_hash`).
- Backend: `PUT /characters/:id/bank/password` (bcrypt gravado em `dadosExtras.bankPasswordHash`; hash nunca sai do servidor: `publicCharacter` remove); `verifyBankPassword` atualizado; senha vazia nunca válida; default `"133313"` eliminado.
- Frontend: campo "Senha do cofre" com ação "Definir/Alterar senha personalizada" e info "sem senha personalizada, usa a senha do login"; remover fallback local `bankInput === data.bankPassword` vazio.
- Aceite: personalizada → abre; sem personalizada → abre com a senha do login; `dadosExtras` não expõe o hash.

### 1.2 Verificação por e-mail — REMOVIDA (2026-11-17)
- O usuário pediu para remover todo o envio/verificação por e-mail. Código de 6 dígitos, links, `/verificar-email`, bloqueio `EMAIL_NOT_VERIFIED` e provedor (Resend/SMTP) não existem mais.

### 1.3 Pedir alteração de senha da conta via e-mail — REMOVIDA (2026-11-17)
- Removido junto com 1.2 (`/esqueci-senha`, `/redefinir-senha`, `forgot-password`/`reset-password`). Hoje a recuperação de senha exige um administrador.

## 2. Painel do Mestre

### 2.1 Mestre subir nível de cada ficha individualmente ou de todas da campanha `[x]`
- UI: botão "+ Nível" por ficha em `/admin/personagens` e/ou na ficha administrativa (`/admin/personagens/[id]/ficha`), e ação em lote "Subir nível de todas as fichas da campanha" (com confirmação e feedback por ficha).
- Backend: mestre já pode `PUT /characters/:id` (canManageCharacter). Endpoint em lote opcional `POST /campaigns/:id/level-up` (transação), ou loop no frontend reutilizando `updateCharacterOnBackend`.
- Aceite: XP/level sobem; personagens válidos atualizados; membros não participantes intocados; níveis 1–20.

### 2.2 Atribuir novamente o painel Perfil ao Mestre `[x]`
- Adicionar entrada "Perfil" (`/perfil`, ícone User) em `MASTER_NAV_ITEMS` (AppShell), com mesmo destaque de ativação das demais rotas.
- Aceite: mestre vê e acessa `/perfil`; jogador nada muda.

### 2.3 Compartilhar fichas de NPCs e heróis do Mestre com os jogadores `[~]` parcial
- Mestre: toggle "Compartilhar com a mesa" na ficha do NPC/herói (`dadosExtras.sharedWithPlayers: true`, persistido via `updateNpc`/`updateCharacterOnBackend`).
- Jogador: seção "Fichas compartilhadas pelo Mestre" em `/mundo` listando NPCs/heróis com `sharedWithPlayers` da campanha em que participa (consulta filtrada client-side sobre `listNpcs({campanhaId})` + `listCharacters(token)` visíveis ao membro).
- NPC compartilhado permanece read-only para o jogador.
- Aceite: jogador vê apenas fichas compartilhadas da própria mesa; mestre controla e revoga o compartilhamento.

### 2.4 Iniciativa do jogador enviada ao painel do Mestre (ordem de combate da mesa) `[x]`
- Encontro ativo: `POST /campanhas/:campanhaId/iniciativa/ficha` já existe (upserta combatente `pc-<id>`).
- Falta: espelhar na **Sala de Guerra** (admin/page.js): ao receber iniciativa via endpoint, o proprietário da campanha tem `users.dados_mestre.iniciativa` atualizado com o combatente (merge por id) — Sala de Guerra passa a exibir a iniciativa rola pelo jogador sem F5.
- Aceite: jogador usando o botão "Enviar iniciativa à mesa" aparece para o mestre na Sala de Guerra e no encontro ativo.

## 3. Ficha e regras

### 3.1 Bônus de proficiência (BP) por nível somado às perícias `[x]`
- Bandas: 1–4 → +2, 5–8 → +3, 9–12 → +4, 13–16 → +5, 17–20 → +6 (`calculateProficiencyBonusByLevel` já existe e está correta).
- Correção: `Pericia.jsx` chama `calculateSkillBonus(skill, data)` sem o 3º argumento → BP fixo +2 independentemente do nível. Passar `proficiencyBonus = calculateProficiencyBonusByLevel(data.level)`.
- Regra: perícia treinada soma `mod atributo + BP` (e bônus manual extra se houver); não treinada soma só o atributo (+ bônus manual).
- Aceite: personagem nível 6 treinado → +3 por perícia treinada; nível 17 → +6; o total das perícias reflete isso e a rolagem usa o mesmo total.

### 3.2 Adicionar CA (reduzir dano automaticamente) `[x]`
- Regra: dano recebido = max(1, danoBruto − CA) quando a "absorção por CA" estiver ligada.
- UI/integração: em `DanoCuraPainel` (painel Dano/Cura da ficha e da navbar), checkbox/toggle "Absorver pela CA (−N)" mostrando o valor atual de `dadosExtras.armorClass`; aplicado somente no dano (não na cura).
- Aceite: dano 10 com CA 14 aplicado → PV não diminui (mínimo 1 de dano); com toggle desligado, comportamento atual.

### 3.3 Rolar dado de vida → soma ao HP máximo após confirmação `[x]` (já implementado; confirmado)
- Fluxo: botão "Rolar Dado de Vida" (RecursosCombate) → rola Nd S + CON → modal de confirmação → HP máximo aumenta pelo resultado → HP atual sobe junto.
- Aceite: cancelar não altera nada; confirmar aumenta `hpMax` e `hp`.

### 3.4 Jogador poder editar o PE máximo `[x]` (já implementado; confirmado)
- `RecursosCombate` já permite editar `peMax` e `peCurrent` via `updExtra`. Sem trabalho adicional.

### 3.5 Montarias: criar, lista por jogador/ficha `[x]`
- Modelo: `dadosExtras.mounts: [{ id, name, species?, hp, hpMax, notes, alive }]`.
- UI: `/montaria` vira gerenciador: adicionar montaria (nome, espécie, PV), editar cada uma, marcar/ferir/matar ("morrer"), selecionar a montaria ativa; estados vazio (sem montaria) e lista com múltiplas.
- Compatibilidade: migrar `mountName/mountHP/mountHPMax/mountNotes` para a primeira entrada de `mounts` na leitura (fallback), preservando fichas existentes.
- Aceite: criar/editar/remover montarias persiste após reload; montaria morta pode ser marcada como "morta" ou removida; ficha antiga abre mostrando a montaria existente.

## 4. Interface

### 4.1 Mover a gestão de vitalidade para a navbar (botão próximo à vida) `[x]`
- Ação: remover o botão "Vitalidade" do sidebar (AppShell) — a navbar (Cabecalho) já possui barra de HP + botão Dano & Cura que abre `DanoCuraPainel` como popover/modal; renomear para "Gestão de Vitalidade" e posicionar junto à HP; limpar estado `vitalityOpen` do AppShell.
- Aceite: um único ponto de gestão de vitalidade na navbar; sidebar sem item solto; HP indicado na navbar abre o mesmo painel.

### 4.2 Ajustar as cores dos temas `[!]` — aguardando direcionamento
- `themes.js` hoje: 6 temas (amber, abyss, forest, parchment, sunlight, mist).
- Já tratado nesta remodelação: fundo das páginas públicas (âmbar escuro coerente).
- Pedido do usuário sem especificação — necessário indicar quais temas/cores ajustar.

---

## 5. Auditoria do sistema (docs/AUDITORIA-SISTEMA-2026-11-14.md)

| ID | Item | Severidade | Estado |
|---|---|---|---|
| F-01/A-02 | bankPassword vazando em payloads + persistência com bcrypt + endpoint dedicado | S1 | `[x]` (junto com 1.1) |
| A-01 | resetCharacter sobrescreve ficha remota — flag skipSync + confirmação | S1 | `[x]` |
| F-02 | `/api/npcs?q=` perde escopo de posse → Op.and | S1 | `[x]` |
| F-03 | PUT /encontros/:id sempre 422 — declarar campos em encontroSchema | S1 | `[x]` |
| F-04 | Sessões: aceitar dataAgendada date-only | S2 | `[x]` |
| F-05 | notaSchema: declarar `privada` + filtro server-side; enums em `notaSchema` alinhados ao ENUM PG | S2 | `[x]` |
| F-06 | /characters?campanhaId= validar posse da campanha | S2 | `[x]` |
| F-07 | /campanhas/:id sanitizar payloads (publicCharacter, sem dadosExtras sensíveis nem notasMestre para membros) | S2 | `[x]` |
| A-03 | players ↔ jogadores no sync (backend + frontend) | S2 | `[x]` |
| A-05 | clearAuth não apaga `rpg_world_market_*` | S2 | `[x]` |
| A-06 | upsertCharacter sem selectCharacter forçado | S2 | `[x]` |
| A-07 | 409/conflito: opção "manter da nuvem" (merge remoto) além de manter local | S2 | `[x]` |
| F-08 | sync exige id; sem id → 4xx (legado) | S2 | `[x]` |
| F-09 | models ↔ banco: npcs.campanha_id / personagens.usuario_id nullable | S2 | `[x]` |
| F-10 | migration banco_v2 dentro de transação; down() não destrutivo; documentar fontes de verdade | S2 | `[x]` (transação + doc) |
| F-11 | enums zod↔PG (arquivada, co-mestre, encontroSchema real) | S3 | `[x]` |
| F-12 | autorização: npcController.obterPorId só leitura; iniciativa de jogador não cria encontro ativo (404 com instrução) | S3 | `[x]` |
| F-13 | /campanha legado com schema próprio; logout revogar; sessões: tratar race 23505 → 409 | S3 | `[~]` |
| A-09 | layout server + `next/font/google` + metadata/viewport; Providers client separado | S3 | `[x]` |
| A-10 | SmoothScroll sem remount (ReactLenis sempre montado, flag interna) | S3 | `[x]` |
| A-11 | remover órfãos: /anotacao, AnotacoesImproved, ThemeSelector, BarrraHp, Aurora | S3 | `[x]` |
| A-13 | ConfirmDialog: role/aria/Escape/focus-trap/alvo ≥44px; DiceModal com foco inicial e Escape | S3 | `[x]` |
| A-15 | upd não converte "0"→"0"; uid() com crypto se disponível; feedback de rejeição coerente | S4 | `[x]` |
| A-16 | deleteGameSession sem Content-Type JSON desnecessário | S4 | `[x]` |
| A-17 | script `npm test`; themes.test.mjs alinhado à implementação (6 temas) | S3 | `[x]` |
| A-12 | otimização de bundle (admin/mercado dividido, dynamic import) — fora do escopo agora | S3 | `[ ]` |
| A-14 | tokens para hex hardcoded de telas parchment (auth pages) — tratamento deliberado, manter | S3 | `[~]` deliberado |

## Ordem de execução realizada

1. S1 (F-01, A-01, F-02, F-03) → 2. S2 de contrato (F-04, F-05, F-06, F-07, F-11) → 3. persistência (F-08, F-09, A-03, A-05, A-06, A-07) → 4. higiene (A-09…A-17) → 5. features do usuário (BP, CA, montarias, painel mestre, navbar) → 6. validação E2E + checklist.
