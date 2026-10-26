# 🚀 GUIA PERMANENTE DE PERFORMANCE, FLUIDEZ E OTIMIZAÇÃO
## "FLOAT: LEVE, FLUIDO E A 60 FPS EM QUALQUER DISPOSITIVO"

> **Objetivo:** Este documento é o manual obrigatório para qualquer desenvolvedor ou agente de IA que for adicionar cenários, mecânicas, efeitos visuais ou sons ao **FLOAT**. O jogo conquistou fluidez instantânea e zero engasgos em desktops, notebooks modestos e celulares. **Esta qualidade não pode ser comprometida.**

---

## 🏛️ Os 10 Mandamentos da Fluidez do FLOAT

```
1. ZERO Alocações no Loop (Zero Heap Allocations / Zero GC Stutters)
2. Máximo de 100 Draw Calls (Atualmente ~68) via InstancedMesh
3. Menos de 15.000 Polígonos em Cena (Atualmente ~5.060)
4. React Desacoplado da Simulação (Telemetria a 15 Hz, Física a 60 Hz)
5. Zero Texturas Pesadas de Download (Texturas Procedurais em Memória)
6. Áudio 100% Procedural via Web Audio API (Zero Arquivos de Áudio)
7. DPR Limitado (Max DPR = 1.0 a 1.5 em Telas Retina/Mobile)
8. Física Cinemática Determinística com Timestep Fixo (1/60s)
9. Shaders Leves em Único Passo (Evitar Post-Processing Pesado)
10. Testes de Orçamento Automatizados Antes de Cada Commit
```

---

## 1. Zero Garbage Collection no Loop Principal

A causa número 1 de travamentos ("micro-stutters") em jogos WebGL no navegador é a **coleta de lixo (Garbage Collection)** do motor V8 do JavaScript. Quando você cria novos objetos (`new Vector3()`, `{ ...obj }`, `arr.map()`), a memória heap se acumula até o navegador pausar o jogo por 10–30ms para limpar o lixo. Essa pausa é suficiente para engolir o frame de um pulo ou wall run.

### ❌ O que é ESTRITAMENTE PROIBIDO dentro de `update`, `fixedUpdate`, `render` e callbacks de frame:

```typescript
// ❌ PROIBIDO: Gera milhares de objetos por segundo no Heap
public update(delta: number) {
  const wishDir = new THREE.Vector3(1, 0, 0); // NUNCA crie instâncias aqui!
  const velocity = this.velocity.clone().add(wishDir); // NUNCA use .clone() no loop!
  const list = this.items.map(i => i.pos); // NUNCA use .map, .filter ou arrays temporários!
  const config = { ...this.baseConfig, speed: 12 }; // NUNCA espalhe objetos no frame!
}
```

### ✅ O Padrão Correto: Scratchpad Reutilizável (Zero Alocação)

Todos os vetores, matrizes, quaternions e caixas de colisão devem ser alocados **uma única vez fora do loop**, no escopo do módulo ou da classe:

```typescript
// ✅ CORRETO: Vetores alocados na inicialização do arquivo
const _scratchVecA = new THREE.Vector3();
const _scratchVecB = new THREE.Vector3();
const _scratchQuat = new THREE.Quaternion();

export class PlayerController {
  public fixedUpdate(fixedDt: number, input: InputSnapshot) {
    // Reutiliza os vetores estáticos sem criar lixo na memória
    _scratchVecA.set(input.moveRight, 0, -input.moveForward).normalize();
    _scratchVecB.copy(_scratchVecA).multiplyScalar(this.speed * fixedDt);
    this.position.add(_scratchVecB);
  }
}
```

---

## 2. Orçamento Gráfico WebGL (Render Budget)

O visual monumental do FLOAT vem da **escala e proporção brutalista**, e **NÃO** do excesso de polígonos ou de texturas 4K.

| Métrica | Limite Máximo Tolerado | Valor Atual do Jogo | Status |
| :--- | :--- | :--- | :--- |
| **Draw Calls (`renderer.info.render.calls`)** | **100 calls** | **68 calls** | 🟢 Excelente |
| **Triângulos na Cena** | **20.000 tris** | **5.060 tris** | 🟢 Excelente |
| **Geometrias em Memória** | **100 geometrias** | **58 geometrias** | 🟢 Excelente |
| **Texturas Carregadas** | **10 texturas** | **4 (procedurais)** | 🟢 Zero download |
| **Tempo de Frame de Render (GPU)** | **8.5 ms** | **~2.8 ms** | 🟢 60 FPS folgado |

### Como adicionar novas estruturas sem estourar o orçamento:
1. **Use SEMPRE `THREE.InstancedMesh` para repetições:**
   - Se o cenário tiver 100 pilares, 200 lajes ou 50 monólitos distantes, crie **1 único `InstancedMesh`**.
   - Nunca adicione 100 `THREE.Mesh` normais à cena, pois isso geraria 100 draw calls e derrubaria a taxa de quadros em celulares.
2. **Desative atualizações de matriz em objetos estáticos:**
   - `mesh.matrixAutoUpdate = false;` e chame `mesh.updateMatrix();` apenas na criação do nível.
