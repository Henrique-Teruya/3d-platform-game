# GAMEPLAY & MOVIMENTAÇÃO: MATEMÁTICA E FÍSICA DO CONTROLLER
**Documento:** GAME-SPEC-002  
**Responsáveis:** Technical Game Designer & Gameplay Programmer  
**Status:** Aprovado para Implementação

---

## 1. Visão Geral da Arquitetura Física

O controller do jogo baseia-se em um modelo **cinemático de integração com passo fixo (*Fixed Timestep Kinematic Integration*)**, inspirado nos fundamentos mecânicos da *Quake Engine* e *Source Engine*, porém adaptado para a suavidade e previsibilidade de um jogo moderno de parkour.

O ciclo de atualização física roda estritamente a $60\text{ Hz}$ fixos ($\Delta t = 1/60 \approx 0.016667\text{ s}$), independentemente da taxa de atualização da tela ou das variações de renderização do Three.js.

```
       RENDER TICK (Three.js requestAnimationFrame - Delta variável)
                     │
                     ▼
          ACUMULADOR DE TEMPO (accumulator += renderDelta)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   WHILE (accumulator >= 1/60):
     - Ler Inputs Atuais do Buffer
     - Executar KinematicPhysicsTick(dt = 1/60)
     - Resolver Colisões & Slopes
     - Decrementar accumulator -= 1/60
         │
         ▼
   INTERPOLAÇÃO DE RENDER (alpha = accumulator / fixedDelta)
   mesh.position = lerp(previousState.pos, currentState.pos, alpha)
```

---

## 2. Equações Fundamentais de Movimento

### 2.1 Aceleração e Atrito no Solo (Ground Physics)

Quando o jogador está em contato com uma superfície caminhável (`isGrounded == true`):

#### Atrito no Solo:
O atrito é aplicado antes da aceleração para desacelerar gradualmente o jogador caso nenhuma direção de entrada seja solicitada:

$$\text{speed} = \|\vec{v}_{xz}\|$$

$$\text{if } \text{speed} > 0: \quad \text{drop} = \text{speed} \times \mu_{ground} \times \Delta t$$

$$\vec{v}_{xz} \leftarrow \vec{v}_{xz} \times \max\left(0, \frac{\text{speed} - \text{drop}}{\text{speed}}\right)$$

Onde:
- $\vec{v}_{xz}$ é o vetor de velocidade horizontal bidimensional.
- $\mu_{ground}$ é o coeficiente de atrito no solo ($8.0\text{ s}^{-1}$ na corrida normal, $0.8\text{ s}^{-1}$ durante o Slide).

#### Aceleração Direcional no Solo:
Dado o vetor de entrada normalizado $\hat{w}_{wish}$ e a velocidade máxima desejada $V_{max}$:

$$\text{current\_proj} = \vec{v}_{xz} \cdot \hat{w}_{wish}$$

$$\text{add\_speed} = \max\left(0, V_{max} - \text{current\_proj}\right)$$

$$\text{accel\_step} = \min\left(\text{add\_speed}, a_{ground} \times V_{max} \times \Delta t\right)$$

$$\vec{v}_{xz} \leftarrow \vec{v}_{xz} + \hat{w}_{wish} \times \text{accel\_step}$$

Onde:
- $a_{ground}$ é o fator de aceleração no solo ($12.0$).
- $V_{max}$ varia conforme o modo: Caminhada ($3.5\text{ m/s}$), Corrida ($7.5\text{ m/s}$), Sprint ($11.0\text{ m/s}$).

---

### 2.2 Aceleração Aérea e Strafe (Air Physics & Bunny Hopping)

No ar (`isGrounded == false`), o atrito é zero ($\mu_{air} = 0$). Isso garante que a velocidade acumulada antes de saltar permaneça inalterada horizontalmente.

Para permitir controle suave no ar sem que o jogador possa acelerar infinitamente para frente segurando `W`:

$$\text{current\_proj} = \vec{v}_{xz} \cdot \hat{w}_{wish}$$

$$\text{add\_speed} = \max\left(0, V_{air\_cap} - \text{current\_proj}\right)$$

$$\text{accel\_step} = \min\left(\text{add\_speed}, a_{air} \times V_{air\_cap} \times \Delta t\right)$$

$$\vec{v}_{xz} \leftarrow \vec{v}_{xz} + \hat{w}_{wish} \times \text{accel\_step}$$

