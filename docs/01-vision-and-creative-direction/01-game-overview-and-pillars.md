# VISÃO CRIATIVA: VISÃO GERAL E PILARES DO JOGO
**Documento:** GDD-VIS-001  
**Responsáveis:** Game Director & Senior Game Designer  
**Status:** Aprovado para Arquitetura Técnica

---

## 1. O Conceito Central

O projeto é um jogo tridimensional de parkour em primeira pessoa para navegadores, ambientado em um universo silencioso, solitário, minimalista e monumental. O jogador emerge em um mundo de arquitetura desproporcional — monólitos ciclopeos, pontes infinitas, colunas ciclópicas e terraços flutuantes de concreto cru — estendendo-se por horizontes enevoados sem fim visível.

Não existem multidões, cidades habitadas, inimigos patrulhando, marcadores de objetivo agressivos ou elementos sonoros estridentes. O jogador está só diante de formas monumentais. A experiência é uma jornada de contemplação através da cinética do movimento: o prazer cinestésico do salto, da velocidade, do ritmo e da conquista do espaço tridimensional.

### 1.1 Declaração de Premissa (Elevator Pitch)
> *"Um jogo de parkour em primeira pessoa de alta precisão que combina a fluidez mecânica e conservação de momentum dos clássicos de velocidade com a imponência silenciosa de estruturas brutalistas em uma atmosfera contemplativa de solidão e mistério."*

---

## 2. Pilares de Design Fundamentais

Estes quatro pilares guiam todas as decisões de design, arte, código e som do projeto. Qualquer funcionalidade ou ideia proposta que contradiga um destes pilares deve ser descartada ou retrabalhada.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PILARES DE DESIGN                             │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. EXCELÊNCIA      │ 2. MONUMENTALISMO  │ 3. SOLIDÃO CONTEMPLATIVA     │
│    MECÂNICA        │    ARQUITETÔNICO   │    (NÃO-TERROR)              │
│ Movimento ágil,    │ Escalas que geram  │ Espaços liminares vazios,    │
│ responsivo e       │ vertigem e         │ melancolia sutil e sensação  │
│ gratificante por   │ pequenez diante    │ de paz, sem sustos ou        │
│ si só.             │ da matéria.        │ perseguição.                 │
├────────────────────┴────────────────────┴──────────────────────────────┤
│ 4. MINIMALISMO ELEGANTE                                                │
│ Geometria pura, texturas sem poluição visual, HUD discreto, zero ruído.│
└────────────────────────────────────────────────────────────────────────┘
```

### Pilar 1: Excelência Mecânica (Movement First)
- A movimentação do jogador deve ser divertida e satisfatória em uma sala cinza de testes sem texturas nem efeitos visuais.
- Resposta a inputs com latência zero perceptível.
- Curvas de física determinísticas com conservação justa de momentum, permitindo salto fluido entre superfícies.
- Filosofia de controle: tolerante com a intenção do jogador (jump buffering, coyote time) mas rigoroso com o timing e a direção do vetor de velocidade.

### Pilar 2: Monumentalismo Arquitetônico (Scale Shock)
- O jogador mede aproximadamente 1.80m de altura de olhos; os monólitos e pilares medem 50m, 100m, 300m de altura e 40m de largura.
- A arquitetura não replica prédios funcionais do mundo real (não há portas convencionais, janelas de escritório, interruptores ou corrimãos decorativos). Trata-se de pura escultura tectônica, passarelas suspensas, arcos ciclopeos e abismos.
- O contraste constante entre a escala humana e a desproporção do cenário evoca o sublime arquitetônico.

### Pilar 3: Solidão Contemplativa (Atmospheric Peace, Not Horror)
- **Não é um jogo de terror.** O vazio não esconde monstros no escuro; a monumentalidade não é hostil nem opressiva a ponto de paralisar.
- O silêncio e o vento transmitem calma meditativa, solidão poética e maravilhamento.
- A falha (cair no abismo) não possui animações grotescas de morte, sons de ossos quebrando ou telas vermelhas de "Game Over". Ao cair, o jogador simplesmente ressurge instantaneamente no último portal/checkpoint seguro com uma transição suave e etérea, mantendo o fluxo mental (*flow state*).

### Pilar 4: Minimalismo Elegante (Less is More)
- Materiais monocromáticos com paletas refinadas: concreto cinza-claro, pedra calcária, mármore fosco, sombras suaves e gradientes no céu.
- Ausência total de poluição visual: sem barras de stamina piscando, sem números de dano saltando na tela, sem bússola repleta de ícones.
- A leitura visual do percurso é límpida: o jogador deve identificar instantaneamente onde pode pisar, correr e saltar apenas pela silhueta e incidência de luz.

---

## 3. Metas Emocionais do Jogador

Ao jogar, o usuário deve transitar continuamente por quatro estados emocionais bem definidos:

1. **Pequenez & Arrebatamento:** Olhar para cima e sentir que as estruturas tocam o céu infinito; olhar para baixo e ver o abismo afundando na névoa.
2. **Foco e Estado de Fluxo (Flow):** Entrar em sincronia rítmica ao encadear sprint, slide, salto no limite da borda, wall run e pouso amortecido. O jogador para de pensar nos botões e pensa apenas em trajetórias e vetores.
3. **Paz e Alívio:** Ao alcançar um platô superior ou mirante monumental após uma sequência desafiadora, ser recebido por uma vista deslumbrante, vento suave e o eco sereno do ambiente.
4. **Curiosidade Arquitetônica:** O desejo de alcançar o próximo monólito ou estrutura distante apenas para ver que forma geométrica ele possui de perto.

---

## 4. O que o Jogo É vs. O que o Jogo NÃO É

| O Jogo É | O Jogo NÃO É |
| :--- | :--- |
| Um jogo de parkour de alta precisão e momentum | Um simulador militar ou jogo de plataforma casual |
| Uma experiência atmosférica silenciosa e contemplativa | Um jogo de terror psicológico com jumpscares ou perseguições |
| Minimalista e brutalista com geometrias primitivas | Um cenário urbano denso com lixo, grafites, carros e NPCs |
| Focado na maestria e no prazer da navegação espacial | Um jogo com árvores de habilidades, XP, loot e inventário |
| Baseado em respawn ultrarrápido sem punição frustrante | Uma experiência de morte punitiva tipo "soulslike" |
| Um web app leve que roda a 60 FPS direto no navegador | Um jogo pesado dependente de placas de vídeo topo de linha |
