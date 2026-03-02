import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TileType } from '../logic/dungeonTypes';

// Mock all challenge child components to avoid audio/canvas dependencies
vi.mock('../challenges/NoteReadingChallenge', () => ({
  default: ({ onResult }: { onResult: (b: boolean) => void }) => (
    <button onClick={() => onResult(true)}>NoteReading Mock</button>
  ),
}));
vi.mock('../challenges/RhythmTapChallenge', () => ({
  default: ({ onResult }: { onResult: (b: boolean) => void }) => (
    <button onClick={() => onResult(true)}>RhythmTap Mock</button>
  ),
}));
vi.mock('../challenges/IntervalChallenge', () => ({
  default: ({ onResult }: { onResult: (b: boolean) => void }) => (
    <button onClick={() => onResult(true)}>Interval Mock</button>
  ),
}));
vi.mock('../challenges/VocabularyChallenge', () => ({
  default: ({ onResult }: { onResult: (b: boolean) => void }) => (
    <button onClick={() => onResult(true)}>Vocabulary Mock</button>
  ),
}));
vi.mock('../challenges/TimbreChallenge', () => ({
  default: ({ onResult }: { onResult: (b: boolean) => void }) => (
    <button onClick={() => onResult(true)}>Timbre Mock</button>
  ),
}));

// Mock challengeHelpers to control tier/type selection deterministically
vi.mock('../challengeHelpers', () => ({
  getChallengeTypesForFloor: () => ['noteReading', 'rhythmTap', 'interval', 'dynamics', 'tempo', 'symbols', 'terms', 'timbre'],
  rollTier: () => 1 as const,
  pickRandom: (arr: any[]) => arr[0],
  generateBigBossSequence: () => [],
  getSubtypeChallengePool: (_sub: any, types: any) => types,
}));

import ChallengeModal from '../ChallengeModal';

describe('ChallengeModal', () => {
  const defaultProps = {
    challengeType: 'noteReading' as const,
    tileType: TileType.Enemy,
    floorNumber: 1,
    onResult: vi.fn(),
  };

  it('renders with tile type Door and shows "Locked Door!" theme', () => {
    render(
      <ChallengeModal
        {...defaultProps}
        tileType={TileType.Door}
      />
    );
    expect(screen.getByText('Locked Door!')).toBeInTheDocument();
  });

  it('renders with tile type Treasure and shows "Treasure Found!" theme', () => {
    render(
      <ChallengeModal
        {...defaultProps}
        tileType={TileType.Treasure}
      />
    );
    expect(screen.getByText('Treasure Found!')).toBeInTheDocument();
  });

  it('renders with tile type Enemy + siren subtype and shows "Siren Encounter!" theme', () => {
    render(
      <ChallengeModal
        {...defaultProps}
        tileType={TileType.Enemy}
        enemySubtype="siren"
      />
    );
    expect(screen.getByText('Siren Encounter!')).toBeInTheDocument();
  });

  it('renders TimbreChallenge mock for timbre challenge type', () => {
    render(
      <ChallengeModal
        {...defaultProps}
        tileType={TileType.Door}
        challengeType="timbre"
      />
    );
    expect(screen.getByText('Timbre Mock')).toBeInTheDocument();
  });

  it('renders a challenge component for an enemy encounter', () => {
    render(
      <ChallengeModal
        {...defaultProps}
        tileType={TileType.Enemy}
        enemySubtype="ghost"
        enemyLevel={1}
      />
    );
    // With enemyLevel=1 (single round), it renders ChallengeRenderer directly.
    // pickRandom returns arr[0] which is 'noteReading', so NoteReading Mock appears.
    expect(screen.getByText('NoteReading Mock')).toBeInTheDocument();
  });
});
