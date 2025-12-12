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

// Game constants
export const MAX_LIVES = 3;
export const CORRECT_ANSWERS_FOR_EXTRA_LIFE = 30;
export const BACKGROUND_MUSIC_UNLOCK_SCORE = 20;
export const MAX_PAUSES = 2;

export type NoteFilter = 'all' | 'lines' | 'spaces';

export interface GameConfig {
  clef: Clef;
  minNote: string;
  maxNote: string;
  noteFilter?: NoteFilter;
  difficultyLabel?: string;
}

export interface GameState {
  status: GameStatus;
  config: GameConfig;
  score: number;
  lives: number;
  level: number;
  currentSpeed: number;
  sfxEnabled: boolean;
  showCorrectAnswer: boolean;
  highScores: number[];
  pausesRemaining: number;
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
  | { type: 'TOGGLE_SHOW_CORRECT_ANSWER' }
  | { type: 'LOAD_HIGH_SCORES'; scores: number[] }
  | { type: 'RETURN_TO_SETUP' };

const initialState: GameState = {
  status: 'setup',
  config: { clef: 'treble', minNote: 'C4', maxNote: 'C5' },
  score: 0,
  lives: MAX_LIVES,
  level: 1,
  currentSpeed: 50,
  sfxEnabled: true,
  showCorrectAnswer: false, // Default to off for experienced players
  highScores: [],
  pausesRemaining: MAX_PAUSES,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        status: 'playing',
        config: action.config,
        score: 0,
        lives: MAX_LIVES,
        level: 1,
        currentSpeed: 50,
        pausesRemaining: MAX_PAUSES,
      };
    case 'PAUSE':
      // Only allow pause if pauses remain
      if (state.pausesRemaining <= 0) return state;
      return { ...state, status: 'paused', pausesRemaining: state.pausesRemaining - 1 };
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
    case 'TOGGLE_SHOW_CORRECT_ANSWER':
      return { ...state, showCorrectAnswer: !state.showCorrectAnswer };
    case 'LOAD_HIGH_SCORES':
      return { ...state, highScores: action.scores };
    case 'RETURN_TO_SETUP':
      return { ...state, status: 'setup', score: 0, lives: MAX_LIVES, level: 1, currentSpeed: 50, pausesRemaining: MAX_PAUSES };
    default:
      return state;
  }
}

export default function StaffWarsGame() {
  const [, setLocation] = useLocation();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmStartedRef = useRef(false);
  const layout = useResponsiveLayout();

  // Load high scores and preferences on mount
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

    // Load show correct answer preference (default to false)
    const showCorrectPref = localStorage.getItem('staffWarsShowCorrectAnswer');
    if (showCorrectPref === 'true') {
      dispatch({ type: 'TOGGLE_SHOW_CORRECT_ANSWER' });
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

  // Save show correct answer preference
  useEffect(() => {
    localStorage.setItem('staffWarsShowCorrectAnswer', String(state.showCorrectAnswer));
  }, [state.showCorrectAnswer]);

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

  const handleQuitToSetup = () => {
    dispatch({ type: 'RETURN_TO_SETUP' });
  };

  const handlePlayAgain = () => {
    // Start new game immediately with same config
    dispatch({ type: 'START_GAME', config: state.config });
  };

  const handleToggleSFX = () => {
    dispatch({ type: 'TOGGLE_SFX' });
  };

  const handleToggleShowCorrectAnswer = () => {
    dispatch({ type: 'TOGGLE_SHOW_CORRECT_ANSWER' });
  };

  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Initialize background music audio element once (served from /public)
  useEffect(() => {
    const audio = new Audio('/audio/galactic-groove.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.25;
    bgmRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      bgmRef.current = null;
      bgmStartedRef.current = false;
    };
  }, []);

  // Keep background music paused unless actively playing (and enabled via SFX toggle)
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    const shouldPlay =
      bgmStartedRef.current &&
      state.status === 'playing' &&
      state.sfxEnabled;

    if (!shouldPlay) {
      try {
        audio.pause();
      } catch {
        // ignore
      }
      return;
    }

    void audio.play().catch(() => {
      // If play fails due to browser gesture rules, we'll retry on next user gesture.
    });
  }, [state.status, state.sfxEnabled]);

  // If a new run starts (score reset), reset background music state
  useEffect(() => {
    if (state.score !== 0) return;
    if (!bgmStartedRef.current) return;
    const audio = bgmRef.current;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // ignore
    }
    bgmStartedRef.current = false;
  }, [state.score]);

  // Called from a user gesture (correct answer click/keypress) when score hits the unlock threshold
  const handleUnlockBackgroundMusic = () => {
    const audio = bgmRef.current;
    if (!audio) return;
    if (bgmStartedRef.current) return;
    bgmStartedRef.current = true;

    // Best effort: play immediately (this is called from a user gesture)
    void audio.play().catch(() => {
      // If blocked, the effect above will retry when possible.
    });
  };

  return (
    <div className="w-full min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
      {(state.status === 'setup' || state.status === 'gameOver') && (
        <button
          onClick={() => setLocation("/games")}
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
      )}

      {state.status === 'setup' && (
        <SetupScreen
          onStartGame={handleStartGame}
          highScores={state.highScores}
          showCorrectAnswer={state.showCorrectAnswer}
          onToggleShowCorrectAnswer={handleToggleShowCorrectAnswer}
        />
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
            showCorrectAnswer={state.showCorrectAnswer}
            isPaused={state.status === 'paused'}
            canPause={state.pausesRemaining > 0}
            onPause={handlePause}
            onGameOver={handleGameOver}
            onUpdateScore={(score) => dispatch({ type: 'UPDATE_SCORE', score })}
            onUpdateLives={(lives) => dispatch({ type: 'UPDATE_LIVES', lives })}
            onUpdateLevel={(level) => dispatch({ type: 'UPDATE_LEVEL', level })}
            onUpdateSpeed={(speed) => dispatch({ type: 'UPDATE_SPEED', speed })}
            onToggleSFX={handleToggleSFX}
            onUnlockBackgroundMusic={handleUnlockBackgroundMusic}
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
          difficultyLabel={state.config.difficultyLabel}
          onRestart={handlePlayAgain}
          onQuit={handleQuitToSetup}
        />
      )}
    </div>
  );
}
