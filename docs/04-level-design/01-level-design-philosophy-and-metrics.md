# LEVEL DESIGN: FILOSOFIA DE DESIGN E MÉTRICAS ESPACIAIS
**Documento:** LVL-DOC-001  
**Responsáveis:** Lead Level Designer & Senior Game Designer  
**Status:** Aprovado

---

## 1. Filosofia de Level Design: Fluxo e Monumentalidade

O level design deste projeto não cria labirintos fechados ou corredores claustrofóbicos. Ele cria **vistas monumentais, arcos de progressão rítmica e espaços que respiram**.

O parkour deve privilegiar a **fluidez contínua**:
- Evitar obstáculos súbitos e cegos que obriguem o jogador a frear abruptamente a cada 3 segundos.
- Cada percurso é uma composição musical: tem momentos de aceleração rápida (rampas e slides), momentos de pico de tensão e salto acrobático (abismos e wall runs) e momentos de desaceleração e alívio contemplativo (platôs panorâmicos).

```
  [ DECLIVE / SLIDE ] ────► [ WALL RUN ] ────► [ SALTO MONUMENTAL ] ────► [ PLATÔ DE ALÍVIO ]
     Aceleração                Ritmo               Pico de Tensão              Contemplação
      (Tensão +)            (Tensão ++)             (Tensão +++)                 (Relaxamento)
```

---

## 2. Métricas Rígidas do Jogador (Player Scale Metrics)

Para que qualquer designer ou agente de IA monte blocos sem quebras de jogabilidade, todas as geometrias do mundo respeitam a tabela métrica abaixo:

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

### 2.1 Tabela de Métricas Espaciais e Distâncias de Salto

| Ação do Jogador | Distância Horizontal Mínima | Distância Confortável (Iniciante) | Distância Máxima (Timing Preciso) | Observações de Design |
| :--- | :---: | :---: | :---: | :--- |
| **Salto Parado (Standing Jump)** | $1.5\text{ m}$ | $2.5\text{ m}$ | $3.2\text{ m}$ | Usado em micro-ajustes entre plataformas vizinhas. |
| **Salto em Corrida ($7.5\text{ m/s}$)** | $3.5\text{ m}$ | $5.5\text{ m}$ | $6.8\text{ m}$ | Vão padrão de progressão segura do mapa. |
| **Salto em Sprint ($11.0\text{ m/s}$)** | $6.0\text{ m}$ | $8.5\text{ m}$ | $10.5\text{ m}$ | Exige aproximação desimpedida de pelo menos 15 metros. |
| **Salto Pós-Slide em Rampa ($16.0\text{ m/s}$)**| $12.0\text{ m}$ | $18.0\text{ m}$ | $23.0\text{ m}$ | Recompensa de rotas de momentum em grandes abismos. |
| **Wall Run Contínuo** | $4.0\text{ m}$ | $8.0\text{ m}$ | $12.0\text{ m}$ | Comprimento ideal da parede antes de exigir wall jump. |
| **Subida Máxima de Salto Vertical**| $1.2\text{ m}$ | $1.6\text{ m}$ | $1.8\text{ m}$ | Altura de degrau ou mureta transponível com pulo seco. |
| **Gabarito Mínimo de Passagem em Pé**| $2.2\text{ m}$ | $3.0\text{ m}$ | Sem limite | Altura livre mínima sob vigas e tetos para evitar colisão de cabeça. |
| **Gabarito de Fenda de Slide** | $1.1\text{ m}$ | $1.3\text{ m}$ | $1.5\text{ m}$ | Altura de fendas estruturais transponíveis apenas deslizando. |
| **Largura Mínima de Passarela Confortável**| $1.2\text{ m}$ | $2.5\text{ m}$ | $5.0\text{ m}$ | Menos de 1.2m gera frustração; 2.5m permite alta velocidade com segurança. |

---

## 3. Diretrizes de Composição e Linhas de Visão (Sightlines)

1. **A Regra dos Três Planos Visuais:**
   - **Primeiro Plano (Foreground):** A plataforma atual e os próximos 2 obstáculos imediatos (ultra-nítidos, luz direta, textura tátil).
   - **Plano Médio (Midground):** A estrutura colossal que ancora o setor atual (ex: um portal de 80m de altura) onde o jogador chegará em 1 a 2 minutos.
   - **Plano Distante (Background):** A silhueta de monólitos colossais a 500m envoltos em névoa, orientando o eixo cardinal de progressão geral.

2. **Prevenção do Pulo Cego (No Blind Leaps):**
   - NUNCA posicionar uma plataforma de aterrissagem abaixo de uma aresta sem que o jogador consiga ver sua superfície ou sua silhueta projetada antes de pular.
   - Onde houver declive acentuado, usar vigas verticais ou iluminação solar destacando a área segura de pouso.

3. **Superfícies de Perdão (Forgiving Margins):**
   - As bordas de plataformas de aterrissagem de longa distância devem ser pelo menos $20\%$ mais largas que a área mínima calculada, respeitando variações de timing de jogadores com mouses diferentes.
