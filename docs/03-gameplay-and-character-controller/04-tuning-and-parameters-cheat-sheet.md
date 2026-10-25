# GAMEPLAY & MOVIMENTAÇÃO: TABELA DE CONSTANTES E CALIBRAÇÃO (TUNING MATRIX)
**Documento:** GAME-SPEC-004  
**Responsáveis:** Technical Game Designer  
**Status:** Calibração Inicial Aprovada para Prototipagem

---

## 1. Visão Geral da Configuração

Todas as variáveis do character controller devem ser externalizadas em um arquivo central de configuração TypeScript (`src/gameplay/movementConfig.ts`) ou objeto de dados estático, permitindo integração direta com ferramentas de debug em tempo real (como `lil-gui` ou `tweakpane`) durante os testes de sensação de jogo (*playtesting*).

---

## 2. Tabela Mestra de Parâmetros e Constantes

| Parâmetro | Chave de Configuração | Valor Padrão | Intervalo Recomendado | Unidade | Descrição / Efeito |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Passo Físico Fixo** | `FIXED_DELTA_TIME` | `1 / 60` | `1/60` a `1/120` | segundos | Frequência de atualização da física cinemática. |
| **Altura em Pé** | `PLAYER_HEIGHT_STAND` | `1.80` | `1.70 - 1.90` | metros | Altura total da cápsula de colisão do jogador. |
| **Altura da Câmera (Em Pé)** | `CAMERA_EYE_HEIGHT_STAND` | `1.70` | `1.60 - 1.75` | metros | Posição Y da câmera relativa à base do jogador. |
| **Altura em Slide** | `PLAYER_HEIGHT_SLIDE` | `0.90` | `0.80 - 1.00` | metros | Altura da cápsula reduzida durante o deslizamento. |
| **Altura da Câmera (Slide)** | `CAMERA_EYE_HEIGHT_SLIDE` | `0.85` | `0.75 - 0.95` | metros | Posição Y da câmera durante o slide. |
| **Raio da Cápsula** | `PLAYER_RADIUS` | `0.40` | `0.35 - 0.45` | metros | Raio horizontal da cápsula do jogador. |
| **Velocidade de Caminhada** | `SPEED_WALK` | `3.5` | `3.0 - 4.5` | m/s | Velocidade base lenta para bordas estreitas. |
| **Velocidade de Corrida** | `SPEED_RUN` | `7.5` | `6.5 - 8.5` | m/s | Velocidade de cruzeiro padrão sem Shift. |
| **Velocidade de Sprint** | `SPEED_SPRINT` | `11.0` | `10.0 - 12.5` | m/s | Velocidade máxima ao segurar Shift. |
| **Teto de Velocidade Aérea** | `AIR_CAP_SPEED` | `2.5` | `2.0 - 3.5` | m/s | Limite de projeção direcional no ar ($V_{air\_cap}$). |
| **Velocidade Máxima Slide** | `SPEED_SLIDE_MAX` | `18.0` | `15.0 - 22.0` | m/s | Velocidade terminal permitida ao descer rampas em slide. |
| **Aceleração no Chão** | `ACCEL_GROUND` | `12.0` | `10.0 - 16.0` | scalar | Quão rápido o jogador atinge a velocidade desejada. |
| **Atrito no Chão** | `FRICTION_GROUND` | `8.0` | `6.0 - 10.0` | scalar | Taxa de desaceleração ao soltar as teclas de movimento. |
| **Aceleração no Ar (Strafe)** | `ACCEL_AIR` | `40.0` | `30.0 - 55.0` | scalar | Força de curva e ganho de velocidade no bunny hop / strafe. |
| **Atrito no Slide** | `FRICTION_SLIDE` | `0.8` | `0.5 - 1.2` | scalar | Atrito cinético residual em terreno plano durante slide. |
| **Força de Salto Inicial** | `JUMP_INITIAL_VELOCITY` | `8.4` | `7.5 - 9.5` | m/s | Impulso ascendente instantâneo no frame do salto. |
| **Gravidade Base** | `GRAVITY_BASE` | `22.0` | `18.0 - 26.0` | m/s² | Aceleração descendente padrão. |
| **Multiplicador Queda Livre** | `GRAVITY_FALL_MULT` | `1.4` | `1.2 - 1.6` | scalar | Multiplica gravidade quando $v_y < 0$ para evitar flutuação. |
| **Multiplicador Corte de Pulo**| `GRAVITY_CUT_MULT` | `2.2` | `1.8 - 2.5` | scalar | Aumenta gravidade se o jogador soltar o `Space` no ar. |
| **Velocidade Terminal Queda** | `TERMINAL_FALL_SPEED` | `-45.0` | `-40.0 a -55.0`| m/s | Limite físico de velocidade de queda. |
| **Janela de Coyote Time** | `COYOTE_TIME` | `0.12` | `0.08 - 0.15` | segundos | Tempo de tolerância para saltar após sair do chão. |
| **Janela de Jump Buffer** | `JUMP_BUFFER_TIME` | `0.10` | `0.08 - 0.14` | segundos | Tempo de registro de comando de pulo antes da aterrissagem. |
| **Duração Máxima Wall Run** | `WALL_RUN_MAX_DURATION`| `1.50` | `1.20 - 1.80` | segundos | Duração máxima de corrida em uma única parede contínua. |
| **Gravidade no Wall Run** | `WALL_RUN_GRAVITY_MULT`| `0.25` | `0.15 - 0.35` | scalar | Redução de queda vertical enquanto corre na parede. |
| **Impulso Wall Jump Horizontal**| `WALL_JUMP_REPULSE` | `6.5` | `5.0 - 8.0` | m/s | Força normal de repulsão perpendicular à parede. |
| **Impulso Wall Jump Vertical** | `WALL_JUMP_VERTICAL` | `7.8` | `6.5 - 8.5` | m/s | Força ascendente ao saltar da parede. |
| **Ângulo Máximo de Rampa** | `MAX_WALKABLE_SLOPE` | `45.0` | `40.0 - 48.0` | graus | Ângulo a partir do qual a superfície se torna escorregadia. |
| **Roll de Câmera Wall Run** | `CAMERA_WALL_ROLL_ANGLE`| `10.0` | `8.0 - 12.0` | graus | Inclinação lateral de câmera ao correr na parede. |
| **Shift de FOV por Velocidade**| `CAMERA_MAX_FOV_BOOST` | `12.0` | `8.0 - 15.0` | graus | Expansão máxima do FOV em alta velocidade. |

---

## 3. Hipóteses para Validação por Playtesting

1. **Equilíbrio entre Coyote Time e Trapaça Percebida:**  
   Se `COYOTE_TIME > 0.15s`, testadores sentem que o personagem está pulando "no ar como mágica". Se `< 0.08s`, o jogo parece duro e frustrante. O valor de $0.12\text{ s}$ é a zona ideal de conforto.
2. **Sensação de Controle no Ar:**  
   $V_{air\_cap} = 2.5\text{ m/s}$ permite que o jogador ajuste pousos em pilares estreitos sem permitir manobras impossíveis de reversão em 180° sem perda de velocidade.
3. **Fluidez Rampa -> Salto:**  
   Ao descer uma rampa de 30° em slide por 2 segundos e saltar na borda, a distância horizontal percorrida deve atingir entre $22\text{ m}$ e $26\text{ m}$, proporcionando uma sensação épica de salto monumental.
