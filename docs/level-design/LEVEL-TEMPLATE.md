# FORMULÁRIO TÉCNICO DE ESPECIFICAÇÃO DE FASE (LEVEL TEMPLATE)
**Template ID:** LVL-TMPL-V2  
**Finalidade:** Guia e formulário padronizado para autoria de novas fases em FLOAT por designers humanos ou agentes de IA.

---

> **Instruções para o Agente ou Designer:**  
> Ao criar uma nova fase (ex: "Fase 11 — Submerged Sanctuary"), duplique esta estrutura integralmente e preencha todas as seções abaixo sem omitir campos técnicos, métricas de coordenadas ou critérios de teste.

---

# LEVEL [XX] — [NOME DA FASE EM MAIÚSCULAS]

## A. Identidade e Metadados
- **Número da Fase:** [ex: 04]
- **ID Técnico:** `level-[XX]` [ex: `level-04`]
- **Nome Oficial:** `LEVEL [XX] — [NOME]` [ex: `LEVEL 04 — THE FRACTURE`]
- **Subtítulo:** `[Bioma / Paleta] · [Assinatura Cinética e Temática]` [ex: `Raw Concrete Twilight · Shattered Slabs, Dual-Path & Narrow Spans`]
- **Conceito Central:** [Resumo em 2 a 3 frases da premissa arquitetônica e sensação espacial]
- **Objetivo Emocional:** [Qual estado de espírito o jogador deve experimentar: vertigem, alívio, triunfo, foco cirúrgico]
- **Objetivo de Gameplay:** [Habilidades que o jogador deve exercitar ou consolidar neste nível]
- **Posição na Progressão:** [Onde se situa no arco macro de 1 a 10 e qual o incremento em relação à fase anterior]
- **Transição da Fase Anterior:** [Como o início deste nível dialoga com o final da fase imediatamente precedente]

---

## B. Direção Artística e Atmosfera
- **Bioma Arquitetônico:** [`awakening` | `monoliths` | `ascension` | novo bioma customizado]
- **Paleta Cromática Predominante:**
  - *Céu (Zênite / Horizonte / Base):* `[#HEX] / [#HEX] / [#HEX]`
  - *Luz Solar (Key Light):* `[#HEX]`, Intensidade `[ex: 1.4]`, Ângulo `[ex: [95, 130, -85]]`
  - *Luz Hemisférica (Sky / Ground):* `[#HEX] / [#HEX]`, Intensidade `[ex: 0.7]`
  - *Névoa (`FogExp2`):* Cor `[#HEX]`, Densidade `[ex: 0.0025]`
  - *Concreto Primário / Secundário:* `[#HEX] / [#HEX]`
  - *Detalhes e Trilhos Guia Emissivos:* `[#HEX]`
- **Materiais e Texturas:** [Especificar acabamentos: concreto aparente Tadao Ando, basalto polido, granito fosco]
- **Silhuetas e Monumentos Distantes:** [Descrever os elementos colossais no horizonte e seu ângulo cardinal]
- **Áudio e Acústica Procedural:**
  - *Acorde Bioma (Web Audio API):* Notas fundamentais [ex: D3 / A3 ou Bb2 / F3]
  - *Intensidade de Vento:* Variação dinâmica com a velocidade ($0$ a $20\text{ m/s}$)
  - *Reverberação e Eco:* Espaços abertos vs fendas estreitas

---

## C. Mecânicas de Movimento
- **Mecânicas Praticadas (Já Aprendidas):** [ex: Walk, Run, Sprint, Standing Jump, Running Jump]
- **Novas Mecânicas Introduzidas (se houver):** [ex: Wall Jump em Fenda Zigue-Zague, Plataformas Móveis Sincronizadas]
- **Cadeias Mecânicas Exigidas:** [ex: Sprint $\rightarrow$ Slide em Rampa 22° $\rightarrow$ Salto Parabólico 18m $\rightarrow$ Wall Run]
- **Mecânicas para Rota Avançada (Opcionais):** [ex: Air Strafe agudo, bunny hop consecutivo para corte de tempo]

---

## D. Estrutura do Percurso (Segmentos Detalhados)
*Divida o nível em 4 a 6 segmentos cronológicos. Cada segmento deve respeitar o loop de micro-pacing.*

### Segmento 1: [Nome do Segmento, ex: O Pátio de Partida]
- **Faixa de Coordenadas Z:** de `[Z_início]` até `[Z_fim]` (ex: de $Z = +6$ até $Z = -25$)
- **Ponto Focal Visual:** [O que atrai o olhar do jogador ao nascer no segmento]
- **Geometria Funcional:** [Tamanhos e cotas das lajes de aproximação]
- **Obstáculos e Vãos:** [Distâncias em metros e tipo de salto exigido]
- **Rota Primária (Segura):** [Descrição passo a passo da rota tolerante]
- **Rota Avançada (Momentum):** [Descrição da linha de velocidade máxima]
- **Ponto de Checkpoint:** ID `cp-0`, Posição `[X, Y, Z]`, Raio `3.8m`
- **Condição de Falha:** Queda no vazio abaixo de `voidKillY = [Y]` $\rightarrow$ Respawn suave em `cp-0`
- **Transição:** [Como o final deste segmento engaja no início do próximo]

### Segmento 2: [Nome do Segmento, ex: A Grande Rampa de Aceleração]
*(Repetir a estrutura acima para todos os segmentos até o Portal Final)*

---

## E. Layout Espacial e Tabela de Coordenadas
*Esta tabela permite que o arquivo TypeScript `LEVEL_XX_[NOME].ts` seja montado sem ambiguidades por agentes de IA.*

