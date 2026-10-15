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
- `src/app/components/dice/DiceFloatingTrigger.jsx` (Implementado: botão de acesso rápido)

---

## 📌 Histórico de Alterações e Decisões
- **2026-10-15**:
  - Especificação do formato de retorno detalhado (contendo rolls, kept, discarded, formula e total).
  - Criação da skill `dice-roller` em `.agents/skills/dice-roller/SKILL.md`.
  - Implementação completa de `src/lib/dice.js` com suporte a detecção de crítico natural (20 e 1), vantagens (`2d20kh1`) e desvantagens (`2d20kl1`).
  - Criação do `DiceContext` e integração da bandeja flutuante e modal de dados.

---

## 📋 Próximas Ações
- [x] Implementar `src/lib/dice.js` com suporte a dados múltiplos e modificadores positivos/negativos.
- [x] Criar o contexto de dados `DiceContext` e o componente de histórico/bandeja na Fase 2.
- [ ] Implementar persistência opcional de histórico de rolagens no banco (Fase 5).


