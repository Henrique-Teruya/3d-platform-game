# UX & UI: DESIGN DE HUD, INTERFACE E MENUS
**Documento:** UI-DOC-001  
**Responsáveis:** UX/UI Designer & Gameplay Programmer  
**Status:** Aprovado

---

## 1. Filosofia de Interface: Invisibilidade e Respeito à Imersão

Em conformidade com a visão minimalista e monumental do jogo, **a melhor interface é aquela que quase não existe**. A tela do jogador é uma janela desimpedida para o mundo brutalista. Toda informação que puder ser transmitida pelo ambiente, pelo som ou pela câmera deve dispensar elementos 2D flutuantes.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Esc] Pausa (Canto Sup. Esquerdo - Tênue)                              │
│                                                                        │
│                                                                        │
│                                                                        │
│                                  •  ◄── Retícula Central Minimalista   │
│                                         (Ponto Branco Tênue)           │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                 [Setor 2: Colunata]    │
│                                                 (Notificação Tênue)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Elementos de HUD em Gameplay

### 2.1 A Retícula Central (The Anchor Dot)
- **Visual:** Um único círculo diminuto de $3\text{ px}$ de diâmetro, cor branca pura (`#FFFFFF`), com $40\%$ de opacidade padrão.
- **Função:**
  - Serve como âncora visual para neutralizar enjoo de movimento (*motion sickness*).
  - Serve como ponto de mira de precisão para calcular onde os pés aterrissarão em pilares estreitos.
- **Reação Dinâmica Opcional:**
  - Quando em slide a alta velocidade: o ponto se expande sutilmente para um anel tênue de $8\text{ px}$.
  - Quando em contato com parede válida para wall run: duas linhas finas horizontais muito discretas surgem nas laterais do anel.

### 2.2 Velocímetro e Timer (Opcional / Modo Speedrun)
- Por padrão, o jogo não exibe números de velocidade ou cronômetros na tela para manter a contemplação poética.
- No menu de configurações, o jogador pode ativar o **Modo Fluidez / Speedrun**:
  - Exibe a velocidade horizontal atual em metros por segundo (`14.2 m/s`) em tipografia suíça monoespaçada limpa no canto inferior direito com opacidade reduzida ($50\%$).
  - Exibe um cronômetro de precisão (`02:14.480`) sem fundos opacos ou caixas pesadas.

### 2.3 Notificações de Checkpoint e Setor
- Ao cruzar um novo setor ou registrar um checkpoint:
  - Uma linha de texto tipográfico elegante surge suavemente no centro-inferior da tela com fade-in de $0.5\text{ s}$, permanece por $1.5\text{ s}$ e desvanece suavemente:
    *ex: "ZONA 2 — A COLUNATA INFINITA"*
  - Sem efeitos sonoros de fanfarra espalhafatosos. Apenas um suave acorde harmônico de piano ou sintetizador distante.

---

## 3. Fluxo de Menus e Estados de Interface

```
┌─────────────────────────┐
│     TELA DE ENTRADA     │ ──► Clique do Mouse ──► [ POINTER LOCK ATIVADO ]
│   "CLIQUE PARA ENTRAR"  │                                 │
└─────────────────────────┘                                 ▼
                                                    [ GAMEPLAY DIRETO ]
                                                            │
                                                     Tecla [ESC]
                                                            │
                                                            ▼
                                                ┌───────────────────────┐
                                                │    MENU DE PAUSA      │
                                                │ - Retomar Jogo        │
                                                │ - Configurações       │
                                                │ - Acessibilidade      │
                                                │ - Reiniciar do Início │
                                                └───────────────────────┘
```

### 3.1 Design do Menu de Pausa
- Ao pressionar `ESC`:
  - O cursor do mouse é liberado.
  - O fundo do jogo é levemente desfocado (*CSS backdrop-filter: blur(12px)*) com um overlay monocromático cinza-escuro com $60\%$ de transparência.
  - Tipografia: Sans-serif moderna, geométrica, com espaçamento generoso (*letter-spacing*).
  - Animações: Transições sutis de opacidade ($200\text{ ms}$). Zero efeitos tridimensionais barulhentos.
