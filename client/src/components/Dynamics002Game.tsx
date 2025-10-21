import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Volume2, VolumeX, Play } from "lucide-react";
import { useLocation } from "wouter";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
  currentQuestion: Question | null;
  isAnswered: boolean;
  selectedAnswer: number | null;
  correctAnswer: number;
  volume: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  audioConfig: AudioConfig;
}

interface AudioConfig {
  type: "single" | "comparison" | "sequence";
  articulation?: string;
  phrase?: number[];
  phrasing?: "legato" | "staccato" | "accent" | "tenuto";
}

export const Dynamics002Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "articulation",
    score: 0,
    round: 1,
    currentQuestion: null,
    isAnswered: false,
    selectedAnswer: null,
    correctAnswer: 0,
    volume: 50,
  });

  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [gameState.currentMode, gameState.round]);

  const modes = [
    { id: "articulation", name: "Articulation Styles" },
    { id: "interpretation", name: "Musical Phrasing" }
  ];

  const playLegato = useCallback((notes: number[]) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * 0.6;
      const duration = 0.7; // Overlapping notes for legato

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [gameState.volume]);

  const playStaccato = useCallback((notes: number[]) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * 0.5;
      const duration = 0.15; // Very short for staccato

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [gameState.volume]);

  const playAccented = useCallback((notes: number[]) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * 0.6;
      const duration = 0.5;
      const isAccented = index % 2 === 0; // Every other note

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = isAccented ? masterVolume * 0.5 : masterVolume * 0.2;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [gameState.volume]);

  const playTenuto = useCallback((notes: number[]) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * 0.7;
      const duration = 0.65; // Full value, held

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime);
      gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [gameState.volume]);

  const playPhrase = useCallback((notes: number[], phrasing: "legato" | "staccato" | "accent" | "tenuto") => {
    if (phrasing === "legato") playLegato(notes);
    else if (phrasing === "staccato") playStaccato(notes);
    else if (phrasing === "accent") playAccented(notes);
    else playTenuto(notes);
  }, [playLegato, playStaccato, playAccented, playTenuto]);

  const generateQuestion = () => {
    const mode = gameState.currentMode;
    let question: Question;

    if (mode === "articulation") {
      // Articulation style identification
      const articulations = ["legato", "staccato", "accent", "tenuto"];
      const randomArticulation = articulations[Math.floor(Math.random() * articulations.length)];
      const notes = [262, 294, 330, 349]; // C, D, E, F

      const descriptions = {
        "legato": "Smooth and connected",
        "staccato": "Short and detached",
        "accent": "Alternating strong and weak emphasis",
        "tenuto": "Held for full value"
      };

      const incorrectArticulations = articulations.filter(a => a !== randomArticulation).slice(0, 3);
      const options = [randomArticulation, ...incorrectArticulations].sort(() => Math.random() - 0.5);

      question = {
        question: "Listen to the musical phrase. What articulation style do you hear?",
        options: options.map(a => `${a.charAt(0).toUpperCase() + a.slice(1)} (${descriptions[a as keyof typeof descriptions]})`),
        correctAnswer: options.indexOf(randomArticulation),
        audioConfig: { type: "single", phrase: notes, phrasing: randomArticulation as any, articulation: randomArticulation }
      };
    } else {
      // Musical phrasing and interpretation
      const phrasings = ["legato", "staccato"];
      const randomPhrasing = phrasings[Math.floor(Math.random() * phrasings.length)];
      const notes = [294, 330, 349, 392, 440]; // D, E, F, G, A

      const interpretations = {
        "legato": "Flowing and expressive",
        "staccato": "Energetic and bouncy"
      };

      const questions = {
        "legato": "How would you describe this musical phrase?",
        "staccato": "What character does this phrase have?"
      };

      question = {
        question: questions[randomPhrasing as keyof typeof questions],
        options: [
          interpretations[randomPhrasing as keyof typeof interpretations],
          randomPhrasing === "legato" ? "Energetic and bouncy" : "Flowing and expressive",
          "Disconnected and random",
          "Silent and mysterious"
        ].sort(() => Math.random() - 0.5),
        correctAnswer: 0, // Will be recalculated below
        audioConfig: { type: "single", phrase: notes, phrasing: randomPhrasing as any }
      };

      // Find correct answer position after shuffling
      question.correctAnswer = question.options.indexOf(interpretations[randomPhrasing as keyof typeof interpretations]);
    }

    setGameState(prev => ({
      ...prev,
      currentQuestion: question,
      isAnswered: false,
      selectedAnswer: null,
      correctAnswer: question.correctAnswer
    }));
  };

  const playCurrentQuestion = () => {
    if (!gameState.currentQuestion) return;

    const config = gameState.currentQuestion.audioConfig;

    if (config.phrase && config.phrasing) {
      playPhrase(config.phrase, config.phrasing);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (gameState.isAnswered) return;

    const correct = answerIndex === gameState.correctAnswer;

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      selectedAnswer: answerIndex,
      score: correct ? prev.score + 10 : prev.score
    }));
  };

  const handleNextRound = () => {
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      isAnswered: false,
      selectedAnswer: null
    }));
  };

  const handleModeChange = (mode: string) => {
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 1,
      isAnswered: false,
      selectedAnswer: null
    }));
  };

  const getModeDescription = () => {
    const descriptions = {
      "articulation": "Identify different articulation styles like legato, staccato, accents, and tenuto",
      "interpretation": "Understand how articulation and phrasing express musical character and emotion"
    };
    return descriptions[gameState.currentMode as keyof typeof descriptions];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4 relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">Expression Master</h1>
        <div className="text-xl font-bold text-indigo-700">Score: {gameState.score}</div>
      </div>

      {/* Volume Control */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
          <VolumeX size={20} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={gameState.volume}
            onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
            className="flex-1"
          />
          <Volume2 size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-700 min-w-[45px]">{gameState.volume}%</span>
        </div>
      </div>

      {/* Mode Selection */}
      {modes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={
                gameState.currentMode === mode.id
                  ? "px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white shadow-lg"
                  : "px-4 py-2 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-100"
              }
            >
              {mode.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Mode Description */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-6 border-2 border-indigo-200">
          <div className="text-center mb-2">
            <p className="text-lg font-semibold text-indigo-900">
              {modes.find(m => m.id === gameState.currentMode)?.name}
            </p>
          </div>
          <p className="text-indigo-700 text-center text-sm">{getModeDescription()}</p>
        </div>

        {/* Question Area */}
        {gameState.currentQuestion && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Round {gameState.round}</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {gameState.currentQuestion.question}
              </h3>
            </div>

            {/* Play Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={playCurrentQuestion}
                disabled={gameState.isAnswered}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-lg font-semibold shadow-md text-lg"
              >
                <Play size={24} />
                Play Phrase
              </button>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-4">
              {gameState.currentQuestion.options.map((option, index) => {
                let buttonClass = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";

                if (gameState.isAnswered) {
                  if (index === gameState.correctAnswer) {
                    buttonClass = "bg-gradient-to-r from-green-500 to-green-600";
                  } else if (index === gameState.selectedAnswer) {
                    buttonClass = "bg-gradient-to-r from-red-500 to-red-600";
                  } else {
                    buttonClass = "bg-gray-300";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={gameState.isAnswered}
                    className={`${buttonClass} text-white px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {gameState.isAnswered && (
              <div className="mt-6 text-center">
                <p className={`text-xl font-bold mb-4 ${gameState.selectedAnswer === gameState.correctAnswer ? "text-green-600" : "text-red-600"}`}>
                  {gameState.selectedAnswer === gameState.correctAnswer ? "Correct! ✓" : "Incorrect ✗"}
                </p>
                <button
                  onClick={handleNextRound}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
                >
                  Next Round
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Round</p>
              <p className="text-2xl font-bold text-indigo-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-2xl font-bold text-indigo-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-lg font-bold text-indigo-600">{modes.find(m => m.id === gameState.currentMode)?.name.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Learning Guide */}
        <div className="bg-purple-50 rounded-lg p-6 mt-6 border-2 border-purple-200">
          <h3 className="font-bold text-lg mb-3 text-purple-900">Articulation Markings Guide</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-purple-900">Legato</p>
              <p className="text-gray-600">Smooth and connected - notes flow together</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-purple-900">Staccato</p>
              <p className="text-gray-600">Short and detached - notes are separated</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-purple-900">Accent (&gt;)</p>
              <p className="text-gray-600">Strong emphasis - note played louder</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-purple-900">Tenuto (−)</p>
              <p className="text-gray-600">Held for full value - sustained</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
