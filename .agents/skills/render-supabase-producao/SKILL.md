---
name: render-supabase-producao
description: Armadilhas e checklists de produção do stack Grimorium (frontend Vercel + backend Express no Render + Postgres no Supabase) — trust proxy, CORP/helmet, disco efêmero, migrações em produção, variáveis de ambiente e diagnóstico de login/imagens quebrados.
user-invocable: true
---

# 🚀 Skill: Render + Supabase/Vercel — Produção sem surpresas

Checklist vivo dos incidentes reais desta app (2026-11-14/15) e como diagnosticar rápido.
Topologia: `rpg-ficha-one.vercel.app` (front) → `rpg-backend-pmhk.onrender.com` (API) → Supabase Postgres (Session Pooler, porta 5432).

---

## 🎯 Mapa mental de falhas (sintoma → causa → correção)

| Sintoma | Causa típica | Correção |
|---|---|---|
| `ValidationError: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` + login nunca funciona | `trust proxy` falso por padrão; Render injeta `X-Forwarded-For` | `app.set("trust proxy", 1)` no `server.js` (commit `04a2a5c`) |
| `SequelizeDatabaseError: column "email_verified" does not exist` no login | Migrations aplicadas só no dev; prod ficou para trás | `node database/migrate.js` com `DATABASE_URL` do Supabase (idempotente; pode rodar 2×) |
| Imagens quebram só em produção (ou só cross-origin) | Helmet default `Cross-Origin-Resource-Policy: same-origin` | `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })` |
| Imagens somem após cada deploy/restart | Disco do Render é efêmero; `private_uploads/` não persiste | Decisão do operador (2026-11-15): não usar Storage; fundo do mapa por sessão + URL externa |
| 403 ao carregar imagem via `<img>` com URL assinada expirada | `UPLOAD_READ_TTL_MS` (15 min) vs. cache do browser/página antiga | Recarregar mapa (gera URLs novas); o `<img>` não envia Authorization |
| `429` em login/register | `authRateLimiter` (5/min) atrás de proxy sem `trust proxy` | Ver linha 1; em dev `AUTH_RATE_LIMIT=100` |
| 409 no sync da ficha | Escrita concorrente com `updatedAt` do servidor; contrato de sync | Manter `updatedAt` ecoado; conflitos oferecem "Manter da nuvem"/"Forçar" |
| CORS bloqueado (`Origem não permitida`) | `CORS_ORIGIN`/`FRONTEND_URL` no Render não inclui a origem exata da Vercel | Lista separada por vírgula, sem `*` (validada no boot) |

## ✅ Regras de ouro para deploys

1. **Ordem segura**: migrations **antes** (ou junto) do código que depende das colunas novas, **sempre** contra o banco certo — lembre-se que `.env` local aponta para o Supabase de **produção**; rode `node database/migrate.js` com consciência e só em janelas tranquilas.
2. `npm run build` no front e `node --check src/server.js` + `npm test` no back antes de push (CI já faz isso, mas fluxo local evita ping-pong).
3. Render Web Service: push em `main` dispara deploy; o serviço dorme após inatividade (cold start ~30–50 s no free tier) — a primeira requisição pode demorar.
4. **Nunca** logar `DATABASE_URL`, `JWT_SECRET` ou `service_role` em tela/log de chat; `.env` nunca vai para o git (varredura `git status` antes de todo commit).
5. Em produção, qualquer comando com efeito no banco deve ser precedido de `pg_isready`/backup (`database/backup.js`) quando houver risco.
6. Supabase "lotar" preocupação do operador: **Storage ≠ Postgres**. Quotas são separadas; mas nesta instância a decisão foi não usar object storage — fundo via sessão/URL.

## 🔎 Diagnóstico rápido (comandos)

```bash
# O que a API de produção tem aplicado?
node database/migrate.js          # idempotente; imprime o que aplicou

# A imagem está no banco mas não no disco? (Sinal de disco efêmero)
# GET /api/arquivos/<id>?rt=<token> deve responder 410 "Arquivo ausente no armazenamento."

# Headers de segurança da API
curl -s -D - -o /dev/null https://rpg-backend-pmhk.onrender.com/api/health | grep -iE 'cross-origin|strict-transport'

# Health/readiness completos
curl -s https://rpg-backend-pmhk.onrender.com/health/live    # liveness
curl -s https://rpg-backend-pmhk.onrender.com/health/ready   # checa Postgres
```

## 🧯 O que NÃO fazer em produção

- Não rodar `npm run db:migrate:undo` contra o Supabase sem plano explícito.
- Não usar `banco.sql` manual para "consertar" schema — sempre via runner idempotente.
- Não aumentar `UPLOAD_MAX_BYTES` sem verificar o proxy (Render corta bodies grandes).
- Não confiar em `urlFundoAssinada` por mais de 15 min (TTL HMAC).
- Não registrar no `.env.example` valores reais — placeholders apenas.

## 📚 Relacionados

- Skill `mapa-tatico` (ACL e fundo por sessão), `banco-de-dados-ops` (migrations),
- docs `docs/RUNBOOK-PRODUCAO.md`, `docs/TROUBLESHOOTING.md`, `docs/SEGURANCA.md` no repo **Rpg-ficha**; `docs/modelo-dados.md` no **Rpg-backend**.
