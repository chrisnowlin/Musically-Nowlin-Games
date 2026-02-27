import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import MelodyDungeonGame from '@/components/melody-dungeon/MelodyDungeonGame';

describe('Melody Dungeon', () => {
  it('shows 100 floors to conquer in menu copy', () => {
    render(<MelodyDungeonGame />);

    expect(screen.getByText(/100 floors to conquer!/i)).toBeInTheDocument();
  });
});
