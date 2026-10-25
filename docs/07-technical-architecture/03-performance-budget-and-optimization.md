# ARQUITETURA TÉCNICA: OTIMIZAÇÃO E PERFORMANCE (ZERO GARBAGE COLLECTION)
**Documento:** ARCH-DOC-003  
**Responsáveis:** Software Architect & Technical Artist  
**Status:** Aprovado

---

## 1. O Inimigo Silencioso: Garbage Collection (GC Pauses)

Em jogos de navegador que exigem alta precisão de input e física determinística (como parkour), as pausas de coleta de lixo do motor V8 do JavaScript são a causa número 1 de engasgos e perda de saltos (*stutters*). Uma pausa de GC de apenas 15 milissegundos é suficiente para engolir um frame e descartar a janela de um coyote time ou jump buffer.

**Regra de Ouro do Projeto:**  
> *"Nenhum objeto, vetor, quaternion ou matriz deve ser instanciado (`new`) dentro do loop principal de atualização (`tick`, `update`, `fixedUpdate`, `render`)."*

---

## 2. Padrão de Reuso de Memória e Pools de Vetores

Todos os cálculos de álgebra linear de física cinemática e projeção de câmera utilizam instâncias de vetores estáticas pré-alocadas no escopo do módulo (*Scratchpad Vectors*):

```typescript
// PADRÃO CORRETO: Vetores estáticos reutilizáveis (Zero Alocação)
const _scratchVecA = new THREE.Vector3();
const _scratchVecB = new THREE.Vector3();
const _scratchNormal = new THREE.Vector3();

export class KinematicPhysics {
  public calculateWishVelocity(wishDir: THREE.Vector3, speed: number): THREE.Vector3 {
    // Reutiliza o vetor preexistente sem criar novo objeto na memória heap
    _scratchVecA.copy(wishDir).multiplyScalar(speed);
    return _scratchVecA;
  }
}
```

```typescript
// PADRÃO PROIBIDO: Gera milhares de objetos por segundo no heap
export class BadPhysics {
  public calculateWishVelocity(wishDir: THREE.Vector3, speed: number) {
    return wishDir.clone().multiplyScalar(speed); // PROIBIDO NO LOOP
  }
}
```

---

## 3. Gerenciamento de Geometria e Instanciação

Para manter menos de 70 draw calls em cenas monumentais que contêm milhares de colunas e lajes:

1. **`THREE.InstancedMesh` para Peças Repetitivas:**
   - As colunatas da Zona 2 possuem até 800 pilares cilíndricos idênticos.
   - Em vez de 800 `Mesh` separados, usa-se 1 único `InstancedMesh(cylinderGeometry, concreteMaterial, 800)`.
   - As posições e rotações são configuradas via `instancedMesh.setMatrixAt(i, matrix)` na inicialização.
   - A GPU renderiza toda a colunata em uma única chamada de desenho (*single draw call*).

2. **Frustum Culling Automático e Otimizado:**
   - Todos os objetos estáticos possuem `matrixAutoUpdate = false`, poupando milhares de multiplicações de matriz 4x4 por frame na CPU.
   - Os bounding spheres dos monólitos são calculados uma única vez na inicialização.

3. **Descarte Seguro de Recursos (Disposal Lifecycle):**
   - Ao trocar de zona ou reiniciar o jogo:
     - Chamar explicitamente `geometry.dispose()` em todas as malhas.
     - Chamar `material.dispose()` e liberar texturas com `texture.dispose()`.
     - Isso impede vazamento progressivo de VRAM ao longo de sessões prolongadas de jogo.

---

## 4. Orçamento de Tempo de CPU e GPU (Frame Budget)

O tempo total disponível por frame a 60 FPS é de $16.66\text{ ms}$. O projeto estabelece o seguinte teto por subsistema:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOTAL DISPONÍVEL: 16.66 ms (100%)                                      │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ FÍSICA CINEMÁTICA  │ ATUALIZAÇÃO GAME   │ RENDERIZAÇÃO GPU THREE.JS    │
│ 2.5 ms (15%)       │ 1.5 ms (9%)        │ 8.5 ms (51%)                 │
├────────────────────┴────────────────────┼──────────────────────────────┤
│ BUFFER DE FOLGA DO NAVEGADOR & ÁUDIO    │ MARGEM DE SEGURANÇA          │
│ 2.0 ms (12%)                            │ 2.16 ms (13%)                │
└─────────────────────────────────────────┴──────────────────────────────┘
```

Se em qualquer momento o tempo de CPU ultrapassar $5.0\text{ ms}$, os raycasts de detecção do controller devem ser otimizados (ex: usar raycasts apenas nos eixos com velocidade relevante em vez de varreduras esféricas omnidirecionais).
