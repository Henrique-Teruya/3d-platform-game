# PROJETO: MONOLITH / AETHEL (Documentação Oficial do Jogo)
> **Gênero:** 3D First-Person Momentum Parkour / Atmospheric Exploration  
> **Plataforma-Alvo:** Navegadores Web (WebGL 2.0 / WebGPU Ready)  
> **Motor & Stack:** Three.js, TypeScript, Vite, Rapier3D / Kinematic Physics  
> **Status:** Fase 0 — Concepção, Design e Arquitetura Técnica (Planejamento Integral)

---

## 🏛️ 1. Sumário Executivo do Projeto

O projeto é um jogo de parkour em primeira pessoa para navegadores, ambientado em um universo solitário, silencioso e monumental de inspiração brutalista e surrealista. O jogador acorda ou surge em uma vasta paisagem de estruturas ciclópicas de concreto e pedra, pontes suspensas que se perdem no horizonte e monólitos flutuantes. 

Não há inimigos, combate, contagem regressiva punitiva, nem jumpscares. Trata-se de uma experiência centrada na **pureza do movimento**, na **satisfação mecânica da fluidez física** e no **arrebatamento contemplativo da arquitetura colossal**.

```
                           ┌──────────────────────────────┐
                           │      VISÃO CENTRAL           │
                           │ Monumentalismo + Fluidez     │
                           └──────────────┬───────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   DIREÇÃO ARTÍSTICA             GAMEPLAY & CONTROLLER             ARQUITETURA TÉCNICA
 Brutalismo Geométrico          Kinematic Character Controller    Three.js + TypeScript
 Escala Desproporcional         Coyote Time, Buffering, Slide    Rapier3D Kinematic Body
 Luz Solar & Névoa Atmosférica  Momentum Preservation & Flow     60 FPS WebGL Budget
```

---

## 📚 2. Índice Geral da Documentação

A documentação técnica e de design foi dividida em 8 módulos temáticos para facilitar a consulta humana e a execução por agentes autônomos de IA:

