---
name: github-structure-adapter
description: "Analisa a estrutura de um projeto no GitHub e adapta sua arquitetura, organização de pastas e padrões ao projeto atual. Use quando o usuário pedir para clonar, replicar, migrar ou aproveitar a estrutura de outro repositório, preservando compatibilidade, licença, segurança e convenções locais."
argument-hint: "Informe a URL do repositório de referência e, opcionalmente, o módulo ou fluxo a adaptar."
user-invocable: true
---

# Adaptador de Estrutura de Projeto GitHub

Use esta skill para transformar um repositório de referência em um plano e uma
implementação compatível com o workspace atual. "Clonar a estrutura" significa
reproduzir a arquitetura e os padrões necessários, não copiar cegamente código,
segredos, histórico Git, dependências ou identidade visual.

## Entradas necessárias

- URL do repositório GitHub de referência, branch/tag/commit se houver.
- Objetivo da adaptação: estrutura completa, módulo específico ou fluxo.
- Restrições conhecidas: stack, compatibilidade, licença e arquivos que não
  podem ser alterados.

Se a URL ou o escopo não estiverem claros, peça esclarecimento antes de editar.
Não faça alterações permanentes apenas porque um repositório foi mencionado.

## Procedimento

1. **Inspecionar o projeto atual**
   - Ler `package.json`, arquivos de configuração, documentação, convenções,
     scripts de teste, estrutura de `src/` e customizações em `.github/`.
   - Identificar framework, runtime, gerenciador de pacotes, entrypoints,
     camadas, aliases, persistência, autenticação e comandos de validação.
   - Preservar alterações locais não relacionadas; nunca resetar ou sobrescrever
     arquivos sem integrar o conteúdo existente.

2. **Obter o repositório de referência com segurança**
   - Preferir ferramentas GitHub disponíveis para ler metadados e arquivos.
   - Quando for necessário baixar, usar clone raso em diretório temporário fora
     do workspace, fixando branch/tag/commit quando informado.
   - Não executar scripts do repositório de referência antes de revisar seu
     conteúdo. Nunca copiar `.git`, `.env`, chaves, certificados, dumps,
     artefatos de build, `node_modules` ou credenciais.
   - Verificar a licença e sinalizar incompatibilidades antes de reutilizar
     código. Não remover avisos de copyright ou atribuição exigidos.

3. **Mapear a arquitetura**
   - Produzir um inventário curto de diretórios, entrypoints, módulos,
     contratos, dependências e comandos relevantes.
   - Separar o que é estrutural (pastas, fronteiras, convenções) do que é
     específico do domínio (nomes, regras, telas, banco e integrações).
   - Comparar cada área com o projeto atual e classificar como:
     `reutilizar`, `adaptar`, `substituir`, `ignorar` ou `bloqueado`.
   - Detectar conflitos de versões, aliases, nomes, rotas, modelos,
     autenticação, autorização, acessibilidade e estilo.

4. **Definir a matriz de adaptação**
   - Para cada item aprovado, registrar origem, destino, transformação
     necessária, dependências, risco, licença e critério de aceitação.
   - Priorizar contratos e fundações antes de componentes consumidores.
   - Preferir uma implementação nativa às convenções do projeto atual quando a
     cópia literal causar acoplamento, regressão ou conflito de stack.
   - Se a mudança for ampla ou destrutiva, apresentar a matriz e solicitar
     confirmação antes da execução.

5. **Implementar incrementalmente**
   - Criar primeiro pastas, tipos, interfaces e adaptadores mínimos; depois
     migrar comportamento por fatias verificáveis.
   - Reutilizar helpers e padrões já existentes no workspace.
   - Adaptar nomenclatura, imports, configuração, validação, mensagens,
     autenticação e autorização ao projeto atual.
   - Manter dados privados filtrados no servidor e não transportar segredos
     para o cliente.
   - Atualizar documentação diretamente relacionada e exemplos sem valores
     sensíveis.

6. **Validar a equivalência útil**
   - Executar o menor teste que cubra cada fatia alterada.
   - Rodar lint, type-check, build e testes existentes quando aplicável.
   - Verificar rotas, imports, aliases, migrações, permissões, estados de erro,
     responsividade e acessibilidade.
   - Comparar o comportamento prometido com critérios de aceitação; não tratar
     "a estrutura parece igual" como validação suficiente.
   - Reportar claramente adaptações não realizadas, incompatibilidades,
     limitações de licença e qualquer validação indisponível.

## Regras de segurança e escopo

- Não copiar segredos, dados pessoais, credenciais, tokens ou arquivos
  ignorados pelo Git.
- Não instalar dependências, executar comandos de instalação ou alterar banco
  sem verificar antes a necessidade e o impacto.
- Não substituir o projeto atual inteiro por um clone nem apagar arquivos para
  "igualar" a referência.
- Não copiar código de licença incompatível ou conteúdo proprietário sem
  autorização e atribuição adequada.
- Se a referência estiver indisponível, privada ou ambígua, pare na análise e
  informe o bloqueio em vez de inventar sua estrutura.

## Entrega esperada

Ao concluir, resumir:

1. Repositório e revisão analisados.
2. Estruturas aproveitadas e como foram adaptadas.
3. Arquivos criados ou alterados.
4. Decisões de compatibilidade e licença.
5. Comandos de validação e resultados.
6. Pendências, riscos e próximos passos.
