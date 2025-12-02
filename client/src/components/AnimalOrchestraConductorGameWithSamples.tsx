import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, HelpCircle, Volume2, VolumeX, Music, Download, ChevronLeft, Gauge } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface OrchestraLayer {
  id: string;
  name: string;
  instrumentName: string;  // Key to instrumentLibrary
  animal: string;
  emoji: string;
  color: string;
  notes: string[];         // Note names (e.g., ['C2', 'E2'])
  pattern: number[];       // Duration in ms for each note
  isPlaying: boolean;
  volume: number;          // Per-layer volume (0-100)
  currentNoteIndex: number; // For pattern visualization
}

export default function AnimalOrchestraConductorGameWithSamples() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [usingSamples, setUsingSamples] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [tempo, setTempo] = useState(100); // Tempo multiplier (50-200%)

  const [layers, setLayers] = useState<OrchestraLayer[]>([
    {
      id: 'percussion',
      name: 'Percussion',
      instrumentName: 'timpani',
      animal: 'Elephant',
      emoji: '🐘',
      color: 'bg-purple-500',
      notes: ['C2', 'E2', 'C2', 'E2'],
      pattern: [400, 400, 400, 400],
      isPlaying: false,
      volume: 80,
      currentNoteIndex: 0,
    },
    {
      id: 'melody',
      name: 'Melody',
      instrumentName: 'flute',
      animal: 'Bird',
      emoji: '🐦',
      color: 'bg-blue-500',
      notes: ['C5', 'D5', 'E5', 'C5'],
      pattern: [400, 400, 400, 400],
      isPlaying: false,
      volume: 70,
      currentNoteIndex: 0,
    },
    {
      id: 'harmony',
      name: 'Harmony',
      instrumentName: 'cello',
      animal: 'Bear',
      emoji: '🐻',
      color: 'bg-green-500',
      notes: ['C3'],
      pattern: [1600],
      isPlaying: false,
      volume: 60,
      currentNoteIndex: 0,
    },
  ]);

  // Track active audio sources for proper cleanup
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const animationFrameRef = useRef<Map<string, number>>(new Map());
  const isPlayingRef = useRef<Map<string, boolean>>(new Map()); // Track if layer should be playing
  const decorativeOrbs = generateDecorativeOrbs();

  // Load samples using instrument library
  const loadSamples = useCallback(async () => {
    setLoadingProgress(10);

    try {
      // Collect all unique instruments needed
      const instrumentNames = [...new Set(layers.map(l => l.instrumentName))];

      let totalSamples = 0;
      let loadedSamples = 0;

      // Count total samples
      instrumentNames.forEach(name => {
        const samples = instrumentLibrary.getSamples(name);
        totalSamples += samples.length;
      });

      setLoadingProgress(20);

      // Load samples for each instrument
      for (const instrumentName of instrumentNames) {
        const samples = instrumentLibrary.getSamples(instrumentName);

        for (const sample of samples) {
          const path = `/audio/${sample.path}`;
          const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);

          try {
            await sampleAudioService.loadSample(path, sampleName);
            loadedSamples++;
            setLoadingProgress(20 + (loadedSamples / totalSamples) * 70);
          } catch (error) {
            // Silently fall back to synthesized audio
          }
        }
      }

      const totalLoaded = sampleAudioService.getLoadedSampleCount();
      setLoadingProgress(100);

      if (totalLoaded > 0) {
        setUsingSamples(true);
      } else {
        setUsingSamples(false);
      }

      setSamplesLoaded(true);
    } catch (error) {
      // Error loading samples, fall back to synthesized audio
      setUsingSamples(false);
      setSamplesLoaded(true);
    }
  }, [layers]);

  const stopLayerPattern = useCallback((layerId: string) => {
    // Set flag to false FIRST to prevent new notes from starting
    isPlayingRef.current.set(layerId, false);

    // Stop interval
    const interval = intervalsRef.current.get(layerId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(layerId);
    }

    // Stop ALL active audio sources for this layer
    const sourcesToStop: AudioBufferSourceNode[] = [];
    activeSourcesRef.current.forEach((source, key) => {
      if (key.startsWith(layerId)) {
        sourcesToStop.push(source);
        activeSourcesRef.current.delete(key);
      }
    });

    // Stop all sources
    sourcesToStop.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped or invalid state
      }
    });

    // Reset note index
    setLayers(prev => prev.map(l => 
      l.id === layerId 
        ? { ...l, currentNoteIndex: 0 }
        : l
    ));
  }, []);

  const playLayerPattern = useCallback(async (layer: OrchestraLayer) => {
    // Stop any existing playback for this layer first
    stopLayerPattern(layer.id);

    // Mark layer as playing
    isPlayingRef.current.set(layer.id, true);

    let noteIndex = 0;
    const tempoMultiplier = tempo / 100;

    const playNextNote = async () => {
      // Check if layer should still be playing
      if (!isPlayingRef.current.get(layer.id)) {
        return;
      }

      if (noteIndex < layer.notes.length) {
        const note = layer.notes[noteIndex];
        const baseDuration = layer.pattern[noteIndex];
        const duration = (baseDuration * tempoMultiplier) / 1000;

        // Update visual feedback
        setLayers(prev => prev.map(l => 
          l.id === layer.id 
            ? { ...l, currentNoteIndex: noteIndex }
            : l
        ));

        // Calculate volume with master and layer volume
        const volumeScale = (masterVolume / 100) * (layer.volume / 100);

        // Get sample name using instrument library
        const sampleName = instrumentLibrary.getSampleName(layer.instrumentName, note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);

        // Check again before playing (may have been stopped during async operations)
        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        if (isSampleAvailable && usingSamples) {
          // Play real sample
          const source = await sampleAudioService.playSample(sampleName, {
            volume: volumeScale,
            duration: duration
          });
          if (source) {
            // Double-check flag after async operation
            if (!isPlayingRef.current.get(layer.id)) {
              // Layer was stopped while we were loading, stop this source immediately
              try {
                source.stop();
              } catch (e) {
                // Already stopped or invalid state
              }
              return;
            }
            // Track source with unique key
            activeSourcesRef.current.set(`${layer.id}-${Date.now()}-${noteIndex}`, source);
          }
        } else {
          // Fallback to synthesized note
          const sample = instrumentLibrary.getSample(layer.instrumentName, note);
          if (sample && isPlayingRef.current.get(layer.id)) {
            await sampleAudioService.playNote(sample.frequency, duration);
          }
        }

        // Check again before scheduling next note
        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        noteIndex++;
        if (noteIndex >= layer.notes.length) {
          noteIndex = 0; // Loop the pattern
        }
      }
    };

    // Play first note immediately
    await playNextNote();

    // Only set up interval if still supposed to be playing
    if (!isPlayingRef.current.get(layer.id)) {
      return;
    }

    // Set up interval for subsequent notes with tempo adjustment
    const totalDuration = layer.pattern.reduce((a, b) => a + b, 0) * tempoMultiplier;
    const interval = setInterval(() => {
      // Double-check flag before each execution
      if (!isPlayingRef.current.get(layer.id)) {
        clearInterval(interval);
        intervalsRef.current.delete(layer.id);
        return;
      }
      playNextNote();
    }, totalDuration);
    intervalsRef.current.set(layer.id, interval);
  }, [usingSamples, tempo, masterVolume, stopLayerPattern]);

  // Update layer volume and restart if playing
  const updateLayerVolume = useCallback((layerId: string, newVolume: number) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const wasPlaying = layer.isPlaying;
          const updatedLayer = { ...layer, volume: newVolume };
          
          // Restart playback with new volume if it was playing
          if (wasPlaying) {
            // Use setTimeout to avoid state update conflicts
            setTimeout(() => {
              playLayerPattern(updatedLayer);
            }, 0);
          }
          
          return updatedLayer;
        }
        return layer;
      });
      return updated;
    });
  }, [playLayerPattern]);

  // Restart all playing layers when tempo changes
  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;
    
    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;
    
    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, gameStarted, samplesLoaded, playLayerPattern]);

  // Restart all playing layers when master volume changes (volume is calculated at play time)
  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;
    
    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;
    
    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterVolume, gameStarted, samplesLoaded, playLayerPattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set all flags to false first
      isPlayingRef.current.clear();
      
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      
      // Stop all audio sources
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      activeSourcesRef.current.clear();
      
      // Cancel animation frames
      animationFrameRef.current.forEach(frame => cancelAnimationFrame(frame));
      animationFrameRef.current.clear();
    };
  }, []);

  const toggleLayer = useCallback(async (layerId: string) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const newIsPlaying = !layer.isPlaying;

          if (newIsPlaying) {
            playLayerPattern(layer);
          } else {
            stopLayerPattern(layerId);
          }

          return { ...layer, isPlaying: newIsPlaying };
        }
        return layer;
      });
      return updated;
    });
  }, [playLayerPattern, stopLayerPattern]);

  const stopAllLayers = useCallback(() => {
    // Stop all layers
    layers.forEach(layer => {
      if (layer.isPlaying) {
        stopLayerPattern(layer.id);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: false })));
  }, [layers, stopLayerPattern]);

  const playAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (!layer.isPlaying) {
        playLayerPattern(layer);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: true })));
  }, [layers, playLayerPattern]);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-3 toggle layers
      if (e.key >= '1' && e.key <= '3') {
        const layerIndex = parseInt(e.key) - 1;
        if (layerIndex < layers.length) {
          toggleLayer(layers[layerIndex].id);
        }
        return;
      }

      // Space bar toggles all layers
      if (e.key === ' ') {
        e.preventDefault();
        const currentActiveLayers = layers.filter(l => l.isPlaying).length;
        if (currentActiveLayers === 0) {
          playAllLayers();
        } else {
          stopAllLayers();
        }
        return;
      }

      // Arrow keys adjust tempo
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTempo(prev => Math.max(50, prev - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTempo(prev => Math.min(200, prev + 5));
      }

      // +/- keys adjust master volume
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setMasterVolume(prev => Math.min(100, prev + 5));
      } else if (e.key === '-') {
        e.preventDefault();
        setMasterVolume(prev => Math.max(0, prev - 5));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, samplesLoaded, layers, toggleLayer, playAllLayers, stopAllLayers]);

  const handleStartGame = async () => {
    await sampleAudioService.initialize();
    setGameStarted(true);
    // Load samples in background
    loadSamples();
  };

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Animal Orchestra Conductor
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Control the orchestra with real instrument samples!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎭</span>
                <span>Start and stop different orchestra sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Layer Timpani, Flute, and Cello together</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎨</span>
                <span>Create your own musical arrangements!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎼</span>
                <span>Hear authentic Philharmonia Orchestra samples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎚️</span>
                <span>Adjust volume and tempo for each layer</span>
              </li>
            </ul>

            <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-semibold mb-2">🎻 Using Instrument Library:</p>
              <ul className="text-left space-y-1">
                <li>• Timpani 🐘 (Percussion)</li>
                <li>• Flute 🐦 (Melody)</li>
                <li>• Cello 🐻 (Harmony)</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Conducting!
          </Button>
        </div>
      </div>
    );
  }

  const activeLayers = layers.filter(l => l.isPlaying).length;

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>

      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full space-y-8">

        {/* Loading Status */}
        {!samplesLoaded && (
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center animate-pulse">
            <Download className="w-6 h-6 inline-block mr-2 animate-bounce" />
            <span>Loading orchestra samples... {Math.round(loadingProgress)}%</span>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Mode Indicator */}
        {samplesLoaded && (
          <div className={`p-3 rounded-lg text-sm font-semibold ${
            usingSamples
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
          }`}>
            {usingSamples ? (
              <>✨ Using real Philharmonia Orchestra samples!</>
            ) : (
              <>🎹 Using synthesized audio (add samples to hear real instruments)</>
            )}
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Animal Orchestra Conductor
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {activeLayers === 0 && "Tap the animals to start their parts!"}
            {activeLayers === 1 && "Great! Try adding another layer!"}
            {activeLayers === 2 && "Beautiful harmony! Add the final layer!"}
            {activeLayers === 3 && "🎉 Full orchestra! Amazing!"}
          </p>
        </div>

        {/* Master Controls */}
        <div className={`w-full max-w-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} space-y-4`}>
          <div className="flex flex-wrap gap-6 justify-center mb-4">
            <Button
              onClick={playAllLayers}
              disabled={activeLayers === 3 || !samplesLoaded}
              size="lg"
              className={`${playfulComponents.button.primary}`}
            >
              <Music className="w-5 h-5 mr-2" />
              Play All
            </Button>
            <Button
              onClick={stopAllLayers}
              disabled={activeLayers === 0}
              size="lg"
              variant="outline"
              className="border-2"
            >
              <VolumeX className="w-5 h-5 mr-2" />
              Stop All
            </Button>
          </div>

          {/* Master Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className={`${playfulTypography.body.medium} text-gray-700 dark:text-gray-300`}>
                  Master Volume
                </span>
              </div>
              <span className={`${playfulTypography.body.small} font-semibold text-gray-700 dark:text-gray-300 tabular-nums`}>
                {masterVolume}%
              </span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={(values) => setMasterVolume(values[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
              aria-label="Master volume"
            />
          </div>

          {/* Tempo Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className={`${playfulTypography.body.medium} text-gray-700 dark:text-gray-300`}>
                  Tempo
                </span>
              </div>
              <span className={`${playfulTypography.body.small} font-semibold text-gray-700 dark:text-gray-300 tabular-nums`}>
                {tempo}%
              </span>
            </div>
            <Slider
              value={[tempo]}
              onValueChange={(values) => setTempo(values[0])}
              min={50}
              max={200}
              step={5}
              className="w-full"
              aria-label="Tempo"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
        </div>

        {/* Orchestra Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {layers.map((layer) => {
            // Get instrument info from library
            const instrument = instrumentLibrary.getInstrument(layer.instrumentName);
            const totalPatternDuration = layer.pattern.reduce((a, b) => a + b, 0);

            return (
              <div
                key={layer.id}
                className={`${playfulShapes.rounded.container} ${playfulShapes.shadows.card} overflow-hidden transition-all duration-300 ${
                  layer.isPlaying
                    ? `${layer.color} text-white scale-105`
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Animal/Instrument Header */}
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    disabled={!samplesLoaded}
                    className="w-full text-center space-y-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <div className={`text-6xl transition-all duration-300 ${
                      layer.isPlaying ? 'animate-bounce' : ''
                    }`} style={{ animationDuration: '1s' }}>
                      {layer.emoji}
                    </div>
                    <div>
                      <h3 className={`${playfulTypography.headings.h3} mb-1`}>
                        {layer.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {instrument?.displayName || layer.animal}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {layer.isPlaying ? (
                        <>
                          <Music className="w-5 h-5" />
                          <span className="font-semibold">Playing</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-5 h-5 opacity-50" />
                          <span className="opacity-70">Tap to Play</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Pattern Visualization */}
                  <div className="pt-2 border-t border-white/20 dark:border-gray-600">
                    <div className="text-xs font-semibold mb-2 opacity-75">
                      Rhythm Pattern:
                    </div>
                    <div className="flex gap-1 justify-center">
                      {layer.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className={`h-8 rounded transition-all duration-200 ${
                            layer.isPlaying && idx === layer.currentNoteIndex
                              ? 'bg-white scale-110 shadow-lg'
                              : layer.isPlaying
                              ? 'bg-white/60'
                              : 'bg-white/30 dark:bg-gray-600'
                          }`}
                          style={{
                            width: `${(layer.pattern[idx] / totalPatternDuration) * 100}%`,
                            minWidth: '12px',
                          }}
                          title={`${note} (${layer.pattern[idx]}ms)`}
                        />
                      ))}
                    </div>
                    <div className="text-xs opacity-60 mt-1 text-center">
                      {layer.notes.join(' • ')}
                    </div>
                  </div>

                  {/* Per-Layer Volume Control */}
                  <div className="pt-2 border-t border-white/20 dark:border-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 opacity-75" />
                        <span className="text-xs font-semibold opacity-75">
                          Layer Volume
                        </span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {layer.volume}%
                      </span>
                    </div>
                    <Slider
                      value={[layer.volume]}
                      onValueChange={(values) => updateLayerVolume(layer.id, values[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                      aria-label={`${layer.name} volume`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Feedback */}
        <div className="text-center space-y-4 mt-4">
          <div className="flex justify-center gap-2">
            {layers.map(layer => (
              <div
                key={layer.id}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  layer.isPlaying ? layer.color : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Layers: {activeLayers} / 3
          </p>
        </div>

        {/* Debug Info */}
        {samplesLoaded && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
            <p>
              Samples loaded: {sampleAudioService.getLoadedSampleCount()} |
              Mode: {usingSamples ? 'Real Instruments ✨' : 'Synthesized 🎹'}
            </p>
            <p className="opacity-75">
              Instruments: {layers.map(l => l.instrumentName).join(', ')}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
              <p className="font-semibold mb-1">⌨️ Keyboard Shortcuts:</p>
              <p className="opacity-75">
                1-3: Toggle layers | Space: Play/Stop All | ←→: Tempo | +/-: Volume
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
