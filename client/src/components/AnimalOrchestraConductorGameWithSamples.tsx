import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Volume2, VolumeX, Music, Download, ChevronLeft } from "lucide-react";
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
}

export default function AnimalOrchestraConductorGameWithSamples() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [usingSamples, setUsingSamples] = useState(false);

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
    },
  ]);

  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const decorativeOrbs = generateDecorativeOrbs();

  // Load samples using instrument library
  const loadSamples = useCallback(async () => {
    console.log('🎵 Loading orchestra samples using Instrument Library...');
    setLoadingProgress(10);

    try {
      // Collect all unique instruments needed
      const instrumentNames = [...new Set(layers.map(l => l.instrumentName))];
      console.log('Instruments needed:', instrumentNames);

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
        console.log(`Loading ${samples.length} samples for ${instrumentName}`);

        for (const sample of samples) {
          const path = `/audio/${sample.path}`;
          const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);

          try {
            await sampleAudioService.loadSample(path, sampleName);
            loadedSamples++;
            setLoadingProgress(20 + (loadedSamples / totalSamples) * 70);
            console.log(`✅ Loaded: ${sampleName}`);
          } catch (error) {
            console.warn(`⚠️ Could not load ${sampleName}, will use fallback`);
          }
        }
      }

      const totalLoaded = sampleAudioService.getLoadedSampleCount();
      setLoadingProgress(100);

      if (totalLoaded > 0) {
        console.log(`✅ Successfully loaded ${totalLoaded} orchestra samples!`);
        setUsingSamples(true);
      } else {
        console.log('⚠️ No samples loaded, using synthesized audio');
        setUsingSamples(false);
      }

      setSamplesLoaded(true);
    } catch (error) {
      console.error('Error loading samples:', error);
      setUsingSamples(false);
      setSamplesLoaded(true);
    }
  }, [layers]);

  const playLayerPattern = useCallback(async (layer: OrchestraLayer) => {
    let noteIndex = 0;

    const playNextNote = async () => {
      if (noteIndex < layer.notes.length) {
        const note = layer.notes[noteIndex];
        const duration = layer.pattern[noteIndex] / 1000;

        // Get sample name using instrument library
        const sampleName = instrumentLibrary.getSampleName(layer.instrumentName, note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);

        if (isSampleAvailable && usingSamples) {
          // Play real sample
          console.log(`🎵 Playing sample: ${sampleName}`);
          await sampleAudioService.playSample(sampleName, {
            volume: 0.7,
            duration: duration
          });
        } else {
          // Fallback to synthesized note
          const sample = instrumentLibrary.getSample(layer.instrumentName, note);
          if (sample) {
            console.log(`🎹 Playing synthesized: ${sample.frequency}Hz`);
            await sampleAudioService.playNote(sample.frequency, duration);
          }
        }

        noteIndex++;
        if (noteIndex >= layer.notes.length) {
          noteIndex = 0; // Loop the pattern
        }
      }
    };

    // Clear any existing interval for this layer
    const existingInterval = intervalsRef.current.get(layer.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Play first note immediately
    await playNextNote();

    // Set up interval for subsequent notes
    const totalDuration = layer.pattern.reduce((a, b) => a + b, 0);
    const interval = setInterval(playNextNote, totalDuration);
    intervalsRef.current.set(layer.id, interval);
  }, [usingSamples]);

  const stopLayerPattern = useCallback((layerId: string) => {
    const interval = intervalsRef.current.get(layerId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(layerId);
    }
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
          onClick={() => setLocation("/")}
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
        onClick={() => setLocation("/")}
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
        <div className="flex gap-4">
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

        {/* Orchestra Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {layers.map((layer) => {
            // Get instrument info from library
            const instrument = instrumentLibrary.getInstrument(layer.instrumentName);

            return (
              <div
                key={layer.id}
                className={`${playfulShapes.rounded.container} ${playfulShapes.shadows.card} overflow-hidden transition-all duration-300 ${
                  layer.isPlaying
                    ? `${layer.color} text-white scale-105 animate-pulse`
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <button
                  onClick={() => toggleLayer(layer.id)}
                  disabled={!samplesLoaded}
                  className="w-full p-6 text-center space-y-4 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
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
                        <Volume2 className="w-5 h-5" />
                        <span className="font-semibold">Playing</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-5 h-5 opacity-50" />
                        <span className="opacity-70">Tap to Play</span>
                      </>
                    )}
                  </div>
                  {instrument && (
                    <div className="text-xs opacity-75">
                      {layer.notes.join(' - ')}
                    </div>
                  )}
                </button>
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
          </div>
        )}
      </div>
    </div>
  );
}
