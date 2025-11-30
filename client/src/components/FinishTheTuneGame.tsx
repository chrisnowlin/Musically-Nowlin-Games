import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Star, Sparkles, Volume2, Music, ChevronLeft, Pause } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface NoteEvent {
  freq: number;
  duration: number;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  volume: number;
  currentQuestion: Question | null;
  hasPlayedMelody: boolean;
  activeNoteIndex: number; // Track which note is playing (0-indexed relative to current sequence)
  playingSequenceId: string | null; // 'start' or 'option-index'
  shuffledOptions: NoteEvent[][]; // Stable shuffled options
  selectedOptionIndex: number | null; // Track selected option for UI feedback
}

interface Question {
  melodyStart: NoteEvent[];
  correctEnding: NoteEvent[];
  wrongEndings: NoteEvent[][];
  description: string;
  hint: string;
}

interface MelodyPattern {
  start: NoteEvent[];
  endings: {
    correct: NoteEvent[];
    name: string;
  };
  hint: string;
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

const NOTE_FREQS = Object.values(NOTES).sort((a, b) => a - b);

// Helper to create notes with duration (default 0.4s)
const n = (freq: number, duration: number = 0.4): NoteEvent => ({ freq, duration });

// Common melodic patterns focused on RESOLUTION to C (Tonic) with RHYTHM
const MELODY_PATTERNS: MelodyPattern[] = [
  {
    start: [n(NOTES.G, 0.4), n(NOTES.F, 0.4), n(NOTES.E, 0.6), n(NOTES.D, 0.2)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "Walking Home" },
    hint: "The music is walking down the stairs. What is the last step?"
  },
  {
    start: [n(NOTES.C, 0.3), n(NOTES.E, 0.3), n(NOTES.G, 0.6)],
    endings: { correct: [n(NOTES.C2, 0.8)], name: "Jump to the Top" },
    hint: "We are jumping up the chord. Finish the jump to the high C!"
  },
  {
    start: [n(NOTES.C, 0.4), n(NOTES.G, 0.4), n(NOTES.G, 0.8)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "There and Back" },
    hint: "We went far away to G. Now let's come back Home to C."
  },
  {
    start: [n(NOTES.E, 0.3), n(NOTES.D, 0.3), n(NOTES.C, 0.3), n(NOTES.D, 0.3)],
    endings: { correct: [n(NOTES.C, 1.0)], name: "Wiggle Home" },
    hint: "The melody is wiggling around the bottom. End on the lowest note."
  },
  {
    start: [n(NOTES.C, 0.4), n(NOTES.C, 0.4), n(NOTES.G, 0.4), n(NOTES.G, 0.4), n(NOTES.A, 0.4), n(NOTES.A, 0.4)],
    endings: { correct: [n(NOTES.G, 0.8)], name: "Twinkle Pause" },
    hint: "Twinkle Twinkle Little Star... how does the phrase end?"
  },
  {
    start: [n(NOTES.D, 0.4), n(NOTES.E, 0.4), n(NOTES.F, 0.6), n(NOTES.D, 0.2)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "Step Down Home" },
    hint: "We are hovering above home. Take one step down to finish."
  },
  {
    start: [n(NOTES.C2, 0.2), n(NOTES.B, 0.2), n(NOTES.A, 0.2), n(NOTES.G, 0.6)],
    endings: { correct: [n(NOTES.F, 0.2), n(NOTES.E, 0.2), n(NOTES.D, 0.2), n(NOTES.C, 0.8)], name: "The Long Fall" },
    hint: "Slide all the way down the slide to the bottom!"
  },
  {
    start: [n(NOTES.G, 0.3), n(NOTES.G, 0.3), n(NOTES.E, 0.6)],
    endings: { correct: [n(NOTES.D, 0.3), n(NOTES.D, 0.3), n(NOTES.C, 0.8)], name: "Skipping Home" },
    hint: "We are skipping down. Find the last skip to C."
  }
];

// Component to visualize notes
const MelodyVisualizer = ({ notes, activeIndex, isPlaying, className = "", showTonic = true }: { notes: NoteEvent[], activeIndex: number, isPlaying: boolean, className?: string, showTonic?: boolean }) => {
  return (
    <div className={`flex items-end justify-center gap-1 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm relative ${className}`}>
      {/* Tonic Line Indicator */}
      {showTonic && (
        <div className="absolute bottom-[20%] left-0 w-full h-0.5 bg-green-400/30 border-t border-dashed border-green-500/50 pointer-events-none" title="Home Note Level"></div>
      )}
      
      {notes.map((note, index) => {
        const noteIndex = NOTE_FREQS.indexOf(note.freq);
        const heightPercent = noteIndex === -1 ? 0 : 20 + (noteIndex / (NOTE_FREQS.length - 1)) * 80;
        const isActive = isPlaying && index === activeIndex;
        const isTonic = showTonic && (note.freq === NOTES.C || note.freq === NOTES.C2);
        
        const widthClass = note.duration <= 0.25 ? 'flex-[1]' : note.duration <= 0.45 ? 'flex-[2]' : 'flex-[3]';

        return (
          <div key={index} className={`${widthClass} flex flex-col items-center justify-end h-full gap-1 group relative`}>
             {/* Note Head */}
            <div 
              className={`
                rounded-full border-2 transition-all duration-200 shadow-sm z-10
                ${isActive 
                  ? 'bg-purple-500 border-purple-600 scale-125 shadow-purple-400/50 shadow-lg translate-y-[-4px]' 
                  : isTonic 
                    ? 'bg-green-400 border-green-500 dark:bg-green-600' 
                    : 'bg-blue-300 border-blue-400 dark:bg-blue-600 dark:border-blue-500'
                }
                ${className.includes('h-16') ? 'w-4 h-4 md:w-5 md:h-5 border-[1.5px]' : 'w-6 h-6 md:w-8 md:h-8'} 
              `}
              style={{ 
                marginBottom: `${heightPercent * 0.8}px`,
              }}
            ></div>
            {/* Rhythm Bar */}
            <div className={`h-1 bg-gray-300 dark:bg-gray-600 rounded-full mt-1 ${note.duration > 0.4 ? 'w-full' : 'w-1/2'}`} style={{ opacity: 0.5 }}></div>
          </div>
        );
      })}
    </div>
  );
};

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
    activeNoteIndex: -1,
    playingSequenceId: null,
    shuffledOptions: [],
    selectedOptionIndex: null
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  const handleStartGame = async () => {
    await initialize();
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    setGameStarted(true);
    generateNewQuestion();
  };

