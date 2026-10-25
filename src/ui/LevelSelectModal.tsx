import React from 'react';
import type { GameEngine } from '../game/GameEngine';
import { LEVELS } from '../game/levels/LevelRegistry';
import { BIOME_PALETTES } from '../game/world/MaterialLibrary';
import { useGameStore } from '../stores/gameStore';
import { formatTime } from './HUD';

interface LevelSelectModalProps {
  engine: GameEngine | null;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({ engine }) => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const progress = useGameStore((s) => s.progress);
  const currentLevelId = useGameStore((s) => s.currentLevelId);

  if (activeModal !== 'level_select') return null;

  return (
    <div className="menu-overlay">
      <div className="modal-card modal-wide">
        <div className="modal-header">
          <div>
            <div className="menu-kicker">MONUMENTAL PROGRESSION</div>
            <h2 className="modal-title">SECTOR SELECTION</h2>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setActiveModal('none')}
          >
            BACK [ESC]
          </button>
        </div>

        <div className="level-grid">
          {LEVELS.map((lvl) => {
            const palette = BIOME_PALETTES[lvl.biome];
            const best = progress.bestTimes[lvl.id];
            const isCompleted = progress.completedLevels.includes(lvl.id);
            const isSelected = currentLevelId === lvl.id;

            return (
              <div
                key={lvl.id}
                className={`level-card ${isSelected ? 'selected' : ''}`}
              >
                <div
                  className="level-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${palette.skyTop} 0%, ${palette.skyHorizon} 100%)`,
                  }}
                >
                  <span className="level-index">0{lvl.index}</span>
                  {isCompleted && <span className="level-badge">COMPLETED</span>}
                </div>

                <div className="level-body">
                  <h3 className="level-name">{lvl.name}</h3>
                  <p className="level-desc">{lvl.subtitle}</p>

                  <div className="level-stats">
                    <div>
                      <span className="stat-label">PAR TIME</span>
                      <span className="stat-val">{formatTime(lvl.parTimeSeconds)}</span>
                    </div>
                    <div>
                      <span className="stat-label">BEST TIME</span>
                      <span className="stat-val">
                        {best !== undefined ? formatTime(best) : '— : —'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-architectural btn-primary"
                    onClick={() => engine?.startGame(lvl.id)}
                  >
                    <span>LAUNCH SECTOR</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
