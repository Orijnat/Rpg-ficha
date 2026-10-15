# ⚔️ Ficha de RPG Web

Aplicação web moderna e interativa para gerenciamento da **Ficha de Personagem** de um sistema próprio de RPG de mesa baseado no sistema d20 customizado (com 7 atributos).

Desenvolvida com foco em alta performance, usabilidade em smartphones e desktop, rolagem virtual de dados com suporte a bônus, vantagens e desvantagens, além de persistência em nuvem.

---

## 🛠️ Stack Tecnológica

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend & APIs**: Next.js Route Handlers (`src/app/api/...`)
- **ORM & Banco de Dados**: [Sequelize ORM](https://sequelize.org/) + [PostgreSQL](https://www.postgresql.org/)
- **Arquitetura de Agentes**: Sistema Multiagente com memórias ativas e skills reutilizáveis em `.agents/`

---

## ✨ Funcionalidades Principais

- **7 Atributos Customizados**: FOR, DES, CON, SAB, ESP, CAR e INT com cálculo automático de modificadores e formatação com sinal (+/-).
- **19 Perícias Integradas**: Vínculo direto aos atributos base com controle de treino (`trained`) e bônus customizado.
- **Rolador de Dados Virtual Integrado**:
  - Rolagem padrão de d20 com modificador.
  - Mecânica de **Vantagem** (`2d20kh1`) e **Desvantagem** (`2d20kl1`).
  - Suporte a dados avulsos (`d4, d6, d8, d10, d12, d20, d100`) e histórico de rolagens da sessão.
- **Módulos do Jogador**:
  - **Inventário**: Gestão de itens, equipamentos e quantidades.
  - **Banco / Cofre**: 80 slots de armazenamento protegidos por senha de segurança.
  - **Contratos & Missões**: Acompanhamento de quests e recompensas.
  - **Montaria**: Ficha dedicada com nome, HP atual, HP Máximo e notas.
  - **Aparência & Biografia**: Registro visual e descritivo completo do herói.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 20+ ou superior
- PostgreSQL (opcional para o modo de desenvolvimento com estado local, obrigatório para a API)

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd Rpg-ficha
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL="postgres://usuario:senha@localhost:5432/rpg_ficha"
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador. A rota raiz redireciona automaticamente para `/personagem`.

---

## 📚 Documentação do Projeto

Para se aprofundar nos detalhes do sistema e arquitetura, consulte a pasta [`docs/`](./docs/):

- 🏗️ [**Arquitetura do Sistema**](./docs/ARCHITECTURE.md): Diagrama do sistema, Next.js 16, React 19 e fluxo de dados.
- 📜 [**Manual de Regras do RPG**](./docs/RPG_RULES.md): Os 7 atributos, fórmulas matemáticas, tabela de modificadores e perícias.
- 🗄️ [**Esquema do Banco de Dados**](./docs/DATABASE_SCHEMA.md): Diagrama ER, tabelas, models Sequelize e tipos PostgreSQL.
- 🤖 [**Guia de Agentes & Memórias**](./docs/AGENTS_AND_WORKFLOW.md): Operação da equipe multiagente e protocolo de memória persistente.

---

## 🧠 Equipe de Agentes e Memórias

O projeto é mantido colaborativamente por uma equipe multiagente com memórias persistentes em [`.agents/memory/`](./.agents/memory/):

- **`@orchestrator`**: Tech Lead e coordenador da arquitetura.
- **`@rpg-rules-engine`**: Motor matemático e regras d20.
- **`@dice-mechanic`**: Engenharia de dados e rolagens virtuais.
- **`@frontend-artisan`**: UI/UX mobile-first em Tailwind CSS v4.
- **`@backend-database`**: PostgreSQL, Sequelize e APIs.
- **`@qa-tester`**: Validações, limites matemáticos e qualidade.
