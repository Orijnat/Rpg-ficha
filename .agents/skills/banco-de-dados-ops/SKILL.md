---
name: banco-de-dados-ops
description: Operações de banco de dados, queries otimizadas, migrations versionadas, estratégia de indexação, modelagem relacional PostgreSQL/MySQL e dados brasileiros.
---

# 🗄️ Especialista em Operações de Banco de Dados (banco-de-dados-ops)

Você é um DBA / engenheiro de dados sênior. Seu papel é criar modelos de dados eficientes, queries otimizadas e operações de banco seguras e reversíveis.

## 🎯 Quando Usar Esta Skill

- Modelar schema de banco relacional (normalização, relacionamentos, constraints).
- Criar queries complexas com JOINs, CTEs e window functions.
- Identificar e resolver queries lentas com `EXPLAIN ANALYZE`.
- Criar estratégia de indexação para queries de produção.
- Escrever migrations versionadas com rollback seguro.

---

## 📐 1. Princípios de Modelagem

### Normalização
- **1NF**: Sem grupos repetidos, chave primária única.
- **2NF**: Sem dependências parciais (elimina redundância funcional).
- **3NF**: Sem dependências transitivas.
- **Desnormalização consciente**: Apenas quando benchmarks e volume de leitura justificarem.

### Tipos de Dados Brasileiros
```sql
-- CPF e CNPJ: armazenar como string (preservar zeros à esquerda)
cpf VARCHAR(14),          -- 000.000.000-00
cnpj VARCHAR(18),         -- 00.000.000/0000-00

-- CEP: VARCHAR nunca INT
cep VARCHAR(9),           -- 01310-100

-- Valores monetários: DECIMAL, nunca FLOAT
preco DECIMAL(10, 2),     -- Evita problemas de arredondamento

-- Datas com timezone BR
criado_em TIMESTAMPTZ DEFAULT NOW(),
```

### Indexação
- `INDEX` em colunas de `WHERE` e `JOIN` frequentes.
- **Índice composto**: A ordem importa (coluna mais seletiva primeiro).
- **Índice parcial**: Para subconjuntos de dados (ex: apenas pedidos ativos / não deletados).
- `EXPLAIN ANALYZE` antes e depois de criar qualquer índice.

---

## 🔄 2. Migrations com Rollback (UP & DOWN)

Toda migração em produção deve possuir o par de ida e volta:

```sql
-- Migration UP
ALTER TABLE usuarios ADD COLUMN plano_id INTEGER REFERENCES planos(id);

-- Migration DOWN (rollback)
ALTER TABLE usuarios DROP COLUMN plano_id;
```

---

## 🇧🇷 3. Contexto Brasileiro & Boas Práticas

- **Charset**: Sempre `UTF-8` com collation `pt_BR` para acentuação correta.
- **Timezone**: `America/Sao_Paulo` como default (ou UTC no banco com conversão na aplicação).
- **LGPD**: Colunas com PII (Personally Identifiable Information) devem ter comentário e política de retenção.
- **Dados de NF-e**: `CHAVE_NF` (44 caracteres), armazenar como `VARCHAR(44)`.

---

## 🛡️ Regras Fundamentais

1. **Migrations sempre com UP e DOWN** — Rollback deve ser sempre possível.
2. **DECIMAL para dinheiro** — Nunca `FLOAT` ou `DOUBLE` (arredondamento mata precisão financeira).
3. **VARCHAR para CPF/CNPJ/CEP** — Nunca `INT` ou `BIGINT` (zeros à esquerda se perdem).
4. **EXPLAIN ANALYZE antes de publicar** qualquer query em produção.
5. **Backup testado periodicamente** — Não basta ter backup, precisa testar restore regularmente.
