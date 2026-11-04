/**
 * Armazenamento em memória para rotas de autenticação do Next.js
 * Mantido por: @backend-database & @seguranca-identidade-rpg
 */

export const mockUsers = [
  {
    id: "usr-master-1",
    username: "mestre",
    email: "mestre@rpg.com",
    passwordHash: "scrypt$16384$8$1$98580c828d09fe202d8cc4b7cad735a8$23d2435c096fa4aa3e86ec945a91c6b28cdd60d7f3f21c784949fe690a26015dd38a3a49bea7edd97972656b438cf123a8c4044e98040021c1ab20750cf62957",
    perfil: "mestre",
    role: "master",
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-player-1",
    username: "jogador",
    email: "jogador@rpg.com",
    passwordHash: "scrypt$16384$8$1$98580c828d09fe202d8cc4b7cad735a8$23d2435c096fa4aa3e86ec945a91c6b28cdd60d7f3f21c784949fe690a26015dd38a3a49bea7edd97972656b438cf123a8c4044e98040021c1ab20750cf62957",
    perfil: "jogador",
    role: "player",
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-player-2",
    username: "Thorne",
    email: "thorne@rpg.com",
    passwordHash: "scrypt$16384$8$1$98580c828d09fe202d8cc4b7cad735a8$23d2435c096fa4aa3e86ec945a91c6b28cdd60d7f3f21c784949fe690a26015dd38a3a49bea7edd97972656b438cf123a8c4044e98040021c1ab20750cf62957",
    perfil: "jogador",
    role: "player",
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCharacters = [
  {
    id: "char-1",
    userId: "usr-player-2",
    name: "Thorne Valerius",
    job: "Guerreiro Arcano",
    level: 3,
    hp: 28,
    hpMax: 28,
    FOR: 16,
    DES: 14,
    CON: 14,
    INT: 12,
    SAB: 10,
    CAR: 10,
    ESP: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "char-2",
    userId: "usr-player-1",
    name: "Lyra Sombralluna",
    job: "Ladina Infiltradora",
    level: 3,
    hp: 20,
    hpMax: 20,
    FOR: 10,
    DES: 18,
    CON: 12,
    INT: 14,
    SAB: 12,
    CAR: 14,
    ESP: 10,
    updatedAt: new Date().toISOString(),
  },
];