| Módulo | Arquivo Principal | Responsáveis | Descrição |
| :--- | :--- | :--- | :--- |
| **01. Visão Criativa** | [`docs/01-vision-and-creative-direction/01-game-overview-and-pillars.md`](docs/01-vision-and-creative-direction/01-game-overview-and-pillars.md) | Game Director, Sr. Game Designer | Pilares de design, premissa emocional, tom contemplativo e limites de escopo (Não-Terror). |
| **01. Universo & Atmosfera** | [`docs/01-vision-and-creative-direction/02-world-lore-and-atmosphere.md`](docs/01-vision-and-creative-direction/02-world-lore-and-atmosphere.md) | Game Director, Technical Writer | Filosofia dos espaços liminares, silêncio ambiental, narrativa ambiental indireta. |
| **02. Direção Artística** | [`docs/02-art-and-visual-direction/01-art-direction-and-styleguide.md`](docs/02-art-and-visual-direction/01-art-direction-and-styleguide.md) | 3D Env. Artist, Art Director | Brutalismo geométrico, formas primitivas, materiais foscos e regras de composição visual. |
| **02. Luz e Atmosfera** | [`docs/02-art-and-visual-direction/02-lighting-atmosphere-and-colors.md`](docs/02-art-and-visual-direction/02-lighting-atmosphere-and-colors.md) | Technical Artist, Env. Artist | Iluminação solar direcional, sombras suaves, névoa de profundidade e paletas de 4 biomas. |
| **02. Orçamento Gráfico** | [`docs/02-art-and-visual-direction/03-technical-art-and-webgl-budget.md`](docs/02-art-and-visual-direction/03-technical-art-and-webgl-budget.md) | Technical Artist | Budgets de draw call, geometria, texturas, instancing e shaders leves para 60 FPS WebGL. |
| **03. Mecânicas de Movimento**| [`docs/03-gameplay-and-character-controller/01-movement-mechanics-spec.md`](docs/03-gameplay-and-character-controller/01-movement-mechanics-spec.md) | Gameplay Prog., Sr. Game Designer | Especificação exaustiva das 20 mecânicas (MVP vs Post-MVP), inputs e transições. |
| **03. Física & Movimento** | [`docs/03-gameplay-and-character-controller/02-physics-and-movement-math.md`](docs/03-gameplay-and-character-controller/02-physics-and-movement-math.md) | Technical Game Designer, Math Lead | Fórmulas matemáticas, curvas de aceleração/atrito no ar/chão, coyote time, buffering e rampa. |
| **03. Câmera & Sensação** | [`docs/03-gameplay-and-character-controller/03-camera-system-and-game-feel.md`](docs/03-gameplay-and-character-controller/03-camera-system-and-game-feel.md) | Gameplay Prog., UX Designer | Pointer Lock, FOV dinâmico, inclinações discretas de câmera, conforto visual e anti-motion sickness. |
| **03. Tabela de Constantes** | [`docs/03-gameplay-and-character-controller/04-tuning-and-parameters-cheat-sheet.md`](docs/03-gameplay-and-character-controller/04-tuning-and-parameters-cheat-sheet.md) | Technical Game Designer | Tabela completa de constantes e valores numéricos calibrados para prototipagem e testes. |
| **04. Level Design & Métricas**| [`docs/04-level-design/01-level-design-philosophy-and-metrics.md`](docs/04-level-design/01-level-design-philosophy-and-metrics.md) | Lead Level Designer | Bounding boxes métricas, saltos máximos/confortáveis, alturas e regras de fluidez. |
| **04. Biomas & Estruturas** | [`docs/04-level-design/02-biomes-and-architectural-zones.md`](docs/04-level-design/02-biomes-and-architectural-zones.md) | Lead Level Designer, Env. Artist | Detalhamento de 4 zonas arquitetônicas (Monolith Basin, Colonnade, Suspended Terraces, The Chasm). |
| **04. Kit Modular & Greybox** | [`docs/04-level-design/03-modular-kit-and-greyboxing.md`](docs/04-level-design/03-modular-kit-and-greyboxing.md) | 3D Env. Artist, Level Designer | Catálogo de peças modulares brutalistas em grid métrico (1m, 2m, 4m, 8m, 16m, 32m). |
| **04. Rotas e Progressão** | [`docs/04-level-design/04-routing-pacing-and-progression.md`](docs/04-level-design/04-routing-pacing-and-progression.md) | Sr. Game Designer, Level Designer | Rotas duplas (iniciante seguro vs veterano com momentum), micro e macro pacing. |
| **05. Áudio e Acústica** | [`docs/05-audio-design/01-sound-design-and-acoustics.md`](docs/05-audio-design/01-sound-design-and-acoustics.md) | Sound Designer | Design de foley (concreto/pedra), vento dinâmico por velocidade, eco monumental e silêncio. |
| **06. UX, UI & Conforto** | [`docs/06-ux-and-ui/01-hud-and-interface-design.md`](docs/06-ux-and-ui/01-hud-and-interface-design.md) | UX/UI Designer | Retícula dinâmica minimalista, velocímetro opcional, menus integrados, feedback de aterrissagem. |
| **06. Acessibilidade** | [`docs/06-ux-and-ui/02-accessibility-and-controls.md`](docs/06-ux-and-ui/02-accessibility-and-controls.md) | UX/UI Designer | Remapeamento de teclas, sensibilidade do mouse, regulagem de FOV, filtros anti-enjoo. |
| **07. Arquitetura de Software**| [`docs/07-technical-architecture/01-software-architecture-and-tech-stack.md`](docs/07-technical-architecture/01-software-architecture-and-tech-stack.md) | Software Architect | Estrutura de pastas, loop de game engine, integração Three.js + Rapier/kinematic, Vite bundle. |
| **07. Máquinas de Estado** | [`docs/07-technical-architecture/02-state-machines-and-data-structures.md`](docs/07-technical-architecture/02-state-machines-and-data-structures.md) | Software Architect, Gameplay Prog. | Diagramas de estados do jogador, inputs, checkpoint manager e gerenciamento de cenas. |
| **07. Performance WebGL** | [`docs/07-technical-architecture/03-performance-budget-and-optimization.md`](docs/07-technical-architecture/03-performance-budget-and-optimization.md) | Technical Artist, Software Architect | Garbage collection zero em tick, instancing, frustum culling, pooling e Web Workers. |
| **08. Roadmap para IA** | [`docs/08-ai-implementation-roadmap/01-development-phases-and-agent-tasks.md`](docs/08-ai-implementation-roadmap/01-development-phases-and-agent-tasks.md) | Lead Project Director, Tech Writer | Roadmap em 6 fases de implementação sequencial por agentes de IA com tarefas atômicas. |
| **08. Critérios de Aceite** | [`docs/08-ai-implementation-roadmap/02-definition-of-done-and-qa-checklist.md`](docs/08-ai-implementation-roadmap/02-definition-of-done-and-qa-checklist.md) | QA Lead, Technical Game Designer | Checklist estrito de Definition of Done (DoD) e testes manuais e automatizados. |

---

## 🎯 3. Diretrizes de Leitura para Agentes e Desenvolvedores

1. **Prioridade Absoluta:** O **Controller de Movimento em Primeira Pessoa** é o coração do jogo. Antes de qualquer arte visual polida, a física cinemática, o controle no ar e a resposta de salto devem ser perfeitos.
2. **Filosofia Sem Distrações:** O jogo não possui NPCs, combates, inventários complexos ou narrativa expositiva textual. O foco é mecânico e sensorial.
3. **Padrão de Código:** TypeScript strict mode, arquitetura modular baseada em serviços desacoplados, loop desacoplado com delta fixo (`fixedDeltaTime = 1/60`) para física e delta variável para interpolação de renderização Three.js.
"# 3d-platform-game" 
