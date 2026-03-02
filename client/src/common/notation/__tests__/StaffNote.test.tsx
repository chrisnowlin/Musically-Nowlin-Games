import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { mockVexFlow, setVexFlowShouldThrow } from '@/test/vexflowMock';
mockVexFlow();

import StaffNote from '../StaffNote';

afterEach(() => {
  setVexFlowShouldThrow(false);
});

describe('StaffNote', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <StaffNote noteKey="C4" clef="treble" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with bass clef without crashing', () => {
    const { container } = render(
      <StaffNote noteKey="G2" clef="bass" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StaffNote noteKey="E4" clef="treble" className="my-custom-class" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('my-custom-class')).toBe(true);
  });

  it('re-renders when noteKey changes', () => {
    const { container, rerender } = render(
      <StaffNote noteKey="C4" clef="treble" />
    );
    const svg1 = container.querySelector('svg');
    expect(svg1).toBeInTheDocument();

    rerender(<StaffNote noteKey="G4" clef="treble" />);
    const svg2 = container.querySelector('svg');
    expect(svg2).toBeInTheDocument();
  });

  it('shows text fallback when VexFlow rendering fails', () => {
    setVexFlowShouldThrow(true);
    const { container } = render(
      <StaffNote noteKey="D4" clef="treble" className="test-error" />
    );
    // Should NOT have an SVG since rendering threw
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
    // Should show the noteKey as text fallback
    expect(container.textContent).toBe('D4');
    // Fallback div should have the expected classes
    const fallback = container.firstElementChild;
    expect(fallback?.classList.contains('text-slate-400')).toBe(true);
    expect(fallback?.classList.contains('font-mono')).toBe(true);
    expect(fallback?.classList.contains('test-error')).toBe(true);
  });
});
