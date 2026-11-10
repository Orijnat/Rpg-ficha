# 🧠 Sessão Ativa — Grimorium RPG

**Última Atualização**: 2026-11-10T19:30:00-03:00  
**Branch Atual**: `main`  
**Status**: Concluída a expansão do motor de regras em `src/lib/modifiers.js` com 17 novas funções/constantes.

---

## ✅ Concluído Nesta Etapa

| Item | Detalhes |
|---|---|
| **calculateArmorClass** | CA = 10 + Mod(DES) + extra (dadosExtras.armorClass) |
| **calculatePE** | PE Max = Nível + Mod(ESP), mínimo 0 |
| **calculateBP** | BP Max = Nível + Mod(CAR), mínimo 0 |
| **calculateInsanity** | Insanidade Max = 10 + Mod(SAB), mínimo 0 |
| **calculateDerivedResources** | Agregador: HP, PE, BP, Insanidade, CA, Iniciativa, hitDie |
| **XP_TABLE** | Tabela de XP acumulado (20 níveis) |
| **calculateLevelFromXP** | Nível, XP atual, próximo nível, progresso % |
| **calculateXPForLevel** | XP necessário para um dado nível |
| **applyShortRest** | Rola dado de vida + Mod(CON) HP, restaura 25% PE |
| **applyLongRest** | 100% HP, 100% PE, reduz insanidade em 1 |
| **consumeAmmunition** | Consome qty do item, marca esgotado se 0 |
| **CURRENCY_RATES** | Taxas: latina=1000, ouro=100, prata=10, cobre=1 |
| **convertCurrency** | Converte entre moedas com fórmula |
| **totalWealthInCopper** | Riqueza total em cobres |
| **applyCondition** | Adiciona condição (sem duplicata) |
| **removeCondition** | Remove condição da lista ativa |
| **hasCondition** | Verifica se condição está ativa |

---

## 📋 Próximos Passos Recomendados
1. Integrar `calculateDerivedResources` nos componentes da ficha de personagem.
2. Criar UI de descanso curto/longo usando `applyShortRest` / `applyLongRest`.
3. Integrar `consumeAmmunition` no painel de inventário.
4. Adicionar conversor de moedas na UI de economia.
5. Conectar `calculateLevelFromXP` à barra de progresso de XP.
