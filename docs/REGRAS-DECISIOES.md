# ⚖️ Decisões oficiais do sistema — regras ambíguas resolvidas

Este documento consolida o veredito sobre pontos ambíguos encontrados na planilha técnica
(2026-11-14). O manual oficial continua sendo [`RPG_RULES.md`](RPG_RULES.md); aqui ficam
**as decisões e os limites** — em caso de conflito, `RPG_RULES.md` prevalece e este
documento deve ser atualizado.

## 1. Regras ambíguas — vereditos

| # | Ambiguidade | Decisão oficial |
|---|---|---|
| 1 | "BP" aparece como Bravura (recurso) **e** como bônus de proficiência por nível | São coisas distintas: **BP (Bravura)** = recurso consumível, máx = `Nível + Mod(CAR)`. **Bônus de proficiência** = valor fixo por faixa de nível (ver #2), somado em perícias treinadas. |
| 2 | "Nível 13 a 13: +5" | O pedido foi lido como faixa **13–16: +5** (progressão d20 padrão). Tabela oficial: 1–4 +2 · 5–8 +3 · 9–12 +4 · 13–16 +5 · 17–20 +6 · 21–30 +6. |
| 3 | Dano absorvido pela CA: mínimo do atacante? | Redução de HP por ataque = `max(1, danoBruto − CA)`. O CA reduz, nunca anula por completo (regra de "no mínimo 1"). |
| 4 | Dado de Vida ao subir de nível | Resultado do dado (+ Mod CON) soma no **HP Máximo** e no HP atual, **somente após confirmação** do jogador. |
| 5 | `hitDie` padrão divergente (`1d8` × `1d10`) | Catálogo de classes define: Bruxeiro/Guerreiro 1d10 · Bárbaro 1d12 · Ladino/Ranger/Clérigo/Bardo/Ranger 1d8 (ver `src/lib/classes.js`). Fichas sem classe usam **1d8**. |
| 6 | Senha do cofre bancário | **Por padrão, a senha do login do dono da ficha.** Personalizada por ficha via `PUT /characters/:id/bank/password`. Legado `"133313"` descartado; senha vazia nunca abre. |
| 7 | Role/perfil enviado pelo cliente | Ignorado. O servidor usa `usuarios.perfil` (fonte única). `role` é derivado. |
| 8 | Empate de iniciativa | Maior Mod DES primeiro; empate persistente → rolagem de desempate (d20, igual). |
| 9 | Perícia com bônus explícito e treinada | Bônus explícito **substitui** a proficiência (expertise do jogador); proficiência por nível é o padrão quando não há bônus. |
| 10 | PV máx × nível (cap 1–20 vs 1–30) | Regras jogam 1–20; banco permite até 30 (`nivel CHECK 1..30`) para extensão futura — fichas novas nascem em 1; migração futura pode apertar o teto sem perda de dados. |
| 11 | `bankPassword` de IA? | Senhas de cofres nunca persistidas em texto puro, nunca retornadas pela API, nunca em export/import JSON. |
| 12 | Nota privada | Sem gabarito público: privada só é visível ao autor e ao mestre dono da campanha. O que "privada" significa é filtro **server-side**, não CSS. |
| 13 | Sync concorrente | `updatedAt` ecoado; desajuste → 409; jogador decide (manter nuvem / forçar). Nunca silenciosamente. |

## 2. Valores calculados × editáveis

**Calculados (a ficha deriva; edição direta desfeita ao recalcular):**
- Modificadores (FOR…INT) = `floor((atributo − 10) / 2)`.
- Perícia treinada = `Mod(atributo) + proficiência(nível)` (ou bônus explícito).
- CA total exibida = `10 + Mod(DES) + extra` (`dadosExtras.armorClass` = bônus além da base).
- Iniciativa = `Mod(DES) + bônus extra` (`dadosExtras.initiative`).
- PE máx = `Nível + Mod(ESP)` (mín. 0) · BP máx = `Nível + Mod(CAR)` (mín. 0) · Insanidade máx = fórmula do manual.
- Carga = `Σ peso(itens) `× capacidade por FOR/CON; nível de XP = faixas da tabela de XP.
- Modificadores de atributo nunca descem abaixo de −5 nem sobem de +10 (atributos 1–30).

**Editáveis diretamente:**
- Valor dos atributos, XP, nível (se a mesa permitir), HP atual/máximo, PE/BP/insanidade atuais e máximos (customização de classe), moedas, inventário, contratos, notas, montaria, aparência.
- CA e iniciativa como **bônus extra** (o cálculo base é do sistema).
- `hitDie` — determinado pela classe; editável só se a classe mudar.

**Somente-mestre (bloqueado visualmente e no backend):**
- Modificar fichas de terceiros de sua mesa, NPCs, encontros/combat, mapas e névoa, notas privadas alheias, nível por iniciativa/habilidade de NPC.

## 3. Limites mínimos e máximos

| Campo | Mín | Máx |
|---|---|---|
| Atributos | 1 | 30 |
| Nível | 1 | 30 (jogo: 20) |
| HP/PV (atual) | 0 | HP máximo |
| HP máximo | 1 | 9999 |
| PE/BP/insanidade (atual) | 0 | seus máximos |
| XP | 0 | 999 999 |
| Moedas (latina/ouro/prata/cobre) | 0 | 999 999 999 |
| Quantidade de item | 0 | 9 999 |
| Slots de banco | 80 fixos | — |
| Nome de personagem/NPC | 1 | 120/160 chars |
| Anotações/notas | 0 | 100 KB |

Validação efetiva: `zod` em `src/schemas/apiSchemas.js` (`atributo 1–30`, `numero.int().min(0)`,
textos com `max(...)`) + `CHECK` no banco (`nivel 1..30`, `pontos_vida >= 0`,
`experiencia >= 0`, `membros_campanha PK`, `UNIQUE` onde listado).

## 4. Modelo: campanha, membros, jogadores, mestres, NPCs e vínculos

```
usuarios (mestre | jogador)
  │ 1:N
  ├─ campanhas (proprietario_id → usuarios.id; codigo_convite)
  │     │ N:N via membros_campanha(campanha_id, usuario_id, papel)
  │     ├─ personagens (campanha_id opcional; usuario_id do dono)
  │     ├─ npcs        (campanha_id opcional; criado_por_id = mestre)
  │     ├─ encontros   (ativo → combate tático da mesa)
  │     ├─ sessoes_jogo(numero único por campanha)
  │     ├─ anotacoes   (privada=true → só autor e mestre dono)
  │     └─ recursos_campanha (imagens de mapas etc.)
  │
  └─ personagens (campanha_id → campanhas.id; jogador dono)
        ├─ atributos_personagem (1:1)
        ├─ pericias_personagem / itens_inventario / contratos (1:N)
        └─ cofre (1:1, senha própria ou do login)
```

- Um **mestre** administra apenas as próprias campanhas; um **jogador** é membro ativo de N mesas.
- Um personagem pode não ter mesa (`campanha_id NULL`) — jogo solo/offline.
- Um personagem pertence a **um** dono e, opcionalmente, **uma** mesa (sem multi-mesa).

## 5. Visibilidade (público × privado × secreto)

| Dado | Visível a |
|---|---|
| Ficha do herói | dono + mestre dono da mesa |
| HP/PV/PE/BP do herói | dono + mestre |
| Inventário/mordidas | dono + mestre |
| Cofre bancário | **apenas o dono** (nem o mestre abre) |
| Notas privadas (`privada=true`) | autor + mestre dono da mesa |
| Segredos/notas do mestre em NPCs | apenas o mestre |
| NPCs com `sharedWithPlayers` | membros da mesa (leitura) |
| Heróis com `sharedWithPlayers` | membros da mesa (leitura, `readOnly`) |
| Rolagens da mesa | dono vê as próprias; mestre vê todas da mesa |
| Auditoria | mestre dono da mesa + sistema |
