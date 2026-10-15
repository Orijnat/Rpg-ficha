# Memória do Sub-agente: qa-tester

## 🎯 Escopo e Responsabilidade
Garantia de qualidade, validação de edge cases matemáticos nas regras d20, precisão do descarte de dados com vantagens/desvantagens e prevenção de bugs de hidratação.

---

## 🧪 Casos de Teste Mapeados
1. **Cálculo de Modificadores d20**:
   - `valor = 10` -> `mod = 0`
   - `valor = 11` -> `mod = 0`
   - `valor = 12` -> `mod = +1`
   - `valor = 13` -> `mod = +1`
   - `valor = 14` -> `mod = +2`
   - `valor = 8` -> `mod = -1`
   - `valor = 9` -> `mod = -1`
   - `valor = 7` -> `mod = -2`
2. **Rolagem de Dados com Vantagem**:
   - Dados `[3, 17]` com bônus `+4`: Mantém `17`, descarta `3`, total `21`.
3. **Rolagem de Dados com Desvantagem**:
   - Dados `[3, 17]` com bônus `+4`: Mantém `3`, descarta `17`, total `7`.
4. **Persistência e Hidratação**:
   - Sincronização entre `localStorage` e PostgreSQL sem sobrescrever dados mais recentes com valores padrão.

---

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `src/lib/__tests__/rules-and-dice.test.mjs` (Suíte de testes de regras e dados: 25 testes)
- `src/lib/__tests__/backup.test.mjs` (Suíte de integridade de backup, schema e serialização: 18 testes)

---

## 📌 Histórico de Alterações e Decisões
- **2026-10-15**:
  - Mapeamento da matriz de testes unitários para a Fase 1 (regras matemáticas e dados).
  - Criação e execução de `src/lib/__tests__/rules-and-dice.test.mjs`: 25 testes executados, 100% de sucesso.
  - Criação e execução de `src/lib/__tests__/backup.test.mjs`: 18 testes executados, 100% de sucesso.
  - Total acumulado: **43 testes automatizados executados com 0 falhas**.
  - Validação de build Next.js 16 com Turbopack: 14 de 14 rotas sem erros de pré-renderização ou hidratação.

---

## 📋 Próximas Ações
- [x] Criar suíte de testes de validação para `src/lib/modifiers.js` e `src/lib/dice.js`.
- [x] Validar a integração dos disparadores de dados na interface da ficha.
- [x] Criar testes de integridade para backup e importação/exportação JSON.
- [ ] Monitorar relatórios de sessão em mesas reais de jogo.


