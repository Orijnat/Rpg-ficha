# Memória do Sub-agente: frontend-artisan

## 🎯 Escopo e Responsabilidade
UI/UX da Área do Jogador, componentes React 19, Tailwind CSS v4, responsividade mobile-first e microinterações.

---

## 🎨 Padrões Visuais Estabelecidos
- **Tema**: Dark fantasy moderno.
- **Paleta**:
  - Superfícies: `zinc-950` / `zinc-900` com bordas `zinc-800`.
  - Destaques de atributos: Tons âmbar/dourado (`amber-400`, `amber-500`).
  - Destaques mágicos/espírito: Púrpura/violeta (`violet-400`, `indigo-400`).
  - Vida/HP: Vermelho/esmeralda (`rose-500`, `emerald-500`).
- **Acessibilidade e Mobile**:
  - Touch target mínimo de 44x44px.
  - Animações leves com `active:scale-95 transition-all`.

---

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `src/app/components/dice/DiceModal.jsx` (Modal com modos normal/vantagem/desvantagem, dados descartados e histórico)
- `src/app/components/dice/DiceFloatingTrigger.jsx` (Botão flutuante na tela para acesso rápido à mesa de rolagem)
- `src/app/components/Pericia.jsx` (Cálculo dinâmico e gatilho de rolagem com um toque)
- `src/app/components/ui.js` (`StatBox` com botão de teste de atributo d20)
- `src/app/components/habilidades/AbilityCard.jsx` (Card de habilidade Dark Fantasy com PE, nível, rolador e barra de treino)
- `src/app/components/habilidades/AbilityFormModal.jsx` (Modal de criação/edição de habilidades e magias)
- `src/app/habilidades/page.js` (Tela completa de Habilidades & Treinamento com filtros, busca e árvore por nível)
- `src/app/layout.js` (Integração global com `DiceProvider`)

---

## 📌 Histórico de Alterações e Decisões
- **2026-10-15**:
  - Mapeamento da estrutura existente de páginas e componentes da ficha.
  - Implementação do `DiceModal` com animações, glow para 20 natural (verde) e 1 natural (vermelho), descarte visual de dados em vantagem/desvantagem e bandeja de dados avulsos.
  - Criação do `DiceFloatingTrigger` no canto inferior direito para acesso universal.
  - Refatoração do `StatBox` e de `Pericia.jsx` para disparar rolagens instantaneamente ao clicar nos modificadores.
  - **Fase 4 Concluída**:
    * `src/app/inventario/page.js`: Barra de pesquisa de itens, correção do mapeamento de moedas (latina/platina), contadores e atalhos de rolagem de dados para itens de dano/armas.
    * `src/app/contratos/page.js`: Filtros rápidos (Todos, Ativos, Concluídos), contadores de progresso e visual renovado.
    * `src/app/montaria/page.js`: Vitalidade interativa com botões de dano (-5, -1), cura (+1, +5) e restauração máxima.
    * `src/app/quarto/page.js`: Sistema de descanso curto (1d8 + CON) e descanso longo (100% PV recuperados para personagem e montaria).
  - **Fase 5 Concluída**:
    * `src/app/components/BackupModal.jsx`: Modal de exportação de ficha (download `.json`), importação de backup e sincronização manual com o PostgreSQL.
    * `src/app/components/Cabecalho.jsx`: Botão de configurações e backup integrado ao topo da aplicação.
  - **Fase de Temas & Layout Dinâmico Concluída**:
    * `src/app/layout.js`: Envolvido com `ThemeProvider`, gradientes de iluminação ambiente dinâmicos (`radial-gradient` reativos à cor primária do tema ativo), tabs e barras adaptativas.
    * `src/app/components/Cabecalho.jsx`: Integrado o `ThemeSelector` permitindo alternância entre os 5 temas (Pergaminho Dourado, Sangue de Dragão, Floresta Élfica, Arcano Púrpura, Gelo do Norte).
    * `src/app/globals.css`: Adicionada variável de iluminação ambiente `--glow-primary` para cada tema e suporte no `@theme inline`.
    * Migração de cores hardcoded para tokens semânticos em `ui.js`, `BackupModal.jsx`, `Aparencia.jsx`, `BarrraHp.jsx` e `banco/constants.js`.
  - Validação do build de produção Turbopack do Next.js 16 sem nenhum erro em todas as 16 rotas.
