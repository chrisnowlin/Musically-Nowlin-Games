import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, Music, Trash2, Save, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalCompositions: number;
  isPlaying: boolean;
  feedback: { show: boolean; message: string; type: 'success' | 'info' } | null;
  volume: number;
  composition: number[];
  savedCompositions: number[][];
}

interface Note {
  name: string;
  frequency: number;
  color: string;
  emoji: string;
}

const NOTES: Note[] = [
  { name: "C", frequency: 262, color: "bg-red-400 hover:bg-red-500", emoji: "🔴" },
  { name: "D", frequency: 294, color: "bg-orange-400 hover:bg-orange-500", emoji: "🟠" },
  { name: "E", frequency: 330, color: "bg-yellow-400 hover:bg-yellow-500", emoji: "🟡" },
  { name: "F", frequency: 349, color: "bg-green-400 hover:bg-green-500", emoji: "🟢" },
  { name: "G", frequency: 392, color: "bg-blue-400 hover:bg-blue-500", emoji: "🔵" },
  { name: "A", frequency: 440, color: "bg-indigo-400 hover:bg-indigo-500", emoji: "🟣" },
  { name: "B", frequency: 494, color: "bg-purple-400 hover:bg-purple-500", emoji: "🟪" },
  { name: "C2", frequency: 523, color: "bg-pink-400 hover:bg-pink-500", emoji: "🩷" },
];

