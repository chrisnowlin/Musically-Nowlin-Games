import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, Music, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  volume: number;
  currentQuestion: Question | null;
  hasPlayedMelody: boolean;
}

interface Question {
  melodyStart: number[];
  correctEnding: number[];
  wrongEndings: number[][];
  description: string;
}

interface MelodyPattern {
  start: number[];
  endings: {
    correct: number[];
    name: string;
  };
}

// Note frequencies (C major scale)
const NOTES = {
  C: 262,
  D: 294,
  E: 330,
  F: 349,
  G: 392,
  A: 440,
  B: 494,
  C2: 523,
};

// Common melodic patterns
const MELODY_PATTERNS: MelodyPattern[] = [
  {
    start: [NOTES.C, NOTES.D, NOTES.E],
    endings: { correct: [NOTES.F, NOTES.G], name: "Ascending Scale" },
  },
  {
    start: [NOTES.G, NOTES.F, NOTES.E],
    endings: { correct: [NOTES.D, NOTES.C], name: "Descending to C" },
  },
  {
    start: [NOTES.C, NOTES.E, NOTES.G],
    endings: { correct: [NOTES.C2], name: "Chord Arpeggio" },
  },
  {
    start: [NOTES.E, NOTES.D, NOTES.C],
    endings: { correct: [NOTES.D, NOTES.E], name: "Turn Pattern" },
  },
  {
    start: [NOTES.C, NOTES.G, NOTES.A],
    endings: { correct: [NOTES.G, NOTES.C], name: "Fifth Resolution" },
  },
  {
    start: [NOTES.D, NOTES.E, NOTES.F],
    endings: { correct: [NOTES.E, NOTES.D], name: "Stepwise Return" },
  },
];

