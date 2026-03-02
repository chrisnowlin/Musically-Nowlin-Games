import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import NotationImage from '../NotationImage';

describe('NotationImage', () => {
  it('renders an img element with the correct src and alt', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test notation" />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('/images/test.svg');
    expect(img?.getAttribute('alt')).toBe('Test notation');
  });

  it('applies the invert filter class', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('invert')).toBe(true);
  });

  it('uses h-20 (md) size by default', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-20')).toBe(true);
  });

  it('uses h-16 for size="sm"', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" size="sm" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-16')).toBe(true);
  });

  it('uses h-24 for size="lg"', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" size="lg" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-24')).toBe(true);
  });

  it('hides the image on load error', () => {
    const { container } = render(
      <NotationImage src="/images/missing.svg" alt="Missing" />
    );
    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    expect(img.style.display).toBe('none');
  });

  it('passes additional className to the img', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" className="mb-2" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('mb-2')).toBe(true);
  });
});
