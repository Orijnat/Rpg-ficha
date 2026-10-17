# Análise geral e melhorias futuras — Crônicas do Destino

## Resumo da análise

O projeto já possui uma base funcional para autenticação, ficha do jogador,
diário, inventário, banco, contratos, montaria, rolador de dados e uma Sala do
Mestre inicial. A arquitetura visual e os agentes especializados também estão
estabelecidos.

As principais lacunas identificadas são:

- parte da Área do Mestre ainda depende de um objeto de campanha amplo e
  fallback em `localStorage`;
- algumas telas administrativas não utilizavam o cliente autenticado
  compartilhado;
- o cache local da ficha precisa ser isolado por personagem para evitar mistura
  de dados em contas com múltiplos personagens;
- a estrutura relacional do banco é mais completa que os endpoints atualmente
  expostos;
- o rolador precisava de um ciclo visual explícito e de uma apresentação d20
  mais consistente;
- testes de autorização, integração e acessibilidade ainda precisam crescer.

## Melhorias implementadas nesta fase

### Rolagem de dados

- Ciclo explícito de rolagem com duração visual controlada.
- Animação d20 facetada com rotação nos eixos X/Y, queda e quique.
- Suporte visual para vantagem, desvantagem e múltiplos dados.
- Resultado visual sempre derivado do retorno real do motor.
- Suporte a `prefers-reduced-motion` e descrição acessível.
- Correção para exibir a aba de resultado mesmo quando o modal estava no
  histórico.

### Área do Mestre

- Listagem e edição de personagens encaminhadas para o cliente autenticado da
  API, em vez de chamadas relativas sem contrato compartilhado.
- Mensagens de erro adicionadas às telas administrativas.
- Edição de rota dinâmica preparada para parâmetros assíncronos do Next.js.
- Exclusão e atualização de personagens passam a usar token e tratamento de
  falhas padronizados.

### Segurança e consistência

- Operações administrativas devem usar funções centralizadas de API.
- A autorização visual da Área do Mestre continua sendo apenas UX; a decisão
  final precisa permanecer no backend.
- A auditoria de autenticação, autorização e privacidade está registrada como
  etapa própria e deve ser concluída antes de produção.

## Roadmap recomendado

### Prioridade crítica — antes de produção

1. Centralizar todas as rotas de personagens, campanha, banco e uploads em um
   cliente autenticado.
2. Garantir que cada endpoint verifique perfil, propriedade e associação à
   campanha no servidor.
3. Trocar `localStorage` para dados sensíveis por cookies HTTP-only ou uma
   estratégia de sessão equivalente.
4. Isolar o cache local pela identificação do personagem e remover dados antigos
   somente após migração explícita.
5. Substituir `sequelize.sync({ alter: true })` por migrations versionadas.
6. Adicionar rate limiting, expiração de sessão, rotação de refresh token e
   auditoria de ações administrativas.
7. Validar uploads por MIME real, tamanho, extensão, quantidade e autorização.

### Prioridade alta — experiência do jogador

1. Criar seletor de personagem com nome, avatar, campanha e estado de
   sincronização.
2. Exibir indicador de salvamento: salvo, salvando, offline e erro de
   sincronização.
3. Adicionar busca e filtros no inventário, contratos e diário.
4. Permitir categorias, tags e ordenação nas entradas do diário.
5. Melhorar validação de atributos, HP, quantidade de itens e moedas.
6. Criar tela de perfil e preferências com tema, acessibilidade e sessão ativa.
7. Adicionar exportação/importação com versão de schema e validação de
   integridade.

### Prioridade alta — experiência do mestre

1. Separar campanha, sessão, NPC, inimigo, encontro e iniciativa em recursos
   próprios.
2. Criar gerenciamento de membros e convites por campanha.
3. Implementar visão resumida e visão detalhada das fichas dos jogadores.
4. Adicionar condições, efeitos, recursos e histórico de alterações durante
   encontros.
5. Criar notas públicas e privadas com filtragem server-side.
6. Criar mapas com marcadores, áreas ocultas e permissões de revelação.
7. Criar preparação de sessão com cenas, objetivos, inimigos e recompensas.

### Prioridade média — regras e dados

1. Expandir testes determinísticos do motor d20 e das fórmulas.
2. Permitir rolagens compostas com `kh`, `kl`, múltiplos modificadores e
   histórico detalhado.
3. Persistir histórico de rolagens por sessão/campanha quando permitido.
4. Adicionar configuração de regras por campanha.
5. Implementar condições, dano, cura, iniciativa e recursos em funções puras
   compartilhadas entre jogador e mestre.

### Prioridade média — qualidade

1. Adicionar testes de integração dos fluxos login → personagem → sincronização.
2. Criar testes de autorização para jogador, mestre, membro e não membro.
3. Criar testes de acessibilidade para navegação, modal de dados, formulários e
   upload de imagens.
4. Executar testes de viewport mobile e desktop.
5. Adicionar monitoramento de erros sem registrar dados sensíveis.
6. Criar pipeline de lint, typecheck, testes, build e migrações.

## Critérios de conclusão do ecossistema

- Jogadores não acessam dados privados ou campanhas sem associação.
- Mestres gerenciam apenas suas próprias campanhas.
- Toda tela possui estados de carregamento, erro e vazio.
- Banco, modelos, endpoints e DTOs possuem os mesmos nomes e regras.
- O frontend não contém autorização como única barreira.
- Migrations podem ser executadas com segurança em instalação nova e existente.
- Rolagens são reproduzíveis em testes e visualmente acessíveis.
- Build, lint, testes e revisão de segurança passam antes do deploy.
