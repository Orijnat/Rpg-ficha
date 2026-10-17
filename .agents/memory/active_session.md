# 📌 Memória Temporária de Sessão Ativa

> **Aviso ao Agente**: Este arquivo registra o prompt e o estado da sessão ativa para permitir a continuidade fluida entre diferentes sessões e garantir o uso obrigatório dos agentes especializados.

---

## 🕒 Metadados da Sessão
- **Última Atualização**: 2026-10-15T22:39:00Z
- **Status do Trabalho**: 🟢 **PRONTO PARA CONTINUAÇÃO**

---

## 💬 Últimas Requisições Registradas

### Requisição Atual (Configuração de Memória & Agentes):
```text
poderia fazer um aconfiuracao para que toda requisicao feita ele salve temporariamente em um memory o pormpt enviado para que possa ser continuado em outra seessao e que ao iniciar um prompt ele sempre use os aentes
```
- **Status**: ✅ **CONCLUÍDO**
- **Arquivos Implementados**:
  - `.agents/hooks.json` (hooks de ciclo de vida `PreInvocation` e `SessionStart`)
  - `.agents/scripts/sync_session_memory.js` (script de extração de prompt e injeção de diretriz)
  - `AGENTS.md` e `GEMINI.md` (regras estritas para o modelo sempre salvar a memória e usar os agentes)
  - `.agents/memory/last_prompt.json` e `.agents/memory/active_session.md` (armazenamento persistente)

### Requisição Anterior em Fila (Reformulação Visual do Front):
```text
poderia reformular o layout do front, poderia fazer um layout mais oranizador com detales mais bonitos e um pouco menos minimalista
```
- **Status**: 🟡 **PRONTA PARA CONTINUAR**
- **Sub-agente Responsável**: `frontend-artisan` (memória: `.agents/memory/frontend-artisan.md`)
- **Skill**: `sheet-component-builder` (`.agents/skills/sheet-component-builder/SKILL.md`)
- **Plano de Execução**:
  1. Enriquecer cartões e containers com molduras ornamentadas Dark Fantasy (bordas duplas/acento temático, cantoneiras ou divisores estilizados).
  2. Aplicar tipografia temática (`Cinzel` e `Cinzel Decorative`) já carregadas no `globals.css` para títulos, badges e cabeçalhos.
  3. Reorganizar a Área do Jogador (`/personagem`): alinhar Atributos em grade mais estruturada, unificar Barra de Vida, Aparência e Perícias dentro de cartões consistentes.
  4. Melhorar o menu de navegação e cabeçalho com indicadores visuais mais ricos e menos planos.

### Requisição Atual (Reformulação Visual do Front):
```text
reformular o layout do front, fazer um layout mais organizado com detalhes mais bonitos e um pouco menos minimalista
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**: refinamento dos cartões, cabeçalhos de seção, grade de atributos, painel de identidade da personagem, vitalidade e navegação.
- **Validação**: `npm run build` concluído com sucesso; `npm run lint` mantém falhas preexistentes fora do escopo, além do aviso já existente em `ui.js`.

### Requisição Atual (Navegação e Aba de Anotações):
```text
ostaria que alterasse o estilo de naveacao e fassesse uma aba de anotacoes a parte e que permitisse enivar e mostrar imaens se possivel, e se necessario crie sub aentes para auxiliar na tarrefa
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Nova rota `/anotacoes` com cabeçalho próprio e anotações separadas da ficha principal.
  - Navegação com item dedicado, alvos de toque maiores, estado ativo ornamentado e feedback de interação.
  - Upload múltiplo de imagens, visualização em galeria e remoção individual.
  - Imagens armazenadas em `data.notesImages`, persistidas junto ao personagem no localStorage e na sincronização existente.
- **Validação**: `npm run build` concluído com sucesso com 17 rotas; lint direcionado sem erros, apenas aviso padrão do Next.js para `<img>`.