- **2026-10-20 — Melhorias do Roadmap (Fase 19)**:
  - Criação do `RecursosCombate.jsx` com barras e controles de PE (azul ciano), Insanidade (púrpura sombria), BP (dourado), CA (escudo), Iniciativa e Dado de Vida com rolagens interativas.
  - Atualização do `Personagem/page.js` com painel de recursos de combate e resumo dinâmico de capacidade de carga com barra de progresso.
  - Atualização do `Cabecalho.jsx` para exibir badge de `syncStatus` em tempo real.
  - Atualização do `InventarioPage`: capacidade de carga com cálculo dinâmico e aviso de sobrecarga, filtros de categoria (Armas/Fórmulas, Consumíveis/Munições, Outros) e ordenação multinível.
  - Atualização do `ContratosPage`: barra de pesquisa textual por título e recompensa combinada com filtros de status.
  - Atualização do `Anotacoes.jsx`: pesquisa em tempo real, categorias/tags coloridas (Missão, Rumor, Lore, Combate, Pessoal) e ordenação por data e título.
  - Atualização do `BackupModal.jsx`: suporte para schema versionado (v2) e feedback detalhado de importação.

---

## 📋 Próximas Ações
- [x] Criar componente visual flutuante da bandeja de dados e modal de rolagem.
- [x] Atualizar o componente de perícias para permitir rolagem direta com 1 clique.
- [x] Conectar e aprimorar os módulos da ficha (inventário, contratos, montaria, quarto).
- [x] Implementar exportação/backup da ficha (JSON/Nuvem) e testes finais de estresse.
- [x] Integrar seletor de temas e plano de fundo/iluminação dinâmico na interface.
- [x] Refinar cartões, cabeçalhos, navegação e composição da página principal da ficha para uma estética Dark Fantasy mais ornamentada.
- [x] Criar navegação dedicada para anotações e galeria visual com upload de imagens.
- [x] Reorganizar anotações como diário de campanha com entradas datadas e imagens vinculadas.
- [x] Adicionar ambientação visual global, molduras e detalhes ornamentais ao shell da aplicação.
- [x] Reforçar o fundo com textura visível, estrelas/rúnicas, laterais ornamentais e vinheta.
- [x] Criar composição visual expressiva com selos arcanos, faixas de pergaminho e moldura da área principal.
- [x] Substituir linguagem minimalista por composição de grimório/guilda com placas sólidas, molduras e navegação de metal.
- [x] Ocultar condicionalmente a barra de navegação, cabeçalho da ficha e botão flutuante de dados em telas de autenticação (`/login` e `/registro`) e fichas isoladas de admin em `src/app/layout.js`.
- [x] Concluir todos os itens da Seção 2 (Frontend do Jogador) do COISAS-A-FAZER.md:
  * Exibir PE, BP, insanidade, CA, iniciativa e dado de vida na ficha.
  * Exibir e calcular corretamente a capacidade de carga ponderada (peso * qty) com alerta de sobrecarga.
  * Bloqueio visual solene com LockKeyhole em campos restritos ao mestre (hpMax, peMax, insanityMax, bpMax, armorClass).
  * Validação numérica universal com limites inteiros, clamping e aria-invalid.
  * Estados visuais completos em todas as telas (loading, vazio, sucesso, erro).
  * Acessibilidade completa: navegação por teclado, foco visível com ring primário, ARIA roles/labels, WCAG e prefers-reduced-motion.
  * Suporte responsivo mobile-first, tablet e desktop.
  * Gestão de perfil, temas e encerramento de sessão local/remoto.
  * Exportação e importação JSON com validação de Schema v2.
  * Adição de Diário e Perfil na barra de navegação global (TABS).

## 🤝 Coordenação entre agentes
- Agente operacional: `.github/agents/frontend-artisan.agent.md`.
- Skill principal: `.github/skills/frontend-rpg/SKILL.md`.
- Antes de alterar API ou autenticação, consultar `.agents/memory/contrato-integracao.md`.
- Registrar no contrato qualquer novo endpoint, campo, erro ou permissão consumido pela UI.