export default function FinishTheTuneGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    volume: 70,
    currentQuestion: null,
    hasPlayedMelody: false,
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
    generateNewQuestion();
  };

  const playMelody = useCallback(async (notes: number[]) => {
    if (!audioContext.current) return;

    const noteDuration = 0.4;
    const masterVolume = gameState.volume / 100;

    for (const freq of notes) {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "triangle";

      const volume = 0.3 * masterVolume;
      const startTime = audioContext.current.currentTime;

      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
    }
  }, [gameState.volume]);

  const generateWrongEndings = useCallback((correctEnding: number[]): number[][] => {
    const allNotes = Object.values(NOTES);
    const wrongEndings: number[][] = [];

    // Generate 3 wrong endings
    for (let i = 0; i < 3; i++) {
      const wrongEnding: number[] = [];
      for (let j = 0; j < correctEnding.length; j++) {
        let randomNote;
        do {
          randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
        } while (
          wrongEnding.includes(randomNote) ||
          (j === correctEnding.length - 1 && randomNote === correctEnding[j])
        );
        wrongEnding.push(randomNote);
      }
      wrongEndings.push(wrongEnding);
    }

    return wrongEndings;
  }, []);

  const generateNewQuestion = useCallback(() => {
    const pattern = MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];
    const wrongEndings = generateWrongEndings(pattern.endings.correct);

    setGameState(prev => ({
      ...prev,
      currentQuestion: {
        melodyStart: pattern.start,
        correctEnding: pattern.endings.correct,
        wrongEndings,
        description: pattern.endings.name,
      },
      feedback: null,
      hasPlayedMelody: false,
    }));
  }, [generateWrongEndings]);

  const handlePlayMelodyStart = useCallback(async () => {
    if (!gameState.currentQuestion || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayedMelody: true }));

    await playMelody(gameState.currentQuestion.melodyStart);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentQuestion, gameState.isPlaying, playMelody]);

  const handlePlayEnding = useCallback(async (ending: number[]) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    // Play the start + this ending
    await playMelody([...gameState.currentQuestion!.melodyStart, ...ending]);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.isPlaying, gameState.currentQuestion, playMelody]);

  const handleSelectEnding = useCallback((selectedEnding: number[]) => {
    if (!gameState.currentQuestion || !gameState.hasPlayedMelody) return;

    const isCorrect = JSON.stringify(selectedEnding) === JSON.stringify(gameState.currentQuestion.correctEnding);

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
      generateNewQuestion();
    }, 2500);
  }, [gameState.currentQuestion, gameState.hasPlayedMelody, generateNewQuestion]);

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
              🎼 Finish the Tune
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Choose the correct ending for the melody!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Listen to the incomplete melody</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">👂</span>
                <span>Preview each possible ending</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">✨</span>
                <span>Choose the ending that sounds most complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⭐</span>
                <span>Score points for recognizing musical resolution!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Playing!
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

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full space-y-8 py-8">
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="text-center space-y-4 w-full">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Finish the Tune
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

        {/* Play Melody Start */}
        <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} text-center space-y-4 w-full max-w-2xl`}>
          <h3 className={`${playfulTypography.headings.h3} text-green-600 dark:text-green-400`}>
            🎵 Listen to the Melody Start
          </h3>
          <Button
            onClick={handlePlayMelodyStart}
            disabled={gameState.isPlaying}
            size="lg"
            className={`${playfulComponents.button.primary} w-64 h-20 text-xl transform ${playfulAnimations.hover.scale}`}
          >
            <Music className="w-8 h-8 mr-3" />
            {gameState.hasPlayedMelody ? "Play Start Again" : "Play Melody Start"}
          </Button>
          {!gameState.hasPlayedMelody && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Listen first, then choose the best ending below
            </p>
          )}
        </div>

        {/* Ending Options */}
        {gameState.hasPlayedMelody && gameState.currentQuestion && !gameState.feedback && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
            <h3 className={`${playfulTypography.headings.h3} mb-6 text-center text-purple-600 dark:text-purple-400`}>
              🎼 Choose the Best Ending
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...gameState.currentQuestion.wrongEndings, gameState.currentQuestion.correctEnding]
                .sort(() => Math.random() - 0.5)
                .map((ending, index) => (
                  <div
                    key={index}
                    className={`${playfulShapes.rounded.container} bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-2 border-gray-200 dark:border-gray-700 space-y-3`}
                  >
                    <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                      Option {index + 1}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => handlePlayEnding(ending)}
                        disabled={gameState.isPlaying}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={() => handleSelectEnding(ending)}
                        disabled={gameState.isPlaying}
                        className={`${playfulComponents.button.secondary} flex-1`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Choose This
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4 italic">
              Click "Preview" to hear each option with the melody start
            </p>
          </div>
        )}

        {/* Feedback */}
        {gameState.feedback?.show && (
          <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
            gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          } ${playfulShapes.shadows.card} max-w-2xl w-full`}>
            <p className={playfulTypography.headings.h3}>
              {gameState.feedback.isCorrect ? (
                <>
                  <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                  Perfect! You found the right ending!
                  <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                </>
              ) : (
                <>
                  Not quite! The correct ending creates better musical resolution. Try the next one!
                </>
              )}
            </p>
            {gameState.feedback.isCorrect && gameState.currentQuestion && (
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                Pattern: {gameState.currentQuestion.description}
              </p>
            )}
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
              🎼 Understanding Melodic Resolution
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold mb-2">What is Musical Resolution?</h4>
                <p className="text-sm">
                  Resolution is when a melody feels "complete" or "finished." Just like a sentence needs punctuation, melodies need proper endings to sound satisfying!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Melodic Patterns</h4>
                <p className="text-sm">
                  Melodies often follow patterns. Common patterns include:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside mt-2">
                  <li><strong>Ascending:</strong> Notes going up the scale</li>
                  <li><strong>Descending:</strong> Notes going down the scale</li>
                  <li><strong>Arpeggios:</strong> Notes from a chord played one at a time</li>
                  <li><strong>Stepwise:</strong> Moving to the next note in the scale</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">The Home Note (Tonic)</h4>
                <p className="text-sm">
                  In a scale, there's usually one note that feels like "home" - often the first note of the scale. Melodies that end on or near this note sound more complete. In this game, that's the C note!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Why Practice This?</h4>
                <p className="text-sm">
                  Learning to recognize complete melodies helps you:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside mt-2">
                  <li>Understand song structure</li>
                  <li>Compose your own melodies</li>
                  <li>Predict where music is going</li>
                  <li>Appreciate how composers create satisfying endings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Success:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Listen for which ending feels most "complete"</li>
                  <li>Notice if the ending returns to the starting note</li>
                  <li>Pay attention to the direction of the melody</li>
                  <li>Trust your musical intuition - what sounds right usually is!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {gameState.totalQuestions > 0 && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card}`}>
            <h3 className={`${playfulTypography.headings.h3} mb-3 text-center`}>
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {gameState.totalQuestions > 0 ? Math.round((gameState.score / gameState.totalQuestions) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {gameState.score}/{gameState.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