### Requisição Atual (Diário de Campanha):
```text
as anotacoes poderiam ser em forma de diario?
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Anotações convertidas para registros independentes de diário.
  - Cada entrada possui título, data, relato, imagens e ações de salvar/excluir.
  - Registros antigos em texto ou categorias continuam sendo exibidos por compatibilidade.
- **Validação**: build de produção concluído com sucesso; lint direcionado sem erros, apenas aviso do Next.js para `<img>`.

### Requisição Atual (Ambientação Visual):
```text
adicione detales ao site ele esta muito morto sem detale alum
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Adicionada textura de fundo em grade e iluminação atmosférica por tema.
  - Criados divisores ornamentais e molduras com cantos decorativos.
  - Cabeçalho recebeu emblema, tipografia temática e hierarquia visual mais forte.
  - Navegação recebeu faixa temática “Caminhos do destino” e maior profundidade visual.
- **Validação**: `npm run build` concluído com sucesso em 17 rotas; lint direcionado preserva apenas erro preexistente em `ui.js` relacionado ao `setState` dentro de `useEffect`.

### Requisição Atual (Fundo Mais Detalhado):
```text
poderia adiconar detales mais nitidos principalmente no fundo, pois esta com uma cara muito minimalista e eu nao osto muito disto
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Fundo global reforçado com camadas de linhas diagonais, pontos/runa, estrelas e iluminação temática.
  - Adicionadas rails laterais e inscrições verticais ornamentais em telas maiores.
  - Adicionada vinheta escura para concentrar o foco no conteúdo.
  - Mantida a textura fora dos cartões para preservar a leitura.
- **Validação**: `npm run build` concluído com sucesso em 17 rotas e `git diff --check` sem problemas.

### Requisição Atual (Background Mais Preenchido):
```text
poderia alterar o back round ele esta muito vazio
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Fundo recebeu círculos concêntricos de mapa arcano.
  - Adicionada malha de rotas diagonais e linhas de cartografia.
  - Adicionada rosa dos ventos central em telas grandes.
  - Mantidos sigilos laterais, vinheta, rails e textura anteriores.
- **Validação**: `npm run build` concluído com sucesso em 17 rotas e `git diff --check` sem problemas.

