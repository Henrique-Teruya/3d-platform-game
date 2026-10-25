import * as THREE from 'three';
import type { LevelDefinition } from '../levels/LevelTypes';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { MaterialLibrary } from './MaterialLibrary';

export interface CheckpointVisual {
  id: string;
  coreMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  baseY: number;
  activated: boolean;
}

export interface FinishPortalVisual {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  coreCrystal: THREE.Mesh;
}

export class FirstPersonParkourRig {
  public readonly group = new THREE.Group();
  private readonly leftArm: THREE.Group;
  private readonly rightArm: THREE.Group;
  private stridePhase = 0;

  constructor(materials: MaterialLibrary) {
    // Sleek geometric parkour gauntlets / forearms visible at the lower periphery
    const armGeo = new THREE.BoxGeometry(0.085, 0.075, 0.36);
    const cuffGeo = new THREE.BoxGeometry(0.095, 0.085, 0.08);
    const bladeGeo = new THREE.BoxGeometry(0.02, 0.03, 0.28);

    const buildArm = (isRight: boolean): THREE.Group => {
      const armGroup = new THREE.Group();
      const forearm = new THREE.Mesh(armGeo, materials.gauntletArmor);
      const cuff = new THREE.Mesh(cuffGeo, materials.trimDark);
      cuff.position.set(0, 0, -0.08);
      const blade = new THREE.Mesh(bladeGeo, materials.gauntletTrim);
      blade.position.set(isRight ? 0.048 : -0.048, 0.015, -0.02);
      armGroup.add(forearm, cuff, blade);
      return armGroup;
    };

    this.leftArm = buildArm(false);
    this.rightArm = buildArm(true);

    this.leftArm.position.set(-0.28, -0.26, -0.38);
    this.rightArm.position.set(0.28, -0.26, -0.38);

    this.group.add(this.leftArm, this.rightArm);
  }

  public update(
    dt: number,
    hSpeed: number,
    isGrounded: boolean,
    isSliding: boolean,
    wallRunSide: 'none' | 'left' | 'right',
    reducedMotion: boolean,
  ): void {
    if (reducedMotion) {
      this.leftArm.position.set(-0.28, -0.25, -0.38);
      this.rightArm.position.set(0.28, -0.25, -0.38);
      this.leftArm.rotation.set(0.12, 0.12, 0);
      this.rightArm.rotation.set(0.12, -0.12, 0);
      return;
    }

    const speedRatio = Math.min(1.6, hSpeed / 8.0);
    if (isGrounded && !isSliding && hSpeed > 1.0) {
      this.stridePhase += dt * (7.5 + speedRatio * 4.5);
    }

    const swingL = Math.sin(this.stridePhase) * 0.065 * speedRatio;
    const swingR = -swingL;
    const bobL = Math.abs(Math.cos(this.stridePhase)) * 0.035 * speedRatio;
    const bobR = Math.abs(Math.sin(this.stridePhase)) * 0.035 * speedRatio;

    if (isSliding) {
      // Lower and forward stabilized slide posture
      this.leftArm.position.set(-0.31, -0.22, -0.42);
      this.rightArm.position.set(0.31, -0.27, -0.34);
      this.leftArm.rotation.set(0.28, 0.22, -0.18);
      this.rightArm.rotation.set(0.05, -0.15, 0.15);
    } else if (wallRunSide !== 'none') {
      // Wall contact reach
      const onRight = wallRunSide === 'right';
      this.leftArm.position.set(-0.28, onRight ? -0.24 : -0.16, -0.41 + swingL * 0.5);
      this.rightArm.position.set(0.28, onRight ? -0.16 : -0.24, -0.41 + swingR * 0.5);
      this.leftArm.rotation.set(0.2, 0.1, onRight ? 0 : 0.35);
      this.rightArm.rotation.set(0.2, -0.1, onRight ? -0.35 : 0);
    } else if (!isGrounded) {
      // Airborne reach
      this.leftArm.position.set(-0.29, -0.2, -0.42);
      this.rightArm.position.set(0.29, -0.2, -0.42);
      this.leftArm.rotation.set(0.26, 0.14, -0.08);
      this.rightArm.rotation.set(0.26, -0.14, 0.08);
    } else {
      // Ground stride
      this.leftArm.position.set(-0.28, -0.26 + bobL, -0.38 + swingL);
      this.rightArm.position.set(0.28, -0.26 + bobR, -0.38 + swingR);
      this.leftArm.rotation.set(0.14 - swingL * 1.4, 0.12, 0);
      this.rightArm.rotation.set(0.14 - swingR * 1.4, -0.12, 0);
    }
  }
}

