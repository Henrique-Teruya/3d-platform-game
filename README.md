# FLOAT — Architectural Momentum Parkour

> **Gênero:** 3D First-Person Momentum Parkour / Atmospheric Exploration  
> **Plataforma:** Navegadores Web (WebGL 2.0 · Desktop & Mobile Touch)  
> **Stack:** TypeScript · Vite · Three.js · Rapier3D (WASM 60Hz) · React 19 · Zustand · Web Audio API  
> **Status:** Release Ready (100% Implementado e Verificado)

![FLOAT Gameplay Preview](artifacts/float-pass-2/desktop-active-play.png)

---

## 🏛️ 1. Sobre o Jogo

**FLOAT** é um jogo 3D de parkour em primeira pessoa ambientado em um universo silencioso, solitário e monumental de inspiração brutalista. O jogador atravessa estruturas ciclópicas de concreto aparente, colunatas suspensas, monólitos flutuantes e abismos atmosféricos utilizando um sistema de movimentação refinado baseado em preservação de momentum.

Não há inimigos, combate ou elementos de terror — a experiência combina **fluidez mecânica**, **solidão contemplativa** e **minimalismo arquitetônico**.

### Pilares Fundamentais
1. **Movement Is Everything:** Controlador cinemático próprio em Rapier3D a `60 Hz` fixos com *Sprint*, *Variable Jump*, *Coyote Time* (`120 ms`), *Jump Buffer* (`140 ms`), *Air Strafe*, *Slide* com redução física de cápsula, *Wall Run*, *Wall Jump* encadeável e herança de velocidade em *Plataformas Móveis*.
2. **Monumental Solitude:** Arquitetura brutalista em escala colossal, iluminação solar dramática, sombras suaves (`PCFSoftShadowMap`), névoa exponencial (`FogExp2`) e domo celeste procedural em GLSL.
3. **Minimalist Beauty & Performance:** `68` draw calls e `5.060` triângulos em cena via `THREE.InstancedMesh`, texturas procedurais geradas em memória e áudio generativo via **Web Audio API** (zero arquivos de áudio externos).

---

## 🚀 2. Como Rodar Localmente

### Pré-requisitos
- **Node.js** 18+ e **npm**

### Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://127.0.0.1:5188)
npm run dev

# 3. Executar testes unitários e simulação física completa dos 3 níveis (Vitest)
npm run test:unit

# 4. Gerar build de produção em ./dist
npm run build

# 5. Visualizar build de produção (http://127.0.0.1:4188)
npm run preview
```

> **Modo Debug / Tuning em Tempo Real:** Acesse `http://127.0.0.1:5188/?debug=1` para abrir o painel interativo (`lil-gui`) com todas as constantes físicas do controlador.

---

## 🎮 3. Controles

| Ação | Desktop (Teclado + Mouse) | Mobile / Touch |
| :--- | :--- | :--- |
| **Mover / Air Strafe** | `W` `A` `S` `D` ou `Setas` | Joystick Virtual Esquerdo |
| **Olhar (Câmera 1ª Pessoa)** | `Mouse` (Pointer Lock no Canvas) | Toque / Arraste |
| **Sprint (`12.5 m/s`)** | `Shift` (Segurar) | Automático no limite do Joystick / Slide |
| **Saltar / Wall Jump** | `Espaço` (Toque curto vs. Segurar) | Botão `JUMP` |
| **Wall Run** | Saltar em direção a uma parede (`15°–75°`) segurando `W` | Saltar junto à parede + Joystick |
| **Slide (Deslizar / Agachar)** | `Ctrl` ou `C` em movimento | Botão `SLIDE` |
| **Voltar ao Checkpoint** | `R` | Menu de Pausa → *Checkpoint* |
| **Pausar / Opções** | `Esc` ou `P` | Botão `II ESC` no topo direito |

---

## 🗺️ 4. Níveis Jogáveis

1. **LEVEL 01 — THE AWAKENING** (*Warm Alabaster Morning*)  
   Pátio de despertar, travessia de fendas fundamentais, lintéis baixos para *Slide*, corredores de iniciação ao *Wall Run* e ascensão ao santuário.
2. **LEVEL 02 — THE MONOLITHS** (*Golden Brutalist Dusk*)  
   Cânions de monólitos paralelos para *Wall Runs* encadeados, pontes cinemáticas móveis, rampas de aceleração de *Slide* e rota expressa para speedrunners.
3. **LEVEL 03 — THE ASCENSION** (*Cobalt Ethereal Zenith*)  
   A prova final nas alturas: plataformas suspensas móveis sincronizadas, câmaras verticais de *Wall Jump* duplo e o salto final para o portal da Cidadela.

