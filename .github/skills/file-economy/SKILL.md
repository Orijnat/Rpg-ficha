---
name: file-economy
description: "Protocolo estrito para economia de contexto: localizar com grep/glob antes de ler, ler fatias estreitas de arquivos em vez do arquivo inteiro, nunca tocar em node_modules/lockfiles e delegar varreduras grandes a subagentes — economizando tokens em cada turno."
user-invocable: true
---

# 📉 Skill: File Economy (Economia de Acesso a Arquivos)

Skill companheira do `token-optimizer`. Enquanto ele cobre **prompt caching e filtros de comandos**, este skill cobre o que mais infla o contexto nas tarefas de código: **ler arquivos que não precisam ser lidos, na íntegra, sem objetivo**.

Aplicação: qualquer tarefa que envolva ler, procurar ou analisar arquivos do repositório.

---

## 🧠 Regra de Ouro

> **Antes de abrir qualquer arquivo, responda: "qual informação exata preciso daqui?" Se você não sabe a resposta, é porque ainda não terminou de procurar — e não é hora de ler.**

Toda leitura sem objetivo definido é desperdício; ela custa tokens duas vezes: na leitura e na re-leitura mental.

---

## 🔍 1. Escada de Ferramentas (ordem obrigatória)

Nunca comece por `Read`. Desça/suba pela escada na ordem:

1. **Nome do arquivo?** → `Glob` (`**/*.config.*`, `src/**/__tests__/**`). Retorna caminhos, não conteúdo.
2. **Palavra/padrão/função?** → `Grep` com padrão específico + `include` de extensão. Retorna só linhas casadas com nº da linha e caminho.
3. **Onde a linha está?** → `Read` do arquivo **apenas da faixa necessária**, com `offset`/`limit` em volta da linha localizada (ex.: ±30 linhas).
4. **Arquivo pequeno (<150 linhas) e totalmente relevante?** → aí sim, leia inteiro — ainda com objetivo declarado.

❌ Errado: abrir `package.json` para "ver o que tem"  
✅ Certo: `Grep("\"next\"", include: "package.json")` → só a versão de interesse

---

## ✂️ 2. Leitura Estreita por Padrão

| Situação | Faça | Não faça |
|---|---|---|
| Localizar uma função | `Grep` pelo nome → `Read` ±40 linhas da linha encontrada | Ler o arquivo de 1.500 linhas "para ter contexto" |
| Entender uma API/rota | `Grep` por `export` / `router\.` no arquivo | `cat` no arquivo inteiro |
| Ver o resto do arquivo | Se `Read` trouxe trecho suficiente, **pare** | Ler de novo "por garantia" |
| Arquivo > 300 linhas | `Grep` + faixas focadas | `Read` sem `offset/limit` |
| Encontrar em vários arquivos | 1 `Grep` com `include` (`*.{js,jsx,ts,tsx}`) | 10 `Read`s de arquivos suspeitos |

---

## 🚫 3. Zonas Proibidas (nunca ler)

```
node_modules/**          .next/**            .git/**
**/package-lock.json     **/*.min.js         dist/**  build/**
**/*.png|jpg|ico|woff    **/*.log            .aider.*  *.tsbuildinfo
```

- Para saber versões/dependências: `Grep` em `package.json` (nunca no lock).
- Para checar o build: rode o build e leia **só o erro** (ex.: `| grep -E "error|failed" | head -20`), não a saída inteira.
- Binários e mídia: nunca — não agregam informação ao contexto de código.

---

## 📝 4. Saída de Terminal Enxuta

- Sempre filtre e limite: `| head -30`, `| tail -20`, `| grep -E "..." | head`, `wc -l`.
- `git log -n 5 --oneline`, `git diff --stat`, `git status -s` — nunca log completo/diff inteiro por padrão.
- `find`/`ls -R` proibidos; use `Glob` (respeita gitignore e não despeja conteúdo).
- Testes: rode **só o arquivo relevante** (`node --test caminho/do/arquivo.test.mjs`) ou grep no resultado: `npm test 2>&1 | grep -E "pass|fail"`.

---

## 🧩 5. Varreduras Grandes → Subagentes

Quando a tarefa exige conhecer muitos arquivos para responder "o que tem na base?":

- Use o agente **explore** (ou `general`) com instrução para **retornar um resumo** (lista de arquivos + 1 frase cada + pontos de atenção), não conteúdo cru.
- O subagente paga o custo de ler; seu contexto principal recebe só a síntese.
- Para diagnóstico pontual ("onde está o vazamento de dados?"), prefira 2–3 `Grep` cirúrgicos a um `Read` geral.

---

## 🔁 6. Não Reler, Não Reescrever

- **Cache mental da sessão**: tudo que você já leu está no contexto. Reler o mesmo arquivo sem motivo é custo puro.
- **Diff como releitura**: se algo mudou desde a última leitura, `git diff -- arquivo` mostra a mudança — não releia o arquivo todo.
- **Edição cirúrgica**: nunca `Write`/reescrever um arquivo para mudar 3 linhas. Use substituição exata de bloco com contexto mínimo.
- Após `Edit`, não releitura obrigatória do arquivo: o resultado da ferramenta confirma.

---

## 💰 7. Orçamento de Leitura (por tarefa)

Metas pragmáticas:

| Tarefa | Leituras diretas esperadas |
|---|---|
| Correção de bug localizado | 2–5 arquivos, ≤80 linhas cada |
| Pergunta de entendimento | 1–3 arquivos ou só `Grep` |
| Refatoração ampla | delegue reconhecimento a subagente; leia só os arquivos a editar |
| Varredura total do repo | **não faça na janela principal** — sempre via subagente |

Se ultrapassar 8 arquivos lidos, pare e declare por que (o usuário merece saber onde o contexto está sendo gasto).

---

## ✅ Checklist Antes de Cada `Read`

1. Eu já sei qual pergunta esse arquivo responde?
2. `Grep`/`Glob` consegue responder metade dela sem abrir nada?
3. Qual faixa de linhas eu realmente preciso?
4. Já li esse arquivo antes nesta sessão? Se sim, confio no que lembro ou algo mudou?
5. O arquivo está em zona proibida?
6. Um subagente economizaria meu contexto se eu delegasse?

Se qualquer resposta indicar economia, aplique antes de ler.
