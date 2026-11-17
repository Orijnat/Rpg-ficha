# Memória do Sub-agente: dice-mechanic

## 🎯 Escopo e Responsabilidade
Motor de rolagem de dados virtuais com bônus, notação d20, mecânicas de Vantagem/Desvantagem e histórico da sessão.

---

## 🎲 Padrões de Rolagem Definidos
1. **Modo Normal**:
   - `1d20 + mod`.
2. **Modo Vantagem**:
   - Rola 2 dados (`d1`, `d2`).
   - `kept = Math.max(d1, d2)`.
   - `discarded = Math.min(d1, d2)`.
   - `total = kept + mod`.
3. **Modo Desvantagem**:
   - Rola 2 dados (`d1`, `d2`).
   - `kept = Math.min(d1, d2)`.
   - `discarded = Math.max(d1, d2)`.
   - `total = kept + mod`.
4. **Críticos**:
   - `isCriticalSuccess = (kept === 20)`.
   - `isCriticalFailure = (kept === 1)`.

---

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `src/lib/dice.js` (Implementado: rollDice com vantagem/desvantagem, rollCheck e parseAndRollFormula)
- `src/app/context/DiceContext.jsx` (Implementado: estado global, promptRoll, executeRoll e histórico)
- `src/app/components/dice/DiceModal.jsx` (Implementado: modal de seleção de modo e resultado)
- `src/app/components/dice/DiceFace.jsx` (Implementado 2026-11-17: faces SVG por tipo — d2 moeda (CARA/COROA), d4 tetraedro, d6 pips 1-6, d8 octaedro, d10/d100 kite, d12 pentágono, d20 hexágono wireframe; números em Cinzel `var(--font-cinzel)` e `var(--theme-accent)`/`var(--theme-accent-contrast)`)
- `src/app/components/dice/DiceFloatingTrigger.jsx` (Implementado: botão de acesso rápido)

---

## 📌 Histórico de Alterações e Decisões
- **2026-11-17**: Animação de rolagem **refeita do zero**. Descoberta: o CSS `.dice-*` havia sido DELETADO no rewrite do globals.css (231b39e, out/26) — o JSX referenciava classes inexistentes (animação invisível/quebrada). Nova implementação: `DiceFace.jsx` (SVG por tipo de dado, pedido do usuário: moeda para d2 + d4, d6, d8, d10, d12, d20, d100), `DiceModal.jsx` (`DiceRollAnimation` com stage próprio, `dice-tumble`/`dice-tumble-alt`/`dice-coin` (coin flip rotateY 1440°), crítico via `data-crit`, dado descartado esmaecido, stagger 110ms/dado, tamanho adaptativo ≥4 dados), `globals.css` (bloco novo `.dice-roll-*` com tokens `--theme-accent*` + keyframes `dice-tumble`, `dice-tumble-alt`, `dice-coin-flip`, `dice-shadow-pulse`; reduced-motion). `DICE_TYPES` ganhou **d2**. JSDoc de `lib/dice.js` atualizado. Verificação: 161/161 testes, build OK, lint 0 erros (44 warnings pré-existentes). UX no navegador AINDA não conferida.
- **2026-10-15**:
  - Especificação do formato de retorno detalhado (contendo rolls, kept, discarded, formula e total).
  - Criação da skill `dice-roller` em `.agents/skills/dice-roller/SKILL.md`.
  - Implementação completa de `src/lib/dice.js` com suporte a detecção de crítico natural (20 e 1), vantagens (`2d20kh1`) e desvantagens (`2d20kl1`).
  - Criação do `DiceContext` e integração da bandeja flutuante e modal de dados.

---

## 📋 Próximas Ações
- [x] Implementar `src/lib/dice.js` com suporte a dados múltiplos e modificadores positivos/negativos.
- [x] Criar o contexto de dados `DiceContext` e o componente de histórico/bandeja na Fase 2.
- [x] Adicionar animação visual de rolagem no resultado do `DiceModal`, preservando o valor real calculado pelo motor e respeitando `prefers-reduced-motion` (REFEITA em 2026-11-17: CSS havia sumido; nova versão SVG por tipo com moeda d2).
- [x] Garantir ciclo visual explícito de rolagem por 1,4 s e exibir o resultado mesmo quando outra aba do modal estava selecionada.
- [x] Aproximar a animação do estilo Roll20 com silhueta facetada de d20 e rotações amplas nos eixos X/Y.
- [ ] Verificar a nova animação no navegador (todos os tipos d2–d100 + vantagem/desvantagem + críticos).
- [ ] Implementar persistência opcional de histórico de rolagens no banco (Fase 5).