### E.1 Plataformas Principais (`platforms`)
| ID da Plataforma | Posição Superior `[X, Y, Z]` | Dimensões `[L, A, P]` | Superfície | Guia Luminosa? | Pilar Estrutural? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `l[XX]-p1-start` | `[0, 0, 0]` | `[12, 2.5, 24]` | `concrete` | Sim | Sim |
| `l[XX]-p2-span`  | `[0, 0.4, -20]` | `[8.5, 2.5, 10]` | `concrete` | Sim | Não |

### E.2 Rampas de Slide (`ramps`)
| ID da Rampa | Centro Mundial `[X, Y, Z]` | Dimensões `[L, A, P]` | Inclinação (Pitch) | Yaw (Graus) | Slide Chute? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `l[XX]-ramp-1` | `[0, -1.2, -60]` | `[8.5, 1.2, 16]` | `22°` | `0°` | Sim |

### E.3 Painéis de Wall Run (`wallPanels`)
| ID do Painel | Centro Mundial `[X, Y, Z]` | Dimensões `[Espessura, Altura, Comprimento]` | Yaw (Graus) | Lado Relativo |
| :--- | :---: | :---: | :---: | :---: |
| `l[XX]-wall-r` | `[4.5, 2.0, -80]` | `[0.9, 7.5, 16.0]` | `0°` | Direita |

### E.4 Arcos Monumentais e Portais de Slide (`arches`)
| ID do Arco | Base `[X, Y, Z]` | Largura Abertura | Altura Abertura | Largura Pilares | Altura Lintel | Profundidade |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `l[XX]-arch-gate` | `[0, 0, -10]` | `9.0m` | `13.0m` (Alto) | `2.2m` | `3.2m` | `2.8m` |
| `l[XX]-slide-gate`| `[0, 0.8, -55]`| `5.5m` | `1.34m` (Slide) | `1.5m` | `4.5m` | `2.4m` |

### E.5 Plataformas Móveis Cinemáticas (`movingPlatforms`)
| ID | Posição Inicial Superior | Posição Final Superior | Dimensões `[X, Y, Z]` | Velocidade (`m/s`) | Fase Inicial |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `l[XX]-mp-1` | `[0, 0.4, -30]` | `[0, 0.8, -38]` | `[7.5, 1.4, 7.5]` | `1.35` | `0` |

### E.6 Monólitos Distantes Instanciados (`distantMonoliths`)
| Posição `[X, Y, Z]` | Dimensões `[L, A, P]` | Rotação Y (Graus) | Papel na Composição |
| :---: | :---: | :---: | :--- |
| `[-45, 50, -60]` | `[16, 200, 16]` | `12°` | Âncora de silhueta no flanco esquerdo |

### E.7 Checkpoints e Ponto de Respawn
- **Cota de Queda Fatal (`voidKillY`):** `[ex: -45.0m]`
- **Ponto Inicial de Spawn:** `[0, 0, 6]`, Yaw `0°`
- **Tabela de Checkpoints:**
| ID | Nome do Altar | Posição `[X, Y, Z]` | Yaw de Respawn | Raio de Ativação |
| :--- | :--- | :---: | :---: | :---: |
| `l[XX]-cp-0` | Terraço de Partida | `[0, 0, -5]` | `0°` | `3.8m` |
| `l[XX]-cp-final` | Mirante do Santuário | `[0, -2.0, -110]` | `0°` | `3.8m` |

### E.8 Portal Final de Conclusão (`finishPortal`)
- **Posição Central:** `[0, -2.0, -125]`
- **Raio do Portal:** `3.8m`

---

## F. Monumentos Assinatura
*Descreva os 2 a 3 monumentos memoráveis que definem a identidade única desta fase.*
1. **[Nome do Monumento 1]:** Escala, geometria, posicionamento e relação cinemática com o jogador.
2. **[Nome do Monumento 2]:** Papel na quebra de horizonte e orientação visual.

---

## G. Dificuldade e Curva de Tensão
- **Classificação Geral:** `[1 a 10]`
- **Notas por Vetor de Desafio (1 a 10):**
  - *Precisão de Aterrissagem:* `[X/10]`
  - *Velocidade e Momentum:* `[X/10]`
  - *Exigência de Wall Run / Jump:* `[X/10]`
  - *Verticalidade / Queda Livre:* `[X/10]`
  - *Punição de Falha (Distância até CP):* `[X/10]`
- **Erros Mais Comuns Esperados de Testadores:** [Identificar onde os jogadores costumam errar e como o cenário ameniza a frustração]

---

## H. Metas de Tempo de Jogo (Design Targets)
- **Primeira Conclusão (Exploração Cautelosa):** `[ex: 75 segundos]`
- **Par Time (Corrida Fluida sem Falhas):** `[ex: 45 segundos]`
- **Speedrun / Rota de Mestria:** `[ex: 28 segundos]`

---

## I. Matriz de Validação e Critérios de Aceite
- [ ] Todas as distâncias respeitam os limites máximos calculados da tabela da Bíblia de Level Design.
- [ ] Nenhum salto cego presente; toda aterrissagem possui silhueta ou iluminação direta visível.
- [ ] Todas as fendas de slide possuem gabarito livre vertical entre $1.25\text{ m}$ e $1.40\text{ m}$.
- [ ] O número de draw calls estimado fica abaixo de 70 com todas as instâncias ativas.
- [ ] A fase é validável por bot determinístico com 100% de sucesso no teste Vitest de colisão física.
