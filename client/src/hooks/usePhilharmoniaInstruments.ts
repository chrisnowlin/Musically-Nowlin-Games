import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { instrumentLibrary, Instrument, InstrumentSample } from '@/lib/instrumentLibrary';
import { sampleAudioService } from '@/lib/sampleAudioService';

export interface PhilharmoniaOptions {
  volume?: number;
  duration?: number;
  playbackRate?: number;
  loop?: boolean;
}

export interface UsePhilharmoniaResult {
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  playInstrument: (instrumentName: string, options?: PhilharmoniaOptions) => Promise<void>;
  playNote: (instrumentName: string, note: string, options?: PhilharmoniaOptions) => Promise<void>;
  playMelody: (instrumentName: string, notes: string[], noteDuration?: number, options?: PhilharmoniaOptions) => Promise<void>;
  isInstrumentLoaded: (instrumentName: string) => boolean;
  loadedInstruments: string[];
  getInstrument: (name: string) => Instrument | undefined;
  getSamples: (name: string) => InstrumentSample[];
}

/**
 * React hook for integrating Philharmonia Orchestra samples into games
 *
 * @param instrumentNames - Array of instrument names to preload (e.g., ['flute', 'violin', 'trumpet'])
 * @param autoLoad - Whether to automatically load instruments on mount (default: true)
 *
 * @example
 * ```tsx
 * const { isLoading, playInstrument, playNote } = usePhilharmoniaInstruments(['flute', 'violin']);
 *
 * // Play first note of an instrument
 * await playInstrument('flute', { volume: 0.8 });
 *
 * // Play specific note
 * await playNote('flute', 'C5', { duration: 0.5 });
 * ```
 */
