# UX & UI: ACESSIBILIDADE, CONTROLES E CONFIGURAÇÕES
**Documento:** UI-DOC-002  
**Responsáveis:** UX/UI Designer & Gameplay Programmer  
**Status:** Aprovado

---

## 1. Mapeamento Padrão de Controles (Default Keybindings)

O esquema de controles padrão é desenhado para a mão esquerda no teclado e a mão direita no mouse, seguindo as convenções consagradas dos títulos de tiro em primeira pessoa e parkour:

| Ação | Tecla Padrão (QWERTY / ABNT2) | Alternativa / Secundária | Descrição do Comportamento |
| :--- | :---: | :---: | :--- |
| **Mover para Frente** | `W` | `Seta Acima` | Move na direção do vetor da câmera. |
| **Mover para Esquerda** | `A` | `Seta Esquerda` | Strafe lateral esquerdo. |
| **Mover para Trás** | `S` | `Seta Abaixo` | Recuo lento de reposicionamento. |
| **Mover para Direita** | `D` | `Seta Direita` | Strafe lateral direito. |
| **Salto / Wall Jump** | `Espaço` | `Botão Direito do Mouse` | Impulso ascendente / repulsão da parede. |
| **Sprint** | `Shift Esquerdo` | `Mouse Button 4` | Aceleração para velocidade máxima. |
| **Slide / Agachar** | `Ctrl Esquerdo` | `C` | Deslize no chão / encurtamento de cápsula. |
| **Caminhada Fina** | `Alt Esquerdo` | - | Caminhada lenta de ajuste em bordas. |
| **Olhar / Mirar** | `Movimento do Mouse` | - | Controle yaw e pitch em primeira pessoa. |
| **Menu de Pausa** | `Esc` | `P` | Libera o mouse e abre as configurações. |
| **Respawn Manual** | `R` (segurar por 1.0s) | - | Retorna ao último checkpoint sem esperar queda. |

---

## 2. Painel de Acessibilidade e Conforto Visual

O jogo inclui uma aba dedicada a acessibilidade no menu de configurações para garantir que qualquer usuário possa desfrutar da experiência sem desconforto:

### 2.1 Conforto Visual e Anti-Enjoo
- **Ajuste de FOV (Campo de Visão):** Slider contínuo de $70^\circ$ a $110^\circ$ (padrão $85^\circ$).
- **Dynamic FOV (Efeito de Velocidade):** Toggle `[Ativado / Desativado]`. Jogadores sensíveis a alterações dinâmicas de lente podem manter o FOV fixo.
- **Camera Roll / Tilt (Inclinação em Wall Run e Curvas):** Slider de $0\%$ a $100\%$ (permite zerar a inclinação da câmera em wall runs se causar vertigem).
- **Intensidade da Retícula Central:** Slider de $0\%$ a $100\%$ de opacidade, com opção de trocar a cor para amarelo de alto contraste (`#FFEE58`) ou ciano (`#26C6DA`).
- **Landing Camera Dip (Amortecimento de Pouso):** Toggle `[Ativado / Desativado]`.

### 2.2 Ajuste Fino de Controles
- **Sensibilidade do Mouse:** Slider com escala logarítmica de $0.1$ a $5.0$ (padrão $1.0$).
- **Inverter Eixo Y do Mouse:** Toggle `[Normal / Invertido]`.
- **Modo de Sprint:** Toggle `[Segurar Tecla / Alternar (Toggle)]`.
- **Modo de Slide:** Toggle `[Segurar Tecla / Alternar (Toggle)]`.
- **Remapeamento Completo de Teclas:** Interface simples onde o usuário clica na ação e pressiona qualquer tecla do teclado para reatribuir.

### 2.3 Opções de Áudio e Legibilidade
- Volumes independentes com feedback sonoro imediato no slider.
- Suporte a layout de teclado AZERTY com detecção automática inicial de código de tecla (`KeyboardEvent.code` em vez de `KeyboardEvent.key`).
- Salvamento automático de todas as preferências em `localStorage` do navegador.