Onde:
- $V_{air\_cap} = 2.5\text{ m/s}$ (teto de projeção da velocidade no ar na direção do wishdir).
- $a_{air} = 40.0$ (fator de aceleração lateral aérea para strafing responsivo).
- **Mecânica de Strafe/Bhop:** Como $\vec{v}_{xz} \cdot \hat{w}_{wish} \approx 0$ quando o jogador olha a $90^\circ$ do movimento e segura `A` ou `D` sincronizado com o giro do mouse, `add_speed` é positivo e a magnitude $\|\vec{v}_{xz}\|$ cresce elegantemente, recompensando a habilidade mecânica.

---

### 2.3 Dinâmica Gravitacional e Salto com Altura Variável

A gravidade é tratada como aceleração descendente no eixo $Y$:

$$v_y(t + \Delta t) = v_y(t) - g_{eff} \times \Delta t$$

#### Tabela de Modificadores de Gravidade ($g_{eff}$):

| Situação do Jogador | Multiplicador | Gravidade Efetiva ($g_{eff}$) |
| :--- | :---: | :--- |
| **Subida do Salto (Segurando `Space`)** | $1.0\times$ | $22.0\text{ m/s}^2$ |
| **Subida do Salto (Soltou `Space` antes do ápice)** | $2.2\times$ | $48.4\text{ m/s}^2$ (corte rápido de salto) |
| **Descida / Queda Livre** | $1.4\times$ | $30.8\text{ m/s}^2$ (sensação ágil e sem flutuação) |
| **Wall Run Ativo** | $0.25\times$ | $5.5\text{ m/s}^2$ (deslize vertical suave na parede) |

- **Velocidade Terminal de Queda:** $v_{y, \min} = -45.0\text{ m/s}$. Impede problemas de colisão por tunelamento em quedas profundas.

#### Força de Impulso de Salto Inicial:
Para alcançar uma altura de salto desejada $h_{jump} = 1.6\text{ metros}$ com gravidade base $g = 22.0\text{ m/s}^2$:

$$v_{jump\_initial} = \sqrt{2 \times g \times h_{jump}} = \sqrt{2 \times 22.0 \times 1.6} \approx 8.39\text{ m/s}$$

---

### 2.4 Dinâmica de Slide em Rampas

Quando o jogador está em slide em uma superfície inclinada com normal unitária $\hat{n}$:

O vetor de declive apontando para baixo da rampa é a projeção da gravidade na face:

$$\vec{d}_{slope} = \frac{\hat{g} - (\hat{g} \cdot \hat{n})\hat{n}}{\|\hat{g} - (\hat{g} \cdot \hat{n})\hat{n}\|}, \quad \text{onde } \hat{g} = (0, -1, 0)$$

O ângulo de inclinação $\theta$ é dado por:

$$\cos \theta = \hat{n} \cdot (0, 1, 0)$$

Aceleração aplicada ao longo de $\vec{d}_{slope}$:

$$a_{slide} = g \times \sin \theta - \mu_{slide} \times g \times \cos \theta$$

- Em um declive de $30^\circ$ ($\sin 30^\circ = 0.5$): a aceleração líquida é positiva e rápida, impulsionando o jogador até o teto de slide ($18.0\text{ m/s}$).
- Em piso plano ($\theta = 0^\circ$): $\sin 0 = 0$, resultando em desaceleração controlada pelo atrito $\mu_{slide} = 0.8$.

---

### 2.5 Resolução Cinemática de Colisão (Slide and Collide)

O jogador é modelado como uma cápsula vertical (ou cilindro com extremidades arredondadas) com raio $R = 0.40\text{ m}$ e altura $H = 1.80\text{ m}$ (reduzida para $H_{slide} = 0.90\text{ m}$ durante o slide).

A cada tick de física, a posição avança com um algoritmo de até 3 iterações de projeção na superfície:

```typescript
function moveAndSlide(velocity: THREE.Vector3, dt: number): THREE.Vector3 {
  let remainingTime = dt;
  let currentVel = velocity.clone();

  for (let iteration = 0; iteration < 3; iteration++) {
    const sweepDist = currentVel.length() * remainingTime;
    if (sweepDist < 0.001) break;

    const hit = castPlayerCapsule(playerPos, currentVel.clone().normalize(), sweepDist);
    if (!hit) {
      playerPos.addScaledVector(currentVel, remainingTime);
      break;
    }

    // Move até a fração segura antes do impacto
    playerPos.addScaledVector(currentVel, hit.fraction * remainingTime);
    remainingTime -= hit.fraction * remainingTime;

    // Projeta o vetor restante no plano de colisão (elimina componente contra a normal)
    const normal = hit.normal;
    const dot = currentVel.dot(normal);
    if (dot < 0) {
      currentVel.sub(normal.clone().multiplyScalar(dot));
    }
  }
  return currentVel;
}
```
Esse algoritmo impede atravessar quinas de monólitos, subir em superfícies proibidas e colar em paredes.
