import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Star, Heart, Trophy, Gauge } from 'lucide-react';
import { Clef, GameConfig, MAX_LIVES, CORRECT_ANSWERS_FOR_EXTRA_LIFE, BACKGROUND_MUSIC_UNLOCK_SCORE } from '../StaffInvadersGame';
import StaffCanvas from './StaffCanvas';
import { audioService } from '@/lib/audioService';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { FIXED_STAFF_WIDTH } from '@/lib/notation/vexflowUtils';

interface GameplayScreenProps {
  config: GameConfig;
  score: number;
  lives: number;
  level: number;
  currentSpeed: number;
  sfxEnabled: boolean;
  showCorrectAnswer: boolean;
  isPaused: boolean;
  canPause: boolean;
  onPause: () => void;
  onGameOver: (finalScore: number) => void;
  onUpdateScore: (score: number) => void;
  onUpdateLives: (lives: number) => void;
  onUpdateLevel: (level: number) => void;
  onUpdateSpeed: (speed: number) => void;
  onToggleSFX: () => void;
  onUnlockBackgroundMusic: () => void;
  gameLoopRef: React.MutableRefObject<number | null>;
}

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Calculate speed based on level with 25% increase per level
const calculateSpeed = (level: number): number => {
  const baseSpeed = 50;
  const speedIncrease = 0.25; // 25% increase per level
  return Math.round(baseSpeed * Math.pow(1 + speedIncrease, level - 1));
};

// Duration to show correct answer feedback (in ms)
const CORRECT_ANSWER_DISPLAY_DURATION = 1500;
const SPAWN_DELAY = 300; // Delay before spawning next note
// Danger zone is at staffX + 120 (120px from left edge of staff)
// We'll calculate this dynamically based on canvas width

// Clef-specific line and space notes for filtering
const CLEF_LINE_NOTES: Record<string, string[]> = {
  treble: ['E4', 'G4', 'B4', 'D5', 'F5'],
  bass: ['G2', 'B2', 'D3', 'F3', 'A3'],
  alto: ['F3', 'A3', 'C4', 'E4', 'G4'],
  grand: ['E4', 'G4', 'B4', 'D5', 'F5'],
};

const CLEF_SPACE_NOTES: Record<string, string[]> = {
  treble: ['F4', 'A4', 'C5', 'E5'],
  bass: ['A2', 'C3', 'E3', 'G3'],
  alto: ['G3', 'B3', 'D4', 'F4'],
  grand: ['F4', 'A4', 'C5', 'E5'],
};

// State machine phases - explicit phases prevent invalid states
export type NotePhase =
  | 'awaiting_spawn'         // No note on screen, waiting to spawn
  | 'note_active'            // Note moving, player can answer
  | 'showing_correct_answer'; // 1.5s display phase (wrong answer or timeout)

// Centralized note state - single source of truth
export interface NoteState {
  phase: NotePhase;
  note: string | null;              // e.g., "G4", "C5"
  noteX: number;                    // Current X position in pixels
  spawnTime: number;                // When the note was spawned
  feedback: 'correct' | 'incorrect' | null;
  correctAnswerToShow: string | null; // Letter to highlight (e.g., "G")
}

const initialNoteState: NoteState = {
  phase: 'awaiting_spawn',
  note: null,
  noteX: 0,
  spawnTime: 0,
  feedback: null,
  correctAnswerToShow: null,
};

