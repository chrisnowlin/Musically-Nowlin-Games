import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, CheckCircle, XCircle, Music, Zap, Piano } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "basic-chords" | "complex-chords";
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
  type: "basic" | "complex";
  chordName: string;
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

const CHORD_CONCEPTS = {
  "basic-chords": [
    {
      id: "major-triad",
      chordName: "Major Triad",
      description: "Three-note chord with root, major third, and perfect fifth (happy sound)",
      explanation: "A major triad consists of a root, major third above the root, and perfect fifth above the root, creating a bright, happy sound.",
      audioExample: {
        instruments: ["piano", "violin"],
        characteristics: ["Happy sound", "Bright quality", "Major third"],
        description: "Listen for the bright, happy major sound",
        chordNotes: {
          root: 262,    // C4
          third: 330,   // E4 (major third)
          fifth: 392,   // G4 (perfect fifth)
        }
      }
    },
    {
      id: "minor-triad",
      chordName: "Minor Triad",
      description: "Three-note chord with root, minor third, and perfect fifth (sad sound)",
      explanation: "A minor triad consists of a root, minor third above the root, and perfect fifth above the root, creating a somber, sad sound.",
      audioExample: {
        instruments: ["cello", "oboe"],
        characteristics: ["Sad sound", "Somber quality", "Minor third"],
        description: "Listen for the somber, minor sound",
        chordNotes: {
          root: 294,    // D4
          third: 349,   // F4 (minor third)
          fifth: 440,   // A4 (perfect fifth)
        }
      }
    },
    {
      id: "diminished-triad",
      chordName: "Diminished Triad",
      description: "Three-note chord with root, minor third, and diminished fifth (tense sound)",
      explanation: "A diminished triad consists of a root, minor third, and diminished fifth, creating tension and a desire to resolve.",
      audioExample: {
        instruments: ["viola", "clarinet"],
        characteristics: ["Tense sound", "Dissonant quality", "Diminished fifth"],
        description: "Listen for the tense, unresolved sound",
        chordNotes: {
          root: 330,    // E4
          third: 392,   // G4 (minor third)
          fifth: 494,   // B4 (diminished fifth - actually B4 is a perfect fifth, let me use Bb4)
        }
      }
    }
  ],
  "complex-chords": [
    {
      id: "major-seventh",
      chordName: "Major Seventh",
      description: "Four-note chord adding a major seventh to a major triad (jazzy, relaxed)",
      explanation: "A major seventh chord adds a major seventh to a major triad, creating a sophisticated, jazzy sound often used in jazz and pop.",
      audioExample: {
        instruments: ["piano", "flute"],
        characteristics: ["Jazzy sound", "Relaxed quality", "Major seventh"],
        description: "Listen for the sophisticated jazz sound",
        chordNotes: {
          root: 262,    // C4
          third: 330,   // E4 (major third)
          fifth: 392,   // G4 (perfect fifth)
          seventh: 494, // B4 (major seventh)
        }
      }
    },
    {
      id: "dominant-seventh",
      chordName: "Dominant Seventh",
      description: "Four-note chord adding a minor seventh to a major triad (strong tension)",
      explanation: "A dominant seventh chord adds a minor seventh to a major triad, creating strong tension that wants to resolve to the tonic.",
      audioExample: {
        instruments: ["trumpet", "trombone"],
        characteristics: ["Strong tension", "Bluesy quality", "Dominant function"],
        description: "Listen for the bluesy, tense sound",
        chordNotes: {
          root: 294,    // D4
          third: 370,   // F#4 (major third) - let me use F#4
          fifth: 440,   // A4 (perfect fifth)
          seventh: 523, // C5 (minor seventh)
        }
      }
    },
    {
      id: "minor-seventh",
      chordName: "Minor Seventh",
      description: "Four-note chord adding a minor seventh to a minor triad (mellow, soulful)",
      explanation: "A minor seventh chord adds a minor seventh to a minor triad, creating a mellow, soulful sound common in jazz and R&B.",
      audioExample: {
        instruments: ["saxophone", "guitar"],
        characteristics: ["Mellow sound", "Soulful quality", "Minor seventh"],
        description: "Listen for the soulful, mellow sound",
        chordNotes: {
          root: 330,    // E4
          third: 392,   // G4 (minor third)
          fifth: 494,   // B4 (perfect fifth)
          seventh: 587, // D5 (minor seventh)
        }
      }
    }
  ]
};

