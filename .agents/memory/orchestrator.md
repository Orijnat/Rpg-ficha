# Memória do Agente Orquestrador (@orchestrator)

Este arquivo é a fonte de memória persistente da liderança técnica do projeto. Deve ser lido no início de cada sessão e atualizado ao final de cada entrega.

---

## 📌 Estado Atual do Projeto
- **Fase Atual**: Preparação da Fase 1 (Motor de Regras e Rolagem de Dados).
- **Stack Consolidada**: Next.js 16 (App Router), React 19, Tailwind CSS v4, PostgreSQL, Sequelize ORM.
- **Foco Principal**: Área do Jogador (Mobile-first e Desktop) para sistema próprio baseado em d20 (7 atributos).

### Diagnóstico mais recente — 2026-10-20
- A página raiz (`src/app/page.js`) contém somente um redirecionamento server-side
  para `/login` e não apresenta problema funcional.
- Melhorias restantes prioritárias estão documentadas em
  `docs/MELHORIAS-FUTURAS-RPG.md`, com foco em segurança, persistência,
  sincronização e testes.

### Relatório consolidado — 2026-10-22
- Implementações recentes abrangem a área do jogador, diário/anotações,
  inventário, contratos, área do mestre, perfis, persistência/sincronização,
  schema v2, regras d20, backup JSON e refinamento visual.
- `npm run build`: aprovado, com 18 rotas geradas.
- `node --test src/lib/__tests__/*.mjs`: aprovado, 2 arquivos e 73 asserções.
- `npm test`: indisponível porque não há script `test` no `package.json`.
- `npm run lint`: pendente, com 6 erros e 5 avisos.
- Pendências prioritárias: regras oficiais, campanhas e autorização completa,
  migrations, hardening de segurança, uploads privados, Google Drive/Sheets/Docs,
  acessibilidade e testes de integração/E2E.
- **Segurança web (2026-10-26)**: agentes workspace criados para ataque controlado
  (`ataque-web-controlado`) e defesa/hardening (`defesa-web-hardening`). Auditoria
  autorizada concluída; Next.js atualizado, headers defensivos aplicados e
  `npm audit --omit=dev` sem vulnerabilidades.

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

6. **[ADR-006] Continuidade Entre Sessões e Uso Obrigatório de Sub-Agentes**:
   - Toda requisição tem seu prompt e estado capturados e salvos em `.agents/memory/active_session.md` e `last_prompt.json` via hook de ciclo de vida (`PreInvocation` / `SessionStart`) e regras no `AGENTS.md` / `GEMINI.md`.
   - Ao iniciar qualquer atendimento, é mandatório consultar as memórias ativas e orquestrar os subagentes especializados (`frontend-artisan`, `rpg-rules-engine`, `dice-mechanic`, `backend-database`, `qa-tester`).

---

