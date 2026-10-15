# Contexto do Projeto: Ficha de RPG Web (Área do Jogador)

Este documento estabelece o contexto arquitetural, as convenções de código, as regras do sistema de RPG e as diretrizes de desenvolvimento para o projeto **Ficha de RPG Web**.

---

## 1. Visão Geral do Projeto

Aplicação web moderna para gerenciamento interativo da **Ficha de Personagem** de um sistema próprio de RPG de mesa baseado no d20. A aplicação fornece automação de regras, cálculos dinâmicos, rolador de dados virtual integrado (com suporte a bônus, vantagens e desvantagens), inventário, cofre bancário, contratos e montaria, com interface altamente responsiva (focada em mobile e desktop).

### Stack Tecnológica
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React.
- **Backend**: Next.js Route Handlers (`src/app/api/...`), Sequelize ORM.
- **Banco de Dados**: PostgreSQL.
- **Gerenciamento de Estado**: React Context / Hooks locais com sincronização otimista com o backend.

---

## 2. Regras de Negócio do Sistema de RPG (Base d20 Customizado)

### 2.1. Atributos Principais (7 Atributos)
Diferente do d20 tradicional de 6 atributos, este sistema possui 7 atributos fundamentais:
1. **FOR** (Força)
2. **DES** (Destreza)
3. **CON** (Constituição)
4. **SAB** (Sabedoria)
5. **ESP** (Espírito)
6. **CAR** (Carisma)
7. **INT** (Inteligência)

### 2.2. Cálculo de Modificadores
Seguindo o padrão matemático d20 clássico:
$$\text{Modificador} = \lfloor(\text{Valor do Atributo} - 10) / 2\rfloor$$

| Valor | Modificador | Valor | Modificador |
| :---: | :---------: | :---: | :---------: |
| 8–9   | -1          | 16–17 | +3          |
| 10–11 | 0           | 18–19 | +4          |
| 12–13 | +1          | 20–21 | +5          |
| 14–15 | +2          | ...   | ...         |

### 2.3. Perícias e Bônus
Cada perícia está vinculada a um atributo base e possui:
- `trained` (booleano): indica se o personagem é treinado.
- `bonus` (número ou null): bônus customizado adicional.
- **Valor final do teste de perícia**: $\text{Modificador do Atributo Base} + (\text{Bônus de Treino} \text{ se aplicável}) + \text{Outros Bônus}$.

Relação de Perícias do Sistema:
- **FOR**: Atletismo
- **DES**: Acrobacia, Furtividade, Prestidigitação
- **SAB**: História, Investigação, Sobrevivência, Provocação, Animais, Medicina
- **ESP**: Intuição, Percepção, Atuação
- **CAR**: Enganação, Intimidação, Persuasão
- **INT**: Arcanismo, Religião, Natureza

### 2.4. Mecânica de Rolagem de Dados
- **Rolagem Padrão**: $1\text{d}20 + \text{modificador/bônus}$.
- **Vantagem**: Rola $2\text{d}20$ e seleciona o maior resultado ($\text{keep highest 1}$), somando os modificadores.
- **Desvantagem**: Rola $2\text{d}20$ e seleciona o menor resultado ($\text{keep lowest 1}$), somando os modificadores.
- **Dados Virtuais Customizados**: Capacidade de rolar dados avulsos ou fórmulas: $\text{d}4, \text{d}6, \text{d}8, \text{d}10, \text{d}12, \text{d}20, \text{d}100$ e fórmulas como `2d6 + 3`.

### 2.5. Economia e Moedas
Quatro tipos de moedas:
- **Latina/Platina**
- **Ouro**
- **Prata**
- **Cobre**

### 2.6. Módulos Adicionais do Personagem
- **Inventário**: Itens carregados com quantidade e identificador único.
- **Banco / Cofre**: Grid de 80 slots protegidos por senha numérica de segurança.
- **Contratos (Quests)**: Título, recompensa e status de conclusão (`done: boolean`).
- **Montaria**: Nome da montaria, HP atual, HP Máximo e notas específicas.
- **Anotações**: Anotações gerais e anotações do quarto/dormitório.

---

## 3. Estrutura de Pastas e Organização do Código

