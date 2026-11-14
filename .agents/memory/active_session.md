# 🧠 Sessão Ativa — Grimorium RPG

**Última Atualização**: 2026-11-14T21:00:00-03:00  
**Branch Atual**: `main`  
**Status**: Remodelação visual (landing + login/registro + identidade global) implementada e validada. Build OK; rotas do dev server respondem 200.

---

## ✅ Concluído Nesta Sessão (Remodelação visual)

| Item | Status |
|---|---|
| Instalados `lenis` (scroll suave global), `gsap` e `@gsap/react` (SplitText livre desde GSAP 3.13) | ✅ |
| React Bits NÃO é pacote npm: componentes JS+Tailwind vendored em `src/components/react-bits/` (`Aurora`, `SplitText`, `ShinyText`, `SpotlightCard`) + README com atribuição; pasta excluída do ESLint | ✅ |
| Landing (`/`) remodelada: fundo vivo Aurora WebGL (âmbar/violeta), vinheta, headline SplitText com rise por palavras, CTA principal com ShinyText (hover), CTA final com ShinyText (view), seções com reveal GSAP ScrollTrigger, pilares Jogador/Mestre em SpotlightCard | ✅ |
| Login e Registro: `src/components/auth/AuthScaffold.jsx` — fundo Aurora + anel de runas gigante girando + entrada GSAP (emblema/card), gsap respeitando reduced-motion | ✅ |
| Lenis global via `src/components/SmoothScroll.jsx`, desativado em `prefers-reduced-motion` | ✅ |
| Incidente resolvido: `src/` havia sumido do worktree (deleção externa, não deste trabalho); restaurado via `git checkout` de stash dangling `0c3d4ca` (04:54, pós-build) — todas as correções de bugs preservadas | ✅ |

---

## 📌 Contexto
- **Stack visual**: Next 16/App Router, Tailwind v4, Aurora WebGL2, GSAP/ScrollTrigger, Lenis (lenis/react), React Bits vendored (variantes JS-TW).
- **Regras**: componentes React Bits mantêm código original e ficam FORA do lint; `prefers-reduced-motion` respeitado globalmente (Lenis, AuthScaffold, useGSAP de sections).
- **Build**: `npm run build` OK; `npm run lint` 2 erros + 40 warnings (todos pré-existentes); testes libs 134/135 (única falha: `themes.test.mjs`, pré-existente no HEAD).

## ⚠️ Pendências / Avisos
- Visual ainda não verificado por screenshot (sem browser no ambiente); rotas responderam 200 no dev server; recomendável abrir no navegador.
- TiltedCard foi descartado (não combina com conteúdo interativo do showcase); pode adicionar depois em superfícies estáticas.
- Dados demo no Supabase ainda precisam de limpeza one-time (decisão pendente do usuário).
- `.opencode/` não rastreado, não commitar sem revisão. Nada foi commitado nesta sessão.

## 📋 Checklist de Continuidade
- [x] Instalar dependências (lenis, gsap, @gsap/react)
- [x] Remodelar landing e telas de auth
- [x] Validar build/rotas/lint/testes
- [x] Registrar prompt/ação em `last_prompt.json`
- [ ] Revisar visual no navegador com o usuário
- [ ] Decidir limpeza dos dados demo no Supabase

## Próximo passo recomendado
Abrir `/`, `/login` e `/registro` no navegador com o backend local, revisar o visual com o usuário e, se aprovado, considerar commitar em conjunto com os fixes de bugs do itens-a-fazer.
