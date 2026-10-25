import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { useGameStore } from '../stores/gameStore';
import { HUD } from '../ui/HUD';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { LevelSelectModal } from '../ui/LevelSelectModal';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { SettingsModal } from '../ui/SettingsModal';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const screen = useGameStore((s) => s.screen);
  const respawnFadeOpacity = useGameStore((s) => s.respawnFadeOpacity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameEngine = new GameEngine(canvas);
    setEngine(gameEngine);
    void gameEngine.init();

    return () => {
      gameEngine.dispose();
    };
  }, []);

  return (
    <div className="app-root">
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="game-canvas"
        onClick={() => {
          if (useGameStore.getState().screen === 'playing') {
            engine?.sound.unlock();
            engine?.input.requestPointerLock();
          }
        }}
      />

      {/* Respawn Ethereal Transition Curtain */}
      <div
        className="respawn-fade-overlay"
        style={{ opacity: respawnFadeOpacity }}
      />

      {/* Minimalist Gameplay HUD & Touch Controls */}
      <HUD engine={engine} />

      {/* Declarative Menu Overlays */}
      {screen === 'menu' && <MainMenu engine={engine} />}
      <PauseMenu engine={engine} />
      <LevelSelectModal engine={engine} />
      <SettingsModal engine={engine} />
      <LevelCompleteModal engine={engine} />
    </div>
  );
};
