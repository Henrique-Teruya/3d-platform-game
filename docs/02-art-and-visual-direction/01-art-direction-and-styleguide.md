# DIREÇÃO ARTÍSTICA: STYLEGUIDE & FORMAS GEOMÉTRICAS
**Documento:** ART-DOC-001  
**Responsáveis:** 3D Environment Artist & Art Director  
**Status:** Aprovado

---

## 1. Princípios de Estética Visual

A direção de arte é construída sobre quatro alicerces estéticos indissociáveis:

1. **Brutalismo Monumental:** Blocos colossais de concreto sem ornatos, revelando a pureza estrutural, massa pesada e linhas retas ou arcos ciclópicos.
2. **Minimalismo Geométrico:** Nenhuma forma complexa desnecessária. Não há cabos expostos, parafusos, tijolos quebrados miúdos ou folhagens desordenadas. A força plástica reside no volume primitivo.
3. **Perspectiva & Escala Desproporcional:** O cenário é desenhado em proporções 10x a 50x maiores que o corpo humano. A câmera de primeira pessoa realça essa disparidade constante.
4. **Leitura de Gameplay Instantânea (Visual Clarity):** Todas as superfícies jogáveis (onde se pode pisar, correr na parede ou escorregar) são visualmente desimpedidas e destacadas pela iluminação.

```
       BRUTALISMO                         MINIMALISMO
  (Massa, Peso, Concreto)           (Formas Primitivas, Zero Ruído)
             \                                 /
              \                               /
               ▼                             ▼
              ┌───────────────────────────────┐
              │    ESTÉTICA VISUAL MONOLITH   │
              └───────────────┬───────────────┘
                              │
               ▲                             ▲
              /                               \
             /                                 \
      ESCALA MONUMENTAL               CLAREZA DE LEITURA
   (Sublime, Vertigem)              (Rotas Óbvias pela Luz)
```

---

## 2. Vocabulário de Geometria 3D

Em consonância com as restrições de performance WebGL e a filosofia artística, todo o ambiente é gerado ou modelado a partir de primitivas geométricas puras:

| Forma Primitiva | Função Arquitetônica | Função no Gameplay |
| :--- | :--- | :--- |
| **Cubo / Paralelepípedo** | Pilares, blocos monolíticos, degraus ciclópicos, vigas | Plataformas de aterrissagem, obstáculos para slide, superfícies de salto. |
| **Cilindro / Coluna** | Colunatas monumentais, torres ocas infinitas | Paredes para wall run curvo, marcadores verticais no horizonte. |
| **Rampa Inclinada** | Declives estruturais, canais de concreto | Aceleração por slide (superfícies de ganho de momentum). |
| **Arco Romano / Abóbada** | Portais ciclópicos, travessias sob pontes | Marcos visuais de orientação (framing do destino do jogador). |
| **Escadaria Monumental** | Rampas com degraus em grande escala | Zonas de transição vertical com ritmos de subida. |
| **Prancha / Plano Fino** | Vigas e passarelas suspensas sem parapeito | Testes de equilíbrio e precisão de salto em alta velocidade. |

### Regras de Modelagem 3D:
- **Bevels Sutis:** Onde viável (ou simulado via normal maps leves), as arestas vivas possuem chanfros sutis (10cm - 20cm) para capturar o brilho especular do sol, evitando aspecto de modelo 3D inacabado.
- **Topologia Limpa e Otimizada:** Polígonos planos não subdivididos. Menos de 500 triângulos para grandes monólitos cúbicos. A complexidade do mundo vem da repetição e composição espacial, não do número de vértices de cada modelo individual.

---

## 3. Guia de Materiais e Texturização

Evitar texturas fotográficas ruidosas, pedras pontiagudas ou azulejos com padrões repetitivos evidentes. O acabamento deve ser táctil, refinado e austero.

### 3.1 Catálogo de Materiais Base (PBR Minimalista)

1. **Concreto Arquitetônico Cru (Cast Concrete):**
   - **Albedo / Base Color:** Cinza médio-claro neutro (`#B8B9B7` a `#D1D3D4`).
   - **Roughness:** Alta (0.80 a 0.88), micro-rugosidade uniforme.
   - **Metalness:** 0.0 (totalmente dielétrico).
   - **Normal:** Micro-grão sutil e emendas de fôrma de concreto largas (linhas horizontais sutis a cada 2 metros).

2. **Pedra Polida / Mármore Fosco (Smooth Stone):**
   - Usado em pisos de alta velocidade e passarelas importantes.
   - **Base Color:** Branco-osso (`#EAECEE`) ou basalto escuro (`#2A2C30`) para contraste de rota.
   - **Roughness:** Média-baixa (0.35 a 0.50), refletindo suavemente o gradiente do céu.
   - **Metalness:** 0.05.

3. **Painéis Tectônicos Escuros (Dark Obsidian/Basalt):**
   - Utilizados para contrastar áreas críticas de wall-run ou pilares de apoio estrutural no abismo.
   - **Base Color:** Grafite escuro (`#1F2124`).
   - **Roughness:** 0.65.

4. **Superfícies de Alta Fricção (Parkour Grips):**
   - Áreas específicas de wall run onde o atrito é garantido pelo level design.
   - Indicadas não por tinta colorida berrante, mas por ranhuras horizontais na textura do concreto que orientam o olhar na direção do movimento.

---

## 4. Composição Espacial e Hierarquia Visual

Para guiar o jogador sem placas, setas flutuantes ou tutoriais invasivos na tela:

- **Contraste de Iluminação (Leading with Light):** O ponto de destino ou a plataforma correta está sempre banhada pela luz solar ou em forte silhueta contra o céu claro. As zonas intransitáveis ou becos sem saída permanecem em sombra suave.
- **Enquadramento Arquitetônico (Framing):** Portais, arcos e fendas entre monólitos emolduram naturalmente o próximo marco de navegação no horizonte.
- **Linhas Guia Convergentes:** As juntas do concreto, os cabos estruturais esticados e a perspectiva de colunas convergem na direção do vetor ideal de salto.
