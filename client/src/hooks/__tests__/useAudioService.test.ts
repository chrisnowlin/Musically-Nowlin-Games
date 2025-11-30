import { describe, it, expect, beforeEach } from 'vitest';
import { useAudioService, useAudioFeedback } from '../useAudioService';

describe('useAudioService', () => {
  beforeEach(() => {
    // Clear any mocks
  });

  it('should be a valid hook', () => {
    expect(useAudioService).toBeDefined();
    expect(typeof useAudioService).toBe('function');
  });
});

describe('useAudioFeedback', () => {
  beforeEach(() => {
    // Clear any mocks
  });

  it('should be a valid hook', () => {
    expect(useAudioFeedback).toBeDefined();
    expect(typeof useAudioFeedback).toBe('function');
  });
});

