# 🧯 Troubleshooting — causas comuns e correção

## Frontend não conecta na API
1. `curl http://localhost:3333/api/health` — responde `{"status":"ok"}`?
2. `NEXT_PUBLIC_API_URL` do frontend aponta para a porta certa (`/api` no final)?
3. `CORS_ORIGIN` no backend inclui a origem exata do frontend (sem wildcard)?
   O health responde com headers de segurança incluindo CSP — confira o console do navegador.

## "Sessão revogada ou expirada" após algum tempo/descanso
Token válido por 7 dias **e** sessão server-side obrigatória. Logout, redefinição de senha
e (opcionalmente) troca de dados da conta revogam a sessão. Solução: autenticar de novo.
Se persistir logo após o login, o relógio do servidor está errado — verifique NTP.

## 429 "Limite de tentativas de autenticação"
5 tentativas/min por IP em `/auth/*` (configurável por `AUTH_RATE_LIMIT`). Aguarde 1 min;
IPs atrás de proxy compartilhado podem tomar limite coletivo — suba o valor com critério.

## Migration falha no deploy
- Rode `npm run db:migrate` manualmente e leia o erro. O runner é idempotente —
  rodar de novo é seguro; a baseline só roda em banco sem `usuarios`.
- Erro `permission denied` em Supabase: usar a *connection string* com papel
  `postgres` ou `service_role` (migrations criam tabelas/índices).
- Erro `relation already exists`: alguém aplicou o DDL à mão; o runner usa
  `IF NOT EXISTS` em tudo — confirme que o arquivo não foi editado localmente.

## Upload recusado: "Tipo de conteúdo não suportado"
Validado por **magic bytes**: PNG/JPEG/GIF/WebP/PDF apenas, ≤ `UPLOAD_MAX_BYTES`.
Renomear `.png`→`.exe` não ajuda (a extensão é conferida contra o conteúdo).
SVG é deliberadamente recusado (conteúdo ativo). Para imagens de anotações,
salve como PNG/WebP/JPEG.

## Cofre do banco não abre
Senha personalizada (se definida) ou a **senha do login do dono da ficha** —
nunca a senha de outro membro ou do mestre. Mestre inspecionando a ficha de outro
não abre o cofre do jogador (por desenho).

## Conflito de sync (409)
A ficha foi alterada no servidor desde o último save. Na barra de sincronização:
"Manter da nuvem" (descarta o rascunho local) ou "Manter meus dados" (sobrescreve o servidor).
Se o conflito for recorrente no autosave, recarregue a aba (ficha estagnada).

## 500 em `/api/characters/sync`
Verifique `updatedAt` no payload (o frontend envia). Se o deploy misturou versões
do aplicativo, o campo pode faltar — o backend tolera ausência (legado).

## E-mail de verificação/reset não chega
Sem `SMTP_*` configurado: o link é logado no servidor (`[MAIL:dev]`) e devolvido
como `devPreviewUrl` fora de produção. Com SMTP, confira spam e o `SMTP_FROM`;
provedores exigem domínio autenticado (SPF/DKIM) para não cair no spam.

## Logs
Backend loga em stdout (sem senhas/tokens por política). Erros de auditoria
saem como `[AUDITORIA-FALHA]` com contexto. Nenhum conteúdo privado de ficha
vai para logs.