## 🗺️ Roadmap e Status das Fases
- [x] **Fase 1**: Motor de Regras e Rolador Virtual (`src/lib/modifiers.js`, `src/lib/dice.js`, 25 testes com 100% de aprovação).
- [x] **Fase 2**: Integração UI da Ficha & Disparo de Rolagens (Bandeja flutuante, histórico, triggers em perícias e atributos).
- [x] **Fase 3**: Persistência PostgreSQL & Sequelize em backend desacoplado (`/home/crs/projetos/aa/Rpg-backend`).
- [x] **Fase 4**: Módulos do Jogador (Inventário com pesquisa, Contratos com filtros, Montaria com controles de HP, Quarto com descansos curto/longo).
- [x] **Fase 5**: QA Final, Backup/Exportação JSON, Sincronização e Polimento (43 testes aprovados).
- [x] **Fase 6**: Sistema de Memória Contínua Entre Sessões & Hook de Início com Agentes (`.agents/hooks.json`, `.agents/scripts/sync_session_memory.js`, `AGENTS.md`, `GEMINI.md`).
- [x] **Fase 7**: Reformulação visual do front-end com layout mais organizado, ornamentado (Dark Fantasy) e menos minimalista via `frontend-artisan`.
- [x] **Fase 8**: Aba dedicada de anotações, navegação refinada e galeria de imagens persistida no personagem.
- [x] **Fase 9**: Diário de campanha com registros datados, relatos e imagens por entrada.
- [x] **Fase 10**: Ambientação visual global com textura, molduras, divisores e cabeçalho ornamentado.
- [x] **Fase 11**: Fundo dark fantasy mais nítido com textura em camadas, pontos rúnicos, rails e vinheta.
- [x] **Fase 12**: Redesign visual não minimalista com selos arcanos, molduras de pergaminho e palco ornamentado.
- [x] **Fase 13**: Migração global para identidade de grimório/guilda, com placas, faixa de navegação e medalhões.
- [x] **Fase 14**: MVP inicial da Sala do Mestre com campanha, NPCs, iniciativa e gestão de personagens.
- [x] **Fase 15**: Perfis `player`/`master`, autorização por proprietário e filtragem server-side de dados sensíveis.
- [x] **Fase 16**: Redirecionamento global de usuários não autenticados para a tela de login.
- [x] **Fase 17**: Mapeamento completo do domínio e persistência PostgreSQL/Sequelize ampliada com campos canônicos em português.
- [x] **Fase 18**: Criação da equipe especializada de frontend, backend, contrato de integração e orquestração fullstack.
- [x] **Fase 19**: Implementação das Melhorias do Roadmap (Ficha do Jogador, Inventário com Carga/Filtros, Contratos com Busca, Diário com Tags/Ordenação, Indicador de Sincronização Global no Cabeçalho e Schema v2 com Validação de Integridade).

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
    * Build de produção Turbopack do Next.js 16 validado com 0 erros em todas as 16 rotas.
  - **Fase de Temas & Layout Dinâmico Concluída**:
    * `ThemeProvider` integrado ao `src/app/layout.js` com persistência automática no `localStorage`.
    * `ThemeSelector` integrado no `Cabecalho.jsx` permitindo escolha entre 5 temas visuais: Pergaminho Dourado, Sangue de Dragão, Floresta Élfica, Arcano Púrpura e Gelo do Norte.
    * Fundos com gradientes radiais dinâmicos e iluminação ambiente adaptativa reativa ao tema selecionado via tokens de `--glow-primary` e `var(--primary)`.
    * Remoção de cores hardcoded em favor de classes semânticas em `ui.js`, `BackupModal.jsx`, `Aparencia.jsx`, `BarrraHp.jsx` e `banco/constants.js`.
  - **Fase 6 Concluída (Persistência de Memória & Agentes)**:
    * Criação do hook de ciclo de vida `.agents/hooks.json` com `PreInvocation` e `SessionStart`.
    * Criação do script `.agents/scripts/sync_session_memory.js` para registrar prompts e injetar instruções.
    * Definição de regras estritas em `AGENTS.md` e `GEMINI.md` para obrigatoriedade de salvamento do prompt para continuidade entre sessões e uso incondicional dos agentes especializados.
  - **Equipe especializada fullstack**:
    * Agentes em `.github/agents/` para frontend, backend, contrato de integração e orquestração.
    * Skills em `.github/skills/` para frontend RPG, backend RPG e contrato API RPG.

- **2026-10-16 — Animação do rolador**:
  - `DiceModal` recebeu dados numerados com rotação 3D, quique e aura temática.
  - Vantagem/desvantagem preservam a distinção entre resultado mantido e descartado; múltiplos dados são exibidos sem alterar o motor.
  - `globals.css` inclui keyframes dedicados e fallback para `prefers-reduced-motion`.
  - Build de produção e verificação de whitespace passaram.

