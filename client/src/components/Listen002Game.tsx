import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Radio, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "classical-periods" | "popular-genres" | "world-music";
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
  type: "period" | "genre" | "region";
  styleName: string;
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

const MUSICAL_STYLES = {
  "classical-periods": [
    {
      id: "baroque",
      styleName: "Baroque (1600-1750)",
      description: "Ornate, intricate counterpoint with harpsichord and strings",
      explanation: "Baroque music features complex counterpoint, ornamentation, and steady rhythm. Bach and Handel are key composers.",
      audioExample: {
        instruments: ["violin", "flute", "oboe", "trumpet"],
        characteristics: ["Complex counterpoint", "Ornate melodies", "Harpsichord-like texture"],
        description: "Listen for intricate interweaving melodies"
      }
    },
    {
      id: "classical",
      styleName: "Classical (1750-1820)",
      description: "Elegant, balanced forms with clear melodies and harmonies",
      explanation: "Classical music emphasizes clarity, balance, and formal structure. Mozart and Haydn exemplify this style.",
      audioExample: {
        instruments: ["violin", "cello", "flute", "french-horn"],
        characteristics: ["Clear melodies", "Balanced phrases", "Graceful rhythms"],
        description: "Listen for elegant, balanced phrases"
      }
    },
    {
      id: "romantic",
      styleName: "Romantic (1820-1900)",
      description: "Emotional, expressive music with rich harmonies and dynamics",
      explanation: "Romantic music emphasizes emotion, individual expression, and dramatic contrasts. Beethoven, Chopin, and Wagner are key figures.",
      audioExample: {
        instruments: ["violin", "cello", "oboe", "clarinet"],
        characteristics: ["Emotional melodies", "Rich harmonies", "Dynamic contrasts"],
        description: "Listen for passionate, expressive phrases"
      }
    }
  ],
  "popular-genres": [
    {
      id: "jazz",
      styleName: "Jazz",
      description: "Improvisation, swing rhythms, and blue notes",
      explanation: "Jazz features syncopated rhythms, improvisation, and blues influences. It originated in African American communities.",
      audioExample: {
        instruments: ["clarinet", "trumpet", "trombone", "xylophone"],
        characteristics: ["Swing rhythm", "Improvised melodies", "Blue notes"],
        description: "Listen for syncopated, swinging rhythms"
      }
    },
    {
      id: "blues",
      styleName: "Blues",
      description: "12-bar structure, soulful melodies, and expressive guitar",
      explanation: "Blues follows a 12-bar chord progression and features soulful, often melancholic melodies with blue notes.",
      audioExample: {
        instruments: ["clarinet", "trumpet", "cello"],
        characteristics: ["12-bar pattern", "Blue notes", "Expressive phrasing"],
        description: "Listen for the characteristic blues progression"
      }
    },
    {
      id: "folk",
      styleName: "Folk",
      description: "Traditional melodies, acoustic instruments, storytelling",
      explanation: "Folk music preserves cultural traditions through acoustic instruments and narrative lyrics passed down through generations.",
      audioExample: {
        instruments: ["violin", "flute", "oboe"],
        characteristics: ["Simple melodies", "Acoustic sound", "Storytelling feel"],
        description: "Listen for traditional, narrative melodies"
      }
    }
  ],
  "world-music": [
    {
      id: "african",
      styleName: "African Music",
      description: "Complex rhythms, call-and-response, percussion emphasis",
      explanation: "African music features complex polyrhythms, communal participation, and intricate percussion patterns.",
      audioExample: {
        instruments: ["xylophone", "trumpet", "trombone"],
        characteristics: ["Complex rhythms", "Call and response", "Percussion focus"],
        description: "Listen for intricate rhythmic patterns"
      }
    },
    {
      id: "indian",
      styleName: "Indian Classical",
      description: "Raga systems, intricate melodies, tabla rhythms",
      explanation: "Indian classical music uses ragas (melodic frameworks) and talas (rhythmic cycles) with emphasis on improvisation.",
      audioExample: {
        instruments: ["flute", "oboe", "xylophone"],
        characteristics: ["Ornamented melodies", "Complex rhythms", "Modal framework"],
        description: "Listen for ornamented, modal melodies"
      }
    },
    {
      id: "latin",
      styleName: "Latin American",
      description: "Syncopated rhythms, dance beats, vibrant percussion",
      explanation: "Latin music features syncopated rhythms, dance forms, and vibrant percussion with African and European influences.",
      audioExample: {
        instruments: ["trumpet", "trombone", "xylophone", "clarinet"],
        characteristics: ["Syncopated rhythms", "Dance feel", "Bright percussion"],
        description: "Listen for danceable, syncopated beats"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const styles = MUSICAL_STYLES[mode as keyof typeof MUSICAL_STYLES];
  const styleData = styles[(round - 1) % styles.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${styleData.styleName}?`,
      options: [
        styleData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${styleData.styleName}?`,
      options: [
        "No musical structure",
        styleData.description,
        "Only percussion instruments",
        "Computer-generated beeps"
      ],
      correctAnswer: 1
    }
  ];
  
  const q = questions[round % 2];
  
  return {
    ...styleData,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  };
};

export const Listen002Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "classical-periods",
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
    { id: "classical-periods", name: "Classical Periods", icon: <Music size={20} />, color: "purple" },
    { id: "popular-genres", name: "Popular Genres", icon: <Radio size={20} />, color: "blue" },
    { id: "world-music", name: "World Music", icon: <Globe size={20} />, color: "green" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for style demonstrations
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

  const playStyleExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the style
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Complex rhythms") || characteristics.includes("Syncopated rhythms")) {
          duration = 0.3; // Shorter, more rhythmic
        } else if (characteristics.includes("Emotional melodies") || characteristics.includes("Expressive phrasing")) {
          duration = 0.8; // Longer, more expressive
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
          ? "Excellent! You have a good ear for musical styles!" 
          : "Listen carefully to the characteristics and try again.",
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

  const handleModeChange = (mode: "classical-periods" | "popular-genres" | "world-music") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Musical Style Detective...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Musical Style Detective</h1>
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
                onClick={playStyleExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Style Example
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
              Style: {gameState.currentQuestion.styleName}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-orange-900 mb-4">Style Detective Challenge:</h3>
            <p className="text-orange-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-orange-100 text-orange-700 border-2 border-orange-300 cursor-pointer";
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
              <p className="text-gray-600">Styles Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Musical Styles:</h4>
            <p className="text-sm text-gray-600">
              Musical styles are like dialects - each has unique characteristics, instruments, and cultural contexts. 
              Learning to identify different styles enhances your appreciation and understanding of music's rich diversity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
