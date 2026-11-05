---
name: supabase-database-config
description: "Guia completo e procedimentos para provisionar, conectar e migrar bancos de dados PostgreSQL no Supabase para aplicações Node.js/Sequelize, cobrindo SSL, Connection Pooling, migrations versionadas e troubleshooting."
user-invocable: true
---

# Skill: Supabase Database Configuration

Esta skill orienta agentes e desenvolvedores a provisionar, configurar e integrar bancos de dados **PostgreSQL na nuvem via Supabase**, com suporte nativo a aplicações **Node.js, Express e Sequelize ORM**.

---

## 🎯 Por que usar Supabase?
- Instância PostgreSQL corporativa dedicada e gratuita.
- Suporte a Connection Pooling (Supavisor / PgBouncer).
- SSL obrigatório e criptografia em trânsito.
- Interface visual para visualizar tabelas, executar SQL e monitorar métricas.

---

## 🛠️ Passo 1: Provisionar o Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie/acesse sua conta.
2. Clique em **"New Project"**.
3. Preencha as configurações do projeto:
   - **Name**: `rpg-database` (ou de sua preferência).
   - **Database Password**: Gere uma senha forte e guarde-a com segurança (ela será usada na `DATABASE_URL`).
   - **Region**: Selecione a mais próxima da sua aplicação (ex: `South America (São Paulo) - sa-east-1` para menor latência).
   - **Pricing Plan**: `Free Plan`.
4. Aguarde a finalização do provisionamento (cerca de 1 a 2 minutos).

---

## 🔌 Passo 2: Obter a Connection String Correta

No painel do projeto Supabase:
1. Vá em **Project Settings** (ícone de engrenagem) ➔ **Database**.
2. Role até a seção **Connection Parameters** ou **Connection String**.
3. Selecione a aba **URI** e o modo de conexão adequado:

### Modos de Conexão:
| Modo | Porta | Quando Usar |
|---|---|---|
| **Session Pooler** (Supavisor) | `5432` | Ideal para **migrations Sequelize**, scripts de seed e conexões persistentes |
| **Transaction Pooler** | `6543` | Ideal para **APIs serverless** com alto volume de conexões curtas |
| **Direct Connection** | `5432` | Conexão direta sem pooler (requer rede com suporte a IPv6 ou add-on IPv4) |

> [!TIP]
> **Recomendação para Node.js / Express com Sequelize**: Use a Connection String do **Session Pooler** (porta `5432`), substituindo `[YOUR-PASSWORD]` pela senha definida.
>
> Exemplo de URL:
> `postgres://postgres.seuprojeto:suasenha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

---

## 🔒 Passo 3: Configuração Obrigatória de SSL no Sequelize

O Supabase exige conexões criptografadas por TLS/SSL. No arquivo de conexão Sequelize do backend (`src/config/database.js`):

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";
const isSupabase = dbUrl && (dbUrl.includes("supabase.co") || dbUrl.includes("supabase.com") || dbUrl.includes("pooler.supabase.com"));

export const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: isProduction ? false : console.log,
  dialectOptions: {
    ssl: (process.env.DB_SSL === "true" || isSupabase)
      ? {
          require: true,
          rejectUnauthorized: false, // Necessário para certificados autoassinados em instâncias gerenciadas
        }
      : false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
```

---

## 🗄️ Passo 4: Executar Migrations e Seeds Remotamente

Para aplicar o schema no banco do Supabase sem precisar rodar migrations em runtime no servidor de produção:

1. No terminal do backend local (`Rpg-backend`):
   ```bash
   # Defina a variável de conexão temporariamente ou no .env
   DATABASE_URL="postgres://postgres.xyz:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" \
   DB_SSL="true" \
   npx sequelize-cli db:migrate
   ```

2. Para rodar seeds com dados iniciais (opcional):
   ```bash
   DATABASE_URL="postgres://postgres.xyz:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" \
   DB_SSL="true" \
   SEED_PASSWORD="sua-senha-mestre" \
   npm run db:seed
   ```

3. **Verificação Visual**:
   - Acesse o painel do Supabase ➔ **Table Editor**.
   - As tabelas `users`, `characters`, `campaigns`, `campaign_members`, `npcs`, `encounters`, `audit_logs`, etc., estarão visíveis e prontas.

---

## 🚨 Troubleshooting de Conexão no Supabase

### 1. Erro: `self-signed certificate in certificate chain`
- **Causa**: O driver `pg` padrão rejeita a autoridade certificadora intermediária do pooler da nuvem.
- **Solução**: Configure `rejectUnauthorized: false` em `dialectOptions.ssl`.

### 2. Erro: `prepared statement "..." already exists`
- **Causa**: Ocorre quando se utiliza o **Transaction Pooler** (porta `6543`) com ORMs que usam prepared statements nomeados.
- **Solução**: Alterne para a porta `5432` (**Session Pooler**) na `DATABASE_URL`.

### 3. Erro: `Tenant or user not found`
- **Causa**: O usuário no Supabase Pooler segue a sintaxe `postgres.[PROJECT_REF]` e não apenas `postgres`.
- **Solução**: Copie a string exatamente como fornecida na aba **Database ➔ Connection String** do painel do Supabase.

---

## 📋 Checklist de Validação Supabase
- [ ] Projeto criado na região mais próxima (ex: `sa-east-1`).
- [ ] Senha do banco salva em cofre seguro de senhas.
- [ ] String de conexão do Session Pooler (porta 5432) copiada.
- [ ] `ssl.rejectUnauthorized: false` configurado no backend.
- [ ] Migrations aplicadas com sucesso (`sequelize-cli db:migrate`).
- [ ] Tabelas conferidas visualmente no **Table Editor** do Supabase.
