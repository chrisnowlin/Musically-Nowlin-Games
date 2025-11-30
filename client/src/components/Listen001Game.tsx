import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Radio, Headphones } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "simple-forms" | "complex-forms" | "contrapuntal-forms";
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
  type: "binary" | "ternary" | "rondo" | "sonata" | "fugue" | "canon";
  formName: string;
  description: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  audioExample?: {
    instruments: string[];
    structure: string[];
    description: string;
  };
}

const MUSICAL_FORMS = {
  "simple-forms": [
    {
      id: "binary",
      formName: "Binary Form (AB)",
      description: "Two contrasting sections, A and B",
      explanation: "Binary form has two main sections. Section A states a musical idea, and Section B provides contrast before often returning to material from A.",
      audioExample: {
        instruments: ["violin", "flute"],
        structure: ["A: Melody in violin", "B: Contrasting melody in flute"],
        description: "Listen for two distinct sections"
      }
    },
    {
      id: "ternary", 
      formName: "Ternary Form (ABA)",
      description: "Three sections: A, B, and return to A",
      explanation: "Ternary form follows A-B-A structure. Section A states an idea, B contrasts it, then A returns to create a satisfying balance.",
      audioExample: {
        instruments: ["violin", "cello", "flute"],
        structure: ["A: Violin melody", "B: Cello contrast", "A: Violin returns"],
        description: "Listen for the return of the first section"
      }
    }
  ],
  "complex-forms": [
    {
      id: "rondo",
      formName: "Rondo Form (ABACA)",
      description: "Recurring A section alternating with contrasting episodes",
      explanation: "Rondo form features a main theme (A) that keeps returning between contrasting sections (B, C, etc.).",
      audioExample: {
        instruments: ["violin", "flute", "cello", "oboe"],
        structure: ["A: Main theme", "B: First episode", "A: Return", "C: Second episode", "A: Final return"],
        description: "Listen for the recurring main theme"
      }
    },
    {
      id: "sonata",
      formName: "Sonata Form",
      description: "Exposition, Development, and Recapitulation",
      explanation: "Sonata form has three main parts: Exposition (themes), Development (themes are explored), and Recapitulation (themes return).",
      audioExample: {
        instruments: ["violin", "cello", "flute", "french-horn"],
        structure: ["Exposition: Two themes", "Development: Themes explored", "Recapitulation: Themes return"],
        description: "Listen for theme presentation and return"
      }
    }
  ],
  "contrapuntal-forms": [
    {
      id: "fugue",
      formName: "Fugue",
      description: "Multiple independent melody lines woven together",
      explanation: "A fugue features a main subject (theme) that enters in different voices, creating complex polyphonic texture.",
      audioExample: {
        instruments: ["violin", "flute", "oboe", "clarinet"],
        structure: ["Subject enters in violin", "Subject enters in flute", "Subject enters in oboe", "Development"],
        description: "Listen for the same melody entering in different instruments"
      }
    },
    {
      id: "canon",
      formName: "Canon (Round)",
      description: "Same melody repeated by different voices at different times",
      explanation: "A canon is like a round where the same melody is imitated by different voices starting at different times.",
      audioExample: {
        instruments: ["violin", "cello", "flute"],
        structure: ["Violin starts melody", "Cello enters 2 beats later", "Flute enters 2 beats later"],
        description: "Listen for the melody starting at different times"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const forms = MUSICAL_FORMS[mode as keyof typeof MUSICAL_FORMS];
  const formData = forms[(round - 1) % forms.length];
  
  const questions = [
    {
      question: `What is the structure of ${formData.formName}?`,
      options: [
        formData.description,
        "Four contrasting sections",
        "Random variation of themes", 
        "Single continuous melody"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${formData.formName}?`,
      options: [
        "No clear structure",
        formData.description,
        "Only percussion instruments",
        "Silent with occasional notes"
      ],
      correctAnswer: 1
    }
  ];
  
  const q = questions[round % 2];
  
  return {
    ...formData,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  };
};

export const Listen001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "simple-forms",
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
    { id: "simple-forms", name: "Simple Forms", icon: <Music size={20} />, color: "blue" },
    { id: "complex-forms", name: "Complex Forms", icon: <Radio size={20} />, color: "green" },
    { id: "contrapuntal-forms", name: "Contrapuntal Forms", icon: <Headphones size={20} />, color: "purple" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for form demonstrations
      try {
        const sampleInstruments = ["violin", "cello", "flute", "oboe", "clarinet", "french-horn"];
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

  const playFormExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, structure } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the form
    for (let i = 0; i < structure.length; i++) {
      const instrumentName = instruments[i % instruments.length];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        if (isSampleAvailable && usingSamples) {
          await sampleAudioService.playSample(sampleName, {
            volume: gameState.volume / 100,
            playbackRate: 1.0,
          });
        } else {
          await sampleAudioService.playNote(sample.frequency, 0.8);
        }
      }
      
      // Brief pause between sections
      await new Promise(resolve => setTimeout(resolve, 500));
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
          ? "Excellent! You understand this musical form!" 
          : "Listen carefully to the structure and try again.",
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

  const handleModeChange = (mode: "simple-forms" | "complex-forms" | "contrapuntal-forms") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Musical Form Explorer...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Musical Form Explorer</h1>
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
                onClick={playFormExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Form Example
              </button>
              <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                <strong>Structure:</strong> {gameState.currentQuestion.audioExample.description}
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
              Form: {gameState.currentQuestion.formName}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4">Listening Challenge:</h3>
            <p className="text-blue-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-pointer";
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
              <p className="text-gray-600">Forms Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Musical Forms:</h4>
            <p className="text-sm text-gray-600">
              Musical forms are the structural frameworks that organize musical ideas. 
              Understanding forms helps you follow the architecture of compositions and appreciate how composers create coherent musical journeys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
