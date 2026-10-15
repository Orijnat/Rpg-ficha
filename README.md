# ⚔️ Ficha de RPG Web — Rpg-ficha

Aplicação web moderna e interativa para gerenciamento da **Ficha de Personagem** de um sistema próprio de RPG de mesa baseado no d20 customizado com 7 atributos.

Desenvolvida com foco em alta performance, usabilidade em smartphones e desktop, rolagem virtual de dados com vantagem/desvantagem, temas visuais personalizáveis e persistência em nuvem via backend independente.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Papel |
|:---|:---|:---|
| Next.js | 16.x | Framework React com App Router |
| React | 19.x | UI com Server e Client Components |
| Tailwind CSS | 4.x | Estilização utilitária |
| Lucide React | 1.x | Ícones SVG temáticos |
| Sequelize | 6.x | ORM para as Route Handlers internas |
| PostgreSQL | 14+ | Banco de dados (via Rpg-backend) |

---

## ✨ Funcionalidades Principais

- **7 Atributos Customizados**: FOR, DES, CON, SAB, ESP, CAR e INT com cálculo automático de modificadores e formatação com sinal (+/−).
- **19 Perícias Integradas**: Vínculo direto aos atributos base com controle de treino (`trained`) e bônus customizado por perícia.
- **Rolador de Dados Virtual Integrado**:
  - Rolagem padrão d20 com modificador automático.
  - Mecânica de **Vantagem** (`2d20kh1`) e **Desvantagem** (`2d20kl1`).
  - Dados avulsos: `d4, d6, d8, d10, d12, d20, d100`.
  - Histórico completo da sessão.
- **5 Temas Visuais RPG** (selecionáveis nas Configurações):
  - 🔥 **Âmbar Vulcânico** — ouro fundido e forjas ancestrais (padrão)
  - 💀 **Cripta Abissal** — púrpura arcano e névoa espectral
  - 🌿 **Floresta Ancestral** — esmeralda druídica e bioluminescência
  - 🩸 **Sangue Carmesim** — vermelho carmesim e caçadas sob a lua
  - ❄️ **Gelo Eterno** — ciano glacial e ermos congelados
- **Módulos do Jogador**:
  - **Personagem**: Atributos, HP, perícias e aparência.
  - **Inventário**: Itens, quantidades e rolagem rápida de dano.
  - **Banco / Cofre**: 80 slots protegidos por senha.
  - **Contratos & Missões**: Acompanhamento de quests e recompensas.
  - **Mundo**: Registro de NPCs e personagens do mundo.
  - **Quarto**: Notas privadas do jogador.
  - **Montaria**: Ficha com nome, HP e anotações.
- **Persistência Dupla**: localStorage (offline) + sincronização automática com Rpg-backend (PostgreSQL).
- **Backup Manual**: exportação/importação da ficha completa em JSON.

---

## 📂 Estrutura de Pastas

```
Rpg-ficha/
├── src/
│   ├── app/
│   │   ├── context/
│   │   │   ├── CharacterContext.js  # Estado global da ficha + sync com backend
│   │   │   ├── DiceContext.jsx      # Estado do rolador de dados
│   │   │   └── ThemeContext.jsx     # Tema visual ativo + persistência
│   │   ├── components/
│   │   │   ├── Cabecalho.jsx        # Header com HP, nome e botão de configurações
│   │   │   ├── SettingsModal.jsx    # Modal de temas e backup
│   │   │   ├── BackupModal.jsx      # Alias retrocompatível → SettingsModal
│   │   │   ├── Pericia.jsx          # Lista de perícias com rolagem integrada
│   │   │   ├── Aparencia.jsx        # Dados de aparência e biografia
│   │   │   ├── Anotacoes.jsx        # Notas editáveis do personagem
│   │   │   ├── BarrraHp.jsx         # Barra de HP interativa
│   │   │   ├── ui.js                # Primitivos: Card, StatBox, EditableText…
│   │   │   ├── banco/               # Componentes do cofre bancário
│   │   │   └── dice/                # Modal e trigger flutuante de dados
│   │   ├── personagem/page.js       # Rota /personagem
│   │   ├── inventario/page.js       # Rota /inventario
│   │   ├── contratos/page.js        # Rota /contratos
│   │   ├── mundo/page.js            # Rota /mundo
│   │   ├── quarto/page.js           # Rota /quarto
│   │   ├── montaria/page.js         # Rota /montaria
│   │   ├── banco/page.jsx           # Rota /banco
│   │   ├── admin/                   # Painel administrativo de personagens
│   │   ├── globals.css              # Variáveis CSS de tema + Tailwind
│   │   └── layout.js               # Layout raiz com todos os Providers
│   └── lib/
│       ├── themes.js                # Definição dos 5 temas visuais
│       ├── defaultCharacter.js      # Estado inicial da ficha
│       ├── modifiers.js             # Cálculo de modificadores d20 e perícias
│       ├── dice.js                  # Parser de fórmulas de dados
│       ├── api.js                   # Integração com Rpg-backend
│       └── __tests__/               # Testes unitários (Node test runner)
├── docs/                            # Documentação técnica do projeto
├── .agents/                         # Skills e memórias dos agentes AI
├── .env.local                       # Suas variáveis locais (NÃO commitado)
├── next.config.mjs
├── tailwind.config.mjs (via postcss)
└── package.json
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js 20+** — [download](https://nodejs.org/)
- **Rpg-backend rodando** (necessário para sincronização) — veja [Rpg-backend/README.md](https://github.com/Orijnat/Rpg-backend)
- PostgreSQL (opcional — o frontend funciona offline com localStorage sem o backend)

---

### Passo a Passo Completo

```bash
# 1. Clone o repositório
git clone git@github.com:Orijnat/Rpg-ficha.git
cd Rpg-ficha

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local   # se .env.example existir, senão crie manualmente

