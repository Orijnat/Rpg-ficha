# Memória do Agente Orquestrador (@orchestrator)

Este arquivo é a fonte de memória persistente da liderança técnica do projeto. Deve ser lido no início de cada sessão e atualizado ao final de cada entrega.

---

## 📌 Estado Atual do Projeto
- **Fase Atual**: Preparação da Fase 1 (Motor de Regras e Rolagem de Dados).
- **Stack Consolidada**: Next.js 16 (App Router), React 19, Tailwind CSS v4, PostgreSQL, Sequelize ORM.
- **Foco Principal**: Área do Jogador (Mobile-first e Desktop) para sistema próprio baseado em d20 (7 atributos).

---

## 📜 Histórico de Decisões Arquiteturais (ADRs)
1. **[ADR-001] Sistema de 7 Atributos**:
   - Atributos: `FOR`, `DES`, `CON`, `SAB`, `ESP`, `CAR`, `INT`.
   - Modificador: $\lfloor(\text{Valor} - 10) / 2\rfloor$.
2. **[ADR-002] Mecânica de Rolagens Virtuais**:
   - Vantagem: Rolar 2d20 e descartar o menor (`2d20kh1`).
   - Desvantagem: Rolar 2d20 e descartar o maior (`2d20kl1`).
   - Retorno estruturado contendo dados rolados, dados descartados, modificadores e detecção de críticos (1 e 20 natural).
3. **[ADR-003] Persistência Híbrida**:
   - Estado reativo com React Context (`CharacterContext`) no frontend com hidratação local e sincronização otimista via endpoints de API (`/api/characters/...`) salvando no PostgreSQL através do Sequelize.
4. **[ADR-004] Memória de Agentes**:
   - Cada sub-agente mantém um arquivo em `.agents/memory/<subagente>.md` registrando arquivos tocados, decisões e pendências para manter continuidade entre sessões.
5. **[ADR-005] Backend Desacoplado**:
   - O backend foi estruturado em pasta própria fora do frontend: `/home/crs/projetos/aa/Rpg-backend`.
   - Utiliza Express.js, Sequelize ORM e PostgreSQL, com CORS aberto para o frontend e auto-sync das tabelas.

---

## 🗺️ Roadmap e Status das Fases
- [x] **Fase 1**: Motor de Regras e Rolador Virtual (`src/lib/modifiers.js`, `src/lib/dice.js`, 25 testes com 100% de aprovação).
- [x] **Fase 2**: Integração UI da Ficha & Disparo de Rolagens (Bandeja flutuante, histórico, triggers em perícias e atributos).
- [x] **Fase 3**: Persistência PostgreSQL & Sequelize em backend desacoplado (`/home/crs/projetos/aa/Rpg-backend`).
- [x] **Fase 4**: Módulos do Jogador (Inventário com pesquisa, Contratos com filtros, Montaria com controles de HP, Quarto com descansos curto/longo).
- [x] **Fase 5**: QA Final, Backup/Exportação JSON, Sincronização e Polimento (43 testes aprovados).

---

## 📝 Registro de Mudanças Recentes
- **2026-10-15**:
  - Criação do documento mestre `CLAUDE.md` e documentação técnica em `docs/`.
  - Registro e inicialização dos 5 sub-agentes e criação das skills em `.agents/skills/`.
  - Configuração da infraestrutura de memória persistente em `.agents/memory/`.
  - **Fase 1 Concluída**: Regras d20 customizadas e engine de dados.
  - **Fase 2 Concluída**: Integração de rolagens com vantagens/desvantagens na interface e bandeja flutuante.
  - **Fase 3 Concluída**: Backend independente com Express, Sequelize e PostgreSQL em `/home/crs/projetos/aa/Rpg-backend`.
  - **Fase 4 Concluída**: Módulos de Inventário, Contratos, Montaria e Quarto totalmente funcionais.
  - **Fase 5 Concluída**:
    * Modal de Backup e Exportação/Importação JSON em `BackupModal.jsx` acessível no cabeçalho.
    * 43 testes automatizados (regras, dados, integridade de backup e atributos) com 100% de aprovação.
    * Build de produção Turbopack do Next.js 16 validado com 0 erros em todas as 14 rotas.



