# Manual de Regras do Sistema: RPG Base d20 Customizado

Este documento é o livro de regras de referência para as mecânicas, cálculos, perícias e subsistemas suportados pela **Ficha de RPG Web**.

---

## 1. Atributos Principais (7 Atributos)

Ao contrário dos sistemas d20 tradicionais que operam com 6 atributos, este sistema implementa **7 Atributos Fundamentais**, separando a força mental e percepção mística em **Espírito (ESP)** e sabedoria prática em **Sabedoria (SAB)**:

1. **FOR (Força)**: Poder físico bruto, capacidade de carga e dano corpo a corpo.
2. **DES (Destreza)**: Agilidade, coordenação motora, reflexos, equilíbrio e furtividade.
3. **CON (Constituição)**: Vigor físico, resistência a doenças, fôlego e pontos de vida (HP).
4. **SAB (Sabedoria)**: Atenção prática, bom senso, sobrevivência no ermo e conhecimento empírico.
5. **ESP (Espírito)**: Força de vontade, intuição mística, percepção extrassensorial e presença espiritual.
6. **CAR (Carisma)**: Liderança, persuasão, intimidação, charme e eloquência social.
7. **INT (Inteligência)**: Conhecimento acadêmico, arcanismo, raciocínio lógico e memória.

---

## 2. Modificadores Matemáticos

A fórmula padrão de cálculo do modificador é:
$$\text{Modificador} = \left\lfloor \frac{\text{Valor do Atributo} - 10}{2} \right\rfloor$$

### Tabela de Referência Rápida:
| Atributo | Modificador | Atributo | Modificador |
| :------: | :---------: | :------: | :---------: |
|    6–7   |     -2      |   16–17  |     +3      |
|    8–9   |     -1      |   18–19  |     +4      |
|   10–11  |      0      |   20–21  |     +5      |
|   12–13  |     +1      |   22–23  |     +6      |
|   14–15  |     +2      |   24–25  |     +7      |

---

## 3. Matriz de Perícias

O sistema conta com **19 Perícias** distribuídas entre os atributos:

| Perícia | Atributo Base | Descrição de Aplicação |
| :--- | :---: | :--- |
| **Atletismo** | `FOR` | Escalar, saltar, nadar e esforços físicos extremos. |
| **Acrobacia** | `DES` | Equilíbrio em superfícies estreitas, cambalhotas e manobras ágeis. |
| **Furtividade** | `DES` | Mover-se em silêncio e esconder-se nas sombras. |
| **Prestidigitação** | `DES` | Bater carteiras, ocultar objetos e truques manuais rápidos. |
| **História** | `SAB` | Recordar eventos passados, lendas locais e dinastias. |
| **Investigação** | `SAB` | Procurar pistas escondidas, deduzir eventos em cenas. |
| **Sobrevivência** | `SAB` | Rastrear pegadas, caçar no ermo e prever o clima. |
| **Provocação** | `SAB` | Desestabilizar oponentes verbalmente em combate ou duelo. |
| **Animais** | `SAB` | Acalmar animais selvagens, adestrar montarias. |
| **Medicina** | `SAB` | Estabilizar feridos, diagnosticar venenos e tratar enfermidades. |
| **Intuição** | `ESP` | Sentir intenções ocultas, discernir mentiras e auras. |
| **Percepção** | `ESP` | Notar perigos iminentes, ouvir sons distantes. |
| **Atuação** | `ESP` | Encenações artísticas, canalização e presença de palco. |
| **Enganação** | `CAR` | Contar mentiras convincentes e disfarçar intenções. |
| **Intimidação** | `CAR` | Coagir através de ameaças físicas ou autoridade. |
| **Persuasão** | `CAR` | Negociar acordos diplomáticos e inspirar confiança. |
| **Arcanismo** | `INT` | Compreender teorias de magia, runas e artefatos. |
| **Religião** | `INT` | Conhecimento sobre divindades, ordens sagradas e ritos. |
| **Natureza** | `INT` | Identificar flora, fauna, minérios e fenômenos naturais. |

### Cálculo do Bônus Total da Perícia
$$\text{Total} = \text{Modificador do Atributo Base} + \text{Bônus Adicional} + (\text{Bônus de Treino se treinado})$$

---

## 4. Sistema de Rolagem de Dados Virtuais

### 4.1. Modos de Rolagem
1. **Rolagem Simples**:
   - Rola $1\text{d}20 + \text{bônus}$.
2. **Rolagem com Vantagem**:
   - Rola $2\text{d}20$, seleciona o valor mais alto ($\text{keep highest 1}$) e soma o bônus. Exibe o dado descartado visualmente riscado.
3. **Rolagem com Desvantagem**:
   - Rola $2\text{d}20$, seleciona o valor mais baixo ($\text{keep lowest 1}$) e soma o bônus. Exibe o dado descartado visualmente riscado.

### 4.2. Resultados Especiais (Críticos)
- **Crítico Natural (20 no d20 mantido)**: Sucesso estrondoso independente de modificadores.
- **Falha Crítica (1 no d20 mantido)**: Complicação grave ou revés catastrófico.

---

## 5. Módulos Auxiliares da Ficha

### 5.1. Economia
Sistema monetário de 4 denominações:
- **Latina (Platina)**: Moeda de maior valor, usada em transações nobres.
- **Ouro**: Padrão de comércio para itens de alto valor e armas refinadas.
- **Prata**: Moeda de circulação comum para estadias e suprimentos diários.
- **Cobre**: Troco menor para serviços básicos.

### 5.2. Cofre Bancário
- 80 slots individuais para armazenar tesouros, munições especiais e relíquias.
- Bloqueado por senha alfanumérica/numérica configurável pelo jogador.

### 5.3. Montaria
- Painel dedicado com nome da montaria, HP Atual, HP Máximo e notas sobre equipamento (arreios, alforjes).

### 5.4. Contratos
- Registro de missões aceitas, recompensas prometidas e indicador de conclusão.