```
Rpg-ficha/
├── src/
│   ├── app/
│   │   ├── api/                     # Route Handlers do Next.js
│   │   │   ├── characters/          # Endpoints CRUD de personagens
│   │   │   │   └── [id]/
│   │   │   ├── dice/                # Endpoint opcional para log de rolagens
│   │   │   └── bank/                # Verificação e atualização de cofre
│   │   ├── context/                 # React Contexts (CharacterContext, DiceContext)
│   │   ├── components/              # Componentes React de UI da Ficha
│   │   │   ├── banco/               # Componentes do cofre e slots
│   │   │   ├── dice/                # Modal, bandeja de dados e histórico
│   │   │   ├── ui/                  # Componentes base (Card, Button, Input, Modal)
│   │   │   ├── Pericia.jsx
│   │   │   ├── Aparencia.jsx
│   │   │   ├── BarrraHp.jsx
│   │   │   └── Cabecalho.jsx
│   │   ├── personagem/page.js       # Visão principal da ficha
│   │   ├── inventario/page.js       # Tela de inventário e equipamentos
│   │   ├── banco/page.jsx           # Tela do cofre bancário
│   │   ├── contratos/page.js        # Tela de missões e contratos
│   │   ├── montaria/page.js         # Tela de montarias
│   │   ├── quarto/page.js           # Tela do quarto/anotações
│   │   ├── layout.js                # Shell da aplicação (Sidebar / Nav / Dock)
│   │   └── globals.css              # Tailwind CSS v4 & custom tokens
│   ├── db/                          # Configuração e inicialização do Sequelize
│   │   ├── config/                  # Credenciais e conexão PostgreSQL
│   │   ├── migrations/              # Migrations do Sequelize
│   │   ├── models/                  # Models (Character, InventoryItem, etc.)
│   │   └── index.js                 # Export do sequelize e models
│   ├── lib/                         # Utilitários puros e lógica de regras
│   │   ├── dice.js                  # Engine de rolagem de dados e vantagens
│   │   ├── modifiers.js             # Cálculos de modificadores e perícias
│   │   └── validators.js            # Schemas e validação de payloads
│   └── hooks/                       # Custom hooks (useDice, useCharacterSave)
├── .env.local                       # Variáveis de ambiente (DATABASE_URL, etc.)
├── package.json
└── CLAUDE.md
```

---

## 4. Diretrizes de Código e Arquitetura

### 4.1. Next.js 16 & React 19
- **Server vs Client**: Páginas interativas com inputs e dados dinâmicos da ficha devem explicitamente declarar `"use client"`. Lógica de banco e endpoints de API ficam restritos aos Route Handlers (`src/app/api/...`) ou Server Actions.
- **Atenção a Breaking Changes do Next.js**: Parâmetros de rota dinâmica em Route Handlers e Server Components são assíncronos (`const { id } = await params`).

### 4.2. Sequelize & PostgreSQL
- Utilize modelos fortemente definidos com `DataTypes`.
- Relacionamentos claros: `Character.hasMany(InventoryItem)`, `Character.hasMany(Contract)`, etc.
- Assegure validação nos models para evitar corrupção de valores numéricos de atributos e vida.

### 4.3. Estilização com Tailwind CSS v4
- Manter o tema escuro moderno com visual fantástico/rpg (tons slate/zinc escuros, bordas sutis, acentos dourados/âmbar para atributos e roxos/azuis para espírito/magia).
- Priorizar layouts fluidos que funcionam perfeitamente no celular (touch targets mínimos de 44x44px).

---

## 5. Convenções de Nomenclatura
- **Componentes React**: PascalCase (ex: `DiceRollerModal.jsx`, `CharacterSheet.jsx`).
- **Utilitários e Hooks**: camelCase (ex: `calculateModifier.js`, `useDiceRoller.js`).
- **Models do Sequelize**: PascalCase singular (ex: `Character.js`, `InventoryItem.js`).
- **Tabelas do Banco**: snake_case plural (ex: `characters`, `inventory_items`).
- **Colunas do Banco**: camelCase ou snake_case consistente (preferência por snake_case no SQL mapeado no Sequelize).
