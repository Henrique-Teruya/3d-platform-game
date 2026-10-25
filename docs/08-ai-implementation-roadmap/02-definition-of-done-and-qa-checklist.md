# ROADMAP PARA IA: DEFINITION OF DONE & CHECKLIST DE QA
**Documento:** PLAN-AI-002  
**Responsáveis:** QA Lead & Technical Game Designer  
**Status:** Aprovado

---

## 1. Critérios Estritos de Conclusão (Definition of Done - DoD)

Uma tarefa ou fase de implementação desenvolvida por agentes de IA só é considerada **CONCLUÍDA** quando satisfizer integralmente todos os seguintes critérios:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     DEFINITION OF DONE (DoD)                           │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. ZERO ERROS      │ 2. TAXA DE QUADROS │ 3. ZERO GC NO LOOP           │
│ TypeScript compila │ 60 FPS estáveis    │ Zero alocações de memória    │
│ com strict: true   │ em 1080p WebGL     │ dentro do tick principal     │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 4. DETERMINISMO    │ 5. REUSABILIDADE   │ 6. CONFORTO VISUAL           │
│ Mesma distância de │ Parâmetros em      │ Sem stuttering, saltos       │
│ salto em 60Hz/144Hz│ config editável    │ de câmera ou camera shake    │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 2. Matriz de Testes Manuais e Automatizados de Parkour

Para validar a integridade mecânica do controller antes de qualquer avanço de fase, os seguintes testes devem ser executados e aprovados:

| ID do Teste | Procedimento de Teste | Resultado Esperado | Tolerância Aceita |
| :--- | :--- | :--- | :--- |
| **TEST-MOV-01** | **Salto Parado (Standing Jump):** Jogador parado salta sobre fenda de $2.5\text{ m}$. | Atinge o outro lado com folga mínima de $0.3\text{ m}$. | $\pm 0.1\text{ m}$ |
| **TEST-MOV-02** | **Salto em Corrida ($7.5\text{ m/s}$):** Salta no limite da borda sobre vão de $5.5\text{ m}$. | Aterrissa com segurança na plataforma. | $\pm 0.2\text{ m}$ |
| **TEST-MOV-03** | **Validação de Coyote Time:** Caminha para fora da plataforma e pressiona `Space` a $80\text{ ms}$ no ar. | O salto é executado com altura vertical completa ($1.6\text{ m}$). | Deve disparar 100% das vezes. |
| **TEST-MOV-04** | **Validação de Jump Buffer:** Pressiona `Space` a $0.5\text{ m}$ de altura antes de aterrissar. | O salto ocorre exatamente no frame de contato com o solo. | Sem perda de frame de velocidade. |
| **TEST-MOV-05** | **Slide em Declive:** Entra em slide em rampa de $30^\circ$ por $2.0\text{ segundos}$. | A velocidade acelera de $7.5\text{ m/s}$ para $17.5-18.0\text{ m/s}$. | Teto fixo em $18.0\text{ m/s}$. |
| **TEST-MOV-06** | **Slide Jump:** Salta no final do declive em alta velocidade. | Transpõe vão horizontal de pelo menos $20.0\text{ metros}$. | $\pm 1.0\text{ m}$ |
| **TEST-MOV-07** | **Wall Run Attachment:** Salta diagonalmente em direção a uma parede vertical a $> 6.0\text{ m/s}$. | Gruda suavemente na parede, gravidade reduz para $25\%$, câmera inclina $10^\circ$. | Duração máxima de $1.5\text{ s}$. |
| **TEST-MOV-08** | **Wall Jump Repulsion:** Pressiona `Space` durante o wall run. | O jogador é arremessado diagonalmente para fora da parede com impulso vertical. | Repulsão clara perpendicular. |
| **TEST-MOV-09** | **Ciclo de Respawn por Void:** O jogador caminha para fora do abismo e atinge $Y < -50\text{ m}$. | A tela faz fade suave e o jogador reaparece no último checkpoint em $< 250\text{ ms}$. | Sem tela preta travada ou bug de câmera. |
| **TEST-MOV-10** | **Teste de Estabilidade 144Hz vs 60Hz:** Executa o percurso em tela de 60Hz e tela de 144Hz. | A distância percorrida e a física são matematicamente indistinguíveis. | Desvio $< 0.5\%$. |

---

## 3. Checklist de Auditoria de Performance WebGL

Antes de aprovar qualquer entrega de cenário ou iluminação:

- [ ] **Auditoria de Draw Calls:** Abrir o painel de estatísticas de renderização Three.js (`renderer.info.render.calls`). O valor deve permanecer $\le 70$ em qualquer ângulo de visão da cena.
- [ ] **Auditoria de Triângulos:** `renderer.info.render.triangles` deve ser $\le 100.000$.
- [ ] **Auditoria de Garbage Collection:** Abrir a aba de *Performance* das ferramentas de desenvolvedor do Chrome e gravar 30 segundos de corrida contínua. A linha de memória heap JS deve apresentar formato plano ("flat line"), sem picos regulares de serrote (*sawtooth pattern*) que indiquem alocação em loop.
- [ ] **Auditoria de Sombras:** Verificar se apenas a luz direcional projeta sombras e se o frustum de sombra acompanha a posição do jogador sem cortes visíveis (*shadow acne* ou *shadow clipping*).
- [ ] **Auditoria de Áudio:** Conferir se os passos cessam imediatamente quando o jogador para de se mover ou entra no ar, e se o vento atinge o volume máximo apenas em alta velocidade.
