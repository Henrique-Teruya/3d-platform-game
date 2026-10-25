# BÍBLIA DE LEVEL DESIGN — FLOAT
**Documento Técnico:** LDB-001  
**Responsáveis:** Senior Level Designer & Technical Game Designer  
**Status:** Aprovado  
**Público-Alvo:** Level Designers, Artistas 3D e Agentes Autônomos de IA

---

## 1. Filosofia de Design: O Estado de Flow Monumental

O level design de **FLOAT** não se assemelha a obbies convencionais, simuladores militares de plataforma ou jogos de punição frustrante. Ele é fundado na união indivisível entre **três pilares**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OS TRÊS PILARES DE DESIGN                       │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. FLUIDEZ         │ 2. MONUMENTALISMO  │ 3. SOLIDÃO CONTEMPLATIVA     │
│    CINÉTICA        │    ARQUITETÔNICO   │    (NÃO-TERROR)              │
│ Aceleração, timing,│ Escalas colossais  │ Silêncio e calma meditativa. │
│ slide em rampa e   │ de 40m a 300m que  │ Queda sem punição sádica:    │
│ saltos em harmonia │ geram arrebatamento│ respawn instantâneo suave no │
│ e ritmo contínuo.  │ e sensação de      │ último checkpoint.           │
│                    │ pequenez sublime.  │                              │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### O que o Level Design NUNCA Deve Fazer:
1. **Obstáculos Cegos:** NUNCA force o jogador a frear bruscamente porque surgiu um pilar invisível ou uma fenda inesperada a 1 metro de distância.
2. **Saltos no Escuro (Blind Leaps):** NUNCA posicione um ponto de pouso abaixo de um horizonte sem fornecer pista visual prévia (facho de luz, viga guia ou silhueta recortada).
3. **Plataformas Flutuantes Arbitrárias:** NUNCA crie pequenas caixas sem contexto boiando no ar como em jogos genéricos de plataforma. Toda peça deve ter linguagem arquitetônica brutalista plausível (vigas em balanço, lajes com pilares de sustentação subterrâneos profundos ou ancoragem em grandes monólitos).
4. **Perda Desmedida de Progresso:** Um erro de timing deve custar no máximo 15 a 25 segundos de percurso, nunca o reinício da fase inteira.

---

## 2. Métricas Físicas Rígidas do Jogador