  const playMelody = useCallback(async (notes: NoteEvent[], sequenceId: string) => {
    setGameState(prev => ({ ...prev, isPlaying: true, activeNoteIndex: -1, playingSequenceId: sequenceId }));

    for (let i = 0; i < notes.length; i++) {
      // Update active note index
      setGameState(prev => ({ ...prev, activeNoteIndex: i }));
      
      // Play note with dynamics for volume control
      await audio.playNoteWithDynamics(notes[i].freq, notes[i].duration, gameState.volume / 100);
      
      // Small gap? playNoteWithDynamics awaits duration, so we are good.
    }

    setGameState(prev => ({ ...prev, isPlaying: false, activeNoteIndex: -1, playingSequenceId: null }));
  }, [gameState.volume, audio]);

  const generateWrongEndings = useCallback((correctEnding: NoteEvent[]): NoteEvent[][] => {
    const allNotes = Object.values(NOTES);
    const wrongEndings: NoteEvent[][] = [];

    // Generate 3 wrong endings
    for (let i = 0; i < 3; i++) {
      const wrongEnding: NoteEvent[] = [];
      // Use same length as correct ending
      for (let j = 0; j < correctEnding.length; j++) {
        let randomNoteFreq;
        // Try to pick a note that isn't the correct one at this position
        // AND crucial: ensure the last note is NOT the Tonic (C or C2) if the correct one is
        let attempts = 0;
        const isLastNote = j === correctEnding.length - 1;
        
        do {
          randomNoteFreq = allNotes[Math.floor(Math.random() * allNotes.length)];
          attempts++;
        } while (
           attempts < 20 && 
           (
             // Avoid exact duplicate of correct note at this position
             (randomNoteFreq === correctEnding[j].freq) ||
             // If it's the last note, avoid resolving to C/C2 (unless correct ending doesn't, but our correct endings do)
             (isLastNote && (randomNoteFreq === NOTES.C || randomNoteFreq === NOTES.C2))
           )
        );
        // Preserve the rhythm (duration) of the correct ending
        wrongEnding.push({ freq: randomNoteFreq, duration: correctEnding[j].duration });
      }
      wrongEndings.push(wrongEnding);
    }

    return wrongEndings;
  }, []);

