---
name: sheet-component-builder
description: Gera componentes React para a ficha seguindo Tailwind CSS v4, Lucide Icons e design responsivo dark fantasy.
---

# Skill: Sheet Component Builder

Esta skill orienta a criação de novos blocos e cartões da Área do Jogador.

## Padrão Visual e Estrutura:
1. **Container Principal (Card)**:
   - Fundo escuro com leve translucidez e borda sutil:
     `rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-md backdrop-blur-sm`
2. **Cabeçalho de Seção**:
   - Ícone temático da Lucide + título em caixa alta sutil:
     `flex items-center gap-2 border-b border-zinc-800/80 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400`
3. **Interatividade & Touch Targets**:
   - Botões com altura mínima de 44px em mobile ou `p-2` generoso.
   - Feedback ao clique: `active:scale-95 transition-transform duration-100`.
4. **Trigger de Rolagem**:
   - Elementos roláveis (ex: modificador ou perícia) devem exibir cursor pointer, ícone de dado sutil ou destaque ao passar o mouse (`hover:border-amber-500/50 hover:text-amber-400`).
