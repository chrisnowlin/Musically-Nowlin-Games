import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Volume2, VolumeX, Music, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface OrchestraLayer {
  id: string;
  name: string;
  animal: string;
  emoji: string;
  color: string;
  pattern: number[];
  notes: number[];
  isPlaying: boolean;
}

export default function AnimalOrchestraConductorGame() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [layers, setLayers] = useState<OrchestraLayer[]>([
    {
      id: 'percussion',
      name: 'Percussion',
      animal: 'Elephant',
      emoji: '🐘',
      color: 'bg-purple-500',
      pattern: [400, 400, 400, 400], // Quarter notes
      notes: [200, 200, 200, 200], // Low drum sound
      isPlaying: false,
    },
    {
      id: 'melody',
      name: 'Melody',
      animal: 'Bird',
      emoji: '🐦',
      color: 'bg-blue-500',
      pattern: [400, 400, 400, 400],
      notes: [523, 587, 659, 523], // C D E C melody
      isPlaying: false,
    },
    {
      id: 'harmony',
      name: 'Harmony',
      animal: 'Bear',
      emoji: '🐻',
      color: 'bg-green-500',
      pattern: [1600], // Whole note
      notes: [262], // Low C harmony
      isPlaying: false,
    },
  ]);

  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const decorativeOrbs = generateDecorativeOrbs();

  const playLayerPattern = useCallback(async (layer: OrchestraLayer) => {
    let noteIndex = 0;

    const playNextNote = async () => {
      if (noteIndex < layer.notes.length) {
        const freq = layer.notes[noteIndex];
        const duration = layer.pattern[noteIndex] / 1000;

        // Play note without waiting for completion
        audioService.playNote(freq, duration);

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
  }, []);

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
            // Start playing
            playLayerPattern(layer);
          } else {
            // Stop playing
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
    // Cleanup on unmount
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
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
              Control the orchestra layers!
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
                <span>Layer percussion, melody, and harmony together</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎨</span>
                <span>Create your own musical arrangements!</span>
              </li>
            </ul>
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
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>

      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full space-y-8">
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
            disabled={activeLayers === 3}
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
          {layers.map((layer) => (
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
                className="w-full p-6 text-center space-y-4 hover:opacity-90 transition-opacity"
              >
                <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
                  {layer.emoji}
                </div>
                <div>
                  <h3 className={`${playfulTypography.headings.h3} mb-1`}>
                    {layer.name}
                  </h3>
                  <p className="text-sm opacity-90">{layer.animal}</p>
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
              </button>
            </div>
          ))}
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
      </div>
    </div>
  );
}
