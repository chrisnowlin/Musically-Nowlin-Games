import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Volume2, VolumeX, Play, Heart, Frown, Zap, Smile } from "lucide-react";
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
  emotion: "happy" | "sad" | "energetic" | "calm" | "mysterious" | "triumphant";
  melody: number[];
  tempo: number;
  dynamics: number;
}

export const Dynamics003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "detection",
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
    { id: "detection", name: "Emotion Detection" },
    { id: "analysis", name: "Emotional Analysis" }
  ];

  const EMOTIONS = {
    happy: {
      name: "Happy",
      icon: Smile,
      color: "text-yellow-500",
      melody: [262, 294, 330, 349, 392], // C D E F G - major scale
      tempo: 0.4,
      dynamics: 0.35
    },
    sad: {
      name: "Sad",
      icon: Frown,
      color: "text-blue-500",
      melody: [294, 262, 233, 220, 196], // D C Bb A G - descending
      tempo: 0.9,
      dynamics: 0.2
    },
    energetic: {
      name: "Energetic",
      icon: Zap,
      color: "text-orange-500",
      melody: [392, 440, 523, 587, 659], // G A C D E - fast ascending
      tempo: 0.25,
      dynamics: 0.4
    },
    calm: {
      name: "Calm",
      icon: Heart,
      color: "text-green-500",
      melody: [262, 294, 262, 220, 196], // C D C A G - gentle
      tempo: 1.0,
      dynamics: 0.25
    },
    mysterious: {
      name: "Mysterious",
      icon: Heart,
      color: "text-purple-500",
      melody: [233, 247, 262, 277, 294], // Bb B C Db D - chromatic
      tempo: 0.7,
      dynamics: 0.15
    },
    triumphant: {
      name: "Triumphant",
      icon: Heart,
      color: "text-red-500",
      melody: [262, 330, 392, 523, 659], // C E G C E - major triad
      tempo: 0.5,
      dynamics: 0.45
    }
  };

  const playEmotion = useCallback((emotion: keyof typeof EMOTIONS) => {
    if (!audioContext.current) return;

    const config = EMOTIONS[emotion];
    const masterVolume = gameState.volume / 100;

    config.melody.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * config.tempo;
      const duration = config.tempo * 0.9;

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = config.dynamics * masterVolume;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [gameState.volume]);

  const generateQuestion = () => {
    const mode = gameState.currentMode;
    let question: Question;

    if (mode === "detection") {
      // Emotion detection
      const emotionKeys = Object.keys(EMOTIONS) as (keyof typeof EMOTIONS)[];
      const randomEmotion = emotionKeys[Math.floor(Math.random() * emotionKeys.length)];
      const emotionData = EMOTIONS[randomEmotion];

      const incorrectEmotions = emotionKeys.filter(e => e !== randomEmotion).slice(0, 3);
      const options = [randomEmotion, ...incorrectEmotions].sort(() => Math.random() - 0.5);

      question = {
        question: "Listen to the musical phrase. What emotion does it express?",
        options: options.map(e => EMOTIONS[e].name),
        correctAnswer: options.indexOf(randomEmotion),
        audioConfig: {
          emotion: randomEmotion,
          melody: emotionData.melody,
          tempo: emotionData.tempo,
          dynamics: emotionData.dynamics
        }
      };
    } else {
      // Emotional analysis
      const analyses = [
        { emotion: "happy" as const, question: "What musical elements create the joyful character?", correctAnswer: "Major scale ascending with bright, quick tempo" },
        { emotion: "sad" as const, question: "What creates the melancholic feeling in this phrase?", correctAnswer: "Descending melody with slow tempo and soft dynamics" },
        { emotion: "energetic" as const, question: "How does this music express energy?", correctAnswer: "Fast tempo with ascending leaps and strong dynamics" },
        { emotion: "calm" as const, question: "What makes this phrase feel peaceful?", correctAnswer: "Slow, gentle melody with soft, sustained tones" },
      ];

      const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
      const emotionData = EMOTIONS[randomAnalysis.emotion];

      const allAnswers = [
        randomAnalysis.correctAnswer,
        "Loud volume with sharp accents throughout",
        "Random notes with unpredictable rhythm",
        "Monotone repetition without variation"
      ];

      // Shuffle but track correct answer
      const shuffled = allAnswers.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(randomAnalysis.correctAnswer);

      question = {
        question: randomAnalysis.question,
        options: shuffled,
        correctAnswer: correctIndex,
        audioConfig: {
          emotion: randomAnalysis.emotion,
          melody: emotionData.melody,
          tempo: emotionData.tempo,
          dynamics: emotionData.dynamics
        }
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
    playEmotion(gameState.currentQuestion.audioConfig.emotion);
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
      "detection": "Identify the emotional character expressed in musical phrases",
      "analysis": "Understand how musical elements create specific emotions and moods"
    };
    return descriptions[gameState.currentMode as keyof typeof descriptions];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4 relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-900">Emotion Master</h1>
        <div className="text-xl font-bold text-pink-700">Score: {gameState.score}</div>
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
                  ? "px-4 py-2 rounded-lg font-semibold bg-pink-600 text-white shadow-lg"
                  : "px-4 py-2 rounded-lg font-semibold bg-white text-pink-600 hover:bg-pink-100"
              }
            >
              {mode.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Mode Description */}
        <div className="bg-pink-50 rounded-lg p-6 mb-6 border-2 border-pink-200">
          <div className="text-center mb-2">
            <p className="text-lg font-semibold text-pink-900">
              {modes.find(m => m.id === gameState.currentMode)?.name}
            </p>
          </div>
          <p className="text-pink-700 text-center text-sm">{getModeDescription()}</p>
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
                Play Music
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
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
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
              <p className="text-2xl font-bold text-pink-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-2xl font-bold text-pink-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-lg font-bold text-pink-600">{modes.find(m => m.id === gameState.currentMode)?.name.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Learning Guide */}
        <div className="bg-purple-50 rounded-lg p-6 mt-6 border-2 border-purple-200">
          <h3 className="font-bold text-lg mb-3 text-purple-900">Emotions in Music</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-yellow-600 flex items-center gap-2">
                <Smile size={16} /> Happy
              </p>
              <p className="text-gray-600">Major scale, bright tempo, ascending melodies</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-blue-600 flex items-center gap-2">
                <Frown size={16} /> Sad
              </p>
              <p className="text-gray-600">Descending melodies, slow tempo, soft dynamics</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-orange-600 flex items-center gap-2">
                <Zap size={16} /> Energetic
              </p>
              <p className="text-gray-600">Fast tempo, strong dynamics, leaping intervals</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-bold text-green-600 flex items-center gap-2">
                <Heart size={16} /> Calm
              </p>
              <p className="text-gray-600">Slow tempo, gentle motion, soft and sustained</p>
            </div>
          </div>
          <div className="mt-4 bg-white p-3 rounded">
            <p className="text-sm text-gray-700">
              <strong>Musical Elements that Express Emotion:</strong> Tempo (speed), dynamics (volume),
              melody direction (up/down), scale type (major/minor), rhythm patterns, and articulation all
              work together to create emotional expression in music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
