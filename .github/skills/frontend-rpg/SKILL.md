---
name: frontend-rpg
description: "Workflow para implementar e validar frontend Next.js 16/React 19 da ficha RPG, temas, dark fantasy, responsividade, autenticação e integração de API."
argument-hint: "Informe a tela, fluxo ou componente frontend."
user-invocable: true
---

# Skill Frontend RPG

Use para mudanças na área do jogador, Sala do Mestre, navegação, temas,
componentes da ficha e integração do cliente com APIs.

## Procedimento

1. Ler `.agents/memory/frontend-artisan.md`.
2. Ler o contrato em `.agents/memory/contrato-integracao.md`.
3. Confirmar se a página é pública, de jogador ou de mestre.
4. Reutilizar tokens, componentes e contextos existentes.
5. Implementar estados de carregamento, erro, vazio e sucesso.
6. Rodar build/lint/testes direcionados e `git diff --check`.
7. Atualizar a memória do frontend e reportar impacto no contrato.