---

## 🏗️ 5. Estrutura do Repositório

```text
├── docs/                        # Documentação completa de Game Design & Arquitetura (8 módulos)
├── artifacts/                   # Relatórios de QA WebGL e capturas verificadas
├── scripts/                     # Inspetor automatizado de canvas WebGL / GPU
├── src/
│   ├── app/                     # Shell principal React (App.tsx)
│   ├── config/                  # Parâmetros físicos (movementConfig) e presets gráficos
│   ├── game/
│   │   ├── audio/               # Sintetizador procedural Web Audio API (SoundEngine.ts)
│   │   ├── camera/              # Câmera 1ª pessoa, FOV dinâmico, roll e mola de pouso
│   │   ├── checkpoints/         # Sistema de shrines, detecção de void e respawn rápido
│   │   ├── core/                # EventBus tipado, FixedTimestepClock (60Hz) e PRNG
│   │   ├── input/               # InputManager (Pointer Lock, Teclado + Touch)
│   │   ├── levels/              # Definições métricas dos Níveis 01, 02 e 03
│   │   ├── movement/            # Matemática vetorial e PlayerController cinemático
│   │   ├── physics/             # Integração Rapier3D WASM e plataformas móveis
│   │   ├── rendering/           # Painel de tuning lil-gui (?debug=1)
│   │   ├── world/               # Shaders GLSL, texturas procedurais e BrutalistBuilder
│   │   └── GameEngine.ts        # Orquestrador imperativo 60Hz + hooks de diagnóstico
│   ├── stores/                  # Estado global Zustand + persistência localStorage
│   ├── styles/                  # Design system CSS brutalista responsivo
│   └── ui/                      # HUD, MainMenu, LevelSelect, Pause, Settings, LevelComplete
└── tests/
    ├── unit/                    # 14 testes Vitest (física de movimento + conclusão dos 3 níveis)
    └── e2e/                     # Testes Playwright (Desktop, Mobile e Bot Playtest)
```

---

## 📚 6. Índice Geral da Documentação (`docs/`)

A documentação técnica e de design está dividida em 8 módulos temáticos:

