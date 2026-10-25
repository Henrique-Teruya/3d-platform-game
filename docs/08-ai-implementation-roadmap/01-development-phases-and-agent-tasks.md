# ROADMAP PARA IA: FASES DE DESENVOLVIMENTO E TAREFAS ATÔMICAS
**Documento:** PLAN-AI-001  
**Responsáveis:** Lead Project Director & Software Architect  
**Status:** Aprovado para Execução Sequencial por Agentes de IA

---

## 1. Visão Geral da Execução por Agentes de IA

Este documento é a **árvore de tarefas estruturada** que guiará futuros agentes de IA na implementação passo a passo do jogo. Nenhuma fase deve ser iniciada sem que os critérios de aceite (*Acceptance Criteria*) da fase anterior tenham sido integralmente verificados.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SEQUÊNCIA DE FASES DE IMPLEMENTAÇÃO                  │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ FASE 1: SCAFFOLD  │ FASE 2: FÍSICA &  │ FASE 3: AMBIENTE MONUMENTAL    │
│ Vite + TypeScript │ Kinematic Solver, │ Iluminação, Névoa, Materiais   │
│ & Loop Tridimensional │ Coyote Time, Buffer │ PBR e Kit Modular Inicial    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ FASE 4: PARKOUR   │ FASE 5: ÁUDIO &   │ FASE 6: NÍVEIS & POLIMENTO     │
│ Wall Run, Slide,  │ Vento Procedural, │ 4 Zonas de Greybox a Arte,     │
│ Bhop e Rampas     │ Foley e HUD/UI    │ Testes 60FPS e Validação Final │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Detalhamento das Fases e Tarefas

### Fase 1: Fundação do Projeto e Loop de Jogo (Scaffold)
- **Papel Responsável:** Software Architect / Gameplay Programmer.
- **Entradas:** Documentos `ARCH-DOC-001`, `ARCH-DOC-003`.
- **Tarefas Atômicas:**
  - [ ] **T1.1:** Inicializar projeto Vite com TypeScript estrito (`strict: true`) e Three.js mais recente.
  - [ ] **T1.2:** Configurar estrutura de pastas em `src/` conforme o padrão da documentação arquitetural.
  - [ ] **T1.3:** Implementar `Time.ts` com desacoplamento de delta fixo ($60\text{ Hz}$) e delta de renderização.
  - [ ] **T1.4:** Implementar `SceneManager.ts` com criação de canvas responsivo e tratamento de redimensionamento (`resize`).
  - [ ] **T1.5:** Criar sala de testes de greybox estática simples ($40\text{ m} \times 40\text{ m}$) com grade de calibração.
- **Critério de Aceite da Fase 1:** O navegador abre a cena 3D a 60 FPS estáveis, exibindo uma plataforma plana de teste com iluminação simples e sem erros de TypeScript ou console.

---

### Fase 2: Character Controller Cinemático Básico (Core Movement)
- **Papel Responsável:** Gameplay Programmer & Technical Game Designer.
- **Entradas:** Documentos `GAME-SPEC-001`, `GAME-SPEC-002`, `GAME-SPEC-003`, `GAME-SPEC-004`.
- **Tarefas Atômicas:**
  - [ ] **T2.1:** Implementar `InputManager.ts` capturando `WASD`, `Shift`, `Space` e Pointer Lock API ao clicar na tela.
  - [ ] **T2.2:** Implementar `PlayerCamera.ts` com rotação por mouse Euler (Yaw e Pitch travado em $\pm 85^\circ$).
  - [ ] **T2.3:** Implementar a cápsula cinemática e algoritmo de integração de solo com atrito e aceleração direcional.
  - [ ] **T2.4:** Implementar cálculo de salto com gravidade acelerada na descida e corte variável ao soltar `Space`.
  - [ ] **T2.5:** Implementar **Coyote Time** ($120\text{ ms}$) e **Jump Buffering** ($100\text{ ms}$).
  - [ ] **T2.6:** Integrar painel de debug (`lil-gui`) para alterar constantes de física em tempo real.
- **Critério de Aceite da Fase 2:** O jogador caminha, corre e salta na sala de testes com sensação ágil e determinística. Pulos na beirada da plataforma funcionam confiavelmente graças ao Coyote Time.

---

### Fase 3: Direção de Arte e Cenário Monumental (Atmosphere & Lighting)
- **Papel Responsável:** Technical Artist & 3D Environment Artist.
- **Entradas:** Documentos `ART-DOC-001`, `ART-DOC-002`, `ART-DOC-003`, `LVL-DOC-003`.
- **Tarefas Atômicas:**
  - [ ] **T3.1:** Implementar shader ou material PBR mestre de concreto brutalista com roughness e textura tátil sutil.
  - [ ] **T3.2:** Configurar `LightingRig.ts` com luz solar direcional angulada em $35^\circ$ e `DirectionalLightShadow` otimizada.
  - [ ] **T3.3:** Implementar `SkyAndFog.ts` com domo de céu em gradiente suave e `FogExp2` correspondendo à cor do horizonte.
  - [ ] **T3.4:** Criar gerador ou instanciador de peças modulares brutas (monólitos de 64m, lajes de 8m, pilares cilíndricos).
  - [ ] **T3.5:** Testar cena com 100 monólitos usando `InstancedMesh` para assegurar menos de 70 draw calls.
