# Arquitetura do Sistema: Ficha de RPG Web

Este documento descreve a arquitetura de software, padrões de design, fluxo de dados e decisões técnicas adotadas no projeto **Ficha de RPG Web**.

---

## 1. Visão Geral da Arquitetura

A aplicação segue a arquitetura moderna baseada no **Next.js 16 (App Router)** com **React 19**, integrando persistência no **PostgreSQL** através do **Sequelize ORM**.

```
+-------------------------------------------------------------+
|                      CLIENT-SIDE (Browser)                  |
|                                                             |
|  +-----------------------+     +-------------------------+  |
|  |     Pages / Views     | <-> |    CharacterContext     |  |
|  |  (Personagem, Banco,  |     |  (Estado reativo local  |  |
|  |    Inventário, etc.)  |     |    + sincronização)     |  |
|  +-----------------------+     +-------------------------+  |
|              ^                             ^                |
|              |                             |                |
|  +-----------------------+     +-------------------------+  |
|  |     DiceContext       |     |      src/lib/ (Puro)    |  |
|  |  (Bandeja de dados,   |     |  - modifiers.js         |  |
|  |   vantagem/desvant.)  |     |  - dice.js              |  |
|  +-----------------------+     +-------------------------+  |
+--------------------------------------------|----------------+
                                             | HTTP / Fetch
                                             v
+-------------------------------------------------------------+
|                      SERVER-SIDE (Next.js)                  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |           Route Handlers (`src/app/api/...`)          |  |
|  |  - GET /api/characters/[id]                           |  |
|  |  - POST /api/characters/sync                          |  |
|  |  - POST /api/bank/verify                              |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |              Sequelize ORM (`src/db/`)                |  |
|  |  - Models: Character, InventoryItem, BankSlot, etc.   |  |
|  |  - Singleton de conexão PostgreSQL                    |  |
|  +-------------------------------------------------------+  |
+-----------------------------|-------------------------------+
                              v
                   +---------------------+
                   |     PostgreSQL      |
                   +---------------------+
```

---

## 2. Princípios Arquiteturais

### 2.1. Desacoplamento de Regras de Negócio (`src/lib/`)
Toda a lógica de cálculo (fórmulas de atributos, bônus de perícias, dados virtuais com vantagens/desvantagens) é estritamente isolada em funções JavaScript puras na pasta `src/lib/`.
- **Sem dependência de React**: Facilita testes automatizados e reutilização no cliente e no servidor.
- **Determinismo**: Entradas idênticas geram saídas idênticas (com exceção do gerador pseudoaleatório do rolador de dados).

### 2.2. Estado Híbrido: Local-First com Sincronização Otimista
1. O jogador interage com a ficha sem latência perceptível; os inputs alteram o estado local gerenciado pelo `CharacterContext`.
2. Um hook com debounce (`useCharacterSave`) envia as modificações para os Route Handlers (`/api/characters/sync`).
3. O estado é espelhado no `localStorage` como fallback de segurança, prevenindo perda de dados mesmo em quedas temporárias de conexão.

### 2.3. Respeito ao Next.js 16 e React 19
- **Async Request APIs**: Em Next.js 16, parâmetros dinâmicos de rota são Promises (`const { id } = await params`).
- **Client Boundaries**: Componentes com interatividade (`useState`, `useEffect`, eventos de clique) utilizam explicitamente a diretiva `"use client"`.

---

## 3. Estrutura de Diretórios Padronizada

```
Rpg-ficha/
├── .agents/                    # Multiagentes, memórias e skills
│   ├── memory/                 # Memória persistente entre sessões
│   ├── skills/                 # Skills padronizadas (SKILL.md)
│   └── README.md
├── docs/                       # Documentação técnica e de regras
│   ├── ARCHITECTURE.md
│   ├── RPG_RULES.md
│   ├── DATABASE_SCHEMA.md
│   └── AGENTS_AND_WORKFLOW.md
├── src/
│   ├── app/
│   │   ├── api/                # Route Handlers do Next.js
│   │   │   └── characters/
│   │   ├── context/            # CharacterContext e DiceContext
│   │   ├── components/         # Componentes de UI (Card, StatBox, BarraHp, etc.)
│   │   │   ├── banco/          # Módulo do cofre bancário
│   │   │   ├── dice/           # Modal de rolagem e histórico
│   │   │   └── ui/             # Componentes base reutilizáveis
│   │   ├── personagem/page.js  # Visão principal da ficha
│   │   ├── inventario/page.js  # Inventário de itens e consumíveis
│   │   ├── banco/page.jsx      # Tela de cofre (80 slots protegidos)
│   │   ├── contratos/page.js   # Missões e contratos
│   │   ├── montaria/page.js    # Ficha da montaria
│   │   ├── quarto/page.js      # Notas de descanso e aposentos
│   │   ├── layout.js           # Layout global e navegação
│   │   └── globals.css         # Tailwind CSS v4
│   ├── layouts/                # Shells de composição e navegação
│   │   └── AppShell.jsx        # Navegação, proteção de rotas e moldura visual
│   ├── db/                     # Conexão Sequelize e Models
│   │   ├── models/             # Modelos Sequelize
│   │   └── sequelize.js        # Singleton de conexão
│   └── lib/                    # Lógica pura (modifiers, dice, validators)
├── CLAUDE.md                   # Documento de contexto master
├── package.json
└── README.md
```

### Estrutura adaptada de referências externas

O projeto adota a separação de `src/layouts` usada no projeto de referência
[`Orijnat/teste-crs`](https://github.com/Orijnat/teste-crs/tree/main/sistema/hospitalFront/hospital),
mas mantém o domínio, a autenticação e os contratos da ficha de RPG. O shell
global foi extraído de `src/app/layout.js` para
[`src/layouts/AppShell.jsx`](../src/layouts/AppShell.jsx). Componentes de
domínio continuam em `src/app/components`, contextos em `src/app/context` e
cliente HTTP em `src/lib/api.js`; não foi introduzida uma segunda camada Axios
nem copiado código específico do hospital.

### Integração com o backend existente

O cliente HTTP em [`src/lib/api.js`](../src/lib/api.js) usa
`NEXT_PUBLIC_API_URL` para chamar o backend Express em
`http://localhost:3333/api`. O backend correspondente está em
`/home/cledi/rp/Rpg-backend` e expõe autenticação, personagens, campanhas,
NPCs e recursos administrativos.

Para desenvolvimento:

1. Copie `.env.example` para `.env` no frontend.
2. Configure `JWT_SECRET` e `DATABASE_URL` no `.env` do backend.
3. Configure `CORS_ORIGIN=http://localhost:3000`.
4. Inicie o backend antes de usar login e sincronização.

O frontend não possui Route Handlers locais: o cliente configurado aponta
exclusivamente para o backend Express. A autenticação usa usuário/e-mail e
senha, sem dependência de provedores OAuth ou serviços pagos de terceiros.
Não use segredos reais em arquivos versionados.
