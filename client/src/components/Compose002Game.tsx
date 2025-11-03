import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, RotateCcw, CheckCircle, XCircle, Music, Palette, Instrument } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments, getInstrumentsByFamily } from "@/lib/instrumentLibrary";

interface GameState {
  currentMode: "orchestration" | "style";
  score: number;
  round: number;
  volume: number;
  selectedInstruments: string[];
  selectedStyle: string;
  gameStarted: boolean;
  feedback: { show: boolean; isCorrect: boolean; message: string; details?: string[] } | null;
  startTime: number;
}

const MUSICAL_STYLES = [
  { id: "classical", name: "Classical", description: "Elegant, formal orchestration", instruments: ["violin", "cello", "french-horn", "flute"] },
  { id: "romantic", name: "Romantic", description: "Emotional, expressive arrangements", instruments: ["violin", "cello", "oboe", "clarinet"] },
  { id: "baroque", name: "Baroque", description: "Ornate, intricate counterpoint", instruments: ["violin", "flute", "oboe", "trumpet"] },
  { id: "modern", name: "Modern", description: "Contemporary, experimental sounds", instruments: ["clarinet", "trumpet", "trombone", "xylophone"] },
];

const ORCHESTRATION_CHALLENGES = [
  {
    id: "string-quartet",
    title: "String Quartet",
    description: "Create a balanced string ensemble",
    requiredInstruments: ["violin", "cello"],
    maxInstruments: 4,
    allowedFamilies: ["strings"],
  },
  {
    id: "woodwind-ensemble",
    title: "Woodwind Ensemble",
    description: "Build a harmonious woodwind group",
    requiredInstruments: ["flute"],
    maxInstruments: 5,
    allowedFamilies: ["woodwinds"],
  },
  {
    id: "brass-fanfare",
    title: "Brass Fanfare",
    description: "Compose a powerful brass section",
    requiredInstruments: ["trumpet", "french-horn"],
    maxInstruments: 4,
    allowedFamilies: ["brass"],
  },
  {
    id: "full-orchestra",
    title: "Full Orchestra",
    description: "Create a complete symphonic ensemble",
    requiredInstruments: ["violin", "flute", "trumpet"],
    maxInstruments: 8,
    allowedFamilies: ["strings", "woodwinds", "brass"],
  },
];