# Conteúdo mínimo do .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3333
# DATABASE_URL=postgres://rpg_user:rpg_senha_aqui@localhost:5432/rpg_ficha

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — a rota raiz redireciona para `/personagem`.

---

### Para rodar com o backend completo

Garanta que o **Rpg-backend** está ativo na porta `3333` antes de iniciar o frontend:

```bash
# Em um terminal — backend:
cd ../Rpg-backend
docker compose up -d   # ou npm run dev se já tiver o postgres configurado
npm run dev

# Em outro terminal — frontend:
cd ../Rpg-ficha
npm run dev
```

> O frontend funciona **mesmo sem o backend ativo** — os dados ficam salvos no `localStorage` e são sincronizados assim que a conexão for restabelecida.

---

## 🏗️ Build de Produção

```bash
# Gera o build otimizado
npm run build

# Visualiza a saída do build (rotas, tamanhos)
# ✓ Compiled successfully
# ○  / (Static)
# ○  /personagem (Static)
# ...

# Inicia em modo produção
npm start
```

---

## 🧪 Testes

O projeto usa o **Node.js Test Runner** nativo (sem Jest ou Vitest):

```bash
# Roda todos os testes
node --test src/lib/__tests__/*.test.mjs
```

Suítes disponíveis:

| Arquivo | O que testa |
|:---|:---|
| `backup.test.mjs` | Integridade do schema `defaultData`, serialização e importação JSON |
| `rules-and-dice.test.mjs` | Modificadores d20, formatação de sinal, 19 perícias, rolagens com vantagem/desvantagem |
| `themes.test.mjs` | Estrutura e conformidade dos 5 temas visuais |

---

## ⚙️ Scripts npm

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Servidor de desenvolvimento com hot-reload (Turbopack) |
| `npm run build` | Build otimizado para produção |
| `npm start` | Inicia o build de produção |
| `npm run lint` | Análise estática com ESLint |

---

## 🎨 Temas Visuais

Os temas são selecionáveis em **Configurações** (ícone de engrenagem no cabeçalho), persistidos no `localStorage` e aplicados via atributo `data-theme` no `<html>`, sem recarregar a página.

| ID | Nome | Accent | Inspiração |
|:---|:---|:---|:---|
| `amber` | Âmbar Vulcânico | `#d69a3d` | Forjas e montanhas ancestrais |
| `abyss` | Cripta Abissal | `#a855f7` | Necromancia e planos sombrios |
| `forest` | Floresta Ancestral | `#10b981` | Druidas e alquimia silvestre |
| `crimson` | Sangue Carmesim | `#ef4444` | Bruxeiros e caçadas sob a lua |
| `frost` | Gelo Eterno | `#06b6d4` | Ermos glaciais e runas de geada |

---

## 📚 Documentação Técnica

Consulte a pasta [`docs/`](./docs/) para detalhes aprofundados:

| Documento | Conteúdo |
|:---|:---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Diagrama do sistema, fluxo de dados e decisões de design |
| [RPG_RULES.md](./docs/RPG_RULES.md) | Os 7 atributos, fórmulas d20, tabela de modificadores e 19 perícias |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Diagrama ER, tabelas, modelos Sequelize e tipos PostgreSQL |
| [AGENTS_AND_WORKFLOW.md](./docs/AGENTS_AND_WORKFLOW.md) | Equipe multiagente, memórias persistentes e workflow |

---

## ❗ Solução de Problemas

**A ficha não sincroniza com o banco**
→ Verifique se o Rpg-backend está rodando em `http://localhost:3333`. O frontend continua funcionando com os dados no localStorage.

**Erro de build: módulo não encontrado**
→ Rode `npm install` para garantir que todas as dependências estão instaladas.

**Temas não aplicam ao recarregar**
→ Verifique se o `localStorage` está habilitado no navegador. Modo anônimo pode bloquear.

**Hot-reload não funciona**
→ O Next.js 16 usa Turbopack por padrão. Tente `npm run dev -- --no-turbo` se houver instabilidade.
