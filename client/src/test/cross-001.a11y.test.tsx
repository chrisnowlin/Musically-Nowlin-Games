import { describe, it, expect } from 'vitest';
import { getCross001Mode, cross001Modes, type Cross001ModeId } from '../lib/gameLogic/cross-001Modes';

describe('CrossCurricularMusicMasterGame Accessibility', () => {
  it('should have accessible mode definitions', () => {
    expect(cross001Modes).toHaveLength(3);
    
    cross001Modes.forEach(mode => {
      expect(mode.id).toBeDefined();
      expect(mode.label).toBeDefined();
      expect(mode.emoji).toBeDefined();
      expect(mode.description).toBeDefined();
      expect(mode.instructions).toBeDefined();
      expect(mode.difficultyCurve).toBeDefined();
    });
  });

  it('should have accessible mode labels', () => {
    const modes = cross001Modes.map(m => m.label);
    expect(modes).toContain('Music Math');
    expect(modes).toContain('Musical Language');
    expect(modes).toContain('Music & Movement');
  });

  it('should have meaningful descriptions', () => {
    cross001Modes.forEach(mode => {
      expect(mode.description.length).toBeGreaterThan(10);
      expect(mode.instructions.length).toBeGreaterThan(10);
    });
  });

  it('should have proper difficulty curves', () => {
    cross001Modes.forEach(mode => {
      const curve1 = mode.difficultyCurve(1);
      const curve3 = mode.difficultyCurve(3);
      const curve5 = mode.difficultyCurve(5);
      
      expect(curve1.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve1.difficulty).toBeLessThanOrEqual(5);
      expect(curve3.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve3.difficulty).toBeLessThanOrEqual(5);
      expect(curve5.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve5.difficulty).toBeLessThanOrEqual(5);
    });
  });

  it('should retrieve mode by id', () => {
    const musicMath = getCross001Mode('math' as Cross001ModeId);
    expect(musicMath).toBeDefined();
    expect(musicMath?.label).toBe('Music Math');
    
    const musicalLanguage = getCross001Mode('language' as Cross001ModeId);
    expect(musicalLanguage).toBeDefined();
    expect(musicalLanguage?.label).toBe('Musical Language');
    
    const musicMovement = getCross001Mode('movement' as Cross001ModeId);
    expect(musicMovement).toBeDefined();
    expect(musicMovement?.label).toBe('Music & Movement');
  });

  it('should return undefined for invalid mode id', () => {
    const invalid = getCross001Mode('invalid-mode' as Cross001ModeId);
    expect(invalid).toBeUndefined();
  });
});