Todas as geometrias criadas devem derivar diretamente das capacidades cinemáticas do controlador ([PlayerController.ts](file:///c:/Users/henri/projects/jogo%20andre/src/game/movement/PlayerController.ts)) e das constantes de [movementConfig.ts](file:///c:/Users/henri/projects/jogo%20andre/src/config/movementConfig.ts):

### 2.1 Bounding Box e Escala
```
                    ┌──────────────────────┐
                    │ 1.80m Altura Total   │
                    │ (1.70m Olhos)        │
                    │                      │
                    │ 0.80m Largura (2xR)  │
                    └──────────┬───────────┘
                               │
       ◄───────────────────────┴───────────────────────►
        0.40m Raio de Colisão | 0.90m Altura em Slide
```

### 2.2 Velocidades do Controlador
- **Caminhada (`SPEED_WALK`):** $3.5\text{ m/s}$ (usado em micro-ajustes e bordas estreitas).
- **Corrida Normal (`SPEED_RUN`):** $7.5\text{ m/s}$ (velocidade de cruzeiro segura).
- **Sprint (`SPEED_SPRINT`):** $11.0\text{ m/s}$ (requer aprox. $15\text{ m}$ em linha reta).
- **Slide em Rampa ($30^\circ$) (`SPEED_SLIDE_MAX`):** $16.0\text{ m/s}$ a $18.0\text{ m/s}$ (conservação de momentum).
- **Air Strafe (`AIR_CAP_SPEED` / `ACCEL_AIR`):** $2.5\text{ m/s}$ de autoridade lateral no ar para correções finas de pouso.

### 2.3 Tabela Métrica de Saltos e Vãos Espaciais

| Ação Cinemática | Vão Mínimo | Vão Confortável (Iniciante) | Vão Máximo (Mestria) | Tolerância / Notas de Design |
| :--- | :---: | :---: | :---: | :--- |
| **Salto Parado** | $1.5\text{ m}$ | $2.5\text{ m}$ | $3.2\text{ m}$ | Para degraus imediatos ou respiros |
| **Salto em Corrida ($7.5\text{ m/s}$)** | $3.5\text{ m}$ | $5.5\text{ m}$ | $6.8\text{ m}$ | Vão padrão de progressão segura |
| **Salto em Sprint ($11.0\text{ m/s}$)** | $6.0\text{ m}$ | $8.5\text{ m}$ | $10.5\text{ m}$ | Exige pista reta limpa de pelo menos $15\text{ m}$ |
| **Salto Pós-Slide em Rampa $20^\circ-30^\circ$** | $12.0\text{ m}$ | $18.0\text{ m}$ | $23.0\text{ m} - 25.0\text{ m}$ | Travessia espetacular de abismos monumentais |
| **Wall Run Contínuo (Única Parede)** | $4.0\text{ m}$ | $8.0\text{ m}$ | $12.0\text{ m}$ | Limite de atrito da parede antes da queda vertical |
| **Wall Jump Horizontal (Repulsão)** | $3.0\text{ m}$ | $4.5\text{ m}$ | $6.5\text{ m}$ | Impulso perpendicular à parede $\times$ velocidade tangencial |
| **Wall Jump Vertical (Ganho de Altura)** | $2.0\text{ m}$ | $3.5\text{ m}$ | $4.5\text{ m}$ | Permite subir fendas em zigue-zague |
| **Degrau Vertical em Pulo Seco** | $0.8\text{ m}$ | $1.4\text{ m}$ | $1.8\text{ m}$ | Altura máxima de degrau sem auxílio de rampa |
| **Gabarito Livre em Pé (Passagem)** | $2.2\text{ m}$ | $3.0\text{ m}$ | Sem limite | Evita colisões indesejadas de cabeça em lintéis |
| **Gabarito de Fenda de Slide** | $1.15\text{ m}$ | $1.32\text{ m} - 1.35\text{ m}$ | $1.50\text{ m}$ | Abaixo de $1.15\text{ m}$ a cápsula ($0.9\text{ m}$) tranca se houver pitch |
| **Largura de Passarela (Segura)** | $3.0\text{ m}$ | $5.0\text{ m}$ | $10.0\text{ m}$ | Permite sprint sem medo de escorregar |
| **Largura de Viga Estreita (Tensão)** | $1.2\text{ m}$ | $1.6\text{ m}$ | $2.0\text{ m}$ | Rota avançada de alta velocidade |

---

## 3. Composição Visual e Leitura do Espaço (Sightlines)

O jogo prescinde de bússola, minimapa ou marcadores de realidade aumentada. O mundo guia o jogador através de **três regras de composição**:

### 3.1 A Regra dos Três Planos Visuais
```
[ PLANO DISTANTE (500m+) ]  ──► Monólitos colossais, gradiente do horizonte e bússola cardinal
            │
[ PLANO MÉDIO (50m - 150m) ] ──► Grande pórtico ou mirante de chegada do setor atual
            │
[ PRIMEIRO PLANO (0m - 30m) ] ──► Próxima plataforma, fita de luz guia e aresta de descolagem
```

### 3.2 A Regra da Fototaxia e Linhas de Fuga
- **Luz Solar Rasante:** Nas bifurcações de rota, a rota mais rápida e arriscada recebe um facho direto de sol na borda superior do concreto.
- **Linhas Guia Emissivas (`guideInlay`):** Trilhos embutidos no piso e nas paredes de wall run emitem brilho suave, indicando a trajetória ideal de aceleração.
- **Weenies Arquitetônicos:** Toda fase tem um marco colossal visível desde os primeiros 10 segundos, servindo como ponto focal inabalável de destino.

### 3.3 Superfícies de Perdão (+20% Rule)
Para saltos superiores a $12\text{ metros}$, a plataforma de aterrissagem deve ter no mínimo $20\%$ a mais de largura e comprimento que o arco parabólico teórico ideal, garantindo conforto aos jogadores com diferentes sensibilidades de mouse e hardware.

---

## 4. Filosofia de Rotas Duplas (Dual-Path System)

Para conciliar acessibilidade e alta mestria cinestésica, todo trecho a partir da Fase 02 deve oferecer duas camadas de percurso:

```
                          ┌───────────────────────────────┐
                          │     PONTO DE PARTIDA (PÁTIO)   │
                          └───────────────┬───────────────┘
                                          │
               ┌──────────────────────────┴──────────────────────────┐
               ▼                                                     ▼
      [ ROTA PRIMÁRIA (SEGURA) ]                            [ ROTA DE MOMENTUM (MESTRIA) ]
      - Lajes largas (5m a 8m)                              - Vigas estreitas (1.4m a 2.0m)
      - Saltos em corrida moderada (5m a 6m)                - Rampa 30° com slide a 18 m/s
      - Checkpoint intermediário seguro                     - Wall Run duplo consecutivo
      - Curva de aprendizado suave                          - Salto parabólico de 22m no abismo
      - Pacing tolerante                                    - 50% a 70% mais rápida
               │                                                     │
               └──────────────────────────┬──────────────────────────┘
                                          ▼
                          ┌───────────────────────────────┐
                          │   PORTAL OU MIRANTE DE SETOR  │
                          └───────────────────────────────┘
```

---

## 5. Pacing e Ritmo

### 5.1 O Loop de Micro-Pacing (30 a 60 Segundos)
1. **Leitura e Antecipação (5–10s):** Pátio largo com vista limpa dos próximos obstáculos.
2. **Engajamento Cinético (15–20s):** Sprint $\rightarrow$ slide em declive $\rightarrow$ aceleração audível do vento.
3. **Pico de Tensão Acrobática (5–8s):** Salto longo sobre o vazio mais profundo ou wall run consecutivo com timing preciso.
4. **Alívio e Contemplação (10–15s):** Pouso em terraço estável, som do vento se acalma, abertura para contemplação panorâmica.

### 5.2 O Macro-Pacing das Dez Fases
A tensão progride de forma orgânica ao longo da jornada:
- **Fases 01 a 03 (Fundação):** Apresentação, cadência, familiarização com concreto claro e primeiros slides/wall runs.
- **Fases 04 a 06 (Fragmentação & Verticalidade):** Ruptura geométrica, plataformas móveis e saltos aéreos amplos.
- **Fases 07 a 08 (Abstração & Concentração):** Geometrias surreais, abismos profundos e exigência de momentum rigoroso.
- **Fases 09 a 10 (Transcendência):** Síntese mecânica de subida e chegada à luz etérea do infinito.

---

## 6. Regras de Checkpoints e Respawn

1. **Posicionamento:** Todo checkpoint deve ser colocado em uma plataforma ampla ($\ge 6\text{ m} \times 6\text{ m}$), livre de declives ou colisores baixos.
2. **Orientação:** A propriedade `spawnYawDeg` deve apontar exatamente para o eixo focal do próximo desafio, evitando que o jogador ressurge olhando para trás ou para uma parede.
3. **Frequência:** Em trechos de alta dificuldade mecânica (ex: wall jump em fenda alta), o checkpoint deve estar a no máximo $15\text{ segundos}$ do obstáculo anterior.
4. **Altar Luminoso:** O checkpoint possui representação física ([CheckpointSystem.ts](file:///c:/Users/henri/projects/jogo%20andre/src/game/checkpoints/CheckpointSystem.ts)) com octaedro giratório que transita de âmbar inativo para ciano brilhante ao ser cruzado.
