import * as THREE from 'three';
import { GRAPHICS_PRESETS } from '../config/graphicsConfig';
import { createMovementConfig, type MovementConfig } from '../config/movementConfig';
import { useGameStore } from '../stores/gameStore';
import { SoundEngine } from './audio/SoundEngine';
import { FirstPersonCamera } from './camera/FirstPersonCamera';
import { CheckpointSystem } from './checkpoints/CheckpointSystem';
import { EventBus } from './core/EventBus';
import { createSeededRandom, type SeededRandom } from './core/SeededRandom';
import { FixedTimestepClock } from './core/Time';
import { InputManager } from './input/InputManager';
import { getLevelById, getNextLevelId } from './levels/LevelRegistry';
import type { LevelDefinition } from './levels/LevelTypes';
import { PlayerController } from './movement/PlayerController';
import { ensureRapierInitialized, PhysicsWorld } from './physics/PhysicsWorld';
import { DebugGui } from './rendering/DebugGui';
import { BrutalistBuilder, FirstPersonParkourRig } from './world/BrutalistBuilder';
import { BIOME_PALETTES, MaterialLibrary } from './world/MaterialLibrary';
import { SkyAndAtmosphere } from './world/SkyAndAtmosphere';

export class GameEngine {
  public readonly events = new EventBus();
  public readonly movementConfig: MovementConfig = createMovementConfig();
  public renderer!: THREE.WebGLRenderer;
  public readonly scene = new THREE.Scene();
  public fpCamera!: FirstPersonCamera;
  public input!: InputManager;
  public physics!: PhysicsWorld;
  public player!: PlayerController;
  public materials!: MaterialLibrary;
  public sky!: SkyAndAtmosphere;
  public builder!: BrutalistBuilder;
  public parkourRig!: FirstPersonParkourRig;
  public checkpoints!: CheckpointSystem;
  public sound!: SoundEngine;
  public debugGui!: DebugGui;

  private clock!: FixedTimestepClock;
  private currentLevel: LevelDefinition = getLevelById('level-01');
  private rng: SeededRandom = createSeededRandom(42);
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private levelElapsedSeconds = 0;
  private isLevelComplete = false;
  private pausedForScreenshot = false;
  private reducedMotion = false;
  private telemetryTimer = 0;
  private respawnFadeTimer = 0;
  private initialized = false;
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  public async init(): Promise<void> {
    if (this.initialized || this.disposed) return;
    await ensureRapierInitialized();
    if (this.disposed) return;

    const store = useGameStore.getState();
    const preset = GRAPHICS_PRESETS[store.settings.graphicsQuality];
    const initialPalette = BIOME_PALETTES[this.currentLevel.biome];

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: preset.antialias,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = preset.exposure;
    this.renderer.shadowMap.enabled = preset.shadowsEnabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.fpCamera = new FirstPersonCamera(store.settings.fov, 16 / 9);
    this.scene.add(this.fpCamera.camera);

    this.materials = new MaterialLibrary(initialPalette);
    this.parkourRig = new FirstPersonParkourRig(this.materials);
    this.fpCamera.camera.add(this.parkourRig.group);

    this.sky = new SkyAndAtmosphere(initialPalette, preset);
    this.scene.fog = this.sky.fog;
    this.scene.add(this.sky.group);

    this.physics = new PhysicsWorld(-this.movementConfig.gravityBase);
    this.builder = new BrutalistBuilder(this.materials, this.physics);
    this.scene.add(this.builder.levelGroup);

    this.player = new PlayerController(this.physics, this.events, this.movementConfig);
    this.checkpoints = new CheckpointSystem(this.events, this.builder);
    this.clock = new FixedTimestepClock(this.movementConfig.fixedDeltaTime, 0.1);

    this.input = new InputManager(this.canvas);
    this.input.onPointerLockStatusChange = (locked) => {
      useGameStore.getState().setPointerLocked(locked);
    };
    this.input.onPauseToggle = () => {
      const st = useGameStore.getState();
      if (st.screen === 'playing') {
        this.pauseGame();
      } else if (st.screen === 'paused') {
        this.resumeGame();
      }
    };
    this.input.onQuickRestart = () => {
      const st = useGameStore.getState();
      if (st.screen === 'playing') {
        this.restartFromCheckpoint();
      }
    };

    this.sound = new SoundEngine(this.events, () => this.rng, store.settings);
    this.debugGui = new DebugGui(this.movementConfig);

    this.bindGameplayEvents();
    this.loadLevel(store.currentLevelId, false);
    this.resize();
    window.addEventListener('resize', this.handleResizeBound);

    this.installTestHooks();
    this.initialized = true;
    this.publishDiagnostics();
    this.startLoop();
  }

