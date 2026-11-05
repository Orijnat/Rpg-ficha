---
name: fullstack-web-publisher
description: "Orquestração completa de publicação web para sistemas fullstack (Frontend Next.js na Vercel + Backend Express/Sequelize no Render/Railway + PostgreSQL no Supabase), incluindo variáveis cruzadas, CORS e validação de ponta a ponta."
user-invocable: true
---

# Skill: Fullstack Web Publisher

Esta skill orienta o processo integrado para colocar na web toda a stack do sistema RPG:
- **Banco de Dados**: PostgreSQL na nuvem via **Supabase**.
- **Backend API**: Node.js / Express / Sequelize no **Render** (ou Railway).
- **Frontend**: Next.js 16 (App Router) na **Vercel**.

---

## 🗺️ Mapa da Arquitetura em Nuvem

```
  ┌────────────────────────────────────────────────────────┐
  │                 Usuário / Navegador                    │
  └──────────────────────────┬─────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Frontend na Vercel ]            [ Backend no Render ]
 https://rpg-ficha.vercel.app      https://rpg-api.onrender.com
            │                                 │
            │ (REST / JSON com JWT)           │ (Conexão Pooler SSL)
            └────────────────────────────────►▼
                                    [ Banco no Supabase ]
                                   PostgreSQL (sa-east-1)
```

---

## 📋 Roteiro de Publicação em 5 Fases

### Fase 1: Banco de Dados no Supabase
1. Crie o projeto em [supabase.com](https://supabase.com).
2. Obtenha a connection string do **Session Pooler** (porta `5432`):
   `postgres://postgres.[REF]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`
3. Execute as migrations do backend localmente apontando para o Supabase:
   ```bash
   cd /caminho/para/Rpg-backend
   DATABASE_URL="sua-connection-string" DB_SSL="true" npx sequelize-cli db:migrate
   ```

---

### Fase 2: Publicação do Backend (Render ou Railway)
Como o backend é uma API Express que gerencia conexões e listeners HTTP, utilize o [Render.com](https://render.com) (plano gratuito) ou Railway:

1. Acesse o **Render** e selecione **"New Web Service"**.
2. Conecte o repositório do backend (`Rpg-backend`).
3. Preencha as configurações do serviço:
   - **Environment**: `Node`.
   - **Build Command**: `npm install`.
   - **Start Command**: `npm start`.
4. Defina as Variáveis de Ambiente (**Environment Variables**):
   | Variável | Valor Recomendado |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (padrão Render) ou `3333` |
   | `DATABASE_URL` | *String copiada do Supabase* |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *Uma chave criptográfica aleatória e longa* |
   | `FRONTEND_URL` | Temporariamente `*` ou deixe vazio até criar a Vercel |
5. Clique em **"Create Web Service"**.
6. Guarde a URL gerada (ex: `https://rpg-api.onrender.com`).
7. Teste no navegador: `https://rpg-api.onrender.com/api/health` deve responder `{ status: "ok" }`.

---

### Fase 3: Publicação do Frontend na Vercel
1. Acesse a [Vercel](https://vercel.com) e clique em **"Add New Project"**.
2. Importe o repositório `Rpg-ficha`.
3. Em **Environment Variables**, adicione:
   | Variável | Valor |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://rpg-api.onrender.com/api` *(URL da Fase 2)* |
   | `NODE_ENV` | `production` |
4. Clique em **Deploy**. A Vercel criará o build de produção e entregará a URL (ex: `https://rpg-ficha.vercel.app`).

---

### Fase 4: Fechamento de Segurança e CORS Cruzado
Após obter a URL oficial da Vercel:
1. Volte ao painel do **Render** (Backend).
2. Atualize a variável:
   `FRONTEND_URL=https://rpg-ficha.vercel.app`
3. Salve as alterações. O Render reiniciará a aplicação com o CORS restrito à sua aplicação frontend oficial, bloqueando chamadas não autorizadas de outros domínios.

---

### Fase 5: Validação e Smoke Test de Produção
Realize o checklist de ponta a ponta na URL da Vercel:
- [ ] **Landing Page**: Acesso público em `/` carrega estilos, temas e imagens sem erro 404.
- [ ] **Registro / Login**: Crie um novo usuário no formulário de cadastro.
- [ ] **Token JWT**: Verifique se o token é armazenado com segurança no `sessionStorage`.
- [ ] **Ficha do Herói**: Atualize o nome, HP ou atributos e confirme se o badge de sincronização fica verde (*"Salvo na Nuvem"*).
- [ ] **Banco no Supabase**: Abra o **Table Editor** no Supabase e confira se a linha do novo personagem foi inserida com sucesso.
- [ ] **Rolagem de Dados**: Abra o modal d20 e execute uma rolagem com vantagem/desvantagem.
