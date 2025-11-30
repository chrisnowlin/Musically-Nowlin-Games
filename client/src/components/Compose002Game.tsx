import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, RotateCcw, CheckCircle, XCircle, Music, Palette } from "lucide-react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary, getAllInstruments, getInstrumentsByFamily } from "@/lib/instrumentLibrary";
import { ResponsiveGameLayout, GameSection, ResponsiveGrid } from "@/components/ResponsiveGameLayout";
import { useViewport, useResponsiveLayout } from "@/hooks/useViewport";
import { playfulColors, playfulShapes, playfulComponents, playfulTypography } from "@/theme/playful";
import { Button } from "@/components/ui/button";

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
  const layout = useResponsiveLayout();
  const { isMobile } = layout.device;
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
    <div className="space-y-4">
      <div className={`${playfulComponents.card.base} bg-blue-50 p-3 sm:p-4`}>
        <h3 className="font-bold text-blue-900 mb-1 text-sm sm:text-base">Challenge: {currentChallenge.title}</h3>
        <p className="text-blue-700 mb-2 text-xs sm:text-sm">{currentChallenge.description}</p>
        <div className="text-xs sm:text-sm text-blue-600 space-y-1 bg-white/50 p-2 rounded-lg">
          <p><span className="font-semibold">Required:</span> {currentChallenge.requiredInstruments.join(", ")}</p>
          <p><span className="font-semibold">Max instruments:</span> {currentChallenge.maxInstruments}</p>
          <p><span className="font-semibold">Allowed families:</span> {currentChallenge.allowedFamilies.join(", ")}</p>
        </div>
      </div>

      <div className={`${playfulComponents.card.base} p-3 sm:p-4`}>
        <h3 className="font-bold mb-2 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
          <Music size={18} /> Your Ensemble ({gameState.selectedInstruments.length}/{currentChallenge.maxInstruments}):
        </h3>
        <div className="min-h-[80px] bg-purple-50 rounded-xl p-3 mb-4 border-2 border-dashed border-purple-200 transition-all">
          {gameState.selectedInstruments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-4 text-gray-400">
              <Music size={24} className="mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Click instruments below to build your ensemble</p>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {gameState.selectedInstruments.map((instrumentName, index) => {
                const instrument = instrumentLibrary.getInstrument(instrumentName);
                return (
                  <button
                    key={`${index}-${instrumentName}`}
                    onClick={() => handleInstrumentSelect(instrumentName)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm animate-in fade-in zoom-in duration-200"
                  >
                    <span className="text-base">{instrument?.emoji}</span>
                    {instrument?.displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <h3 className="font-bold mb-2 text-gray-700 text-sm sm:text-base">Available Instruments:</h3>
        <ResponsiveGrid columns={isMobile ? 3 : 4} className="gap-2">
          {availableInstruments.map(instrument => {
            const isSelected = gameState.selectedInstruments.includes(instrument.name);
            const isDisabled = !isSelected && gameState.selectedInstruments.length >= currentChallenge.maxInstruments;
            
            return (
              <button
                key={instrument.name}
                onClick={() => handleInstrumentSelect(instrument.name)}
                disabled={isDisabled}
                className={`p-2 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm flex flex-col items-center justify-center aspect-square sm:aspect-auto sm:h-auto ${
                  isSelected 
                    ? "bg-purple-600 text-white scale-95 ring-2 ring-purple-300" 
                    : isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    : "bg-white hover:bg-purple-50 text-purple-900 border border-purple-100 hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1 transform transition-transform group-hover:scale-110">{instrument.emoji}</div>
                <div className="text-[10px] sm:text-xs text-center leading-tight">{instrument.displayName}</div>
              </button>
            );
          })}
        </ResponsiveGrid>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 sticky bottom-0 bg-white/95 backdrop-blur p-2 -mx-2 sm:mx-0 border-t sm:border-none border-gray-100 z-10">
        <Button
          onClick={playEnsemble}
          disabled={gameState.selectedInstruments.length === 0}
          className={`flex-1 ${playfulColors.gradients.buttonSuccess} text-white shadow-md`}
        >
          <Play size={16} className="mr-1" /> Play
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          <RotateCcw size={16} className="mr-1" /> Clear
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={gameState.selectedInstruments.length < 2}
          className={`flex-1 ${playfulColors.gradients.buttonPrimary} text-white shadow-md`}
        >
          Submit
        </Button>
      </div>
    </div>
  );

  const renderStyleMode = () => (
    <div className="space-y-4">
      <div className={`${playfulComponents.card.base} bg-orange-50 p-3 sm:p-4`}>
        <h3 className="font-bold text-orange-900 mb-1 flex items-center gap-2 text-sm sm:text-base">
          <Palette size={18} /> Musical Style Challenge
        </h3>
        <p className="text-orange-700 text-xs sm:text-sm">Select a musical style and choose instruments that match its characteristics</p>
      </div>

      <div className={`${playfulComponents.card.base} p-3 sm:p-4`}>
        <h3 className="font-bold mb-2 text-gray-700 text-sm sm:text-base">Choose a Style:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {MUSICAL_STYLES.map(style => {
            const isSelected = gameState.selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`p-3 rounded-xl font-semibold shadow-sm transition-all text-left text-xs sm:text-sm ${
                  isSelected 
                    ? "bg-orange-600 text-white ring-2 ring-orange-300" 
                    : "bg-white hover:bg-orange-50 text-orange-900 border border-orange-200 hover:border-orange-300"
                }`}
              >
                <div className="font-bold mb-1 text-base">{style.name}</div>
                <div className={`mb-1 ${isSelected ? 'text-white/90' : 'text-orange-700/80'}`}>{style.description}</div>
                <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-orange-600/60'}`}>Typical: {style.instruments.join(", ")}</div>
              </button>
            );
          })}
        </div>

        {gameState.selectedStyle && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                <Music size={18} /> Your Instruments ({gameState.selectedInstruments.length}):
              </h3>
              <div className="min-h-[80px] bg-orange-50 rounded-xl p-3 mb-2 border-2 border-dashed border-orange-200">
                {gameState.selectedInstruments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-2 text-gray-400">
                     <p className="text-xs sm:text-sm">Select instruments that match your chosen style</p>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {gameState.selectedInstruments.map((instrumentName, index) => {
                      const instrument = instrumentLibrary.getInstrument(instrumentName);
                      return (
                        <button
                          key={`${index}-${instrumentName}`}
                          onClick={() => handleInstrumentSelect(instrumentName)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm animate-in zoom-in duration-200"
                        >
                          <span className="text-base">{instrument?.emoji}</span>
                          {instrument?.displayName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <h3 className="font-bold mb-2 text-gray-700 text-sm sm:text-base">All Available Instruments:</h3>
            <ResponsiveGrid columns={isMobile ? 3 : 4} className="gap-2">
              {getAllInstruments().map(instrument => {
                const isSelected = gameState.selectedInstruments.includes(instrument.name);
                return (
                  <button
                    key={instrument.name}
                    onClick={() => handleInstrumentSelect(instrument.name)}
                    className={`p-2 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm flex flex-col items-center justify-center aspect-square sm:aspect-auto sm:h-auto ${
                      isSelected 
                        ? "bg-orange-600 text-white scale-95 ring-2 ring-orange-300" 
                        : "bg-white hover:bg-orange-50 text-orange-900 border border-orange-100 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1 transform transition-transform group-hover:scale-110">{instrument.emoji}</div>
                    <div className="text-[10px] sm:text-xs text-center leading-tight">{instrument.displayName}</div>
                  </button>
                );
              })}
            </ResponsiveGrid>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 sticky bottom-0 bg-white/95 backdrop-blur p-2 -mx-2 sm:mx-0 border-t sm:border-none border-gray-100 z-10">
        <Button
          onClick={playEnsemble}
          disabled={gameState.selectedInstruments.length === 0}
          className={`flex-1 ${playfulColors.gradients.buttonSuccess} text-white shadow-md`}
        >
          <Play size={16} className="mr-1" /> Play
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          <RotateCcw size={16} className="mr-1" /> Clear
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!gameState.selectedStyle || gameState.selectedInstruments.length < 3}
          className={`flex-1 ${playfulColors.gradients.buttonPrimary} text-white shadow-md`}
        >
          Submit
        </Button>
      </div>
    </div>
  );

  const renderFeedback = () => {
    const { feedback } = gameState;
    if (!feedback?.show) return null;

    return (
      <div className={`p-4 mb-4 rounded-xl animate-in slide-in-from-top-2 ${
        feedback.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {feedback.isCorrect ? (
            <div className="bg-green-100 p-1.5 rounded-full">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          ) : (
            <div className="bg-red-100 p-1.5 rounded-full">
              <XCircle size={20} className="text-red-600" />
            </div>
          )}
          <h3 className={`font-bold text-base ${
            feedback.isCorrect ? 'text-green-900' : 'text-red-900'
          }`}>
            {feedback.message}
          </h3>
        </div>
        
        {feedback.details && (
          <div className="pl-11 space-y-1.5">
            {feedback.details.map((detail, index) => (
              <p key={index} className={`text-sm ${
                feedback.isCorrect ? 'text-green-800' : 'text-red-800'
              } flex items-start gap-2`}>
                <span className="opacity-50 mt-1.5 text-[8px]">●</span>
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
      <ResponsiveGameLayout showDecorations={true}>
        <GameSection variant="main" fillSpace>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className={`${playfulTypography.headings.h1} mb-4 text-purple-900`}>Loading Orchestration Studio...</h1>
            <p className="text-purple-700 text-lg animate-pulse">Preparing orchestral samples...</p>
          </div>
        </GameSection>
      </ResponsiveGameLayout>
    );
  }

  return (
    <ResponsiveGameLayout showDecorations={true}>
      <GameSection variant="header">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 text-purple-700 hover:text-purple-900"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Main Menu</span>
          </Button>
          
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-900 truncate mx-2`}>
            {isMobile ? "Orchestration Studio" : "Orchestration & Style Studio"}
          </h1>
          
          <div className={`${playfulComponents.card.base} px-3 py-1 bg-purple-100 text-purple-900 font-bold text-sm whitespace-nowrap`}>
            Score: {gameState.score}
          </div>
        </div>

        <div className="flex justify-center mt-2 gap-2">
           <button
            onClick={() => handleModeChange("orchestration")}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200 flex items-center gap-1 ${
              gameState.currentMode === "orchestration"
                ? "bg-purple-600 text-white shadow-md scale-105"
                : "bg-white/50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            <Music size={14} />
            ORCHESTRATION
          </button>
          <button
            onClick={() => handleModeChange("style")}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200 flex items-center gap-1 ${
              gameState.currentMode === "style"
                ? "bg-orange-600 text-white shadow-md scale-105"
                : "bg-white/50 text-orange-600 hover:bg-orange-100"
            }`}
          >
            <Palette size={14} />
            STYLE
          </button>
        </div>
      </GameSection>

      <GameSection variant="main" fillSpace>
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 h-full overflow-y-auto p-1">
          {/* Volume Control */}
          <div className={`${playfulComponents.card.base} p-2 flex items-center justify-between bg-white/90 backdrop-blur-sm`}>
            <div className="flex items-center gap-3 flex-1">
              <Volume2 size={18} className="text-purple-600" />
              <input
                type="range"
                min="0"
                max="100"
                value={gameState.volume}
                onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs font-bold text-purple-900 w-8">{gameState.volume}%</span>
            </div>
            {samplesLoaded && (
              <div className={`hidden sm:block ml-4 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                usingSamples ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {usingSamples ? '🎻 Real Samples' : '🎹 Synth Audio'}
              </div>
            )}
          </div>

          {renderFeedback()}

          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-3 sm:p-4 overflow-y-auto">
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
                Round {gameState.round}
              </div>
            </div>

            {gameState.currentMode === "orchestration" ? renderOrchestrationMode() : renderStyleMode()}
          </div>
        </div>
      </GameSection>
    </ResponsiveGameLayout>
  );
};
