import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioError } from '../audioService';

describe('audioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AudioError Class', () => {
    it('should create AudioError with correct properties', () => {
      const error = new AudioError('Test error message');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AudioError);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('AudioError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new AudioError('Test throw');
      }).toThrow(AudioError);
    });

    it('should preserve stack trace', () => {
      const error = new AudioError('Stack test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AudioError');
    });
  });
});

