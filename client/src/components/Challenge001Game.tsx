import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Clock, Trophy, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";

type Mode = "speed-challenges" | "progressive-mastery" | "competitive-play";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
}

interface GameState {
  currentMode: Mode;
  score: number;
  round: number;
  currentQuestion: Question | null;
  timeLeft: number;
  isAnswered: boolean;
  streak: number;
  highScore: number;
  masteryLevel: number;
  totalAnswered: number;
  correctAnswers: number;
}

const QUESTIONS_POOL: Question[] = [
  // Easy Questions (difficulty 1)
  {
    question: "How many beats are in a whole note?",
    options: ["2 beats", "3 beats", "4 beats", "8 beats"],
    correctAnswer: 2,
    difficulty: 1,
  },
  {
    question: "What is the symbol for a quarter note?",
    options: ["𝅝", "𝅗𝅥", "♩", "♪"],
    correctAnswer: 2,
    difficulty: 1,
  },
  {
    question: "Which note is higher: C or G?",
    options: ["C", "G", "They're the same", "Depends on octave"],
    correctAnswer: 1,
    difficulty: 1,
  },
  // Medium Questions (difficulty 2)
  {
    question: "How many sharps are in the key of D Major?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 1,
    difficulty: 2,
  },
  {
    question: "What interval is between C and E?",
    options: ["Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th"],
    correctAnswer: 2,
    difficulty: 2,
  },
  {
    question: "What is the relative minor of C Major?",
    options: ["A minor", "D minor", "E minor", "G minor"],
    correctAnswer: 0,
    difficulty: 2,
  },
  // Hard Questions (difficulty 3)
  {
    question: "In 6/8 time, how many eighth notes per measure?",
    options: ["4", "6", "8", "12"],
    correctAnswer: 1,
    difficulty: 3,
  },
  {
    question: "What is the enharmonic equivalent of C#?",
    options: ["B", "Db", "D", "Bb"],
    correctAnswer: 1,
    difficulty: 3,
  },
  {
    question: "Which scale has the pattern W-W-H-W-W-W-H?",
    options: ["Major", "Minor", "Dorian", "Lydian"],
    correctAnswer: 0,
    difficulty: 3,
  },
  // More questions
  {
    question: "What is the dominant chord in C Major?",
    options: ["C Major", "F Major", "G Major", "A minor"],
    correctAnswer: 2,
    difficulty: 2,
  },
  {
    question: "How many lines does a musical staff have?",
    options: ["4", "5", "6", "7"],
    correctAnswer: 1,
    difficulty: 1,
  },
  {
    question: "What does 'forte' mean in music?",
    options: ["Soft", "Loud", "Fast", "Slow"],
    correctAnswer: 1,
    difficulty: 1,
  },
];