| Módulo | Arquivo Principal | Responsáveis | Descrição |
| :--- | :--- | :--- | :--- |
| **01. Visão Criativa** | [`docs/01-vision-and-creative-direction/01-game-overview-and-pillars.md`](docs/01-vision-and-creative-direction/01-game-overview-and-pillars.md) | Game Director, Sr. Game Designer | Pilares de design, premissa emocional, tom contemplativo e limites de escopo (Não-Terror). |
| **01. Universo & Atmosfera** | [`docs/01-vision-and-creative-direction/02-world-lore-and-atmosphere.md`](docs/01-vision-and-creative-direction/02-world-lore-and-atmosphere.md) | Game Director, Technical Writer | Filosofia dos espaços liminares, silêncio ambiental, narrativa ambiental indireta. |
| **02. Direção Artística** | [`docs/02-art-and-visual-direction/01-art-direction-and-styleguide.md`](docs/02-art-and-visual-direction/01-art-direction-and-styleguide.md) | 3D Env. Artist, Art Director | Brutalismo geométrico, formas primitivas, materiais foscos e regras de composição visual. |
| **02. Luz e Atmosfera** | [`docs/02-art-and-visual-direction/02-lighting-atmosphere-and-colors.md`](docs/02-art-and-visual-direction/02-lighting-atmosphere-and-colors.md) | Technical Artist, Env. Artist | Iluminação solar direcional, sombras suaves, névoa de profundidade e paletas de biomas. |
| **02. Orçamento Gráfico** | [`docs/02-art-and-visual-direction/03-technical-art-and-webgl-budget.md`](docs/02-art-and-visual-direction/03-technical-art-and-webgl-budget.md) | Technical Artist | Budgets de draw call, geometria, texturas, instancing e shaders leves para 60 FPS WebGL. |
| **03. Mecânicas de Movimento**| [`docs/03-gameplay-and-character-controller/01-movement-mechanics-spec.md`](docs/03-gameplay-and-character-controller/01-movement-mechanics-spec.md) | Gameplay Prog., Sr. Game Designer | Especificação exaustiva das mecânicas, inputs e transições. |
| **03. Física & Movimento** | [`docs/03-gameplay-and-character-controller/02-physics-and-movement-math.md`](docs/03-gameplay-and-character-controller/02-physics-and-movement-math.md) | Technical Game Designer, Math Lead | Fórmulas matemáticas, curvas de aceleração/atrito no ar/chão, coyote time, buffering e rampa. |
| **03. Câmera & Sensação** | [`docs/03-gameplay-and-character-controller/03-camera-system-and-game-feel.md`](docs/03-gameplay-and-character-controller/03-camera-system-and-game-feel.md) | Gameplay Prog., UX Designer | Pointer Lock, FOV dinâmico, inclinações discretas de câmera, conforto visual e anti-motion sickness. |
| **03. Tabela de Constantes** | [`docs/03-gameplay-and-character-controller/04-tuning-and-parameters-cheat-sheet.md`](docs/03-gameplay-and-character-controller/04-tuning-and-parameters-cheat-sheet.md) | Technical Game Designer | Tabela completa de constantes e valores numéricos calibrados. |
| **04. Level Design & Métricas**| [`docs/04-level-design/01-level-design-philosophy-and-metrics.md`](docs/04-level-design/01-level-design-philosophy-and-metrics.md) | Lead Level Designer | Bounding boxes métricas, saltos máximos/confortáveis, alturas e regras de fluidez. |
| **04. Biomas & Estruturas** | [`docs/04-level-design/02-biomes-and-architectural-zones.md`](docs/04-level-design/02-biomes-and-architectural-zones.md) | Lead Level Designer, Env. Artist | Detalhamento das zonas arquitetônicas. |
| **04. Kit Modular & Greybox** | [`docs/04-level-design/03-modular-kit-and-greyboxing.md`](docs/04-level-design/03-modular-kit-and-greyboxing.md) | 3D Env. Artist, Level Designer | Catálogo de peças modulares brutalistas em grid métrico. |
| **04. Rotas e Progressão** | [`docs/04-level-design/04-routing-pacing-and-progression.md`](docs/04-level-design/04-routing-pacing-and-progression.md) | Sr. Game Designer, Level Designer | Rotas duplas (iniciante seguro vs veterano com momentum), micro e macro pacing. |
| **05. Áudio e Acústica** | [`docs/05-audio-design/01-sound-design-and-acoustics.md`](docs/05-audio-design/01-sound-design-and-acoustics.md) | Sound Designer | Design de foley (concreto/pedra), vento dinâmico por velocidade, eco monumental e silêncio. |
| **06. UX, UI & Conforto** | [`docs/06-ux-and-ui/01-hud-and-interface-design.md`](docs/06-ux-and-ui/01-hud-and-interface-design.md) | UX/UI Designer | Retícula dinâmica minimalista, velocímetro opcional, menus integrados, feedback de aterrissagem. |
| **06. Acessibilidade** | [`docs/06-ux-and-ui/02-accessibility-and-controls.md`](docs/06-ux-and-ui/02-accessibility-and-controls.md) | UX/UI Designer | Sensibilidade do mouse, regulagem de FOV, filtros anti-enjoo. |
| **07. Arquitetura de Software**| [`docs/07-technical-architecture/01-software-architecture-and-tech-stack.md`](docs/07-technical-architecture/01-software-architecture-and-tech-stack.md) | Software Architect | Estrutura de pastas, loop de game engine, integração Three.js + Rapier/kinematic, Vite bundle. |
| **07. Máquinas de Estado** | [`docs/07-technical-architecture/02-state-machines-and-data-structures.md`](docs/07-technical-architecture/02-state-machines-and-data-structures.md) | Software Architect, Gameplay Prog. | Diagramas de estados do jogador, inputs, checkpoint manager e gerenciamento de cenas. |
| **07. Performance WebGL** | [`docs/07-technical-architecture/03-performance-budget-and-optimization.md`](docs/07-technical-architecture/03-performance-budget-and-optimization.md) | Technical Artist, Software Architect | Instancing, frustum culling e orçamento de renderização. |
| **08. Roadmap para IA** | [`docs/08-ai-implementation-roadmap/01-development-phases-and-agent-tasks.md`](docs/08-ai-implementation-roadmap/01-development-phases-and-agent-tasks.md) | Lead Project Director, Tech Writer | Roadmap de implementação sequencial. |
| **08. Critérios de Aceite** | [`docs/08-ai-implementation-roadmap/02-definition-of-done-and-qa-checklist.md`](docs/08-ai-implementation-roadmap/02-definition-of-done-and-qa-checklist.md) | QA Lead, Technical Game Designer | Checklist de Definition of Done (DoD) e status de implementação ([`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)). |

---

## 🌐 7. Deploy (Vercel & GitHub Pages)

- **Vercel:** O arquivo [`vercel.json`](vercel.json) já está configurado. Basta importar o repositório na Vercel e clicar em **Deploy**.
- **GitHub Pages:** O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) executa os testes unitários, compila o bundle com `base: './'` e publica automaticamente no GitHub Pages a cada push na branch `main` (ative *Settings → Pages → Source: GitHub Actions* no repositório).
