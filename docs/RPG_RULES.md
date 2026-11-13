# ⚔️ Grimorium — Manual Oficial de Regras do Sistema RPG d20 Customizado

> *"Que o aço guie tua mão, que o espírito ilumine teu caminho, e que a sabedoria proteja tua alma das trevas."*
> — Inscrição no Grande Grimório da Ordem dos Bruxeiros

Este documento constitui a **referência canônica e definitiva** de todas as mecânicas, cálculos, subsistemas e regras que governam o universo do **Grimorium RPG**. Todo componente da Ficha de RPG Web e toda decisão de mesa devem obedecer às regras aqui descritas.

---

## Índice

1. [Atributos Principais](#1-atributos-principais-os-sete-pilares)
2. [Modificadores Matemáticos](#2-modificadores-matemáticos)
3. [Perícias](#3-perícias-as-19-artes-do-aventureiro)
4. [Pontos de Vida (PV / HP)](#4-pontos-de-vida-pv--hp)
5. [Pontos de Esforço (PE)](#5-pontos-de-esforço-pe)
6. [Bônus de Proficiência / Bravura (BP)](#6-bônus-de-proficiência--bravura-bp)
7. [Insanidade](#7-insanidade)
8. [Classe de Armadura (CA)](#8-classe-de-armadura-ca)
9. [Iniciativa](#9-iniciativa)
10. [Sistema de Combate](#10-sistema-de-combate)
11. [Vantagem e Desvantagem](#11-vantagem-e-desvantagem)
12. [Progressão de Nível e XP](#12-progressão-de-nível-e-xp)
13. [Habilidades e Treinamento](#13-habilidades-e-treinamento)
14. [Economia e Moedas](#14-economia-e-moedas)
15. [Inventário e Capacidade de Carga](#15-inventário-e-capacidade-de-carga)
16. [Descanso](#16-descanso)
17. [Contratos e Missões](#17-contratos-e-missões)
18. [Montarias](#18-montarias)
19. [Mercado do Mundo](#19-mercado-do-mundo)

---

## 1. Atributos Principais — Os Sete Pilares

Ao contrário dos sistemas d20 tradicionais que operam com 6 atributos, o Grimorium implementa **7 Atributos Fundamentais**, separando a percepção mística e força de vontade em **Espírito (ESP)** da sabedoria prática em **Sabedoria (SAB)**.

Cada atributo possui um valor numérico no intervalo de **1 a 30**, onde 10 representa a média humana.

| # | Sigla | Nome | Descrição |
|:-:|:-----:|:-----|:----------|
| 1 | **FOR** | Força | Poder físico bruto, capacidade de carga e dano corpo a corpo. Governa ataques com armas pesadas e esforços de arrombamento. |
| 2 | **DES** | Destreza | Agilidade, coordenação motora, reflexos, equilíbrio e furtividade. Influencia a Classe de Armadura e a Iniciativa. |
| 3 | **CON** | Constituição | Vigor físico, resistência a doenças, venenos e fôlego. Determina os Pontos de Vida adicionais por nível. |
| 4 | **SAB** | Sabedoria | Atenção prática, bom senso, sobrevivência no ermo e conhecimento empírico. Rege perícias de observação mundana e estabilidade mental. |
| 5 | **ESP** | Espírito | Força de vontade, intuição mística, percepção extrassensorial e presença espiritual. Governa os Sinais mágicos e os Pontos de Esforço. |
| 6 | **CAR** | Carisma | Liderança, persuasão, intimidação, charme e eloquência social. Influencia o Bônus de Proficiência/Bravura (BP). |
| 7 | **INT** | Inteligência | Conhecimento acadêmico, arcanismo, raciocínio lógico e memória. Rege perícias de estudo e compreensão arcana. |

### Faixas de Referência

| Faixa de Valor | Classificação |
|:-:|:--|
| 1–4 | Debilitado — Deficiência severa neste aspecto |
| 5–7 | Abaixo da média — Fragilidade perceptível |
| 8–9 | Ligeiramente abaixo da média |
| **10–11** | **Média humana** |
| 12–13 | Acima da média — Talento notável |
| 14–15 | Excepcional — Poucos mortais alcançam |
| 16–17 | Heroico — Digno de lendas |
| 18–19 | Sobre-humano — No limiar do impossível |
| 20+ | Lendário / Divino — Além da mortalidade |

---

## 2. Modificadores Matemáticos

Todo atributo gera um **modificador** que é aplicado em rolagens de dados, testes de perícia, dano e cálculos derivados.

### Fórmula Canônica

$$\text{Modificador} = \left\lfloor \frac{\text{Valor do Atributo} - 10}{2} \right\rfloor$$

Em código: `Math.floor((valor - 10) / 2)`

### Tabela de Referência Completa (1–30)

| Atributo | Mod | Atributo | Mod | Atributo | Mod |
|:--------:|:---:|:--------:|:---:|:--------:|:---:|
| 1 | -5 | 11 | 0 | 21 | +5 |
| 2 | -4 | 12 | +1 | 22 | +6 |
| 3 | -4 | 13 | +1 | 23 | +6 |
| 4 | -3 | 14 | +2 | 24 | +7 |
| 5 | -3 | 15 | +2 | 25 | +7 |
| 6 | -2 | 16 | +3 | 26 | +8 |
| 7 | -2 | 17 | +3 | 27 | +8 |
| 8 | -1 | 18 | +4 | 28 | +9 |
| 9 | -1 | 19 | +4 | 29 | +9 |
| 10 | 0 | 20 | +5 | 30 | +10 |

### Formatação

- Modificadores positivos são exibidos com sinal: **+3**
- Modificadores zero: **0**
- Modificadores negativos: **-2**

---

## 3. Perícias — As 19 Artes do Aventureiro

O sistema conta com **19 Perícias Canônicas** distribuídas entre os 7 atributos. Cada perícia representa uma área de competência treinável do herói.

### Tabela de Perícias

| Perícia | Atributo Base | Descrição |
|:--------|:---:|:----------|
| **Atletismo** | `FOR` | Escalar, saltar, nadar e esforços físicos extremos |
| **Acrobacia** | `DES` | Equilíbrio em superfícies estreitas, cambalhotas e manobras ágeis |
| **Furtividade** | `DES` | Mover-se em silêncio e esconder-se nas sombras |
| **Prestidigitação** | `DES` | Bater carteiras, ocultar objetos e truques manuais rápidos |
| **História** | `SAB` | Recordar eventos passados, lendas locais e dinastias |
| **Investigação** | `SAB` | Procurar pistas escondidas, deduzir eventos em cenas |
| **Sobrevivência** | `SAB` | Rastrear pegadas, caçar no ermo e prever o clima |
| **Provocação** | `SAB` | Desestabilizar oponentes verbalmente em combate ou duelo |
| **Animais** | `SAB` | Acalmar animais selvagens, adestrar montarias |
| **Medicina** | `SAB` | Estabilizar feridos, diagnosticar venenos e tratar enfermidades |
| **Intuição** | `ESP` | Sentir intenções ocultas, discernir mentiras e auras |
| **Percepção** | `ESP` | Notar perigos iminentes, ouvir sons distantes |
| **Atuação** | `ESP` | Encenações artísticas, canalização espiritual e presença de palco |
| **Enganação** | `CAR` | Contar mentiras convincentes e disfarçar intenções |
| **Intimidação** | `CAR` | Coagir através de ameaças físicas ou autoridade |
| **Persuasão** | `CAR` | Negociar acordos diplomáticos e inspirar confiança |
| **Arcanismo** | `INT` | Compreender teorias de magia, runas e artefatos |
| **Religião** | `INT` | Conhecimento sobre divindades, ordens sagradas e ritos |
| **Natureza** | `INT` | Identificar flora, fauna, minérios e fenômenos naturais |

### Distribuição por Atributo

| Atributo | Perícias | Quantidade |
|:--------:|:---------|:----------:|
| FOR | Atletismo | 1 |
| DES | Acrobacia, Furtividade, Prestidigitação | 3 |
| SAB | História, Investigação, Sobrevivência, Provocação, Animais, Medicina | 6 |
| ESP | Intuição, Percepção, Atuação | 3 |
| CAR | Enganação, Intimidação, Persuasão | 3 |
| INT | Arcanismo, Religião, Natureza | 3 |

### Cálculo do Bônus Total da Perícia

$$\text{Total da Perícia} = \text{Mod. do Atributo Base} + \text{Bônus de Treino} + \text{Bônus Extra}$$

- **Mod. do Atributo Base**: Modificador derivado do atributo vinculado (ex: Atletismo usa Mod(FOR)).
- **Bônus de Treino**: Se a perícia está marcada como **treinada** e não possui bônus explícito, aplica-se o bônus de proficiência padrão (+2).
- **Bônus Extra**: Quando definido manualmente, substitui o bônus de treino padrão.

**Exemplo**: Um herói com FOR 16 (+3) treinado em Atletismo com bônus 5 → Total = +3 + 5 = **+8**.

### Perícias Customizadas

Além das 19 canônicas, o sistema permite **perícias customizadas extras** criadas pelo mestre ou jogador. Estas são preservadas junto à lista canônica, mas não substituem nenhuma perícia padrão.

---

## 4. Pontos de Vida (PV / HP)

Os Pontos de Vida representam a vitalidade, resistência e capacidade do herói de absorver ferimentos antes de sucumbir.

### Cálculo do HP Máximo

$$\text{HP Máximo} = \text{HP Base da Classe} + (\text{Mod(CON)} \times \text{Nível})$$

- O **HP Base** é determinado pela classe do personagem (definido na criação).
- O **Mod(CON)** é adicionado a cada nível de progressão.

### Dado de Vida (Hit Die)

Cada classe possui um **Dado de Vida** (Hit Die) associado que determina a recuperação durante descansos:

| Tipo | Dado de Vida |
|:-----|:----------:|
| Bruxeiro / Guerreiro | `1d10` |
| Ladino / Ranger | `1d8` |
| Mago / Conjurador | `1d6` |
| Bárbaro | `1d12` |

O dado de vida é armazenado na ficha como `dadosExtras.hitDie` (formato: `"1d10"`, `"1d8"`, etc.).

### Dano e Cura

- **Dano** reduz o HP atual. O HP nunca cai abaixo de **0**.
- **Cura** restaura o HP atual. O HP nunca excede o **HP Máximo**.
- A função `applyHealthChange(currentHp, maxHp, delta)` garante esses limites:
  - `delta > 0` = Cura
  - `delta < 0` = Dano

### Condição de 0 HP

Quando um personagem atinge **0 HP**, ele fica **Inconsciente**:
- Incapacitado, larga o que estiver segurando e cai.
- Falha automaticamente em salvaguardas de FOR e DES.
- Ataques contra ele têm vantagem.
- Ataques corpo a corpo que acertam são críticos automáticos.

> ⚠️ **HP atual nunca pode exceder o HP Máximo.** Toda tentativa de cura além do limite é descartada.

---

## 5. Pontos de Esforço (PE)

Os Pontos de Esforço representam a energia interior, resistência espiritual e foco do herói. São gastos para ativar **habilidades especiais**, **sinais mágicos** e **técnicas avançadas**.

### Cálculo do PE Máximo

$$\text{PE Máximo} = \text{Nível} + \text{Mod(ESP)}$$

- **Mínimo**: 0 (o PE Máximo nunca é negativo).
- O valor é armazenado em `dadosExtras.peMax`.
- O gasto corrente é rastreado em `dadosExtras.peCurrent`.

### Regras de PE

- **PE Atual ≤ PE Máximo**: Nunca excede o máximo.
- **Custo de habilidades**: Cada habilidade especifica seu custo em PE (ex: "2 PE", "3 PE").
- **Habilidades passivas**: Custam 0 PE — estão sempre ativas.
- Quando o herói chega a **0 PE**, não pode mais ativar habilidades que custem PE.

### Recuperação de PE

| Tipo de Descanso | Recuperação |
|:-----------------|:------------|
| Descanso Curto | 25% do PE Máximo (arredondado para baixo) |
| Descanso Longo | 100% do PE Máximo |

---

## 6. Bônus de Proficiência / Bravura (BP)

O Bônus de Bravura representa a coragem, renome e capacidade do herói de realizar feitos extraordinários sob pressão. São pontos consumíveis que permitem **heroísmo no momento decisivo**.

### Cálculo do BP Máximo

$$\text{BP Máximo} = \text{Nível} + \text{Mod(CAR)}$$

- **Mínimo**: 0 (o BP Máximo nunca é negativo).
- O valor é armazenado em `dadosExtras.bpMax`.
- O gasto corrente é rastreado em `dadosExtras.bpCurrent`.

### Uso de BP

- **BP Atual ≤ BP Máximo**: Nunca excede o máximo.
- Pontos de Bravura podem ser gastos para:
  - Re-rolar um teste fracassado.
  - Adicionar bônus heroico a uma salvaguarda.
  - Resistir a uma condição debilitante.
  - Realizar um feito narrativo extraordinário (a critério do mestre).

### Recuperação de BP

- BP é totalmente restaurado apenas em marcos narrativos, conquistas significativas ou por decisão do mestre.

---

## 7. Insanidade

O sistema de Insanidade rastreia a deterioração mental e espiritual do herói diante de horrores cósmicos, maldições, magias proibidas e encontros com o desconhecido.

### Cálculo do Máximo de Insanidade

$$\text{Insanidade Máxima} = 10 + \text{Mod(SAB)}$$

- **Mínimo**: 0 (a insanidade máxima nunca é negativa).
- O valor é armazenado em `dadosExtras.insanityMax`.
- O acúmulo corrente é rastreado em `dadosExtras.insanityCurrent`.

### Regras de Insanidade

- **Insanidade Atual ≤ Insanidade Máxima**: Nunca excede o limite.
- Insanidade é **acumulada** por eventos traumáticos, exposição a magia negra, encontros com entidades além da compreensão mortal.

### Efeitos por Faixa

| Faixa (%) | Efeito |
|:----------|:-------|
| 0–25% | Sem efeitos. O herói mantém a compostura. |
| 26–50% | Nervosismo. Desvantagem em testes de CAR em situações sociais delicadas. |
| 51–75% | Perturbação. Desvantagem em testes de ESP e Percepção. Visões momentâneas. |
| 76–99% | Loucura parcial. Desvantagem em todos os testes mentais (SAB, ESP, INT). Alucinações recorrentes. |
| 100% | Colapso total. O herói perde o controle temporariamente (decisão do mestre). |

### Recuperação de Insanidade

- **Descanso Longo**: Reduz a insanidade em **1 ponto**.
- **Cura mágica ou herbalista**: A critério do mestre.

---

## 8. Classe de Armadura (CA)

A Classe de Armadura (CA) representa a dificuldade de atingir um herói com um ataque. Quanto maior a CA, mais difícil é ser atingido.

### Fórmula Base

$$\text{CA} = 10 + \text{Mod(DES)} + \text{Bônus de Armadura} + \text{Bônus de Escudo}$$

O valor é armazenado em `dadosExtras.armorClass` (onde se registra o bônus extra além do cálculo base de 10 + Mod(DES)).

### Tipos de Armadura

| Tipo | CA Base | Modificador DES | Penalidades | Exemplo |
|:-----|:-------:|:---------------:|:------------|:--------|
| Sem armadura | 10 | + Mod(DES) total | Nenhuma | Roupas comuns |
| Leve | 11–12 | + Mod(DES) total | Nenhuma | Couro, Couro batido |
| Média | 13–15 | + Mod(DES) (máx. +2) | Possível desvantagem em Furtividade | Cota de malha leve, Couraça |
| Pesada | 16–18 | Nenhum | Desvantagem em Furtividade; requisito de FOR | Cota de malha, Placas completas |

### Escudos

| Escudo | Bônus CA |
|:-------|:--------:|
| Escudo leve | +1 |
| Escudo médio | +2 |
| Escudo pesado/torre | +3 |

### Exemplo Completo

Um herói com DES 16 (+3), Couraça (CA 14, Mod DES máx. +2) e Escudo (+2):
- CA = 14 + 2 (DES, limitado) + 2 (escudo) = **18**

---

## 9. Iniciativa

A Iniciativa determina a **ordem de ação** de cada combatente no início de um encontro.

### Fórmula

$$\text{Iniciativa} = \text{Mod(DES)} + \text{Bônus Extra}$$

- **Mod(DES)**: Reflexos e velocidade de reação.
- **Bônus Extra**: Proveniente de habilidades, itens ou condições especiais. Armazenado em `dadosExtras.initiative`.

### Determinação da Ordem

1. Cada combatente rola **1d20 + Iniciativa**.
2. Os combatentes são ordenados do **maior para o menor** resultado.
3. Em caso de empate, o combatente com **maior Mod(DES)** age primeiro. Se o empate persistir, resolve-se com uma rolagem desempate.

---

## 10. Sistema de Combate

O combate no Grimorium é estruturado em **rodadas** e **turnos**, seguindo a tradição dos sistemas d20 com adaptações para 7 atributos.

### 10.1 Estrutura do Combate

| Conceito | Definição |
|:---------|:----------|
| **Rodada** | Um ciclo completo em que todos os combatentes agem uma vez. Equivale a ~6 segundos no mundo do jogo. |
| **Turno** | A vez individual de um combatente dentro da rodada. |

A contagem de rodadas avança automaticamente quando o último combatente na ordem de iniciativa conclui seu turno, retornando ao primeiro.

### 10.2 Ações no Turno

Em seu turno, um combatente pode:

| Tipo | Descrição |
|:-----|:----------|
| **Ação padrão** | Atacar, conjurar, usar item, esquivar, ajudar, etc. |
| **Ação de movimento** | Mover-se até seu deslocamento base. |
| **Ação bônus** | Habilidades específicas que utilizam ação bônus. |
| **Reação** | Uma resposta a um gatilho (ex: Esquiva Fluida, ataque de oportunidade). Uma por rodada. |
| **Interação livre** | Abrir porta, sacar arma, falar brevemente. |

### 10.3 Rolagem de Ataque

$$\text{Rolagem de Ataque} = 1\text{d}20 + \text{Mod. do Atributo} + \text{Bônus de Proficiência}$$

- **Armas corpo a corpo**: Usam Mod(FOR) — ou Mod(DES) se a arma tiver a propriedade *Acuidade*.
- **Armas à distância**: Usam Mod(DES).
- **Sinais e magias**: Usam o atributo da habilidade (ESP, INT, CAR, conforme especificado).

**Sucesso**: Se o resultado total ≥ CA do alvo, o ataque **acerta**.

### 10.4 Rolagem de Dano

$$\text{Dano} = \text{Dado(s) da Arma/Habilidade} + \text{Mod. do Atributo}$$

- O tipo de dano (cortante, perfurante, contundente, fogo, gélido, etc.) é determinado pela arma ou habilidade.

### 10.5 Resultados Críticos

| Resultado | Nome | Efeito |
|:---------:|:-----|:-------|
| **Nat 20** | Acerto Crítico | Sucesso automático. Dobra os dados de dano (não o modificador). |
| **Nat 1** | Falha Crítica | Falha automática, independente de bônus. Pode causar complicação narrativa. |

### 10.6 Condições Táticas de Combate

O sistema define **10 condições** que podem afetar combatentes:

| # | Condição | Efeito |
|:-:|:---------|:-------|
| 1 | **Atordoado** | Incapaz de agir ou se mover; falha em testes de FOR e DES. |
| 2 | **Envenenado** | Desvantagem em jogadas de ataque e testes de atributo. |
| 3 | **Caído** | Ataques corpo a corpo contra o alvo têm vantagem; movimentos custam o dobro. |
| 4 | **Cego** | Ataques contra o alvo têm vantagem; ataques do alvo têm desvantagem. |
| 5 | **Amaldiçoado** | Dano necrótico ou penalidade mágica em rolagens. |
| 6 | **Incapacitado** | Não pode realizar ações ou reações. |
| 7 | **Amedrontado** | Desvantagem em testes enquanto a fonte do medo estiver visível; não pode se mover voluntariamente para mais perto dela. |
| 8 | **Inconsciente** | Incapacitado, larga o que estiver segurando e cai; falha em salvaguardas de FOR e DES; ataques contra o alvo têm vantagem. |
| 9 | **Abençoado** | +1d4 em jogadas de ataque e testes de resistência (condição benéfica). |
| 10 | **Invisível** | Vantagem em ataques; ataques contra o alvo têm desvantagem; não pode ser alvo de efeitos que exijam visão. |

---

## 11. Vantagem e Desvantagem

A mecânica de Vantagem e Desvantagem substitui a acumulação de bônus/penalidades situacionais, simplificando a resolução.

### Mecânica

| Modo | Notação | Resolução |
|:-----|:-------:|:----------|
| **Normal** | `1d20 + mod` | Rola 1d20, soma o modificador. |
| **Vantagem** | `2d20kh1 + mod` | Rola **2d20**, mantém o **maior** (keep highest 1), soma o modificador. O dado descartado é exibido riscado. |
| **Desvantagem** | `2d20kl1 + mod` | Rola **2d20**, mantém o **menor** (keep lowest 1), soma o modificador. O dado descartado é exibido riscado. |

### Regras Importantes

- Vantagem e desvantagem **não se acumulam**. Múltiplas fontes de vantagem = apenas 1 vantagem.
- Se um personagem tem **ao mesmo tempo** vantagem e desvantagem, elas se cancelam → rolagem normal.
- **Críticos** (Nat 20 / Nat 1) são avaliados sobre o **dado mantido**, não o descartado.

---

## 12. Progressão de Nível e XP

Os heróis avançam em poder conforme acumulam **Pontos de Experiência (XP)** por missões, derrotas de inimigos e marcos narrativos.

### Tabela de XP por Nível

| Nível | XP Necessário | Nível | XP Necessário |
|:-----:|:-------------:|:-----:|:-------------:|
| 1 | 0 | 11 | 85.000 |
| 2 | 300 | 12 | 100.000 |
| 3 | 900 | 13 | 120.000 |
| 4 | 2.700 | 14 | 140.000 |
| 5 | 6.500 | 15 | 165.000 |
| 6 | 14.000 | 16 | 195.000 |
| 7 | 23.000 | 17 | 225.000 |
| 8 | 34.000 | 18 | 265.000 |
| 9 | 48.000 | 19 | 305.000 |
| 10 | 64.000 | 20 | 355.000 |

### Ganhos ao Subir de Nível

A cada nível, o herói recebe:

1. **HP adicional**: Rola o Dado de Vida + Mod(CON) (mínimo +1).
2. **PE Máximo recalculado**: Nível + Mod(ESP).
3. **BP Máximo recalculado**: Nível + Mod(CAR).
4. **Novas habilidades**: Acesso a habilidades de nível desbloqueadas (ver seção 13).
5. **Possível aumento de atributo**: Em níveis específicos (4, 8, 12, 16, 19), o herói pode aumentar 1 atributo em +2 ou 2 atributos em +1.

---

## 13. Habilidades e Treinamento

O sistema de habilidades do Grimorium divide-se em duas categorias e possui um **sistema de treinamento progressivo** com maestria.

### 13.1 Categorias de Habilidades

| Categoria | Descrição |
|:----------|:----------|
| **Habilidade de Nível** | Poderes desbloqueados pela progressão natural do herói (Níveis 1 ao 20). São pré-definidos pela classe/arquétipo. |
| **Criada pelo Jogador** | Técnica própria forjada e submetida para aprovação e treinamento pelo mestre. |

### 13.2 Tipos de Habilidade

| Tipo | Descrição |
|:-----|:----------|
| **Sinal / Magia** | Conjurações arcanas e sinais místicos. Custam PE. |
| **Ação Ativa** | Técnicas de combate ou exploração que exigem uma ação. Custam PE. |
| **Passiva** | Bônus permanentes que estão sempre ativos (0 PE). |
| **Reação** | Respostas automáticas a gatilhos específicos. Custam PE e gastam a reação da rodada. |

### 13.3 Propriedades de uma Habilidade

Cada habilidade possui:
- **Nome**: Identificação da técnica.
- **Tipo**: Magia, Ativa, Passiva ou Reação.
- **Nível Requerido**: Nível mínimo do herói para desbloquear.
- **Custo em PE**: Pontos de esforço gastos na ativação.
- **Atributo vinculado**: FOR, DES, CON, SAB, ESP, CAR ou INT.
- **Fórmula de rolagem**: Ex: `2d6+2`, `1d20+ESP`.
- **Tipo de dano/efeito**: Fogo, Cortante, Defesa Arcana, etc.
- **Alcance**: Cone, linha, corpo a corpo, pessoal, etc.
- **Descrição narrativa**: Efeito in-game.

### 13.4 Ciclo de Submissão e Aprovação (Habilidades Criadas)

```
Jogador cria habilidade → Status: PENDENTE
       ↓
Mestre analisa a submissão
       ↓
  ┌────┴────┐
  ↓         ↓
APROVADA   REJEITADA (com justificativa)
  ↓         ↓
Treino    Jogador pode resubmeter
liberado  com ajustes
```

| Status | Descrição |
|:-------|:----------|
| **Aprovada** | Validada pelo mestre. Pode ser treinada. |
| **Pendente** | Aguardando análise do mestre. Não pode ser treinada. |
| **Rejeitada** | Desbalanceada ou incompatível. Inclui feedback do mestre. |

### 13.5 Sistema de Treinamento — 4 Graus de Maestria

As habilidades evoluem através de **horas de treinamento in-game**, progredindo em 4 graus de maestria:

| Grau | Nome | Horas | Bônus | Efeito |
|:----:|:-----|:-----:|:------|:-------|
| 1 | **Aprendiz** | 0–9h | +0 | Domínio inicial dos movimentos e fundamentos da técnica. |
| 2 | **Praticante** | 10–24h | +1 no Teste / -1 PE | Execução consistente com menor desgaste físico e mental. |
| 3 | **Veterano** | 25–49h | +2 no Teste / Alcance +50% | Técnica instintiva capaz de surpreender adversários experientes. |
| 4 | **Mestre** | 50–100h | +3 no Teste / Crítico Aprimorado (19-20) | Perfeição absoluta na execução, canalizando poder máximo. |

> **Nota**: O grau máximo é **Mestre** (100 horas). A progressão percentual entre graus é calculada automaticamente pela ficha.

### 13.6 Habilidades Canônicas de Exemplo

| Habilidade | Tipo | Nível | Custo | Atributo | Alcance |
|:-----------|:-----|:-----:|:-----:|:--------:|:--------|
| Sinal Igni | Magia | 1 | 2 PE | ESP | Cone de 5m |
| Sinal Quen | Magia | 1 | 2 PE | ESP | Pessoal |
| Sentidos de Bruxeiro | Passiva | 1 | 0 PE | SAB | 30m |
| Sinal Aard | Magia | 2 | 2 PE | ESP | Linha de 6m |
| Esquiva Fluida | Reação | 2 | 1 PE | DES | Reação |
| Sinal Axii | Magia | 3 | 3 PE | CAR | Toque / 4m |
| Dança das Lâminas | Ativa | 3 | 3 PE | DES | Corpo a corpo (3 alvos) |
| Sinal Yrden | Magia | 4 | 3 PE | INT | Raio de 4m no chão |
| Execução de Prata | Ativa | 5 | 4 PE | FOR | Corpo a corpo |

---

## 14. Economia e Moedas

O mundo do Grimorium opera com um sistema monetário de **4 denominações** metálicas, da mais humilde à mais nobre.

### As 4 Moedas

| Moeda | Sigla | Descrição |
|:------|:-----:|:----------|
| **Latina (Platina)** | PL | A mais nobre e rara das moedas. Usada em transações entre reis, nobres e guildas de alto escalão. |
| **Ouro** | PO | Padrão de comércio para itens de alto valor, armas refinadas e serviços especializados. |
| **Prata** | PP | Moeda de circulação comum para estadias em estalagens, suprimentos diários e ferramentas. |
| **Cobre** | PC | Troco menor para serviços básicos, pão, canecas de cerveja e gorjetas. |

### Taxas de Conversão

```
1 Latina (PL) = 10 Ouro (PO) = 100 Prata (PP) = 1.000 Cobre (PC)
```

| De → Para | Latina | Ouro | Prata | Cobre |
|:---------:|:------:|:----:|:-----:|:-----:|
| **1 Latina** | 1 | 10 | 100 | 1.000 |
| **1 Ouro** | 0,1 | 1 | 10 | 100 |
| **1 Prata** | 0,01 | 0,1 | 1 | 10 |
| **1 Cobre** | 0,001 | 0,01 | 0,1 | 1 |

### Cofre Bancário

- **80 slots** individuais para armazenar tesouros, munições especiais e relíquias.
- Cada slot comporta **1 item** (ou pilha nomeada).
- O cofre é **protegido por senha** alfanumérica/numérica configurável pelo jogador.
- Itens no cofre **não contam** para a capacidade de carga do inventário.

---

## 15. Inventário e Capacidade de Carga

Todo herói carrega consigo equipamentos, armas, poções e suprimentos. A capacidade de carga limita o que pode ser transportado.

### Cálculo do Peso Transportado

$$\text{Peso Total} = \sum_{i} (\text{Quantidade}_i \times \text{Peso Unitário}_i)$$

- Cada item no inventário possui **quantidade** (`qty`) e **peso unitário** (`weight`, em kg).
- Itens sem peso definido consideram 1 kg como padrão.

### Capacidade de Carga

$$\text{Capacidade Máxima} = \text{FOR} \times 1.5 \text{ (kg)}$$

Se não houver valor explícito definido, o cálculo padrão é `FOR × 1.5`. O mestre pode definir manualmente a capacidade em `dadosExtras.inventoryCapacity`.

### Sobrecarga

| Estado | Condição | Efeito |
|:-------|:---------|:-------|
| Normal | Peso ≤ Capacidade | Sem penalidades |
| **Sobrecarregado** | Peso > Capacidade | Deslocamento reduzido pela metade. Desvantagem em testes de DES, acrobacia e furtividade. |

A ficha exibe uma barra de porcentagem de carga: `Math.min(100, Math.round((carried / max) * 100))`.

---

## 16. Descanso

O descanso permite que os heróis recuperem suas energias, curem ferimentos e restaurem o equilíbrio mental.

### 16.1 Descanso Curto

**Duração**: ~1 hora de repouso em local seguro.

| Recurso | Recuperação |
|:--------|:------------|
| **HP** | Rola o Dado de Vida + Mod(CON). O resultado é adicionado ao HP atual (sem exceder o HP Máximo). |
| **PE** | Restaura **25%** do PE Máximo (arredondado para baixo). |
| **BP** | Não recupera. |
| **Insanidade** | Não reduz. |

### 16.2 Descanso Longo

**Duração**: ~8 horas de sono ou repouso prolongado.

| Recurso | Recuperação |
|:--------|:------------|
| **HP** | Restaura **100%** do HP Máximo. |
| **PE** | Restaura **100%** do PE Máximo. |
| **BP** | Não recupera automaticamente (apenas por marcos narrativos). |
| **Insanidade** | Reduz em **1 ponto**. |

> **Nota**: Um descanso longo interrompido por combate ou atividade intensa não concede seus benefícios.

---

## 17. Contratos e Missões

Os contratos representam missões, investigações e caçadas aceitas pelo herói durante a campanha.

### Estrutura de um Contrato

| Campo | Descrição |
|:------|:----------|
| **Título** | Nome da missão (ex: "O Monstro do Poço"). |
| **Recompensa** | Pagamento prometido (ex: "50 Ouro", "Relíquia Antiga"). |
| **Estado** | `ativo` (em andamento) ou `concluído` (completo). |

### Regras

- Contratos podem ser adicionados e removidos da ficha a qualquer momento.
- Quando um contrato é marcado como **concluído**, a recompensa deve ser adicionada manualmente ao inventário/moedas pelo mestre.
- Contratos servem como registro narrativo e rastreamento de progresso da campanha.

---

## 18. Montarias

Cada herói pode possuir uma **montaria** — companheiro de viagem que carrega suprimentos e acelera deslocamento.

### Ficha da Montaria

| Campo | Descrição |
|:------|:----------|
| **Nome** | Identificação da montaria (ex: "Carpeado", "Ventania"). |
| **HP Atual** | Pontos de vida atuais da montaria. |
| **HP Máximo** | Pontos de vida totais da montaria. |
| **Notas de Equipamento** | Descrição de arreios, alforjes, sela e equipamentos montados. |

### Regras

- A montaria segue as mesmas regras de HP do personagem (mínimo 0, máximo HP Max).
- Se a montaria atingir **0 HP**, ela cai e o cavaleiro deve realizar um teste de DES (CD 10) para não cair junto.
- O mestre define o HP Máximo, velocidade e características especiais da montaria.

---

## 19. Mercado do Mundo

O Mercado do Mundo é o sistema de comércio administrado pelo **Mestre**, com mercadores espalhados pelas regiões do mundo do jogo.

### 19.1 Regiões do Mundo (5)

| # | Região | Ambientação |
|:-:|:-------|:------------|
| 1 | **Capital Valíria & Terras da Coroa** | Metrópole imperial, centro de poder e comércio refinado. |
| 2 | **Porto dos Afogados & Baía dos Naufrágios** | Costa corrupta, contrabando e vida pirata. |
| 3 | **Cidadela da Vigília & Deserto das Cinzas** | Fortaleza militar nas fronteiras do deserto ardente. |
| 4 | **Pântano das Brumas & Ermos Silenciosos** | Terras pantanosas, alquimia e bruxaria herbal. |
| 5 | **Vales Congelados de Karrath** | Montanhas geladas, forjas anãs e ameaças árticas. |

### 19.2 Mercadores Canônicos (7)

| Mercador | Título | Região | Especialidade |
|:---------|:-------|:-------|:-------------|
| **Mestre Garrick Martelo-de-Prata** | Ferreiro Imperial da Coroa | Capital Valíria | Armas & Armaduras Pesadas |
| **Mestre Elion, o Iluminado** | Arcanista & Bibliotecário Real | Capital Valíria | Grimórios, Pergaminhos & Relíquias |
| **Kaelen Olho-de-Corvo** | Contrabandista & Receptador do Porto | Porto dos Afogados | Veneno, Lâminas Curtas & Cargas Ilícitas |
| **Soraya do Oásis** | Líder de Caravana & Mercadora Nômade | Cidadela da Vigília | Equipamentos de Sobrevivência & Montarias |
| **Capitão Valerius** | Intendente da Guarnição da Vigília | Cidadela da Vigília | Provisões Marciais & Equipamento Tático |
| **Madame Isolde** | Herbalista & Bruxa das Brumas | Pântano das Brumas | Poções, Elixires & Unguentos |
| **Thorgar Barba-de-Gelo** | Armeiro das Cavernas Rúnicas | Vales de Karrath | Machados, Escudos Fortes & Peles Árticas |

### 19.3 Categorias de Itens (8)

1. **Armas** — Espadas, machados, bestas, arcos
2. **Armaduras & Escudos** — Proteções corporais e escudos
3. **Poções & Alquimia** — Elixires, venenos, antídotos
4. **Equipamento & Aventura** — Cordas, ferramentas, capas, kits
5. **Grimórios & Pergaminhos** — Livros mágicos e pergaminhos de conjuração
6. **Munições** — Flechas, virotes, projéteis especiais
7. **Relíquias & Itens Mágicos** — Anéis, amuletos e artefatos encantados
8. **Montarias & Provisões** — Cavalos, rações, suprimentos de viagem

### 19.4 Raridades (5)

| Raridade | Descrição |
|:---------|:----------|
| **Comum** | Itens mundanos encontrados em qualquer vila ou cidade |
| **Incomum** | Itens de qualidade superior, criados por artesãos habilidosos |
| **Raro** | Itens excepcionais com propriedades especiais, difíceis de encontrar |
| **Muito Raro** | Artefatos poderosos, geralmente únicos em uma região |
| **Lendário** | Relíquias de poder imenso, peças de legenda conhecidas em todo o mundo |

### 19.5 Sistema de Estoque e Preços

- Todo item de mercado possui: **nome**, **região**, **vendedor**, **tipo**, **quantidade em estoque**, **preço**, **moeda**, **peso**, **raridade**, **descrição** e **requisitos**.
- **Estoque limitado**: Cada item tem uma quantidade finita. Quando a quantidade chega a 0, o item está **esgotado**.
- **Preços em qualquer moeda**: O preço pode ser definido em Ouro (PO), Prata (PP), Cobre (PC) ou Latina (PL).
- **Peso**: Cada item contribui para a capacidade de carga ao ser adquirido.

### 19.6 Filtros e Ordenação

O sistema de mercado suporta filtragem por:
- **Região** (ou "todas")
- **Vendedor** (ou "todos")
- **Tipo / Categoria** (ou "todos")
- **Raridade** (ou "todas")
- **Estoque**: disponível / esgotado / todos
- **Busca textual**: por nome, descrição, vendedor, região ou tipo

Ordenação disponível:
- Nome (A→Z / Z→A)
- Preço (menor→maior / maior→menor)
- Peso (menor→maior / maior→menor)
- Quantidade (maior→menor)

---

## Apêndice A — Glossário de Termos

| Termo | Significado |
|:------|:------------|
| **d20** | Dado de 20 faces |
| **Nat 20 / Nat 1** | Resultado natural de 20 ou 1 no d20, antes de modificadores |
| **Mod** | Modificador derivado de um atributo |
| **CA** | Classe de Armadura |
| **HP / PV** | Pontos de Vida (Hit Points) |
| **PE** | Pontos de Esforço |
| **BP** | Bônus de Proficiência / Bravura |
| **CD** | Classe de Dificuldade (valor alvo para testes) |
| **kh1** | Keep Highest 1 (manter o maior) |
| **kl1** | Keep Lowest 1 (manter o menor) |
| **PO / PP / PC / PL** | Peças de Ouro / Prata / Cobre / Latina (Platina) |

---

## Apêndice B — Referência Rápida de Fórmulas

| Cálculo | Fórmula |
|:--------|:--------|
| Modificador | `floor((atributo - 10) / 2)` |
| Bônus de Perícia | `Mod(Atributo) + Bônus de Treino + Bônus Extra` |
| HP Máximo | `HP Base + (Mod(CON) × Nível)` |
| PE Máximo | `Nível + Mod(ESP)` (mín. 0) |
| BP Máximo | `Nível + Mod(CAR)` (mín. 0) |
| Insanidade Máxima | `10 + Mod(SAB)` (mín. 0) |
| CA Base | `10 + Mod(DES) + Armadura + Escudo` |
| Iniciativa | `Mod(DES) + Bônus Extra` |
| Ataque | `1d20 + Mod(Atributo) + Proficiência` |
| Capacidade de Carga | `FOR × 1.5 kg` |
| Peso Transportado | `Σ(qty × weight)` |

---

*Que este grimório ilumine tua jornada pelas terras sombrias. Que teus dados rolem sempre a teu favor — exceto quando a história pedir o contrário.*

**— O Conselho dos Mestres do Grimorium**
