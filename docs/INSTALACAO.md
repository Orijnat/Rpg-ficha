# 📦 Instalação — Rpg-ficha (frontend) + Rpg-backend (API)

Ambiente: Linux/macOS, Node.js ≥ 20, PostgreSQL ≥ 14 (local ou Supabase), npm ≥ 10.

## 1. Clonar e instalar

```bash
git clone <url-do-repo-ficha> Rpg-ficha && cd Rpg-ficha && npm install
git clone <url-do-repo-backend> Rpg-backend && cd Rpg-backend && npm install
```

## 2. Configurar o backend (`Rpg-backend/.env`)

Copie `.env.example` (nunca versione o `.env` real) e ajuste:

```bash
PORT=3333
DATABASE_URL=postgres://usuario:senha@localhost:5432/rpg_ficha
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<gere com: openssl rand -hex 32>
NODE_ENV=development
```


Uploads:

```bash
UPLOAD_DIR=./private_uploads   # fora de qualquer diretório público
UPLOAD_MAX_BYTES=5242880       # 5 MB
UPLOAD_READ_TTL_MS=900000      # URLs assinadas vivem 15 min
```

## 3. Criar o banco e aplicar as migrations

```bash
# cria o banco/usuário (uma vez)
sudo -u postgres psql -f database/setup.sql        # ou: createdb rpg_ficha

# aplica baseline + reformulação + incrementais (idempotente)
npm run db:migrate
```

O runner `database/migrate.js` é idempotente: pode rodar N vezes sem efeito colateral.
Em banco **não vazio** a baseline `banco.sql` é ignorada (protege contra apagar tabelas legadas).

Seed de desenvolvimento (opcional, sem credenciais reais):

```bash
npm run db:seed
```

## 4. Rodar

```bash
# terminal 1 — API em http://localhost:3333
cd Rpg-backend && npm run dev

# terminal 2 — frontend em http://localhost:3000
cd Rpg-ficha && npm run dev
```

## 5. Verificar a instalação

```bash
cd Rpg-backend && npm test            # 22 testes (controllers, schemas, sync 409)
cd Rpg-ficha && npm test              # 140 testes (regras, dados, temas, backup)
cd Rpg-ficha && npm run build         # build de produção (30 rotas)
curl http://localhost:3333/api/health # {"status":"ok"...}
```

## Variáveis de ambiente do frontend (`Rpg-ficha/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

## Produção (resumo)

- Frontend: Vercel (ou `npm run build && npm start`); Backend: Render/Railway/VM com
  `npm start`; Banco: Supabase (SSL automático pelo `DATABASE_URL`).
- `NODE_ENV=production` e `JWT_SECRET` forte; `CORS_ORIGIN` com o domínio real.
- `npm run db:migrate` no deploy; backup agendado (`npm run db:backup`) — ver
  [`BACKUP-RESTORE.md`](BACKUP-RESTORE.md) e [`RUNBOOK-PRODUCAO.md`](RUNBOOK-PRODUCAO.md).
