import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Clock, Drum } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "meters" | "types" | "features";
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
  type: "meter" | "type" | "feature";
  meterName: string;
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

const METER_CONCEPTS = {
  "meters": [
    {
      id: "duple",
      meterName: "Duple Meter",
      description: "Two beats per measure (2/4, 2/2, 6/8)",
      explanation: "Duple meter organizes music in groups of two beats, creating a marching or walking feel.",
      audioExample: {
        instruments: ["snare-drum", "bass-drum"],
        characteristics: ["Two-beat groups", "Marching feel", "Strong-weak pattern"],
        description: "Listen for the ONE-two, ONE-two pattern"
      }
    },
    {
      id: "triple",
      meterName: "Triple Meter",
      description: "Three beats per measure (3/4, 3/8, 9/8)",
      explanation: "Triple meter groups beats in threes, creating a waltz or dance-like feeling.",
      audioExample: {
        instruments: ["violin", "cello"],
        characteristics: ["Three-beat groups", "Waltz feel", "Strong-weak-weak pattern"],
        description: "Listen for the ONE-two-three, ONE-two-three pattern"
      }
    },
    {
      id: "quadruple",
      meterName: "Quadruple Meter",
      description: "Four beats per measure (4/4, 4/2, 12/8)",
      explanation: "Quadruple meter groups beats in fours, the most common meter in popular music.",
      audioExample: {
        instruments: ["drum-kit", "piano"],
        characteristics: ["Four-beat groups", "Common time", "Strong-weak-medium-weak pattern"],
        description: "Listen for the ONE-two-three-four pattern"
      }
    }
  ],
  "types": [
    {
      id: "simple",
      meterName: "Simple Meter",
      description: "Beat divides into two equal parts (2/4, 3/4, 4/4)",
      explanation: "Simple meters have beats that naturally divide into two equal parts, like quarter notes dividing into eighth notes.",
      audioExample: {
        instruments: ["wood-block", "triangle"],
        characteristics: ["Two-part division", "Even subdivision", "Straight rhythm"],
        description: "Listen for beats that divide into two equal parts"
      }
    },
    {
      id: "compound",
      meterName: "Compound Meter",
      description: "Beat divides into three equal parts (6/8, 9/8, 12/8)",
      explanation: "Compound meters have beats that divide into three equal parts, creating a flowing or rolling feel.",
      audioExample: {
        instruments: ["tambourine", "castanets"],
        characteristics: ["Three-part division", "Rolling feel", "Triplet subdivision"],
        description: "Listen for beats that divide into three equal parts"
      }
    },
    {
      id: "asymmetrical",
      meterName: "Asymmetrical Meter",
      description: "Unequal beat groupings (5/4, 7/8, 11/8)",
      explanation: "Asymmetrical meters create uneven patterns like 2+3 or 3+2, adding rhythmic interest and tension.",
      audioExample: {
        instruments: ["bongo-drums", "claves"],
        characteristics: ["Unequal groupings", "Additive rhythm", "Unexpected accents"],
        description: "Listen for uneven beat groupings"
      }
    }
  ],
  "features": [
    {
      id: "strong-beats",
      meterName: "Strong Beat Emphasis",
      description: "First beat of each measure receives emphasis",
      explanation: "Strong beats help organize the meter and provide reference points for performers and listeners.",
      audioExample: {
        instruments: ["timpani", "cymbals"],
        characteristics: ["Emphasized downbeat", "Clear metric organization", "Conducting pattern"],
        description: "Listen for emphasized first beats"
      }
    },
    {
      id: "subdivisions",
      meterName: "Rhythmic Subdivisions",
      description: "Dividing beats into smaller rhythmic units",
      explanation: "Subdivisions create rhythmic interest and help maintain steady tempo within the meter.",
      audioExample: {
        instruments: ["xylophone", "marimba"],
        characteristics: ["Divided beats", "Inner rhythm", "Steady pulse"],
        description: "Listen for beats divided into smaller parts"
      }
    },
    {
      id: "syncopation",
      meterName: "Syncopation in Meter",
      description: "Accenting unexpected beats or off-beats",
      explanation: "Syncopation creates rhythmic excitement by emphasizing beats that normally wouldn't be stressed.",
      audioExample: {
        instruments: ["congas", "bongos"],
        characteristics: ["Unexpected accents", "Off-beat emphasis", "Rhythmic surprise"],
        description: "Listen for accents on unexpected beats"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const concepts = METER_CONCEPTS[mode as keyof typeof METER_CONCEPTS];
  const conceptData = concepts[(round - 1) % concepts.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${conceptData.meterName}?`,
      options: [
        conceptData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${conceptData.meterName}?`,
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

export const Rhythm003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "meters",
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
    { id: "meters", name: "Meters", icon: <Clock size={20} />, color: "purple" },
    { id: "types", name: "Meter Types", icon: <Music size={20} />, color: "blue" },
    { id: "features", name: "Meter Features", icon: <Drum size={20} />, color: "green" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for meter demonstrations
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

  const playMeterExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the meter concept
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on meter characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Two-beat groups")) {
          // Play in duple pattern: STRONG-weak
          duration = 0.4;
          volume = volume * 1.2; // Strong beat
        } else if (characteristics.includes("Three-beat groups")) {
          // Play in triple pattern: STRONG-weak-weak
          duration = 0.3;
          volume = volume * 1.1; // Moderately strong
        } else if (characteristics.includes("Four-beat groups")) {
          // Play in quadruple pattern: STRONG-weak-medium-weak
          duration = 0.25;
          volume = volume * 1.15; // Strong downbeat
        } else if (characteristics.includes("Three-part division")) {
          duration = 0.2; // Shorter for compound feel
        } else if (characteristics.includes("Unexpected accents")) {
          volume = volume * (i % 2 === 0 ? 1.3 : 0.7); // Syncopated accents
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
          ? "Excellent! You understand this meter concept!" 
          : "Listen carefully to the rhythmic pattern and try again.",
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

  const handleModeChange = (mode: "meters" | "types" | "features") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Meter Master...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Meter Master</h1>
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
                onClick={playMeterExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Meter Pattern
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
              Concept: {gameState.currentQuestion.meterName}
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-amber-900 mb-4">Meter Master Challenge:</h3>
            <p className="text-amber-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-amber-100 text-amber-700 border-2 border-amber-300 cursor-pointer";
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
            <h4 className="font-semibold text-gray-700 mb-2">About Meter Concepts:</h4>
            <p className="text-sm text-gray-600">
              Meter is the organization of beats into regular groups. Understanding different meters, types, and features 
              helps you feel the pulse and structure of music, whether you're listening, performing, or composing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
