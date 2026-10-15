#!/usr/bin/env node

/**
 * Script de Hook e Gerenciamento de Sessão (.agents/scripts/sync_session_memory.js)
 * 
 * Função:
 * 1. Captura o contexto do hook (stdin) enviado pelo Antigravity/Gemini.
 * 2. Extrai o último prompt enviado pelo usuário no transcript da conversa.
 * 3. Salva temporariamente o estado da sessão em:
 *    - .agents/memory/last_prompt.json
 *    - .agents/memory/active_session.md
 * 4. Injeta instrução obrigatória no modelo para SEMPRE consultar memórias e utilizar
 *    os subagentes adequados para a tarefa.
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const MEMORY_DIR = path.resolve(ROOT_DIR, ".agents/memory");
const LAST_PROMPT_FILE = path.resolve(MEMORY_DIR, "last_prompt.json");
const ACTIVE_SESSION_FILE = path.resolve(MEMORY_DIR, "active_session.md");

// Garante que o diretório de memória exista
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");

    const timeout = setTimeout(() => {
      resolve(data);
    }, 1500);

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      clearTimeout(timeout);
      resolve(data);
    });

    process.stdin.on("error", () => {
      clearTimeout(timeout);
      resolve(data);
    });
  });
}

function extractUserRequest(content) {
  if (!content) return "";
  const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return content.trim();
}

function findLastUserPrompt(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(transcriptPath, "utf8");
    const lines = fileContent.split("\n").filter((l) => l.trim().length > 0);
    
    // Itera de trás para frente para achar o último USER_INPUT
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const step = JSON.parse(lines[i]);
        if (step.type === "USER_INPUT" && step.content) {
          return {
            stepIndex: step.step_index ?? i,
            createdAt: step.created_at || new Date().toISOString(),
            rawContent: step.content,
            prompt: extractUserRequest(step.content),
          };
        }
      } catch {
        // Ignora linha com JSON malformado
      }
    }
  } catch (err) {
    // Falha silenciosa na leitura do transcript
  }

  return null;
}

async function main() {
  const stdinRaw = await readStdin();
  let hookContext = {};

  if (stdinRaw && stdinRaw.trim()) {
    try {
      hookContext = JSON.parse(stdinRaw);
    } catch {
      // Ignora erro de parse
    }
  }

  const transcriptPath = hookContext.transcriptPath;
  const conversationId = hookContext.conversationId || "sessao-atual";
  const userPromptInfo = findLastUserPrompt(transcriptPath);

  const timestamp = new Date().toISOString();

  // 1. Atualizar last_prompt.json
  const promptData = {
    conversationId,
    timestamp,
    prompt: userPromptInfo ? userPromptInfo.prompt : "Nenhum prompt capturado ainda",
    rawContent: userPromptInfo ? userPromptInfo.rawContent : "",
    stepIndex: userPromptInfo ? userPromptInfo.stepIndex : 0,
    status: "EM_ANDAMENTO",
  };

  fs.writeFileSync(LAST_PROMPT_FILE, JSON.stringify(promptData, null, 2), "utf8");

  // 2. Atualizar active_session.md para continuidade entre sessões
  const sessionMarkdown = `# 📌 Memória Temporária de Sessão Ativa

> **Aviso ao Agente**: Este arquivo registra o prompt e o contexto da sessão ativa para que qualquer conversa ou sessão posterior possa continuar exatamente de onde o usuário parou.

---

## 🕒 Metadados da Sessão
- **ID da Conversa**: \`${conversationId}\`
- **Última Atualização**: ${timestamp}
- **Status do Trabalho**: 🟡 **EM ANDAMENTO**

---

## 💬 Último Prompt Recebido
\`\`\`text
${promptData.prompt}
\`\`\`

---

## 🎯 Instruções de Continuidade para a Próxima Sessão
1. **Recuperação de Contexto**: Ler este arquivo (\`.agents/memory/active_session.md\`) no início da interação para verificar solicitações recentes e pendências.
2. **Uso Obrigatório de Agentes**:
   - Para alterações visuais e front-end: utilizar o subagente **\`frontend-artisan\`** e a skill **\`sheet-component-builder\`**.
   - Para cálculos de perícias e atributos d20: utilizar o subagente **\`rpg-rules-engine\`** e a skill **\`rpg-sheet-calculator\`**.
   - Para mecânicas de rolagens de dados: utilizar o subagente **\`dice-mechanic\`** e a skill **\`dice-roller\`**.
   - Para banco de dados e APIs: utilizar o subagente **\`backend-database\`** e a skill **\`sequelize-model-generator\`**.
   - Para testes e validações: utilizar o subagente **\`qa-tester\`**.
3. **Registro de Alterações**: Registrar o resultado das ações na memória de cada agente e neste arquivo antes de concluir a sessão.

---

## 📋 Checklist de Continuidade
- [x] Prompt atual capturado e persistido temporariamente.
- [ ] Orquestração e execução com subagentes especializados.
- [ ] Atualização dos arquivos de memória correspondentes.
`;

  fs.writeFileSync(ACTIVE_SESSION_FILE, sessionMarkdown, "utf8");

  // 3. Responder ao ciclo de vida injetando lembrete de uso obrigatório de agentes
  const response = {
    injectSteps: [
      {
        ephemeralMessage: `[SISTEMA DE MEMÓRIA & AGENTES ATIVO]
O prompt da requisição foi salvo em .agents/memory/active_session.md para garantir continuidade entre sessões.
DIRETRIZ OBRIGATÓRIA:
1. Sempre consulte as memórias em .agents/memory/ (active_session.md, orchestrator.md, etc.).
2. Sempre utilize os agentes e subagentes especializados (frontend-artisan, rpg-rules-engine, dice-mechanic, backend-database, qa-tester) para executar e validar as tarefas.`
      }
    ]
  };

  process.stdout.write(JSON.stringify(response));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}));
});