export const Compose002Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "orchestration",
    score: 0,
    round: 1,
    volume: 70,
    selectedInstruments: [],
    selectedStyle: "",
    gameStarted: false,
    feedback: null,
    startTime: Date.now(),
  });

  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [usingSamples, setUsingSamples] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      await sampleAudioService.initialize();
      setGameState(prev => ({ ...prev, gameStarted: true }));
      
      // Load some sample instruments
      try {
        const sampleInstruments = ["violin", "cello", "flute", "trumpet"];
        for (const instrument of sampleInstruments) {
          const samples = instrumentLibrary.getSamples(instrument);
          for (const sample of samples) {
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
    };
    
    initializeGame();
  }, []);

  const currentChallenge = useMemo(() => {
    return ORCHESTRATION_CHALLENGES[(gameState.round - 1) % ORCHESTRATION_CHALLENGES.length];
  }, [gameState.round]);

  const playInstrument = useCallback(async (instrumentName: string, note: string = "C4") => {
    const sampleName = instrumentLibrary.getSampleName(instrumentName, note);
    const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);
    
    if (isSampleAvailable && usingSamples) {
      await sampleAudioService.playSample(sampleName, {
        volume: gameState.volume / 100,
        playbackRate: 1.0,
      });
    } else {
      // Fallback to synthesized audio
      const sample = instrumentLibrary.getSample(instrumentName, note);
      if (sample) {
        await sampleAudioService.playNote(sample.frequency, 1.0);
      }
    }
  }, [gameState.volume, usingSamples]);

  const playEnsemble = useCallback(async () => {
    if (gameState.selectedInstruments.length === 0) return;
    
    // Play instruments in sequence with slight overlap
    gameState.selectedInstruments.forEach((instrumentName, index) => {
      setTimeout(async () => {
        const instrument = instrumentLibrary.getInstrument(instrumentName);
        if (instrument && instrument.samples.length > 0) {
          // Use the first available sample
          await playInstrument(instrumentName, instrument.samples[0].note);
        }
      }, index * 200);
    });
  }, [gameState.selectedInstruments, playInstrument]);

  const handleInstrumentSelect = (instrumentName: string) => {
    if (gameState.selectedInstruments.includes(instrumentName)) {
      // Remove instrument
      setGameState(prev => ({
        ...prev,
        selectedInstruments: prev.selectedInstruments.filter(i => i !== instrumentName),
        feedback: null,
      }));
    } else if (gameState.selectedInstruments.length < currentChallenge.maxInstruments) {
      // Add instrument
      const instrument = instrumentLibrary.getInstrument(instrumentName);
      if (instrument && currentChallenge.allowedFamilies.includes(instrument.family)) {
        setGameState(prev => ({
          ...prev,
          selectedInstruments: [...prev.selectedInstruments, instrumentName],
          feedback: null,
        }));
        
        // Play a sample of the instrument
        playInstrument(instrumentName);
      }
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedStyle: styleId,
      feedback: null,
    }));
  };

  const validateOrchestration = useCallback(() => {
    const { requiredInstruments, allowedFamilies, maxInstruments } = currentChallenge;
    const selected = gameState.selectedInstruments;
    
    const hasAllRequired = requiredInstruments.every(req => selected.includes(req));
    const onlyAllowedFamilies = selected.every(inst => {
      const instrument = instrumentLibrary.getInstrument(inst);
      return instrument && allowedFamilies.includes(instrument.family);
    });
    const withinLimit = selected.length <= maxInstruments && selected.length >= 2;
    
    const isCorrect = hasAllRequired && onlyAllowedFamilies && withinLimit;
    
    let details: string[] = [];
    if (!hasAllRequired) {
      details.push(`Missing required instruments: ${requiredInstruments.filter(req => !selected.includes(req)).join(", ")}`);
    }
    if (!onlyAllowedFamilies) {
      details.push("Some instruments don't fit the allowed families");
    }
    if (!withinLimit) {
      details.push(selected.length > maxInstruments ? "Too many instruments selected" : "Need at least 2 instruments");
    }
    
    if (isCorrect) {
      details.push("Perfect orchestration!");
      const bonusPoints = Math.max(0, (maxInstruments - selected.length + 1) * 10);
      details.push(`Efficiency bonus: +${bonusPoints} points`);
    }
    
    return { isCorrect, details };
  }, [currentChallenge, gameState.selectedInstruments]);

  const validateStyle = useCallback(() => {
    const selectedStyle = MUSICAL_STYLES.find(s => s.id === gameState.selectedStyle);
    if (!selectedStyle) {
      return { isCorrect: false, details: ["Please select a musical style"] };
    }
    
    const hasRequiredInstruments = selectedStyle.instruments.some(req => 
      gameState.selectedInstruments.includes(req)
    );
    
    const isCorrect = hasRequiredInstruments && gameState.selectedInstruments.length >= 3;
    
    let details: string[] = [];
    if (!hasRequiredInstruments) {
      details.push(`Style "${selectedStyle.name}" needs instruments like: ${selectedStyle.instruments.join(", ")}`);
    }
    if (gameState.selectedInstruments.length < 3) {
      details.push("Need at least 3 instruments for a complete style");
    }
    
    if (isCorrect) {
      details.push(`Excellent ${selectedStyle.name} style!`);
      details.push(`Instruments match the ${selectedStyle.description.toLowerCase()} characteristics`);
    }
    
    return { isCorrect, details };
  }, [gameState.selectedStyle, gameState.selectedInstruments]);

  const handleSubmit = () => {
    const validation = gameState.currentMode === "orchestration" 
      ? validateOrchestration() 
      : validateStyle();
    
    const timeSpent = Date.now() - gameState.startTime;
    const baseScore = validation.isCorrect ? 100 : 0;
    const timeBonus = Math.max(0, Math.floor((30000 - timeSpent) / 1000)); // 30 second bonus
    const totalScore = baseScore + timeBonus;
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + totalScore,
      round: prev.round + 1,
      selectedInstruments: [],
      selectedStyle: "",
      feedback: {
        show: true,
        isCorrect: validation.isCorrect,
        message: validation.isCorrect 
          ? "Excellent work! Your composition is well-orchestrated." 
          : "Not quite right. Try again with different instruments.",
        details: validation.details,
      },
      startTime: Date.now(),
    }));
    
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 3000);
  };

  const handleClear = () => {
    setGameState(prev => ({
      ...prev,
      selectedInstruments: [],
      selectedStyle: "",
      feedback: null,
    }));
  };

  const handleModeChange = (mode: "orchestration" | "style") => {
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      selectedInstruments: [],
      selectedStyle: "",
      feedback: null,
      round: 1,
    }));
  };

  const availableInstruments = useMemo(() => {
    if (gameState.currentMode === "orchestration") {
      return getAllInstruments().filter(inst => 
        currentChallenge.allowedFamilies.includes(inst.family)
      );
    }
    return getAllInstruments();
  }, [gameState.currentMode, currentChallenge]);

  const renderOrchestrationMode = () => (
    <div>
      <div className="bg-blue-50 rounded-lg p-3 mb-3">
        <h3 className="font-bold text-blue-900 mb-1 text-sm">Challenge: {currentChallenge.title}</h3>
        <p className="text-blue-700 mb-2 text-xs">{currentChallenge.description}</p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>Required: {currentChallenge.requiredInstruments.join(", ")}</p>
          <p>Max instruments: {currentChallenge.maxInstruments}</p>
          <p>Allowed families: {currentChallenge.allowedFamilies.join(", ")}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 mb-3">
        <h3 className="font-bold mb-2 text-gray-700 flex items-center gap-2 text-sm">
          <Instrument size={16} /> Your Ensemble ({gameState.selectedInstruments.length}/{currentChallenge.maxInstruments}):
        </h3>
        <div className="min-h-[60px] bg-purple-50 rounded-lg p-2 mb-2">
          {gameState.selectedInstruments.length === 0 ? (
            <p className="text-gray-400 text-center text-xs">Click instruments below to build your ensemble</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {gameState.selectedInstruments.map((instrumentName, index) => {
                const instrument = instrumentLibrary.getInstrument(instrumentName);
                return (
                  <button
                    key={index}
                    onClick={() => handleInstrumentSelect(instrumentName)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors text-xs"
                  >
                    <span className="text-xs">{instrument?.emoji}</span>
                    {instrument?.displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <h3 className="font-bold mb-2 text-gray-700 text-sm">Available Instruments:</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {availableInstruments.map(instrument => {
            const isSelected = gameState.selectedInstruments.includes(instrument.name);
            const isDisabled = !isSelected && gameState.selectedInstruments.length >= currentChallenge.maxInstruments;
            
            return (
              <button
                key={instrument.name}
                onClick={() => handleInstrumentSelect(instrument.name)}
                disabled={isDisabled}
                className={`p-2 rounded-lg font-semibold shadow-md transition-all text-xs ${
                  isSelected 
                    ? "bg-purple-600 text-white" 
                    : isDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-purple-100 text-purple-700 border border-purple-300"
                }`}
              >
                <div className="text-lg mb-1">{instrument.emoji}</div>
                <div className="text-xs">{instrument.displayName}</div>
                <div className="text-xs opacity-75">{instrument.family}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={playEnsemble}
          disabled={gameState.selectedInstruments.length === 0}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          <Play size={16} /> Play
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          <RotateCcw size={16} /> Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={gameState.selectedInstruments.length < 2}
          className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );

  const renderStyleMode = () => (
    <div>
      <div className="bg-orange-50 rounded-lg p-3 mb-3">
        <h3 className="font-bold text-orange-900 mb-1 flex items-center gap-2 text-sm">
          <Palette size={16} /> Musical Style Challenge
        </h3>
        <p className="text-orange-700 text-xs">Select a musical style and choose instruments that match its characteristics</p>
      </div>

      <div className="bg-white rounded-lg p-3 mb-3">
        <h3 className="font-bold mb-2 text-gray-700 text-sm">Choose a Style:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {MUSICAL_STYLES.map(style => {
            const isSelected = gameState.selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`p-3 rounded-lg font-semibold shadow-md transition-all text-left text-xs ${
                  isSelected 
                    ? "bg-orange-600 text-white" 
                    : "bg-white hover:bg-orange-100 text-orange-700 border border-orange-300"
                }`}
              >
                <div className="font-bold mb-1">{style.name}</div>
                <div className="opacity-75 mb-1">{style.description}</div>
                <div className="text-xs">Typical: {style.instruments.join(", ")}</div>
              </button>
            );
          })}
        </div>

        {gameState.selectedStyle && (
          <>
            <h3 className="font-bold mb-2 text-gray-700 flex items-center gap-2 text-sm">
              <Music size={16} /> Your Instruments ({gameState.selectedInstruments.length}):
            </h3>
            <div className="min-h-[60px] bg-orange-50 rounded-lg p-2 mb-2">
              {gameState.selectedInstruments.length === 0 ? (
                <p className="text-gray-400 text-center text-xs">Select instruments that match your chosen style</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {gameState.selectedInstruments.map((instrumentName, index) => {
                    const instrument = instrumentLibrary.getInstrument(instrumentName);
                    return (
                      <button
                        key={index}
                        onClick={() => handleInstrumentSelect(instrumentName)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors text-xs"
                      >
                        <span className="text-xs">{instrument?.emoji}</span>
                        {instrument?.displayName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <h3 className="font-bold mb-2 text-gray-700 text-sm">All Available Instruments:</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {getAllInstruments().map(instrument => {
                const isSelected = gameState.selectedInstruments.includes(instrument.name);
                return (
                  <button
                    key={instrument.name}
                    onClick={() => handleInstrumentSelect(instrument.name)}
                    className={`p-2 rounded-lg font-semibold shadow-md transition-all text-xs ${
                      isSelected 
                        ? "bg-orange-600 text-white" 
                        : "bg-white hover:bg-orange-100 text-orange-700 border border-orange-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{instrument.emoji}</div>
                    <div className="text-xs">{instrument.displayName}</div>
                    <div className="text-xs opacity-75">{instrument.family}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={playEnsemble}
          disabled={gameState.selectedInstruments.length === 0}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          <Play size={16} /> Play
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          <RotateCcw size={16} /> Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!gameState.selectedStyle || gameState.selectedInstruments.length < 3}
          className="flex-1 min-w-[120px] bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-semibold shadow-md text-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!gameState.feedback?.show) return null;

    return (
      <div className={`rounded-lg p-3 mb-3 ${
        gameState.feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {gameState.feedback.isCorrect ? (
            <CheckCircle size={18} className="text-green-600" />
          ) : (
            <XCircle size={18} className="text-red-600" />
          )}
          <h3 className={`text-sm font-semibold ${
            gameState.feedback.isCorrect ? 'text-green-900' : 'text-red-900'
          }`}>
            {gameState.feedback.message}
          </h3>
        </div>
        
        {gameState.feedback.details && (
          <div className="space-y-1">
            {gameState.feedback.details.map((detail, index) => (
              <p key={index} className={`text-xs ${
                gameState.feedback.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {detail}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Loading Orchestration Studio...</h1>
          <p className="text-purple-700">Preparing orchestral samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-2 relative">
      <button
        onClick={() => setLocation("/")}
        className="absolute top-2 left-2 z-50 flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg hover:shadow-xl transition-all text-xs"
      >
        <ChevronLeft size={16} />
        Main Menu
      </button>
      
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-purple-900">Orchestration & Style Studio</h1>
        <div className="text-sm font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1 justify-center">
        <button
          onClick={() => handleModeChange("orchestration")}
          className={`px-3 py-2 rounded-lg font-semibold shadow-lg text-xs ${
            gameState.currentMode === "orchestration"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-600 hover:bg-purple-100"
          }`}
        >
          <Instrument size={16} className="inline mr-1" />
          ORCHESTRATION
        </button>
        <button
          onClick={() => handleModeChange("style")}
          className={`px-3 py-2 rounded-lg font-semibold shadow-lg text-xs ${
            gameState.currentMode === "style"
              ? "bg-orange-600 text-white"
              : "bg-white text-orange-600 hover:bg-orange-100"
          }`}
        >
          <Palette size={16} className="inline mr-1" />
          STYLE
        </button>
      </div>

      <div className="max-w-6xl mx-auto mb-3">
        <div className="bg-white rounded-lg shadow-lg p-3 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} className="text-purple-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-xs font-semibold text-gray-600 min-w-[35px]">{gameState.volume}%</span>
          </div>
          
          {samplesLoaded && (
            <div className={`text-xs p-1 rounded ${
              usingSamples ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {usingSamples ? '🎻 Using real orchestral samples!' : '🎹 Using synthesized audio'}
            </div>
          )}
        </div>

        {renderFeedback()}

        <div className="bg-white rounded-lg shadow-lg p-4 mb-2">
          <div className="text-center mb-3">
            <p className="text-gray-600 mb-1 text-xs">Round {gameState.round}</p>
            <p className="text-sm font-semibold text-purple-700">
              Mode: {gameState.currentMode.toUpperCase()}
            </p>
          </div>

          {gameState.currentMode === "orchestration" ? renderOrchestrationMode() : renderStyleMode()}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3">
          <h3 className="font-bold mb-2 text-sm">Stats</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600 text-xs">Round</p>
              <p className="text-lg font-bold text-purple-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Score</p>
              <p className="text-lg font-bold text-purple-600">{gameState.score}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
