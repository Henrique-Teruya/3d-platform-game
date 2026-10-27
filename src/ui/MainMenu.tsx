import React from 'react';
import type { GameEngine } from '../game/GameEngine';
import { getLevelById, LEVELS } from '../game/levels/LevelRegistry';
import { useGameStore } from '../stores/gameStore';

interface MainMenuProps {
  engine: GameEngine | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({ engine }) => {
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const level = getLevelById(currentLevelId);

  if (activeModal !== 'none') return null;

  return (
    <div className="menu-overlay">
      <div className="menu-panel">
        <div className="menu-kicker">ARCHITECTURAL MOMENTUM EXPERIENCE</div>
        <h1 className="menu-title">FLOAT</h1>
        <p className="menu-subtitle">
          Traverse silent brutalist monoliths suspended in endless atmospheric horizons.
        </p>

        <div className="menu-current-zone">
          <span className="zone-Tag">ACTIVE SECTOR</span>
          <span className="zone-Name">{level.name}</span>
        </div>

        <div className="menu-actions">
          <button
            type="button"
            className="btn-architectural btn-primary"
            onClick={() => engine?.startGame(currentLevelId)}
          >
            <span>ENTER THE VOID</span>
            <span className="btn-arrow">→</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => setActiveModal('level_select')}
          >
            <span>SELECT SECTOR</span>
            <span className="btn-meta">{LEVELS.length.toString().padStart(2, '0')} SECTORS</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => setActiveModal('settings')}
          >
            <span>SYSTEM & COMFORT</span>
            <span className="btn-meta">FOV / AUDIO / GRAPHICS</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => setActiveModal('credits')}
          >
            <span>ARCHITECTURAL MANIFESTO</span>
            <span className="btn-meta">INFO</span>
          </button>
        </div>

        <div className="menu-footer">
          <span>WASD TO MOVE · SHIFT SPRINT (HOLD/TOGGLE) · SPACE / RMB / WHEEL JUMP · CTRL SLIDE / STOMP</span>
        </div>
      </div>
    </div>
  );
};
