# Memória — mecanica-dados-rpg

## Estado
Agente criado para motor, histórico e apresentação de dados.

## Decisões
A animação consome o resultado real, suporta vantagem/desvantagem e respeita `prefers-reduced-motion`. O `DiceContext` controla o ciclo visual.

## Trabalho realizado
- `rollDice` agora aceita uma fonte `random` injetável, normaliza lados/quantidade e mantém IDs estruturados sem consumir a sequência aleatória do resultado.
- `DiceContext.executeRoll` encaminha `count` (corrigindo rolagens múltiplas na bandeja) e encurta o ciclo visual quando `prefers-reduced-motion` está ativo.
- Modal usa semântica de diálogo, rótulos acessíveis e a animação exibe apenas os valores presentes no resultado real.
- A animação mantém o giro 3D do dado e reduz a transformação para usuários que preferem menos movimento.

## Pendência
Testes automatizados de ciclo React/DOM e acessibilidade continuam pendentes até haver infraestrutura de testes de UI; o motor segue coberto pelo teste direcionado existente.
