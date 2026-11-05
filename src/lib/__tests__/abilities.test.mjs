import test from "node:test";
import assert from "node:assert/strict";
import {
  GRAUS_TREINAMENTO,
  TIPOS_HABILIDADE,
  getGrauTreinamento,
  calcularProgressoTreino,
  isHabilidadeDesbloqueada,
  avancarTreinoHabilidade,
  agruparPorNivel,
  DEFAULT_ABILITIES,
} from "../abilities.js";

test("Motor de Habilidades & Treinamento", async (t) => {
  await t.test("1. Graus de Treinamento e Maestria", () => {
    assert.equal(GRAUS_TREINAMENTO.length, 4, "Devem existir 4 graus de maestria");
    assert.equal(getGrauTreinamento(0).id, "aprendiz");
    assert.equal(getGrauTreinamento(5).id, "aprendiz");
    assert.equal(getGrauTreinamento(10).id, "praticante");
    assert.equal(getGrauTreinamento(24).id, "praticante");
    assert.equal(getGrauTreinamento(25).id, "veterano");
    assert.equal(getGrauTreinamento(49).id, "veterano");
    assert.equal(getGrauTreinamento(50).id, "mestre");
    assert.equal(getGrauTreinamento(100).id, "mestre");
  });

  await t.test("2. Cálculo de Progresso de Treino", () => {
    // 0 horas: início de Aprendiz rumo a Praticante (meta: 10h)
    const progresso0 = calcularProgressoTreino(0);
    assert.equal(progresso0.grauAtual.id, "aprendiz");
    assert.equal(progresso0.proximoGrau.id, "praticante");
    assert.equal(progresso0.porcentagem, 0);
    assert.equal(progresso0.horasFaltantes, 10);
    assert.equal(progresso0.isMax, false);

    // 5 horas: 50% de Aprendiz
    const progresso5 = calcularProgressoTreino(5);
    assert.equal(progresso5.porcentagem, 50);
    assert.equal(progresso5.horasFaltantes, 5);

    // 10 horas: alcançou Praticante, rumo a Veterano (faixa 10-25 = 15h)
    const progresso10 = calcularProgressoTreino(10);
    assert.equal(progresso10.grauAtual.id, "praticante");
    assert.equal(progresso10.proximoGrau.id, "veterano");
    assert.equal(progresso10.porcentagem, 0);
    assert.equal(progresso10.horasFaltantes, 15);

    // 50+ horas: Mestre (nível máximo)
    const progressoMestre = calcularProgressoTreino(60);
    assert.equal(progressoMestre.grauAtual.id, "mestre");
    assert.equal(progressoMestre.proximoGrau, null);
    assert.equal(progressoMestre.isMax, true);
    assert.equal(progressoMestre.porcentagem, 100);
  });

  await t.test("3. Desbloqueio de Habilidades por Nível", () => {
    const habNivel1 = { name: "Golpe Inicial", reqLevel: 1 };
    const habNivel3 = { name: "Chute Giratório", reqLevel: 3 };
    const habNivel5 = { name: "Execução Épica", reqLevel: 5 };

    // Personagem Nível 1
    assert.equal(isHabilidadeDesbloqueada(habNivel1, 1), true);
    assert.equal(isHabilidadeDesbloqueada(habNivel3, 1), false);
    assert.equal(isHabilidadeDesbloqueada(habNivel5, 1), false);

    // Personagem Nível 3
    assert.equal(isHabilidadeDesbloqueada(habNivel1, 3), true);
    assert.equal(isHabilidadeDesbloqueada(habNivel3, 3), true);
    assert.equal(isHabilidadeDesbloqueada(habNivel5, 3), false);

    // Personagem Nível 5
    assert.equal(isHabilidadeDesbloqueada(habNivel5, 5), true);
  });

  await t.test("4. Avanço de Treino e Evolução de Grau", () => {
    const habInicial = {
      id: "teste-hab",
      name: "Técnica da Serpente",
      trainingHours: 8,
      masteryLevel: "aprendiz",
    };

    // Treina 3 horas (8 + 3 = 11h), deve subir para Praticante
    const habAtualizada = avancarTreinoHabilidade(habInicial, 3);
    assert.equal(habAtualizada.trainingHours, 11);
    assert.equal(habAtualizada.masteryLevel, "praticante");

    // Treina mais 15 horas (11 + 15 = 26h), deve subir para Veterano
    const habVeterana = avancarTreinoHabilidade(habAtualizada, 15);
    assert.equal(habVeterana.trainingHours, 26);
    assert.equal(habVeterana.masteryLevel, "veterano");

    // Treina mais 30 horas (26 + 30 = 56h), deve subir para Mestre
    const habMestre = avancarTreinoHabilidade(habVeterana, 30);
    assert.equal(habMestre.trainingHours, 56);
    assert.equal(habMestre.masteryLevel, "mestre");
  });

  await t.test("5. Agrupamento por Nível e Tiers", () => {
    const grupos = agruparPorNivel(DEFAULT_ABILITIES, 2);
    assert.ok(Array.isArray(grupos));
    assert.ok(grupos.length >= 3, "Deve possuir múltiplos níveis");

    // Nível 1 deve estar desbloqueado para personagem nível 2
    const grupoNivel1 = grupos.find((g) => g.nivel === 1);
    assert.ok(grupoNivel1);
    assert.equal(grupoNivel1.desbloqueado, true);

    // Nível 4 deve estar bloqueado para personagem nível 2
    const grupoNivel4 = grupos.find((g) => g.nivel === 4);
    assert.ok(grupoNivel4);
    assert.equal(grupoNivel4.desbloqueado, false);
  });

  await t.test("6. Integridade das Habilidades Canônicas", () => {
    assert.ok(DEFAULT_ABILITIES.length >= 7, "Catálogo padrão deve possuir habilidades diversas");
    for (const hab of DEFAULT_ABILITIES) {
      assert.ok(hab.id, "Habilidade deve ter id");
      assert.ok(hab.name, "Habilidade deve ter nome");
      assert.ok(hab.reqLevel > 0, "Habilidade deve ter nível requerido válido");
      assert.ok(TIPOS_HABILIDADE[hab.type], `Tipo ${hab.type} deve ser um tipo reconhecido`);
    }
  });
});