  public loadLevel(levelId: string, startImmediately = true): void {
    const level = getLevelById(levelId);
    this.currentLevel = level;
    this.levelElapsedSeconds = 0;
    this.isLevelComplete = false;
    this.clock.reset();

    const store = useGameStore.getState();
    store.setCurrentLevelId(level.id);
    if (startImmediately) {
      store.setScreen('playing');
      store.setActiveModal('none');
    }

    const palette = BIOME_PALETTES[level.biome];
    const preset = GRAPHICS_PRESETS[store.settings.graphicsQuality];

    this.materials.applyPalette(palette);
    this.sky.applyPalette(palette, preset);
    this.builder.buildLevel(level);
    this.checkpoints.initForLevel(level);

    const spawn = this.checkpoints.getSpawnState();
    this.player.spawnAt(spawn.position.x, spawn.position.y, spawn.position.z, spawn.yawRad);
    this.physics.step(this.movementConfig.fixedDeltaTime);
    this.sky.followPlayer(this.player.position);

    this.fpCamera.update(
      1 / 60,
      1.0,
      this.player,
      this.movementConfig,
      store.settings,
      this.reducedMotion,
    );

    this.sound.setBiomeChord(level.biome);
    store.showBanner(level.name, level.subtitle);
    this.events.emit('LEVEL_STARTED', {
      levelId: level.id,
      levelName: level.name,
      subtitle: level.subtitle,
    });
    this.publishDiagnostics();
  }

  public startGame(levelId?: string): void {
    this.sound.unlock();
    const targetId = levelId ?? useGameStore.getState().currentLevelId;
    this.loadLevel(targetId, true);
    this.input.requestPointerLock();
  }

  public pauseGame(): void {
    this.input.exitPointerLock();
    this.input.clearAllInputs();
    useGameStore.getState().setScreen('paused');
  }

  public resumeGame(): void {
    this.sound.unlock();
    useGameStore.getState().setActiveModal('none');
    useGameStore.getState().setScreen('playing');
    this.input.requestPointerLock();
  }

  public restartFromCheckpoint(): void {
    this.checkpoints.respawnAtActiveCheckpoint(this.player);
    this.respawnFadeTimer = 0.22;
    useGameStore.getState().setScreen('playing');
    useGameStore.getState().setActiveModal('none');
  }

  public restartLevel(): void {
    this.loadLevel(this.currentLevel.id, true);
    this.input.requestPointerLock();
  }

  public returnToMainMenu(): void {
    this.input.exitPointerLock();
    this.input.clearAllInputs();
    useGameStore.getState().setActiveModal('none');
    useGameStore.getState().setScreen('menu');
  }

  public syncSettings(): void {
    if (!this.initialized) return;
    const settings = useGameStore.getState().settings;
    const preset = GRAPHICS_PRESETS[settings.graphicsQuality];
    const palette = BIOME_PALETTES[this.currentLevel.biome];

    this.renderer.toneMappingExposure = preset.exposure;
    this.renderer.shadowMap.enabled = preset.shadowsEnabled;
    this.sky.applyGraphicsPreset(preset, palette);
    this.sound.applySettings(settings);
    this.resize();
  }

