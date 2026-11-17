# ⚔️ Grimorium — Ficha de RPG Web (Rpg-ficha)

Aplicação web para gerenciamento da **Ficha de Personagem** de um sistema próprio de RPG de mesa baseado em d20 com 7 atributos (FOR, DES, CON, SAB, ESP, CAR, INT).

Frontend em **Next.js 16 + React 19 + Tailwind CSS 4**, com persistência em nuvem via o backend independente [**Rpg-backend**](https://github.com/Orijnat/Rpg-backend) (Express + Sequelize + PostgreSQL), painel do mestre, mapa tático compartilhado e rolagem virtual de dados.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Papel |
|:---|:---|:---|
| Next.js | 16.x | Framework React com App Router (Turbopack, React Compiler) |
| React | 19.x | UI com Server e Client Components |
| Tailwind CSS | 4.x | Estilização utilitária + CSS variables de tema |
| Lucide React | 1.x | Ícones SVG temáticos |
| Rpg-backend | — | API REST + Sequelize + PostgreSQL ([repo](https://github.com/Orijnat/Rpg-backend)) |
| Vercel / Render / Supabase | — | Hospedagem frontend / backend / banco em produção |

---

## ✨ Funcionalidades Principais

- **7 Atributos Customizados**: FOR, DES, CON, SAB, ESP, CAR e INT com cálculo automático de modificadores e formatação com sinal (+/−).
- **19 Perícias Integradas**: vínculo direto aos atributos base com controle de treino e bônus customizado por perícia.
- **Raça e Classe de Progressão**: a raça soma seu bônus; a classe define o Dado de Vida e as habilidades de nível — escolha única (depois só o mestre altera).
- **Rolador de Dados Virtual**: d20 com modificador automático, **Vantagem/Desvantagem** (`2d20kh1`/`2d20kl1`), dados avulsos (d4–d100) e histórico da sessão.
- **5 Temas Visuais RPG** (Âmbar Vulcânico padrão, Cripta Abissal, Floresta Ancestral, Sangue Carmesim, Gelo Eterno), persistidos e aplicados sem recarregar.
- **Módulos do Jogador**: Personagem · Inventário · Banco/Cofre (80 slots + senha) · Contratos & Missões · Mundo (NPCs) · Quarto (notas) · Montaria · Habilidades · Mapa Tático · Anotações.
- **Painel do Mestre** (`/admin`): personagens, fichas de heróis, sessões de jogo, encontros táticos, distribuição de XP, catálogo de classes, mercado, mapa tático, NPCs, campanhas e auditoria.
- **Persistência Local-First**: `localStorage` como espelho offline + **sincronização automática** com o backend (debounce, concorrência otimista com `updatedAt`, conflito 409 com escolha do jogador, **retentativa automática** em erros de rede/5xx — seus dados locais nunca são descartados).
- **Backup Manual**: exportação/importação da ficha completa em JSON.

---

## 📂 Estrutura de Pastas

```
Rpg-ficha/
├── src/
│   ├── app/
│   │   ├── context/            # CharacterContext (estado + sync) · AuthContext · DiceContext · ThemeContext
│   │   ├── components/         # Cabeçalho, SettingsModal, perícias, aparência, barra de HP, banco, dados (d20)…
│   │   ├── page.js             # Landing page (/)
│   │   ├── layout.js           # Layout raiz com todos os Providers
│   │   ├── personagem/         # Rota /personagem (a ficha)
│   │   ├── inventario|banco|contratos|mundo|quarto|montaria|anotacoes|habilidades|mapa-tatico|perfil/
│   │   ├── login|registro|convite/   # Autenticação e convites de campanha
│   │   ├── admin/              # Painel do mestre (personagens, fichas, sessões, encontros, classes, mercado…)
│   │   └── globals.css         # Tailwind 4 + variáveis de tema (data-theme)
│   ├── layouts/AppShell.jsx    # Shell global: navegação, guarda de rotas, cabeçalho (HP/XP/sync)
│   └── lib/                    # Regras puras: modifiers, dice, races, classes, abilities, items, leveling, api.js…
│       └── __tests__/          # 162 testes (node test runner)
├── docs/                       # Documentação técnica do projeto
├── .agents/                    # Skills e memórias dos agentes IA
├── .env.example                # NEXT_PUBLIC_API_URL=http://localhost:3333/api
├── next.config.mjs             # React Compiler + security headers
└── vercel.json                 # Framework Next.js (deploy na Vercel)
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js 20+**
- **Rpg-backend** rodando (porta 3333) para login e sincronização — [Rpg-backend/README.md](https://github.com/Orijnat/Rpg-backend)
- PostgreSQL (o frontend funciona offline com `localStorage` sem o backend)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone git@github.com:Orijnat/Rpg-ficha.git
cd Rpg-ficha

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local   # já contém NEXT_PUBLIC_API_URL=http://localhost:3333/api

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — landing page; após login, a ficha fica em [/personagem](http://localhost:3000/personagem).

> O frontend funciona **mesmo sem o backend ativo** — a ficha fica no `localStorage` e sincroniza quando a conexão voltar (retentativa automática em background).

### Build de produção

```bash
npm run build
npm start
```

---

## 🧪 Testes

O projeto usa o **Node.js Test Runner** nativo (sem Jest/Vitest):

```bash
npm test        # equivale a node --test 'src/lib/__tests__/*.test.mjs'
```

**162 testes em 18 arquivos**, cobrindo: modificadores d20 e formatação de sinal, 19 perícias, rolagem com vantagem/desvantagem, temas visuais, cálculo de nível/HP por Dado de Vida, raças e bônus, classes e habilidades, itens e consumíveis, encontros/XP, mercado, mapa tático, autenticação, API safety e backup/importação.

---

## ⚙️ Scripts npm

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build otimizado para produção |
| `npm start` | Inicia o build de produção |
| `npm test` | Suite de testes (node test runner) |
| `npm run lint` | Análise estática com ESLint |

---

## 🌐 Produção

| Camada | Plataforma | Como sobe |
|:---|:---|:---|
| Frontend (este repo) | Vercel | **automático** a cada push na `main` |
| Backend ([Rpg-backend](https://github.com/Orijnat/Rpg-backend)) | Render | **Manual Deploy** (não sobe sozinho no push) |
| Banco | Supabase (PostgreSQL) | `npm run db:migrate` (idempotente) |

- **Backend em produção**: `https://rpg-backend-pmhk.onrender.com` — health check em `GET /api/health`
- **`NEXT_PUBLIC_API_URL`** na Vercel deve terminar em `/api` (ex.: `https://rpg-backend-pmhk.onrender.com/api`)
- Se o backend não subir, a ficha **não sincroniza** (a produção depende do Manual Deploy no Render) — os dados locais continuam seguros no navegador e o sync retenta sozinho.

Checklist completo de deploy, incidentes e rotação de chaves: [`docs/RUNBOOK-PRODUCAO.md`](./docs/RUNBOOK-PRODUCAO.md).

---

## 📚 Documentação Técnica

| Documento | Conteúdo |
|:---|:---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | **Documentação completa do sistema**: front + back, fluxo de sync, auth/sessões, contrato da API, infra, armadilhas conhecidas |
| [RPG_RULES.md](./docs/RPG_RULES.md) | Os 7 atributos, fórmulas d20, tabela de modificadores e 19 perícias |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Modelo relacional, modelos Sequelize e tipos PostgreSQL |
| [RUNBOOK-PRODUCAO.md](./docs/RUNBOOK-PRODUCAO.md) | Deploy, monitoramento, incidentes, rotação de JWT/OAuth |
| [SEGURANCA.md](./docs/SEGURANCA.md) | Políticas de segurança e controle de acesso |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Problemas comuns e soluções |
| [AGENTS_AND_WORKFLOW.md](./docs/AGENTS_AND_WORKFLOW.md) | Equipe multiagente, memórias persistentes e workflow |

---

## ❗ Solução de Problemas

**A ficha não sincroniza com o banco**
→ Verifique se o Rpg-backend está de pé (`GET /api/health`) e se `NEXT_PUBLIC_API_URL` inclui `/api`. O front tenta de novo sozinho; o botão manual "Tentar novamente" também está sempre disponível. Em produção, o backend sobe só com **Manual Deploy no Render**.

**Erro 422 ao salvar**
→ O servidor rejeitou um campo (o popover "N campo(s)" na ficha mostra `campo: mensagem`). Os dois 422 já resolvidos (ids slug não-UUID; `classe` como objeto) estão documentados em [ARCHITECTURE.md §10](./docs/ARCHITECTURE.md).

**401 "Sessão revogada" em tudo**
→ O banco foi restaurado/limpo e as sessões sumiram: faça logout e login de novo.

**Erro de build: módulo não encontrado**
→ Rode `npm install`.

**Hot-reload instável**
→ O Next.js 16 usa Turbopack por padrão; tente `npm run dev -- --no-turbo`.
