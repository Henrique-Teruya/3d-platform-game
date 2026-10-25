# GRAMÁTICA ARQUITETÔNICA BRUTALISTA — FLOAT
**Documento Técnico:** LAG-001  
**Status:** Aprovado  
**Público-Alvo:** 3D Environment Artists, Level Designers e Agentes de IA

---

## 1. Princípios do Monumentalismo Brutalista

A arquitetura de FLOAT inspira-se no brutalismo geométrico radical (Tadao Ando, Le Corbusier, Ricardo Bofill em *La Muralla Roja*, e Étienne-Louis Boullée em suas estruturas ciclópicas conceituais):

1. **Pureza das Formas Primitivas:** NUNCA utilize detalhes ornamentais orgânicos, molduras decorativas, calhas simuladas ou portas funcionais convencionais. Toda estrutura é composta por cuboides puros, cilindros monumentais, planos inclinados e toros de concreto.
2. **Desproporção Escalar (Scale Shock):** As peças funcionais de parkour (onde o jogador pisa) possuem de $1.2\text{ m}$ a $12\text{ m}$ de largura; as estruturas que as ancoram medem de $40\text{ m}$ a $300\text{ m}$ de altura. Esse choque gera a vertigem e a sensação sublime de pequenez diante da matéria.
3. **Composição em Vez de Ruído:** O detalhamento visual não vem de polígonos extras ou texturas barulhentas, mas do ritmo das sombras projetadas pelo sol em ângulo baixo ($30^\circ-45^\circ$) e do contraste entre planos iluminados e em penumbra.

---

## 2. Biblioteca Conceitual de Elementos Reutilizáveis

Abaixo estão os 15 elementos arquitetônicos oficiais de FLOAT:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   OS 15 ELEMENTOS ARQUITETÔNICOS BASE                  │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. Monolith        │ 6. Ramp            │ 11. Atrium                   │
│ 2. Pillar          │ 7. Floating Ledge  │ 12. Void Platform            │
│ 3. Arch / Portal   │ 8. Suspended Span  │ 13. Broken Path              │
│ 4. Colossal Bridge │ 9. Slide Gate      │ 14. Vertical Shaft           │
│ 5. Massive Stepper │ 10. Lookout Tower  │ 15. Observation Plateau      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### 2.1 Monolith (Monólito Colossal)
- **Função Estética:** Âncora de silhueta no horizonte; bússola de navegação cardinal (Weenie).
- **Função Mecânica:** Referência visual distante; pode servir de parede para Wall Run longo de 20m.
- **Dimensões Relativas:** $14\text{ m}$ a $38\text{ m}$ de largura $\times 120\text{ m}$ a $300\text{ m}$ de altura $\times 14\text{ m}$ a $30\text{ m}$ de profundidade.
- **Variações:** Prismático retangular puro, topo chanfrado a $45^\circ$, ou par duplo simétrico.
- **Colisão:** `PhysicsWorld.addStaticBox` ou puramente visual se estiver além de $150\text{ m}$.
- **Custo de Render:** 1 draw call compartilhado via `InstancedMesh`.

### 2.2 Pillar (Coluna Cilíndrica e Quadrada)
- **Função Estética:** Ritmo visual em perspectiva de profundidade (formação da colunata infinita).
- **Função Mecânica:** Ponto de aterrissagem topo-a-topo para saltos cadenciados em sequência.
- **Dimensões Relativas:** $\varnothing 3.0\text{ m}$ a $6.0\text{ m}$ (cilindro) ou $4.0\text{ m} \times 4.0\text{ m}$ (quadrada) $\times 30\text{ m}$ a $80\text{ m}$ de altura.
- **Colisão:** Cilindro cinemático ou caixa cúbica estática no topo.

### 2.3 Arch / Monumental Portal (Arco Triunfal Brutalista)
- **Função Estética:** Enquadramento de linhas de visão (vista para o próximo setor); marcação de limiar.
- **Função Mecânica:** Portal de entrada ou saída; o lintel superior projeta sombra rasante no piso.
- **Dimensões Relativas:** Abertura livre de $8.0\text{ m}$ a $16.0\text{ m}$ de largura $\times 12.0\text{ m}$ a $24.0\text{ m}$ de altura.

### 2.4 Colossal Bridge (Ponte Suspensa Monumental)
- **Função Estética:** Linha horizontal monumental que conecta dois platôs separados pelo abismo.
- **Função Mecânica:** Pista de aceleração e sprint contínuo livre de interrupções.
- **Dimensões Relativas:** $6.0\text{ m}$ a $12.0\text{ m}$ de largura $\times 2.5\text{ m}$ de espessura $\times 40\text{ m}$ a $100\text{ m}$ de comprimento.

### 2.5 Massive Stepper (Degraus Ciclópicos)
- **Função Estética:** Escadarias gigantescas para uma civilização de proporções sobre-humanas.
- **Função Mecânica:** Subida gradual de cota vertical sem exigir pulos cegos.
- **Dimensões Relativas:** Espelho de $0.8\text{ m}$ a $1.4\text{ m}$ (altura) $\times$ piso de $3.0\text{ m}$ a $5.0\text{ m}$ (profundidade).

