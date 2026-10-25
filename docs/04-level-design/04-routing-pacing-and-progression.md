# LEVEL DESIGN: ROTAS, PACING E PROGRESSÃO DE HABILIDADE
**Documento:** LVL-DOC-004  
**Responsáveis:** Senior Game Designer & Lead Level Designer  
**Status:** Aprovado

---

## 1. O Conceito de Rotas Duplas (Dual-Path Philosophy)

Para evitar que jogadores casuais abandonem o jogo por frustração e, simultaneamente, garantir que jogadores experientes sintam profundo prazer mecânico ao dominar os sistemas, cada seção do jogo é projetada com **duas camadas de rota entrelaçadas**:

```
                       ┌───────────────────────────────┐
                       │     PONTO DE PARTIDA (PÁTIO)   │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
   [ ROTA PRIMÁRIA (SEGURA) ]                            [ ROTA DE MOMENTUM (MESTRIA) ]
   - Plataformas largas (4m a 8m)                        - Viga estreita -> Slide em rampa 30°
   - Saltos em velocidade normal (5m a 7m)               - Wall Run consecutivo sem tocar solo
   - Checkpoints frequentes                              - Salto parabólico de 20m sobre o abismo
   - Ritmo pausado e tolerante                           - 60% mais rápido, adrenalina alta
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │    DESTINO (MIRANTE / PORTAL) │
                       └───────────────────────────────┘
```

---

## 2. Pacing do Level Design (Micro e Macro Pacing)

### 2.1 Micro-Pacing (O Loop de 30 a 60 Segundos)
Dentro de cada sub-seção de percurso, o jogador experimenta uma onda rítmica de energia cinética:

1. **Aproximação e Leitura (5 a 10s):** Corrida em terreno amplo enquanto o jogador observa a disposição dos próximos obstáculos e antecipa sua trajetória.
2. **Aceleração e Engajamento (10 a 20s):** Encadeamento de sprint, descida de rampa em slide, salto no timing e transição para a parede.
3. **Pico Acrobático (5s):** O salto mais arriscado sobre o vazio mais profundo do trecho, onde o jogador precisa confiar no vetor de velocidade acumulado.
4. **Respiro e Recompensa (5 a 10s):** Pouso em plataforma ampla e estável, amortecimento suave de câmera, diminuição do som de vento e contemplação da vista.

### 2.2 Macro-Pacing (A Jornada Completa)
A progressão global do jogo modula o nível de tensão ao longo das 4 zonas arquitetônicas:

```
Tensão
  ▲
  │                                                      [ ZONA 4: PICO ]
  │                                                     /   (Maestria Absoluta)
  │                                     [ ZONA 3 ]     /
  │                      [ ZONA 2 ]    / (Rampas,     /
  │                     / (Wall Run,  /   Slides 18m/s)
  │      [ ZONA 1 ]    /   Ritmo)    /
  │     / (Tutorial,  /
  │    /   Bacia)    /
  │   /             /
  └──┴─────────────┴─────────────────┴──────────────┴────────────────────────► Tempo
```

---

## 3. Elementos de Orientação e Psicologia Espacial

Em um mundo sem setas de néon ou minimapa, o cenário conduz o olhar e a intenção do jogador através de princípios consagrados de arquitetura e game design:

1. **Atração pela Luz (Phototaxis Positiva):** Em qualquer bifurcação ou encruzilhada, a rota avançada de alta velocidade é destacada por um facho de sol rasante na face superior do concreto.
2. **Weenies Arquitetônicos (Marcos Visuais Monumentais):** Grandes monólitos de 150m e arcos ciclopeos funcionam como bússolas visuais. O jogador sempre sabe para onde está avançando simplesmente observando a orientação das grandes colunas.
3. **Linhas de Fuga Horizontais:** Vigas suspensas e cabos de concreto estendidos apontam fisicamente na direção do próximo salto seguro.
4. **Acústica Direcional:** O ruído suave de um vento canalizado entre dois monólitos indica naturalmente a presença de uma fenda transitável por wall jump.
