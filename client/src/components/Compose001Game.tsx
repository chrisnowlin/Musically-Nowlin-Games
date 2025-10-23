import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { 
  generateRound, 
  validateComposition, 
  calculateScore, 
  getDifficultyProgression,
  NOTES, 
  RHYTHM_NOTES, 
  CHORDS,
  type GameRound,
  type Composition,
  type ValidationResult
} from "@/lib/gameLogic/compose-001Logic";
import { 
  getAllModes, 
  getModeDefinition
} from "@/lib/gameLogic/compose-001Modes";

type Mode = "melody" | "rhythm" | "harmony";

interface GameState {
  currentMode: Mode;
  score: number;
  round: number;
  selectedNotes: string[];
  selectedRhythm: string[];
  selectedChords: string[];
  volume: number;
  currentRound: GameRound | null;
  gameStarted: boolean;
  feedback: ValidationResult | null;
  startTime: number;
}

export const Compose001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "melody",
    score: 0,
    round: 1,
    selectedNotes: [],
    selectedRhythm: [],
    selectedChords: [],
    volume: 50,
    currentRound: null,
    gameStarted: false,
    feedback: null,
    startTime: Date.now(),
  });

  const audioContext = React.useRef<AudioContext | null>(null);
  const modes = getAllModes();

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    // Generate initial round when game starts or mode changes
    if (!gameState.currentRound || gameState.currentRound.mode !== gameState.currentMode) {
      const difficulty = getDifficultyProgression(gameState.round);
      const newRound = generateRound(gameState.currentMode, difficulty);
      setGameState(prev => ({
        ...prev,
        currentRound: newRound,
        gameStarted: true,
        feedback: null,
        startTime: Date.now(),
        selectedNotes: [],
        selectedRhythm: [],
        selectedChords: [],
      }));
    }
  }, [gameState.currentMode, gameState.round, gameState.currentRound]);

  const playNote = useCallback((frequency: number, duration: number = 0.5) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const volume = gameState.volume / 100;
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  }, [gameState.volume]);

  const playMelody = useCallback(() => {
    if (gameState.selectedNotes.length === 0) return;

    gameState.selectedNotes.forEach((noteName, index) => {
      const note = NOTES.find(n => n.name === noteName);
      if (note) {
        setTimeout(() => {
          playNote(note.frequency, 0.4);
        }, index * 500);
      }
    });
  }, [gameState.selectedNotes, playNote]);

  const playChord = useCallback((chordName: string) => {
    const chord = CHORDS.find(c => c.name === chordName);
    if (chord) {
      chord.notes.forEach(noteName => {
        const note = NOTES.find(n => n.name === noteName);
        if (note) {
          playNote(note.frequency, 1.0);
        }
      });
    }
  }, [playNote]);

  const playProgression = useCallback(() => {
    if (gameState.selectedChords.length === 0) return;

    gameState.selectedChords.forEach((chordName, index) => {
      setTimeout(() => {
        playChord(chordName);
      }, index * 1200);
    });
  }, [gameState.selectedChords, playChord]);

  const handleModeChange = (mode: Mode) => {
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 1,
      selectedNotes: [],
      selectedRhythm: [],
      selectedChords: [],
      feedback: null,
    }));
  };

  const handleNoteSelect = (noteName: string) => {
    if (gameState.selectedNotes.length >= 8) return; // Max 8 notes

    const note = NOTES.find(n => n.name === noteName);
    if (note) {
      playNote(note.frequency, 0.3);
    }

    setGameState(prev => ({
      ...prev,
      selectedNotes: [...prev.selectedNotes, noteName],
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleRhythmSelect = (symbol: string) => {
    if (gameState.selectedRhythm.length >= 8) return; // Max 8 rhythm notes

    setGameState(prev => ({
      ...prev,
      selectedRhythm: [...prev.selectedRhythm, symbol],
    }));
  };

  const handleChordSelect = (chordName: string) => {
    if (gameState.selectedChords.length >= 6) return; // Max 6 chords

    playChord(chordName);

    setGameState(prev => ({
      ...prev,
      selectedChords: [...prev.selectedChords, chordName],
    }));
  };

  const handleClear = () => {
    setGameState(prev => ({
      ...prev,
      selectedNotes: [],
      selectedRhythm: [],
      selectedChords: [],
      feedback: null,
    }));
  };

  const handleSubmit = () => {
    if (!gameState.currentRound) return;

    const timeSpent = Date.now() - gameState.startTime;
    let composition: Composition;

    switch (gameState.currentMode) {
      case "melody":
        composition = {
          type: "melody",
          notes: gameState.selectedNotes,
        };
        break;
      case "rhythm":
        composition = {
          type: "rhythm",
          rhythm: gameState.selectedRhythm,
        };
        break;
      case "harmony":
        composition = {
          type: "harmony",
          chords: gameState.selectedChords,
        };
        break;
    }

    const validationResult = validateComposition(composition, gameState.currentRound, timeSpent);
    const roundScore = calculateScore(validationResult, gameState.currentRound.difficulty);

    setGameState(prev => ({
      ...prev,
      score: prev.score + roundScore,
      round: prev.round + 1,
      selectedNotes: [],
      selectedRhythm: [],
      selectedChords: [],
      feedback: validationResult,
    }));
  };

  const renderMelodyMode = () => (
    <div>
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold text-blue-900 mb-2">Challenge:</p>
        <p className="text-blue-700">{gameState.currentRound?.challenge.text || "Loading challenge..."}</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-4">
        <h3 className="font-bold mb-3 text-gray-700">Your Melody:</h3>
        <div className="min-h-[80px] bg-purple-50 rounded-lg p-4 mb-4">
          {gameState.selectedNotes.length === 0 ? (
            <p className="text-gray-400 text-center">Click notes below to compose your melody</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {gameState.selectedNotes.map((note, index) => (
                <div key={index} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                  {note}
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 className="font-bold mb-3 text-gray-700">Select Notes:</h3>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Musical notes for composition">
          {NOTES.map(note => (
            <button
              key={note.name}
              onClick={() => handleNoteSelect(note.name)}
              onKeyDown={(e) => handleKeyDown(e, () => handleNoteSelect(note.name))}
              className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              disabled={gameState.selectedNotes.length >= 8}
              aria-label={`Note ${note.name}, frequency ${note.frequency} Hz`}
              aria-describedby={gameState.selectedNotes.length >= 8 ? "max-notes-reached" : undefined}
            >
              {note.name}
            </button>
          ))}
        </div>
        {gameState.selectedNotes.length >= 8 && (
          <p id="max-notes-reached" className="sr-only">
            Maximum number of notes reached. Clear your melody to add more notes.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={playMelody}
          disabled={gameState.selectedNotes.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          <Play size={20} /> Play Melody
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          <RotateCcw size={20} /> Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={gameState.selectedNotes.length < 3}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          Submit Melody
        </button>
      </div>
    </div>
  );

  const renderRhythmMode = () => (
    <div>
      <div className="bg-orange-50 rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold text-orange-900 mb-2">Challenge:</p>
        <p className="text-orange-700">{gameState.currentRound?.challenge.text || "Loading challenge..."}</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-4">
        <h3 className="font-bold mb-3 text-gray-700">Your Rhythm Pattern:</h3>
        <div className="min-h-[80px] bg-orange-50 rounded-lg p-4 mb-4">
          {gameState.selectedRhythm.length === 0 ? (
            <p className="text-gray-400 text-center">Click rhythm notes below to compose your pattern</p>
          ) : (
            <div className="flex gap-2 flex-wrap items-center">
              {gameState.selectedRhythm.map((symbol, index) => (
                <span key={index} className="text-4xl text-orange-600">
                  {symbol}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3 className="font-bold mb-3 text-gray-700">Select Rhythm Notes:</h3>
        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Rhythm notes for composition">
          {RHYTHM_NOTES.map(rhythm => (
            <button
              key={rhythm.duration}
              onClick={() => handleRhythmSelect(rhythm.symbol)}
              onKeyDown={(e) => handleKeyDown(e, () => handleRhythmSelect(rhythm.symbol))}
              className="bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-6 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              disabled={gameState.selectedRhythm.length >= 8}
              aria-label={`Rhythm note: ${rhythm.duration}, ${rhythm.beats} beats`}
              aria-describedby={gameState.selectedRhythm.length >= 8 ? "max-rhythm-reached" : undefined}
            >
              <div className="text-4xl mb-2" aria-hidden="true">{rhythm.symbol}</div>
              <div className="text-sm font-semibold capitalize">{rhythm.duration}</div>
            </button>
          ))}
        </div>
        {gameState.selectedRhythm.length >= 8 && (
          <p id="max-rhythm-reached" className="sr-only">
            Maximum number of rhythm notes reached. Clear your rhythm to add more notes.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          <RotateCcw size={20} /> Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={gameState.selectedRhythm.length < 3}
          className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          Submit Rhythm
        </button>
      </div>
    </div>
  );

  const renderHarmonyMode = () => (
    <div>
      <div className="bg-green-50 rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold text-green-900 mb-2">Challenge:</p>
        <p className="text-green-700">{gameState.currentRound?.challenge.text || "Loading challenge..."}</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-4">
        <h3 className="font-bold mb-3 text-gray-700">Your Chord Progression:</h3>
        <div className="min-h-[80px] bg-green-50 rounded-lg p-4 mb-4">
          {gameState.selectedChords.length === 0 ? (
            <p className="text-gray-400 text-center">Click chords below to build your progression</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {gameState.selectedChords.map((chord, index) => (
                <div key={index} className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold">
                  <div className="text-lg">{chord}</div>
                  <div className="text-xs opacity-75">
                    {CHORDS.find(c => c.name === chord)?.notes.join("-")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 className="font-bold mb-3 text-gray-700">Select Chords:</h3>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Chords for harmony composition">
          {CHORDS.map(chord => (
            <button
              key={chord.name}
              onClick={() => handleChordSelect(chord.name)}
              onKeyDown={(e) => handleKeyDown(e, () => handleChordSelect(chord.name))}
              className="bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-4 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              disabled={gameState.selectedChords.length >= 6}
              aria-label={`Chord: ${chord.name}, notes: ${chord.notes.join(", ")}`}
              aria-describedby={gameState.selectedChords.length >= 6 ? "max-chords-reached" : undefined}
            >
              <div className="font-bold text-lg">{chord.name}</div>
              <div className="text-sm opacity-75">{chord.notes.join(" - ")}</div>
            </button>
          ))}
        </div>
        {gameState.selectedChords.length >= 6 && (
          <p id="max-chords-reached" className="sr-only">
            Maximum number of chords reached. Clear your progression to add more chords.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={playProgression}
          disabled={gameState.selectedChords.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          <Play size={20} /> Play Progression
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          <RotateCcw size={20} /> Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={gameState.selectedChords.length < 2}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          Submit Progression
        </button>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!gameState.feedback) return null;

    const { valid, score, feedback, details } = gameState.feedback;

    return (
      <div className={`rounded-lg p-6 mb-6 ${valid ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center gap-3 mb-4">
          {valid ? (
            <CheckCircle size={24} className="text-green-600" />
          ) : (
            <XCircle size={24} className="text-red-600" />
          )}
          <h3 className={`text-lg font-semibold ${valid ? 'text-green-900' : 'text-red-900'}`}>
            {feedback}
          </h3>
        </div>
        
        <div className={`mb-3 ${valid ? 'text-green-700' : 'text-red-700'}`}>
          Score: {score} points
        </div>

        {details && (
          <div className="space-y-2">
            {details.metRequirements.length > 0 && (
              <div>
                <p className="font-semibold text-green-800">✓ Requirements met:</p>
                <ul className="list-disc list-inside text-sm text-green-700">
                  {details.metRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {details.missedRequirements.length > 0 && (
              <div>
                <p className="font-semibold text-red-800">✗ Requirements missed:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {details.missedRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentModeDef = useMemo(() => getModeDefinition(gameState.currentMode), [gameState.currentMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-900">Composition Studio</h1>
        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Game modes">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id as Mode)}
            onKeyDown={(e) => handleKeyDown(e, () => handleModeChange(mode.id as Mode))}
            role="tab"
            aria-selected={gameState.currentMode === mode.id}
            aria-controls={`${mode.id}-panel`}
            className={
              gameState.currentMode === mode.id
                ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            }
          >
            <span aria-hidden="true">{mode.icon}</span> {mode.name.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 size={20} className="text-purple-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-gray-600 min-w-[45px]">{gameState.volume}%</span>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {renderFeedback()}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700">
              Mode: {currentModeDef?.name.toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Difficulty: {gameState.currentRound?.difficulty || 1}
            </p>
          </div>

          <div 
            role="tabpanel" 
            id={`${gameState.currentMode}-panel`}
            aria-labelledby={`${gameState.currentMode}-tab`}
          >
            {gameState.currentMode === "melody" && renderMelodyMode()}
            {gameState.currentMode === "rhythm" && renderRhythmMode()}
            {gameState.currentMode === "harmony" && renderHarmonyMode()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Round</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600">Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};