import React from 'react';
import type { GameEngine } from '../game/GameEngine';
import { getLevelById } from '../game/levels/LevelRegistry';
import { useGameStore } from '../stores/gameStore';

interface PauseMenuProps {
  engine: GameEngine | null;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ engine }) => {
  const screen = useGameStore((s) => s.screen);
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const currentLevelId = useGameStore((s) => s.currentLevelId);

  if (screen !== 'paused' || activeModal !== 'none') return null;

  const level = getLevelById(currentLevelId);

  return (
    <div className="menu-overlay">
      <div className="menu-panel">
        <div className="menu-kicker">SIMULATION SUSPENDED</div>
        <h2 className="modal-title">{level.name}</h2>

        <div className="menu-actions">
          <button
            type="button"
            className="btn-architectural btn-primary"
            onClick={() => engine?.resumeGame()}
          >
            <span>RESUME MOVEMENT</span>
            <span className="btn-meta">ESC</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => engine?.restartFromCheckpoint()}
          >
            <span>RESTART AT SHRINE</span>
            <span className="btn-meta">KEY [R]</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => engine?.restartLevel()}
          >
            <span>RESTART SECTOR</span>
            <span className="btn-meta">FROM START</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => setActiveModal('settings')}
          >
            <span>SYSTEM & COMFORT</span>
            <span className="btn-meta">SETTINGS</span>
          </button>

          <button
            type="button"
            className="btn-architectural"
            onClick={() => engine?.returnToMainMenu()}
          >
            <span>RETURN TO TITLE</span>
            <span className="btn-meta">MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
