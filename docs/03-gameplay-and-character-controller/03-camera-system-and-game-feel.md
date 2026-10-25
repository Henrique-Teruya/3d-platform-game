# GAMEPLAY & MOVIMENTAÇÃO: SISTEMA DE CÂMERA E GAME FEEL
**Documento:** GAME-SPEC-003  
**Responsáveis:** Gameplay Programmer & UX/UI Designer  
**Status:** Aprovado

---

## 1. Perspectiva em Primeira Pessoa

A visão do jogador é expressa diretamente pela posição da cabeça da cápsula cinemática ($Y_{eye} = 1.70\text{ m}$ em pé; $Y_{eye} = 0.85\text{ m}$ em slide). A imersão depende da precisão do mouse e do feedback cinestésico do ambiente.

```
                  ┌───────────────────────────────┐
                  │    POINTER LOCK API           │
                  │ (Captura de Cursor Raw Delta) │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                     ROTATION CONTROLLER (Euler)
                     Pitch (Vertical): -85° a +85°
                     Yaw (Horizontal): Livre (0° a 360°)
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │               CAMADA DE MODULAÇÃO PROCEDURAL           │
      ├───────────────────────┬────────────────────────────────┤
      │ Dynamic FOV           │ Aumenta com a velocidade       │
      │ Roll / Lean Dinâmico  │ Inclina no Wall Run e Strafe   │
      │ Landing Impact        │ Amortece levemente no pouso    │
      │ Anti-Shake Filter     │ Zero sacudida brusca (Conforto)│
      └───────────────────────┴────────────────────────────────┘
                                  │
                                  ▼
                     [ CÂMERA FINAL THREE.JS ]
```

---

## 2. Controle do Mouse e Pointer Lock API

### 2.1 Requisitos de Entrada
- O jogo solicita a captura de mouse via `document.body.requestPointerLock()` ao primeiro clique na tela.
- **Leitura Delta Sem Aceleração de SO:** Leitura direta de `movementX` e `movementY` dos eventos do navegador, multiplicados pelo fator de sensibilidade configurável pelo usuário.
- **Suavização Mínima:** A rotação horizontal (Yaw) e vertical (Pitch) é aplicada instantaneamente para garantir precisão reflexiva de parkour. Nenhuma interpolação lenta ou "mouse lag" é permitida no eixo principal de mira.
- **Limites de Pitch:** Clamped estritamente entre $-85.0^\circ$ e $+85.0^\circ$ para evitar inversões de matriz de projeção (*gimbal lock*).

---

## 3. Feedbacks Visuais Procedurais (Juice / Game Feel)

### 3.1 Variação Dinâmica de Campo de Visão (Dynamic FOV)
O FOV da câmera se expande dinamicamente para comunicar a aceleração e a sensação de velocidade monumental sem distorcer o centro da tela:
- **FOV Base (Repouso / Caminhada):** $85^\circ$ (configurável pelo usuário no menu de acessibilidade entre $70^\circ$ e $105^\circ$).
- **FOV Máximo (Slide em Rampa a $18\text{ m/s}$):** $\text{FOV}_{base} + 12^\circ$.
- **Fórmula de Interpolação:**
  $$\text{targetFOV} = \text{FOV}_{base} + \text{clamp}\left(\frac{\|\vec{v}_{xz}\| - V_{walk}}{V_{sprint\_max} - V_{walk}}, 0, 1\right) \times 12^\circ$$
  $$\text{currentFOV} = \text{lerp}(\text{currentFOV}, \text{targetFOV}, 8.0 \times \Delta t)$$

### 3.2 Inclinação Lateral de Câmera (Roll / Tilt)
Pequenas inclinações no eixo Z da câmera fornecem feedback tátil de curvas e manobras acrobáticas:
1. **Wall Run à Direita:** A câmera inclina suavemente $-10^\circ$ (roll no sentido anti-horário, afastando a visão da parede).
2. **Wall Run à Esquerda:** A câmera inclina $+10^\circ$ (roll no sentido horário).
3. **Curvas Rápidas em Slide (Strafe Lean):** Pequena inclinação proporcional ao produto vetorial entre o vetor de velocidade e o vetor de aceleração lateral (máximo $\pm 3.5^\circ$).
4. **Interpolação de Retorno:** Ao sair do wall run, a câmera retorna a $0^\circ$ de roll com curva elástica amortecida (*Spring-Damper* ou `lerp` com fator $12.0$).

### 3.3 Amortecimento de Aterrissagem (Landing Impact)
Ao colidir com o solo vindo de uma queda livre:
- O impacto gera um deslocamento vertical descendente suave na posição local da câmera:
  $$\Delta Y_{offset} = -\min\left(0.20\text{ m}, \frac{|v_y|}{45.0} \times 0.20\right)$$
- Acompanhado de uma ligeira rotação de pitch para baixo (máximo $2.5^\circ$).
- Uma mola de amortecimento restaura a câmera para a posição neutra em $0.18\text{ segundos}$. Isso transmite o peso do corpo absorvendo o impacto com os joelhos sem bloquear a visão do jogador para o próximo salto.

---

## 4. Conforto Visual e Prevenção de Enjoo (Anti-Motion Sickness)

Muitos jogos em primeira pessoa geram náuseas devido ao movimento desordenado da câmera. O projeto adota uma política rigorosa de conforto:

| Elemento de Câmera | Abordagem Adotada | Justificativa |
| :--- | :--- | :--- |
| **Head Bobbing (Balanço ao caminhar)** | **Desativado por padrão** (opção de oscilação sutil máxima de 2cm nas configurações). | O balanceamento contínuo em tela cansa a visão e atrapalha a precisão de saltos entre pilares estreitos. |
| **Camera Shake por Dano/Queda** | **Zero sacudida brusca de tela.** | O feedback de queda é fornecido por som de impacto e compressão vertical da câmera, sem chacoalhar a mira. |
| **Ponto Focal Central (Retícula)** | **Retícula central tênue sempre presente** (pequeno ponto branco com opacidade ajustável). | Fornece uma âncora visual estável no centro da visão, reduzindo significativamente o enjoo de movimento. |
| **Transições de Respawn** | **Fade suave para branco/cinza-névoa** (100ms) em vez de corte abrupto. | Evita flashes de contraste alto que desorientam o usuário. |
