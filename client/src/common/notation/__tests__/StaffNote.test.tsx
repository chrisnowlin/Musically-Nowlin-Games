import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { mockVexFlow } from '@/test/vexflowMock';
mockVexFlow();

import StaffNote from '../StaffNote';

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
});
