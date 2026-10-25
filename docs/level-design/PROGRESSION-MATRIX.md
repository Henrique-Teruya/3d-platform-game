# MATRIZ DE PROGRESSÃO DAS DEZ FASES — FLOAT
**Documento Técnico:** LPM-001  
**Status:** Aprovado  
**Referência:** Integração das fases originais (01, 02, 03) na nova macro-jornada (01 a 10).

---

## 1. Visão Geral da Jornada em Quatro Movimentos

A progressão de FLOAT foi desenhada como uma sinfonia em quatro atos arquitetônicos e emocionais, partindo da estabilidade geométrica acolhedora até a abstração pura do infinito:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OS QUATRO ATOS DE PROGRESSÃO                    │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ ATO I: FUNDAÇÃO    │ ATO II: RUPTURA    │ ATO III: O VAZIO             │
│ (Fases 01 a 03)    │ (Fases 04 a 06)    │ (Fases 07 a 08)              │
│ Concreto claro,    │ Fendas tectônicas, │ Silhuetas surreais,          │
│ pontes contínuas,  │ lajes rompidas,    │ abismo sem chão visível,     │
│ ritmo e momentum.  │ verticalidade e    │ saltos de 22m e rigor        │
│                    │ plataformas móveis.│ de timing acrobático.        │
├────────────────────┴────────────────────┴──────────────────────────────┤
│ ATO IV: TRANSCENDÊNCIA (Fases 09 e 10)                                 │
│ A grande escalada em direção ao crepúsculo e a luz pura do infinito.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz Mestra das 10 Fases

| # | ID | Nome Oficial | Bioma & Luz | Arquitetura Dominante | Foco Mecânico Principal | Mecânica Nova Introduzida | Par Time |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| **01** | `level-01` | **The Awakening** | *Limestone Dawn* (Ocre/Âmbar) | Pátios e lajes sólidas de calcário | Introdução ao movimento, sprint e primeiro slide | Andar, Correr, Sprint, Salto Básico, Slide em fenda | $32\text{ s}$ |
| **02** | `level-02` | **The Passage** | *Basalt Meridian* (Azul/Grafite) | Longos corredores e pontes colossais | Cadência rítmica e conservação de linha reta | Introdução ao Wall Run em painel único longo ($15\text{ m}$) | $38\text{ s}$ |
| **03** | `level-03` | **The Monoliths** | *Sand & Monoliths* (Dourado/Areia) | Floresta de colunas ciclópicas e calhas | Exploração de velocidade e aceleração em declive | Slide em rampa íngreme ($22^\circ$) atingindo $16\text{ m/s}$ | $42\text{ s}$ |
| **04** | `level-04` | **The Fracture** | *Raw Concrete Twilight* (Cinza/Bronze) | Lajes tectônicas partidas e fendas | Decisão de rotas e precisão em superfícies finas | Dual-path estrito (Rota segura vs Viga de $1.4\text{ m}$) | $46\text{ s}$ |
| **05** | `level-05` | **The Atrium** | *Zenith Void* (Luz zenital cortante) | Galeria interna monumental de 80m de altura | Verticalidade e ritmo ascendente | Wall Jump em zigue-zague entre paredes paralelas ($3.5\text{ m}$) | $50\text{ s}$ |
| **06** | `level-06` | **The Suspended** | *Ocher Meridian* (Terraço flutuante) | Lajes em balanço estático sobre o abismo | Temporização de saltos em elementos dinâmicos | Plataformas móveis cinemáticas com inércia de salto | $54\text{ s}$ |
| **07** | `level-07` | **The Inversion** | *Slate Horizon* (Ardósia/Monocromo) | Arcos e monólitos com rotações surreais | Leitura espacial avançada em geometria paradoxal | Transição de Wall Run para Slide Chute em ângulo | $58\text{ s}$ |
| **08** | `level-08` | **The Abyss** | *Deep Cobalt Fog* (Mar de névoa escura) | Monólitos isolados de $2\text{ m} \times 2\text{ m}$ no vazio | Foco cirúrgico e saltos de momentum no vácuo | Salto épico pós-slide ($23\text{ m}$ a $25\text{ m}$) sem margem | $62\text{ s}$ |
| **09** | `level-09` | **The Ascension** | *Violet Ecliptic Dusk* (Púrpura/Laranja) | Pináculo espiral ascendente rumo ao céu | Integração acrobática de todas as mecânicas | Cadeias completas: Sprint $\rightarrow$ Slide $\rightarrow$ Pulo $\rightarrow$ Wall $\rightarrow$ MP | $68\text{ s}$ |
| **10** | `level-10` | **The Beyond** | *Radiant Infinity* (Branco/Ouro Etéreo) | Geometrias puras e minimalistas radiantes | Maestria meditativa, fluidez contínua e apoteose | Síntese de flow puro com saltos cadenciados até a luz | $75\text{ s}$ |

---

## 3. Relação e Compatibilidade com as 3 Fases Existentes

Para que o projeto preserve compatibilidade total com o código já testado e verificado:
1. **Fase 01 original (`LEVEL_01_AWAKENING`):** Mantida como o ponto de partida canônico do jogo (`Level 01 — The Awakening`).
2. **Fase 02 original (`LEVEL_02_MONOLITHS`):** Foi reorganizada e alinhada com a Fase 03 (`The Monoliths`), abrindo espaço para a Fase 02 (`The Passage`), que atua como a ponte perfeita de ensino de Wall Run antes dos desfiladeiros mais desafiadores.
3. **Fase 03 original (`LEVEL_03_ASCENSION`):** Mantida como o clímax da escalada mecânica na Fase 09 (`The Ascension`), permitindo que as fases intermediárias (04 a 08) introduzam a riqueza dos terraços suspensos, átrios e abismos descritos na documentação teórica original, culminando na transcendência da Fase 10 (`The Beyond`).

---

## 4. Evolução das Habilidades Exigidas do Jogador

```
Habilidade
  ▲
  │                                                                 [ 10. The Beyond ]
  │                                                                /   (Síntese Serena)
  │                                           [ 09. Ascension ]   /
  │                                          /   (Pico Acrobático)
  │                               [ 08. Abyss ]
  │                              /   (Precisão no Vazio)
  │                    [ 07. Inversion ]
  │                   /   (Desorientação)
  │        [ 05. Atrium ]
  │       /   (Verticalidade)
  │  [ 03. Monoliths ]
  │ /   (Momentum)
  │/
  └────────────────────────────────────────────────────────────────────────► Fase
    01       02       03       04       05       06       07       08       09       10
```
