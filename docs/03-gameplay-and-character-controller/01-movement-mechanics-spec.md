# GAMEPLAY & MOVIMENTAÇÃO: ESPECIFICAÇÃO DAS 20 MECÂNICAS
**Documento:** GAME-SPEC-001  
**Responsáveis:** Gameplay Programmer & Senior Game Designer  
**Status:** Aprovado para Implementação

---

## 1. Filosofia do Character Controller

A movimentação é o pilar supremo do projeto. O jogador nunca deve sentir que está lutando contra a física ou preso em animações rígidas que roubam o controle. A física é **cinemática customizada** (*Kinematic Controller*), garantindo previsibilidade determinística, sem o comportamento esponjoso ou instabilidade de colisões baseadas em corpos rígidos puros (*Dynamic Rigidbodies*).

```
          [ TECLADO / MOUSE ]
                  │
                  ▼
       ┌────────────────────────┐
       │   INPUT BUFFER & INTENT │  ◄── Coyote Time, Jump Buffer, Key Debounce
       └──────────┬─────────────┘
                  │
                  ▼
       ┌────────────────────────┐
       │  STATE MACHINE DO      │  ◄── Walk, Sprint, Slide, Air, WallRun
       │  CONTROLLER DE PARKOUR │
       └──────────┬─────────────┘
                  │
                  ▼
       ┌────────────────────────┐
       │ KINEMATIC SOLVER       │  ◄── Raycasts, Shapecasts, Resolução de Normal
       │ (Detecção de Paredes)  │
       └──────────┬─────────────┘
                  │
                  ▼
       [ POSIÇÃO & CÂMERA DO JOGADOR ]
```

---

## 2. Matriz de Priorização (MVP vs. Post-MVP)

Abaixo está a avaliação crítica das 20 mecânicas solicitadas, categorizadas entre essenciais para o MVP (Fase 1 e 2) e mecânicas de expansão/polimento (Fase 3+):

| # | Mecânica | Prioridade | Escopo | Justificativa de Game Design |
| :-: | :--- | :---: | :---: | :--- |
| **01** | **Caminhada (Walk)** | P0 | MVP | Movimentação base de exploração e ajuste fino em bordas estreitas. |
| **02** | **Corrida (Jog/Run)** | P0 | MVP | Velocidade de cruzeiro padrão sem necessidade de segurar teclas adicionais. |
| **03** | **Sprint** | P0 | MVP | Aceleração máxima para transpor vãos médios e iniciar slides velozes. |
| **04** | **Salto (Jump)** | P0 | MVP | Ação primária de transposição vertical e horizontal. |
| **05** | **Controle Aéreo (Air Control)** | P0 | MVP | Permite correção sutil de trajetória no ar sem matar o vetor de velocidade. |
| **06** | **Preservação de Momentum** | P0 | MVP | A velocidade ganha em rampas/slides é mantida ao saltar em cadeia. |
| **07** | **Aceleração e Desaceleração** | P0 | MVP | Dá peso e naturalidade ao movimento, evitando transições secas binárias. |
| **08** | **Coyote Time** | P0 | MVP | Permite saltar até 120ms após sair fisicamente de uma plataforma. Essencial para conforto. |
| **09** | **Jump Buffering** | P0 | MVP | Registra o input de pulo até 100ms antes de tocar o solo e executa no frame de toque. |
| **10** | **Slide (Deslize)** | P0 | MVP | Permite passar sob fendas, acelera em declives e preserva momentum em curvas. |
| **11** | **Bunny Hopping** | P1 | MVP | Saltos ritmados e strafes no ar que convertem e preservam velocidade máxima (estilo Quake/Source). |
| **12** | **Wall Jump** | P1 | MVP | Salto de repulsão em superfícies verticais para ganhar altura entre paredes próximas. |
| **13** | **Wall Run** | P1 | MVP | Correr horizontalmente em paredes lisas por tempo delimitado para cruzar abismos. |
| **14** | **Dash Aéreo/Terrestre** | P2 | Post-MVP | Avaliado como secundário; introduz complexidade de binding e pode trivializar rotas de salto. |
| **15** | **Interação com Rampas** | P0 | MVP | Ajuste de velocidade em declives (aumenta no slide) e aclives (reduz suavemente). |
| **16** | **Checkpoints Silenciosos** | P0 | MVP | Portais monolíticos etéreos que salvam a posição sem travar o gameplay. |
| **17** | **Respawn Instantâneo** | P0 | MVP | Retorno ao último checkpoint em < 200ms com fade suave, sem tela de Game Over. |
| **18** | **Sistema de Queda e Void** | P0 | MVP | Limite inferior de altitude que aciona o respawn sem penalidade punitiva. |
| **19** | **Plataformas Móveis** | P2 | Post-MVP | Plataformas que adicionam seu vetor de velocidade ao jogador ao saltar. |
| **20** | **Feedback de Aterrissagem** | P0 | MVP | Compressão suave de câmera (pitch tilt) e foley de impacto proporcional à queda. |

---

## 3. Especificação Detalhada das Mecânicas do MVP

