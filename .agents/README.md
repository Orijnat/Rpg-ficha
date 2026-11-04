# Ecossistema de Agentes, Sub-agentes e Skills da Ficha de RPG

Este diretório contém a estrutura de agentes, memórias persistentes e skills da **Ficha de RPG Web**.

---

## 🤖 Catálogo de Sub-agentes Especialistas

Os seguintes sub-agentes estão ativos e configurados no ecossistema:

### 1. **Área do Jogador & Regras Centrais**
1. **`rpg-rules-engine`**:
   - **Função**: Especialista em regras matemáticas d20 customizadas (7 atributos: FOR, DES, CON, SAB, ESP, CAR, INT), cálculo de modificadores e relações com as 19 perícias.
   - **Escopo**: `src/lib/modifiers.js` e regras puras.
   - **Skill Relacionada**: `rpg-sheet-calculator`

2. **`dice-mechanic`**:
   - **Função**: Motor de rolagem de dados virtuais com bônus, notação d20, mecânicas de Vantagem e Desvantagem (2d20kh1 / 2d20kl1) e histórico de rolagens.
   - **Escopo**: `src/lib/dice.js`, `DiceContext.jsx` e modais/bandejas de dados.
   - **Skill Relacionada**: `dice-roller`

3. **`frontend-artisan`**:
   - **Função**: UI/UX para a Área do Jogador com React 19 e Tailwind CSS v4, garantindo design responsivo (mobile-first), feedback visual e alvos de toque adequados.
   - **Escopo**: `src/app/components/` e páginas da ficha.
   - **Skill Relacionada**: `sheet-component-builder`

4. **`backend-database`**:
   - **Função**: Modelagem e integração com PostgreSQL via Sequelize ORM e endpoints de API no Next.js (`src/app/api/...`).
   - **Escopo**: `src/db/`, `src/models/` e rotas de sincronização de ficha, banco e inventário.
   - **Skill Relacionada**: `sequelize-model-generator`

5. **`qa-tester`**:
   - **Função**: Testes de integridade matemática das regras, persistência de dados, casos de borda em dados virtuais e testes de hidratação.
   - **Escopo**: Suites de teste em `src/lib/__tests__/*.test.mjs`.

---

### 2. **Área do Mestre (Tópico 3)**
6. **`npc-curator` (`npc-combat-rpg`)**:
   - **Função**: Criação de fichas simplificadas para NPCs e monstros sem tratá-los como jogadores; sistema de tags, busca e filtros; avatares, status de combate e gerador de variantes táticas (Alfa, Elite, Espectral).
   - **Escopo**: `src/app/admin/npcs/` e cadastros do mestre.
   - **Skill Relacionada**: `npc-curator`

7. **`gm-campaign-orchestrator` (`mestre-campanha-rpg`)**:
   - **Função**: Gerenciamento de campanhas, ciclo de membros (convites com código único, aprovação, remoção e bloqueio), sessões com cenas narrativas, checklist de objetivos e recompensas.
   - **Escopo**: `src/app/admin/campanhas/`, `src/app/admin/sessoes/`.
   - **Skill Relacionada**: `gm-campaign-orchestrator`

8. **`tactical-encounter-engine`**:
   - **Função**: Combate tático em tempo real, sincronização direta de iniciativa a partir das fichas de jogadores, rodadas, condições táticas, histórico de dano/cura (`combatLog`) e mapas interativos com marcadores e névoa de guerra (`Fog of War`).
   - **Escopo**: `src/app/admin/encontros/`, `src/app/admin/mapas/`.
   - **Skill Relacionada**: `tactical-encounter-engine`

9. **`audit-and-security` (`auditor-mestre-rpg`)**:
   - **Função**: Restrição multi-tenant de campanhas no backend, filtragem server-side estrita de notas secretas do mestre, rastreabilidade ("quem alterou e quando" - `lastModifiedBy`/`lastModifiedAt`), e modais Dark Fantasy de confirmação solene para operações críticas.
   - **Escopo**: `src/app/admin/notas/`, `ConfirmDialog.jsx` e middlewares/controllers.
   - **Skill Relacionada**: `audit-and-security`

---

## 🛠️ Mapa de Skills do Projeto

Localizadas em `.agents/skills/`:
- [`rpg-sheet-calculator`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/rpg-sheet-calculator/SKILL.md): Cálculos de modificadores e bônus de perícias dos 7 atributos.
- [`dice-roller`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/dice-roller/SKILL.md): Resolução de rolagens d20 virtuais com bônus, vantagens e desvantagens.
- [`sheet-component-builder`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/sheet-component-builder/SKILL.md): Padrões de componentes visuais da ficha em Tailwind CSS v4.
- [`sequelize-model-generator`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/sequelize-model-generator/SKILL.md): Padrões para models e conexões PostgreSQL com Sequelize.
- [`npc-curator`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/npc-curator/SKILL.md): Catálogo de NPCs, filtros, busca, badges de tags e geração de variantes.
- [`gm-campaign-orchestrator`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/gm-campaign-orchestrator/SKILL.md): Campanhas, códigos de convite, membros e sessões com cenas/objetivos.
- [`tactical-encounter-engine`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/tactical-encounter-engine/SKILL.md): Encontros táticos, iniciativa sincronizada das fichas e mapas com névoa de guerra.
- [`audit-and-security`](file:///home/cledi/rp/Rpg-ficha/.agents/skills/audit-and-security/SKILL.md): Autorização de mestres, filtragem de notas privadas, auditoria e confirmação solene.

---

## 🧠 Protocolo Obrigatório de Persistência em Memória
1. Toda requisição e prompt é salvo em `.agents/memory/active_session.md` e `.agents/memory/last_prompt.json`.
2. As decisões de arquitetura e progresso das tarefas do mestre são consolidadas em `.agents/memory/orchestrator.md`.
