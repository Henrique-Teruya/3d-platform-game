import React from 'react';
import type { GraphicsQuality } from '../config/graphicsConfig';
import type { GameEngine } from '../game/GameEngine';
import { useGameStore } from '../stores/gameStore';

interface SettingsModalProps {
  engine: GameEngine | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ engine }) => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetSettings = useGameStore((s) => s.resetSettings);

  if (activeModal === 'credits') {
    return (
      <div className="menu-overlay">
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <div className="menu-kicker">PHILOSOPHY & DESIGN</div>
              <h2 className="modal-title">ARCHITECTURAL MANIFESTO</h2>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setActiveModal('none')}
            >
              CLOSE
            </button>
          </div>
          <div className="manifesto-content">
            <p>
              <strong>FLOAT</strong> is an exploration of pure kinetic flow within monumental brutalist architecture.
              Inspired by Tadao Ando, Ricardo Bofill, and classic momentum-based movement engines, every surface is
              designed to reward rhythm, trajectory reading, and speed preservation.
            </p>
            <div className="manifesto-pillars">
              <div>
                <h4>I. MOVEMENT IS EVERYTHING</h4>
                <p>Chain sprints, downhill slides, coyote jumps, air strafes, and wall runs without arbitrary speed caps.</p>
              </div>
              <div>
                <h4>II. MONUMENTAL SOLITUDE</h4>
                <p>No enemies, no crowd noise, no punitive timers. Only wind, stone, and colossal scale.</p>
              </div>
              <div>
                <h4>III. MINIMALIST CLARITY</h4>
                <p>Light and architectural framing guide your path across the void.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal !== 'settings') return null;

  const applyChange = (partial: Parameters<typeof updateSettings>[0]) => {
    updateSettings(partial);
    window.setTimeout(() => engine?.syncSettings(), 0);
  };

  return (
    <div className="menu-overlay">
      <div className="modal-card modal-wide">
        <div className="modal-header">
          <div>
            <div className="menu-kicker">CONFIGURATION</div>
            <h2 className="modal-title">SYSTEM, AUDIO & COMFORT</h2>
          </div>
          <div className="modal-header-actions">
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                resetSettings();
                window.setTimeout(() => engine?.syncSettings(), 0);
              }}
            >
              RESET DEFAULTS
            </button>
            <button
              type="button"
              className="btn-close btn-primary-small"
              onClick={() => setActiveModal('none')}
            >
              DONE
            </button>
          </div>
        </div>

        <div className="settings-columns">
          {/* Column 1: Graphics & Camera */}
          <div className="settings-section">
            <h3 className="settings-heading">GRAPHICS & OPTICS</h3>

            <label className="setting-row">
              <span>Render Preset</span>
              <div className="preset-group">
                {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`preset-btn ${settings.graphicsQuality === q ? 'active' : ''}`}
                    onClick={() => applyChange({ graphicsQuality: q })}
                  >
                    {q.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>

            <label className="setting-row">
              <span>Base Field of View ({settings.fov}°)</span>
              <input
                type="range"
                min={70}
                max={105}
                step={1}
                value={settings.fov}
                onChange={(e) => applyChange({ fov: Number(e.target.value) })}
              />
            </label>

            <label className="setting-row">
              <span>Mouse Sensitivity ({settings.mouseSensitivity.toFixed(1)}x)</span>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={settings.mouseSensitivity}
                onChange={(e) => applyChange({ mouseSensitivity: Number(e.target.value) })}
              />
            </label>

            <label className="setting-row">
              <span>Invert Look Y-Axis</span>
              <input
                type="checkbox"
                checked={settings.invertY}
                onChange={(e) => applyChange({ invertY: e.target.checked })}
              />
            </label>
          </div>

          {/* Column 2: Comfort & HUD */}
          <div className="settings-section">
            <h3 className="settings-heading">COMFORT & HUD</h3>

            <label className="setting-row">
              <span>Dynamic Speed FOV</span>
              <input
                type="checkbox"
                checked={settings.dynamicFov}
                onChange={(e) => applyChange({ dynamicFov: e.target.checked })}
              />
            </label>

            <label className="setting-row">
              <span>Wall-Run & Strafe Camera Tilt</span>
              <input
                type="checkbox"
                checked={settings.cameraTilt}
                onChange={(e) => applyChange({ cameraTilt: e.target.checked })}
              />
            </label>

            <label className="setting-row">
              <span>Subtle Stride Head Bob</span>
              <input
                type="checkbox"
                checked={settings.headBob}
                onChange={(e) => applyChange({ headBob: e.target.checked })}
              />
            </label>

            <label className="setting-row">
              <span>Show Speedometer & Timer</span>
              <input
                type="checkbox"
                checked={settings.showSpeedometer && settings.showTimer}
                onChange={(e) =>
                  applyChange({
                    showSpeedometer: e.target.checked,
                    showTimer: e.target.checked,
                  })
                }
              />
            </label>

            <label className="setting-row">
              <span>Center Reticle Opacity ({Math.round(settings.reticleOpacity * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.reticleOpacity}
                onChange={(e) => applyChange({ reticleOpacity: Number(e.target.value) })}
              />
            </label>
          </div>

          {/* Column 3: Audio Mixing */}
          <div className="settings-section">
            <h3 className="settings-heading">ACOUSTIC MIXING</h3>

            <label className="setting-row">
              <span>Master Volume ({Math.round(settings.masterVolume * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.masterVolume}
                onChange={(e) => applyChange({ masterVolume: Number(e.target.value) })}
              />
            </label>

            <label className="setting-row">
              <span>Harmonic Drone ({Math.round(settings.musicVolume * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.musicVolume}
                onChange={(e) => applyChange({ musicVolume: Number(e.target.value) })}
              />
            </label>

            <label className="setting-row">
              <span>Atmospheric Wind ({Math.round(settings.ambienceVolume * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.ambienceVolume}
                onChange={(e) => applyChange({ ambienceVolume: Number(e.target.value) })}
              />
            </label>

            <label className="setting-row">
              <span>Kinetic Foley / SFX ({Math.round(settings.sfxVolume * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.sfxVolume}
                onChange={(e) => applyChange({ sfxVolume: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