### Requisição Atual (Mudança Global de Estilo):
```text
o site como um todo esta minimalista e eu nao queria isso poderia alterar pra um outro estilo
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Linguagem visual migrada de dashboard para grimório/guilda medieval.
  - Cartões agora usam placas mais sólidas, bordas duplas e cantos menos arredondados.
  - Cabeçalho convertido em brasão/plaque de guilda.
  - Navegação convertida em faixa de metal/pergaminho com divisores verticais.
  - Cabeçalhos de seção ganharam medalhões, linhas fortes e losangos maiores.
  - Área principal ganhou moldura estrutural e textura mais contrastada.
- **Validação**: `npm run build` concluído com sucesso em 17 rotas e `git diff --check` sem problemas.

### Requisição Atual (Redesign Visual Não Minimalista):
```text
continua minimalista eu nao quero iso
```
- **Status**: ✅ **CONCLUÍDO**
- **Alterações realizadas**:
  - Adicionados selos arcanos circulares grandes no fundo.
  - Criadas faixas de pergaminho e cantos ornamentais visíveis.
  - Criada moldura vertical da área de conteúdo com linhas de mapa.
  - Aumentada a presença visual de bordas, símbolos e elementos decorativos em telas grandes.
- **Validação**: `npm run build` concluído com sucesso em 17 rotas e `git diff --check` sem problemas.

---

## 🤖 Mapeamento de Agentes para Continuidade
- **UI / Frontend**: [`frontend-artisan`](file:///home/cledi/rp/Rpg-ficha/.agents/memory/frontend-artisan.md)
- **Regras Matemáticas / Atributos**: [`rpg-rules-engine`](file:///home/cledi/rp/Rpg-ficha/.agents/memory/rpg-rules-engine.md)
- **Dados & Rolagens**: [`dice-mechanic`](file:///home/cledi/rp/Rpg-ficha/.agents/memory/dice-mechanic.md)
- **Backend & Banco de Dados**: [`backend-database`](file:///home/cledi/rp/Rpg-ficha/.agents/memory/backend-database.md)
- **QA & Testes**: [`qa-tester`](file:///home/cledi/rp/Rpg-ficha/.agents/memory/qa-tester.md)

### Continuidade — Sala do Mestre
- **Status**: MVP inicial implementado e validado.
- **Arquivos alterados**: `src/app/admin/page.js`, `src/app/admin/layout.js`, `src/app/admin/personagens/page.js`.
- **Recursos**: dashboard da campanha, resumo de heróis/NPCs, preparação de sessão, NPCs locais, tracker de iniciativa e links para fichas.
- **Persistência**: preparação, NPCs e iniciativa em `localStorage` (`rpg-gm-dashboard`); personagens continuam vindo de `/api/characters`.
- **Validação**: `npm run build` e `git diff --check` concluídos com sucesso.
- **Próximo passo recomendado**: criar endpoints persistentes para campanha, encontros, NPCs e sessões quando a camada de backend estiver disponível.

### Continuidade — Perfis mestre/jogador
- **Status**: ✅ Implementado no frontend e no backend.
- **Banco**: `users.role` com valores `player` e `master`; novas contas começam como `player`.
- **Autorização**: jogadores acessam apenas os próprios personagens; mestres podem gerenciar todos.
- **Privacidade**: `bankPassword` é removida das respostas da API; verificação do cofre continua server-side.
- **Frontend**: aba Admin só aparece para mestres e o dashboard informa quando o acesso é reservado.
- **Validação**: build do frontend e `node --check` do backend concluídos com sucesso.

### Continuidade — Proteção de rotas
- **Status**: ✅ Implementado.
- **Alteração**: `AppChrome` agora verifica a sessão globalmente e redireciona usuários não autenticados para `/login`.
- **Exceções**: `/login` e `/registro` continuam públicas.
- **Feedback**: enquanto a sessão é verificada, as rotas protegidas exibem “Verificando acesso...”.
- **Validação**: `npm run build` e `git diff --check` concluídos com sucesso.

### Continuidade — Mapeamento e persistência completa
- **Status**: ✅ Implementado e validado.
- **Backend**: modelos `User` e `Character` ampliados com campos canônicos em português, coleções JSONB e dados privados do mestre.
- **API**: criado `/api/campanha`; personagens convertem nomes da interface para o modelo persistido e preservam compatibilidade.
- **Frontend**: sala do mestre passou a salvar dados no backend, com fallback local; `CharacterContext` normaliza dados persistidos para a ficha.
- **Documentação**: criado `Rpg-backend/docs/modelo-dados.md` com o mapa das entidades, campos, segurança e compatibilidade.
- **Validação**: build frontend, `node --check` do backend e `git diff --check` passaram.

### Continuidade — Agente de mapeamento do banco
- **Status**: ✅ Criado no workspace.
- **Arquivo**: `.github/agents/mapeador-banco.agent.md`.
- **Responsabilidade**: mapear requisitos do sistema para entidades PostgreSQL/Sequelize,
  comparar frontend/API/banco, tratar perfis mestre/jogador e orientar migrations.
- **Ferramentas**: leitura, busca, execução e edição; não cria commits automaticamente.

### Continuidade — Equipe especializada frontend/backend
- **Status**: ✅ Criada e validada.
- **Agentes**: `frontend-artisan`, `backend-database`, `contrato-integracao` e `orquestrador-fullstack` em `.github/agents/`.
- **Skills**: `frontend-rpg`, `backend-rpg` e `contrato-api-rpg` em `.github/skills/`.
- **Memória compartilhada**: `.agents/memory/contrato-integracao.md` registra DTOs, aliases, permissões, erros HTTP e ordem de rollout.
- **Próximo passo recomendado**: usar o orquestrador para funcionalidades que atravessem UI, API e banco; usar especialistas diretamente para tarefas isoladas.

### Confirmação — Agente especializado de backend
- **Status**: ✅ Confirmado.
- **Agente localizado no workspace**: `.github/agents/backend-database.agent.md`.
- **Skill associada**: `.github/skills/backend-rpg/SKILL.md`.
- **Memória associada**: `.agents/memory/backend-database.md`.
- **Integração obrigatória**: `.agents/memory/contrato-integracao.md`.

### Continuidade — Conta mestre
- **Status**: ✅ Criada e verificada no PostgreSQL local.
- **Perfil**: `mestre` (`role=master`).
- **Nome de usuário**: `cledi`.
- **E-mail**: `cledivanleao@gmail.com`.
- **Segurança**: senha armazenada somente como hash via hook `bcrypt`; nunca registrar a senha em memória, logs ou documentação.
- **Verificação**: credencial validada com `checkPassword`, hash confirmado e conta existente.

### Continuidade — Aplicação do banco.sql
- **Status**: ✅ Schema aplicado no PostgreSQL local.
- **Arquivo executado**: `/home/cledi/rp/Rpg-backend/database/banco.sql`.
- **Resultado**: 18 tabelas novas, índices, constraints, comentários e triggers criados/verificados.
- **Conta mestre**: presente em `usuarios` com perfil `mestre`.
- **Observação**: a migração opcional das tabelas legadas `characters`, `inventory_items` e `contracts` não foi executada por falta de permissão de leitura do usuário PostgreSQL; o novo schema permaneceu aplicado e o SQL foi ajustado para continuar sem falhar nessa condição.
- **Pendência**: conceder `SELECT` nas tabelas legadas e executar somente a etapa de migração quando os dados antigos precisarem ser transportados.

### Continuidade — Animação do rolador de dados
- **Status**: ✅ Implementada, corrigida e validada.
- **Arquivos**: `src/app/components/dice/DiceModal.jsx` e `src/app/globals.css`.
- **Detalhes**: dados numerados entram com giro 3D, quique e aura; vantagem/desvantagem exibem os dois resultados, e rolagens múltiplas exibem seus dados.
- **Segurança funcional**: a animação usa exclusivamente os valores retornados por `rollDice`; não altera a aleatoriedade nem o total real.
- **Acessibilidade**: `role="img"` com descrição da rolagem e redução de movimento via `prefers-reduced-motion`.
- **Correção adicional**: criado estado explícito `isRolling` no `DiceContext`, com duração visual de 1,4 s e seleção automática do conteúdo de resultado mesmo quando a aba anterior era Histórico.
- **Validação**: `git diff --check` e `npm run build` passaram após a correção.
- **Aprimoramento visual**: a silhueta foi alterada para um d20 facetado, com múltiplas rotações nos eixos X/Y e sombreamento interno para simular faces do poliedro.

### Continuidade — Equipe de agentes e skills do ecossistema RPG
- **Status**: ✅ Aplicado.
- **Agentes criados**: `frontend-jogador-rpg`, `frontend-mestre-rpg`, `motor-regras-rpg`, `mecanica-dados-rpg`, `seguranca-identidade-rpg`, `qa-rpg` e `documentacao-rpg`.
- **Skills criadas**: frontend jogador/mestre, motor de regras, dados, autenticação, autorização, uploads, QA, segurança e documentação.
- **Memórias criadas**: arquivos correspondentes em `.agents/memory/`.
- **Integração**: o `orquestrador-fullstack.agent.md` agora pode acionar os novos especialistas.

### Continuidade — Análise geral e melhorias do ecossistema
- **Status**: ✅ Primeira fase implementada.
- **Rolagem**: motor com aleatoriedade injetável, suporte consistente a múltiplos dados e modal acessível com animação d20.
- **Área do Mestre**: proteção de rota reforçada, operações administrativas centralizadas no cliente autenticado e tratamento de erros nas telas de personagens.
- **Área do Jogador**: ficha passou a exibir estado de sincronização (`Salvando`, `Salvo`, `Salvo localmente` ou falha).
- **Segurança**: backend remove campos de identidade controlados pelo cliente, filtra senha do cofre, exige `JWT_SECRET` e rejeita usuários inativos.
- **Documentação**: criado `docs/MELHORIAS-FUTURAS-RPG.md` com análise, prioridades, riscos e roadmap.
- **Validação**: frontend build, testes direcionados de regras/dados (26 aprovados), `git diff --check` e `node --check` do backend passaram.

### Correção — Sala do Mestre sem dados de iniciativa
- **Problema**: a API da campanha retorna campos canônicos em português (`iniciativa`, `tituloSessao`, `anotacoesSessao`), enquanto a tela esperava aliases em inglês; isso fazia `table.initiative.length` lançar erro quando o campo não existia.
- **Correção**: adicionada normalização defensiva de campanha e cache local, com aliases português/inglês e garantia de arrays para `npcs` e `initiative`.
- **Validação**: `npm run build` e `git diff --check` passaram.

### Correção — Dados do backend sobrescritos pelo cache local
- **Problema**: o `CharacterContext` carregava `bruxeiro-sheet` após a hidratação da sessão e podia sobrescrever os dados completos recebidos do backend. Além disso, arrays vazios retornados pela API eram ignorados em favor de valores antigos.
- **Correção**: o cache agora é usado apenas como fallback sem personagem autenticado, é separado por personagem (`bruxeiro-sheet:<id>`) e a normalização usa `??`, preservando arrays vazios válidos do backend.
- **Validação**: `npm run build` e `git diff --check` passaram.

### Correção — Erro interno ao listar personagens
- **Causa**: `characterController.list` solicitava o atributo Sequelize `updatedAt`, mas a tabela PostgreSQL usa `updated_at`; a consulta falhava com `column "updatedAt" does not exist`.
- **Correção**: removida a seleção desse atributo de resumo; a ordenação por `updated_at` foi mantida.
- **Validação**: consulta real executada contra PostgreSQL com sucesso, `node --check` e `git diff --check` passaram.

### Correção — Aliases de ficha e moedas no contrato
- **Problema**: Sequelize persistia arrays/moedas nos campos em português,
  enquanto telas legadas editavam aliases em inglês e moedas planas. Defaults
  `[]` também podiam ocultar aliases antigos.
- **Correção**: controller agora serializa ambos os formatos, normaliza moedas
  no sync e mantém `bankPassword` fora do DTO; `CharacterContext` faz fallback
  por alias e o cliente desembrulha `{ character }` do sync.
- **Validação**: build, testes unitários do frontend e `node --check` do
  backend passaram.

### Continuidade — Retomada da correção de dados do backend
- **Pedido retomado**: continuar a verificação de dados que não eram carregados do backend.
- **Estado**: ✅ Correção já aplicada e confirmada no código atual.
- **Validação adicional**: `npm run build` passou com 17 rotas; `git diff --check` passou.
- **Próximo passo**: não há correção pendente relacionada a esse pedido; aguardar nova demanda ou um caso específico reproduzível.

### Confirmação — Prompt extenso anterior
- **Pedido**: confirmar a disponibilidade do prompt extenso solicitado anteriormente.
- **Estado**: ✅ O contexto permanece disponível nas memórias persistentes da sessão.

### Verificação — Alterações do prompt extenso
- **Pendência encontrada**: a normalização de coleções no `CharacterContext` ainda trocava arrays canônicos vazios por aliases antigos.
- **Correção aplicada**: coleções canônicas agora usam `??`, preservando `[]` retornado pelo backend como estado válido.
- **Validação**: `npm run build`, `node --test src/lib/__tests__/rules-and-dice.test.mjs` (26 aprovados) e `git diff --check` passaram.
