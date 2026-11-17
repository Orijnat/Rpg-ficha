---
name: email-api
description: Montagem/integração de API de envio de e-mail no Grimorium (Resend ou SMTP) e o fluxo de VERIFICAÇÃO DE E-MAIL POR CÓDIGO de 6 dígitos — do provedor ao endpoint verify-email-code, template transacional, segurança (HMAC, timing-safe, rate-limit, anti-enumeração) e troubleshooting de produção. Use SEMPRE que o usuário falar em configurar e-mail, Resend, SMTP, "e-mail não chega", código de verificação, cadastro com verificação, redefinição de senha por e-mail, e-mail transacional, ou em adicionar um novo tipo de e-mail no sistema.
user-invocable: true
---

# ✉️ Skill: E-mail API + Verificação por Código (Grimorium)

Tudo que um agente precisa para montar a infra de e-mail do Grimorium do zero,
mantar o fluxo de código de verificação (implementado em 2026-11-17, fortalecido
no mesmo dia) e estender para novos e-mails transacionais.

**Localização**: backend `../Rpg-backend` (irmão deste repo); frontend Next.js aqui (`src/app/verificar-email/`).
**Commits de referência**: `3a35a2a` (Resend no mailer), `5faaebf` (fluxo de código), `9107f3f` (fix sync) + fortalecimento de 2026-11-17 (HMAC + tentativas + flag).

---

## 🧱 Arquitetura (mapa de arquivos)

| Peça | Arquivo |
|---|---|
| Serviço de e-mail (provider-agóstico) | `../Rpg-backend/src/services/mailer.js` |
| Fluxo verify/reset no controller | `../Rpg-backend/src/controllers/authController.js` |
| Rotas (todas atrás de `authRateLimiter`) | `../Rpg-backend/src/routes/authRoutes.js` |
| Rate limit (5 req/min/IP em auth) | `../Rpg-backend/src/middlewares/security.js` |
| Modelo User (campos `verification_*`) | `../Rpg-backend/src/models/User.js` |
| Migrations | `database/migrations/20261117010000-verification-code.js`, `20261117020000-verification-attempts.js` |
| Página de verificação (front) | `src/app/verificar-email/page.jsx` (aceita `?token=` legado ou `?email=` com código) |
| Chamadas front | `src/lib/api.js`: `verifyEmailOnBackend`, `verifyEmailCodeOnBackend`, `resendVerificationOnBackend` |

Funções exportadas por `mailer.js`: `gerarToken`, `hashToken` (SHA-256 puro — tokens de 256 bits, ok),
`gerarCodigoVerificacao`, `hashCodigo` (HMAC-SHA256 — código de 6 dígitos), `hashesIguais` (timing-safe),
`isSmtpConfigured`, `emailProvider`, `enviarEmail`, `enviarEmailVerificacao`, `enviarEmailRedefinicao`.

---

## 🔧 Passo a passo: montar a API de e-mail do zero

### Opção A — Resend (recomendado em produção)

1. Criar conta em resend.com → **API Keys** → gerar chave (`re_...`).
2. **Domínio de testes**: sem domínio verificado, o Resend só envia pelo remetente
   `onboarding@resend.dev` **e somente para o e-mail da própria conta Resend**. Ótimo para validar o fluxo;
   insuficiente para usuários reais.
3. **Domínio próprio** (produção real): em *Domains* → adicionar domínio → criar os registros DNS pedidos
   (DKIM/SPF/MX) no provedor do domínio → verificar. Só então enviar de `Grimorium <no-reply@seudominio.com>`.
