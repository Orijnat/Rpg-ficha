# Memória — seguranca-identidade-rpg

## Auditoria prática — 2026-10-16

### Escopo e ameaça
- Frontend `/home/cledi/rp/Rpg-ficha` e backend `/home/cledi/rp/Rpg-backend`.
- Ameaças consideradas: usuário jogador tentando ler/alterar personagem de outro jogador, jogador acessando dados de mestre, mestre usando IDs fora de sua campanha, vazamento de senha/token e sessão inválida.
- A autorização efetiva permanece no backend; proteções no frontend são apenas UX.

### Matriz observada
| Recurso | Anônimo | Jogador | Mestre |
|---|---|---|---|
| `/api/auth/login`, `/register` | permitido | permitido | permitido |
| `/api/auth/me` | negado | próprio usuário/personagens | próprio usuário/personagens |
| `/api/characters` | negado | próprios personagens | atualmente lista todos |
| `/api/characters/:id` e mutações | negado | apenas personagem próprio | qualquer personagem |
| `/api/campanha` | negado | negado | dados do próprio usuário mestre |

### Findings
- **Alto — corrigido:** payload de personagem podia carregar `userId`/`campanhaId` e, em criação/sincronização, permitir associação indevida. O backend agora remove campos de identidade/dono/segredo e sempre vincula nova ficha ao usuário autenticado.
- **Alto — corrigido:** criação retornava o objeto Sequelize sem o filtro de privacidade usado nas demais respostas; agora usa `publicCharacter`, que não expõe `bankPassword`.
- **Alto — corrigido:** havia segredo JWT padrão hardcoded em middleware e controller. O fallback foi removido; `JWT_SECRET` deve ser fornecido por ambiente. Sem ele, autenticação não é aceita (e emissão de token falha).
- **Médio — corrigido:** chamadas frontend de personagem/cofre/campanha não enviavam consistentemente o Bearer token; o cliente agora centraliza os headers autenticados.
- **Médio — corrigido:** usuários marcados como inativos agora não autenticam.
- **Médio — pendente:** mestre ainda tem acesso amplo a personagens porque não existe no modelo/API uma relação verificável de campanha e gestão. Não foi inventada uma regra insegura; é necessária modelagem de associação mestre-campanha antes de restringir por campanha.
- **Médio — pendente:** token fica em `localStorage`, vulnerável a XSS. Migrar para cookie `HttpOnly`, `Secure`, `SameSite` exige mudança coordenada de sessão/CSRF.
- **Médio — pendente:** `bankPassword` continua armazenada como texto comparável no banco e possui default conhecido no modelo. Deve ser migrada para hash e o default removido em uma alteração de dados planejada.
- **Baixo — pendente:** não há rota de logout/revogação de JWT; expiração atual é de 7 dias.
- **Baixo — pendente:** não foram encontradas rotas de upload no backend para validar tamanho, MIME e origem; qualquer futura implementação deve aplicar essas validações no servidor.

### Arquivos alterados nesta auditoria
- Frontend: `src/lib/api.js`, `src/app/admin/page.js`.
- Backend: `src/middlewares/authMiddleware.js`, `src/controllers/authController.js`, `src/controllers/characterController.js`.

### Evidência e risco residual
- Evidência: revisão de rotas/controllers/modelos, busca por token/role/senha/upload e checks de sintaxe.
- Risco residual principal: autorização de mestre não está vinculada a campanhas; armazenamento de JWT em `localStorage` mantém risco XSS.
- Não foram exibidos ou registrados tokens, senhas, hashes ou valores de configuração.

### Testes executados
- `node --check` nos arquivos JavaScript alterados do backend: passou.
- `npm run lint` no frontend: falha por 4 erros preexistentes de `react-hooks/set-state-in-effect` e 3 avisos não relacionados nos componentes/contextos existentes.
