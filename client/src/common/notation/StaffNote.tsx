import { useRef, useEffect } from 'react';
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
  if (!match) return 'b/4';
  return `${match[1].toLowerCase()}/${match[2]}`;
}

/**
 * Renders a single note on a 5-line staff with clef using VexFlow.
 * Dark-theme styled: gray staff lines, purple note head.
 */
export default function StaffNote({ noteKey, clef, className }: StaffNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous render
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(200, 120);
    const context = renderer.getContext();

    // Dark theme: gray staff lines
    context.setStrokeStyle('#94a3b8');
    context.setFillStyle('#94a3b8');

    const stave = new Stave(10, 10, 170);
    stave.addClef(clef);
    stave.setStyle({ strokeStyle: '#94a3b8', fillStyle: '#94a3b8' });
    stave.draw(context);

    // Create the note
    const vexKey = toVexFlowKey(noteKey);
    const note = new StaveNote({
      keys: [vexKey],
      duration: 'q',
      clef: clef,
    });
    // Purple note head
    note.setStyle({ fillStyle: '#a78bfa', strokeStyle: '#a78bfa' });

    const voice = new Voice({ num_beats: 1, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables([note]);

    new Formatter().joinVoices([voice]).format([voice], 100);
    voice.draw(context, stave);

    return () => {
      el.innerHTML = '';
    };
  }, [noteKey, clef]);

  return <div ref={containerRef} className={className} />;
}
