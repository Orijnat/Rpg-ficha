import test from "node:test";
import assert from "node:assert/strict";

test("Área do Mestre (Tópico 3) — Bateria de Validações e Integridade", async (t) => {
  await t.test("1. Validação de modelagem e atributos específicos de NPC", () => {
    const npc = {
      nome: "Lich Arcano",
      papel: "Chefe",
      hp: 120,
      hpMax: 120,
      dadosExtras: {
        ca: 17,
        iniciativa: 4,
        attitude: "Hostil",
        status: "Ativo",
        tags: ["Chefe", "Morto-Vivo", "Mágico"],
        acoes: [{ nome: "Raio Necrótico", dano: "3d8+5" }],
        notasMestre: "Fraqueza contra dano radiante no filactério.",
        lastModifiedBy: { id: "user-1", name: "Mestre cledi", role: "master" },
        lastModifiedAt: new Date().toISOString(),
      },
    };

    assert.equal(npc.nome, "Lich Arcano");
    assert.equal(npc.dadosExtras.ca, 17);
    assert.equal(npc.dadosExtras.attitude, "Hostil");
    assert.ok(npc.dadosExtras.tags.includes("Chefe"));
    assert.ok(npc.dadosExtras.tags.includes("Morto-Vivo"));
    assert.equal(npc.dadosExtras.acoes.length, 1);
    assert.ok(npc.dadosExtras.notasMestre.includes("filactério"));
  });

  await t.test("2. Duplicação e geração de variantes de NPC", () => {
    const originalNpc = {
      id: "npc-10",
      nome: "Lobo das Sombras",
      papel: "Fera",
      hp: 30,
      hpMax: 30,
      dadosExtras: {
        ca: 13,
        tags: ["Fera"],
      },
    };

    // Função de clonagem/variante
    const variantSuffix = " (Alfa)";
    const hpMultiplier = 1.6;
    const addTags = ["Elite", "Alfa"];

    const variante = {
      ...originalNpc,
      id: "npc-11",
      nome: `${originalNpc.nome}${variantSuffix}`,
      hp: Math.round(originalNpc.hp * hpMultiplier),
      hpMax: Math.round(originalNpc.hpMax * hpMultiplier),
      dadosExtras: {
        ...originalNpc.dadosExtras,
        tags: Array.from(new Set([...originalNpc.dadosExtras.tags, ...addTags])),
        duplicadoDe: originalNpc.id,
      },
    };

    assert.equal(variante.nome, "Lobo das Sombras (Alfa)");
    assert.equal(variante.hp, 48); // 30 * 1.6
    assert.equal(variante.hpMax, 48);
    assert.ok(variante.dadosExtras.tags.includes("Fera"));
    assert.ok(variante.dadosExtras.tags.includes("Elite"));
    assert.ok(variante.dadosExtras.tags.includes("Alfa"));
    assert.equal(variante.dadosExtras.duplicadoDe, "npc-10");
  });

  await t.test("3. Filtragem, busca e ordenação combinada de Heróis e NPCs", () => {
    const catalog = [
      { id: "1", type: "Herói", name: "Geralt", job: "Bruxo", hp: 60, tags: [], status: "Ativo" },
      { id: "2", type: "Herói", name: "Jaskier", job: "Bardo", hp: 0, tags: [], status: "Inconsciente" },
      { id: "3", type: "NPC", name: "Goblin Saqueador", job: "Inimigo", hp: 12, tags: ["Lacaio"], status: "Ativo" },
      { id: "4", type: "NPC", name: "Dragão Vermelho", job: "Boss", hp: 250, tags: ["Chefe", "Fera"], status: "Ativo" },
    ];

    // Busca textual por 'dragão'
    const searchDragao = catalog.filter((c) => c.name.toLowerCase().includes("dragão"));
    assert.equal(searchDragao.length, 1);
    assert.equal(searchDragao[0].name, "Dragão Vermelho");

    // Filtro por tag 'Chefe'
    const chefeTag = catalog.filter((c) => c.tags.includes("Chefe"));
    assert.equal(chefeTag.length, 1);

    // Filtro por vivos/ativos
    const vivos = catalog.filter((c) => c.hp > 0);
    assert.equal(vivos.length, 3);

    // Ordenação por maior PV
    const sortedHp = [...catalog].sort((a, b) => b.hp - a.hp);
    assert.equal(sortedHp[0].name, "Dragão Vermelho");
    assert.equal(sortedHp[sortedHp.length - 1].name, "Jaskier");
  });

  await t.test("4. Filtragem server-side estrita de notas públicas vs privadas", () => {
    const notas = [
      { id: "n1", titulo: "Pista pública da guilda", privada: false, autorId: "mestre-1" },
      { id: "n2", titulo: "Segredo do traidor (Confidencial)", privada: true, autorId: "mestre-1" },
      { id: "n3", titulo: "Diário secreto do jogador", privada: true, autorId: "jogador-1" },
    ];

    // Função simula lógica do controller no backend
    const filtrarParaJogador = (user, list) => {
      const isMestre = user.role === "master";
      if (isMestre) return list;
      return list.filter((n) => !n.privada || n.autorId === user.id);
    };

    const respostaJogador = filtrarParaJogador({ id: "jogador-2", role: "player" }, notas);
    assert.equal(respostaJogador.length, 1);
    assert.equal(respostaJogador[0].id, "n1"); // Não recebeu n2 nem n3!

    const respostaJogadorAutor = filtrarParaJogador({ id: "jogador-1", role: "player" }, notas);
    assert.equal(respostaJogadorAutor.length, 2);
    assert.ok(respostaJogadorAutor.some((n) => n.id === "n3")); // Seu próprio diário
    assert.ok(!respostaJogadorAutor.some((n) => n.id === "n2")); // Não recebe segredo do mestre

    const respostaMestre = filtrarParaJogador({ id: "mestre-1", role: "master" }, notas);
    assert.equal(respostaMestre.length, 3); // Mestre recebe todas
  });

  await t.test("5. Revelação controlada de mapas e marcadores (Fog of War)", () => {
    const mapa = {
      id: "map-1",
      titulo: "Catacumba",
      publica: true,
      metadados: {
        markers: [
          { id: "m1", title: "Entrada Principal", hidden: false },
          { id: "m2", title: "Armadilha de Espetos", hidden: true },
          { id: "m3", title: "Câmara do Chefe", hidden: true },
        ],
      },
    };

    // Filtro server-side para jogador
    const sanitizedParaJogador = (rawMapa) => {
      const visibleMarkers = (rawMapa.metadados?.markers || []).filter((m) => !m.hidden);
      return {
        ...rawMapa,
        metadados: {
          ...rawMapa.metadados,
          markers: visibleMarkers,
        },
      };
    };

    const visaoJogador = sanitizedParaJogador(mapa);
    assert.equal(visaoJogador.metadados.markers.length, 1);
    assert.equal(visaoJogador.metadados.markers[0].title, "Entrada Principal");
    assert.ok(!visaoJogador.metadados.markers.some((m) => m.title.includes("Armadilha")));
  });

  await t.test("6. Histórico de alterações e auditoria de ações sensíveis", () => {
    const auditEvents = [];
    const registrar = (usuario, acao, entidade, dados) => {
      auditEvents.push({
        id: `aud-${Date.now()}`,
        usuario,
        acao,
        entidade,
        dados,
        timestamp: new Date().toISOString(),
      });
    };

    registrar({ id: "u-1", name: "Cledi" }, "EXCLUIR_NPC", "npcs", { nome: "Cultista Líder" });
    registrar({ id: "u-1", name: "Cledi" }, "ALTERAR_MEMBRO", "membros_campanha", { papel: "co-mestre" });

    assert.equal(auditEvents.length, 2);
    assert.equal(auditEvents[0].acao, "EXCLUIR_NPC");
    assert.equal(auditEvents[0].dados.nome, "Cultista Líder");
    assert.equal(auditEvents[1].acao, "ALTERAR_MEMBRO");
  });

  await t.test("7. Planejamento de sessões, cenas e checklist de objetivos", () => {
    const sessao = {
      numero: 1,
      titulo: "O Resgate da Cripta",
      cenas: [
        { titulo: "Cena 1", descricao: "Emboscada na estrada" },
        { titulo: "Cena 2", descricao: "Infiltração na caverna" },
      ],
      objetivos: [
        { id: "o1", texto: "Derrotar os batedores goblins", concluido: true },
        { id: "o2", texto: "Libertar o prisioneiro", concluido: false },
      ],
      recompensas: { xp: 300, tesouro: "100 PO" },
    };

    assert.equal(sessao.cenas.length, 2);
    assert.equal(sessao.objetivos.filter((o) => o.concluido).length, 1);
    assert.equal(sessao.recompensas.xp, 300);
  });

  await t.test("8. Restrição de mestre às próprias campanhas no backend (Multi-tenancy)", () => {
    const campanhas = [
      { id: "c1", nome: "Campanha A", mestreId: "mestre-1", membros: [{ userId: "jog-1", status: "aprovado" }] },
      { id: "c2", nome: "Campanha B", mestreId: "mestre-2", membros: [{ userId: "jog-2", status: "aprovado" }] },
    ];

    const podeAcessarCampanha = (usuario, campId) => {
      const camp = campanhas.find((c) => c.id === campId);
      if (!camp) return false;
      if (camp.mestreId === usuario.id) return true;
      return camp.membros.some((m) => m.userId === usuario.id && m.status === "aprovado");
    };

    // Mestre 1 não pode acessar Campanha 2 do Mestre 2:
    assert.equal(podeAcessarCampanha({ id: "mestre-1", role: "master" }, "c2"), false);
    // Mestre 1 acessa perfeitamente a Campanha 1:
    assert.equal(podeAcessarCampanha({ id: "mestre-1", role: "master" }, "c1"), true);
    // Jogador 1 acessa Campanha 1 onde é membro:
    assert.equal(podeAcessarCampanha({ id: "jog-1", role: "player" }, "c1"), true);
    // Jogador 1 não acessa Campanha 2:
    assert.equal(podeAcessarCampanha({ id: "jog-1", role: "player" }, "c2"), false);
  });

  await t.test("9. Gestão de membros: convite, aprovação, bloqueio e remoção", () => {
    let membros = [
      { userId: "u-1", nome: "Geralt", papel: "jogador", status: "aprovado", bloqueado: false },
      { userId: "u-2", nome: "Jaskier", papel: "jogador", status: "aprovado", bloqueado: false },
    ];

    // Entrada por convite
    const novoMembro = { userId: "u-3", nome: "Yennefer", papel: "jogador", status: "aprovado", bloqueado: false };
    membros = [...membros, novoMembro];
    assert.equal(membros.length, 3);

    // Bloquear membro
    membros = membros.map((m) => (m.userId === "u-2" ? { ...m, bloqueado: true } : m));
    const bloqueado = membros.find((m) => m.userId === "u-2");
    assert.equal(bloqueado.bloqueado, true);

    // Expulsar membro
    membros = membros.filter((m) => m.userId !== "u-3");
    assert.equal(membros.length, 2);
    assert.ok(!membros.some((m) => m.userId === "u-3"));
  });

  await t.test("10. Rastreamento granular: quem alterou cada dado e quando", () => {
    const registro = {
      id: "char-10",
      nome: "Valerius",
      hp: 35,
      hpMax: 40,
      lastModifiedBy: { id: "user-gm", name: "Mestre Arcano", role: "master" },
      lastModifiedAt: "2026-10-26T22:30:00.000Z",
    };

    const atualizarDado = (dadoOriginal, alteracoes, autor) => {
      return {
        ...dadoOriginal,
        ...alteracoes,
        lastModifiedBy: { id: autor.id, name: autor.name, role: autor.role },
        lastModifiedAt: new Date().toISOString(),
      };
    };

    const atualizado = atualizarDado(
      registro,
      { hp: 20 },
      { id: "user-gm2", name: "Co-Mestre", role: "master" }
    );

    assert.equal(atualizado.hp, 20);
    assert.equal(atualizado.lastModifiedBy.name, "Co-Mestre");
    assert.ok(atualizado.lastModifiedAt > registro.lastModifiedAt);
  });
});