- **2026-10-16 — Equipe expandida do ecossistema RPG**:
  - Criados agentes especializados para Área do Jogador, Área do Mestre, motor de regras, mecânica de dados, segurança, QA e documentação.
  - Criadas skills de frontend jogador/mestre, regras d20, dados, autenticação, autorização, uploads, QA, segurança e documentação.
  - Criadas memórias persistentes correspondentes em `.agents/memory/`.
  - O orquestrador foi atualizado para poder acionar os novos agentes.

- **2026-10-16 — Primeira melhoria geral do sistema**:
  - Rolador revisado com aleatoriedade injetável, múltiplos dados, acessibilidade e animação d20.
  - Área do Mestre reforçada com proteção de rota, cliente autenticado e tratamento de falhas.
  - Área do Jogador recebeu indicador de sincronização local/backend.
  - Backend teve correções de associação de personagens, filtro de dados privados, segredo JWT obrigatório e bloqueio de usuários inativos.
  - Criado `docs/MELHORIAS-FUTURAS-RPG.md` com diagnóstico e roadmap priorizado.

- **2026-10-17 — Continuidade da integração backend/frontend**:
  - Retomada a correção de dados ausentes no carregamento do backend.
  - Confirmados os aliases canônicos/legados, moedas e preservação de arrays vazios no `CharacterContext` e cliente de API.
  - `npm run build` e `git diff --check` passaram novamente.
  - Ajustada a normalização para preservar explicitamente coleções canônicas vazias vindas do backend.
  - Testes direcionados de regras e dados: 26 aprovados.
  - Área do Mestre ampliada com central visual de personagens, ficha administrativa em nova aba e edição de inventário, capacidade de carga, atributos, HP e perícias.
  - Build passou com a rota dinâmica `/admin/personagens/[id]/ficha`.
  - Planilha técnica analisada e regras adicionais incorporadas em `dadosExtras`, incluindo classe customizada, BP, PE, insanidade, CA, iniciativa e dado de vida.
  - NPC Eldric Rawlins criado para o mestre existente; senha não utilizada porque o usuário esclareceu que Eldric é controlado pelo mestre.
  - Integração Google Workspace iniciada com OAuth mestre, tokens criptografados, status/desconexão e configuração de sincronização bidirecional.
- **2026-10-20 — Implementação das Melhorias Futuras (Roadmap do Jogador & Sistema)**:
  - Ficha Principal do Jogador: Novo componente `RecursosCombate.jsx` exibindo PE (Pontos de Energia), Insanidade, BP (Proficiência), CA (Classe de Armadura), Iniciativa (com rolagem d20 integrada) e Dado de Vida (com rolagem de descanso/cura).
  - Inventário & Mochila: Cálculo em tempo real da capacidade de carga (`calculateCapacity`) com alerta de sobrecarga, barra de progresso visual, filtros por categoria (Armas/Fórmulas, Consumíveis/Munições, Outros) e ordenação (A-Z, Quantidade asc/desc, Ordem original).
  - Painel de Contratos: Adicionada busca textual por título e recompensa combinada com filtros de status (Todos, Ativos, Concluídos).
  - Diário de Campanha: Adicionada busca textual por relato/título, tags/categorias temáticas (Missão, Rumor, Lore, Combate, Pessoal) com contadores, e ordenação (Mais recentes, Mais antigos, Título A-Z).
  - Cabeçalho Global: Indicador dinâmico de status de sincronização (`syncStatus`: Salvando, Salvo na Nuvem, Cache Local, Erro) visível em todas as telas.
  - Backup & Exportação JSON: Versionamento canônico de Schema v2 com metadados e validação estrita com saneamento automático via `validateCharacterSchema`.
  - Suíte de Testes: 59 testes automatizados de QA aprovados com 100% de sucesso em `backup.test.mjs` e `rules-and-dice.test.mjs`.
  - Build de Produção: 17 rotas estáticas e dinâmicas geradas com sucesso sem erros.