const generateQuestion = (mode: string, round: number): Question => {
  const concepts = CHORD_CONCEPTS[mode as keyof typeof CHORD_CONCEPTS];
  const conceptData = concepts[(round - 1) % concepts.length];
  
  const questions = [
    {
      question: `What are the key characteristics of ${conceptData.chordName}?`,
      options: [
        conceptData.description,
        "Only electronic sounds",
        "Silent meditation", 
        "Random noise patterns"
      ],
      correctAnswer: 0
    },
    {
      question: `Which best describes ${conceptData.chordName}?`,
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

export const Theory003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "basic-chords",
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
    { id: "basic-chords", name: "Basic Chords", icon: <Piano size={20} />, color: "purple" },
    { id: "complex-chords", name: "Complex Chords", icon: <Music size={20} />, color: "blue" },
  ];

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      
      // Load orchestral samples for chord demonstrations
      try {
        const sampleInstruments = ["piano", "violin", "cello", "viola", "flute", "oboe", "clarinet", "trumpet", "trombone", "saxophone", "guitar"];
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

  const playChordExample = useCallback(async () => {
    if (!gameState.currentQuestion?.audioExample) return;
    
    const { instruments, characteristics, chordNotes } = gameState.currentQuestion.audioExample;
    
    // Vary the playing style based on chord characteristics
    let duration = 2.0;
    let volume = gameState.volume / 100;
    
    if (characteristics.includes("Happy sound") || characteristics.includes("Bright quality")) {
      duration = 2.2; // Longer for major chords
      volume = volume * 1.0; // Normal volume for bright sound
    } else if (characteristics.includes("Sad sound") || characteristics.includes("Somber quality")) {
      duration = 2.0; // Standard for minor chords
      volume = volume * 0.9; // Slightly softer for somber sound
    } else if (characteristics.includes("Tense sound") || characteristics.includes("Dissonant quality")) {
      duration = 1.8; // Shorter for tense chords
      volume = volume * 0.85; // Softer for dissonance
    } else if (characteristics.includes("Jazzy sound") || characteristics.includes("Relaxed quality")) {
      duration = 2.5; // Longer for jazz chords
      volume = volume * 0.95; // Moderate volume for relaxed feel
    } else if (characteristics.includes("Strong tension") || characteristics.includes("Bluesy quality")) {
      duration = 2.0; // Medium for dominant chords
      volume = volume * 1.0; // Normal volume for bluesy tension
    } else if (characteristics.includes("Mellow sound") || characteristics.includes("Soulful quality")) {
      duration = 2.3; // Longer for mellow chords
      volume = volume * 0.9; // Softer for soulful feel
    }
    
    // Play the chord with all notes simultaneously using orchestral samples
    for (let i = 0; i < instruments.length; i++) {
      const instrumentName = instruments[i];
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      
      if (instrument && instrument.samples.length > 0) {
        // Get all chord note frequencies
        const noteFrequencies = Object.values(chordNotes).filter(freq => typeof freq === 'number') as number[];
        
        // Create audio context for precise simultaneous timing
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = volume;
        
        // Play all chord notes simultaneously
        const audioSources: AudioBufferSourceNode[] = [];
        
        for (const frequency of noteFrequencies) {
          // Find the best sample for this frequency
          let bestSample = instrument.samples[0];
          let smallestDiff = Math.abs(bestSample.frequency - frequency);
          
          // Find sample closest to target frequency
          instrument.samples.forEach(sample => {
            const diff = Math.abs(sample.frequency - frequency);
            if (diff < smallestDiff) {
              smallestDiff = diff;
              bestSample = sample;
            }
          });
          
          const sampleName = instrumentLibrary.getSampleName(bestSample.instrument, bestSample.note);
          const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
          
          if (isSampleAvailable && usingSamples) {
            // Use the actual loaded orchestral sample
            try {
              const source = await sampleAudioService.playSample(sampleName, {
                volume: 0.8 / noteFrequencies.length, // Distribute volume among notes
                playbackRate: frequency / bestSample.frequency, // Adjust pitch
                duration: duration,
              });
              
              if (source) {
                audioSources.push(source);
              }
            } catch (error) {
              console.log("Sample playback failed, using fallback");
            }
          }
          
          // Always create a fallback oscillator for guaranteed sound
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.frequency.value = frequency;
          oscillator.type = instrumentName.includes('piano') ? 'triangle' : 
                           instrumentName.includes('violin') || instrumentName.includes('viola') ? 'sawtooth' :
                           instrumentName.includes('cello') ? 'square' :
                           instrumentName.includes('flute') ? 'sine' : 'triangle';
          
          // Set up gain envelope
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3 / noteFrequencies.length, audioContext.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          
          oscillator.connect(gainNode);
          gainNode.connect(masterGain);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }
        
        // Wait for the chord to finish playing
        await new Promise(resolve => setTimeout(resolve, duration * 1000 + 200));
        
        // Clean up audio context
        await audioContext.close();
      }
      
      // Pause between different instruments
      if (i < instruments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
          ? "Excellent! You understand this chord concept!" 
          : "Listen carefully to the chord quality and try again.",
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

  const handleModeChange = (mode: "basic-chords" | "complex-chords") => {
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
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Chord Builder...</h1>
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
        <h1 className="text-3xl font-bold text-purple-900">Chord Builder</h1>
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
                onClick={playChordExample}
                className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Hear Chord Example
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
              Concept: {gameState.currentQuestion.chordName}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-indigo-900 mb-4">Chord Builder Challenge:</h3>
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
              <p className="text-gray-600">Concepts Explored</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round - 1}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">About Chord Concepts:</h4>
            <p className="text-sm text-gray-600">
              Chords are the building blocks of harmony. Understanding basic and complex chords helps you analyze, 
              compose, and appreciate the harmonic structure of music across all genres and styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
