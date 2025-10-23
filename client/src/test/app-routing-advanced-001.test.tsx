/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Advanced001Page from '@/pages/games/Advanced001Page';

vi.mock('@/lib/sampleAudioService', () => ({
  sampleAudioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    playNote: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Advanced001Page basic rendering', () => {
  it('renders the Advanced Music Analyzer page', async () => {
    render(<Advanced001Page />);
    expect(await screen.findByText(/advanced music analyzer/i)).toBeInTheDocument();
  });
});

