import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing game cleanup (timeouts, intervals, etc.)
 * 
 * Automatically clears all registered timeouts/intervals on unmount
 * to prevent memory leaks and "setState on unmounted component" warnings.
 * 
 * @returns Object with methods to create auto-cleaning timeouts and intervals
 * 
 * @example
 * ```tsx
 * function MyGame() {
 *   const { setTimeout, setInterval, clearAll } = useGameCleanup();
 *   
 *   const handlePlay = () => {
 *     setTimeout(() => {
 *       console.log('This will auto-cleanup on unmount');
 *     }, 1000);
 *   };
 *   
 *   // Manually clear all if needed
 *   const handleStop = () => {
 *     clearAll();
 *   };
 * }
 * ```
 */
export function useGameCleanup() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  /**
   * Create a timeout that will be automatically cleared on unmount
   */
  const createTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const id = globalThis.setTimeout(() => {
      timeoutsRef.current.delete(id);
      callback();
    }, delay);
    
    timeoutsRef.current.add(id);
    return id;
  };

  /**
   * Create an interval that will be automatically cleared on unmount
   */
  const createInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const id = globalThis.setInterval(callback, delay);
    intervalsRef.current.add(id);
    return id;
  };

  /**
   * Clear a specific timeout
   */
  const clearTimeoutById = (id: NodeJS.Timeout): void => {
    globalThis.clearTimeout(id);
    timeoutsRef.current.delete(id);
  };

  /**
   * Clear a specific interval
   */
  const clearIntervalById = (id: NodeJS.Timeout): void => {
    globalThis.clearInterval(id);
    intervalsRef.current.delete(id);
  };

  /**
   * Clear all timeouts and intervals
   */
  const clearAll = (): void => {
    timeoutsRef.current.forEach(id => globalThis.clearTimeout(id));
    intervalsRef.current.forEach(id => globalThis.clearInterval(id));
    timeoutsRef.current.clear();
    intervalsRef.current.clear();
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    /**
     * Create a timeout that auto-cleans on unmount
     */
    setTimeout: createTimeout,
    
    /**
     * Create an interval that auto-cleans on unmount
     */
    setInterval: createInterval,
    
    /**
     * Clear a specific timeout
     */
    clearTimeout: clearTimeoutById,
    
    /**
     * Clear a specific interval
     */
    clearInterval: clearIntervalById,
    
    /**
     * Clear all timeouts and intervals
     */
    clearAll,
  };
}

