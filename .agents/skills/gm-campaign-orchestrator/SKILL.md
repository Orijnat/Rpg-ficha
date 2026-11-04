---
name: gm-campaign-orchestrator
description: Gerencia ciclo de vida de campanhas de RPG, códigos de convite, membros, permissões, sessões, cenas e isolamento horizontal de mestres.
---

# 👑 Skill: GM Campaign Orchestrator (Orquestrador de Campanhas e Sessões)

Esta skill orienta o desenvolvimento e a arquitetura das funcionalidades de gestão de campanhas, ciclo de membros, sessões de jogo e fluxo narrativo na Câmara do Mestre.

---

## 🎯 Atividades Suportadas do Roadmap
- [x] Implementar gerenciamento de campanhas (CRUD, arquivamento, cenário).
- [x] Implementar convite, entrada, saída, remoção e bloqueio de membros.
- [x] Restringir o mestre às próprias campanhas no backend (regras de segurança).
- [x] Implementar sessões com cenas, objetivos, recompensas e registro narrativo pós-jogo.

---

## 🏰 1. Modelo de Campanha e Multi-Tenancy

Cada campanha deve pertencer explicitamente a um mestre (`proprietario_id` ou `mestre_id`). Nenhum outro mestre pode visualizar ou alterar campanhas de terceiros.

```typescript
interface Campanha {
  id: string;
  nome: string;
  descricao: string;
  cenario: string; // Ex: "Terras Malditas de Baróvia"
  mestreId: string;
  codigoConvite: string; // Ex: "INV-VALE-994"
  status: 'Ativa' | 'Em Pausa' | 'Concluída' | 'Arquivada';
  membros: Array<{
    userId: string;
    nome: string;
    papel: 'jogador' | 'co-mestre';
    status: 'aprovado' | 'pendente' | 'bloqueado';
    personagemId?: string;
    entrouEm: string;
  }>;
  criadaEm: string;
  atualizadaEm: string;
}
```

---

## 🎟️ 2. Convite, Entrada, Saída e Gestão de Membros

1. **Geração e Regeneração de Código de Convite**:
   - Código único amigável gerado com prefixo e hash alfanumérico (ex: `INV-ABC123`).
   - O mestre pode revogar ou regenerar o código a qualquer momento para barrar novos ingressos.
2. **Entrada do Jogador**:
   - Jogador informa o código na rota `/api/campanhas/join`.
   - Se o usuário estiver na lista de `bloqueado`, a entrada é rejeitada com erro `403 Proibido`.
   - O jogador vincula sua ficha de personagem à campanha.
3. **Ações do Mestre sobre Membros**:
   - **Promover**: Dar permissões de leitura expandida.
   - **Expulsar (Remover)**: Remove o membro e desvincula a ficha da campanha ativa.
   - **Bloquear (Banir)**: Adiciona o `userId` à lista de bloqueados permanentemente até desbloqueio manual.

---

## 📜 3. Sessões, Cenas, Objetivos e Recompensas

A narrativa avança por sessões organizadas:

```typescript
interface SessaoJogo {
  id: string;
  campanhaId: string;
  numero: number; // Sessão 1, Sessão 2...
  titulo: string;
  dataAgendada: string;
  status: 'Planejada' | 'Em Andamento' | 'Finalizada';
  resumoPosJogo: string; // Resumo narrativo escrito após a sessão
  cenas: Array<{
    ordem: number;
    titulo: string;
    descricao: string;
    tipo: 'Exploração' | 'Combate' | 'Social' | 'Enigma';
    concluida: boolean;
  }>;
  objetivos: Array<{
    id: string;
    descricao: string;
    concluido: boolean;
    xpRecompensa?: number;
  }>;
  recompensas: {
    xpTotal: number;
    ouro: number;
    itens: string[];
    distribuida: boolean;
  };
}
```

### Protocolo de Finalização de Sessão:
- O mestre marca os objetivos cumpridos na lista de verificação.
- Ao clicar em "Finalizar Sessão", o sistema calcula o XP total e disponibiliza o resumo narrativo para os jogadores na linha do tempo da campanha.