3. **Mantenha geometrias primitivas:**
   - Caixas (`BoxGeometry`), cilindros de baixa contagem de lados (`CylinderGeometry(r, r, h, 8)` a `16`), planos e rampas. O acabamento estético é dado pelas quinas chanfradas e faixas de contraste, não por subdivisão excessiva de polígonos.

---

## 3. Desacoplamento React vs. Trilha de Simulação

O maior erro comum em jogos Three.js construídos sobre React é acionar re-renderizações do React no ritmo do renderizador 3D.

- **Loop do Jogo (Imperativo):** Roda a **60 Hz** em TypeScript puro dentro do `GameEngine`, interagindo diretamente com Three.js e Rapier3D WASM.
- **HUD & Menus (React / Zustand):** A telemetria (velocímetro, cronômetro, contador de shrines) é atualizada com **throttle a 15 Hz** (`0.066s`):

```typescript
// GameEngine.ts: Só notifica o React a cada 66ms, NUNCA a 60Hz
this.telemetryTimer += delta;
if (this.telemetryTimer >= 0.066) {
  this.telemetryTimer = 0;
  store.updateTelemetry({ ...metrics });
}
```

Isso garante que o React não gaste ciclos de CPU recalculando árvores de componentes 60 vezes por segundo, deixando a CPU 100% livre para a física e o áudio.

---

## 4. Otimização para Telas Retina, 4K e Dispositivos Móveis

Telas de celulares modernos (iPhone, Galaxy) e monitores 4K possuem `window.devicePixelRatio` de `3.0` ou `4.0`. Se o WebGL renderizar na resolução nativa 3x ou 4x, a GPU do celular precisará calcular **9 a 16 vezes mais pixels**, provocando superaquecimento imediato e queda brutal para 15–20 FPS.

### Regra de Ouro do DPR:
O DPR deve ser **sempre limitado** pelo preset gráfico:

```typescript
// graphicsConfig.ts
const preset = GRAPHICS_PRESETS[quality];
const dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr); // preset.maxDpr nunca passa de 1.5
renderer.setPixelRatio(dpr);
```

- Celulares e modo econômico: `dpr = 1.0`
- Monitores Desktop: `dpr = 1.0` a `1.5`
- Isso mantém a imagem nítida com antialiasing SMAA/FXAA, mas poupa 70% da carga de sombreamento da GPU.

---

## 5. Áudio e Texturas: Zero Bloat de Assets

O FLOAT carrega em menos de **1 segundo** em conexões 3G/4G móveis porque:

1. **Texturas 100% Procedurais:**
   - As texturas de concreto ripado, basalto e ladrilhos são geradas via código procedural com `THREE.DataTexture` em menos de 20ms na inicialização.
   - Não adicione arquivos `.png` ou `.jpg` pesados de 10 MB ao projeto. Se precisar de novos acabamentos, use geradores matemáticos de ruído ou gradientes.
2. **Sintetizador Web Audio API:**
   - Todos os sons de vento, drones atmosféricos, passos de concreto e sinos de santuário são sintetizados em tempo real via osciladores e filtros passa-baixa (`BiquadFilterNode`).
   - Não adicione dezenas de arquivos `.mp3` ou `.wav`. O áudio sintetizado consome quase zero bytes de transferência e memória.

---

## 6. Física Cinemática Estável (Rapier3D WASM)

1. **Passo de Tempo Fixo (`FIXED_DT = 1/60 = 0.0166s`):**
   - A física nunca deve usar `delta` variável de renderização. O acumulador de tempo fixo (`FixedTimestepClock`) garante que a física seja idêntica em telas de 60 Hz, 144 Hz ou 240 Hz.
2. **Colisões Simples:**
   - O jogador é uma cápsula cinemática (`radius: 0.4m`, `height: 1.8m` / `0.95m no slide`).
   - As paredes e plataformas usam `cuboid` ou `trimesh` simples. Evite geometrias côncavas complexas com milhares de triângulos de colisão.
3. **Plataformas Móveis:**
   - Atualize apenas as plataformas ativas próximas ao jogador. Plataformas estáticas ou adormecidas não devem consumir cálculos de raycast.

---

## 7. Checklist Obrigatório Antes de Novos Níveis ou Funcionalidades

Antes de aprovar qualquer PR ou alteração no jogo, execute e confira:

- [ ] `npm run build` gerou o pacote sem alertas de tamanho de chunk excessivo.
- [ ] `npm run test:unit` passou os 14 testes de física e conclusão de fases.
- [ ] O número de **draw calls** na tela permaneceu abaixo de **100**.
- [ ] O número de **triângulos** na cena permaneceu abaixo de **15.000**.
- [ ] O jogo abre e atinge **60 FPS constantes** no modo mobile (`F12 → Device Toolbar → Pixel 5 / iPhone`).
- [ ] Nenhum `new THREE.Vector*` foi adicionado dentro do laço `update()`.
- [ ] A pasta `dist/` continua sem arquivos de áudio ou texturas externas gigantes.

Seguindo essas diretrizes simples e rigorosas, o **FLOAT** permanecerá leve como uma pluma, incrivelmente responsivo e acessível para qualquer pessoa no mundo, em qualquer aparelho!
