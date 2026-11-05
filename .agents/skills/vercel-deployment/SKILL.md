---
name: vercel-deployment
description: "Guia completo e procedimentos operacionais para publicar, configurar e gerenciar o deploy de aplicações Next.js na Vercel (CLI e Git Integration), incluindo variáveis de ambiente, domínios, headers de segurança e troubleshooting."
user-invocable: true
---

# Skill: Vercel Deployment

Esta skill orienta agentes e engenheiros a publicar, configurar e monitorar aplicações Next.js (App Router) na plataforma de nuvem **Vercel**.

---

## 🎯 Visão Geral
A Vercel é a plataforma nativa otimizada para Next.js, fornecendo:
- Build automatizado a partir de branches Git (`main` para Produção, PRs para Preview).
- Edge Network global com cache automático e certificado SSL gratuito.
- Suporte nativo a Serverless Functions, Server Actions e Server-Side Rendering (SSR).

---

## 🚀 Método 1: Conexão Git Automática (Recomendado)

1. **Acessar a Vercel**:
   - Vá para [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. **Importar o Repositório**:
   - Clique em **"Add New..."** ➔ **"Project"**.
   - Selecione o repositório `Rpg-ficha` (ou o repositório correspondente).
3. **Configuração de Build & Framework**:
   - **Framework Preset**: `Next.js` (detectado automaticamente).
   - **Root Directory**: `./` (raiz do frontend).
   - **Build Command**: `next build` (ou deixe o padrão).
   - **Output Directory**: `.next` (padrão).
   - **Install Command**: `npm install` (padrão).
4. **Definição das Variáveis de Ambiente**:
   - Em **Environment Variables**, adicione obrigatoriamente:
     * `NEXT_PUBLIC_API_URL`: URL pública do backend Express (ex: `https://seu-backend.onrender.com/api`).
     * `NODE_ENV`: `production`.
5. **Efetuar Deploy**:
   - Clique em **Deploy**. A Vercel executará o build Turbopack e disponibilizará o link público em formato `https://<projeto>.vercel.app`.

---

## 💻 Método 2: Deploy via Vercel CLI (Terminal)

Para deploys diretos ou em esteiras de automação:

```bash
# 1. Instalar a CLI globalmente
npm install -g vercel

# 2. Autenticar sua conta
vercel login

# 3. Vincular o projeto local ao projeto na nuvem
vercel link

# 4. Baixar ou enviar variáveis de ambiente
vercel env pull .env.production.local
# Para adicionar uma variável via CLI:
# vercel env add NEXT_PUBLIC_API_URL production

# 5. Efetuar deploy de produção
vercel --prod
```

---

## ⚙️ Configuração Opcional: `vercel.json`

Se o projeto exigir regras específicas de cabeçalhos ou rewrites, utilize um arquivo `vercel.json` na raiz:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 🔍 Diagnóstico e Resolução de Problemas (Troubleshooting)

### 1. `NEXT_PUBLIC_*` não reflete no cliente
- **Causa**: Variáveis com prefixo `NEXT_PUBLIC_` são embutidas em tempo de compilação (*build time*).
- **Solução**: Se você alterar o valor de `NEXT_PUBLIC_API_URL` nas configurações da Vercel, é **obrigatório disparar um novo deploy** (*Redeploy*) para que o JavaScript do cliente receba o novo endpoint.

### 2. Erro de CORS ao chamar o Backend
- **Causa**: O frontend na Vercel roda sob um domínio (ex: `https://rpg-ficha.vercel.app`) diferente do backend (ex: `https://api-rpg.onrender.com`).
- **Solução**:
  1. No backend, configure a variável `FRONTEND_URL=https://rpg-ficha.vercel.app`.
  2. Garanta que o middleware de CORS do backend permita a origem exata da Vercel (e inclua headers `Authorization`, `Content-Type`).

### 3. Falha de compilação Turbopack / Next.js
- **Causa**: Incompatibilidade de sintaxe, imports não resolvidos ou erros de lint restritivos.
- **Solução**: Execute localmente `npm run build` antes de subir o commit. Se passar localmente com exit code 0, o build na Vercel terá alta garantia de sucesso.

---

## 📋 Checklist Pré-Deploy Vercel
- [ ] Build local testado com `npm run build` sem erros.
- [ ] Bateria de testes aprovada (`node --test src/lib/__tests__/*.test.mjs`).
- [ ] `NEXT_PUBLIC_API_URL` configurado com a URL real do backend de produção.
- [ ] Não há secrets ou senhas gravados em código-fonte ou versionados no Git.
- [ ] Repositório sincronizado com a branch remota (`git push origin main`).
