# LEVEL DESIGN: KIT MODULAR BRUTALISTA & PADRÕES DE GREYBOXING
**Documento:** LVL-DOC-003  
**Responsáveis:** 3D Environment Artist & Technical Game Designer  
**Status:** Aprovado para Modelagem e Prototipagem

---

## 1. Princípios do Grid Métrico Modular

Para permitir montagem rápida de níveis tanto por level designers quanto por scripts procedurais e agentes de IA, todas as peças modulares são modeladas estritamente em um **grid cúbico métrico de potências de base 2 e múltiplos de 4 metros**:

$$\text{Grid Units} \in \{ 1.0\text{ m}, \ 2.0\text{ m}, \ 4.0\text{ m}, \ 8.0\text{ m}, \ 16.0\text{ m}, \ 32.0\text{ m}, \ 64.0\text{ m} \}$$

- **Origem do Pivot:** Sempre alinhado na base inferior central ou no canto inferior esquerdo inferior do bounding box, facilitando snap de vértices exato em 3D.
- **UV Mapping:** World-space UVs ou triplanar mapping procedural para texturas de concreto, garantindo que mesmo ao esticar ou duplicar peças não haja distorção ou emendas visíveis.

```
                  ┌──────────────────────────────────────────────┐
                  │          PEÇAS MODULARES PRINCIPAIS          │
                  ├───────────────────────────────┬──────────────┤
                  │ 1. Plataformas e Lajes        │ (4m, 8m, 16m)│
                  │ 2. Monólitos e Pilares        │ (32m, 64m)   │
                  │ 3. Rampas de Slide            │ (15°, 30°)   │
                  │ 4. Paredes de Wall Run        │ (8m x 16m)   │
                  │ 5. Arcos e Pórticos           │ (16m x 32m)  │
                  └───────────────────────────────┴──────────────┘
```

---

## 2. Catálogo de Peças do Kit Modular

### 2.1 Pisos e Plataformas (Platforms & Slabs)

| ID da Peça | Nome Técnico | Dimensões (X × Y × Z) | Uso no Level Design |
| :--- | :--- | :---: | :--- |
| `MOD_SLAB_04x04` | Laje Quadrada Média | $4.0\text{ m} \times 1.0\text{ m} \times 4.0\text{ m}$ | Plataforma de aterrissagem básica em percursos pontuais. |
| `MOD_SLAB_08x08` | Laje Grande Segura | $8.0\text{ m} \times 2.0\text{ m} \times 8.0\text{ m}$ | Áreas de respiro e checkpoints intermediários. |
| `MOD_SLAB_16x32` | Pátio Monumental | $16.0\text{ m} \times 2.0\text{ m} \times 32.0\text{ m}$ | Áreas de partida de sprint longo e mirantes. |
| `MOD_BEAM_02x16` | Viga Estreita de Precisão | $2.0\text{ m} \times 1.0\text{ m} \times 16.0\text{ m}$ | Passarela de alta tensão sobre o abismo. |

### 2.2 Pilares e Monólitos Verticais (Monoliths & Columns)

| ID da Peça | Nome Técnico | Dimensões (X × Y × Z) | Uso no Level Design |
| :--- | :--- | :---: | :--- |
| `MOD_COL_CYL_04x32` | Coluna Cilíndrica | $\varnothing 4.0\text{ m} \times 32.0\text{ m}$ | Formação da Colunata Infinita (Zona 2). |
| `MOD_MONO_08x64` | Monólito Retangular | $8.0\text{ m} \times 64.0\text{ m} \times 8.0\text{ m}$ | Elemento de silhueta vertical e salto de topo em topo. |
| `MOD_MONO_GIANT_16x128` | Monólito Ciclópico | $16.0\text{ m} \times 128.0\text{ m} \times 16.0\text{ m}$ | Marco de navegação distante e parede de wall run longo. |

### 2.3 Rampas e Declives de Slide (Slopes)

| ID da Peça | Nome Técnico | Dimensões (X × Y × Z) | Ângulo | Efeito na Velocidade |
| :--- | :--- | :---: | :---: | :--- |
| `MOD_RAMP_15DEG` | Rampa Suave de Aceleração | $8.0\text{ m} \times 4.0\text{ m} \times 15.0\text{ m}$ | $15^\circ$ | Aceleração gradual em slide até $13\text{ m/s}$. |
| `MOD_RAMP_30DEG` | Rampa Íngreme de Alta Velocidade | $8.0\text{ m} \times 8.0\text{ m} \times 14.0\text{ m}$ | $30^\circ$ | Aceleração explosiva até $18\text{ m/s}$ (preparação de salto épico). |
| `MOD_RAMP_CURVE` | Rampa de Transição Curva | $8.0\text{ m} \times 3.0\text{ m} \times 8.0\text{ m}$ | Curva côncava | Suaviza a transição entre solo plano e rampa descendente. |

### 2.4 Superfícies de Parede (Wall Run Panels)

| ID da Peça | Nome Técnico | Dimensões (X × Y × Z) | Observações |
| :--- | :--- | :---: | :--- |
| `MOD_WALL_RUN_08x16` | Painel de Parede Padrão | $0.8\text{ m} \times 8.0\text{ m} \times 16.0\text{ m}$ | Superfície vertical polida com textura de atrito direcional. |
| `MOD_WALL_RUN_08x32` | Painel de Parede Estendido | $0.8\text{ m} \times 12.0\text{ m} \times 32.0\text{ m}$ | Usado em grandes travessias de abismo com múltiplos saltos. |

---

## 3. Diretrizes de Greyboxing (Blocagem Rápida)

Durante a fase de prototipagem e testes de colisão cinemática, os níveis são construídos exclusivamente com materiais de greybox padrão:

1. **Grid Texture de Calibração:** Textura cinza neutra com quadriculado de $1\text{ metro}$ e linhas mais grossas a cada $4\text{ metros}$ e $8\text{ metros}$, permitindo ler instantaneamente as distâncias com a visão do jogador.
2. **Cores Funcionais de Prototipagem:**
   - **Cinza Médio (`#808080`):** Terreno estável e plataformas neutras.
   - **Laranja Suave (`#D9822B`):** Superfícies de alta velocidade e rampas de slide.
   - **Azul Aço (`#4A6FA5`):** Painéis e colunas destinados a Wall Run.
   - **Branco Puro (`#FFFFFF`):** Checkpoints e marcos de chegada de setor.
3. **Validação Cinemática Pré-Arte:** Nenhum asset com geometria detalhada ou material PBR final deve ser importado antes de o traçado de greybox ter sido percorrido com sucesso 10 vezes consecutivas sem frustração de colisão.
