# LEVEL DESIGN: BIOMAS ARQUITETÔNICOS E ZONAS DE PROGRESSÃO
**Documento:** LVL-DOC-002  
**Responsáveis:** Lead Level Designer & 3D Environment Artist  
**Status:** Aprovado

---

## 1. Visão Geral da Progressão Espacial

O percurso do jogo é estruturado em quatro zonas arquitetônicas sequenciais, cada uma introduzindo novos desafios cinéticos e variações de escala, culminando em uma experiência de mestria motora e êxtase contemplativo.

```
┌─────────────────────────┐      ┌─────────────────────────┐
│ ZONA 1: BACIA MONOLÍTICA│ ───► │ ZONA 2: A COLUNATA      │
│ Introdução, Calma,      │      │ Ritmo Cadenciado,       │
│ Saltos Seguros & Slide  │      │ Wall Runs & Altura      │
└─────────────────────────┘      └───────────┬─────────────┘
                                             │
                                             ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│ ZONA 4: O GRANDE ABISMO │ ◄─── │ ZONA 3: OS TERRAÇOS     │
│ Maestria de Momentum,   │      │ Rampas Ciclópicas,      │
│ Saltos Épicos no Vazio  │      │ Slides Rápidos & Vãos   │
└─────────────────────────┘      └─────────────────────────┘
```

---

## 2. Detalhamento das Quatro Zonas

### Zona 1: A Bacia dos Monólitos (*The Monolith Basin*)
- **Paleta e Atmosfera:** *Limestone Dawn*. Luz dourada matinal, sombras longas, névoa prateada a meia altura.
- **Identidade Arquitetônica:** Grandes blocos retangulares de concreto espalhados sobre uma planície de calcário branco. Monólitos de 40m a 80m de altura cravados na rocha.
- **Foco de Gameplay (Tutorial Orgânico):**
  - **Fase 1A:** Andar e correr entre fendas para acostumar com a sensibilidade do mouse e a velocidade de sprint.
  - **Fase 1B:** Saltos curtos ($4\text{ m}$ a $5.5\text{ m}$) entre blocos elevados com chão sólido embaixo (queda segura sem morte).
  - **Fase 1C:** Primeiro declive com viga baixa, introduzindo o Slide sob uma abertura monolítica de $1.2\text{ m}$ de altura.
- **Momento Marcante:** Ao atravessar o último arco da bacia, o chão sólido desaparece abruptamente e revela o horizonte infinito com estruturas suspensas no abismo.

---

### Zona 2: A Colunata Infinita (*The Endless Colonnade*)
- **Paleta e Atmosfera:** *Basalt Meridian*. Contraste de basalto escuro com sol brilhante. Névoa azulada distante.
- **Identidade Arquitetônica:** Fileiras colossais de pilares cilíndricos e vigas de sustentação com 120m de altura, estendendo-se em linha reta até o infinito.
- **Foco de Gameplay:**
  - **Ritmo e Cadência:** Saltos espaçados uniformemente ($6.5\text{ m}$) sobre o topo de pilares quadrados.
  - **Introdução ao Wall Run:** Paredes longas de basalto polido margeando vãos abertos, exigindo que o jogador corra pela lateral e salte para a plataforma seguinte.
  - **Wall Jump em Fenda:** Duas paredes monolíticas paralelas separadas por $3.5\text{ m}$, exigindo saltos alternados em zigue-zague para subir $12\text{ m}$ de altura.
- **Momento Marcante:** Correr por 8 segundos contínuos em uma sequência perfeitamente sincronizada de wall run -> pilar -> wall run com vento assobiando alto nos fones.

---

### Zona 3: Os Terraços Suspensos (*The Suspended Terraces*)
- **Paleta e Atmosfera:** *Sand & Monoliths*. Luz ocre quente, poeira suspensa brilhando contra o sol.
- **Identidade Arquitetônica:** Gigantescas lajes escalonadas de concreto bruto, pontes em declive de $30^\circ$ e arcos estruturais que descem centenas de metros.
- **Foco de Gameplay:**
  - **Slide em Alta Velocidade:** Rampas de 40 metros de extensão em declive. O jogador entra em slide, atinge $18\text{ m/s}$ e salta no último metro da rampa sobre um abismo monumental.
  - **Conservação de Momentum:** Conectar a aterrissagem veloz do primeiro salto em um segundo slide consecutivo para transpor vãos de até $22\text{ metros}$.
  - **Rotas Verticais:** O jogador pode escolher descer pelos terraços largos (rota segura) ou se arriscar pelos trilhos de viga estreita (rota rápida).
- **Momento Marcante:** Um salto gigantesco de 25 metros de distância em arco parabólico sobre uma falha tectônica com a câmera abrindo o FOV ao máximo.

---

### Zona 4: O Grande Abismo (*The Great Void / The Chasm*)
- **Paleta e Atmosfera:** *Violet Dusk*. Silhuetas escuras colossais recortadas contra o horizonte alaranjado e violeta. Mar de névoa densa a 200m abaixo.
- **Identidade Arquitetônica:** Estruturas fragmentadas, monólitos solitários e arcos ciclópicos sem apoio aparente, suspensos no ar estático.
- **Foco de Gameplay (Mestria Acrobática):**
  - Integração total de todas as mecânicas: Sprint -> Slide na rampa -> Salto longo -> Wall Run de 10m -> Wall Jump com repulsão -> Aterrissagem precisa em pilar estreito de $2\text{ m} \times 2\text{ m}$.
  - Janelas rigorosas de timing com amortecimento recompensador.
  - Checkpoints generosos para não gerar frustração na fase de maior virtuosismo.
- **Momento Marcante (O Mirante Final):** O jogador alcança o topo do maior monólito do mundo ($300\text{ m}$ de altura). O som do vento se acalma, o silêncio se instala, e uma nota pura e ressonante de sintetizador ecoa enquanto a vista revela todas as estruturas percorridas para trás, estendendo-se pela névoa.