### Entrega — Landing pública
- A rota `/` deixou de redirecionar diretamente para `/login` e agora apresenta
  uma landing page pública com proposta de valor, recursos para jogadores e
  mestres e chamadas para login/cadastro.
- A landing usa o tema dark fantasy existente, é responsiva, possui navegação
  por teclado e não consome novos endpoints.

### Hardening P0/P1 — 2026-11-04
- `src/lib/api.js`: JWT passou a ser mantido preferencialmente em
  `sessionStorage`; tokens legados em `localStorage` são migrados uma vez e
  removidos. O contrato atual de autenticação Bearer não foi alterado.
- `src/lib/api.js`: erros HTTP agora carregam `status`, `code` e `details`;
  `syncCharacterWithBackend` não mascara mais falhas/conflicts como sucesso
  offline.
- `src/app/context/CharacterContext.js`: sincronização debounced recebe
  sequência anti-stale, mantém cache local como fallback, expõe erro/conflito e

### Refinamento visual transversal — 2026-11-05
- `globals.css`: adicionados textura/iluminação de fundo, seleção, scrollbar,
  molduras ornamentais, estados de interação e campos com foco consistente.
- `AppShell`, `Cabecalho` e `Card`: alinhados aos tokens semânticos dos temas,
  com navegação, cabeçalho e cartões mais coesos e responsivos.
- Build aprovado; lint sem erros, mantendo apenas warnings preexistentes.al como fallback, expõe erro/conflito e

### Restauração do Padrão de Cores Dark Fantasy com Sidebar — 2026-11-05
- Preservada a sidebar desktop fixa (`lg:w-64`) e navegação móvel adaptada em `AppShell.jsx`.
- Restaurado o padrão de cores dark fantasy anterior em sua totalidade: fontes Cinzel/Inter, auras temáticas, gradientes dinâmicos de glow, fundo `#0b0d12` reativo aos 5 temas e molduras `ornate-frame`.
- `Cabecalho.jsx` e `Card` em `ui.js` mantidos com a moldura e elevação originais, integrando-se harmonicamente à margem da sidebar.
- Topo temático adicionado à sidebar desktop ("Grimório - Coração da Montanha").
- Validação: 27 testes unitários 100% OK, build Next.js (25 rotas) concluído com sucesso e `git diff --check` aprovado.

### Repaginação editorial/tática — 2026-11-05
- Criada uma direção visual distinta da estética dark-fantasy ornamentada:
  base clara editorial, terracota, azul-petróleo, tipografia DM Sans/Space
  Grotesk, cards planos e navegação lateral no desktop.
- `AppShell`, `Cabecalho`, `Card` e tokens globais foram atualizados sem
  modificar páginas de domínio ou contratos de API.
- Build aprovado; lint sem erros, mantendo apenas warnings preexistentes.al como fallback, expõe erro/conflito e
  `retrySync`.
- `src/app/personagem/page.js`: indicador de sincronização anuncia estado,
  distingue conflito HTTP 409 e oferece tentativa explícita novamente.
- `src/layouts/AppShell.jsx` e `src/app/components/SettingsModal.jsx`:
  navegação com `aria-current`, alvos de toque/foco visível e modal com
  semântica de diálogo.
- Validação: 27 testes frontend passaram, build Next.js 16 passou, lint passou
  com avisos/diagnósticos preexistentes; `git diff --check` passou.
- Pendência: resolução automática de conflito por campo exige versão/ETag ou
  contrato backend; a UI preserva o rascunho local e não sobrescreve dados
  silenciosamente.
- `AppShell` oculta cabeçalho, navegação autenticada e botão de dados na rota
  pública, preservando o layout de autenticação.

