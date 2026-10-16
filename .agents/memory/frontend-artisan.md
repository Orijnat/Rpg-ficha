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

## 🤝 Coordenação entre agentes
- Agente operacional: `.github/agents/frontend-artisan.agent.md`.
- Skill principal: `.github/skills/frontend-rpg/SKILL.md`.
- Antes de alterar API ou autenticação, consultar `.agents/memory/contrato-integracao.md`.
- Registrar no contrato qualquer novo endpoint, campo, erro ou permissão consumido pela UI.