export class BrutalistBuilder {
  public readonly levelGroup = new THREE.Group();
  public readonly checkpointVisuals: CheckpointVisual[] = [];
  public finishPortalVisual: FinishPortalVisual | null = null;
  private readonly geometriesToDispose: THREE.BufferGeometry[] = [];

  constructor(
    private readonly materials: MaterialLibrary,
    private readonly physics: PhysicsWorld,
  ) {}

  public buildLevel(level: LevelDefinition): void {
    this.clear();

    // 1. Build Playable Platforms & Substructures
    const pillarPositions: Array<{ x: number; y: number; z: number; sx: number; sy: number; sz: number }> = [];

    for (const plat of level.platforms) {
      const [tx, ty, tz] = plat.topPosition;
      const [sx, sy, sz] = plat.size;
      const centerY = ty - sy * 0.5;

      // Physics Collider
      this.physics.addStaticBox(
        plat.id,
        { x: tx, y: centerY, z: tz },
        { x: sx, y: sy, z: sz },
        undefined,
        {
          surfaceType: plat.surfaceType ?? 'concrete',
          isWallRunnable: plat.isWallRunnable ?? false,
        },
      );

      // Visual Authored Brutalist Slab
      const slabGeo = new THREE.BoxGeometry(sx, sy, sz);
      this.geometriesToDispose.push(slabGeo);
      const mat =
        plat.surfaceType === 'basalt'
          ? this.materials.concreteSecondary
          : this.materials.concretePrimary;
      const slabMesh = new THREE.Mesh(slabGeo, mat);
      slabMesh.position.set(tx, centerY, tz);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      this.levelGroup.add(slabMesh);

      // Upper architectural bevel trim
      const trimGeo = new THREE.BoxGeometry(sx + 0.16, 0.16, sz + 0.16);
      this.geometriesToDispose.push(trimGeo);
      const trimMesh = new THREE.Mesh(trimGeo, this.materials.trimDark);
      trimMesh.position.set(tx, ty - 0.1, tz);
      trimMesh.receiveShadow = true;
      this.levelGroup.add(trimMesh);

      // Central directional route inlay strip
      if (plat.hasGuideInlay !== false && sz >= 4) {
        const inlayWidth = Math.min(1.1, sx * 0.22);
        const inlayGeo = new THREE.BoxGeometry(inlayWidth, 0.04, sz - 0.8);
        this.geometriesToDispose.push(inlayGeo);
        const inlayMesh = new THREE.Mesh(inlayGeo, this.materials.guideInlay);
        inlayMesh.position.set(tx, ty + 0.01, tz);
        this.levelGroup.add(inlayMesh);
      }

      // Queue deep substructure pillar into the abyss
      if (plat.hasSubstructurePillar !== false) {
        const pillarHeight = 90;
        pillarPositions.push({
          x: tx,
          y: ty - sy - pillarHeight * 0.5,
          z: tz,
          sx: Math.max(1.6, sx * 0.55),
          sy: pillarHeight,
          sz: Math.max(1.6, sz * 0.55),
        });
      }
    }

    // Render all deep substructure pillars in 1 InstancedMesh draw call
    if (pillarPositions.length > 0) {
      const unitBox = new THREE.BoxGeometry(1, 1, 1);
      this.geometriesToDispose.push(unitBox);
      const instancedPillars = new THREE.InstancedMesh(
        unitBox,
        this.materials.concreteSecondary,
        pillarPositions.length,
      );
      const dummy = new THREE.Object3D();
      pillarPositions.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.sx, p.sy, p.sz);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        instancedPillars.setMatrixAt(i, dummy.matrix);
      });
      instancedPillars.instanceMatrix.needsUpdate = true;
      instancedPillars.receiveShadow = true;
      this.levelGroup.add(instancedPillars);
    }

    // 2. Build Ramps & Slide Chutes
    for (const ramp of level.ramps) {
      const [cx, cy, cz] = ramp.center;
      const [sx, sy, sz] = ramp.size;
      const pitchRad = (ramp.pitchDeg * Math.PI) / 180;
      const yawRad = ((ramp.yawDeg ?? 0) * Math.PI) / 180;

      this.physics.addStaticBox(
        ramp.id,
        { x: cx, y: cy, z: cz },
        { x: sx, y: sy, z: sz },
        { x: pitchRad, y: yawRad, z: 0 },
        {
          surfaceType: ramp.isSlideChute ? 'basalt' : 'concrete',
          isWallRunnable: false,
        },
      );

      const rampGroup = new THREE.Group();
      rampGroup.position.set(cx, cy, cz);
      rampGroup.rotation.set(pitchRad, yawRad, 0, 'XYZ');

      const rampGeo = new THREE.BoxGeometry(sx, sy, sz);
      this.geometriesToDispose.push(rampGeo);
      const rampMesh = new THREE.Mesh(
        rampGeo,
        ramp.isSlideChute ? this.materials.slideRampSurface : this.materials.concretePrimary,
      );
      rampMesh.castShadow = true;
      rampMesh.receiveShadow = true;
      rampGroup.add(rampMesh);

      // Side chute rails
      const railGeo = new THREE.BoxGeometry(0.32, 0.55, sz);
      this.geometriesToDispose.push(railGeo);
      const leftRail = new THREE.Mesh(railGeo, this.materials.trimDark);
      leftRail.position.set(-sx * 0.5 + 0.16, sy * 0.5 + 0.22, 0);
      const rightRail = new THREE.Mesh(railGeo, this.materials.trimDark);
      rightRail.position.set(sx * 0.5 - 0.16, sy * 0.5 + 0.22, 0);
      rampGroup.add(leftRail, rightRail);

      this.levelGroup.add(rampGroup);
    }

    // 3. Build Wall-Run Panels
    for (const wp of level.wallPanels) {
      const [cx, cy, cz] = wp.center;
      const [sx, sy, sz] = wp.size;
      const yawRad = ((wp.yawDeg ?? 0) * Math.PI) / 180;

      this.physics.addStaticBox(
        wp.id,
        { x: cx, y: cy, z: cz },
        { x: sx, y: sy, z: sz },
        { x: 0, y: yawRad, z: 0 },
        {
          surfaceType: 'basalt',
          isWallRunnable: true,
        },
      );

      const panelGroup = new THREE.Group();
      panelGroup.position.set(cx, cy, cz);
      panelGroup.rotation.y = yawRad;

      const panelGeo = new THREE.BoxGeometry(sx, sy, sz);
      this.geometriesToDispose.push(panelGeo);
      const panelMesh = new THREE.Mesh(panelGeo, this.materials.wallRunSurface);
      panelMesh.castShadow = true;
      panelMesh.receiveShadow = true;
      panelGroup.add(panelMesh);

      // Top & bottom architectural frame beams
      const capGeo = new THREE.BoxGeometry(sx + 0.25, 0.4, sz + 0.2);
      this.geometriesToDispose.push(capGeo);
      const topCap = new THREE.Mesh(capGeo, this.materials.trimDark);
      topCap.position.y = sy * 0.5;
      const botCap = new THREE.Mesh(capGeo, this.materials.trimDark);
      botCap.position.y = -sy * 0.5;

      // Glowing horizontal momentum guide strip
      const stripGeo = new THREE.BoxGeometry(sx + 0.08, 0.14, sz - 0.6);
      this.geometriesToDispose.push(stripGeo);
      const stripMesh = new THREE.Mesh(stripGeo, this.materials.guideInlay);
      stripMesh.position.y = -0.3;

      panelGroup.add(topCap, botCap, stripMesh);
      this.levelGroup.add(panelGroup);
    }

    // 4. Build Monumental Arches & Low Slide Gates
    for (const arch of level.arches) {
      const [bx, by, bz] = arch.basePosition;
      const halfSpan = arch.openingWidth * 0.5 + arch.pillarWidth * 0.5;
      const totalPillarH = arch.openingHeight + arch.lintelHeight;
      const pillarCenterY = by + totalPillarH * 0.5;
      const lintelCenterY = by + arch.openingHeight + arch.lintelHeight * 0.5;
      const totalWidth = arch.openingWidth + arch.pillarWidth * 2;

      // Left Pillar Collider & Mesh
      this.physics.addStaticBox(
        `${arch.id}-left`,
        { x: bx - halfSpan, y: pillarCenterY, z: bz },
        { x: arch.pillarWidth, y: totalPillarH, z: arch.depth },
      );
      // Right Pillar Collider & Mesh
      this.physics.addStaticBox(
        `${arch.id}-right`,
        { x: bx + halfSpan, y: pillarCenterY, z: bz },
        { x: arch.pillarWidth, y: totalPillarH, z: arch.depth },
      );
      // Overhead Lintel Collider & Mesh (crucial for Slide Gates!)
      this.physics.addStaticBox(
        `${arch.id}-lintel`,
        { x: bx, y: lintelCenterY, z: bz },
        { x: totalWidth, y: arch.lintelHeight, z: arch.depth },
      );

      const pillarGeo = new THREE.BoxGeometry(arch.pillarWidth, totalPillarH, arch.depth);
      const lintelGeo = new THREE.BoxGeometry(totalWidth + 0.3, arch.lintelHeight, arch.depth + 0.3);
      const trimUndersideGeo = new THREE.BoxGeometry(arch.openingWidth, 0.16, arch.depth + 0.1);
      this.geometriesToDispose.push(pillarGeo, lintelGeo, trimUndersideGeo);

      const leftMesh = new THREE.Mesh(pillarGeo, this.materials.concreteSecondary);
      leftMesh.position.set(bx - halfSpan, pillarCenterY, bz);
      leftMesh.castShadow = true;
      leftMesh.receiveShadow = true;

      const rightMesh = new THREE.Mesh(pillarGeo, this.materials.concreteSecondary);
      rightMesh.position.set(bx + halfSpan, pillarCenterY, bz);
      rightMesh.castShadow = true;
      rightMesh.receiveShadow = true;

      const lintelMesh = new THREE.Mesh(lintelGeo, this.materials.concretePrimary);
      lintelMesh.position.set(bx, lintelCenterY, bz);
      lintelMesh.castShadow = true;
      lintelMesh.receiveShadow = true;

      const undersideStrip = new THREE.Mesh(trimUndersideGeo, this.materials.guideInlay);
      undersideStrip.position.set(bx, by + arch.openingHeight + 0.02, bz);

      this.levelGroup.add(leftMesh, rightMesh, lintelMesh, undersideStrip);
    }

    // 5. Build Kinematic Moving Platforms
    for (const mp of level.movingPlatforms) {
      const [sx, sy, sz] = mp.size;
      const startCenter = new THREE.Vector3(
        mp.startTopPos[0],
        mp.startTopPos[1] - sy * 0.5,
        mp.startTopPos[2],
      );
      const endCenter = new THREE.Vector3(
        mp.endTopPos[0],
        mp.endTopPos[1] - sy * 0.5,
        mp.endTopPos[2],
      );

      const mpGroup = new THREE.Group();
      mpGroup.position.copy(startCenter);

      const bodyGeo = new THREE.BoxGeometry(sx, sy, sz);
      const rimGeo = new THREE.BoxGeometry(sx + 0.2, 0.18, sz + 0.2);
      this.geometriesToDispose.push(bodyGeo, rimGeo);

      const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.movingPlatformSurface);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      const rimMesh = new THREE.Mesh(rimGeo, this.materials.guideInlay);
      rimMesh.position.y = sy * 0.5 - 0.1;

      mpGroup.add(bodyMesh, rimMesh);
      this.levelGroup.add(mpGroup);

      this.physics.addMovingPlatform(
        mp.id,
        startCenter,
        endCenter,
        { x: sx, y: sy, z: sz },
        mp.speed,
        mp.phaseOffset ?? 0,
        mpGroup,
        'metal',
      );
    }

    // 6. Build Colossal Distant Monoliths (1 InstancedMesh Draw Call)
    if (level.distantMonoliths.length > 0) {
      const monoGeo = new THREE.BoxGeometry(1, 1, 1);
      this.geometriesToDispose.push(monoGeo);
      const instancedMonoliths = new THREE.InstancedMesh(
        monoGeo,
        this.materials.monolithDistant,
        level.distantMonoliths.length,
      );
      const dummy = new THREE.Object3D();
      level.distantMonoliths.forEach((m, idx) => {
        dummy.position.set(m.position[0], m.position[1], m.position[2]);
        dummy.scale.set(m.size[0], m.size[1], m.size[2]);
        dummy.rotation.set(0, ((m.rotationYDeg ?? 0) * Math.PI) / 180, 0);
        dummy.updateMatrix();
        instancedMonoliths.setMatrixAt(idx, dummy.matrix);
      });
      instancedMonoliths.instanceMatrix.needsUpdate = true;
      instancedMonoliths.receiveShadow = true;
      this.levelGroup.add(instancedMonoliths);
    }

    // 7. Build Checkpoint Shrines
    for (const cp of level.checkpoints) {
      const [cx, cy, cz] = cp.position;
      const shrineGroup = new THREE.Group();
      shrineGroup.position.set(cx, cy, cz);

      const plinthGeo = new THREE.CylinderGeometry(1.1, 1.3, 0.18, 8);
      const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
      const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);
      this.geometriesToDispose.push(plinthGeo, coreGeo, ringGeo);

      const plinth = new THREE.Mesh(plinthGeo, this.materials.trimDark);
      plinth.position.y = 0.09;

      const coreMesh = new THREE.Mesh(coreGeo, this.materials.checkpointInactive);
      coreMesh.position.y = 1.6;

      const ringMesh = new THREE.Mesh(ringGeo, this.materials.checkpointInactive);
      ringMesh.position.y = 1.6;

      shrineGroup.add(plinth, coreMesh, ringMesh);
      this.levelGroup.add(shrineGroup);

      this.checkpointVisuals.push({
        id: cp.id,
        coreMesh,
        ringMesh,
        baseY: 1.6,
        activated: false,
      });
    }

    // 8. Build Ascension Finish Portal
    const [fx, fy, fz] = level.finishPortal.position;
    const portalGroup = new THREE.Group();
    portalGroup.position.set(fx, fy, fz);

    const framePillarGeo = new THREE.BoxGeometry(1.4, 14, 1.4);
    const frameTopGeo = new THREE.BoxGeometry(10.8, 1.8, 1.8);
    const outerRingGeo = new THREE.TorusGeometry(3.2, 0.14, 10, 36);
    const innerRingGeo = new THREE.TorusGeometry(2.1, 0.1, 10, 32);
    const crystalGeo = new THREE.OctahedronGeometry(0.95, 0);
    this.geometriesToDispose.push(
      framePillarGeo,
      frameTopGeo,
      outerRingGeo,
      innerRingGeo,
      crystalGeo,
    );

    const leftFrame = new THREE.Mesh(framePillarGeo, this.materials.trimDark);
    leftFrame.position.set(-4.2, 7.0, 0);
    leftFrame.castShadow = true;

    const rightFrame = new THREE.Mesh(framePillarGeo, this.materials.trimDark);
    rightFrame.position.set(4.2, 7.0, 0);
    rightFrame.castShadow = true;

    const topFrame = new THREE.Mesh(frameTopGeo, this.materials.concretePrimary);
    topFrame.position.set(0, 14.2, 0);
    topFrame.castShadow = true;

    const outerRing = new THREE.Mesh(outerRingGeo, this.materials.portalEmissive);
    outerRing.position.set(0, 4.2, 0);

    const innerRing = new THREE.Mesh(innerRingGeo, this.materials.checkpointActive);
    innerRing.position.set(0, 4.2, 0);

    const coreCrystal = new THREE.Mesh(crystalGeo, this.materials.portalEmissive);
    coreCrystal.position.set(0, 2.4, 0);

    portalGroup.add(leftFrame, rightFrame, topFrame, outerRing, innerRing, coreCrystal);
    this.levelGroup.add(portalGroup);

    this.finishPortalVisual = {
      group: portalGroup,
      outerRing,
      innerRing,
      coreCrystal,
    };
  }

  public setCheckpointActivated(index: number): void {
    const vis = this.checkpointVisuals[index];
    if (!vis || vis.activated) return;
    vis.activated = true;
    vis.coreMesh.material = this.materials.checkpointActive;
    vis.ringMesh.material = this.materials.checkpointActive;
  }

  public updateAnimations(elapsed: number, reducedMotion: boolean): void {
    if (reducedMotion) return;

    for (let i = 0; i < this.checkpointVisuals.length; i++) {
      const cp = this.checkpointVisuals[i];
      cp.coreMesh.rotation.y = elapsed * 1.4 + i;
      cp.coreMesh.position.y = cp.baseY + Math.sin(elapsed * 2.2 + i) * 0.14;
      cp.ringMesh.rotation.x = Math.sin(elapsed * 0.9 + i) * 0.45;
      cp.ringMesh.rotation.y = elapsed * 0.8;
    }

    if (this.finishPortalVisual) {
      this.finishPortalVisual.outerRing.rotation.z = elapsed * 0.6;
      this.finishPortalVisual.innerRing.rotation.y = elapsed * 1.1;
      this.finishPortalVisual.innerRing.rotation.x = elapsed * 0.7;
      this.finishPortalVisual.coreCrystal.rotation.y = -elapsed * 1.5;
      this.finishPortalVisual.coreCrystal.position.y = 2.4 + Math.sin(elapsed * 2.5) * 0.22;
    }
  }

  public clear(): void {
    while (this.levelGroup.children.length > 0) {
      const child = this.levelGroup.children[0];
      this.levelGroup.remove(child);
    }
    for (const geo of this.geometriesToDispose) {
      geo.dispose();
    }
    this.geometriesToDispose.length = 0;
    this.checkpointVisuals.length = 0;
    this.finishPortalVisual = null;
    this.physics.clearLevelColliders();
  }

  public dispose(): void {
    this.clear();
  }
}