  private bindGameplayEvents(): void {
    this.events.on('PLAYER_LANDED', ({ fallSpeed }) => {
      const shakeScale = useGameStore.getState().settings.cameraShake;
      this.fpCamera.onLandingImpact(fallSpeed, this.movementConfig, shakeScale);
    });

    this.events.on('CHECKPOINT_ACTIVATED', ({ index, total, name }) => {
      useGameStore
        .getState()
        .showCheckpointToast(`CHECKPOINT ${index}/${total} — ${name.toUpperCase()}`);
    });

    this.events.on('PLAYER_RESPAWNED', () => {
      this.respawnFadeTimer = 0.22;
    });

    this.events.on('LEVEL_COMPLETED', ({ levelId, elapsedSeconds }) => {
      this.isLevelComplete = true;
      this.input.exitPointerLock();
      this.input.clearAllInputs();
      const nextId = getNextLevelId(levelId);
      useGameStore
        .getState()
        .recordLevelCompletion(levelId, this.currentLevel.name, elapsedSeconds, nextId);
    });
  }

  private startLoop(): void {
    this.lastFrameTime = performance.now();
    const tick = (now: number) => {
      if (this.disposed) return;
      this.rafId = requestAnimationFrame(tick);
      const rawDelta = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      this.update(rawDelta);
      this.render();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private update(rawDelta: number): void {
    this.frameCount += 1;
    const delta = Math.min(Math.max(rawDelta, 0.001), 0.1);

    if (this.pausedForScreenshot) {
      this.publishDiagnostics();
      return;
    }

    const store = useGameStore.getState();
    const settings = store.settings;

    // Fade overlay decay on respawn
    if (this.respawnFadeTimer > 0) {
      this.respawnFadeTimer = Math.max(0, this.respawnFadeTimer - delta);
      store.setRespawnFadeOpacity(Math.min(1, this.respawnFadeTimer / 0.15));
    } else if (store.respawnFadeOpacity > 0) {
      store.setRespawnFadeOpacity(0);
    }

    // Check if user pressed movement keys while on main menu (auto-starts playing for seamless UX and automated tests)
    const lookDelta = this.input.consumeLookDelta();
    if (store.screen === 'menu' && store.activeModal === 'none') {
      const previewSnap = this.input.sampleFixedStep(0, this.movementConfig.jumpBufferTime);
      if (
        Math.abs(previewSnap.moveForward) > 0.05 ||
        Math.abs(previewSnap.moveRight) > 0.05 ||
        previewSnap.isJumpHeld
      ) {
        this.sound.unlock();
        store.setScreen('playing');
      }
    }

    const activeScreen = useGameStore.getState().screen;

    if (activeScreen === 'playing' && !this.isLevelComplete) {
      this.levelElapsedSeconds += delta;

      if (lookDelta.dx !== 0 || lookDelta.dy !== 0) {
        this.player.applyLookDelta(
          lookDelta.dx,
          lookDelta.dy,
          settings.mouseSensitivity,
          settings.invertY,
        );
      }

      const alpha = this.clock.tick(delta, (fixedDt) => {
        this.physics.updateMovingPlatforms(this.clock.elapsed, fixedDt);
        this.physics.step(fixedDt);

        const snap = this.input.sampleFixedStep(fixedDt, this.movementConfig.jumpBufferTime);
        this.player.fixedUpdate(fixedDt, snap, this.input);
        this.checkpoints.update(this.currentLevel, this.player, this.levelElapsedSeconds);
      });

      this.player.updateInterpolation(alpha);
      this.fpCamera.update(
        delta,
        alpha,
        this.player,
        this.movementConfig,
        settings,
        this.reducedMotion,
      );
      this.parkourRig.update(
        delta,
        this.player.getHorizontalSpeed(),
        this.player.isGrounded,
        this.player.isSliding,
        this.player.wallRunSide,
        this.reducedMotion,
      );
      this.sky.followPlayer(this.player.interpolatedPosition);
      this.builder.updateAnimations(this.clock.elapsed, this.reducedMotion);
      this.sound.updateDynamicAudio(this.player.getHorizontalSpeed(), false);
    } else if (activeScreen === 'menu') {
      // Subtle atmospheric camera breathing on main menu overlooking the Awakening Courtyard
      const animElapsed = this.reducedMotion ? 0 : performance.now() * 0.001;
      this.builder.updateAnimations(animElapsed, this.reducedMotion);
      this.fpCamera.camera.position.set(
        Math.sin(animElapsed * 0.25) * 1.4,
        2.2 + Math.cos(animElapsed * 0.4) * 0.15,
        8.5,
      );
      this.fpCamera.camera.lookAt(0, 2.4, -35);
      this.sound.updateDynamicAudio(0, true);
    } else {
      this.sound.updateDynamicAudio(0, true);
    }

    // Throttled telemetry update for HUD (15Hz so React never re-renders at 60Hz)
    this.telemetryTimer += delta;
    if (this.telemetryTimer >= 0.066) {
      this.telemetryTimer = 0;
      store.updateTelemetry({
        speed: this.player.velocity.length(),
        horizontalSpeed: this.player.getHorizontalSpeed(),
        movementState: this.player.state,
        isGrounded: this.player.isGrounded,
        wallRunSide: this.player.wallRunSide,
        elapsedTime: this.levelElapsedSeconds,
        checkpointIndex: Math.max(0, this.checkpoints.activeCheckpointIndex + 1),
        totalCheckpoints: this.currentLevel.checkpoints.length,
        fps: Math.round(1 / Math.max(0.004, delta)),
      });
    }

    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.render(this.scene, this.fpCamera.camera);
  }

  private readonly handleResizeBound = () => this.resize();

  public resize(): void {
    if (!this.renderer || !this.fpCamera) return;
    const settings = useGameStore.getState().settings;
    const preset = GRAPHICS_PRESETS[settings.graphicsQuality];
    const dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr);

    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.fpCamera.camera.aspect = width / height;
    this.fpCamera.camera.updateProjectionMatrix();
  }

  private installTestHooks(): void {
    window.__THREE_GAME_TEST_HOOKS__ = {
      seed: (value: number) => {
        this.rng = createSeededRandom(value);
      },
      setState: (name: string) => {
        const validStates = [
          'active-play',
          'level-01',
          'level-02',
          'level-03',
          'wall-run',
          'complete',
          'menu',
        ];
        if (!validStates.includes(name)) {
          throw new Error(`Unknown test state: ${name}`);
        }

        if (name === 'menu') {
          this.loadLevel('level-01', false);
          useGameStore.getState().setScreen('menu');
        } else if (name === 'level-02') {
          this.loadLevel('level-02', true);
        } else if (name === 'level-03') {
          this.loadLevel('level-03', true);
        } else if (name === 'wall-run') {
          this.loadLevel('level-02', true);
          this.player.spawnAt(3.35, 2.2, -14, 0);
          this.player.isGrounded = false;
          this.player.wallRunSide = 'right';
          this.player.state = 'WALL_RUNNING';
          this.player.velocity.set(0, -0.4, -11.5);
          this.player.updateInterpolation(1.0);
          this.fpCamera.update(
            0.25,
            1.0,
            this.player,
            this.movementConfig,
            useGameStore.getState().settings,
            false,
          );
        } else if (name === 'complete') {
          this.loadLevel('level-01', true);
          this.checkpoints.activeCheckpointIndex = this.currentLevel.checkpoints.length - 1;
          this.isLevelComplete = true;
          useGameStore
            .getState()
            .recordLevelCompletion('level-01', this.currentLevel.name, 28.4, 'level-02');
        } else {
          // 'active-play' or 'level-01'
          this.loadLevel('level-01', true);
        }

        this.parkourRig.update(
          0.016,
          this.player.getHorizontalSpeed(),
          this.player.isGrounded,
          this.player.isSliding,
          this.player.wallRunSide,
          this.reducedMotion,
        );
        useGameStore.getState().updateTelemetry({
          speed: this.player.velocity.length(),
          horizontalSpeed: this.player.getHorizontalSpeed(),
          movementState: this.player.state,
          isGrounded: this.player.isGrounded,
          wallRunSide: this.player.wallRunSide,
          elapsedTime: this.levelElapsedSeconds,
          checkpointIndex: Math.max(0, this.checkpoints.activeCheckpointIndex + 1),
          totalCheckpoints: this.currentLevel.checkpoints.length,
          fps: 60,
        });
        this.render();
        this.publishDiagnostics();
        return { state: name };
      },
      setPausedForScreenshot: (paused: boolean) => {
        this.pausedForScreenshot = paused;
      },
      setReducedMotion: (enabled: boolean) => {
        this.reducedMotion = enabled;
        this.parkourRig.update(
          0,
          this.player.getHorizontalSpeed(),
          this.player.isGrounded,
          this.player.isSliding,
          this.player.wallRunSide,
          enabled,
        );
        this.render();
        this.publishDiagnostics();
      },
      hideDebugUi: (hidden: boolean) => {
        this.debugGui.setHidden(hidden);
      },
      loadLevel: (levelId: string) => {
        this.loadLevel(levelId, true);
      },
      teleportToCheckpoint: (index: number) => {
        this.checkpoints.teleportToCheckpoint(this.currentLevel, index, this.player);
        this.render();
        this.publishDiagnostics();
      },
    };
  }

  private publishDiagnostics(): void {
    if (!this.renderer || !this.player || !this.physics) return;
    const info = this.renderer.info;
    const settings = useGameStore.getState().settings;
    const preset = GRAPHICS_PRESETS[settings.graphicsQuality];

    const checkpointsReached = Math.max(0, this.checkpoints.activeCheckpointIndex + 1);
    const score = checkpointsReached + (this.isLevelComplete ? 1 : 0);
    const targetScore = this.currentLevel.checkpoints.length + 1;

    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frameCount,
      elapsed: this.levelElapsedSeconds,
      score,
      targetScore,
      complete: this.isLevelComplete,
      levelId: this.currentLevel.id,
      levelIndex: this.currentLevel.index,
      checkpointIndex: checkpointsReached,
      totalCheckpoints: this.currentLevel.checkpoints.length,
      movementState: this.player.state,
      isGrounded: this.player.isGrounded,
      player: {
        position: {
          x: Number(this.player.position.x.toFixed(3)),
          y: Number(this.player.position.y.toFixed(3)),
          z: Number(this.player.position.z.toFixed(3)),
        },
        velocity: {
          x: Number(this.player.velocity.x.toFixed(3)),
          y: Number(this.player.velocity.y.toFixed(3)),
          z: Number(this.player.velocity.z.toFixed(3)),
        },
        speed: Number(this.player.velocity.length().toFixed(3)),
        horizontalSpeed: Number(this.player.getHorizontalSpeed().toFixed(3)),
        yaw: Number(this.player.yaw.toFixed(3)),
        pitch: Number(this.player.pitch.toFixed(3)),
      },
      physics: {
        engine: 'Rapier3D (WASM KinematicController)',
        fixedDt: this.movementConfig.fixedDeltaTime,
        colliderCount: this.physics.getColliderCount(),
        movingPlatformCount: this.physics.getMovingPlatformCount(),
      },
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      canvas: {
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        width: this.canvas.width,
        height: this.canvas.height,
        dpr: Math.min(window.devicePixelRatio || 1, preset.maxDpr),
      },
    };
  }

  public dispose(): void {
    this.disposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.handleResizeBound);
    this.input?.dispose();
    this.sound?.dispose();
    this.debugGui?.dispose();
    this.builder?.dispose();
    this.sky?.dispose();
    this.materials?.dispose();
    this.physics?.dispose();
    this.renderer?.dispose();
    this.events.clear();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
    window.__THREE_GAME_TEST_HOOKS__ = undefined;
  }
}
