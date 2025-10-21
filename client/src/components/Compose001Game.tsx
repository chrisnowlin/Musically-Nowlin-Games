import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Play, Volume2, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

type Mode = "melody" | "rhythm" | "harmony";

interface Note {
  name: string;
  frequency: number;
}

interface RhythmNote {
  duration: string;
  symbol: string;
}

interface Chord {
  name: string;
  notes: string[];
}

interface GameState {
  currentMode: Mode;
  score: number;
  round: number;
  selectedNotes: string[];
  selectedRhythm: string[];
  selectedChords: string[];
  volume: number;
  currentChallenge: string;
}

const NOTES: Note[] = [
  { name: "C", frequency: 261.63 },
  { name: "D", frequency: 293.66 },
  { name: "E", frequency: 329.63 },
  { name: "F", frequency: 349.23 },
  { name: "G", frequency: 392.00 },
  { name: "A", frequency: 440.00 },
  { name: "B", frequency: 493.88 },
  { name: "C2", frequency: 523.25 },
];

const RHYTHM_NOTES: RhythmNote[] = [
  { duration: "whole", symbol: "𝅝" },
  { duration: "half", symbol: "𝅗𝅥" },
  { duration: "quarter", symbol: "♩" },
  { duration: "eighth", symbol: "♪" },
  { duration: "sixteenth", symbol: "𝅘𝅥𝅯" },
  { duration: "rest", symbol: "𝄽" },
];

const CHORDS: Chord[] = [
  { name: "C Major", notes: ["C", "E", "G"] },
  { name: "D Minor", notes: ["D", "F", "A"] },
  { name: "E Minor", notes: ["E", "G", "B"] },
  { name: "F Major", notes: ["F", "A", "C2"] },
  { name: "G Major", notes: ["G", "B", "D"] },
  { name: "A Minor", notes: ["A", "C", "E"] },
];

const MELODY_CHALLENGES = [
  "Create an ascending melody using at least 4 notes",
  "Create a melody that goes up and down",
  "Create a simple 3-note melody",
  "Create a melody using all 5 notes",
  "Create a melody that repeats a pattern",
];

const RHYTHM_CHALLENGES = [
  "Create a 4-beat rhythm pattern",
  "Create a rhythm with at least one rest",
  "Create a pattern with quarter and eighth notes",
  "Create a simple steady beat pattern",
  "Create a complex rhythm with mixed durations",
];

