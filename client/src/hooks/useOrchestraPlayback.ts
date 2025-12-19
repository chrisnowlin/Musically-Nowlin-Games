/**
 * Animal Orchestra Conductor - Playback Hook
 * Manages audio playback, sample loading, and layer orchestration
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import type { PartId, OrchestraLayer, PresetArrangement } from "@/lib/aoc/types";

interface UseOrchestraPlaybackOptions {
  initialLayers: OrchestraLayer[];
}

interface UseOrchestraPlaybackReturn {
  // State
  layers: OrchestraLayer[];
  samplesLoaded: boolean;
  loadingProgress: number;
  usingSamples: boolean;
  masterVolume: number;
  tempo: number;

  // Setters
  setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
  setTempo: React.Dispatch<React.SetStateAction<number>>;
  setLayers: React.Dispatch<React.SetStateAction<OrchestraLayer[]>>;

  // Actions
  loadSamples: () => Promise<void>;
  toggleLayer: (layerId: string) => void;
  playAllLayers: () => void;
  stopAllLayers: () => void;
  updateLayerVolume: (layerId: string, newVolume: number) => void;
  updateLayerPart: (layerId: string, partId: PartId) => void;
  randomizeAllParts: () => void;
  applyPreset: (preset: PresetArrangement) => void;
}

export function useOrchestraPlayback({
  initialLayers,
}: UseOrchestraPlaybackOptions): UseOrchestraPlaybackReturn {
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [usingSamples, setUsingSamples] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [tempo, setTempo] = useState(100);
  const [layers, setLayers] = useState<OrchestraLayer[]>(initialLayers);

  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const animationFrameRef = useRef<Map<string, number>>(new Map());
  const isPlayingRef = useRef<Map<string, boolean>>(new Map());

  // Load audio samples for all instruments
  const loadSamples = useCallback(async () => {
    setLoadingProgress(10);

    try {
      const instrumentNames = [...new Set(layers.map(l => l.instrumentName))];
      let totalSamples = 0;
      let loadedSamples = 0;

      instrumentNames.forEach(name => {
        const samples = instrumentLibrary.getSamples(name);
        totalSamples += samples.length;
      });

      setLoadingProgress(20);

      for (const instrumentName of instrumentNames) {
        const samples = instrumentLibrary.getSamples(instrumentName);

        for (const sample of samples) {
          const path = `/audio/${sample.path}`;
          const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);

          try {
            await sampleAudioService.loadSample(path, sampleName);
            loadedSamples++;
            setLoadingProgress(20 + (loadedSamples / totalSamples) * 70);
          } catch {
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
    } catch {
      setUsingSamples(false);
      setSamplesLoaded(true);
    }
  }, [layers]);

  // Stop a layer's playback pattern
  const stopLayerPattern = useCallback((layerId: string) => {
    isPlayingRef.current.set(layerId, false);

    const interval = intervalsRef.current.get(layerId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(layerId);
    }

    const sourcesToStop: AudioBufferSourceNode[] = [];
    activeSourcesRef.current.forEach((source, key) => {
      if (key.startsWith(layerId)) {
        sourcesToStop.push(source);
        activeSourcesRef.current.delete(key);
      }
    });

    sourcesToStop.forEach(source => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });

    setLayers(prev => prev.map(l =>
      l.id === layerId
        ? { ...l, currentNoteIndex: 0 }
        : l
    ));
  }, []);

  // Play a layer's pattern
  const playLayerPattern = useCallback(async (layer: OrchestraLayer) => {
    stopLayerPattern(layer.id);
    isPlayingRef.current.set(layer.id, true);

    const currentVariation = layer.variations.find(v => v.id === layer.selectedPart);
    if (!currentVariation) return;

    let noteIndex = 0;
    // Higher tempo = faster = shorter intervals
    // tempo 100 = 1.0x (base), tempo 200 = 0.5x (faster), tempo 50 = 2.0x (slower)
    const tempoMultiplier = 100 / tempo;

    const playNextNote = async () => {
      if (!isPlayingRef.current.get(layer.id)) {
        return;
      }

      if (noteIndex < currentVariation.notes.length) {
        const note = currentVariation.notes[noteIndex];
        const baseDuration = currentVariation.pattern[noteIndex];
        const duration = (baseDuration * tempoMultiplier) / 1000;

        setLayers(prev => prev.map(l =>
          l.id === layer.id
            ? { ...l, currentNoteIndex: noteIndex }
            : l
        ));

        const volumeScale = (masterVolume / 100) * (layer.volume / 100);
        const sampleName = instrumentLibrary.getSampleName(layer.instrumentName, note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);

        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        if (isSampleAvailable && usingSamples) {
          const source = await sampleAudioService.playSample(sampleName, {
            volume: volumeScale,
            duration: duration
          });
          if (source) {
            if (!isPlayingRef.current.get(layer.id)) {
              try {
                source.stop();
              } catch {
                // Already stopped
              }
              return;
            }
            activeSourcesRef.current.set(`${layer.id}-${Date.now()}-${noteIndex}`, source);
          }
        } else {
          const sample = instrumentLibrary.getSample(layer.instrumentName, note);
          if (sample && isPlayingRef.current.get(layer.id)) {
            await sampleAudioService.playNote(sample.frequency, duration);
          }
        }

        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        noteIndex++;
        if (noteIndex >= currentVariation.notes.length) {
          noteIndex = 0;
        }
      }
    };

    await playNextNote();

    if (!isPlayingRef.current.get(layer.id)) {
      return;
    }

    const avgDuration = currentVariation.pattern.reduce((a, b) => a + b, 0) / currentVariation.pattern.length;
    const interval = setInterval(() => {
      if (!isPlayingRef.current.get(layer.id)) {
        clearInterval(interval);
        intervalsRef.current.delete(layer.id);
        return;
      }
      playNextNote();
    }, avgDuration * tempoMultiplier);
    intervalsRef.current.set(layer.id, interval);
  }, [usingSamples, tempo, masterVolume, stopLayerPattern]);

  // Update volume for a specific layer
  const updateLayerVolume = useCallback((layerId: string, newVolume: number) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const wasPlaying = layer.isPlaying;
          const updatedLayer = { ...layer, volume: newVolume };

          if (wasPlaying) {
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

  // Update part selection for a specific layer
  const updateLayerPart = useCallback((layerId: string, partId: PartId) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const wasPlaying = layer.isPlaying;
          const updatedLayer = { ...layer, selectedPart: partId };

          if (wasPlaying) {
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

  // Randomize all layer parts
  const randomizeAllParts = useCallback(() => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        const partPool = layer.variations.map(v => v.id);
        const randomPart = partPool[Math.floor(Math.random() * partPool.length)] ?? 'A';
        const wasPlaying = layer.isPlaying;
        const updatedLayer = { ...layer, selectedPart: randomPart };

        if (wasPlaying) {
          setTimeout(() => {
            playLayerPattern(updatedLayer);
          }, 0);
        }

        return updatedLayer;
      });
      return updated;
    });
  }, [playLayerPattern]);

  // Toggle a layer's playback
  const toggleLayer = useCallback((layerId: string) => {
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

  // Stop all layers
  const stopAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (layer.isPlaying) {
        stopLayerPattern(layer.id);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: false })));
  }, [layers, stopLayerPattern]);

  // Play all layers
  const playAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (!layer.isPlaying) {
        playLayerPattern(layer);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: true })));
  }, [layers, playLayerPattern]);

  // Apply a preset arrangement
  const applyPreset = useCallback((preset: PresetArrangement) => {
    stopAllLayers();
    setTempo(preset.tempo);

    setTimeout(() => {
      setLayers(prev => prev.map(layer => {
        const shouldPlay = Boolean((preset.layers as Record<string, boolean>)[layer.id]);
        const selectedPart = ((preset.parts as Record<string, PartId>)[layer.id] ?? 'A') as PartId;

        const updatedLayer = {
          ...layer,
          isPlaying: shouldPlay,
          selectedPart
        };

        if (shouldPlay) {
          playLayerPattern(updatedLayer);
        }

        return updatedLayer;
      }));
    }, 100);
  }, [playLayerPattern, stopAllLayers]);

  // Re-sync playback when tempo changes
  useEffect(() => {
    if (!samplesLoaded) return;

    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;

    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, samplesLoaded, playLayerPattern]);

  // Re-sync playback when master volume changes
  useEffect(() => {
    if (!samplesLoaded) return;

    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;

    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterVolume, samplesLoaded, playLayerPattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current.clear();
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch {
          // Already stopped
        }
      });
      activeSourcesRef.current.clear();
      animationFrameRef.current.forEach(frame => cancelAnimationFrame(frame));
      animationFrameRef.current.clear();
    };
  }, []);

  // Additional cleanup for intervals
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  return {
    // State
    layers,
    samplesLoaded,
    loadingProgress,
    usingSamples,
    masterVolume,
    tempo,

    // Setters
    setMasterVolume,
    setTempo,
    setLayers,

    // Actions
    loadSamples,
    toggleLayer,
    playAllLayers,
    stopAllLayers,
    updateLayerVolume,
    updateLayerPart,
    randomizeAllParts,
    applyPreset,
  };
}