### Reformulação Visual de Alta Fidelidade (Jogador & Mestre) — 2026-11-09
- Ativação da skill `frontend-design` para dar identidade artesanal única (Grimório Vivo + Sala de Guerra Tática):
  * **Tipografia Imersiva**: Vinculação real de `Cinzel`, `Cinzel Decorative` e `Crimson Text` no CSS base e tokens semânticos (`font-cinzel`, `font-decorative`, `font-journal`).
  * **Tokens e Superfícies Folio**: Criação das classes `.grimoire-card` (cartões de pergaminho/velino com cantoneiras de ferro/bronze) e `.war-room-card` (consoles com acabamento obsidiana e chanfro tático).
  * **Cabeçalho Contextual (`Cabecalho.jsx`)**: Distingue visualmente o papel de Jogador (nome do aventureiro, nível, frasco de PV e tema) do Mestre (insígnia da Soberania do Narrador, título da sessão e atalhos rápidos).
  * **Sidebar Distinta (`AppShell.jsx`)**: Separação clara entre a jornada do herói ("Folio do Jogador") e a seção de comando ("Narrador / Câmara do Mestre").
  * **Medalhões de Atributo Arcanos (`StatBox` em `ui.js`)**: O modificador (ex: `+3`, `-1`) é destacado como elemento central e clicável para rolagem imediata, com d20 animado e escore base preservado.
  * **Sala de Guerra Tática (`admin/page.js` e `admin/layout.js`)**: Iniciativa com indicação luminosa do turno ativo, botões táteis de PV (`-5`, `-1`, `+1`, `+5`) e fichas de condição em formato de selo de cera (`.wax-seal`).
  * **Limpeza de Hardcoded Colors**: Telas de Perícias, Quarto, Montaria e Mundo migradas para tokens do sistema de temas.
- Validação: 38 testes de regras/dados 100% aprovados, build Turbopack Next.js 16 (26 rotas) executado sem nenhum erro.

### Reformulação "Grimório Vivo" (Atmosfera & Alma Dark Fantasy) — 2026-11-09
- Resposta à demanda de visual sem alma/estéril:
  * **Luz de Tocha e Atmosfera**: Implementadas animações `@keyframes torch-flicker` e `@keyframes rune-pulse`, vinheta focal de candeia e textura tátil de pergaminho/grain escuro no `body`.
  * **Gradientes Metálicos Nobres**: Criadas classes `.gold-gradient-text`, `.ruby-gradient-text` e `.arcane-gradient-text` aplicadas nos nomes de personagens, títulos principais e valores de atributos.
  * **Superfícies de Pergaminho e Bronze**: `.grimoire-card` reconstruído com iluminação interna de velino, sombra profunda 3D, filigrana dourada central e cantos de bronze forjado reativos ao hover (`.bracket-corners`).
  * **Medalhões dos 7 Atributos**: `StatBox` redesenhado como selos arcanos escavados em relevo com modificador destacado em ouro, d20 interativo com rotação no hover.
  * **Frascos Alquímicos de Vitalidade**: `HPBar` reconstruída com reflexo de vidro alquímico (`.alchemy-vial`), brilho volumétrico do líquido vital e pulso de urgência (`.pulsing-danger`).
  * **Console do Códice na Sidebar & Cabeçalho**: Navegação com itens em placas de guilda, divisores com nós rúnicos e selos de cera com relevo real.
- Validação: Next.js 16 build (28 rotas) concluído com 100% de sucesso. Lint 0 erros.

### Temas Claros & Blindagem da Tela Inicial Pública — 2026-11-10
- **Novos Temas Claros Temáticos**:
  * `parchment` (Pergaminho Antigo): Fundo papiro claro envelhecido (`#f4eedd`), texto nanquim sépia (`#2a1a0f`), bordas de couro/bronze e medalhões em relevo escuro.
  * `sunlight` (Catedral da Luz): Mármore sacro (`#f8fafc`), texto chumbo/ônix (`#0f172a`), filigranas solares douradas reluzentes e aço polido.
- **Blindagem Canônica da Landing Page (`/`)**:
  * A tela inicial nunca herda nem é corrompida por temas claros ou alternativos quando o usuário está logado ou alterna o tema na ficha.
  * `ThemeContext.jsx` monitora `pathname` via `usePathname()` e força `data-theme="amber"` no `document.documentElement` ao acessar `/`, restaurando instantaneamente o tema preferido do jogador ao navegar para `/personagem`, `/admin`, etc.
  * `src/app/page.js` e `src/layouts/AppShell.jsx` foram encapsulados com atributo explícito `data-theme="amber"`, plano de fundo fixo `#090b0e` e auras místicas âmbar canônicas, prevenindo qualquer FOUC ou vazamento visual.
- **Validação**: Testes unitários de temas 100% aprovados, ESLint 0 erros/0 warnings e build Next.js 16 em 2.4s.
