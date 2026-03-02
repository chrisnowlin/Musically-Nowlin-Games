import { vi } from 'vitest';

let _shouldThrow = false;

/** Toggle whether the VexFlow Renderer constructor throws (for error-path tests). */
export function setVexFlowShouldThrow(val: boolean) { _shouldThrow = val; }

/**
 * Mock VexFlow for jsdom tests. VexFlow requires real SVG rendering
 * contexts that jsdom doesn't support, so we stub the classes and
 * create a real <svg> element for DOM assertions.
 */
export function mockVexFlow() {
  vi.mock('vexflow', () => {
    const mockContext = {
      setStrokeStyle: vi.fn(),
      setFillStyle: vi.fn(),
    };
    return {
      Renderer: class {
        static Backends = { SVG: 'svg' };
        constructor(el: HTMLElement) {
          if (_shouldThrow) throw new Error('VexFlow mock error');
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          el.appendChild(svg);
        }
        resize() {}
        getContext() { return mockContext; }
      },
      Stave: class {
        addClef() { return this; }
        setStyle() {}
        setContext() { return this; }
        draw() {}
      },
      StaveNote: class {
        setStyle() {}
      },
      Voice: class {
        setStrict() {}
        addTickables() {}
        draw() {}
      },
      Formatter: class {
        joinVoices() { return this; }
        format() { return this; }
      },
    };
  });
}