### 01, 02 e 03. Caminhada, Corrida e Sprint
- **Entradas:** `W, A, S, D` para direção no plano horizontal. `Shift` para Sprint (ou alternar nas opções para Sprint contínuo).
- **Comportamento:**
  - Sem `Shift`: Corrida padrão a $7.0\text{ m/s}$.
  - Com `Shift`: Sprint acelerado até $11.0\text{ m/s}$.
  - `Ctrl` com velocidade baixa: Caminhada cautelosa a $3.5\text{ m/s}$ (impede quedas acidentais em bordas se o modo "Edge Safety" estiver ativado).

### 04. Salto (Jump) & Altura Variável
- **Entrada:** `Space`.
- **Dinâmica:** Se o jogador soltar o `Space` antes do ápice da parábola, a gravidade é multiplicada por um fator de corte ($1.8\times$), permitindo saltos curtos (*hop*) ou saltos altos (*full leap*).
- **Tempo no Ar Base:** $\approx 0.65\text{ segundos}$ para salto estático; mais longo se projetado de uma rampa.

### 05 e 06. Controle Aéreo e Preservação de Momentum
- Ao sair do solo, a velocidade horizontal do jogador não é reiniciada. Se o jogador estava a $14\text{ m/s}$ após um slide em rampa, ele entra no ar a $14\text{ m/s}$.
- O controle direcional aéreo (`Air Control`) não permite acelerar instantaneamente para frente, mas permite desviar suavemente a trajetória horizontal via strafe (`A` ou `D` sincronizado com o movimento do mouse).

### 08 e 09. Coyote Time e Jump Buffering
- **Coyote Time ($t_{coyote} = 0.12\text{ s}$):** Contador decrementado após a flag `isGrounded` se tornar falsa sem pulo. Se o jogador pressionar `Space` dentro dessa janela, o pulo é concedido com força normal.
- **Jump Buffer ($t_{buffer} = 0.10\text{ s}$):** Se o jogador pressionar `Space` no ar enquanto desce a menos de $0.8\text{ m}$ do solo, o comando fica em fila e é disparado no exato instante da aterrissagem, permitindo encadear pulos sem perder 1 único frame de velocidade.

### 10. Slide (Deslize de Fricção Reduzida)
- **Entrada:** Pressionar `Ctrl` ou `C` enquanto corre no chão acima de $6.0\text{ m/s}$.
- **Comportamento:**
  - A altura da câmera desce suavemente de $1.80\text{ m}$ para $0.90\text{ m}$ em $0.15\text{ s}$.
  - A bounding box de colisão é reduzida pela metade (permite passar por vãos baixos sob monólitos).
  - Em superfície plana: A velocidade desacelera lentamente devido ao baixo atrito cinético.
  - Em declive (rampa descendente): O vetor de gravidade é projetado na tangente do plano, **acelerando o jogador até o teto de $18.0\text{ m/s}$**.
  - O jogador pode saltar diretamente de um slide, transferindo toda a velocidade horizontal para o salto (*Slide Jump*).

### 12 e 13. Wall Run e Wall Jump
- **Detecção:** Raycasts laterais (raio de $0.7\text{ m}$) disparados à esquerda e à direita do jogador quando `!isGrounded` e velocidade horizontal $> 6.0\text{ m/s}$.
- **Ângulo da Parede:** Superfície vertical com normal entre $75^\circ$ e $105^\circ$ em relação à gravidade.
- **Duração do Wall Run:** Máximo de $1.5\text{ segundos}$ por parede contínua. Durante o wall run, a gravidade cai para $25\%$ do valor normal.
- **Câmera:** Inclina suavemente $10^\circ$ na direção oposta à parede (roll sutil).
- **Wall Jump:** Pressionar `Space` durante o wall run aplica um impulso composto: $60\%$ perpendicular à parede (repulsão) + $40\%$ para frente + impulso vertical completo de pulo.

### 15. Interação com Rampas
- Se a inclinação da superfície for $< 45^\circ$, é tratada como solo caminhável.
- Se a inclinação for $> 45^\circ$, é tratada como superfície íngreme escorregadia (o jogador escorrega para a base sem poder subir).
- No cálculo de velocidade de subida e descida, utiliza-se a projeção do vetor de velocidade no plano da face:
  $$\vec{v}_{proj} = \vec{v} - (\vec{v} \cdot \hat{n})\hat{n}$$

### 16, 17 e 18. Checkpoints, Void e Respawn
- **Checkpoints:** Volumes invisíveis ou placas geométricas que atualizam a tupla `(position, yawRotation)`. Não interrompem a velocidade do jogador ao atravessar.
- **Void Threshold:** Coordenada $Y < Y_{kill}$ (ex: $-50\text{ metros}$ abaixo da menor estrutura do setor).
- **Respawn:** 
  1. A câmera desvanece suavemente para a cor da névoa em $100\text{ ms}$.
  2. A posição e a velocidade do jogador são resetadas para o último checkpoint.
  3. A velocidade horizontal é zerada e a câmera reaparece em $100\text{ ms}$.
  4. Total de ciclo de respawn: $\approx 200\text{ ms}$, eliminando frustração.
