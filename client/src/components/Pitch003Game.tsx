import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Zap, Palette } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "transformations" | "patterns" | "articulations";
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
  type: "transformation" | "pattern" | "articulation";
  melodyName: string;
  description: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  audioExample?: {
    instruments: string[];
    characteristics: string[];
    description: string;
  };
}

const MELODY_CONCEPTS = {
  "transformations": [
    {
      id: "inversion",
      melodyName: "Melodic Inversion",
      description: "Flipping a melody upside down (ascending becomes descending)",
      explanation: "Melodic inversion turns intervals upside-down - ascending intervals become descending and vice versa.",
      audioExample: {
        instruments: ["flute", "violin"],
        characteristics: ["Mirror intervals", "Upside-down contour", "Symmetrical movement"],
        description: "Listen for the melody turning upside down"
      }
    },
    {
      id: "retrograde",
      melodyName: "Melodic Retrograde",
      description: "Playing a melody backwards (reverse order)",
      explanation: "Retrograde plays the melody notes in reverse order, creating a mirror image in time.",
      audioExample: {
        instruments: ["oboe", "clarinet"],
        characteristics: ["Reverse order", "Backward melody", "Temporal mirror"],
        description: "Listen for the melody played backwards"
      }
    },
    {
      id: "augmentation",
      melodyName: "Melodic Augmentation",
      description: "Lengthening note values (slowing down the rhythm)",
      explanation: "Augmentation stretches the rhythm by making note values longer while keeping pitches the same.",
      audioExample: {
        instruments: ["cello", "french-horn"],
        characteristics: ["Longer notes", "Slower rhythm", "Stretched time"],
        description: "Listen for the stretched, slower rhythm"
      }
    }
  ],
  "patterns": [
    {
      id: "sequence",
      melodyName: "Melodic Sequence",
      description: "Repeating a pattern at different pitch levels",
      explanation: "A sequence repeats a melodic pattern starting on different pitches, creating stepwise movement.",
      audioExample: {
        instruments: ["violin", "flute"],
        characteristics: ["Repeated pattern", "Stepwise movement", "Transposed repetition"],
        description: "Listen for the pattern moving up or down"
      }
    },
    {
      id: "motif",
      melodyName: "Melodic Motif",
      description: "Short musical idea that can be developed",
      explanation: "A motif is a brief musical idea that serves as building material for larger compositions.",
      audioExample: {
        instruments: ["trumpet", "trombone"],
        characteristics: ["Short idea", "Building block", "Developable material"],
        description: "Listen for a short, memorable musical idea"
      }
    },
    {
      id: "phrase",
      melodyName: "Melodic Phrase",
      description: "Complete musical thought with beginning and end",
      explanation: "A phrase is a musical sentence - it has a clear beginning, middle, and satisfying end.",
      audioExample: {
        instruments: ["oboe", "clarinet", "flute"],
        characteristics: ["Complete thought", "Clear structure", "Musical sentence"],
        description: "Listen for a complete musical statement"
      }
    }
  ],
  "articulations": [
    {
      id: "staccato",
      melodyName: "Staccato Articulation",
      description: "Short, detached notes with space between",
      explanation: "Staccato notes are played short and detached, creating a light, bouncy character.",
      audioExample: {
        instruments: ["violin", "flute"],
        characteristics: ["Short notes", "Detached sound", "Light character"],
        description: "Listen for short, separated notes"
      }
    },
    {
      id: "legato",
      melodyName: "Legato Articulation",
      description: "Smooth, connected notes with no space between",
      explanation: "Legato notes flow smoothly into each other, creating a connected, singing quality.",
      audioExample: {
        instruments: ["cello", "oboe"],
        characteristics: ["Connected notes", "Smooth flow", "Singing quality"],
        description: "Listen for smooth, connected melody"
      }
    },
    {
      id: "accent",
      melodyName: "Accent Articulation",
      description: "Emphasized certain notes with extra force",
      explanation: "Accents give certain notes extra emphasis, creating rhythmic interest and highlight.",
      audioExample: {
        instruments: ["trumpet", "french-horn"],
        characteristics: ["Emphasized notes", "Dynamic highlights", "Rhythmic interest"],
        description: "Listen for emphasized, accented notes"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const concepts = MELODY_CONCEPTS[mode as keyof typeof MELODY_CONCEPTS];
  const conceptData = concepts[(round - 1) % concepts.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${conceptData.melodyName}?`,
      options: [
        conceptData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${conceptData.melodyName}?`,
      options: [
        "No musical characteristics",
        conceptData.description,
        "Only percussion instruments",
        "Computer-generated beeps"
      ],
      correctAnswer: 1
    }
  ];
  
  const q = questions[round % 2];
  
  return {
    ...conceptData,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  };
};

export const Pitch003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "transformations",
    score: 0,
    round: 1,
    volume: 70,
    gameStarted: false,
    feedback: null,
    currentQuestion: null,
    selectedAnswer: null,
    startTime: Date.now(),
  });

  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [usingSamples, setUsingSamples] = useState(false);

  const modes = [
    { id: "transformations", name: "Transformations", icon: <Zap size={20} />, color: "purple" },
    { id: "patterns", name: "Patterns", icon: <Music size={20} />, color: "blue" },
    { id: "articulations", name: "Articulations", icon: <Palette size={20} />, color: "green" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for melody demonstrations
      try {
        const sampleInstruments = ["violin", "cello", "flute", "oboe", "clarinet", "trumpet", "trombone", "french-horn"];
        for (const instrument of sampleInstruments) {
          const samples = instrumentLibrary.getSamples(instrument);
          for (const sample of samples.slice(0, 2)) { // Load first 2 samples per instrument
            const path = `/audio/${sample.path}`;
            const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
            await sampleAudioService.loadSample(path, sampleName);
          }
        }
        
        if (sampleAudioService.getLoadedSampleCount() > 0) {
          setUsingSamples(true);
        }
      } catch (error) {
        console.log("Using synthesized audio as fallback");
      }
      
      setSamplesLoaded(true);
      
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

  const playMelodyExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the melody concept
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on melody characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Short notes") || characteristics.includes("Detached sound")) {
          duration = 0.2; // Very short for staccato
        } else if (characteristics.includes("Connected notes") || characteristics.includes("Smooth flow")) {
          duration = 0.8; // Longer for legato
        } else if (characteristics.includes("Longer notes") || characteristics.includes("Slower rhythm")) {
          duration = 1.0; // Even longer for augmentation
        } else if (characteristics.includes("Emphasized notes")) {
          volume = volume * 1.3; // Louder for accents
        }
        
        if (isSampleAvailable && usingSamples) {
          await sampleAudioService.playSample(sampleName, {
            volume: volume,
            playbackRate: 1.0,
          });
        } else {
          await sampleAudioService.playNote(sample.frequency, duration);
        }
      }
      
      // Pause between instruments
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }, [gameState.currentQuestion, gameState.volume, usingSamples]);

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
          ? "Brilliant! You understand this melodic concept!" 
          : "Listen carefully to the melodic characteristics and try again.",
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

  const handleModeChange = (mode: "transformations" | "patterns" | "articulations") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Melody Master...</h1>
          <p className="text-purple-700">Preparing orchestral samples...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-purple-900">Melody Master</h1>
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
          
          {gameState.currentQuestion.audioExample && (
            <div className="space-y-3">
              <button
                onClick={playMelodyExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Melody Example
              </button>
              <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                <strong>Characteristics:</strong> {gameState.currentQuestion.audioExample.description}
              </div>
            </div>
          )}
          
          {samplesLoaded && (
            <div className={`text-sm p-2 rounded mt-3 ${
              usingSamples ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {usingSamples ? '🎻 Using real orchestral samples!' : '🎹 Using synthesized audio'}
            </div>
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
            <p className="text-sm text-gray-500 mt-2">
              Concept: {gameState.currentQuestion.melodyName}
            </p>
          </div>

          <div className="bg-rose-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-rose-900 mb-4">Melody Master Challenge:</h3>
            <p className="text-rose-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-rose-100 text-rose-700 border-2 border-rose-300 cursor-pointer";
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
              <p className="text-gray-600">Concepts Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Melody Concepts:</h4>
            <p className="text-sm text-gray-600">
              Melody is the horizontal aspect of music - the sequence of notes that we remember and sing. 
              Understanding transformations, patterns, and articulations helps you analyze and create more expressive melodies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
