import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameCleanup } from '../useGameCleanup';

describe('useGameCleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a valid hook', () => {
    // Basic test to verify the hook exports correctly
    expect(useGameCleanup).toBeDefined();
    expect(typeof useGameCleanup).toBe('function');
  });
});