export const Challenge001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "speed-challenges",
    score: 0,
    round: 1,
    currentQuestion: null,
    timeLeft: 10,
    isAnswered: false,
    streak: 0,
    highScore: 0,
    masteryLevel: 1,
    totalAnswered: 0,
    correctAnswers: 0,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const getRandomQuestion = useCallback((difficulty?: number) => {
    const filtered = difficulty
      ? QUESTIONS_POOL.filter(q => q.difficulty === difficulty)
      : QUESTIONS_POOL;

    return filtered[Math.floor(Math.random() * filtered.length)];
  }, []);

  const startNewQuestion = useCallback(() => {
    let question: Question;

    if (gameState.currentMode === "progressive-mastery") {
      // Progressive difficulty based on mastery level
      const difficulty = Math.min(3, Math.ceil(gameState.masteryLevel / 3));
      question = getRandomQuestion(difficulty);
    } else {
      question = getRandomQuestion();
    }

    const timeLimit = gameState.currentMode === "speed-challenges" ? 10 : 20;

    setGameState(prev => ({
      ...prev,
      currentQuestion: question,
      timeLeft: timeLimit,
      isAnswered: false,
    }));
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [gameState.currentMode, gameState.masteryLevel, getRandomQuestion]);

  // Timer effect
  useEffect(() => {
    if (gameState.timeLeft > 0 && !gameState.isAnswered && gameState.currentQuestion) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && !gameState.isAnswered) {
      // Time's up
      handleTimeout();
    }
  }, [gameState.timeLeft, gameState.isAnswered, gameState.currentQuestion]);

  const handleTimeout = () => {
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      streak: 0,
      totalAnswered: prev.totalAnswered + 1,
    }));
    setIsCorrect(false);

    setTimeout(() => {
      setGameState(prev => ({ ...prev, round: prev.round + 1 }));
      startNewQuestion();
    }, 2000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentQuestion) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === gameState.currentQuestion.correctAnswer;
    setIsCorrect(correct);

    let points = 0;
    if (correct) {
      // Base points
      points = 10;

      // Speed bonus (Speed Challenges mode)
      if (gameState.currentMode === "speed-challenges") {
        points += gameState.timeLeft;
      }

      // Streak bonus
      if (gameState.streak > 0) {
        points += gameState.streak * 2;
      }

      // Difficulty bonus (Progressive Mastery mode)
      if (gameState.currentMode === "progressive-mastery" && gameState.currentQuestion) {
        points += gameState.currentQuestion.difficulty * 5;
      }
    }

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      score: correct ? prev.score + points : prev.score,
      streak: correct ? prev.streak + 1 : 0,
      totalAnswered: prev.totalAnswered + 1,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      masteryLevel: gameState.currentMode === "progressive-mastery" && correct
        ? Math.min(9, prev.masteryLevel + 0.5)
        : prev.masteryLevel,
      highScore: correct && prev.score + points > prev.highScore
        ? prev.score + points
        : prev.highScore,
    }));

    setTimeout(() => {
      setGameState(prev => ({ ...prev, round: prev.round + 1 }));
      startNewQuestion();
    }, 2000);
  };

  const handleModeChange = (mode: Mode) => {
    setGameState({
      currentMode: mode,
      score: 0,
      round: 1,
      currentQuestion: null,
      timeLeft: mode === "speed-challenges" ? 10 : 20,
      isAnswered: false,
      streak: 0,
      highScore: gameState.highScore, // Preserve high score
      masteryLevel: 1,
      totalAnswered: 0,
      correctAnswers: 0,
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // Initialize first question
  useEffect(() => {
    if (!gameState.currentQuestion) {
      startNewQuestion();
    }
  }, [gameState.currentQuestion, startNewQuestion]);

  const getAccuracy = () => {
    if (gameState.totalAnswered === 0) return 0;
    return Math.round((gameState.correctAnswers / gameState.totalAnswered) * 100);
  };

  const renderSpeedChallenges = () => (
    <div>
      <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-2 border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={32} className="text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-3xl font-bold text-yellow-600">{gameState.timeLeft}s</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={32} className="text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-3xl font-bold text-orange-600">{gameState.streak}</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              gameState.timeLeft > 5 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${(gameState.timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderProgressiveMastery = () => (
    <div>
      <div className="bg-purple-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Mastery Level</p>
            <p className="text-3xl font-bold text-purple-600">Level {Math.floor(gameState.masteryLevel)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-3xl font-bold text-green-600">{getAccuracy()}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${((gameState.masteryLevel % 1) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {gameState.currentQuestion && `Difficulty: ${"★".repeat(gameState.currentQuestion.difficulty)}`}
        </p>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderCompetitivePlay = () => (
    <div>
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={40} />
            <div>
              <p className="text-sm opacity-90">High Score</p>
              <p className="text-3xl font-bold">{gameState.highScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target size={40} />
            <div>
              <p className="text-sm opacity-90">Current Score</p>
              <p className="text-3xl font-bold">{gameState.score}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg p-4 mb-6 border-2 border-orange-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <p className="text-xl font-bold text-orange-600">{gameState.streak}🔥</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-xl font-bold text-green-600">{getAccuracy()}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-blue-600">{gameState.timeLeft}s</p>
          </div>
        </div>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
        <h1 className="text-3xl font-bold text-purple-900">Musical Skills Arena</h1>
        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleModeChange("speed-challenges")}
          className={
            gameState.currentMode === "speed-challenges"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          SPEED CHALLENGES
        </button>
        <button
          onClick={() => handleModeChange("progressive-mastery")}
          className={
            gameState.currentMode === "progressive-mastery"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          PROGRESSIVE MASTERY
        </button>
        <button
          onClick={() => handleModeChange("competitive-play")}
          className={
            gameState.currentMode === "competitive-play"
              ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
              : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
          }
        >
          COMPETITIVE PLAY
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700">
              Mode: {gameState.currentMode.replace(/-/g, " ").toUpperCase()}
            </p>
          </div>

          {gameState.currentMode === "speed-challenges" && renderSpeedChallenges()}
          {gameState.currentMode === "progressive-mastery" && renderProgressiveMastery()}
          {gameState.currentMode === "competitive-play" && renderCompetitivePlay()}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Round</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600">Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-gray-600">Correct</p>
              <p className="text-2xl font-bold text-green-600">{gameState.correctAnswers}/{gameState.totalAnswered}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
