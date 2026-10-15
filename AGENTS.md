<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🛡️ Diretrizes Obrigatórias do Ecossistema de Agentes & Memória

## 1. 💾 Persistência de Prompt em Memória para Continuidade Entre Sessões
- **Salvamento Automático a Cada Requisição**: Toda requisição e prompt recebido do usuário deve ser salvo/mantido atualizado em `.agents/memory/active_session.md` e `.agents/memory/last_prompt.json`.
- **Continuidade de Sessão**: Ao iniciar qualquer conversa ou prompt em nova sessão, o agente deve verificar `.agents/memory/active_session.md` para identificar o estado da sessão anterior, tarefas pendentes e objetivos em andamento.
- **Histórico e Checklist**: Antes de finalizar um turno, o checklist de continuidade de `.agents/memory/active_session.md` e `.agents/memory/orchestrator.md` deve ser atualizado com o progresso realizado e o próximo passo recomendado.

## 2. 🤖 Uso Obrigatório de Agentes e Skills ao Iniciar Qualquer Prompt
Ao processar qualquer prompt do usuário, o agente **SEMPRE DEVE** utilizar os agentes/subagentes e skills do projeto de acordo com a especialidade:
- **`frontend-artisan`** + skill `sheet-component-builder`: Criação e reformulação de componentes React 19, layouts da ficha, Dark Fantasy UI, Tailwind CSS v4, ícones Lucide e responsividade mobile-first.
- **`rpg-rules-engine`** + skill `rpg-sheet-calculator`: Cálculos matemáticos dos 7 atributos, modificadores e bônus das 19 perícias.
- **`dice-mechanic`** + skill `dice-roller`: Sistema de rolagem de dados virtuais d20, modais, bandejas e vantagens/desvantagens.
- **`backend-database`** + skill `sequelize-model-generator`: Modelos Sequelize, migrações PostgreSQL e rotas de API Next.js (`src/app/api/...`).
- **`qa-tester`**: Validações de integridade, testes de regressão e casos de borda.

### Protocolo de Execução:
1. **Consultar Memória Ativa**: Ler a memória do agente correspondente em `.agents/memory/` antes de iniciar a tarefa.
2. **Executar com Especialidade**: Aplicar as regras e padrões arquiteturais definidos pelo agente especialista.
3. **Persistir Resultados**: Registrar as alterações e o estado final na memória do agente e em `.agents/memory/active_session.md`.
