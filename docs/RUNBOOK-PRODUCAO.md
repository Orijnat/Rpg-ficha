# 🛠️ Runbook de produção — Grimorium

## Deploy (checklist de implantação)

1. **Banco**: `npm run db:migrate` (idempotente) — rodar ANTES de subir a nova API.
2. **API** (`Rpg-backend`): `npm ci && npm start` atrás de proxy com **HTTPS**
   (TLS terminado no proxy; app plain HTTP interno). Health: `GET /api/health`.
   O app exige `app.set("trust proxy", 1)` no `server.js` (commit `04a2a5c`) para
   o rate limiter identificar IP — não remova sem reavaliar.
3. **Frontend** (`Rpg-ficha`): `npm ci && npm run build`, servir com `npm start`
   ou publicar na Vercel; `NEXT_PUBLIC_API_URL` no build.
4. **Segredos**: `JWT_SECRET` (≥32 chars, `openssl rand -hex 32`), `DATABASE_URL`
   com SSL, `CORS_ORIGIN` = domínio exato do frontend, `SMTP_*` se e-mail for
   necessário. Nada de segredos no repositório ou em logs.
5. **Pós-deploy**: `npm test` (22/22), `curl /api/health`, login de smoke test,
   `npm run db:backup` (smoke do backup), observação de erro por 15 min.

## Monitoramento

- Health: `/api/health` (não depende do banco; `database: unavailable` indica DB fora).
- Logs: stdout (sem conteúdo privado). Alertas recomendados: 5xx > 2%,
  latência p95 > 1s, `[AUDITORIA-FALHA]` recorrente, 401/403 acima da linha de base.
- Sem coleta de dados de fichas em logs/telemetria.

## Incidentes

| Cenário | Ação imediata |
|---|---|
| Vazamento de segredo | rotacionar `JWT_SECRET` (invalida tudo) e `SMTP_PASS`/`DATABASE_URL`; revisar logs; notificar usuários se dados expostos |
| Banco corrompido/perdido | `npm run db:backup --restore` em banco limpo (ver BACKUP-RESTORE.md); rodar migrações; subir API em modo leitura se possível |
| Deploy quebrado | rollback para a tag anterior; migrações são aditivas (sem drops) — down via backup, nunca `DROP` manual |
| Conta comprometida | desativar `usuarios.ativo=false`; `UPDATE ... SET password_changed_at=now()` + revogar sessões (`sessoes_autenticacao.revogada_at`); auditar `auditoria` |
| Abuso de API | subir `AUTH_RATE_LIMIT` temporariamente ou bloquear IP no proxy; revisar logs de 429/401 |

## Rolagem de chave (JWT/OAuth)

- **JWT**: troque `JWT_SECRET` a cada 90 dias ou sob suspeita. Todos os tokens invalidam
  na hora (logout global implícito); usuários re-autenticam. Não há sessão "quase válida".
- **Google OAuth** (se/quando configurado): `GOOGLE_TOKEN_ENCRYPTION_KEY` rotaciona com
  re-emissão de tokens; `GOOGLE_CLIENT_SECRET` no console + `.env`; revogar refresh
  tokens antigos no Google Admin.
- **SMTP**: senha de app dedicada, escopo mínimo; rotacionar semestralmente.

## Tarefas operacionais

```bash
# Backup e retenção
npm run db:backup            # cria backups/backup-*.sql.gz
npm run db:prune             # aplica retenção (30 dias)
# Uploads
- O disco do Render é **efêmero** (`private_uploads/` some a cada deploy/restart);
  para o mapa use fundo por sessão/URL externa. Imagens privadas devem usar
  storage persistente (object storage) antes de depender delas em produção
  (ver TROUBLESHOOTING.md). O backend serve `/api/arquivos/:id` com
  `Cross-Origin-Resource-Policy: cross-origin` (commit `77cc96a`) — necessário
  para `<img>` cross-origin da Vercel.
npm run uploads:clean -- --dry-run   # lista órfãos sem apagar
npm run uploads:clean                # remove órfãos (disco sem metadado / vice-versa)
# Banco
npm run db:migrate           # aplica migrações pendentes (idempotente)
```

## Escalas e limites

- Payload JSON ≤ 2 MB; uploads ≤ `UPLOAD_MAX_BYTES` (5 MB); 1 arquivo/request.
- Rate limit: 100 req/min geral, 5/min em `/auth/*`.
- Sync da ficha: debounce 800ms; conflito 409 exige decisão do jogador.
