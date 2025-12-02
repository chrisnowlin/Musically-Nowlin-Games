import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Clock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "values" | "tuplets" | "conversion" | "speed-reading";
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
  type: "value" | "tuplet" | "conversion" | "speed";
  rhythmName: string;
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

const RHYTHM_CONCEPTS = {
  "values": [
    {
      id: "whole-note",
      rhythmName: "Whole Note",
      description: "Four beats of sound in 4/4 time (semibreve)",
      explanation: "A whole note lasts for four beats in common time, providing the foundation for rhythmic hierarchy.",
      audioExample: {
        instruments: ["cello", "french-horn"],
        characteristics: ["Four beats", "Sustained sound", "Foundation value"],
        description: "Listen for a sustained four-beat note"
      }
    },
    {
      id: "half-note",
      rhythmName: "Half Note",
      description: "Two beats of sound in 4/4 time (minim)",
      explanation: "A half note lasts for two beats, exactly half the duration of a whole note.",
      audioExample: {
        instruments: ["violin", "oboe"],
        characteristics: ["Two beats", "Medium duration", "Common value"],
        description: "Listen for a two-beat sustained note"
      }
    },
    {
      id: "quarter-note",
      rhythmName: "Quarter Note",
      description: "One beat of sound in 4/4 time (crotchet)",
      explanation: "A quarter note represents one beat in common time, the basic pulse unit.",
      audioExample: {
        instruments: ["flute", "clarinet"],
        characteristics: ["One beat", "Basic pulse", "Common value"],
        description: "Listen for a single beat note"
      }
    }
  ],
  "tuplets": [
    {
      id: "triplet",
      rhythmName: "Triplet",
      description: "Three notes played in the time of two notes of the same value",
      explanation: "Triplets divide a beat into three equal parts instead of the usual two, creating a flowing feel.",
      audioExample: {
        instruments: ["violin", "flute"],
        characteristics: ["Three in two", "Flowing feel", "Unequal division"],
        description: "Listen for three notes in the space of two"
      }
    },
    {
      id: "quintuplet",
      rhythmName: "Quintuplet",
      description: "Five notes played in the time of four notes of the same value",
      explanation: "Quintuplets create five equal notes in the space normally occupied by four, adding rhythmic complexity.",
      audioExample: {
        instruments: ["oboe", "clarinet"],
        characteristics: ["Five in four", "Complex rhythm", "Quick subdivision"],
        description: "Listen for five notes in the space of four"
      }
    },
    {
      id: "sextuplet",
      rhythmName: "Sextuplet",
      description: "Six notes played in the time of four notes of the same value",
      explanation: "Sextuplets create six equal notes in the space of four, often used for fast passages and ornaments.",
      audioExample: {
        instruments: ["trumpet", "trombone"],
        characteristics: ["Six in four", "Fast passage", "Ornamental figure"],
        description: "Listen for six rapid notes in the space of four"
      }
    }
  ],
  "conversion": [
    {
      id: "dotted-rhythm",
      rhythmName: "Dotted Note Values",
      description: "Adding a dot increases note duration by half (dotted half = 3 beats)",
      explanation: "A dot adds half the original value to a note, creating dotted rhythms that add syncopation and interest.",
      audioExample: {
        instruments: ["cello", "french-horn"],
        characteristics: ["Extended duration", "Syncopated feel", "Half-value addition"],
        description: "Listen for extended dotted note values"
      }
    },
    {
      id: "tie-rhythm",
      rhythmName: "Tied Notes",
      description: "Connecting notes of the same pitch to create longer durations",
      explanation: "Ties combine the duration of connected notes, allowing for rhythmic values not available as single notes.",
      audioExample: {
        instruments: ["violin", "flute"],
        characteristics: ["Connected duration", "Sustained sound", "Combined values"],
        description: "Listen for tied sustained notes"
      }
    },
    {
      id: "rest-values",
      rhythmName: "Rest Values",
      description: "Silences with specific durations corresponding to note values",
      explanation: "Rests create silence in music, with whole rests, half rests, and quarter rests matching their note counterparts.",
      audioExample: {
        instruments: ["oboe", "clarinet"],
        characteristics: ["Silent beats", "Rhythmic space", "Musical breathing"],
        description: "Listen for the spaces between notes"
      }
    }
  ],
  "speed-reading": [
    {
      id: "tempo-markings",
      rhythmName: "Tempo Markings",
      description: "Italian terms indicating speed (Largo, Adagio, Andante, Allegro)",
      explanation: "Tempo markings tell performers how fast to play, from very slow (Largo) to very fast (Presto).",
      audioExample: {
        instruments: ["cello", "violin"],
        characteristics: ["Speed indication", "Italian terms", "Performance guidance"],
        description: "Listen for different tempo speeds"
      }
    },
    {
      id: "metronome-marks",
      rhythmName: "Metronome Marks",
      description: "Exact beats per minute (♩=120 means 120 quarter notes per minute)",
      explanation: "Metronome marks provide precise tempo measurements, showing exactly how many beats occur per minute.",
      audioExample: {
        instruments: ["french-horn", "trumpet"],
        characteristics: ["Precise tempo", "Beats per minute", "Exact timing"],
        description: "Listen for precise metronomic timing"
      }
    },
    {
      id: "rhythm-reading",
      rhythmName: "Rhythm Reading",
      description: "Recognizing and performing rhythmic patterns at sight",
      explanation: "Rhythm reading skills allow musicians to instantly understand and perform complex rhythmic patterns.",
      audioExample: {
        instruments: ["flute", "oboe", "clarinet"],
        characteristics: ["Pattern recognition", "Sight reading", "Instant understanding"],
        description: "Listen for complex rhythmic patterns"
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const concepts = RHYTHM_CONCEPTS[mode as keyof typeof RHYTHM_CONCEPTS];
  const conceptData = concepts[(round - 1) % concepts.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${conceptData.rhythmName}?`,
      options: [
        conceptData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${conceptData.rhythmName}?`,
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

export const Rhythm004Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "values",
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
    { id: "values", name: "Note Values", icon: <Clock size={20} />, color: "purple" },
    { id: "tuplets", name: "Tuplets", icon: <Zap size={20} />, color: "blue" },
    { id: "conversion", name: "Conversions", icon: <Music size={20} />, color: "green" },
    { id: "speed-reading", name: "Speed Reading", icon: <Zap size={20} />, color: "orange" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for rhythm demonstrations
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

  const playRhythmExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics } = gameState.currentQuestion.audioExample;
    
    // Play a simplified demonstration of the rhythm concept
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        const sample = instrument.samples[0];
        const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
        
        // Vary the playing style based on rhythm characteristics
        let duration = 0.6;
        let volume = gameState.volume / 100;
        
        if (characteristics.includes("Four beats")) {
          duration = 1.6; // Long for whole note
        } else if (characteristics.includes("Two beats")) {
          duration = 0.8; // Medium for half note
        } else if (characteristics.includes("One beat")) {
          duration = 0.4; // Short for quarter note
        } else if (characteristics.includes("Three in two")) {
          duration = 0.27; // Short for triplet feel
        } else if (characteristics.includes("Five in four") || characteristics.includes("Six in four")) {
          duration = 0.2; // Very short for complex tuplets
        } else if (characteristics.includes("Extended duration")) {
          duration = 1.2; // Longer for dotted notes
        } else if (characteristics.includes("Fast passage")) {
          duration = 0.15; // Very fast for sextuplets
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
          ? "Excellent! You understand this rhythm concept!" 
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

  const handleModeChange = (mode: "values" | "tuplets" | "conversion" | "speed-reading") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Rhythm Notation Master...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Rhythm Notation Master</h1>
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
                onClick={playRhythmExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Rhythm Example
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
              Concept: {gameState.currentQuestion.rhythmName}
            </p>
          </div>

          <div className="bg-cyan-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-cyan-900 mb-4">Rhythm Notation Challenge:</h3>
            <p className="text-cyan-800 text-lg mb-4">{gameState.currentQuestion.question}</p>
            
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
                  buttonClass += "bg-white hover:bg-cyan-100 text-cyan-700 border-2 border-cyan-300 cursor-pointer";
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
            <h4 className="font-semibold text-gray-700 mb-2">About Rhythm Notation:</h4>
            <p className="text-sm text-gray-600">
              Rhythm notation is the written language of musical time. Understanding note values, tuplets, conversions, 
              and tempo markings helps you read, perform, and compose music with precision and artistic expression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
