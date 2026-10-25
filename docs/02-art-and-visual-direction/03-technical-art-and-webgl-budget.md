# DIREÇÃO ARTÍSTICA: TÉCNICAS WEBGL E ORÇAMENTO GRÁFICO (PERFORMANCE BUDGET)
**Documento:** ART-DOC-003  
**Responsáveis:** Technical Artist & Software Architect  
**Status:** Aprovado

---

## 1. Visão Geral da Performance em Navegador

Para que a experiência de parkour seja responsiva e agradável, **a taxa de quadros deve ser cravada em 60 FPS (16.6ms por frame)** em laptops médios e navegadores modernos (Chrome, Firefox, Edge, Safari WebGL 2.0). Quedas de frame (*stutters*) quebram a precisão do pulo e causam desconforto em primeira pessoa.

Portanto, a estética monumental e brutalista foi especificamente escolhida por ser amigável ao WebGL: grandes superfícies planas com texturas compartilhadas e poucas chamadas de desenho (*draw calls*).

---

## 2. Orçamento Gráfico por Frame (Render Budget)

| Métrica | Limite Máximo (Target) | Pior Cenário Permitido | Estratégia de Mitigação |
| :--- | :--- | :--- | :--- |
| **Draw Calls por Frame** | ≤ 70 calls | 120 calls | `InstancedMesh` para pilares, batched geometry para blocos estáticos. |
| **Triângulos na Câmera** | ≤ 80.000 tris | 150.000 tris | Primitivas simples (cubos, cilindros de 16 lados, rampas sem subdivisão). |
| **Vértices Totais na Cena** | ≤ 120.000 verts | 250.000 verts | Geometria modular reutilizável. |
| **Uso de Memória VRAM** | ≤ 250 MB | 400 MB | Texturas em 1K e 2K comprimidas (KTX2 / Basis Universal). |
| **Tempo de GPU por Frame** | ≤ 8.0 ms | 12.0 ms | Sombras direcionais com frustum apertado + shaders customizados leves. |
| **Tempo de CPU por Frame** | ≤ 4.0 ms | 6.0 ms | Sem alocação de objetos em loop (`new THREE.Vector3()`), física desacoplada. |

---

## 3. Técnicas de Otimização Visual

### 3.1 Instanciação em Massa (`THREE.InstancedMesh`)
As colunatas infinitas, pisos modulares e degraus de escadarias monumentais compartilham a mesma geometria de primitiva e o mesmo material PBR:
- Uma única chamada de desenho pode renderizar 1.000 pilares em posições e rotações distintas.
- Uso de matrizes de transformação estáticas pré-calculadas na inicialização da cena.

### 3.2 Otimização de Sombras (Shadow Frustum Fitting)
Luzes com sombras dinâmicas são o maior gargalo de GPU no Three.js:
- **Uma única fonte de sombras:** Apenas a `DirectionalLight` (Sol) projeta sombras.
- **Frustum Dinâmico Vinculado ao Jogador:** A câmera ortográfica da sombra da luz não cobre o mapa inteiro (que teria centenas de metros e geraria sombras borradas e lentas). Ela cobre um cubo de `60m x 60m x 60m` centralizado na posição atual do jogador, gerando sombras suaves e nítidas com alta taxa de preenchimento.

```
       [ Câmera de Sombra (60m x 60m) ] ── Acompanha o jogador
                  │
                  ▼
          ┌───────────────┐
          │    JOGADOR    │  ◄── Sombras perfeitas no raio imediato de parkour
          └───────────────┘
  (Estruturas distantes além de 60m usam sombreamento difuso estático e névoa)
```

### 3.3 pipeline de Pós-Processamento Mínimo
Efeitos excessivos de pós-processamento degradam o frame rate. O pipeline utiliza uma passagem enxuta (`EffectComposer` otimizado):
1. **Passagem Base:** Three.js Render Target padrão com anti-aliasing nativo (MSAA 2x ou 4x quando suportado) ou FXAA rápido.
2. **Névoa em Shader (In-Engine):** Calculada diretamente no vertex/fragment shader dos materiais sem necessidade de pass de profundidade separada.
3. **Vignette Sutil + Tone Mapping (ACESFilmicToneMapping):** Aplicado no shader de saída para evitar altas luzes estouradas e enriquecer o contraste do concreto sob sol forte.
4. **Bloom Restrito:** Opcional e apenas se houver margem de performance. Desativado por padrão em hardware de entrada.

### 3.4 Compressão de Texturas e Trilinear Filtering
- Resoluções:
  - Macro-estruturas e monólitos: Textura única de concreto modular de `2048x2048` em formato KTX2/Basis.
  - Normal maps e roughness maps: `1024x1024`.
- Reuso: Todas as estruturas do mapa usam uma biblioteca de no máximo 4 materiais mestres (Master Materials).
