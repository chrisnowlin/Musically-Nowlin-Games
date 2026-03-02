import { useRef, useEffect, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

interface StaffNoteProps {
  /** Note in "C4" format (letter + octave). */
  noteKey: string;
  /** Which clef to render. */
  clef: 'treble' | 'bass';
  /** Optional CSS class for the container div. */
  className?: string;
}

/** Convert "C4" → "c/4", "F#4" → "f#/4" for VexFlow. */
function toVexFlowKey(noteKey: string): string {
  const match = noteKey.match(/^([A-Ga-g][#b]?)(\d)$/);
  if (!match) {
    if (import.meta.env.DEV) {
      console.warn(`StaffNote: invalid noteKey "${noteKey}", falling back to b/4`);
    }
    return 'b/4';
  }
  return `${match[1].toLowerCase()}/${match[2]}`;
}

/**
 * Renders a single note on a 5-line staff with clef using VexFlow.
 * Dark-theme styled: gray staff lines, purple note head.
 */
export default function StaffNote({ noteKey, clef, className }: StaffNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    const el = containerRef.current;
    if (!el) return;

    // Clear previous render
    el.innerHTML = '';

    try {
      const w = el.clientWidth || 200;
      const h = el.clientHeight || 120;

      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(w, h);
      const context = renderer.getContext();

      // Dark theme: gray staff lines
      context.setStrokeStyle('#94a3b8');
      context.setFillStyle('#94a3b8');

      const staveWidth = Math.max(100, w - 30);
      const stave = new Stave(10, 10, staveWidth);
      stave.addClef(clef);
      stave.setStyle({ strokeStyle: '#94a3b8', fillStyle: '#94a3b8' });
      stave.setContext(context).draw();

      // Create the note
      const vexKey = toVexFlowKey(noteKey);
      const note = new StaveNote({
        keys: [vexKey],
        duration: 'q',
        clef: clef,
      });
      // Purple note head
      note.setStyle({ fillStyle: '#a78bfa', strokeStyle: '#a78bfa' });

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables([note]);

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 70);
      voice.draw(context, stave);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('StaffNote: VexFlow rendering failed', err);
      setHasError(true);
    }

    return () => {
      el.innerHTML = '';
    };
  }, [noteKey, clef]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center text-slate-400 text-lg font-mono ${className ?? ''}`}>
        {noteKey}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
