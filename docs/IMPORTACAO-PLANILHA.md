# 📥 Importação da planilha técnica (Google Sheets)

A planilha técnica da mesa contém atributos, perícias, HP/PE/BP/insanidade, CA,
iniciativa, dados de vida, dinheiro e inventário por personagem.

## Caminho imediato (sem credenciais Google): CSV

1. Backend rodando (`npm run dev`).
2. Exporte o que precisar:
   - Ficha: `GET /api/export/characters/:id.csv`
   - Bestiário da mesa: `GET /api/export/npcs.csv?campanhaId=<id>` (mestre dono)
   - Resumo da campanha: `GET /api/export/campaign/:id.csv` (mestre dono)
   Todos com autenticação (header `Authorization: Bearer …`) e conteúdo apenas
   da sua própria mesa.
3. No Google Sheets: **Arquivo → Importar → Upload** → selecionar o `.csv` →
   "Substituir planilha atual" ou "Inserir nova aba". O arquivo já traz BOM
   (acentos corretos) e separador `;` (pt-BR).

## Mapeamento de abas e fórmulas (referência para automação futura)

| Aba / Seção | Campos da aplicação | Fórmula/Regra |
|---|---|---|
| Atributos | FOR…INT (`personagens`) | valor d20; modificador derivado (não armazenado) |
| Perícias | nome canônico, attr, treinada, bônus | total = `Mod(attr) + prof(nível)` ou bônus explícito |
| PV | `pontos_vida`, `pontos_vida_maximo` | máx = HP base da classe + Mod(CON) × nível |
| PE | `dadosExtras.peMax/peCurrent` | máx = Nível + Mod(ESP) (mín. 0) |
| BP (Bravura) | `dadosExtras.bpMax/bpCurrent` | máx = Nível + Mod(CAR) (mín. 0) |
| Insanidade | `dadosExtras.insanityMax/insanity` | seção 7 do manual oficial |
| CA | `dadosExtras.armorClass` (bônus extra) | CA = 10 + Mod(DES) + extra |
| Iniciativa | `dadosExtras.initiative` | iniciativa = Mod(DES) + bônus |
| Dinheiro | `latina/ouro/prata/cobre` | plano (1 latina = 10 ouro etc. — ver manual seção 14) |
| XP/Nível | `experiencia`, `nivel` | faixas de XP da seção 12 do manual; nível = faixa(xp) |

Implementado em `Rpg-backend/src/services/csvExport.js` (funções puras
`characterToSheetRows`, `npcToSheetRows`, `campaignToSheetRows`) com testes em
`test/csv_export.test.js`.

## Importação reversa (pendente de credenciais)

Importar a planilha de volta para a aplicação exige o cliente Google completo
(escopos `drive.file` + `spreadsheets`) — ver
[`GOOGLE-INTEGRATION.md`](GOOGLE-INTEGRATION.md), seção "Roteiro de implementação".
Com as credenciais do operador, o trabalho restante é o endpoint
`POST /api/google/sheets/pull/:spreadsheetId` (mapeamento já coberto pelo CSV).
