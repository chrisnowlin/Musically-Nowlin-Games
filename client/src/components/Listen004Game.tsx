import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Layers, Target } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "texture-density" | "range-register" | "unity-development";
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
  type?: "texture" | "range" | "development";
  elementName: string;
  description: string;
  options: string[];
  correctAnswer: number;
  question: string;
  explanation: string;
  audioExample?: {
    instruments: string[];
    characteristics: string[];
    description: string;
  };
}

const MUSICAL_ELEMENTS = {
  "texture-density": [
    {
      id: "monophonic",
      elementName: "Monophonic Texture",
      description: "Single melody line without accompaniment",
      explanation: "Monophonic texture features one melody line alone, like a solo flute or unison choir.",
      audioExample: {
        instruments: ["flute"],
        characteristics: ["Single line", "No harmony", "Clear melody"],
        description: "Listen for one independent melody line"
      }
    },
    {
      id: "homophonic",
      elementName: "Homophonic Texture",
      description: "Main melody with chordal accompaniment",
      explanation: "Homophonic texture has a clear melody supported by harmony, like a song with piano accompaniment.",
      audioExample: {
        instruments: ["violin", "cello", "french-horn"],
        characteristics: ["Clear melody", "Harmonic support", "Chordal accompaniment"],
        description: "Listen for melody with harmonic support"
      }
    },
    {
      id: "polyphonic",
      elementName: "Polyphonic Texture",
      description: "Multiple independent melody lines woven together",
      explanation: "Polyphonic texture features two or more independent melodies, like a fugue or round.",
      audioExample: {
        instruments: ["violin", "flute", "oboe"],
        characteristics: ["Multiple melodies", "Independent lines", "Interweaving parts"],
        description: "Listen for multiple independent melodies"
      }
    }
  ],
  "range-register": [
    {
      id: "low-register",
      elementName: "Low Register",
      description: "Deep, dark tones in the lower pitch range",
      explanation: "Low register instruments produce deep, resonant sounds that provide foundation and power.",
      audioExample: {
        instruments: ["cello", "french-horn", "trombone"],
        characteristics: ["Deep tones", "Resonant sound", "Foundation"],
        description: "Listen for deep, resonant low pitches"
      }
    },
    {
      id: "middle-register",
      elementName: "Middle Register",
      description: "Balanced, warm tones in the central pitch range",
      explanation: "Middle register provides the core melodic and harmonic content with balanced warmth.",
      audioExample: {
        instruments: ["violin", "clarinet", "oboe"],
        characteristics: ["Balanced tones", "Warm sound", "Core register"],
        description: "Listen for balanced middle-range pitches"
      }
    },
    {
      id: "high-register",
      elementName: "High Register",
      description: "Bright, brilliant tones in the upper pitch range",
      explanation: "High register instruments create bright, soaring sounds that add brilliance and excitement.",
      audioExample: {
        instruments: ["flute", "trumpet", "violin"],
        characteristics: ["Bright tones", "Brilliant sound", "High pitches"],
        description: "Listen for bright, brilliant high pitches"
      }
    }
  ],
  "unity-development": [
    {
      id: "repetition",
      elementName: "Repetition",
      description: "Exact repeat of musical material for unity",
      explanation: "Repetition creates unity by restating musical ideas exactly, helping listeners remember themes.",
      audioExample: {
        instruments: ["violin", "flute"],
        characteristics: ["Repeated patterns", "Exact restatement", "Unity"],
        description: "Listen for repeated musical patterns"
      }
    },
    {
      id: "variation",
      elementName: "Variation",
      description: "Modified repetition with changes to maintain interest",
      explanation: "Variation develops musical ideas by altering rhythm, melody, or harmony while keeping the core recognizable.",
      audioExample: {
        instruments: ["violin", "cello", "flute"],
        characteristics: ["Modified patterns", "Developed ideas", "Creative changes"],
        description: "Listen for varied but recognizable patterns"
      }
    },
    {
      id: "contrast",
      elementName: "Contrast",
      description: "Different material to create tension and interest",
      explanation: "Contrast provides variety through new material that differs significantly from previous ideas.",
      audioExample: {
        instruments: ["trumpet", "trombone", "xylophone"],
        characteristics: ["Different material", "New ideas", "Strong contrast"],
        description: "Listen for contrasting musical material"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const elements = MUSICAL_ELEMENTS[mode as keyof typeof MUSICAL_ELEMENTS];
  const elementData = elements[(round - 1) % elements.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${elementData.elementName}?`,
      options: [
        elementData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${elementData.elementName}?`,
      options: [
        "No musical characteristics",
        elementData.description,
        "Only percussion instruments",
        "Computer-generated beeps"
      ],
      correctAnswer: 1
    }
  ];
  
  const q = questions[round % 2];
  
  return {
    ...elementData,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  };
};

export const Listen004Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "texture-density",
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
    { id: "texture-density", name: "Texture & Density", icon: <Layers size={20} />, color: "purple" },
    { id: "range-register", name: "Range & Register", icon: <Target size={20} />, color: "blue" },
    { id: "unity-development", name: "Unity & Development", icon: <Music size={20} />, color: "green" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for element demonstrations
      try {
        const sampleInstruments = ["violin", "cello", "flute", "oboe", "clarinet", "trumpet", "trombone", "french-horn", "xylophone"];
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

  const playElementExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the musical element
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on element characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Deep tones") || characteristics.includes("Low register")) {
          duration = 0.8; // Longer for deep tones
          volume = volume * 1.1; // Slightly louder for low register
        } else if (characteristics.includes("Bright tones") || characteristics.includes("High register")) {
          duration = 0.4; // Shorter, more brilliant
        } else if (characteristics.includes("Multiple melodies")) {
          duration = 0.5; // Balanced for polyphonic texture
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
      await new Promise(resolve => setTimeout(resolve, 400));
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
          ? "Excellent! You understand this musical element!" 
          : "Listen carefully to the musical characteristics and try again.",
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

  const handleModeChange = (mode: "texture-density" | "range-register" | "unity-development") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Musical Elements Analyzer...</h1>
          <p className="text-purple-700">Preparing orchestral samples...</p>
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
        <h1 className="text-3xl font-bold text-purple-900">Musical Elements Analyzer</h1>
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
                onClick={playElementExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Element Example
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
              Element: {gameState.currentQuestion.elementName}
            </p>
          </div>

          <div className="bg-teal-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-teal-900 mb-4">Musical Elements Challenge:</h3>
            <p className="text-teal-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-teal-100 text-teal-700 border-2 border-teal-300 cursor-pointer";
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
              <p className="text-gray-600">Elements Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Musical Elements:</h4>
            <p className="text-sm text-gray-600">
              Musical elements are the building blocks of composition. Understanding texture, range, and development 
              helps you analyze how composers create unity, variety, and emotional impact in their music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
