# Memória do Sub-agente: QA Judge (Tribunal de Qualidade)

## 🎯 Escopo e Responsabilidade
Julgar a qualidade da aplicação (e de telas/componentes) em quatro eixos:
**responsividade**, **beleza/coerência visual**, **falhas/robustez** e
**acessibilidade**. Não corrige código — emite veredicto fundamentado com
evidências e delega correções ao especialista adequado.

## ⚖️ Rubrica de Avaliação

| Eixo | Peso | O que cobre |
|---|---|---|
| Responsividade | 25% | 320–1920px sem overflow; toque ≥44px; legibilidade; nav/sidebar ok no mobile |
| Beleza / coerência | 25% | Direção estética deliberada (dark fantasy Cinzel/Crimson, dourado, runas); hierarquia; ritmo; sem "template SaaS"; estados completos |
| Falhas / robustez | 40% | Build, lint, testes, console, auth, jogador/mestre, loading/vazio/erro, regressões |
| Acessibilidade | 10% | Foco visível, contraste AA, teclado, semântica, reduced-motion |

**Veredictos**: APROVADO ≥8 · APROVADO COM RESSALVAS 6–7.9 · REPROVADO <6 ou S1 aberto.
**Severidade**: S1 bloqueador · S2 grave · S3 moderado · S4 cosmético.

## 🧰 Protocolo de Evidências
1. `npm run build` → falha = S1.
2. `npm run lint` → 2 erros pré-existentes no XPBar (`react-hooks/preserve-manual-memoization`) — não regredir.
3. `node --test 'src/lib/__tests__/*.test.mjs'` — única falha conhecida: `themes.test.mjs` (pré-existente).
4. Dev server + `curl` nas rotas; nunca clicar às cegas sem evidência.
5. Anti-padrões por `Grep`/`Glob` (cores hardcoded, `100vw`, texto <12px, alvos <44px, setState em effect, `console.log`, imagens sem `alt`/dimensões, ausência de reduced-motion).
6. Sem navegador no ambiente → declarar "não renderizado" e pontuar pelo código.

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `.github/agents/qa-judge.agent.md` (agente GitHub)
- `.opencode/agent/qa-judge.md` (agente OpenCode, `mode: subagent`, `edit: deny`)

## 📌 Histórico de Alterações e Decisões
- **2026-11-14**: Agente criado a pedido do usuário (julgamento de qualidade + responsividade + beleza + falhas). Rubrica ponderada definida; modo julgamento sem edição; veredicto obrigatório em formato padronizado. Ainda não utilizado em julgamento real — próximo uso deve calibrar a rubrica com uma tela de referência.