4. Variáveis de ambiente (local `.env`; produção no dashboard do **Render**):
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_sua-chave
   SMTP_FROM=Grimorium <onboarding@resend.dev>   # ou seu domínio verificado
   FRONTEND_URL=https://rpg-ficha-one.vercel.app # SEM barra final
   REQUIRE_EMAIL_VERIFICATION=true
   ```
5. **Redeploy do backend no Render** — env vars só valem após novo deploy.
6. Teste real rápido (sem subir o app):
   ```bash
   curl -s -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" -H "Content-Type: application/json" \
     -d '{"from":"Grimorium <onboarding@resend.dev>","to":"SEU_EMAIL@exemplo.com","subject":"teste","html":"<p>ok</p>"}'
   ```

### Opção B — SMTP convencional (nodemailer)

```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_SECURE=false        # true só na porta 465
SMTP_USER=...
SMTP_PASS=...            # senha de app, nunca a senha pessoal
SMTP_FROM=Grimorium <no-reply@seudominio.com>
```

### Modo dev (sem provedor)

Sem `EMAIL_PROVIDER` nem `SMTP_HOST`, `enviarEmail` loga `[MAIL:dev]` e retorna `{ devMode: true }`.
Fora de produção, `register`/`resend-verification` devolvem `devCode`/`devPreviewUrl` na resposta HTTP
para facilitar testes locais. Em produção esses campos **nunca** são devolvidos.

---

## 🔢 Fluxo do código de verificação (como funciona e por que)

1. **Registro** não loga. Gera código de **6 dígitos** (`crypto.randomInt`), hash **HMAC-SHA256**
   (`email-code:` + código, chave `EMAIL_CODE_SECRET || JWT_SECRET`) → `verification_code_hash`;
   expira em **15 min**; link legado de 24h vai junto no e-mail. `verification_attempts = 0`.
   *Por que HMAC e não SHA-256?* Com 1M de combinações, SHA-256 puro permite força bruta offline num
   vazamento de banco; o HMAC exige a chave do servidor.
2. **Login**: sem `emailVerified` → `403` com `code: "EMAIL_NOT_VERIFIED"` (padrão ativo;
   `REQUIRE_EMAIL_VERIFICATION=false` desliga — só para testes).
3. **`POST /api/auth/verify-email-code`** (`body: { email, code }`):
   - comparação em **tempo constante** (`hashesIguais`);
   - código errado → incrementa `verification_attempts`; ao atingir **`VERIFICATION_MAX_ATTEMPTS`** (padrão **5**),
     o código é **invalidado** (hash apagado) — nem o código certo vale mais;
   - sucesso → `emailVerified=true`, limpa hash/expiração, zera tentativas;
   - respostas genéricas anti-enumeração para e-mail inexistente ("Código inválido ou expirado.").
4. **`POST /api/auth/resend-verification`**: sempre `200` (anti-enumeração); gera novo código+token,
   zera tentativas; front reenvia e mostra mensagem neutra.
5. **Link legado** (`/verificar-email?token=`, `POST /verify-email`): SHA-256 puro do token de 256 bits
   (offline brute force inviável) — mantido por compatibilidade com e-mails já enviados.
6. **Frontend** `/verificar-email`: aceita código (input `one-time-code`) ou token do link; reenvio embutido;
   cadastro redireciona para cá com `?email=`.

### Checklist de segurança ao mexer no fluxo

- Nunca devolva `devCode`/`devPreviewUrl` em produção (gate: `NODE_ENV !== "production"`).
- Nunca vaze `verification_*` em respostas (`usuarioParaResposta` e `User.toJSON` já apagam).
- Manter rotas atrás de `authRateLimiter` (5/min/IP) **e** o limite por conta (5 erros → código invalidado).
- Anti-enumeração: `resend-verification` e `forgot-password` sempre respondem 200.
- Código novo sempre zera `verification_attempts` (register e resend fazem isso).

---

## 🧪 Verificação (obrigatória ao alterar)

```bash
cd ../Rpg-backend
npm test                    # inclui mailer.test.js (Resend HTTP mockado) e verification_code.test.js (7 casos)
npm run db:migrate          # idempotente; registra em sequelize_meta
```

Sem banco populado, valide o envio real com o `curl` da seção Resend. No fluxo completo local
(sem provedor): registre um usuário → o console mostra `[MAIL:dev] Código ...` e a resposta traz `devCode`.

**Nota de deploy**: códigos emitidos **antes** da troca SHA-256→HMAC (2026-11-17) viram lixo — usuários
com e-mail pendente precisam clicar em "Reenviar código". O banco de produção foi purgado e não há
códigos válidos pendentes.

---

## ➕ Estender para novos e-mails transacionais

1. Escrever `enviarEmailXxx({ para, ...dados })` em `mailer.js` reutilizando `shell(t, corpo)` (template
   dark-fantasy) e `botao(url, texto)` para CTAs.
2. Montar o conteúdo com os dados mínimos — **nunca** incluir senha, hashes ou tokens além do necessário.
3. Chamar com `try/catch`: falha de e-mail **não** deve derrubar a requisição principal (logar e seguir,
   como no registro).
4. Cobrir o caso dev (`devMode`) e, se aplicável, `devCode` só fora de produção.
5. Adicionar teste em `test/mailer.test.js` ou arquivo próprio (padrão: models mockados + `global.fetch`
   stub para Resend).
6. Se o e-mail carrega ação sensível (reset, convite), usar token de 256 bits com hash SHA-256 + expiração,
   nunca o padrão HMAC do código de 6 dígitos.

---

## ⚠️ Armadilhas conhecidas

1. **"E-mail não verificado" no login logo após cadastro** — esperado: o fluxo exige código. Checar
   `REQUIRE_EMAIL_VERIFICATION` (padrão true) e se a conta foi selada em `/verificar-email`.
2. **Resend 403 `Invalid API key`** — chave errada/revogada ou `EMAIL_PROVIDER` não propagado (falta redeploy).
3. **Só chega e-mail para o dono da conta Resend** — domínio `onboarding@resend.dev` sem domínio verificado.
4. **E-mails em spam** — faltam DKIM/SPF/DMARC; verifique o domínio no painel do Resend.
5. **`EMAIL_NOT_VERIFIED` após deploy novo** — troca de algoritmo de hash invalida códigos antigos; pedir reenvio.
6. **`FRONTEND_URL` com barra final** — gera links `//verificar-email`; normalize sem `/$`.
7. **Hashes no payload JSON** — sempre passar por `usuarioParaResposta`; nunca devolver `user.get()` cru.
8. **Válvula de escape em testes**: `REQUIRE_EMAIL_VERIFICATION=false` — não exista em produção.
9. **Migration manual fora do runner**: sempre `npm run db:migrate` (registra em `sequelize_meta`);
   `ADD COLUMN IF NOT EXISTS` torna reexecução segura.

---

## 📌 Estado em 2026-11-17

- `mailer.js`: Resend via `fetch` (sem SDK) + SMTP via nodemailer; modo dev por console.
- Código de 6 dígitos: HMAC, 15 min, 5 tentativas, comparação timing-safe, invalidação no limite.
- `REQUIRE_EMAIL_VERIFICATION` lido de fato (padrão true) — antes, era documentado mas ignorado e o
  bloqueio era incondicional.
- Testes: `test/verification_code.test.js` (sucesso, lockout na 5ª tentativa, expiração,
  flag do login on/off) — suíte backend **81/81**.
- Pendente do operador: envs no Render (`EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `SMTP_FROM`,
  `FRONTEND_URL`, `REQUIRE_EMAIL_VERIFICATION=true`) + Manual Deploy; domínio verificado para envios reais.
