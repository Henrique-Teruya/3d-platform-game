# ÁUDIO & ACÚSTICA: SOUND DESIGN, FOLEY E PAISAGEM SONORA
**Documento:** AUD-DOC-001  
**Responsáveis:** Sound Designer & Software Architect  
**Status:** Aprovado

---

## 1. Filosofia Sonora: O Silêncio Dinâmico

Em um universo de monumentalismo solitário e sem inimigos, o áudio desempenha dois papéis vitais:
1. **Fornecer Feedback Cinestésico Tátil:** O jogador "sente" a velocidade, a aderência e o impacto da massa do seu corpo através dos sons de passos, raspadas de slide e vento nos ouvidos.
2. **Amplificar a Sensação de Escala Monumental:** A acústica dos passos ecoando em pátios colossais de concreto faz o jogador sentir a imensidão física do espaço ao redor.

O jogo **não possui trilha sonora orquestral contínua ou música de ação eletrônica barulhenta**. A música consiste em intervenções sutis e contemplativas de sintetizadores analógicos quentes, drones harmônicos e o murmúrio atmosférico do ar.

```
                      ┌─────────────────────────────────┐
                      │    GERENCIADOR DE ÁUDIO WEB     │
                      │       (Web Audio API)           │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     FOLEY DINÂMICO             VENTO PROCEDURAL           ECOS MONUMENTAIS
  Passos, Slide, Impacto     Modulado por Velocidade     ConvolverNode / Delay
   (Variação de Pitch)        (0 m/s a 18 m/s)          (Simulação de Vastez)
```

---

## 2. Sistema de Foley e Resposta de Superfícies

Todos os sons mecânicos possuem variações aleatórias de tom (*pitch variation* de $\pm 5\%$) e volume para evitar repetição mecânica irritante.

### 2.1 Passos e Corrida (Footsteps)
- **Materiais:**
  - *Concreto Áspero:* Som seco, com graves firmes e textura de sola de tênis de borracha.
  - *Pedra Lisa / Basalto:* Som mais agudo e estalado, com ligeiro brilho nos agudos.
- **Cadência:**
  - Caminhada ($3.5\text{ m/s}$): 1 passo a cada $0.55\text{ s}$.
  - Corrida ($7.5\text{ m/s}$): 1 passo a cada $0.38\text{ s}$.
  - Sprint ($11.0\text{ m/s}$): 1 passo a cada $0.28\text{ s}$.

### 2.2 Deslize de Slide (Slide Friction)
- Um loop contínuo e aveludado de fricção de tecido e borracha contra o concreto polido.
- **Modulação:** O volume e o filtro passa-baixas (*Low-Pass Filter*) abrem proporcionalmente à velocidade: a $18\text{ m/s}$ em rampa, o som se torna agressivo e sibilante, comunicando a alta velocidade.

### 2.3 Wall Run e Wall Jump
- **Wall Run:** Passos rítmicos abafados com leve eco lateral e sensação de aderência angular.
- **Wall Jump:** Um som forte de sola de tênis empurrando a parede seguido por um corte seco de impulso de ar.

### 2.4 Aterrissagem (Landing Thuds)
- O impacto é escalonado em três níveis de intensidade baseados na velocidade vertical de chegada ($|v_y|$):
  1. *Queda Suave ($|v_y| < 8\text{ m/s}$):* Apenas o estalo da sola e amortecimento elástico leve.
  2. *Queda Média ($8 \le |v_y| < 18\text{ m/s}$):* Som grave e denso do peso do corpo dobrando os joelhos no concreto, com leve respiração do personagem.
  3. *Queda Alta / Pouso Monumental ($|v_y| \ge 18\text{ m/s}$):* Impacto cavernoso com reverberação prolongada nos monólitos vizinhos.

---

## 3. O Vento Procedural (Speed Audio Cue)

O ar é o velocímetro sonoro natural do jogo:
- Quando o jogador está parado: Ouve-se apenas uma brisa distante e serena ($0.05$ de volume).
- Conforme a velocidade horizontal aumenta de $7\text{ m/s}$ para $18\text{ m/s}$:
  - O volume de uma camada de ruído branco filtrado (*Filtered White Noise*) sobe de $0.0$ para $0.7$.
  - O corte do filtro passa-altas (*High-Pass*) se move de $400\text{ Hz}$ para $2200\text{ Hz}$, criando o som característico de ar cortando as têmporas e os ouvidos.
  - No ápice de um salto longo sobre o abismo, adiciona-se uma camada de ressonância de baixa frequência (*sub-bass rumble* a $45\text{ Hz}$) que transmite a sensação de vertigem física.

---

## 4. Acústica Arquitetônica (Reverb & Impulse Responses)

Para transmitir a escala física colossal dos monólitos, a engine de áudio usa um `ConvolverNode` com *Impulse Response* de espaços gigantescos (catedrais e gargantas de pedra):
- Pátios abertos possuem um tempo de decaimento (*Decay Time*) de $3.5\text{ a } 5.0\text{ segundos}$ com densidade baixa de reflexão inicial.
- Os passos emitem uma cauda de eco que morre lentamente na névoa, lembrando o jogador de que ele está completamente sozinho em um monumento infinito.

---

## 5. Diretrizes de Implementação Técnica (Web Audio API)

1. **Carregamento Assíncrono e Compactação:** Todos os clipes sonoros são codificados em formato `.webm` (Opus) ou `.mp3` de alta qualidade, ocupando menos de $15\text{ MB}$ de memória total.
2. **AudioContext Unlock:** O `AudioContext` é ativado no primeiro clique do usuário na tela (ao travar o Pointer Lock), respeitando as políticas de autoplay dos navegadores.
3. **Master Volume e Sliders:** Suporte a 3 canais de mixagem independentes:
   - Volume Geral (Master).
   - Efeitos Sonoros / Foley (SFX).
   - Atmosfera / Vento (Ambience).