- **Critério de Aceite da Fase 3:** A cena transmite atmosfera brutalista, silêncio monumental e escala desproporcional sem ultrapassar $8\text{ ms}$ de tempo de GPU.

---

### Fase 4: Mecânicas Avançadas de Parkour (Slide, Wall Run & Momentum)
- **Papel Responsável:** Gameplay Programmer & Senior Game Designer.
- **Entradas:** Documentos `GAME-SPEC-001`, `GAME-SPEC-002`, `GAME-SPEC-003`.
- **Tarefas Atômicas:**
  - [ ] **T4.1:** Implementar mecânica de **Slide** ao pressionar `Ctrl` em velocidade, reduzindo altura da cápsula para $0.9\text{ m}$.
  - [ ] **T4.2:** Implementar projeção de velocidade em rampas inclinadas com ganho de aceleração em declives até $18\text{ m/s}$.
  - [ ] **T4.3:** Implementar detecção de paredes por raycast lateral e estado de **Wall Run** com gravidade reduzida e roll de câmera de $10^\circ$.
  - [ ] **T4.4:** Implementar **Wall Jump** com repulsão horizontal perpendicular e impulso vertical.
  - [ ] **T4.5:** Implementar Dynamic FOV na câmera acelerando até $+12^\circ$ conforme a velocidade aumenta.
  - [ ] **T4.6:** Implementar conservação de momentum em saltos sequenciais e suporte a strafe aéreo / bunny hopping.
- **Critério de Aceite da Fase 4:** O jogador consegue correr, deslizar por uma rampa em alta velocidade, saltar um vão amplo, conectar em um wall run e aterrissar mantendo a fluidez de movimento sem travas.

---

### Fase 5: Áudio Dinâmico, Foley e Interface (Audio & UX)
- **Papel Responsável:** Sound Designer & UX/UI Designer.
- **Entradas:** Documentos `AUD-DOC-001`, `UI-DOC-001`, `UI-DOC-002`.
- **Tarefas Atômicas:**
  - [ ] **T5.1:** Implementar `AudioManager.ts` inicializando o Web Audio API no primeiro clique.
  - [ ] **T5.2:** Implementar foley de passos com variação de pitch aleatória e cadência sincronizada com a velocidade.
  - [ ] **T5.3:** Implementar sintetizador de vento em tempo real atrelado à velocidade escalar do jogador.
  - [ ] **T5.4:** Implementar reverberação de grandes espaços e som de impacto de aterrissagem escalonado por $|v_y|$.
  - [ ] **T5.5:** Construir HUD minimalista com retícula de âncora central de $3\text{ px}$.
  - [ ] **T5.6:** Implementar menu de pausa com controles de sensibilidade de mouse, FOV slider e remapeamento de teclas.
  - [ ] **T5.7:** Implementar sistema de respawn suave com fade de transição de $200\text{ ms}$ ao cair no abismo.
- **Critério de Aceite da Fase 5:** O jogo ganha peso cinestésico completo: passos no concreto, vento acelerando nos ouvidos, retícula estável e menu de pausa funcional.

---

### Fase 6: Montagem das 4 Zonas e Polimento Final (Level Assembly & QA)
- **Papel Responsável:** Lead Level Designer & QA Lead.
- **Entradas:** Documentos `LVL-DOC-001`, `LVL-DOC-002`, `LVL-DOC-004`, `PLAN-AI-002`.
- **Tarefas Atômicas:**
  - [ ] **T6.1:** Montar e validar **Zona 1: A Bacia dos Monólitos** (tutorial orgânico de corrida, salto e slide).
  - [ ] **T6.2:** Montar e validar **Zona 2: A Colunata Infinita** (ritmo de saltos e introdução ao wall run).
  - [ ] **T6.3:** Montar e validar **Zona 3: Os Terraços Suspensos** (rampas de slide a $18\text{ m/s}$ e grandes vãos).
  - [ ] **T6.4:** Montar e validar **Zona 4: O Grande Abismo** (encadeamento complexo de todas as habilidades e mirante final).
  - [ ] **T6.5:** Configurar checkpoints silenciosos em cada zona e gatilhos de kill plane de void.
  - [ ] **T6.6:** Executar bateria de testes de performance (60 FPS em resoluções 1080p e 1440p) e validação de Definition of Done.
- **Critério de Aceite da Fase 6:** Percurso completo percorrível do início ao fim com rotas duplas funcionais, performance travada em 60 FPS e sensação arrebatadora de monumentalismo e fluidez.
