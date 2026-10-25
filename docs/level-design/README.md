# FLOAT — LEVEL DESIGN SYSTEM & 10-LEVEL DOCUMENTATION
**Módulo:** Level Design Architecture & Progression System  
**Status:** Oficial — Aprovado para Especificação e Futura Implementação por Agentes de IA  
**Versão:** 2.0.0 (Expansão do Roadmap de 3 para 10 Fases)

---

## 🏛️ 1. Visão Geral do Sistema de Level Design

Este diretório contém a especificação técnica e artística completa para a criação, montagem, validação e progressão de fases em **FLOAT** (anteriormente catalogado sob os codinomes *Monolith* / *Aethel*).

O objetivo deste sistema é fornecer uma base determinística, modular e matematicamente calibrada para que designers humanos e agentes autônomos de IA possam construir percursos tridimensionais de parkour em primeira pessoa com consistência estética, ausência de retrabalho e respeito estrito ao orçamento de desempenho WebGL/WebGPU.

```
                                  ┌──────────────────────────────┐
                                  │      PILARES CENTRAIS        │
                                  │  Fluidez · Silêncio · Escala │
                                  └──────────────┬───────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  ▼                              ▼                              ▼
     [ LEVEL DESIGN BIBLE ]            [ GRAMÁTICA MODULAR ]         [ MATRIZ DE PROGRESSÃO ]
      Métricas cinemáticas rígidas,     Catálogo paramétrico de       Curva de 1 a 10 fases,
      pacing, regras de legibilidade    peças, colisores e instâncias  evolução estética e mecânica
                  │                              │                              │
                  └──────────────────────────────┼──────────────────────────────┘
                                                 ▼
                                     [ 10 FASES DETALHADAS ]
                                 De "The Awakening" a "The Beyond"
```

---

## 📚 2. Estrutura de Documentos

A documentação está organizada de forma modular para consulta rápida:

| Arquivo | Descrição |
| :--- | :--- |
| [`LEVEL-DESIGN-BIBLE.md`](LEVEL-DESIGN-BIBLE.md) | A bíblia conceitual: filosofia de design, métricas espaciais do jogador, pacing, regras de legibilidade e checkpoints. |
| [`LEVEL-TEMPLATE.md`](LEVEL-TEMPLATE.md) | O formulário técnico padronizado para especificação de qualquer nova fase por humanos ou agentes de IA. |
| [`PROGRESSION-MATRIX.md`](PROGRESSION-MATRIX.md) | Matriz completa de progressão das 10 fases: nomes, objetivos, introdução mecânica e biomas. |
| [`DIFFICULTY-CURVE.md`](DIFFICULTY-CURVE.md) | Análise multidimensional da curva de dificuldade (1 a 10) cobrindo precisão, velocidade, verticalidade e punição. |
| [`ARCHITECTURAL-LANGUAGE.md`](ARCHITECTURAL-LANGUAGE.md) | Gramática visual brutalista: regras de proporção, iluminação zenital/rasante, silhuetas e materiais. |
| [`MODULAR-ASSET-LIBRARY.md`](MODULAR-ASSET-LIBRARY.md) | Catálogo exato de peças geométricas, plataformas, rampas, arcos, painéis e monólitos instanciados. |
| [`PARKOUR-OBSTACLE-CATALOG.md`](PARKOUR-OBSTACLE-CATALOG.md) | Taxonomia de desafios cinéticos: pré-requisitos, dimensões, zonas de aproximação e métodos de teste. |
| [`LEVEL-VALIDATION.md`](LEVEL-VALIDATION.md) | Protocolo de validação em 6 etapas (Geometria, Movimento, Gameplay, Visual, Performance e Experiência). |
| [`PERFORMANCE-BUDGET.md`](PERFORMANCE-BUDGET.md) | Orçamento estrito para navegadores a 60 FPS: draw calls, vértices, limites de física Rapier3D e instancing. |

---

## 🗺️ 3. As Dez Fases Documentadas (`levels/`)

Cada fase possui um documento Markdown exclusivo e exaustivo na pasta [`levels/`](levels/):

1. **[`LEVEL-01-AWAKENING.md`](levels/LEVEL-01-AWAKENING.md):** *The Awakening* — Limestone Dawn · Tutorial orgânico e primeiros passos no concreto monumental.
2. **[`LEVEL-02-PASSAGE.md`](levels/LEVEL-02-PASSAGE.md):** *The Passage* — Basalt Meridian · Pontes ciclópicas, cadência rítmica e introdução ao wall run.
3. **[`LEVEL-03-MONOLITHS.md`](levels/LEVEL-03-MONOLITHS.md):** *The Monoliths* — Sand & Monoliths · Desfiladeiros, rampas de aceleração e conservação de momentum.
4. **[`LEVEL-04-FRACTURE.md`](levels/LEVEL-04-FRACTURE.md):** *The Fracture* — Raw Concrete Twilight · Lajes rompidas, dual-path e zigue-zague entre fendas.
5. **[`LEVEL-05-ATRIUM.md`](levels/LEVEL-05-ATRIUM.md):** *The Atrium* — Zenith Void · Brutalismo interno, poços verticais de 80m e wall jumps em fenda.
6. **[`LEVEL-06-SUSPENDED.md`](levels/LEVEL-06-SUSPENDED.md):** *The Suspended* — Ocher Meridian · Plataformas cinemáticas móveis, sincronização e travessia aérea.
7. **[`LEVEL-07-INVERSION.md`](levels/LEVEL-07-INVERSION.md):** *The Inversion* — Slate Horizon · Geometria surreal em balanço estático e leitura espacial avançada.
8. **[`LEVEL-08-ABYSS.md`](levels/LEVEL-08-ABYSS.md):** *The Abyss* — Deep Cobalt Fog · O grande mar de névoa, saltos épicos de 22m e maestria cinética.
9. **[`LEVEL-09-ASCENSION.md`](levels/LEVEL-09-ASCENSION.md):** *The Ascension* — Violet Ecliptic Dusk · Integração de todos os sistemas em subida rumo ao cume.
10. **[`LEVEL-10-BEYOND.md`](levels/LEVEL-10-BEYOND.md):** *The Beyond* — Radiant Infinity · Arquitetura minimalista abstrata, silêncio cósmico e contemplação final.

---

## ⚙️ 4. Relação com a Documentação Anterior

Esta especificação **expande e substitui** o planejamento embrionário de apenas três níveis (`Phase 3` em `docs/08-ai-implementation-roadmap`), sem invalidar o motor de física Rapier3D, os módulos de renderização Three.js ou as constantes de movimentação consolidadas em `src/config/movementConfig.ts`.
