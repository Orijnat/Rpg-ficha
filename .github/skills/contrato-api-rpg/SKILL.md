---
name: contrato-api-rpg
description: "Workflow para alinhar contratos API frontend/backend da ficha RPG, DTOs, aliases, erros, perfis, compatibilidade e handoffs entre agentes."
argument-hint: "Informe os endpoints ou campos que precisam ser alinhados."
user-invocable: true
---

# Skill Contrato API RPG

Use quando uma mudança atravessar a fronteira entre frontend e backend.

## Procedimento

1. Inventariar request, response, status HTTP e autorização.
2. Comparar nomes canônicos do banco com aliases consumidos pela UI.
3. Classificar compatibilidade e definir ordem de rollout.
4. Registrar exemplos mínimos de payload e erros esperados.
5. Verificar que dados privados não aparecem em contratos de jogador.
6. Atualizar `.agents/memory/contrato-integracao.md`.
