---
name: tactical-encounter-engine
description: Gerencia encontros táticos, iniciativa sincronizada com fichas, histórico de combate, condições e mapas interativos com marcadores e névoa de guerra.
---

# ⚔️ Skill: Tactical Encounter Engine (Motor de Combate Tático e Mapas)

Esta skill orienta o gerenciamento de encontros de combate, rastreamento de iniciativa em tempo real, aplicação de condições táticas, histórico de combate e mapas interativos com névoa de guerra (`Fog of War`).

---

## 🎯 Atividades Suportadas do Roadmap
- [x] Implementar encontros, inimigos, condições, recursos e histórico de alterações.
- [x] Implementar mapas, marcadores, áreas ocultas e revelação controlada.
- [x] Permitir atualizar a iniciativa diretamente a partir das fichas dos jogadores.

---

## ⚡ 1. Sincronização de Iniciativa das Fichas com a Mesa

1. **Envio da Ficha do Jogador**:
   - Quando o jogador clica no botão "Rolar / Enviar Iniciativa" em `character-sheet-full.js`, o sistema calcula:
     $$\text{Iniciativa} = d20 + \text{modDES} + \text{bonusIniciativa}$$
   - Envia um evento/payload para a rota da mesa ativa:
     ```json
     {
       "acao": "sync_iniciativa",
       "personagemId": "char-123",
       "nome": "Thorne",
       "valor": 18,
       "hpAtual": 45,
       "hpMax": 45
     }
     ```
2. **Recepção e Ordenação na Câmara do Mestre**:
   - A lista de combatentes é reordenada decrescentemente por valor de iniciativa.
   - O mestre pode injetar NPCs rolados automaticamente ou manualmente.

---

## 🩸 2. Gestão de Encontros, Rodadas e Histórico (`combatLog`)

```typescript
interface EncontroTatico {
  id: string;
  campanhaId: string;
  nome: string;
  status: 'Preparando' | 'Em Andamento' | 'Pausado' | 'Encerrado';
  rodadaAtual: number;
  turnoIndice: number;
  combatentes: Array<{
    id: string;
    nome: string;
    tipo: 'Herói' | 'NPC';
    hp: number;
    hpMax: number;
    ca: number;
    iniciativa: number;
    condicoes: string[]; // Ex: ["Envenenado", "Atordoado"]
    isAtivo: boolean;
  }>;
  historicoAcoes: Array<{
    id: string;
    timestamp: string;
    rodada: number;
    origem: string;
    alvo?: string;
    acao: string; // Ex: "Causou 14 de dano de fogo em Goblin Lacaio"
    detalhes?: any;
  }>;
}
```

### Funções Utilitárias do Ciclo de Turnos:
- **`proximoTurno(encontro)`**: Avança para o próximo combatente vivo. Se for o último da fila, avança a `rodadaAtual` para `rodada + 1` e reseta o índice para 0.
- **`aplicarDano(combatente, quantidade)`**: Subtrai de `hp` respeitando o limite mínimo de `0`. Registra no `historicoAcoes`.
- **`aplicarCura(combatente, quantidade)`**: Adiciona ao `hp` respeitando o teto de `hpMax`.

---

## 🗺️ 3. Mapas Interativos e Névoa de Guerra (Fog of War)

O sistema de mapas permite exploração imersiva sem revelar segredos prematuramente:

```typescript
interface MapaTatico {
  id: string;
  campanhaId: string;
  titulo: string;
  imagemUrl: string;
  gradeVisivel: boolean;
  nevoaDeGuerraAtiva: boolean;
  marcadores: Array<{
    id: string;
    x: number; // Porcentagem de 0 a 100% no eixo X
    y: number; // Porcentagem de 0 a 100% no eixo Y
    tipo: 'Inimigo' | 'Tesouro' | 'PontoDeInteresse' | 'Armadilha' | 'NPC';
    titulo: string;
    notas: string;
    ocultoParaJogadores: boolean; // Flag de revelação controlada
  }>;
  areasOcultas?: Array<{
    id: string;
    poligono: Array<{ x: number; y: number }>;
    revelada: boolean;
  }>;
}
```

### Protocolo de Revelação Controlada:
- O mestre vê todos os marcadores com indicação visual de status (`👁️ Revelado` vs `🔒 Oculto`).
- Ao clicar no botão de alternância do marcador, o mestre revela ou oculta o ponto instantaneamente para os jogadores conectados.
- Clientes com perfil de jogador recebem apenas marcadores onde `ocultoParaJogadores === false`.
