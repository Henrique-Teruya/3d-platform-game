# CURVA DE DIFICULDADE MULTIDIMENSIONAL — FLOAT
**Documento Técnico:** LDC-001  
**Status:** Aprovado  
**Público-Alvo:** Level Designers, Balanceadores de Gameplay e Agentes de IA

---

## 1. Princípios de Calibração da Dificuldade

A curva de dificuldade de FLOAT rejeita o aumento cego e linear de punição. O jogo nunca deve se tornar um teste de tortura milimétrica (*pixel-hunting*). O desafio cresce através de **especialização rítmica e cognitiva**:

- **Variação por Fase:** Fases de alta velocidade (como a Fase 03) não exigem pousos em agulhas milimétricas; fases de precisão geométrica (como a Fase 04) moderam a velocidade exigida.
- **A Fase 10 (The Beyond):** Não é a mais punitiva; é a consagração do estado de *flow*, priorizando cadência e serenidade sobre reflexos brutais.

---

## 2. Critérios Objetivos da Escala de 1 a 10

| Nível | Precisão de Pouso | Velocidade de Entrada | Controle Aéreo | Punição de Erro (Checkpoints) |
| :-: | :--- | :--- | :--- | :--- |
| **1–2** | Lajes largas ($\ge 8\text{ m}$ de largura) | Corrida padrão ($7.5\text{ m/s}$) | Praticamente nulo; saltos em linha reta | Checkpoint a menos de $10\text{ s}$ de distância |
| **3–4** | Plataformas moderadas ($5\text{ m}$ a $6\text{ m}$) | Sprint moderado ($9\text{ m/s}$) | Correções leves de $0.5\text{ m}$ no ar | Checkpoint a cada $15\text{ s}$ de percurso |
| **5–6** | Vigas e degraus de $3\text{ m}$ a $4\text{ m}$ | Sprint pleno ($11\text{ m/s}$) | Curva moderada em torno de pilares | Retorno de no máximo $18\text{ s}$ de progresso |
| **7–8** | Lajes de $2\text{ m} \times 2\text{ m}$ ou vigas de $1.4\text{ m}$ | Slide em rampa ($16\text{ m/s}$) | Air strafe exigido para alinhar no pilar | Checkpoint após cada sequência chave |
| **9–10** | Micro-plataformas ou pouso em movimento | Velocidade terminal ($18\text{ m/s}$) | Ajuste fino contínuo com mouse e `A/D` | Desafio culminante com checkpoint justo |

---

## 3. Matriz Comparativa das Dez Fases

Abaixo está o mapeamento dos 8 vetores de desafio avaliados de 1 a 10 para cada fase do jogo:

```
VETORES AVALIADOS:
1. PREC: Precision (Tolerância e tamanho da plataforma de pouso)
2. SPED: Speed (Velocidade média imposta pelo percurso)
3. MOMT: Momentum (Exigência de encadeamento sem desacelerar)
4. VERT: Verticality (Variação de altura, desfiladeiros e poços verticais)
5. AIRC: Air Control (Necessidade de strafe aéreo e ajuste no voo)
6. NAVI: Navigation (Complexidade de leitura visual e escolha de rota)
7. COMP: Mechanical Complexity (Número de mecânicas encadeadas em sequência)
8. PUNI: Failure Punishment (Distância temporal perdida ao cair no abismo)
```

| Fase | Nome | PREC | SPED | MOMT | VERT | AIRC | NAVI | COMP | PUNI | Média Geral | Perfil de Desafio |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| **01** | The Awakening | 2 | 3 | 2 | 2 | 1 | 1 | 2 | 1 | **1.75** | Familiarização e tutorial orgânico |
| **02** | The Passage | 3 | 5 | 4 | 3 | 2 | 2 | 3 | 2 | **3.00** | Cadência, pontes e primeiro wall run |
| **03** | The Monoliths | 4 | 7 | 7 | 4 | 3 | 3 | 5 | 3 | **4.50** | Aceleração em rampa e momentum |
| **04** | The Fracture | 6 | 4 | 5 | 5 | 5 | 6 | 5 | 4 | **5.00** | Precisão em lajes rompidas e dual-path |
| **05** | The Atrium | 5 | 5 | 6 | 8 | 5 | 5 | 6 | 4 | **5.50** | Verticalidade pura e wall jumps em poço |
| **06** | The Suspended | 6 | 6 | 6 | 6 | 6 | 5 | 7 | 5 | **6.00** | Temporização em plataformas móveis |
| **07** | The Inversion | 7 | 6 | 7 | 7 | 7 | 8 | 7 | 5 | **6.75** | Leitura espacial e geometria paradoxal |
| **08** | The Abyss | 8 | 8 | 9 | 8 | 8 | 6 | 8 | 6 | **7.62** | Tensão de abismo profundo e saltos épicos |
| **09** | The Ascension | 8 | 8 | 9 | 9 | 8 | 7 | 9 | 6 | **8.00** | Clímax acrobático: integração de todas as artes |
| **10** | The Beyond | 6 | 7 | 7 | 6 | 6 | 5 | 6 | 3 | **5.87** | Síntese harmônica, contemplação e flow |

---

## 4. Análise Gráfica dos Picos de Desafio

```
Nível de Desafio
  10 │
   9 │                                                     [Fase 09: Complexidade 9/10]
   8 │                                            [Fase 08: Momentum 9/10]
   7 │                              [Fase 07: Leitura 8/10]
   6 │                    [Fase 05: Vertical 8/10]
   5 │          [Fase 03: Velocidade 7/10]                 [Fase 10: Flow 6/10 (Relaxamento)]
   4 │
   3 │    [Fase 02]
   2 │  [Fase 01]
   1 └─────────────────────────────────────────────────────────────────────────────► Fases
        01      02      03      04      05      06      07      08      09      10
```

### Regras Vitais de Balanceamento:
1. **Nunca Empilhar Picos Simultâneos:** Se a Fase 05 atinge $8/10$ em Verticalidade, a Velocidade deve ser moderada para $5/10$.
2. **Punição Limitada:** O vetor `PUNI` nunca ultrapassa $6/10$, garantindo que nenhuma queda force o jogador a repetir mais de 25 segundos de percurso bem-sucedido.
3. **Respiro na Fase 10:** A fase de encerramento abaixa propositalmente a exigência de reflexos milimétricos para permitir que o jogador aprecie a luz radiante e o eco sonoro do final da jornada.
