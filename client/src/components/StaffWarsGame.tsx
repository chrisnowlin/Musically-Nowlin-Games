import React, { useState, useRef, useEffect, useReducer } from 'react';
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { audioService } from '@/lib/audioService';
import SetupScreen from './staff-wars/SetupScreen';
import GameplayScreen from './staff-wars/GameplayScreen';
import GameOverScreen from './staff-wars/GameOverScreen';
import PauseOverlay from './staff-wars/PauseOverlay';
import { ResponsiveGameLayout } from '@/components/ResponsiveGameLayout';
import { useResponsiveLayout } from '@/hooks/useViewport';

export type Clef = 'treble' | 'bass' | 'alto' | 'grand';
export type GameStatus = 'setup' | 'playing' | 'paused' | 'gameOver';

export interface GameConfig {
  clef: Clef;
  minNote: string;
  maxNote: string;
}

export interface GameState {
  status: GameStatus;
  config: GameConfig;
  score: number;
  lives: number;
  level: number;
  currentSpeed: number;
  sfxEnabled: boolean;
  highScores: number[];
}

type GameAction =
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'UPDATE_SCORE'; score: number }
  | { type: 'UPDATE_LIVES'; lives: number }
  | { type: 'UPDATE_LEVEL'; level: number }
  | { type: 'UPDATE_SPEED'; speed: number }
  | { type: 'GAME_OVER' }
  | { type: 'TOGGLE_SFX' }
  | { type: 'LOAD_HIGH_SCORES'; scores: number[] }
  | { type: 'RETURN_TO_SETUP' };

const initialState: GameState = {
  status: 'setup',
  config: { clef: 'treble', minNote: 'C4', maxNote: 'C5' },
  score: 0,
  lives: 3,
  level: 1,
  currentSpeed: 50,
  sfxEnabled: true,
  highScores: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        status: 'playing',
        config: action.config,
        score: 0,
        lives: 3,
        level: 1,
        currentSpeed: 50,
      };
    case 'PAUSE':
      return { ...state, status: 'paused' };
    case 'RESUME':
      return { ...state, status: 'playing' };
    case 'UPDATE_SCORE':
      return { ...state, score: action.score };
    case 'UPDATE_LIVES':
      return { ...state, lives: action.lives };
    case 'UPDATE_LEVEL':
      return { ...state, level: action.level };
    case 'UPDATE_SPEED':
      return { ...state, currentSpeed: action.speed };
    case 'GAME_OVER':
      return { ...state, status: 'gameOver' };
    case 'TOGGLE_SFX':
      return { ...state, sfxEnabled: !state.sfxEnabled };
    case 'LOAD_HIGH_SCORES':
      return { ...state, highScores: action.scores };
    case 'RETURN_TO_SETUP':
      return { ...state, status: 'setup', score: 0, lives: 3, level: 1, currentSpeed: 50 };
    default:
      return state;
  }
}

export default function StaffWarsGame() {
  const [, setLocation] = useLocation();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<number | null>(null);
  const layout = useResponsiveLayout();

  // Load high scores on mount
  useEffect(() => {
    const saved = localStorage.getItem('staffWarsHighScores');
    if (saved) {
      try {
        const scores = JSON.parse(saved);
        dispatch({ type: 'LOAD_HIGH_SCORES', scores });
      } catch (e) {
        console.error('Failed to load high scores:', e);
      }
    }

    // Load SFX preference
    const sfxPref = localStorage.getItem('staffWarsSFX');
    if (sfxPref === 'false') {
      dispatch({ type: 'TOGGLE_SFX' });
      audioService.setVolume(0);
    }
  }, []);

  // Save high scores when they change
  useEffect(() => {
    localStorage.setItem('staffWarsHighScores', JSON.stringify(state.highScores));
  }, [state.highScores]);

  // Save SFX preference
  useEffect(() => {
    localStorage.setItem('staffWarsSFX', String(state.sfxEnabled));
    audioService.setVolume(state.sfxEnabled ? 0.3 : 0);
  }, [state.sfxEnabled]);

  const handleStartGame = (config: GameConfig) => {
    dispatch({ type: 'START_GAME', config });
  };

  const handlePause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const handleResume = () => {
    dispatch({ type: 'RESUME' });
  };

  const handleGameOver = (finalScore: number) => {
    dispatch({ type: 'GAME_OVER' });
    
    // Update high scores
    const newScores = [...state.highScores, finalScore]
      .sort((a, b) => b - a)
      .slice(0, 5);
    dispatch({ type: 'LOAD_HIGH_SCORES', scores: newScores });
  };

  const handleReturnToSetup = () => {
    dispatch({ type: 'RETURN_TO_SETUP' });
  };

  const handleToggleSFX = () => {
    dispatch({ type: 'TOGGLE_SFX' });
  };

  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute z-50 flex items-center text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all touch-target"
        style={{
          top: `${layout.padding}px`,
          left: `${layout.padding}px`,
          gap: `${layout.gridGap / 4}px`,
          padding: `${layout.padding * 0.5}px ${layout.padding}px`,
          fontSize: `${layout.getFontSize('sm')}px`
        }}
      >
        <ChevronLeft size={layout.device.isMobile ? 20 : 24} />
        Main Menu
      </button>

      {state.status === 'setup' && (
        <SetupScreen onStartGame={handleStartGame} highScores={state.highScores} />
      )}
      
      {(state.status === 'playing' || state.status === 'paused') && (
        <>
          <GameplayScreen
            config={state.config}
            score={state.score}
            lives={state.lives}
            level={state.level}
            currentSpeed={state.currentSpeed}
            sfxEnabled={state.sfxEnabled}
            isPaused={state.status === 'paused'}
            onPause={handlePause}
            onGameOver={handleGameOver}
            onUpdateScore={(score) => dispatch({ type: 'UPDATE_SCORE', score })}
            onUpdateLives={(lives) => dispatch({ type: 'UPDATE_LIVES', lives })}
            onUpdateLevel={(level) => dispatch({ type: 'UPDATE_LEVEL', level })}
            onUpdateSpeed={(speed) => dispatch({ type: 'UPDATE_SPEED', speed })}
            onToggleSFX={handleToggleSFX}
            gameLoopRef={gameLoopRef}
          />
          
          {state.status === 'paused' && (
            <PauseOverlay
              onResume={handleResume}
              onQuit={handleReturnToSetup}
            />
          )}
        </>
      )}
      
      {state.status === 'gameOver' && (
        <GameOverScreen
          score={state.score}
          highScores={state.highScores}
          onRestart={handleReturnToSetup}
        />
      )}
    </div>
  );
}