export function usePhilharmoniaInstruments(
  instrumentNames: string[],
  autoLoad: boolean = true
): UsePhilharmoniaResult {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadedInstruments, setLoadedInstruments] = useState<string[]>([]);
  const loadingRef = useRef(false);

  /**
   * Load samples for specified instruments
   */
  const loadInstruments = useCallback(async (names: string[]) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Calculate total samples to load
      const totalSamples = names.reduce((count, name) => {
        const samples = instrumentLibrary.getSamples(name);
        return count + samples.length;
      }, 0);

      if (totalSamples === 0) {
        // No samples found, games can proceed with synthesis fallback
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      let loadedCount = 0;
      const loadedInstrumentsList: string[] = [];
      let failedSamplesCount = 0;

      // Collect all samples to load
      const allSamplesToLoad: Array<{
        path: string;
        sampleName: string;
        instrumentName: string;
      }> = [];

      for (const instrumentName of names) {
        const samples = instrumentLibrary.getSamples(instrumentName);

        if (samples.length === 0) {
          continue;
        }

        for (const sample of samples) {
          // Use import.meta.env.BASE_URL for correct path resolution on GitHub Pages
          const basePath = import.meta.env.BASE_URL || '/';
          const path = `${basePath}audio/${sample.path}`;
          const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);
          allSamplesToLoad.push({ path, sampleName, instrumentName });
        }
      }

      // Load samples in parallel batches of 10 for faster loading
      const BATCH_SIZE = 10;
      const SAMPLE_TIMEOUT = 800; // 800ms timeout per sample (reduced from 3000ms)

      for (let i = 0; i < allSamplesToLoad.length; i += BATCH_SIZE) {
        const batch = allSamplesToLoad.slice(i, Math.min(i + BATCH_SIZE, allSamplesToLoad.length));

        // Load batch in parallel
        const batchResults = await Promise.allSettled(
          batch.map(({ path, sampleName }) =>
            Promise.race([
              sampleAudioService.loadSample(path, sampleName),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), SAMPLE_TIMEOUT)
              )
            ])
          )
        );

        // Process results
        batchResults.forEach((result, idx) => {
          const { sampleName, instrumentName } = batch[idx];

          if (result.status === 'fulfilled') {
            loadedCount++;
          } else {
            failedSamplesCount++;
          }

          // Track which instruments have been attempted
          if (!loadedInstrumentsList.includes(instrumentName)) {
            loadedInstrumentsList.push(instrumentName);
          }
        });

        // Update progress after each batch
        setLoadingProgress(((loadedCount + failedSamplesCount) / totalSamples) * 100);
      }

      // If most samples failed, games will use synthesized audio fallback

      setLoadedInstruments(loadedInstrumentsList);
      setIsLoading(false);
      loadingRef.current = false;
    } catch (err) {
      console.error('Error loading instruments:', err);
      // Don't block the game - allow synthesis fallback
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Memoize instrument names to prevent infinite re-renders when array is passed inline
  const instrumentNamesKey = useMemo(() => instrumentNames.join(','), [instrumentNames]);
  
  /**
   * Auto-load instruments on mount if enabled
   */
  useEffect(() => {
    if (autoLoad && instrumentNames.length > 0) {
      loadInstruments(instrumentNames);
    }
    // Use instrumentNamesKey (string) instead of instrumentNames (array) to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, instrumentNamesKey, loadInstruments]);

  /**
   * Play the first available note of an instrument
   */
  const playInstrument = useCallback(async (
    instrumentName: string,
    options: PhilharmoniaOptions = {}
  ): Promise<void> => {
    const samples = instrumentLibrary.getSamples(instrumentName);

    if (samples.length === 0) {
      return;
    }

    const firstSample = samples[0];
    return playNote(instrumentName, firstSample.note, options);
  }, []);

  /**
   * Play a specific note of an instrument
   */
  const playNote = useCallback(async (
    instrumentName: string,
    note: string,
    options: PhilharmoniaOptions = {}
  ): Promise<void> => {
    const sampleName = instrumentLibrary.getSampleName(instrumentName, note);

    if (sampleAudioService.isSampleLoaded(sampleName)) {
      // Play real sample
      await sampleAudioService.playSample(sampleName, {
        volume: options.volume ?? 1.0,
        duration: options.duration,
        playbackRate: options.playbackRate ?? 1.0,
        loop: options.loop ?? false,
      });
    } else {
      // Fallback to synthesized tone
      const sample = instrumentLibrary.getSample(instrumentName, note);
      if (sample) {
        await sampleAudioService.playNote(
          sample.frequency,
          options.duration ?? 0.5,
          options.volume ?? 1.0
        );
      }
    }
  }, []);

  /**
   * Play a melody (sequence of notes) with an instrument
   */
  const playMelody = useCallback(async (
    instrumentName: string,
    notes: string[],
    noteDuration: number = 0.5,
    options: PhilharmoniaOptions = {}
  ): Promise<void> => {
    for (const note of notes) {
      await playNote(instrumentName, note, {
        ...options,
        duration: noteDuration,
      });

      // Wait for note duration plus a small gap
      await new Promise(resolve => setTimeout(resolve, (noteDuration + 0.1) * 1000));
    }
  }, [playNote]);

  /**
   * Check if a specific instrument is loaded
   */
  const isInstrumentLoaded = useCallback((instrumentName: string): boolean => {
    return loadedInstruments.includes(instrumentName);
  }, [loadedInstruments]);

  /**
   * Get instrument metadata
   */
  const getInstrument = useCallback((name: string): Instrument | undefined => {
    return instrumentLibrary.getInstrument(name);
  }, []);

  /**
   * Get samples for an instrument
   */
  const getSamples = useCallback((name: string): InstrumentSample[] => {
    return instrumentLibrary.getSamples(name);
  }, []);

  return {
    isLoading,
    loadingProgress,
    error,
    playInstrument,
    playNote,
    playMelody,
    isInstrumentLoaded,
    loadedInstruments,
    getInstrument,
    getSamples,
  };
}

/**
 * Hook for loading instruments by family
 *
 * @example
 * ```tsx
 * const { playInstrument } = usePhilharmoniaFamily('woodwinds');
 * await playInstrument('flute');
 * ```
 */
export function usePhilharmoniaFamily(
  family: 'strings' | 'woodwinds' | 'brass' | 'percussion',
  autoLoad: boolean = true
): UsePhilharmoniaResult {
  const instruments = instrumentLibrary.getInstrumentsByFamily(family);
  const instrumentNames = instruments.map(inst => inst.name.toLowerCase());

  return usePhilharmoniaInstruments(instrumentNames, autoLoad);
}

/**
 * Hook for loading all available instruments
 *
 * @example
 * ```tsx
 * const { loadingProgress, playInstrument } = useAllPhilharmoniaInstruments();
 * ```
 */
export function useAllPhilharmoniaInstruments(
  autoLoad: boolean = false
): UsePhilharmoniaResult {
  const instruments = instrumentLibrary.getAllInstruments();
  const instrumentNames = instruments.map(inst => inst.name.toLowerCase());

  return usePhilharmoniaInstruments(instrumentNames, autoLoad);
}