export default function GameplayScreen({
  config,
  score,
  lives,
  level,
  currentSpeed,
  sfxEnabled,
  showCorrectAnswer,
  isPaused,
  canPause,
  onPause,
  onGameOver,
  onUpdateScore,
  onUpdateLives,
  onUpdateLevel,
  onUpdateSpeed,
  onToggleSFX,
  onUnlockBackgroundMusic,
  gameLoopRef,
}: GameplayScreenProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [noteState, setNoteState] = useState<NoteState>(initialNoteState);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const lastNoteRef = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Spawn generation/lock: prevents multiple overlapping spawn timers from producing
  // multiple notes for a single "awaiting_spawn" phase (can happen during rapid re-renders).
  const spawnGenerationRef = useRef(0);
  const spawnedForGenerationRef = useRef(false);
  // Synchronous flag to prevent animation loop from processing during answer handling
  const processingAnswerRef = useRef(false);
  const layout = useResponsiveLayout();

  // Track canvas width for spawn position
  useEffect(() => {
    const updateWidth = () => {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize audio on first interaction
  useEffect(() => {
    audioService.initialize();
  }, []);

  // Generate note range based on config
  const getNoteRange = useCallback((): string[] => {
    const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allNotes: string[] = [];

    const minNoteName = config.minNote.charAt(0);
    const minOctave = parseInt(config.minNote.charAt(1));
    const maxNoteName = config.maxNote.charAt(0);
    const maxOctave = parseInt(config.maxNote.charAt(1));

    for (let octave = minOctave; octave <= maxOctave; octave++) {
      for (const noteName of noteNames) {
        const note = `${noteName}${octave}`;
        const noteIndex = noteNames.indexOf(noteName);
        const minIndex = noteNames.indexOf(minNoteName);
        const maxIndex = noteNames.indexOf(maxNoteName);

        if (octave === minOctave && noteIndex < minIndex) continue;
        if (octave === maxOctave && noteIndex > maxIndex) continue;

        allNotes.push(note);
      }
    }

    if (config.noteFilter === 'lines') {
      const lineNotes = CLEF_LINE_NOTES[config.clef] || CLEF_LINE_NOTES.treble;
      return lineNotes.filter(note => allNotes.includes(note));
    } else if (config.noteFilter === 'spaces') {
      const spaceNotes = CLEF_SPACE_NOTES[config.clef] || CLEF_SPACE_NOTES.treble;
      return spaceNotes.filter(note => allNotes.includes(note));
    }

    return allNotes;
  }, [config.minNote, config.maxNote, config.noteFilter, config.clef]);

  // Generate a new random note (avoiding duplicates)
  const generateNote = useCallback((): string => {
    const range = getNoteRange();
    let note: string;
    let attempts = 0;
    do {
      note = range[Math.floor(Math.random() * range.length)];
      attempts++;
    } while (note === lastNoteRef.current && attempts < 10);
    lastNoteRef.current = note;
    return note;
  }, [getNoteRange]);

  // Spawn a new note - transition from awaiting_spawn to note_active
  const spawnNote = useCallback(() => {
    const newNote = generateNote();
    // Calculate spawn position at the right edge of the fixed-width staff
    // Staff is centered: staffX = (canvasWidth - FIXED_STAFF_WIDTH) / 2
    // Spawn at: staffX + FIXED_STAFF_WIDTH = (canvasWidth + FIXED_STAFF_WIDTH) / 2
    const spawnX = (canvasWidth + FIXED_STAFF_WIDTH) / 2;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:spawnNote',message:'Spawn note',data:{newNote,canvasWidth,spawnX,lastNote:lastNoteRef.current,phase:noteStateRef.current?.phase,note:noteStateRef.current?.note},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H2-ref-lag'})}).catch(()=>{});
    // #endregion
    setNoteState({
      phase: 'note_active',
      note: newNote,
      noteX: spawnX, // Start from right edge of fixed-width staff
      spawnTime: performance.now(),
      feedback: null,
      correctAnswerToShow: null,
    });
  }, [generateNote, canvasWidth]);

  // Handle spawn timing - only spawn when in awaiting_spawn phase
  useEffect(() => {
    if (noteState.phase === 'awaiting_spawn' && !isPaused) {
      // New awaiting_spawn "cycle"
      spawnGenerationRef.current += 1;
      spawnedForGenerationRef.current = false;
      const gen = spawnGenerationRef.current;

      // Defensive: clear any existing timer before scheduling a new one
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }

      spawnTimerRef.current = setTimeout(() => {
        // Ignore stale timers / duplicate firings for the same cycle
        if (gen !== spawnGenerationRef.current) return;
        if (spawnedForGenerationRef.current) return;
        spawnedForGenerationRef.current = true;
        spawnNote();
      }, SPAWN_DELAY);
      return () => {
        if (spawnTimerRef.current) {
          clearTimeout(spawnTimerRef.current);
          spawnTimerRef.current = null;
        }
      };
    }
  }, [noteState.phase, isPaused, spawnNote]);

  // Handle showing_correct_answer timeout
  useEffect(() => {
    if (noteState.phase === 'showing_correct_answer') {
      feedbackTimerRef.current = setTimeout(() => {
        setNoteState({
          phase: 'awaiting_spawn',
          note: null,
          noteX: 0,
          spawnTime: 0,
          feedback: null,
          correctAnswerToShow: null,
        });

        // Check for game over after display completes
        if (lives <= 0) {
          onGameOver(score);
        }
      }, CORRECT_ANSWER_DISPLAY_DURATION);

      return () => {
        if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
        }
      };
    }
  }, [noteState.phase, lives, score, onGameOver]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Ref to track pending timeout (for deferred side effects)
  const pendingTimeoutRef = useRef<{ noteLetter: string; newLives: number } | null>(null);

  // Animation loop - updates note position
  useEffect(() => {
    if (isPaused) {
      lastTimeRef.current = 0;
      return;
    }

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setNoteState(prev => {
        // Only update position in note_active phase
        if (prev.phase !== 'note_active' || !prev.note) {
          return prev;
        }

        const pxPerMs = currentSpeed / 1000;
        const newX = prev.noteX - pxPerMs * deltaTime;

        // Calculate danger zone position: staffX + 120
        // staffX = (canvasWidth - FIXED_STAFF_WIDTH) / 2
        // So danger zone = (canvasWidth - FIXED_STAFF_WIDTH) / 2 + 120
        const dangerZoneX = (canvasWidth - FIXED_STAFF_WIDTH) / 2 + 120;

        // Check if note reached danger zone (timeout)
        // Skip if an answer is currently being processed (prevents double life loss)
        if (newX < dangerZoneX && !processingAnswerRef.current) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:animate-timeout',message:'Timeout trigger (note crossed danger zone)',data:{prevPhase:prev.phase,prevNote:prev.note,prevX:prev.noteX,newX,deltaTime,currentSpeed,livesProp:lives,processingAnswer:processingAnswerRef.current,showCorrectAnswer},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H1-timeout-race'})}).catch(()=>{});
          // #endregion
          // Store timeout info for deferred side effects
          pendingTimeoutRef.current = {
            noteLetter: prev.note.charAt(0),
            newLives: lives - 1,
          };

          // Transition to showing_correct_answer or awaiting_spawn
          if (showCorrectAnswer) {
            return {
              phase: 'showing_correct_answer',
              note: prev.note,
              noteX: dangerZoneX,
              spawnTime: prev.spawnTime,
              feedback: 'incorrect',
              correctAnswerToShow: prev.note.charAt(0),
            };
          } else {
            return {
              phase: 'awaiting_spawn',
              note: null,
              noteX: 0,
              spawnTime: 0,
              feedback: 'incorrect',
              correctAnswerToShow: null,
            };
          }
        }

        return { ...prev, noteX: newX };
      });

      // Handle deferred timeout side effects
      if (pendingTimeoutRef.current) {
        const { newLives } = pendingTimeoutRef.current;
        pendingTimeoutRef.current = null;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:timeout-side-effects',message:'Applying timeout side effects',data:{newLives,scoreProp:score,livesProp:lives,showCorrectAnswer,sfxEnabled},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H1-timeout-race'})}).catch(()=>{});
        // #endregion

        // Play error sound
        if (sfxEnabled) {
          audioService.playErrorTone();
        }

        // Defer parent state updates
        setTimeout(() => {
          onUpdateLives(newLives);
          if (newLives <= 0 && !showCorrectAnswer) {
            onGameOver(score);
          }
        }, 0);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [isPaused, currentSpeed, sfxEnabled, showCorrectAnswer, lives, score, onUpdateLives, onGameOver, canvasWidth]);

  // Ref to access current noteState synchronously (avoids stale closure issues)
  // FIX: Update ref synchronously during render, not in useEffect, to avoid race condition
  // where user sees new note on screen but ref still has old note (causing false incorrects)
  const noteStateRef = useRef(noteState);
  // Synchronous update during render - this runs BEFORE any event handlers can fire
  noteStateRef.current = noteState;
  // #region agent log
  // Log ref updates for debugging (keep in useEffect to avoid excessive logging during rapid renders)
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:noteStateRefEffect',message:'noteStateRef updated (sync)',data:{phase:noteState.phase,note:noteState.note,noteX:noteState.noteX,feedback:noteState.feedback,correctAnswerToShow:noteState.correctAnswerToShow},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H2-ref-lag'})}).catch(()=>{});
  }, [noteState]);
  // #endregion

  // Handle note answer - synchronous state transition
  const handleNoteAnswer = useCallback((noteName: string) => {
    // Guard: prevent double-submission (e.g., rapid taps/keys before UI/state re-renders)
    // This is especially important when "Show Correct Answer" is enabled, since students
    // tend to immediately try again after seeing the revealed answer.
    if (processingAnswerRef.current) {
      return;
    }
    const currentState = noteStateRef.current;

    // Guard: Only process answers in note_active phase
    if (currentState.phase !== 'note_active' || !currentState.note) {
      return;
    }

    // Set flag to prevent animation loop from processing timeout during answer handling
    processingAnswerRef.current = true;

    const currentNoteLetter = currentState.note.charAt(0);
    const isCorrect = noteName === currentNoteLetter;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:handleNoteAnswer',message:'Handle answer',data:{input:noteName,currentPhase:currentState.phase,currentNote:currentState.note,currentNoteLetter,isCorrect,noteX:currentState.noteX,spawnTime:currentState.spawnTime,processingAnswer:processingAnswerRef.current,scoreProp:score,livesProp:lives,levelProp:level,isPausedProp:isPaused},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:isCorrect?'H3-input-mismatch':'H3-input-mismatch'})}).catch(()=>{});
    // #endregion

    if (isCorrect) {
      // Play success sound
      if (sfxEnabled) {
        audioService.playSuccessTone();
      }

      // Calculate new values
      const newScore = score + 1;
      const newLevel = Math.floor(newScore / 10) + 1;
      const shouldLevelUp = newLevel !== level;
      const shouldRestoreLife = newScore > 0 && newScore % CORRECT_ANSWERS_FOR_EXTRA_LIFE === 0 && lives < MAX_LIVES;

      // Start background music at the moment the student hits the unlock threshold.
      // This runs within the same user gesture (click/keypress) to satisfy autoplay rules.
      if (newScore === BACKGROUND_MUSIC_UNLOCK_SCORE) {
        onUnlockBackgroundMusic();
      }

      // Update note state first
      setNoteState({
        phase: 'awaiting_spawn',
        note: null,
        noteX: currentState.noteX,
        spawnTime: 0,
        feedback: 'correct',
        correctAnswerToShow: null,
      });

      // Then update parent state (deferred to avoid render-time updates)
      setTimeout(() => {
        onUpdateScore(newScore);

        if (shouldRestoreLife) {
          onUpdateLives(lives + 1);
        }

        if (shouldLevelUp) {
          onUpdateLevel(newLevel);
          onUpdateSpeed(calculateSpeed(newLevel));
          if (sfxEnabled) {
            audioService.playLevelUpSound();
          }
        }

        // Clear flag after state updates are committed
        processingAnswerRef.current = false;
      }, 0);
    } else {
      // Wrong answer
      if (sfxEnabled) {
        audioService.playErrorTone();
      }

      const newLives = lives - 1;

      if (showCorrectAnswer) {
        // Update note state to showing_correct_answer phase
        setNoteState({
          phase: 'showing_correct_answer',
          note: currentState.note,
          noteX: currentState.noteX,
          spawnTime: currentState.spawnTime,
          feedback: 'incorrect',
          correctAnswerToShow: currentNoteLetter,
        });
      } else {
        // Immediate transition
        setNoteState({
          phase: 'awaiting_spawn',
          note: null,
          noteX: 0,
          spawnTime: 0,
          feedback: 'incorrect',
          correctAnswerToShow: null,
        });
      }

      // Update lives (deferred)
      setTimeout(() => {
        onUpdateLives(newLives);

        if (newLives <= 0 && !showCorrectAnswer) {
          onGameOver(score);
        }

        // Clear flag after state updates are committed
        processingAnswerRef.current = false;
      }, 0);
    }
  }, [score, lives, level, sfxEnabled, showCorrectAnswer, onUnlockBackgroundMusic, onUpdateScore, onUpdateLives, onUpdateLevel, onUpdateSpeed, onGameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // Global shortcuts
      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (canPause) {
          onPause();
        }
        return;
      }

      if (key === 'M') {
        e.preventDefault();
        onToggleSFX();
        return;
      }

      // Note input (only when not paused and note is active)
      // Use refs (not state) to avoid any transient stale-closure windows.
      if (
        !isPaused &&
        NOTE_NAMES.includes(key) &&
        !processingAnswerRef.current &&
        noteStateRef.current?.phase === 'note_active'
      ) {
        e.preventDefault();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:handleKeyPress',message:'Keypress note input',data:{key,statePhase:noteState.phase,refPhase:noteStateRef.current?.phase,refNote:noteStateRef.current?.note,refNoteX:noteStateRef.current?.noteX,processingAnswer:processingAnswerRef.current,isPausedProp:isPaused},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H2-ref-lag'})}).catch(()=>{});
        // #endregion
        handleNoteAnswer(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPaused, noteState.phase, canPause, onPause, onToggleSFX, handleNoteAnswer]);

  // Clear feedback after a short delay when transitioning to awaiting_spawn
  useEffect(() => {
    if (noteState.phase === 'awaiting_spawn' && noteState.feedback) {
      const timer = setTimeout(() => {
        setNoteState(prev => ({ ...prev, feedback: null }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [noteState.phase, noteState.feedback]);

  // Derived state for UI
  const canAnswer = noteState.phase === 'note_active';
  const isShowingCorrectAnswer = noteState.phase === 'showing_correct_answer';

  return (
    <div className="w-full h-[100dvh] overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 to-black relative">
      {/* Starfield background effect (CSS) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
         <div className="absolute top-20 left-3/4 w-2 h-2 bg-blue-200 rounded-full shadow-[0_0_10px_blue]" />
         <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-white rounded-full" />
      </div>

      {/* Main Game Container */}
      <div
        className="flex-1 flex flex-col relative z-10"
        style={{
          padding: `${layout.padding * 0.5}px`,
          gap: `${layout.padding * 0.5}px`,
          maxHeight: '100dvh'
        }}
      >
        {/* HUD Bar */}
        <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Score */}
            <div className="flex flex-col">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Score
              </div>
              <div className="text-2xl font-mono font-bold text-white leading-none mt-1">
                {score.toString().padStart(3, '0')}
              </div>
            </div>

            {/* Level & Progress */}
            <div className="flex flex-col min-w-[100px]">
              <div className="flex justify-between items-center text-xs uppercase text-slate-400 font-bold tracking-wider">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Level {level}</span>
                <span className="text-slate-500">{score % 10}/10</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full mt-1.5 overflow-hidden border border-slate-600/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500 ease-out"
                  style={{ width: `${((score % 10) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Lives */}
            <div className="flex flex-col">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" /> Lives
              </div>
              <div className="flex gap-1 mt-1.5">
                {[...Array(MAX_LIVES)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all duration-300 ${
                      i < lives ? 'fill-red-500 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'fill-slate-700 text-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Difficulty */}
            {config.difficultyLabel && (
              <div className="flex flex-col">
                <div className="text-xs uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-purple-400" /> Difficulty
                </div>
                <div className="text-sm font-semibold text-purple-300 mt-1.5 capitalize">
                  {config.difficultyLabel}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleSFX}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              onClick={onPause}
              variant="ghost"
              size="icon"
              disabled={!canPause}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Pause className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Game Canvas */}
        <div
          ref={canvasContainerRef}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 relative overflow-hidden shadow-inner shadow-black/50"
        >
          <StaffCanvas
            config={config}
            noteState={noteState}
            isPaused={isPaused || isShowingCorrectAnswer}
            gameLoopRef={gameLoopRef}
          />
        </div>

        {/* Input Controls */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg">
          <div className="flex justify-center gap-2 flex-wrap">
            {NOTE_NAMES.map((note) => {
              const isCorrectAnswer = noteState.correctAnswerToShow === note;
              return (
                <button
                  key={note}
                  onClick={() => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/36199739-8e0a-4920-9ffe-bf7aeb131ed5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameplayScreen.tsx:buttonClick',message:'Button click note input',data:{clickedNote:note,statePhase:noteState.phase,stateNote:noteState.note,refPhase:noteStateRef.current.phase,refNote:noteStateRef.current.note,refNoteX:noteStateRef.current.noteX,canAnswerProp:canAnswer,isPausedProp:isPaused,processingAnswer:processingAnswerRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'sw-run1',hypothesisId:'H4-button-race'})}).catch(()=>{});
                    // #endregion
                    handleNoteAnswer(note);
                  }}
                  disabled={!canAnswer || isPaused}
                  className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-150
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isCorrectAnswer
                      ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-110 z-10 ring-2 ring-white animate-pulse'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 shadow-lg border border-slate-600 hover:border-slate-400 hover:text-white'
                    }
                  `}
                >
                  {note}
                </button>
              );
            })}
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500 uppercase tracking-widest">
            {isShowingCorrectAnswer ? 'The correct answer was highlighted' : 'Tap note to fire'}
          </div>
        </div>
      </div>
    </div>
  );
}
