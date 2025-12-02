import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Calculator, Triangle, GitBranch } from "lucide-react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";

interface GameState {
  currentMode: "ratios-fractions" | "geometry-symmetry" | "sequences-patterns";
  score: number;
  round: number;
  volume: number;
  gameStarted: boolean;
  feedback: { show: boolean; isCorrect: boolean; message: string; explanation?: string } | null;
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  startTime: number;
}

interface Question {
  id: string;
  type: "ratio" | "fraction" | "geometry" | "symmetry" | "sequence" | "pattern";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  audioContext?: {
    frequencies?: number[];
    rhythm?: number[];
    pattern?: string;
  };
}

const generateQuestion = (mode: string, round: number): Question => {
  const questionIndex = (round - 1) % 4;
  
  switch (mode) {
    case "ratios-fractions":
      const ratioQuestions: Question[] = [
        {
          id: "ratio-1",
          type: "ratio",
          question: "If a note has a frequency of 440 Hz (A4), what frequency is one octave higher?",
          options: ["220 Hz", "880 Hz", "660 Hz", "1320 Hz"],
          correctAnswer: 1,
          explanation: "An octave higher doubles the frequency. 440 Hz × 2 = 880 Hz.",
          audioContext: { frequencies: [440, 880] }
        },
        {
          id: "ratio-2", 
          type: "ratio",
          question: "A perfect fifth has a frequency ratio of 3:2. If the lower note is 300 Hz, what's the higher note?",
          options: ["450 Hz", "600 Hz", "400 Hz", "500 Hz"],
          correctAnswer: 0,
          explanation: "300 Hz × (3/2) = 450 Hz. This creates a perfect fifth interval.",
          audioContext: { frequencies: [300, 450] }
        },
        {
          id: "fraction-1",
          type: "fraction", 
          question: "In 4/4 time, what fraction of the measure does a half note represent?",
          options: ["1/4", "1/2", "3/4", "1/8"],
          correctAnswer: 1,
          explanation: "A half note gets 2 beats out of 4 total beats = 2/4 = 1/2 of the measure.",
          audioContext: { rhythm: [2, 2] }
        },
        {
          id: "fraction-2",
          type: "fraction",
          question: "If a song has 3 quarter notes and 1 half note, how many beats total?",
          options: ["3 beats", "4 beats", "5 beats", "6 beats"],
          correctAnswer: 2,
          explanation: "Quarter notes = 1 beat each (3 total) + half note = 2 beats = 5 beats total.",
          audioContext: { rhythm: [1, 1, 1, 2] }
        }
      ];
      return ratioQuestions[questionIndex];
      
    case "geometry-symmetry":
      const geometryQuestions: Question[] = [
        {
          id: "geometry-1",
          type: "geometry",
          question: "How many lines of symmetry does a regular hexagon have?",
          options: ["3", "6", "8", "12"],
          correctAnswer: 1,
          explanation: "A regular hexagon has 6 lines of symmetry through opposite vertices and edges.",
        },
        {
          id: "geometry-2",
          type: "geometry", 
          question: "A circle has infinite lines of symmetry. What musical pattern shares this property?",
          options: ["Major scale", "Chromatic scale", "Whole tone scale", "Pentatonic scale"],
          correctAnswer: 1,
          explanation: "The chromatic scale is symmetrical - it has the same interval structure in all directions.",
        },
        {
          id: "symmetry-1",
          type: "symmetry",
          question: "If a melody goes up by major 3rd, then down by major 3rd, what type of symmetry is this?",
          options: ["Rotational", "Reflection", "Translation", "No symmetry"],
          correctAnswer: 1,
          explanation: "Going up then down by the same interval creates reflection symmetry around the starting note.",
        },
        {
          id: "symmetry-2",
          type: "symmetry",
          question: "A rhythm pattern: long-short-long-short. What's the symmetrical pattern?",
          options: ["short-long-short-long", "long-long-short-short", "short-short-long-long", "long-short-short-long"],
          correctAnswer: 0,
          explanation: "The pattern is reflected/reversed to create: short-long-short-long.",
          audioContext: { rhythm: [2, 1, 2, 1] }
        }
      ];
      return geometryQuestions[questionIndex];
      
    case "sequences-patterns":
      const patternQuestions: Question[] = [
        {
          id: "sequence-1",
          type: "sequence",
          question: "Fibonacci sequence: 1, 1, 2, 3, 5, 8, ?. What's next?",
          options: ["11", "13", "16", "21"],
          correctAnswer: 1,
          explanation: "Each number is the sum of the previous two: 5 + 8 = 13.",
        },
        {
          id: "pattern-1",
          type: "pattern",
          question: "Musical pattern: C-E-G, D-F#-A, E-G-B. What's the next chord?",
          options: ["F-A-C", "F#-A#-C#", "G-B-D", "A-C#-E"],
          correctAnswer: 0,
          explanation: "The pattern moves up by whole step each time: C major → D major → E major → F major.",
        },
        {
          id: "sequence-2",
          type: "sequence",
          question: "Rhythm: 1, 2, 4, 8, 16, ?. What's the next number of beats?",
          options: ["24", "32", "20", "64"],
          correctAnswer: 1,
          explanation: "Each number doubles: 16 × 2 = 32. This creates exponential growth in rhythm.",
        },
        {
          id: "pattern-2",
          type: "pattern",
          question: "Note pattern: C, D, E, F, G, A, B, ?. What comes next?",
          options: ["C", "D#", "F#", "G#"],
          correctAnswer: 0,
          explanation: "This is the major scale pattern, which repeats at the octave (C).",
        }
      ];
      return patternQuestions[questionIndex];
      
    default:
      return {
        id: "default",
        type: "ratio",
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        explanation: "2 + 2 = 4",
      };
  }
};

