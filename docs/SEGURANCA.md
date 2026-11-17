# 🔐 Segurança — políticas e procedimentos

## Nunca versionar

- `.env`, `.env.local`, chaves, tokens, senhas, URLs com credenciais.
- Verificar antes de commitar: `git status --short` e buscar por padrões:
  `grep -riE "(password|secret|token|api[_-]?key)\s*[:=]" --exclude-dir=node_modules .`
- Este repositório hoje está limpo de segredos reais; `.env.example` usa placeholders.
  Credenciais de desenvolvimento expostas no passado **devem ser trocadas** antes de produção.

## Transporte e armazenamento

- HTTPS obrigatório para frontend, backend e callback OAuth (HSTS no proxy).
- `JWT_SECRET` ≥ 32 bytes aleatórios; segredos em variáveis de ambiente, nunca em código/logs.
- Senhas: bcrypt (cost ≥ 10) via hook Sequelize.
- Tokens de sessão: hash SHA-256 em `sessoes_autenticacao` (revogação server-side real).

## Cabeçalhos e XSS/CSP

- Backend: `helmet` (CSP, X-Content-Type-Options, HSTS) + CORS por allowlist (`CORS_ORIGIN`, sem wildcard).
- Frontend: React (escaping por padrão), sanitização de HTML em campos rich (anotações com imagens livres),
  `Content-Disposition` inline apenas para tipos validados por magic bytes.
- Uploads: bloqueio de SVG/HTML/JS; nome interno aleatório; bytes verificados na escrita e no servidor ao servir.

## Controle de acesso

- Autorização por campanha própria/membro ativo em todos os endpoints de mesa.
- Dados privados filtrados **no servidor**: notas privadas, NPCs ocultos, segredos do mestre, rolagens de outros jogadores.
- Admin: verificação de `perfil === 'mestre'` no backend; nunca confiar em role enviado pelo cliente.

## Dados pessoais (LGPD)

- Dados tratados: username, e-mail, ficha do personagem, conteúdo criado pelo usuário, IP em logs de auditoria.
- Base legal: execução de contrato (uso do serviço) e legítimo interesse (segurança/auditoria).
- Direitos do titular: acesso, correção (via `/perfil`), exclusão (contato com o operador).
  Exclusão: `UPDATE usuarios SET ativo=false` + anonimização de anotações/dados pessoais sob solicitação.
- Retenção: auditoria 12 meses; backups 30 dias (configurável); sessões expiradas expiram naturalmente.
- Logs **não** contêm conteúdo privado das fichas nem senhas/tokens.

## Procedimento de incidente

1. **Contenção**: rotacionar segredos afetados; revogar sessões (`revogada_at = now()`);
   desabilitar conta(s) comprometida(s) (`ativo=false`).
2. **Escopo**: auditar `auditoria` por `usuarioId` e janela temporal; identificar dados expostos.
3. **Comunicação**: usuários afetados em ≤ 72h se dados pessoais expostos (LGPD art. 48); canal: e-mail cadastrado.
4. **Recuperação**: restaurar de backup se necessário (ver BACKUP-RESTORE.md); pós-mortem em ≤ 7 dias.
5. **Revisão**: atualizar este documento e o checklist de deploy no RUNBOOK.

## Revisão de segurança antes do deploy

- [ ] `npm test` verde nos dois repos; `npm run build` OK; `npm audit` sem vulnerabilidades críticas.
- [ ] `JWT_SECRET` novo/forte; `CORS_ORIGIN` exato; `NODE_ENV=production`.
- [ ] Nenhum `.env`/segredo no diff (`git diff` + grep de padrões).
- [ ] Migrations aplicadas em banco de ensaio; backup pré-deploy feito.
- [ ] Headers de segurança verificados (curl -I /health: CSP, HSTS, nosniff).
