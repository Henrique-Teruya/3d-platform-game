import React from 'react';
import type { GameEngine } from '../game/GameEngine';
import { useGameStore } from '../stores/gameStore';
import { formatTime } from './HUD';

interface LevelCompleteModalProps {
  engine: GameEngine | null;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({ engine }) => {
  const screen = useGameStore((s) => s.screen);
  const lastCompletion = useGameStore((s) => s.lastCompletion);

  if (screen !== 'level_complete' || !lastCompletion) return null;

  return (
    <div className="menu-overlay">
      <div className="menu-panel">
        <div className="menu-kicker">ASCENSION SANCTUARY REACHED</div>
        <h2 className="modal-title">{lastCompletion.levelName}</h2>

        <div className="completion-stats">
          <div className="completion-stat-box">
            <span className="stat-label">TRAVERSAL TIME</span>
            <span className="stat-val-large">
              {formatTime(lastCompletion.elapsedSeconds)}
            </span>
            {lastCompletion.isNewBest && (
              <span className="new-best-tag">NEW PERSONAL RECORD</span>
            )}
          </div>

          <div className="completion-stat-box">
            <span className="stat-label">BEST RECORD</span>
            <span className="stat-val-large">
              {formatTime(lastCompletion.bestSeconds)}
            </span>
          </div>
        </div>

        <div className="menu-actions">
          {lastCompletion.nextLevelId && (
            <button
              type="button"
              className="btn-architectural btn-primary"
              onClick={() => engine?.startGame(lastCompletion.nextLevelId!)}
            >
              <span>PROCEED TO NEXT SECTOR</span>
              <span>→</span>
            </button>
          )}

          <button
            type="button"
            className="btn-architectural"
            onClick={() => engine?.startGame(lastCompletion.levelId)}
          >
            <span>REPLAY SECTOR</span>
            <span className="btn-meta">IMPROVE MOMENTUM</span>
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