export const Cross001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "ratios-fractions",
    score: 0,
    round: 1,
    volume: 70,
    gameStarted: false,
    feedback: null,
    currentQuestion: null,
    selectedAnswer: null,
    startTime: Date.now(),
  });

  const modes = [
    { id: "ratios-fractions", name: "Ratios & Fractions", icon: <Calculator size={20} />, color: "blue" },
    { id: "geometry-symmetry", name: "Geometry & Symmetry", icon: <Triangle size={20} />, color: "green" },
    { id: "sequences-patterns", name: "Sequences & Patterns", icon: <GitBranch size={20} />, color: "orange" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await audioService.initialize();
      const newQuestion = generateQuestion(gameState.currentMode, gameState.round);
      setGameState(prev => ({
        ...prev,
        currentQuestion: newQuestion,
        gameStarted: true,
        selectedAnswer: null,
        feedback: null,
        startTime: Date.now(),
      }));
    };
    
    if (!gameState.gameStarted) {
      initializeGame();
    }
  }, [gameState.currentMode, gameState.round, gameState.gameStarted]);

  const playAudioContext = useCallback(async () => {
    if (!gameState.currentQuestion?.audioContext) return;
    
    const { frequencies, rhythm, pattern } = gameState.currentQuestion.audioContext;
    
    if (frequencies) {
      // Play frequency relationships
      for (const freq of frequencies) {
        await audioService.playNote(freq, 0.5);
      }
    } else if (rhythm) {
      // Play rhythm patterns
      for (const beat of rhythm) {
        if (beat > 0) {
          await audioService.playNote(440, beat * 0.2);
        } else {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  }, [gameState.currentQuestion]);

  const handleAnswer = (answerIndex: number) => {
    if (!gameState.currentQuestion || gameState.selectedAnswer !== null) return;

    const isCorrect = answerIndex === gameState.currentQuestion.correctAnswer;
    const timeSpent = Date.now() - gameState.startTime;
    const timeBonus = Math.max(0, Math.floor((30000 - timeSpent) / 1000));
    const points = isCorrect ? 100 + timeBonus : 0;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: gameState.currentQuestion!.options[answerIndex],
      score: prev.score + points,
      feedback: {
        show: true,
        isCorrect,
        message: isCorrect 
          ? "Excellent! You've mastered this musical-math concept!" 
          : "Not quite right. Let's explore this concept together.",
        explanation: gameState.currentQuestion!.explanation,
      },
    }));

    // Auto-advance to next question after delay
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        round: prev.round + 1,
        currentQuestion: generateQuestion(prev.currentMode, prev.round),
        selectedAnswer: null,
        feedback: null,
        startTime: Date.now(),
      }));
    }, 4000);
  };

  const handleModeChange = (mode: "ratios-fractions" | "geometry-symmetry" | "sequences-patterns") => {
    const newQuestion = generateQuestion(mode, 1);
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 1,
      currentQuestion: newQuestion,
      selectedAnswer: null,
      feedback: null,
      startTime: Date.now(),
    }));
  };

  const currentModeConfig = modes.find(m => m.id === gameState.currentMode);

  const renderFeedback = () => {
    if (!gameState.feedback?.show) return null;

    return (
      <div className={`rounded-lg p-6 mb-6 ${
        gameState.feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {gameState.feedback.isCorrect ? (
            <CheckCircle size={24} className="text-green-600" />
          ) : (
            <XCircle size={24} className="text-red-600" />
          )}
          <h3 className={`text-lg font-semibold ${
            gameState.feedback.isCorrect ? 'text-green-900' : 'text-red-900'
          }`}>
            {gameState.feedback.message}
          </h3>
        </div>
        
        {gameState.feedback.explanation && (
          <div className="text-sm text-gray-700">
            <strong>Explanation:</strong> {gameState.feedback.explanation}
          </div>
        )}
      </div>
    );
  };

  if (!gameState.gameStarted || !gameState.currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Music & Math Explorer...</h1>
          <p className="text-purple-700">Preparing cross-curricular challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 relative">
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-900">Music & Math Explorer</h1>
        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id as any)}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 ${
              gameState.currentMode === mode.id
                ? `bg-${mode.color}-600 text-white`
                : `bg-white text-${mode.color}-600 hover:bg-${mode.color}-100`
            }`}
          >
            {mode.icon}
            {mode.name.toUpperCase()}
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
          
          {gameState.currentQuestion.audioContext && (
            <button
              onClick={playAudioContext}
              className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play size={16} />
              Hear the Musical Example
            </button>
          )}
        </div>

        {renderFeedback()}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700 flex items-center justify-center gap-2">
              {currentModeConfig?.icon}
              {currentModeConfig?.name.toUpperCase()}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-purple-900 mb-4">Challenge Question:</h3>
            <p className="text-purple-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
            <div className="grid grid-cols-1 gap-3">
              {gameState.currentQuestion.options.map((option, index) => {
                const isSelected = gameState.selectedAnswer === option;
                const isCorrect = index === gameState.currentQuestion!.correctAnswer;
                const showResult = gameState.selectedAnswer !== null;
                
                let buttonClass = "p-4 rounded-lg font-semibold text-left transition-all ";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "bg-green-500 text-white";
                  } else if (isSelected) {
                    buttonClass += "bg-red-500 text-white";
                  } else {
                    buttonClass += "bg-gray-300 text-gray-600";
                  }
                } else {
                  buttonClass += "bg-white hover:bg-purple-100 text-purple-700 border-2 border-purple-300 cursor-pointer";
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle size={20} className="ml-2" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle size={20} className="ml-2" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Learning Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Questions Completed</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About This Mode:</h4>
            <p className="text-sm text-gray-600">
              {gameState.currentMode === "ratios-fractions" && 
                "Explore how musical intervals, rhythms, and time signatures relate to mathematical ratios and fractions."}
              {gameState.currentMode === "geometry-symmetry" && 
                "Discover the connections between musical patterns, shapes, and symmetry in both visual and auditory domains."}
              {gameState.currentMode === "sequences-patterns" && 
                "Learn how sequences and patterns in mathematics mirror the structure of melodies, rhythms, and harmonic progressions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
