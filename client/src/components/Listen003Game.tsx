import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, User, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "baroque-classical" | "romantic-modern" | "jazz-contemporary";
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
  type: "composer" | "era" | "style";
  composerName: string;
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

const COMPOSER_STYLES = {
  "baroque-classical": [
    {
      id: "bach",
      composerName: "J.S. Bach (1685-1750)",
      description: "Complex counterpoint, ornate melodies, sacred themes",
      explanation: "Bach mastered counterpoint and fugue, creating intricate polyphonic textures with harpsichord and organ.",
      audioExample: {
        instruments: ["violin", "flute", "oboe", "trumpet"],
        characteristics: ["Complex counterpoint", "Ornate melodies", "Steady rhythm"],
        description: "Listen for intricate interweaving melodies"
      }
    },
    {
      id: "mozart",
      composerName: "W.A. Mozart (1756-1791)",
      description: "Elegant melodies, balanced forms, graceful clarity",
      explanation: "Mozart exemplified Classical elegance with clear melodies, balanced phrases, and formal perfection.",
      audioExample: {
        instruments: ["violin", "cello", "flute", "french-horn"],
        characteristics: ["Clear melodies", "Balanced phrases", "Graceful rhythms"],
        description: "Listen for elegant, balanced phrases"
      }
    },
    {
      id: "beethoven",
      composerName: "L. Beethoven (1770-1827)",
      description: "Dramatic contrasts, emotional power, revolutionary forms",
      explanation: "Beethoven bridged Classical and Romantic eras with emotional depth and innovative structures.",
      audioExample: {
        instruments: ["violin", "cello", "oboe", "clarinet"],
        characteristics: ["Dynamic contrasts", "Emotional melodies", "Powerful rhythms"],
        description: "Listen for dramatic emotional shifts"
      }
    }
  ],
  "romantic-modern": [
    {
      id: "chopin",
      composerName: "F. Chopin (1810-1849)",
      description: "Intimate piano works, poetic melodies, expressive harmonies",
      explanation: "Chopin revolutionized piano music with intimate, poetic expressions and innovative harmonies.",
      audioExample: {
        instruments: ["flute", "oboe", "clarinet"],
        characteristics: ["Lyrical melodies", "Expressive harmonies", "Intimate character"],
        description: "Listen for poetic, expressive melodies"
      }
    },
    {
      id: "debussy",
      composerName: "C. Debussy (1862-1918)",
      description: "Impressionistic colors, whole-tone scales, atmospheric textures",
      explanation: "Debussy created impressionistic soundscapes using innovative scales and orchestral colors.",
      audioExample: {
        instruments: ["flute", "clarinet", "french-horn", "xylophone"],
        characteristics: ["Atmospheric textures", "Whole-tone sounds", "Flowing rhythms"],
        description: "Listen for dreamy, impressionistic colors"
      }
    },
    {
      id: "stravinsky",
      composerName: "I. Stravinsky (1882-1971)",
      description: "Rhythmic innovation, bold harmonies, revolutionary forms",
      explanation: "Stravinsky revolutionized rhythm and form, creating powerful, groundbreaking compositions.",
      audioExample: {
        instruments: ["trumpet", "trombone", "xylophone", "french-horn"],
        characteristics: ["Complex rhythms", "Bold harmonies", "Powerful dynamics"],
        description: "Listen for revolutionary rhythmic patterns"
      }
    }
  ],
  "jazz-contemporary": [
    {
      id: "gershwin",
      composerName: "G. Gershwin (1898-1937)",
      description: "Jazz-classical fusion, syncopated rhythms, American spirit",
      explanation: "Gershwin blended jazz rhythms with classical forms, creating uniquely American music.",
      audioExample: {
        instruments: ["clarinet", "trumpet", "trombone", "xylophone"],
        characteristics: ["Jazz rhythms", "Blues notes", "Orchestral swing"],
        description: "Listen for jazz-classical fusion"
      }
    },
    {
      id: "copland",
      composerName: "A. Copland (1900-1990)",
      description: "American folk themes, open harmonies, spacious sounds",
      explanation: "Copland captured the American spirit through folk melodies and expansive orchestral textures.",
      audioExample: {
        instruments: ["flute", "oboe", "clarinet", "french-horn"],
        characteristics: ["Open harmonies", "Folk melodies", "Spacious sound"],
        description: "Listen for American folk character"
      }
    },
    {
      id: "berstein",
      composerName: "L. Bernstein (1918-1990)",
      description: "Theatrical drama, jazz influences, rhythmic vitality",
      explanation: "Bernstein combined classical sophistication with jazz and theatrical energy.",
      audioExample: {
        instruments: ["trumpet", "trombone", "clarinet", "xylophone"],
        characteristics: ["Theatrical drama", "Jazz syncopation", "Rhythmic energy"],
        description: "Listen for theatrical jazz energy"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const composers = COMPOSER_STYLES[mode as keyof typeof COMPOSER_STYLES];
  const composerData = composers[(round - 1) % composers.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${composerData.composerName}?`,
      options: [
        composerData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes the style of ${composerData.composerName}?`,
      options: [
        "No musical style",
        composerData.description,
        "Only percussion instruments",
        "Computer-generated beeps"
      ],
      correctAnswer: 1
    }
  ];
  
  const q = questions[round % 2];
  
  return {
    ...composerData,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  };
};

export const Listen003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "baroque-classical",
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
    { id: "baroque-classical", name: "Baroque & Classical", icon: <Clock size={20} />, color: "purple" },
    { id: "romantic-modern", name: "Romantic & Modern", icon: <Music size={20} />, color: "blue" },
    { id: "jazz-contemporary", name: "Jazz & Contemporary", icon: <User size={20} />, color: "green" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for composer demonstrations
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

  const playComposerExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the composer's style
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on composer characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Complex rhythms") || characteristics.includes("Jazz rhythms")) {
          duration = 0.3; // Shorter, more rhythmic
        } else if (characteristics.includes("Emotional melodies") || characteristics.includes("Lyrical melodies")) {
          duration = 0.8; // Longer, more expressive
        } else if (characteristics.includes("Dramatic contrasts")) {
          volume = volume * 1.2; // Slightly louder for dramatic effect
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
          ? "Brilliant! You understand this composer's unique style!" 
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

  const handleModeChange = (mode: "baroque-classical" | "romantic-modern" | "jazz-contemporary") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Composer Detective...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Composer Detective</h1>
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
                onClick={playComposerExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Composer Style
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
              Composer: {gameState.currentQuestion.composerName}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-indigo-900 mb-4">Composer Detective Challenge:</h3>
            <p className="text-indigo-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-300 cursor-pointer";
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
              <p className="text-gray-600">Composers Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Composer Study:</h4>
            <p className="text-sm text-gray-600">
              Learning about composers helps us understand how musical styles evolved over time. 
              Each composer developed a unique voice that reflected their era, culture, and personal vision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
