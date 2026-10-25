# DIREÇÃO ARTÍSTICA: ILUMINAÇÃO, ATMOSFERA E PALETAS DE CORES
**Documento:** ART-DOC-002  
**Responsáveis:** Technical Artist & Environment Artist  
**Status:** Aprovado

---

## 1. Filosofia de Iluminação em Navegador

Em ambientes WebGL com restrições de performance, a iluminação não pode depender de Ray Tracing em tempo real ou de dezenas de luzes pontuais dinâmicas com sombra. A atmosfera cinematográfica monumental é alcançada por meio de **composição inteligente de luz solar direcional, iluminação ambiente hemisférica e névoa volumétrica simulada por shader**.

```
              SOL DIRECIONAL
            (Key Light: Ângulo baixo 35°-45°, sombras nítidas e elegantes)
                   │
                   ▼
       ┌────────────────────────┐
       │   ESTRUTURA MONOLITO   │ ◄─── LUZ HEMISFÉRICA (Sky Light / Ground Bounce)
       └───────────┬────────────┘
                   │
                   ▼ (Sombra de Contraste)
       ┌────────────────────────┐
       │ NÉVOA EXPONENCIAL 2    │ ◄─── PROFUNDIDADE VISUAL (Camadas de silhueta)
       └────────────────────────┘
```

---

## 2. Configuração de Luzes e Sombras

### 2.1 Luz Direcional (O Sol Monumental)
- **Papel:** Fonte de luz principal (Key Light) que define a orientação e cria o alto contraste entre faces iluminadas e sombreadas.
- **Ângulo:** Ângulo baixo a médio (30° a 45° acima do horizonte). Isso garante sombras longas e dramáticas que enfatizam a altura dos monólitos e a geometria das rampas.
- **Cor:** Branco aquecido sutil (`#FFF8F0`) ou dourado etéreo dependendo da hora do dia do bioma.
- **Configuração Técnica Three.js:**
  ```typescript
  const sunLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
  sunLight.position.set(120, 160, 90);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.bias = -0.0003;
  // Cascaded Shadow Maps (CSM) ou Shadow Frustum atrelado ao jogador
  ```

### 2.2 Luz Hemisférica (HemisphereLight)
- **Papel:** Preenchimento natural das sombras, simulando a dispersão do céu e o reflexo do solo claro no concreto.
- **Céu (Sky Color):** Azul-ardósia claro ou cinza-pérola (`#D6E3E9`).
- **Solo (Ground Color):** Cinza-terra neutro (`#706D67`).
- **Intensidade:** 0.6 a 0.8 (garante que as áreas em sombra nunca fiquem pretas opressivas, mantendo a legibilidade do caminho).

### 2.3 Névoa Atmosférica (Depth Fog)
- Em vez de uma névoa simples de distância de corte, o jogo utiliza `THREE.FogExp2` com decaimento suave.
- A cor da névoa é exatamente igualada à cor da linha do horizonte do domo de céu, criando a ilusão de um horizonte infinito onde estruturas distantes se dissolvem em silhuetas monocromáticas.
- **Densidade:** Ajustada entre `0.0025` e `0.0040` (garante visibilidade clara a 150m, mas fusão suave no horizonte além de 400m).

---

## 3. Paletas Cromáticas por Bioma Arquitetônico

Para garantir diversidade visual e senso de progressão sem recorrer a cores berrantes, o mundo é dividido em 4 biomas distintos baseados em temperaturas de cor e condições atmosféricas:

```
BIOMA 1: O Alvorecer de Calcário (Limestone Dawn)
[#F5EBE1] Concreto Claro  | [#D5896F] Sol Âmbar   | [#4F6D7A] Névoa Pálida | [#E8D8C8] Céu

BIOMA 2: O Meio-Dia de Basalto (Basalt Meridian)
[#2C3035] Rocha Escura    | [#FFFFFF] Sol Branco  | [#A3B1B8] Céu Aço      | [#1A1C1E] Sombras

BIOMA 3: O Silêncio de Areia (Sand & Monoliths)
[#E0D7C6] Arenito Seco    | [#E2B056] Luz Dourada | [#8D775F] Ocre Quente  | [#F2E8D5] Atmosfera

BIOMA 4: O Crepúsculo Eclíptico (Violet Dusk)
[#3D3A45] Betão Púrpuro   | [#F08A5D] Sol Poente  | [#1F1D2B] Abismo       | [#7B6D8D] Névoa
```

### Detalhamento das Zonas:

### Bioma 1: O Alvorecer de Calcário (*Limestone Dawn*)
- **Sensação:** Despertar, calma, renascimento, clareza.
- **Iluminação:** Luz solar baixa com tons âmbar suaves e sombras tênues em tons de cinza-ardósia.
- **Superfícies:** Concreto leve, pedra calcária branca, pisos lisos e reflexos sutis de orvalho.
- **Névoa:** Branca-prateada com gradiente dourado na direção do sol.

### Bioma 2: O Meio-Dia de Basalto (*Basalt Meridian*)
- **Sensação:** Rigor arquitetônico, ordem implacável, monumentalidade pura.
- **Iluminação:** Sol a pique de alta intensidade com sombras curtas e ultra-nítidas no chão.
- **Superfícies:** Placas colossais de basalto escuro polido alternadas com vigas de concreto cinza neutro.
- **Névoa:** Azul-gelo distante, revelando a silhueta das estruturas gigantescas no horizonte.

### Bioma 3: A Bacia Monolítica (*Sand & Monoliths*)
- **Sensação:** Vastez desértica, eternidade geológica, contemplação serena.
- **Iluminação:** Luz quente e difusa, sensação de calor seco e vento suave.
- **Superfícies:** Concreto texturizado com tonalidade de areia compactada e bordas erodidas.
- **Névoa:** Tom de poeira fina dourada em suspensão nos níveis baixos das fendas.

### Bioma 4: O Crepúsculo Eclíptico (*Violet Dusk*)
- **Sensação:** Fim de jornada, melancolia sublime, mistério cósmico.
- **Iluminação:** Sol no exato limiar do poente; o céu transita de laranja-fogo próximo ao horizonte para violeta profundo no zênite.
- **Superfícies:** Estruturas escuras em forte contra-luz (silhuetas recortadas perfeitamente no céu).
- **Névoa:** Roxa-acinzentada densa no fundo do abismo, dando a impressão de um mar de nuvens infinitas sob os pés do jogador.
