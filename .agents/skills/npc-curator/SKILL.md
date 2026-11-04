---
name: npc-curator
description: Criação, curadoria, categorização com tags, avatares, status, duplicação e geração de variantes de NPCs para mestres de RPG.
---

# 🐉 Skill: NPC Curator (Curador de NPCs e Bestiário)

Esta skill orienta a modelagem, criação, busca, categorização e manipulação de criaturas e Personagens Não-Jogadores (NPCs) na Área do Mestre, assegurando que nunca sejam tratados como jogadores comuns.

---

## 🎯 Atividades Suportadas do Roadmap
- [x] Criar formulário específico para cadastrar NPCs, sem tratá-los como jogadores.
- [x] Criar filtro, busca e ordenação de jogadores e NPCs.
- [x] Criar avatar, tags e status para NPCs.
- [x] Permitir duplicar NPCs e criar variantes táticas.

---

## 🧱 1. Modelo de Dados Dedicado para NPCs

NPCs não possuem inventário pesado, slots bancários complexos ou progressão de perícias individuais de jogadores. Seu esquema deve ser ágil e voltado para combate e narrativa:

```typescript
interface NPCData {
  id: string;
  nome: string;
  papel: string; // Ex: "Lacaio", "Chefe", "Especialista", "Fera", "Mercador"
  hp: number;
  hpMax: number;
  ca: number; // Classe de Armadura
  iniciativa: number; // Bônus de iniciativa fixo
  attitude: 'Aliado' | 'Neutro' | 'Hostil' | 'Chefe';
  status: 'Ativo' | 'Derrotado' | 'Inconsciente' | 'Fugiu';
  avatar: string; // URL da imagem ou preset de ícone
  tags: string[]; // Ex: ["Morto-Vivo", "Mágico", "Elite", "Veneno"]
  acoes: Array<{
    nome: string;
    dano: string; // Ex: "2d8+4"
    descricao?: string;
  }>;
  habilidadesEspeciais?: Array<{
    nome: string;
    efeito: string;
  }>;
  notasMestre: string; // Notas secretas visíveis apenas ao mestre
  campanhaId?: string;
  duplicadoDe?: string; // ID do NPC matriz se for variante
  lastModifiedBy?: {
    id: string;
    name: string;
    role: string;
  };
  lastModifiedAt?: string;
}
```

---

## 🔍 2. Busca, Filtro Multicritério e Ordenação

Para gerenciar catálogos com dezenas de NPCs e Heróis na mesa:

1. **Busca Textual Dinâmica**:
   - Comparação case-insensitive em `nome`, `papel` e `tags`.
2. **Filtros Combináveis**:
   - Por Tipo: `Todos`, `Apenas Jogadores (Heróis)`, `Apenas NPCs`.
   - Por Atitude: `Aliado`, `Neutro`, `Hostil`, `Chefe`.
   - Por Status: `Ativo`, `Derrotado`, `Inconsciente`, `Fugiu`.
   - Por Tags: seleção de tags como `Morto-Vivo`, `Chefe`, `Infiltrador`.
3. **Ordenação Multifuncional**:
   - Maior/Menor HP.
   - Ordem Alfabética (A-Z / Z-A).
   - Mais Recente / Mais Antigo.
   - Desafio / CA.

```javascript
// Exemplo de pipeline de filtragem e ordenação
export function filtrarEOrdenarEntidades(lista, { busca, tipo, status, tag, ordenacao }) {
  return lista
    .filter(item => {
      if (tipo && tipo !== 'todos' && item.type !== tipo) return false;
      if (status && status !== 'todos' && item.status !== status) return false;
      if (tag && item.tags && !item.tags.includes(tag)) return false;
      if (busca) {
        const query = busca.toLowerCase();
        const nomeMatch = item.name?.toLowerCase().includes(query);
        const papelMatch = item.job?.toLowerCase().includes(query);
        const tagMatch = item.tags?.some(t => t.toLowerCase().includes(query));
        return nomeMatch || papelMatch || tagMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (ordenacao === 'hp-desc') return (b.hp || 0) - (a.hp || 0);
      if (ordenacao === 'hp-asc') return (a.hp || 0) - (b.hp || 0);
      if (ordenacao === 'nome-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
}
```

---

## 🧬 3. Duplicação e Geração de Variantes Táticas

Permite ao mestre criar rapidamente bandos de inimigos ou chefes customizados a partir de um monstro base:

### Templates de Variantes:
1. **Alfa / Chefe de Bando**:
   - Nome: `${original.nome} (Alfa)`
   - HP Multiplicador: `1.5x` a `2.0x`
   - Bônus CA: `+2`
   - Novas tags: `["Elite", "Alfa"]`
2. **Espectral / Sombrio**:
   - Nome: `${original.nome} Espectral`
   - Resistência a dano físico, nova tag `["Espectral", "Incorpóreo"]`
3. **Minion / Lacaio**:
   - HP fixo: `1` ou `25%` do original
   - Tag: `["Lacaio"]`

```javascript
export function criarVarianteNPC(npcOriginal, { sufixo = " (Variante)", multiplicadorHp = 1.0, tagsAdicionais = [] } = {}) {
  const novoHpMax = Math.max(1, Math.round((npcOriginal.hpMax || npcOriginal.hp || 10) * multiplicadorHp));
  return {
    ...npcOriginal,
    id: `npc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: `${npcOriginal.nome}${sufixo}`,
    hp: novoHpMax,
    hpMax: novoHpMax,
    dadosExtras: {
      ...(npcOriginal.dadosExtras || {}),
      tags: Array.from(new Set([...(npcOriginal.dadosExtras?.tags || []), ...tagsAdicionais])),
      duplicadoDe: npcOriginal.id,
      lastModifiedAt: new Date().toISOString(),
    }
  };
}
```

---

## 🎨 4. Design & Componentes UI Dark Fantasy
- **Avatares**: Círculos com molduras de ferro oxidado ou runas douradas, badge de atitude no canto inferior (verde para Aliado, amarelo para Neutro, vermelho para Hostil, roxo para Chefe).
- **Badges de Tags**: Estilo `bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 rounded-full px-2 py-0.5 text-xs font-mono`.
- **Status Operacional**: Indicador pulsante ou ícone temático (`HeartPulse`, `Skull`, `ShieldAlert`, `Footprints`).
