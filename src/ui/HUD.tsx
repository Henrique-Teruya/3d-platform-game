import React, { useEffect, useRef, useState } from 'react';
import type { GameEngine } from '../game/GameEngine';
import { getLevelById } from '../game/levels/LevelRegistry';
import { useGameStore } from '../stores/gameStore';

interface HUDProps {
  engine: GameEngine | null;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

export const HUD: React.FC<HUDProps> = ({ engine }) => {
  const screen = useGameStore((s) => s.screen);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const pointerLocked = useGameStore((s) => s.pointerLocked);
  const settings = useGameStore((s) => s.settings);
  const telemetry = useGameStore((s) => s.telemetry);
  const bannerMessage = useGameStore((s) => s.bannerMessage);
  const checkpointToast = useGameStore((s) => s.checkpointToast);

  const [bannerVisible, setBannerVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const stickActiveRef = useRef(false);

  useEffect(() => {
    if (!bannerMessage) return;
    setBannerVisible(true);
    const timer = window.setTimeout(() => setBannerVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [bannerMessage]);

  useEffect(() => {
    if (!checkpointToast) return;
    setToastVisible(true);
    const timer = window.setTimeout(() => setToastVisible(false), 2400);
    return () => window.clearTimeout(timer);
  }, [checkpointToast]);

  // Mobile virtual joystick handlers
  const handleStickMove = (clientX: number, clientY: number) => {
    const stick = stickRef.current;
    const knob = knobRef.current;
    if (!stick || !knob || !engine) return;
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.42;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    const nx = dist > 2 ? (Math.cos(angle) * clampedDist) / maxR : 0;
    const ny = dist > 2 ? (Math.sin(angle) * clampedDist) / maxR : 0;

    knob.style.transform = `translate(${nx * maxR}px, ${ny * maxR}px)`;
    engine.input.setTouchMove(nx, ny);
  };

  const resetStick = () => {
    stickActiveRef.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    engine?.input.setTouchMove(0, 0);
  };

  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent | MouseEvent) => {
      if (!stickActiveRef.current) return;
      handleStickMove(e.clientX, e.clientY);
    };
    const onWindowTouchMove = (e: TouchEvent) => {
      if (!stickActiveRef.current || e.touches.length === 0) return;
      handleStickMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onWindowPointerUp = () => {
      if (!stickActiveRef.current) return;
      resetStick();
    };
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('mousemove', onWindowPointerMove);
    window.addEventListener('touchmove', onWindowTouchMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('mouseup', onWindowPointerUp);
    window.addEventListener('touchend', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('mousemove', onWindowPointerMove);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('mouseup', onWindowPointerUp);
      window.removeEventListener('touchend', onWindowPointerUp);
    };
  });

  const level = getLevelById(currentLevelId);
  const isPlaying = screen === 'playing';
  const speedPct = Math.min(100, (telemetry.horizontalSpeed / 18.5) * 100);
  const isSliding = telemetry.movementState === 'SLIDING';
  const isWallRunning = telemetry.movementState === 'WALL_RUNNING';

  return (
    <div className="hud-layer" style={{ pointerEvents: 'none' }}>
      {/* Top-Left Architectural Telemetry Cluster */}
      {isPlaying && (
        <div className="hud-top-left">
          <div className="hud-level-tag">
            <span className="hud-index">0{level.index}</span>
            <span className="hud-divider">/</span>
            <span className="hud-level-title">{level.name.replace(/^LEVEL \d+ — /, '')}</span>
          </div>

          <div className="hud-metrics-row">
            {settings.showTimer && (
              <div className="hud-timer-box">
                <span className="hud-label">TIME</span>
                <span className="hud-value-mono">{formatTime(telemetry.elapsedTime)}</span>
              </div>
            )}

            <div className="hud-cp-box">
              <span className="hud-label">SHRINES</span>
              <span className="hud-value-mono">
                {telemetry.checkpointIndex}/{telemetry.totalCheckpoints}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top-Right Pause & Action Button */}
      {isPlaying && (
        <div className="hud-top-right" style={{ pointerEvents: 'auto' }}>
          {!pointerLocked && (
            <button
              type="button"
              className="hud-lock-prompt"
              onClick={() => engine?.input.requestPointerLock()}
            >
              CLICK CANVAS TO LOCK MOUSE
            </button>
          )}
          <button
            type="button"
            className="hud-icon-btn"
            aria-label="Pause Game"
            onClick={() => engine?.pauseGame()}
          >
            <span>II</span>
            <span className="hud-btn-sub">ESC</span>
          </button>
        </div>
      )}

      {/* Center Minimalist Anchor Reticle */}
      {isPlaying && settings.reticleOpacity > 0 && (
        <div
          className={`hud-reticle-container ${isSliding ? 'reticle-sliding' : ''} ${
            isWallRunning ? `reticle-wall-${telemetry.wallRunSide}` : ''
          }`}
          style={{ opacity: settings.reticleOpacity }}
        >
          <span className="reticle-wing reticle-wing-left" />
          <span
            className="reticle-dot"
            style={{ backgroundColor: settings.reticleColor }}
          />
          <span
            className="reticle-ring"
            style={{ borderColor: settings.reticleColor }}
          />
          <span className="reticle-wing reticle-wing-right" />
        </div>
      )}

      {/* Zone Title & Checkpoint Notifications */}
      {isPlaying && bannerMessage && (
        <div className={`hud-zone-banner ${bannerVisible ? 'visible' : ''}`}>
          <div className="hud-zone-title">{bannerMessage.title}</div>
          {bannerMessage.subtitle && (
            <div className="hud-zone-subtitle">{bannerMessage.subtitle}</div>
          )}
        </div>
      )}

      {isPlaying && checkpointToast && (
        <div className={`hud-cp-toast ${toastVisible ? 'visible' : ''}`}>
          <span className="cp-diamond">◆</span>
          <span>{checkpointToast.label}</span>
        </div>
      )}

      {/* Bottom-Left Subtle Control Hints */}
      {isPlaying && settings.showControlHints && (
        <div className="hud-bottom-left">
          <div className="hud-hint-item">
            <kbd>WASD</kbd> MOVE
          </div>
          <div className="hud-hint-item">
            <kbd>SHIFT</kbd> SPRINT
          </div>
          <div className="hud-hint-item">
            <kbd>SPACE</kbd> JUMP / WALL JUMP
          </div>
          <div className="hud-hint-item">
            <kbd>CTRL / C</kbd> SLIDE
          </div>
          <div className="hud-hint-item">
            <kbd>R</kbd> CHECKPOINT
          </div>
        </div>
      )}

      {/* Bottom-Right Kinetic Speedometer */}
      {isPlaying && settings.showSpeedometer && (
        <div className="hud-bottom-right">
          <div className="hud-speed-header">
            <span className="hud-state-badge">{telemetry.movementState.replace('_', ' ')}</span>
            <span className="hud-speed-num">
              {telemetry.horizontalSpeed.toFixed(1)} <small>m/s</small>
            </span>
          </div>
          <div className="hud-speed-bar-bg">
            <div
              className="hud-speed-bar-fill"
              style={{ width: `${speedPct.toFixed(1)}%` }}
            />
          </div>
        </div>
      )}

      {/* Touch Controls for Mobile Viewports */}
      <div className="touch-controls-layer">
        <div
          id="touch-stick"
          ref={stickRef}
          className="touch-stick"
          onPointerDown={(e) => {
            stickActiveRef.current = true;
            if (useGameStore.getState().screen === 'menu') {
              engine?.sound.unlock();
              useGameStore.getState().setScreen('playing');
            }
            handleStickMove(e.clientX, e.clientY);
          }}
          onMouseDown={(e) => {
            stickActiveRef.current = true;
            if (useGameStore.getState().screen === 'menu') {
              engine?.sound.unlock();
              useGameStore.getState().setScreen('playing');
            }
            handleStickMove(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            stickActiveRef.current = true;
            if (useGameStore.getState().screen === 'menu') {
              engine?.sound.unlock();
              useGameStore.getState().setScreen('playing');
            }
            if (e.touches.length > 0) {
              handleStickMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onPointerMove={(e) => {
            if (!stickActiveRef.current && (e.buttons & 1) === 0) return;
            stickActiveRef.current = true;
            handleStickMove(e.clientX, e.clientY);
          }}
          onPointerUp={resetStick}
          onMouseUp={resetStick}
          onTouchEnd={resetStick}
        >
          <div id="touch-knob" ref={knobRef} className="touch-knob" />
        </div>

        <div className="touch-actions">
          <button
            id="dash-button"
            type="button"
            className="touch-btn touch-btn-jump"
            onPointerDown={() => {
              if (useGameStore.getState().screen === 'menu') {
                engine?.startGame();
              }
              engine?.input.triggerTouchJump(true);
            }}
            onPointerUp={() => engine?.input.triggerTouchJump(false)}
            onPointerCancel={() => engine?.input.triggerTouchJump(false)}
          >
            JUMP
          </button>
          <button
            id="slide-button"
            type="button"
            className="touch-btn touch-btn-slide"
            onPointerDown={() => {
              engine?.input.setTouchSprint(true);
              engine?.input.setTouchSlide(true);
            }}
            onPointerUp={() => engine?.input.setTouchSlide(false)}
            onPointerCancel={() => engine?.input.setTouchSlide(false)}
          >
            SLIDE
          </button>
        </div>
      </div>
    </div>
  );
};
