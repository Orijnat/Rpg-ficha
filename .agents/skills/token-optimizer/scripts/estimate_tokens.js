#!/usr/bin/env node

/**
 * Utilitário para estimativa de tokens e auditoria de arquivos pesados
 * Uso:
 *   node estimate_tokens.js <caminho-do-arquivo-ou-pasta>
 */

import fs from "node:fs/promises";
import path from "node:path";

const target = process.argv[2] || ".";

function estimateTokens(charCount) {
  // Média empírica de tokenização em código e português: ~3.8 caracteres por token
  return Math.ceil(charCount / 3.8);
}

async function auditPath(itemPath) {
  try {
    const stat = await fs.stat(itemPath);

    if (stat.isFile()) {
      const content = await fs.readFile(itemPath, "utf8");
      const tokens = estimateTokens(content.length);
      const lines = content.split("\n").length;

      console.log(`\n📄 Arquivo: ${itemPath}`);
      console.log(`   Linhas: ${lines} | Caracteres: ${content.length}`);
      console.log(`   Tokens estimados: ~${tokens.toLocaleString("pt-BR")}`);

      if (tokens > 5000) {
        console.warn(`   ⚠️ ALERTA: Arquivo pesado (> 5.000 tokens)! Evite ler sem StartLine/EndLine.`);
      } else {
        console.log(`   ✅ Seguro para leitura com escopo.`);
      }
      return;
    }

    if (stat.isDirectory()) {
      const entries = await fs.readdir(itemPath, { withFileTypes: true });
      const results = [];

      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") {
          continue;
        }

        const fullPath = path.join(itemPath, entry.name);
        try {
          const entryStat = await fs.stat(fullPath);
          if (entryStat.isFile()) {
            const content = await fs.readFile(fullPath, "utf8");
            results.push({
              file: entry.name,
              lines: content.split("\n").length,
              tokens: estimateTokens(content.length),
            });
          }
        } catch {}
      }

      results.sort((a, b) => b.tokens - a.tokens);

      console.log(`\n📁 Auditoria de Tokens em: ${itemPath}`);
      console.log("------------------------------------------------------------");
      for (const item of results.slice(0, 15)) {
        const warn = item.tokens > 5000 ? "⚠️ ALTO" : "✅ OK";
        console.log(` ${warn} | ~${item.tokens.toString().padStart(6)} tokens | ${item.lines.toString().padStart(4)} linhas | ${item.file}`);
      }
      console.log("------------------------------------------------------------");
    }
  } catch (err) {
    console.error("Erro na auditoria:", err.message);
  }
}

auditPath(target);
