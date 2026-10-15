# Ecossistema de Agentes, Sub-agentes e Skills

Este diretório contém a estrutura de agentes e skills da **Ficha de RPG Web**.

---

## 🤖 Sub-agentes Registrados

Os seguintes sub-agentes foram criados e estão prontos para serem acionados via `invoke_subagent`:

1. **`rpg-rules-engine`**:
   - **Função**: Especialista em regras matemáticas d20 customizadas (7 atributos: FOR, DES, CON, SAB, ESP, CAR, INT), cálculo de modificadores e relações com perícias.
   - **Escopo**: `src/lib/modifiers.js` e regras puras.

2. **`dice-mechanic`**:
   - **Função**: Motor de rolagem de dados virtuais com bônus, notação d20, mecânicas de Vantagem e Desvantagem (2d20kh1 / 2d20kl1) e histórico de rolagens.
   - **Escopo**: `src/lib/dice.js`, `DiceContext.jsx` e modais/bandejas de dados.

3. **`frontend-artisan`**:
   - **Função**: UI/UX para a Área do Jogador com React 19 e Tailwind CSS v4, garantindo design responsivo (mobile-first), feedback visual e alvos de toque adequados.
   - **Escopo**: `src/app/components/` e páginas da ficha.

4. **`backend-database`**:
   - **Função**: Modelagem e integração com PostgreSQL via Sequelize ORM e endpoints de API no Next.js 16 (`src/app/api/...`).
   - **Escopo**: `src/db/` e rotas de sincronização de ficha, banco e inventário.

5. **`qa-tester`**:
   - **Função**: Testes de integridade matemática das regras, persistência de dados, casos de borda em dados virtuais e testes de hidratação.
   - **Escopo**: Suites de teste e validações.

---

## 🧠 Sistema de Memória Persistente

Para que o contexto, as decisões e as alterações não se percam ao encerrar sessões ou trocar de contexto, cada agente mantém um arquivo de memória ativa no diretório [`.agents/memory/`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/):

- [`orchestrator.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/orchestrator.md) — Visão geral da arquitetura, ADRs, status do roadmap e backlog consolidado.
- [`rpg-rules-engine.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/rpg-rules-engine.md) — Fórmulas matemáticas, mapa de perícias e regras de cálculo em vigor.
- [`dice-mechanic.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/dice-mechanic.md) — Mecânicas de dados virtuais, vantagens/desvantagens e formatos de retorno.
- [`frontend-artisan.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/frontend-artisan.md) — Padrões de UI/UX, tokens Tailwind v4 e componentes da Área do Jogador.
- [`backend-database.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/backend-database.md) — Esquema de tabelas PostgreSQL, modelos Sequelize e endpoints de API.
- [`qa-tester.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/qa-tester.md) — Casos de borda matemáticos, matriz de cobertura e testes de regressão.

### Protocolo de Sessão dos Agentes:
1. **No início de cada tarefa**: O agente lê o seu arquivo de memória correspondente para recuperar o estado e decisões anteriores.
2. **Ao concluir uma alteração**: O agente atualiza o histórico de alterações recentes e o checklist de próximas ações no seu arquivo de memória.

---

## 🛠️ Skills Disponíveis

Localizadas em `.agents/skills/`:
- [`dice-roller`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/skills/dice-roller/SKILL.md): Resolução de rolagens d20 virtuais com bônus, vantagens e desvantagens.
- [`rpg-sheet-calculator`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/skills/rpg-sheet-calculator/SKILL.md): Cálculos de modificadores e bônus de perícias dos 7 atributos.
- [`sheet-component-builder`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/skills/sheet-component-builder/SKILL.md): Padrões de componentes visuais da ficha em Tailwind CSS v4.
- [`sequelize-model-generator`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/skills/sequelize-model-generator/SKILL.md): Padrões para models e conexões PostgreSQL com Sequelize.

