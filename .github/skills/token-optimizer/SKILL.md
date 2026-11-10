---
name: token-optimizer
description: "Protocolos e estratégias para redução drástica de consumo de tokens no Claude (Anthropic Prompt Caching) e Gemini (Context Window Optimization), prevenindo estouro de contexto, reduzindo latência e cortando custos em até 70%."
user-invocable: true
---

# 🪙 Skill: Token Optimizer (Claude & Gemini)

Esta skill estabelece **protocolos estritos de conservação de tokens e otimização de contexto** para agentes e desenvolvedores trabalhando com **Claude (Anthropic)** e **Gemini (Google DeepMind)**.

---

## 🎯 Por que Economizar Tokens?

| Benefício | Impacto Direto |
|---|---|
| **Menor Custo** | Prompt Caching reduz custo de leitura em até 90% (Claude) e evita tarifação desnecessária por milhão de tokens. |
| **Menor Latência** | Respostas de 2s a 5s em vez de 20s a 40s (menos contexto para processar por turno). |
| **Maior Assertividade** | Menor "efeito agulha no palheiro": modelos erram menos quando a janela de contexto está limpa de logs poluídos. |
| **Prevenção de Truncamento** | Evita estourar o limite de histórico em sessões longas. |

---

## 🧠 1. Regras Específicas: Claude (Anthropic)

O Claude (Opus, Sonnet, Haiku) baseia-se fortemente em **Prompt Caching** (checkpoints de cache a cada 1.024+ tokens):

### ⚡ Estratégias Críticas para o Claude:
1. **Preserve a Estabilidade do Prefixo (Cache Hit)**:
   - O cache da Anthropic é sensível à ordem. Qualquer alteração no topo da conversa invalida o cache de tudo que vem depois (`cache_write` em vez de `cache_read`).
   - Mantenha instruções do sistema, regras fixas e ferramentas inalteradas durante a sessão.
2. **Edição Cirúrgica (`str_replace_editor` / `edit_file`)**:
   - **NUNCA** reescreva arquivos inteiros (`write_file`) para alterar 3 linhas.
   - Sempre substitua apenas o bloco exato modificado com contexto mínimo de linhas ao redor.
3. **Leitura Paginada de Arquivos**:
   - Nunca use `cat` em arquivos com mais de 100 linhas.
   - Use `read_file` especificando sempre `StartLine` e `EndLine`.
   - Antes de ler, use `grep -n` para localizar a linha exata da função ou símbolo.

---

## ♊ 2. Regras Específicas: Gemini (Google DeepMind)

O Gemini (1.5 Pro, 2.0 Flash, 3.8 Flash) possui janelas de contexto gigantes (1M a 2M tokens), o que induz desenvolvedores ao erro de enviar dados excessivos.

### ⚡ Estratégias Críticas para o Gemini:
1. **Otimização de Raciocínio (Thinking Budget)**:
   - Em prompts operacionais simples (renomear variável, rodar migration), reduza o tamanho da resposta pedindo respostas concisas ("Seja conciso e direto").
2. **Delegação a Subagentes Leves (`flash` / `flash_lite`)**:
   - Use subagentes com modelo `flash_lite` ou `flash` para varredura de diretórios, regex ou leituras em lote, preservando o modelo principal (`pro` ou `opus`) despoluído.
3. **Poda Ativa com `/compact`**:
   - Quando o contexto acumular muitas etapas de raciocínio e logs de build, execute ou recomende `/compact` para resumir o histórico sem perder o objetivo.

---

## 🛠️ 3. Protocolos Operacionais para Terminal e Comandos

Ao rodar comandos pelo terminal, adote **sempre** filtros de saída:

### ❌ O que NUNCA fazer (Destruidores de Contexto):
- `npm test` (sem filtro) ➔ Despeja milhares de linhas de logs.
- `git log` (sem limite) ➔ Cospe centenas de commits na janela.
- `cat package-lock.json` ou `node_modules` ➔ Despeja até 100.000 tokens em uma única chamada!
- `ls -laR` ➔ Explode o contexto com árvores profundas.

### ✅ Como executar de forma econômica:
```bash
# 1. Testes focados apenas no arquivo relevante:
npm test -- test/invite_flow.test.js
node --test src/lib/__tests__/invite.test.mjs

# 2. Git com limitador:
git status -s
git log -n 5 --oneline
git diff --stat

# 3. Listagem filtrada:
find src/ -maxdepth 2 -not -path '*/.*'
ls -la src/app/

# 4. Inspeção cirúrgica de logs/arquivos:
head -n 30 arquivo.js
tail -n 30 arquivo.log
grep -n -C 5 "palavraChave" arquivo.js
```

---

## 📝 4. Diretrizes para Respostas e Comunicação

1. **Vá Direto ao Ponto**:
   - Elimine introduções protocolares ("Com certeza! Vou ajudar você com essa tarefa agora mesmo...").
   - Responda com a ação realizada, diffs concisos e próximos passos.
2. **Use Links em vez de Repetir Códigos**:
   - Em vez de colar 150 linhas de um arquivo existente, forneça o link com âncora:
     `[`Character.js`](file:///caminho/Character.js#L30-L50)`.
3. **Diffs em vez de Arquivo Inteiro**:
   - Ao mostrar o que mudou, exiba apenas o bloco alterado (+/- 3 linhas de contexto), nunca o arquivo de 400 linhas.

---

## 📊 5. Checklist Rápido de Conservação de Tokens

Antes de chamar uma ferramenta ou responder, valide:
- [ ] *Esta saída do terminal terá mais de 100 linhas?* ➔ Se sim, use `grep`, `head` ou `tail`.
- [ ] *Preciso ler o arquivo inteiro ou só a função?* ➔ Use `StartLine` e `EndLine`.
- [ ] *Estou reescrevendo um arquivo inteiro?* ➔ Use `edit_file` pontual.
- [ ] *A conversa tem mais de 30 turnos?* ➔ Sugira o uso do comando `/compact`.
