# Guia de Agentes, Sub-agentes e Fluxo de Trabalho Multiagente

Este documento explica detalhadamente a engenharia de agentes configurada para o desenvolvimento colaborativo da **Ficha de RPG Web**.

---

## 1. Arquitetura da Equipe de Agentes

O projeto opera sob o modelo **Hierárquico com Especialistas de Domínio**:

```
                  +---------------------------+
                  |    @orchestrator (Lead)   |
                  |  Coordenação e Decisões   |
                  +-------------+-------------+
                                |
         +----------------------+----------------------+
         |                      |                      |
         v                      v                      v
+-------------------+  +-------------------+  +-------------------+
| @rpg-rules-engine |  |  @dice-mechanic   |  | @frontend-artisan |
| Regras Matemáticas|  |  Rolador Virtual  |  |  React 19 / UI    |
+-------------------+  +-------------------+  +-------------------+
         |                      |                      |
         +----------------------+----------------------+
                                |
         +----------------------+----------------------+
         |                                             |
         v                                             v
+-------------------+                         +-------------------+
| @backend-database |                         |    @qa-tester     |
| Postgres/Sequelize|                         | Testes e Limites  |
+-------------------+                         +-------------------+
```

---

## 2. Detalhamento dos Agentes e Suas Memórias

| Agente | Responsabilidade Primária | Arquivo de Memória Persistente |
| :--- | :--- | :--- |
| **`@orchestrator`** | Planejamento, quebra de tarefas, prevenção de conflitos e validação de entregas. | [`.agents/memory/orchestrator.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/orchestrator.md) |
| **`@rpg-rules-engine`** | Implementação e validação matemática dos 7 atributos, modificadores e perícias em `src/lib/modifiers.js`. | [`.agents/memory/rpg-rules-engine.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/rpg-rules-engine.md) |
| **`@dice-mechanic`** | Resolução de rolagens com vantagens/desvantagens e modal de histórico em `src/lib/dice.js`. | [`.agents/memory/dice-mechanic.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/dice-mechanic.md) |
| **`@frontend-artisan`** | Telas e componentes React 19 com Tailwind CSS v4, alvos de toque mobile e feedback visual. | [`.agents/memory/frontend-artisan.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/frontend-artisan.md) |
| **`@backend-database`** | Modelagem PostgreSQL, Sequelize e Route Handlers no Next.js 16 (`src/app/api/...`). | [`.agents/memory/backend-database.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/backend-database.md) |
| **`@qa-tester`** | Validação automatizada de regras, testes de casos de borda e garantia de zero erros de hidratação. | [`.agents/memory/qa-tester.md`](file:///home/crs/projetos/aa/Rpg-ficha/.agents/memory/qa-tester.md) |

---

## 3. Protocolo de Persistência de Memória Entre Sessões

Para assegurar que o agente não "esqueça" o que já foi discutido, implementado ou planejado após o encerramento do chat ou troca de modelo:

1. **Início da Sessão**:
   - O agente orquestrador lê `.agents/memory/orchestrator.md` para resgatar o status de cada fase.
   - Cada sub-agente consulta sua memória dedicada antes de propor código.
2. **Durante a Execução**:
   - Cada alteração é mantida em arquivos específicos por domínio para evitar conflitos de merge ou sobreposição de código.
3. **Fim da Sessão / Entrega de Tarefa**:
   - O sub-agente insere um registro na seção `Histórico de Alterações Recentes` do seu arquivo `.md`.
   - Marca as tarefas concluídas no checklist e insere as pendências recém-descobertas.

---

## 4. Como Chamar os Sub-agentes
Qualquer sub-agente pode ser invocado no prompt do orquestrador ou diretamente pelo usuário através da menção nominal:
- *"Acione o `@dice-mechanic` para implementar a rolagem com vantagem no d20."*
- *"Peça ao `@rpg-rules-engine` para ajustar a fórmula das perícias de SAB."*
- *"Chame o `@frontend-artisan` para refazer o card de atributos no mobile."*
