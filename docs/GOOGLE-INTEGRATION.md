# 🔗 Integração Google (Drive / Sheets / Docs)

A integração permite ao **mestre** importar a planilha técnica da mesa e exportar
ficha/NPC/campanha para o Google Sheets/Docs. O fluxo direto fica disponível quando as
credenciais estiverem configuradas; **sem elas, nada quebra** — os endpoints respondem
`501 Not Implemented` com instruções.

## Estado atual (2026-11-14)

| Capacidade | Estado |
|---|---|
| Exportar ficha → CSV (importável no Sheets) | ✅ `GET /api/export/characters/:id.csv` |
| Exportar NPCs (bestiário) → CSV | ✅ `GET /api/export/npcs.csv?campanhaId=` |
| Exportar campanha → CSV | ✅ `GET /api/export/campaign/:id.csv` |
| Mapeamentos testados | ✅ `test/csv_export.test.js` |
| OAuth + Drive/Sheets/Docs via API | ⏳ pendente das credenciais do operador |
| Sincronização bidirecional | ⏳ escopo próprio (ver abaixo) |

O caminho CSV cobre 100% dos casos de "levar o Grimorium para o Sheets hoje"
(`Arquivo → Importar → Upload`, com BOM para acentuação PT-BR).

## Passo a passo — Google Cloud Console

1. **Criar projeto** no [console.cloud.google.com](https://console.cloud.google.com).
2. **Ativar APIs**: Google Drive API, Google Sheets API, Google Docs API.
3. **OAuth consent screen** (External): app Grimorium; escopos `drive.file`,
   `spreadsheets`, `documents`; usuários de teste enquanto em "Testing".
4. **Credenciais** → OAuth Client ID (Web application):
   - Authorized redirect URI: `${GOOGLE_REDIRECT_URI}` (ex.:
     `https://api.seudominio.com/api/google/callback`).
5. **Backend `.env`**:
   ```bash
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=https://api.seudominio.com/api/google/callback
   GOOGLE_TOKEN_ENCRYPTION_KEY=<32 bytes aleatórios, ex.: openssl rand -hex 32>
   ```
6. Reiniciar a API. Status: `GET /api/google/status` → `{configured: true}`.

## Escopos mínimos (menos privilégio)

- `drive.file` — acesso apenas a arquivos/pastas criados pelo app.
- `spreadsheets` — ler/escrever apenas as planilhas abertas pelo usuário.
- `documents` — idem para Docs.

Ao final, **remover o acesso** revoga o token imediatamente: desconectar no Google
(`myaccount.google.com/permissions`) ou implementar `DELETE /api/google/connection`.

## Roteiro de implementação restante (quando as credenciais existirem)

1. Tabela `conexoes_google(usuario_id PK, refresh_token_cifrado, escopo, created_at)`.
2. `GET /api/google/auth-url` → URL de consentimento (state = JWT curto).
3. `GET /api/google/callback` — troca `code` por tokens, cifra
   `refresh_token` (AES-256-GCM, chave em `GOOGLE_TOKEN_ENCRYPTION_KEY`), grava a conexão.
4. `GET /api/google/files` — Drive `files.list` com escopo `drive.file`.
5. `POST /api/google/sheets/pull/:spreadsheetId` — lê abas e mapeia para o modelo
   (atributos/perícias/HP/moedas; aba `Personagens`, `NPCs`, `Notas`).
6. `POST /api/google/sheets/push/:entity` — exporta o mesmo caminho inverso
   (`exportController`-like, via Sheets API).
7. `últ. alteração vence por campo`: `updatedAt` por entidade + origem
   (`app` vs `sheets`) no registro de sincronização (`sync_google_log`).
8. Conflitos mostrados ao mestre (lista de campos com `app` e `sheets` divergentes).
9. `POST /api/google/docs/diario` — exporta anotações como Google Doc.

## Teste mínimo manual (com credenciais)

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3333/api/google/status
# { "configured": true }
curl -H "Authorization: Bearer $TOKEN" -L \
  "http://localhost:3333/api/google/auth-url" | jq .url
# Abrir a URL; após o consentimento, GET /api/google/files lista a pasta-raiz
```

## Revogação, expiração e renovação

- `refresh_token` cifrado em repouso; `access_token` em memória.
- Expiração: renovação automática no primeiro uso; falha → mestre vê erro de
  reautorização (botão "Reconectar Google") na tela da mesa.
- Revogação: `DELETE /api/google/connection` apaga o registro e revoga no Google
  (`https://oauth2.googleapis.com/revoke`).