  const generateNewQuestion = useCallback(() => {
    const pattern = MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];
    const wrongEndings = generateWrongEndings(pattern.endings.correct);
    const options = [...wrongEndings, pattern.endings.correct].sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      currentQuestion: {
        melodyStart: pattern.start,
        correctEnding: pattern.endings.correct,
        wrongEndings,
        description: pattern.endings.name,
        hint: pattern.hint
      },
      feedback: null,
      hasPlayedMelody: false,
      activeNoteIndex: -1,
      playingSequenceId: null,
      shuffledOptions: options
    }));
  }, [generateWrongEndings]);

  const handlePlayMelodyStart = useCallback(async () => {
    if (!gameState.currentQuestion || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, hasPlayedMelody: true }));
    await playMelody(gameState.currentQuestion.melodyStart, 'start');
  }, [gameState.currentQuestion, gameState.isPlaying, playMelody]);

  const handlePlayEnding = useCallback(async (ending: NoteEvent[], index: number) => {
    if (gameState.isPlaying || !gameState.currentQuestion) return;

    // Play the ending sequence (optionally play the start first, but users might prefer just hearing the option to compare)
    // Let's play ONLY the ending to let them focus on the resolution, or play Start + Ending?
    // Start + Ending is better for context "Finish the Tune".
    const fullSequence = [...gameState.currentQuestion.melodyStart, ...ending];
    await playMelody(fullSequence, `option-${index}`);
  }, [gameState.isPlaying, gameState.currentQuestion, playMelody]);

  const handleSelectEnding = useCallback((selectedEnding: NoteEvent[], index: number) => {
    if (!gameState.currentQuestion || !gameState.hasPlayedMelody || gameState.feedback) return;

    const isCorrect = JSON.stringify(selectedEnding) === JSON.stringify(gameState.currentQuestion.correctEnding);

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
      selectedOptionIndex: index
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setGameTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null, selectedOptionIndex: null }));
      if (isCorrect) {
         generateNewQuestion();
      } else {
         generateNewQuestion();
      }
    }, 2500);
  }, [gameState.currentQuestion, gameState.hasPlayedMelody, generateNewQuestion, setGameTimeout]);

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

        <div className="text-center space-y-8 z-10 max-w-2xl animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title} drop-shadow-lg`}>
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
            <ul className="text-left space-y-3 text-base text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                <span className="text-2xl">🎵</span>
                <span className="pt-1">Listen to the incomplete melody</span>
              </li>
              <li className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
                <span className="text-2xl">👂</span>
                <span className="pt-1">Preview each possible ending</span>
              </li>
              <li className="flex items-start gap-3 bg-pink-50 dark:bg-pink-900/30 p-2 rounded-lg">
                <span className="text-2xl">✨</span>
                <span className="pt-1">Choose the ending that sounds most complete</span>
              </li>
              <li className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg">
                <span className="text-2xl">⭐</span>
                <span className="pt-1">Score points for recognizing musical resolution!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} px-12 py-8 text-2xl shadow-xl`}
          >
            <Play className="w-10 h-10 mr-3 fill-current" />
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

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <ChevronLeft size={20} />
            Exit
          </button>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-purple-100">
             <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</span>
                <span className="text-xl font-bold text-purple-600">{gameState.score}/{gameState.totalQuestions}</span>
             </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="w-24 accent-purple-500"
              disabled={gameState.isPlaying}
            />
          </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Main Game Area */}
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Question Card */}
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 md:p-8 ${playfulShapes.shadows.card} text-center relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500" />
            
            <h3 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-200 mb-2`}>
              Can you finish this tune?
            </h3>
            
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-6">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Hint: {gameState.currentQuestion?.hint}
            </p>

            {/* Visualizer */}
            <div className="mb-8">
               <MelodyVisualizer 
                 notes={
                   gameState.playingSequenceId === 'start' 
                     ? gameState.currentQuestion!.melodyStart 
                     : gameState.playingSequenceId?.startsWith('option') 
                       ? [...gameState.currentQuestion!.melodyStart, ...gameState.shuffledOptions[parseInt(gameState.playingSequenceId.split('-')[1])]]
                       : gameState.currentQuestion!.melodyStart // Default view
                 } 
                 activeIndex={gameState.activeNoteIndex} 
                 isPlaying={gameState.isPlaying} 
               />
            </div>

            <Button
              onClick={handlePlayMelodyStart}
              disabled={gameState.isPlaying}
              size="lg"
              className={`
                ${playfulComponents.button.primary} 
                w-full max-w-sm h-16 text-xl 
                transform transition-all duration-200
                ${gameState.isPlaying && gameState.playingSequenceId === 'start' ? 'scale-95 opacity-90' : 'hover:scale-105 shadow-lg'}
              `}
            >
              {gameState.isPlaying && gameState.playingSequenceId === 'start' ? (
                <div className="flex items-center gap-2">
                   <Pause className="w-6 h-6 animate-pulse" />
                   Playing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Music className="w-6 h-6" />
                   {gameState.hasPlayedMelody ? "Listen Again" : "Listen to Melody"}
                </div>
              )}
            </Button>
          </div>

          {/* Options Area */}
          {gameState.hasPlayedMelody && gameState.currentQuestion && !gameState.feedback && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <div className="text-center text-gray-600 dark:text-gray-300 font-medium mb-2">
                Which ending sounds best?
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameState.shuffledOptions.map((ending, index) => {
                    const endingKey = `option-${index}`;
                    const isPlayingThis = gameState.isPlaying && gameState.playingSequenceId === endingKey;
                    const isSelected = gameState.selectedOptionIndex === index;
                    const isCorrect = gameState.feedback?.isCorrect && isSelected;
                    const isWrong = gameState.feedback?.show && !gameState.feedback.isCorrect && isSelected;
                    const isDisabled = gameState.isPlaying || (gameState.feedback?.show === true);

                    return (
                      <div
                        key={endingKey}
                        className={`
                          relative overflow-hidden
                          ${playfulShapes.rounded.container} 
                          border-4 transition-all duration-300
                          ${isCorrect 
                            ? 'bg-green-100 border-green-500 scale-105 shadow-green-200 shadow-xl' 
                            : isWrong 
                              ? 'bg-red-100 border-red-500 scale-95 opacity-90' 
                              : 'bg-white/80 dark:bg-gray-800/80 border-transparent hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg'
                          }
                          p-4 flex flex-col gap-4
                        `}
                      >
                         {/* Result Icon Overlay */}
                         {isCorrect && (
                           <div className="absolute top-2 right-2 animate-bounce z-20">
                             <Star className="w-8 h-8 text-green-600 fill-green-600" />
                           </div>
                         )}
                         {isWrong && (
                           <div className="absolute top-2 right-2 animate-pulse z-20">
                             <div className="text-2xl">❌</div>
                           </div>
                         )}

                        <div className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-1">
                           {isCorrect ? "Correct!" : isWrong ? "Try Again" : `Option ${index + 1}`}
                        </div>

                        {/* Mini Visualizer */}
                        <MelodyVisualizer 
                          notes={ending} 
                          activeIndex={isPlayingThis ? gameState.activeNoteIndex - gameState.currentQuestion!.melodyStart.length : -1}
                          isPlaying={isPlayingThis}
                          className="h-16 w-full"
                          showTonic={false}
                        />

                        <div className="flex gap-2 justify-center mt-auto">
                          <Button
                            onClick={() => handlePlayEnding(ending, index)}
                            disabled={isDisabled}
                            variant="outline"
                            size="sm"
                            className={`flex-1 h-10 ${isPlayingThis ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}`}
                          >
                            {isPlayingThis ? <Volume2 className="w-4 h-4 animate-pulse mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            Preview
                          </Button>
                          
                          <Button
                            onClick={() => handleSelectEnding(ending, index)}
                            disabled={isDisabled}
                            className={`
                              flex-1 h-10
                              ${isCorrect ? 'bg-green-600 hover:bg-green-700' : isWrong ? 'bg-red-500 hover:bg-red-600' : playfulComponents.button.secondary}
                            `}
                          >
                            {isCorrect ? "Success!" : "Select"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Removed Overlay Feedback - Inline is used now */}

        </div>

        {/* Educational Guide Toggle */}
        <div className="w-full max-w-2xl flex justify-center pt-4">
          <Button
            onClick={() => setShowGuide(!showGuide)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-purple-600 hover:bg-purple-50"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showGuide ? "Hide Guide" : "How does this work?"}
          </Button>
        </div>

        {showGuide && (
          <div className={`${playfulShapes.rounded.container} bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} max-w-2xl w-full animate-in slide-in-from-bottom-10`}>
            <h3 className={`${playfulTypography.headings.h3} mb-6 text-center text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2`}>
              <Music className="w-6 h-6" />
              The Secret of Musical Endings
            </h3>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0 text-2xl">⤵️</div>
                 <div>
                   <h4 className="font-bold text-lg text-gray-900 dark:text-white">Stepwise Motion</h4>
                   <p className="leading-relaxed">
                     Melodies often like to move in small steps. If a melody is going down (D, C, B...), it usually wants to keep going or return to a nearby safe note.
                   </p>
                 </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Pro Tip:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-yellow-900 dark:text-yellow-100">
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