### 2.6 Ramp (Rampa de Declive e Slide Chute)
- **Função Estética:** Linha diagonal agressiva que corta a horizontalidade do terreno.
- **Função Mecânica:** Aceleração explosiva em slide até $18\text{ m/s}$, preparando o vetor de salto longo.
- **Dimensões Relativas:** $8.0\text{ m}$ de largura $\times 14\text{ m}$ a $35\text{ m}$ de comprimento, inclinação de $18^\circ$ a $30^\circ$.
- **Material:** Basalto polido com mapa de setas direcionais sutis (`slideRampSurface`).

### 2.7 Floating Ledge (Laje em Balanço Estático)
- **Função Estética:** Estruturas que parecem desafiar a gravidade através de engenharia massiva em balanço.
- **Função Mecânica:** Plataforma de aterrissagem primária sobre o vazio.
- **Dimensões Relativas:** $6.0\text{ m} \times 2.0\text{ m} \times 8.0\text{ m}$ a $16.0\text{ m} \times 2.5\text{ m} \times 20.0\text{ m}$.

### 2.8 Suspended Span (Viga Estreita de Precisão)
- **Função Estética:** Fita delgada de concreto suspensa a centenas de metros acima do fundo enevoado.
- **Função Mecânica:** Rota de alta tensão para jogadores veteranos; menor margem de erro lateral ($1.4\text{ m}$).
- **Dimensões Relativas:** $1.4\text{ m}$ a $2.0\text{ m}$ de largura $\times 1.0\text{ m}$ de espessura $\times 16\text{ m}$ a $32\text{ m}$ de extensão.

### 2.9 Slide Gate (Pórtico de Slide com Lintel Baixo)
- **Função Estética:** Fenda tectônica comprimida forçando o jogador a olhar para baixo e para frente.
- **Função Mecânica:** Filtro mecânico obrigatório: exige que o jogador entre em Slide (`Ctrl`) para passar.
- **Dimensões Relativas:** Abertura vertical livre de $1.32\text{ m}$ a $1.35\text{ m}$; largura de $5.0\text{ m}$ a $7.0\text{ m}$.

### 2.10 Lookout Tower (Torre e Mirante)
- **Função Estética:** Monumento vertical solitário que ancora uma curva no percurso.
- **Função Mecânica:** Plataforma de observação intermediária onde o jogador desacelera e contempla.
- **Dimensões Relativas:** $8.0\text{ m} \times 8.0\text{ m}$ de base $\times 40\text{ m}$ de altura.

### 2.11 Atrium (Átrio Monumental Interno)
- **Função Estética:** Catedral laica de concreto com iluminação zenital cortando a penumbra.
- **Função Mecânica:** Espaço de transição onde o eco dos passos e do vento ganha ressonância profunda.
- **Dimensões Relativas:** $30\text{ m}$ de largura $\times 60\text{ m}$ de comprimento $\times 70\text{ m}$ de pé-direito livre.

### 2.12 Void Platform (Plataforma Ilha no Mar de Névoa)
- **Função Estética:** Laje solitária sem pilares visíveis descendo até o fundo do mar de névoa.
- **Função Mecânica:** Ponto focal de aterrissagem em trechos de salto extremo.
- **Dimensões Relativas:** $4.0\text{ m} \times 4.0\text{ m}$ a $8.0\text{ m} \times 8.0\text{ m}$.

### 2.13 Broken Path (Caminho Tectônico Rompido)
- **Função Estética:** Ruptura de uma grande calha ou laje que parece ter se partido por forças geológicas.
- **Função Mecânica:** Sequência de saltos rítmicos em corrida com vãos crescentes ($4.0\text{ m} \rightarrow 5.5\text{ m} \rightarrow 6.8\text{ m}$).

### 2.14 Vertical Shaft (Poço Vertical com Fendas Opostas)
- **Função Estética:** Abismo interno ascendente estreito com luz descendo do topo distante.
- **Função Mecânica:** Subida rítmica em zigue-zague via Wall Jump consecutivo entre paredes opostas separadas por $3.5\text{ m}$.

### 2.15 Observation Plateau (Platô Santuário Final)
- **Função Estética:** Pátio aberto colossal onde repousa o Portal de Conclusão da fase.
- **Função Mecânica:** Área ampla e segura sem risco de queda; desaceleração suave, som de vento calmante e êxtase de vitória.
- **Dimensões Relativas:** $16.0\text{ m} \times 3.0\text{ m} \times 24.0\text{ m}$.

---

## 3. Evolução Visual ao Longo das Dez Fases

```
FAMILIARIDADE (01–03)    ──► FRAGMENTAÇÃO (04–06)   ──► DESORIENTAÇÃO (07–08)  ──► TRANSCENDÊNCIA (09–10)
Concreto claro, pontes       Lajes rompidas, fendas,    Monólitos invertidos,      Arquitetura pura radiante,
contínuas e ordem cúbica     verticalidade e balanço    geometrias paradoxais      silêncio sublime e infinito
```
