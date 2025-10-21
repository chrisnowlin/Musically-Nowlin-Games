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
  type: "single" | "comparison" | "progression";
  volume1?: number; // 0-1 scale
  volume2?: number;
  direction?: "crescendo" | "diminuendo";
  dynamicLevel?: string;
}

export const Dynamics001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "levels",
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
    { id: "levels", name: "Volume Levels" },
    { id: "relative", name: "Relative Dynamics" },
    { id: "changes", name: "Dynamic Changes" },
    { id: "pulse", name: "Musical Expression" }
  ];

  const DYNAMIC_LEVELS = {
    "pp": 0.1,
    "p": 0.25,
    "mp": 0.4,
    "mf": 0.55,
    "f": 0.7,
    "ff": 0.9
  };

  const playTone = useCallback((frequency: number = 440, duration: number = 1, targetVolume: number = 0.5) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    const actualVolume = targetVolume * masterVolume * 0.3;

    gainNode.gain.setValueAtTime(actualVolume, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  }, [gameState.volume]);

  const playCrescendo = useCallback((startVolume: number = 0.2, endVolume: number = 0.8) => {
    if (!audioContext.current) return;

    const duration = 2.5;
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = 440;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    gainNode.gain.setValueAtTime(startVolume * masterVolume * 0.3, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(endVolume * masterVolume * 0.3, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  }, [gameState.volume]);

  const playDiminuendo = useCallback((startVolume: number = 0.8, endVolume: number = 0.2) => {
    playCrescendo(startVolume, endVolume);
  }, [playCrescendo]);

  const playComparison = useCallback((volume1: number, volume2: number) => {
    if (!audioContext.current) return;

    // Play first tone
    playTone(440, 0.8, volume1);

    // Play second tone after a gap
    setTimeout(() => {
      playTone(440, 0.8, volume2);
    }, 1200);
  }, [playTone]);

  const playMusicalPhrase = useCallback((dynamics: string) => {
    if (!audioContext.current) return;

    const volume = DYNAMIC_LEVELS[dynamics as keyof typeof DYNAMIC_LEVELS] || 0.5;
    const notes = [262, 294, 330, 349]; // C, D, E, F

    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 0.5, volume);
      }, index * 600);
    });
  }, [playTone, DYNAMIC_LEVELS]);

  const generateQuestion = () => {
    const mode = gameState.currentMode;
    let question: Question;

    if (mode === "levels") {
      // Volume level identification
      const levels = Object.keys(DYNAMIC_LEVELS);
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const volume = DYNAMIC_LEVELS[randomLevel as keyof typeof DYNAMIC_LEVELS];

      const incorrectLevels = levels.filter(l => l !== randomLevel).slice(0, 3);
      const options = [randomLevel, ...incorrectLevels].sort(() => Math.random() - 0.5);

      question = {
        question: "Listen to the tone. What dynamic level do you hear?",
        options: options.map(l => `${l} (${l === "pp" ? "pianissimo" : l === "p" ? "piano" : l === "mp" ? "mezzo-piano" : l === "mf" ? "mezzo-forte" : l === "f" ? "forte" : "fortissimo"})`),
        correctAnswer: options.indexOf(randomLevel),
        audioConfig: { type: "single", volume1: volume, dynamicLevel: randomLevel }
      };
    } else if (mode === "relative") {
      // Relative comparison
      const volume1 = Math.random() * 0.5 + 0.2; // 0.2-0.7
      const volume2 = Math.random() * 0.5 + 0.2;

      const correctAnswer = volume1 > volume2 ? 0 : volume1 < volume2 ? 1 : 2;

      question = {
        question: "Listen to two tones. How do they compare?",
        options: [
          "First tone is louder",
          "Second tone is louder",
          "Both tones are equal",
          "Cannot determine"
        ],
        correctAnswer,
        audioConfig: { type: "comparison", volume1, volume2 }
      };
    } else if (mode === "changes") {
      // Crescendo vs diminuendo
      const isCrescendo = Math.random() > 0.5;

      question = {
        question: "Listen to the tone. What dynamic change do you hear?",
        options: [
          "Crescendo (getting louder)",
          "Diminuendo (getting softer)",
          "Staying the same",
          "Sudden accent"
        ],
        correctAnswer: isCrescendo ? 0 : 1,
        audioConfig: { type: "progression", direction: isCrescendo ? "crescendo" : "diminuendo" }
      };
    } else {
      // Musical expression mode
      const levels = ["pp", "mf", "ff"];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];

      const descriptions = {
        "pp": "Very soft and delicate",
        "mf": "Moderate and balanced",
        "ff": "Very loud and powerful"
      };

      const incorrectLevels = levels.filter(l => l !== randomLevel);
      const allDescriptions = [
        descriptions[randomLevel as keyof typeof descriptions],
        descriptions[incorrectLevels[0] as keyof typeof descriptions],
        descriptions[incorrectLevels[1] as keyof typeof descriptions],
        "Completely silent"
      ].sort(() => Math.random() - 0.5);

      question = {
        question: `Listen to the musical phrase. How would you describe the expression?`,
        options: allDescriptions,
        correctAnswer: allDescriptions.indexOf(descriptions[randomLevel as keyof typeof descriptions]),
        audioConfig: { type: "single", volume1: DYNAMIC_LEVELS[randomLevel as keyof typeof DYNAMIC_LEVELS], dynamicLevel: randomLevel }
      };
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

    if (config.type === "single") {
      if (gameState.currentMode === "pulse") {
        playMusicalPhrase(config.dynamicLevel || "mf");
      } else {
        playTone(440, 1.5, config.volume1 || 0.5);
      }
    } else if (config.type === "comparison") {
      playComparison(config.volume1 || 0.5, config.volume2 || 0.5);
    } else if (config.type === "progression") {
      if (config.direction === "crescendo") {
        playCrescendo(0.2, 0.8);
      } else {
        playDiminuendo(0.8, 0.2);
      }
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
      "levels": "Identify different volume levels from pianissimo (pp) to fortissimo (ff)",
      "relative": "Compare two sounds and determine which is louder or softer",
      "changes": "Recognize dynamic changes like crescendo and diminuendo",
      "pulse": "Understand how dynamics express musical character and emotion"
    };
    return descriptions[gameState.currentMode as keyof typeof descriptions];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-orange-100 p-4 relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-red-900">Dynamics Master</h1>
        <div className="text-xl font-bold text-red-700">Score: {gameState.score}</div>
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
                  ? "px-4 py-2 rounded-lg font-semibold bg-red-600 text-white shadow-lg"
                  : "px-4 py-2 rounded-lg font-semibold bg-white text-red-600 hover:bg-red-100"
              }
            >
              {mode.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Mode Description */}
        <div className="bg-red-50 rounded-lg p-6 mb-6 border-2 border-red-200">
          <div className="text-center mb-2">
            <p className="text-lg font-semibold text-red-900">
              {modes.find(m => m.id === gameState.currentMode)?.name}
            </p>
          </div>
          <p className="text-red-700 text-center text-sm">{getModeDescription()}</p>
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
                Play Sound
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
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
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
              <p className="text-2xl font-bold text-red-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-2xl font-bold text-red-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-lg font-bold text-red-600">{modes.find(m => m.id === gameState.currentMode)?.name.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Learning Guide */}
        <div className="bg-yellow-50 rounded-lg p-6 mt-6 border-2 border-yellow-200">
          <h3 className="font-bold text-lg mb-3 text-yellow-900">Dynamic Markings Guide</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">pp - pianissimo</p>
              <p className="text-gray-600">Very soft</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">p - piano</p>
              <p className="text-gray-600">Soft</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">mp - mezzo-piano</p>
              <p className="text-gray-600">Moderately soft</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">mf - mezzo-forte</p>
              <p className="text-gray-600">Moderately loud</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">f - forte</p>
              <p className="text-gray-600">Loud</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-900">ff - fortissimo</p>
              <p className="text-gray-600">Very loud</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