const HARMONY_CHALLENGES = [
  "Create a 3-chord progression",
  "Start with C Major and add two more chords",
  "Create a progression using major and minor chords",
  "Build a simple I-IV-V progression",
  "Create a progression that sounds complete",
];

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
    currentChallenge: MELODY_CHALLENGES[0],
  });

  const audioContext = React.useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

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

  const playChord = useCallback((chord: Chord) => {
    chord.notes.forEach(noteName => {
      const note = NOTES.find(n => n.name === noteName);
      if (note) {
        playNote(note.frequency, 1.0);
      }
    });
  }, [playNote]);

  const playProgression = useCallback(() => {
    if (gameState.selectedChords.length === 0) return;

    gameState.selectedChords.forEach((chordName, index) => {
      const chord = CHORDS.find(c => c.name === chordName);
      if (chord) {
        setTimeout(() => {
          playChord(chord);
        }, index * 1200);
      }
    });
  }, [gameState.selectedChords, playChord]);

  const handleModeChange = (mode: Mode) => {
    let challenge = "";
    if (mode === "melody") challenge = MELODY_CHALLENGES[Math.floor(Math.random() * MELODY_CHALLENGES.length)];
    if (mode === "rhythm") challenge = RHYTHM_CHALLENGES[Math.floor(Math.random() * RHYTHM_CHALLENGES.length)];
    if (mode === "harmony") challenge = HARMONY_CHALLENGES[Math.floor(Math.random() * HARMONY_CHALLENGES.length)];

    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 1,
      selectedNotes: [],
      selectedRhythm: [],
      selectedChords: [],
      currentChallenge: challenge,
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

  const handleRhythmSelect = (symbol: string) => {
    if (gameState.selectedRhythm.length >= 8) return; // Max 8 rhythm notes

    setGameState(prev => ({
      ...prev,
      selectedRhythm: [...prev.selectedRhythm, symbol],
    }));
  };

  const handleChordSelect = (chordName: string) => {
    if (gameState.selectedChords.length >= 6) return; // Max 6 chords

    const chord = CHORDS.find(c => c.name === chordName);
    if (chord) {
      playChord(chord);
    }

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
    }));
  };

  const handleSubmit = () => {
    // Simple validation - award points for completing the composition
    let meetsChallenge = false;

    if (gameState.currentMode === "melody") {
      meetsChallenge = gameState.selectedNotes.length >= 3;
    } else if (gameState.currentMode === "rhythm") {
      meetsChallenge = gameState.selectedRhythm.length >= 3;
    } else if (gameState.currentMode === "harmony") {
      meetsChallenge = gameState.selectedChords.length >= 2;
    }

    // Get new challenge for next round
    let newChallenge = "";
    if (gameState.currentMode === "melody") newChallenge = MELODY_CHALLENGES[gameState.round % MELODY_CHALLENGES.length];
    if (gameState.currentMode === "rhythm") newChallenge = RHYTHM_CHALLENGES[gameState.round % RHYTHM_CHALLENGES.length];
    if (gameState.currentMode === "harmony") newChallenge = HARMONY_CHALLENGES[gameState.round % HARMONY_CHALLENGES.length];

    setGameState(prev => ({
      ...prev,
      score: meetsChallenge ? prev.score + 10 : prev.score,
      round: prev.round + 1,
      selectedNotes: [],
      selectedRhythm: [],
      selectedChords: [],
      currentChallenge: newChallenge,
    }));
  };

  const renderMelodyMode = () => (
    <div>
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold text-blue-900 mb-2">Challenge:</p>
        <p className="text-blue-700">{gameState.currentChallenge}</p>
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
        <div className="grid grid-cols-4 gap-2">
          {NOTES.map(note => (
            <button
              key={note.name}
              onClick={() => handleNoteSelect(note.name)}
              className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-bold shadow-md transition-all"
              disabled={gameState.selectedNotes.length >= 8}
            >
              {note.name}
            </button>
          ))}
        </div>
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
        <p className="text-orange-700">{gameState.currentChallenge}</p>
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
        <div className="grid grid-cols-3 gap-3">
          {RHYTHM_NOTES.map(rhythm => (
            <button
              key={rhythm.duration}
              onClick={() => handleRhythmSelect(rhythm.symbol)}
              className="bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-6 rounded-lg shadow-md transition-all"
              disabled={gameState.selectedRhythm.length >= 8}
            >
              <div className="text-4xl mb-2">{rhythm.symbol}</div>
              <div className="text-sm font-semibold capitalize">{rhythm.duration}</div>
            </button>
          ))}
        </div>
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
        <p className="text-green-700">{gameState.currentChallenge}</p>
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
        <div className="grid grid-cols-2 gap-3">
          {CHORDS.map(chord => (
            <button
              key={chord.name}
              onClick={() => handleChordSelect(chord.name)}
              className="bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-4 rounded-lg shadow-md transition-all"
              disabled={gameState.selectedChords.length >= 6}
            >
              <div className="font-bold text-lg">{chord.name}</div>
              <div className="text-sm opacity-75">{chord.notes.join(" - ")}</div>
            </button>
          ))}
        </div>
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

      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleModeChange("melody")}
          className={
            gameState.currentMode === "melody"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          MELODY
        </button>
        <button
          onClick={() => handleModeChange("rhythm")}
          className={
            gameState.currentMode === "rhythm"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          RHYTHM
        </button>
        <button
          onClick={() => handleModeChange("harmony")}
          className={
            gameState.currentMode === "harmony"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          HARMONY
        </button>
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

        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700">
              Mode: {gameState.currentMode.toUpperCase()}
            </p>
          </div>

          {gameState.currentMode === "melody" && renderMelodyMode()}
          {gameState.currentMode === "rhythm" && renderRhythmMode()}
          {gameState.currentMode === "harmony" && renderHarmonyMode()}
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