export default function ComposeYourSongGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalCompositions: 0,
    isPlaying: false,
    feedback: null,
    volume: 70,
    composition: [],
    savedCompositions: [],
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);

  const handleStartGame = async () => {
    await audioService.initialize();
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    setGameStarted(true);
  };

  const playNote = useCallback(async (frequency: number, duration: number = 0.4) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";

    const masterVolume = gameState.volume / 100;
    const volume = 0.3 * masterVolume;
    const startTime = audioContext.current.currentTime;

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }, [gameState.volume]);

  const handleAddNote = useCallback((noteIndex: number) => {
    if (gameState.composition.length >= 12) {
      setGameState(prev => ({
        ...prev,
        feedback: { show: true, message: "Maximum 12 notes! Play your melody or clear to add more.", type: 'info' },
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 2000);
      return;
    }

    playNote(NOTES[noteIndex].frequency, 0.3);

    setGameState(prev => ({
      ...prev,
      composition: [...prev.composition, noteIndex],
    }));
  }, [gameState.composition.length, playNote]);

  const handleClearComposition = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      composition: [],
      feedback: { show: true, message: "Composition cleared! Start creating a new melody.", type: 'info' },
    }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 1500);
  }, []);

  const handlePlayComposition = useCallback(async () => {
    if (gameState.composition.length === 0) {
      setGameState(prev => ({
        ...prev,
        feedback: { show: true, message: "Add some notes first!", type: 'info' },
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 1500);
      return;
    }

    setGameState(prev => ({ ...prev, isPlaying: true }));

    for (const noteIndex of gameState.composition) {
      await playNote(NOTES[noteIndex].frequency, 0.5);
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.composition, playNote]);

  const handleSaveComposition = useCallback(() => {
    if (gameState.composition.length === 0) {
      setGameState(prev => ({
        ...prev,
        feedback: { show: true, message: "Create a melody first before saving!", type: 'info' },
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 1500);
      return;
    }

    setGameState(prev => ({
      ...prev,
      savedCompositions: [...prev.savedCompositions, [...prev.composition]],
      totalCompositions: prev.totalCompositions + 1,
      score: prev.score + 1,
      feedback: { show: true, message: `Melody saved! You've created ${prev.totalCompositions + 1} composition(s)!`, type: 'success' },
    }));

    audioService.playSuccessTone();

    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 2000);
  }, [gameState.composition]);

  const handlePlaySaved = useCallback(async (compositionIndex: number) => {
    setGameState(prev => ({ ...prev, isPlaying: true }));

    const composition = gameState.savedCompositions[compositionIndex];
    for (const noteIndex of composition) {
      await playNote(NOTES[noteIndex].frequency, 0.5);
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.savedCompositions, playNote]);

  const handleRemoveLastNote = useCallback(() => {
    if (gameState.composition.length === 0) return;

    setGameState(prev => ({
      ...prev,
      composition: prev.composition.slice(0, -1),
    }));
  }, [gameState.composition.length]);

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              ✨ Compose Your Song
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Create your own melody!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎹</span>
                <span>Click colored note buttons to add notes to your melody</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Play your composition to hear how it sounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">💾</span>
                <span>Save your melodies to your collection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎨</span>
                <span>Experiment with different note combinations!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Composing!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-6xl mx-auto w-full space-y-6 py-8">
        <ScoreDisplay score={gameState.score} total={gameState.totalCompositions} />

        <div className="text-center space-y-4 w-full">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Compose Your Song
          </h2>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-4 px-4">
            <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1 max-w-xs"
              disabled={gameState.isPlaying}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Note Palette */}
        <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-green-600 dark:text-green-400`}>
            🎹 Choose Your Notes
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {NOTES.map((note, index) => (
              <Button
                key={index}
                onClick={() => handleAddNote(index)}
                disabled={gameState.isPlaying}
                className={`${note.color} text-white font-bold text-lg h-16 border-2 border-white/50 shadow-lg transform transition-transform active:scale-95`}
              >
                <span className="text-2xl mr-2">{note.emoji}</span>
                {note.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Composition Display */}
        <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-blue-600 dark:text-blue-400`}>
            🎵 Your Melody ({gameState.composition.length}/12 notes)
          </h3>
          <div className="min-h-20 flex flex-wrap gap-2 justify-center items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {gameState.composition.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 italic">
                Click notes above to start composing...
              </p>
            ) : (
              gameState.composition.map((noteIndex, i) => (
                <div
                  key={i}
                  className={`${NOTES[noteIndex].color} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md`}
                >
                  <span className="text-xl">{NOTES[noteIndex].emoji}</span>
                </div>
              ))
            )}
          </div>

          {/* Composition Controls */}
          <div className="flex gap-3 justify-center mt-4 flex-wrap">
            <Button
              onClick={handlePlayComposition}
              disabled={gameState.isPlaying || gameState.composition.length === 0}
              className={`${playfulComponents.button.primary}`}
            >
              <Music className="w-4 h-4 mr-2" />
              Play Melody
            </Button>
            <Button
              onClick={handleSaveComposition}
              disabled={gameState.isPlaying || gameState.composition.length === 0}
              className={`${playfulComponents.button.secondary}`}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Melody
            </Button>
            <Button
              onClick={handleRemoveLastNote}
              disabled={gameState.isPlaying || gameState.composition.length === 0}
              variant="outline"
              size="sm"
            >
              Undo Last
            </Button>
            <Button
              onClick={handleClearComposition}
              disabled={gameState.isPlaying || gameState.composition.length === 0}
              variant="outline"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Feedback */}
        {gameState.feedback?.show && (
          <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
            gameState.feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
          } ${playfulShapes.shadows.card} max-w-2xl w-full`}>
            <p className={playfulTypography.headings.h3}>
              {gameState.feedback.type === 'success' ? (
                <>
                  <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                  {gameState.feedback.message}
                  <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                </>
              ) : (
                <>{gameState.feedback.message}</>
              )}
            </p>
          </div>
        )}

        {/* Saved Compositions */}
        {gameState.savedCompositions.length > 0 && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
            <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-purple-600 dark:text-purple-400`}>
              💾 Your Saved Melodies ({gameState.savedCompositions.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {gameState.savedCompositions.map((composition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex-1 flex gap-1 flex-wrap">
                    {composition.map((noteIndex, i) => (
                      <div
                        key={i}
                        className={`${NOTES[noteIndex].color} w-8 h-8 rounded flex items-center justify-center text-white text-sm shadow`}
                      >
                        {NOTES[noteIndex].emoji}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handlePlaySaved(index)}
                    disabled={gameState.isPlaying}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Guide Toggle */}
        <Button
          onClick={() => setShowGuide(!showGuide)}
          variant="outline"
          size="sm"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {showGuide ? "Hide" : "Show"} Learning Guide
        </Button>

        {showGuide && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card} max-w-2xl w-full`}>
            <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-green-600 dark:text-green-400`}>
              🎼 Understanding Musical Composition
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold mb-2">What is Melody?</h4>
                <p className="text-sm">
                  A melody is a sequence of musical notes that creates a tune. It's the part of music you can sing or hum along to! Each note has a different pitch (how high or low it sounds).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">The Musical Scale</h4>
                <p className="text-sm">
                  The notes in this game (C, D, E, F, G, A, B, C) form a major scale. Each note has its own unique sound, and when combined in different ways, they create beautiful melodies!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Composing:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Start simple - try 3-4 notes and build from there</li>
                  <li>Repeat patterns to create memorable melodies</li>
                  <li>Try ending on C for a complete-sounding melody</li>
                  <li>Experiment! There's no wrong way to be creative</li>
                  <li>Mix higher and lower notes for interesting melodies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Musical Concepts to Explore:</h4>
                <p className="text-sm">
                  <strong>Repetition:</strong> Use the same notes in a pattern.<br />
                  <strong>Stepwise Motion:</strong> Move to nearby notes (C → D → E).<br />
                  <strong>Leaps:</strong> Jump between notes farther apart (C → G).<br />
                  <strong>Direction:</strong> Melodies can go up, down, or stay the same!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
