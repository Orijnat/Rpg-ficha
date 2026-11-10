# 🧠 Sessão Ativa — Grimorium RPG

**Última Atualização**: 2026-11-10T19:30:00-03:00  
**Branch Atual**: `main`  
**Status**: Concluída a expansão do motor de regras em `src/lib/modifiers.js` com 17 novas funções/constantes.
**Última Atualização**: 2026-11-10T00:20:00-03:00
**Objetivo Atual**: Blindagem de estilo permanente e canônico na tela inicial pública (`/`), garantindo que ela nunca sofra alteração de estilo ou vazamento de temas claros/alternativos quando o usuário estiver logado ou mudar de tema.

---

## ✅ Concluído Nesta Sessão

| Item | Status |
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
| Diagnóstico e correção de `Crown is not defined` em `src/app/admin/layout.js` | ✅ |
| Separação e orquestração de rotas na sidebar para mestres e jogadores | ✅ |
| Barra de Pontos de Vida (PV) movida para o cabeçalho universal com controles rápidos | ✅ |
| Reformulação de estilo Dark Fantasy "Grimório Vivo" em todo o design system | ✅ |
| Inversão da ordem dos atributos (Valor em destaque principal + Bônus visível com gatilho de rolagem d20) | ✅ |
| Garantia de persistência universal de atributos e colunas no PostgreSQL/Sequelize | ✅ |
| Criação e Integração de Temas Claros de RPG (`parchment` e `sunlight`) | ✅ |
| **Blindagem Canônica da Tela Inicial (`/`)**: | ✅ |
| *`ThemeContext.jsx`*: Força reativamente `data-theme="amber"` no `document.documentElement` quando na rota `/`, restaurando instantaneamente o tema preferido do jogador ao navegar para a ficha ou painel | ✅ |
| *`AppShell.jsx`*: Atributo `data-theme="amber"` e background `#090b0e` / auras canônicas fixas quando `isLandingPage === true` | ✅ |
| *`src/app/page.js`*: Container raiz encapsulado com `data-theme="amber"`, paleta base `#090b0e` / `#ebd9be` e glows fixos de Âmbar Vulcânico | ✅ |
| *Refatoração de ESLint*: Remoção de warnings de `setState` em efeitos no `ThemeContext.jsx` com inicialização limpa | ✅ |
| ESLint: 0 erros, 0 avisos nos arquivos alterados | ✅ |
| Testes Unitários de Temas: 100% aprovados (`node --test src/lib/__tests__/themes.test.mjs`) | ✅ |
| Next.js 16 Production Build: 100% aprovado em 2.4s nas 28 rotas | ✅ |
| Commit e push das implementações no repositório remoto (`ffd0162` -> `origin/main`) | ✅ |

---

## 📋 Arquivos Alterados
- `src/app/context/ThemeContext.jsx`
- `src/layouts/AppShell.jsx`
- `src/app/page.js`
- `src/lib/themes.js`
- `src/lib/__tests__/themes.test.mjs`
- `src/app/globals.css`
- `src/app/components/SettingsModal.jsx`
- `src/app/components/ThemeSelector.jsx`
- `.agents/memory/active_session.md`
- `.agents/memory/last_prompt.json`
- `.agents/memory/frontend-artisan.md`
## 📋 Próximos Passos Recomendados
1. Integrar `calculateDerivedResources` nos componentes da ficha de personagem.
2. Criar UI de descanso curto/longo usando `applyShortRest` / `applyLongRest`.
3. Integrar `consumeAmmunition` no painel de inventário.
4. Adicionar conversor de moedas na UI de economia.
5. Conectar `calculateLevelFromXP` à barra de progresso de XP.
