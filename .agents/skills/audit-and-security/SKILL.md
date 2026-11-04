---
name: audit-and-security
description: Controle de auditoria, confirmação solene de ações destrutivas, rastreamento de quem alterou e quando, e filtragem server-side de notas privadas.
---

# 🛡️ Skill: Audit and Security (Auditoria, Segurança e Confirmação Solene)

Esta skill orienta a segurança da Área do Mestre, autorização horizontal (multi-tenancy), trilha de auditoria e modais de confirmação solene para operações destrutivas.

---

## 🎯 Atividades Suportadas do Roadmap
- [x] Restringir o mestre às próprias campanhas no backend.
- [x] Implementar notas públicas e privadas com filtragem server-side estrita.
- [x] Mostrar quem alterou cada dado e quando (`lastModifiedBy` e `lastModifiedAt`).
- [x] Criar confirmação e auditoria para exclusão e alterações sensíveis.

---

## 🔒 1. Isolamento Multi-Tenancy no Backend

O mestre só tem acesso de visualização e mutação para dados vinculados ao seu ID de usuário (`usuario_id` ou `mestre_id`):

```javascript
// Exemplo em rota Next.js App Router (src/app/api/campanhas/[id]/route.js)
export async function GET(req, { params }) {
  const session = await getAuthenticatedUser(req);
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const campanha = await db.Campanha.findByPk(params.id);
  if (!campanha) {
    return Response.json({ error: "Campanha não encontrada" }, { status: 404 });
  }

  // Se não for o proprietário e nem um membro aprovado, barrar:
  const isMestre = campanha.mestreId === session.id;
  const isMembro = campanha.membros?.some(m => m.userId === session.id && m.status === 'aprovado');

  if (!isMestre && !isMembro) {
    return Response.json({ error: "Acesso negado a esta campanha" }, { status: 403 });
  }

  return Response.json({ campanha });
}
```

---

## 📜 2. Filtragem Server-Side de Anotações Secretas

> [!CAUTION]
> **Nunca confie em ocultação por CSS (`hidden`, `display: none`) para segredos do mestre.** Se o campo chegar ao JSON do cliente, qualquer jogador pode inspecionar no DevTools.

### Regra de Ouro da Filtragem Server-Side:
```javascript
export function sanitizarNotasParaUsuario(notas, usuario) {
  const isMaster = usuario?.role === 'master' || usuario?.role === 'admin';
  return notas
    .filter(nota => {
      // Se for privada e o usuário não for mestre, filtra completamente:
      if (nota.privada && !isMaster && nota.autorId !== usuario?.id) {
        return false;
      }
      return true;
    })
    .map(nota => {
      // Se contiver campo específico de notas secretas do mestre:
      if (!isMaster) {
        const { notasMestre, ...dadosPublicos } = nota;
        return dadosPublicos;
      }
      return nota;
    });
}
```

---

## 🕒 3. Rastreabilidade: "Quem alterou e quando"

Todos os registros do sistema (fichas, NPCs, notas, encontros, campanhas) gravam metadados de modificação na camada de persistência:

```typescript
interface AuditMetadata {
  lastModifiedBy: {
    id: string;
    name: string;
    role: string;
  };
  lastModifiedAt: string; // ISO 8601 UTC
}
```

No frontend, renderizar badges elegantes de auditoria:
```jsx
// Exemplo de componente de auditoria
export function AuditBadge({ modifiedBy, modifiedAt }) {
  if (!modifiedAt) return null;
  const dataFormatada = new Date(modifiedAt).toLocaleString('pt-BR');
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded">
      <Clock className="w-3 h-3 text-amber-500" />
      <span>Alterado por <strong className="text-zinc-200">{modifiedBy?.name || 'Mestre'}</strong> em {dataFormatada}</span>
    </span>
  );
}
```

---

## ⚠️ 4. Confirmação Solene e Log de Auditoria

Substituir o primitivo `window.confirm()` pelo componente solene [`ConfirmDialog.jsx`](file:///home/cledi/rp/Rpg-ficha/src/app/components/admin/ConfirmDialog.jsx):
- **Nível `alerta`**: Para reset de rodadas ou desvinculação de itens.
- **Nível `perigo / critico`**: Para exclusão de NPCs, campanhas ou banimento de membros.
- **Exigência de Digitação**: Para ações críticas, exigir que o usuário digite o nome da entidade (ex: digite "DRAGÃO" para confirmar o expurgo).
- **Gravação em Log**: Toda exclusão dispara um registro no serviço de auditoria:
  ```json
  {
    "evento": "EXCLUSAO_NPC",
    "autorId": "user-1",
    "entidadeId": "npc-99",
    "detalhes": { "nome": "Goblin Chefe" },
    "timestamp": "2026-10-26T22:30:00Z"
  }
  ```
