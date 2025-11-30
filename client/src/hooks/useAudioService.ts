import { useEffect, useState, useCallback } from 'react';
import { audioService, AudioError } from '@/lib/audioService';

/**
 * Custom hook for using the singleton AudioService
 * 
 * Provides a consistent interface for audio playback across all game components.
 * Automatically initializes audio on mount and handles cleanup.
 * 
 * @returns Object containing audio service instance, initialization state, and error
 * 
 * @example
 * ```tsx
 * function MyGame() {
 *   const { audio, isReady, error, initialize } = useAudioService();
 *   
 *   const handlePlay = async () => {
 *     if (!isReady) {
 *       await initialize();
 *     }
 *     await audio.playNote(440, 1.0);
 *   };
 *   
 *   if (error) {
 *     return <AudioErrorFallback error={error} onRetry={initialize} />;
 *   }
 *   
 *   return <button onClick={handlePlay}>Play</button>;
 * }
 * ```
 */
export function useAudioService() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize audio service
   * Should be called on user interaction (e.g., button click)
   */
  const initialize = useCallback(async () => {
    try {
      await audioService.initialize();
      setIsReady(audioService.isAvailable());
      setError(audioService.getInitializationError());
    } catch (err) {
      const audioError = err instanceof AudioError ? err : new AudioError('Failed to initialize audio');
      setError(audioError);
      setIsReady(false);
    }
  }, []);

  /**
   * Check if audio is available on mount
   */
  useEffect(() => {
    const available = audioService.isAvailable();
    const initError = audioService.getInitializationError();
    
    setIsReady(available);
    setError(initError);
  }, []);

  return {
    /**
     * The singleton audio service instance
     */
    audio: audioService,
    
    /**
     * Whether audio is initialized and ready to use
     */
    isReady,
    
    /**
     * Any initialization error that occurred
     */
    error,
    
    /**
     * Function to initialize/reinitialize audio
     * Must be called from user interaction
     */
    initialize,
  };
}

/**
 * Hook for playing simple audio feedback
 * Provides success and error tone functions with automatic error handling
 * 
 * @example
 * ```tsx
 * function MyGame() {
 *   const { playSuccess, playError } = useAudioFeedback();
 *   
 *   const handleCorrectAnswer = () => {
 *     playSuccess();
 *     // ... update score
 *   };
 *   
 *   const handleWrongAnswer = () => {
 *     playError();
 *     // ... show feedback
 *   };
 * }
 * ```
 */
export function useAudioFeedback() {
  const playSuccess = useCallback(async () => {
    try {
      await audioService.playSuccessTone();
    } catch (error) {
      console.warn('Could not play success tone:', error);
      // Silently fail - feedback sounds are non-critical
    }
  }, []);

  const playError = useCallback(async () => {
    try {
      await audioService.playErrorTone();
    } catch (error) {
      console.warn('Could not play error tone:', error);
      // Silently fail - feedback sounds are non-critical
    }
  }, []);

  return {
    playSuccess,
    playError,
  };
}

