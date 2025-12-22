/**
 * Rhythm Notation Utilities
 * VexFlow rendering utilities for rhythm-only staff notation
 */

import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Tuplet,
  Dot,
  Articulation,
  type RenderContext,
} from 'vexflow';
import {
  RhythmPattern,
  RhythmEvent,
  Measure,
  NoteValue,
  RestValue,
  TIME_SIGNATURES,
} from './types';

// ============================================
// VEXFLOW NOTE VALUE MAPPINGS
// ============================================

// Map our note values to VexFlow duration strings
const NOTE_VALUE_TO_VEXFLOW: Record<NoteValue, string> = {
  whole: 'w',
  half: 'h',
  quarter: 'q',
  eighth: '8',
  sixteenth: '16',
  dottedHalf: 'hd',
  dottedQuarter: 'qd',
  dottedEighth: '8d',
  tripletQuarter: 'q',
  tripletEighth: '8',
};

// Map rest values to VexFlow duration strings
const REST_VALUE_TO_VEXFLOW: Record<RestValue, string> = {
  wholeRest: 'wr',
  halfRest: 'hr',
  quarterRest: 'qr',
  eighthRest: '8r',
  sixteenthRest: '16r',
};

// Rhythm-only note position (single line percussion clef uses 'b/4')
const RHYTHM_NOTE_KEY = 'b/4';

// ============================================
// STAVE RENDERING
// ============================================

export interface RenderOptions {
  width: number;
  height: number;
  staveWidth: number;
  measureSpacing: number;
  startX: number;
  startY: number;
  highlightEventIndex?: number;
}

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  width: 800,
  height: 150,
  staveWidth: 180,
  measureSpacing: 20,
  startX: 10,
  startY: 20,
};

/**
 * Create a VexFlow StaveNote from a RhythmEvent
 */
function createStaveNote(event: RhythmEvent, isHighlighted: boolean): StaveNote {
  const isRest = event.type === 'rest';

  let durationStr: string;
  if (isRest) {
    durationStr = REST_VALUE_TO_VEXFLOW[event.value as RestValue] || 'qr';
  } else {
    durationStr = NOTE_VALUE_TO_VEXFLOW[event.value as NoteValue] || 'q';
  }

  // Check if dotted (VexFlow uses 'd' suffix for dotted notes)
  const isDotted = event.value.startsWith('dotted');

  // Remove the 'd' suffix if present - we'll add dot separately
  const baseDuration = isDotted ? durationStr.replace('d', '') : durationStr;

  // Create the note - use different rendering for rests
  const noteConfig = isRest
    ? { keys: [RHYTHM_NOTE_KEY], duration: baseDuration }
    : { keys: [RHYTHM_NOTE_KEY], duration: baseDuration, stem_direction: 1 };

  const staveNote = new StaveNote(noteConfig);

  // Add dot for dotted notes
  if (isDotted && !isRest) {
    Dot.buildAndAttach([staveNote], { all: true });
  }

  // Add accent articulation
  if (event.isAccented && !isRest) {
    const articulation = new Articulation('a>');
    articulation.setPosition(3); // Above the note
    staveNote.addModifier(articulation);
  }

  // Apply highlight styling
  if (isHighlighted) {
    staveNote.setStyle({ fillStyle: '#8b5cf6', strokeStyle: '#8b5cf6' });
  }

  return staveNote;
}

/**
 * Group eighth/sixteenth notes for beaming
 */
function getBeamGroups(notes: StaveNote[], events: RhythmEvent[]): StaveNote[][] {
  const groups: StaveNote[][] = [];
  let currentGroup: StaveNote[] = [];

  events.forEach((event, index) => {
    const note = notes[index];
    if (!note) return;

    const isBeamable =
      event.type === 'note' &&
      ['eighth', 'sixteenth', 'dottedEighth', 'tripletEighth'].includes(event.value as string);

    if (isBeamable) {
      currentGroup.push(note);
    } else {
      if (currentGroup.length >= 2) {
        groups.push([...currentGroup]);
      }
      currentGroup = [];
    }
  });

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Get triplet groups for tuplet rendering
 */
function getTripletGroups(notes: StaveNote[], events: RhythmEvent[]): StaveNote[][] {
  const groups: StaveNote[][] = [];
  let currentGroup: StaveNote[] = [];

  events.forEach((event, index) => {
    const note = notes[index];
    if (!note) return;

    const isTriplet = event.isTriplet;

    if (isTriplet) {
      currentGroup.push(note);
      if (currentGroup.length === 3) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    } else {
      currentGroup = [];
    }
  });

  return groups;
}

/**
 * Render a single measure to a stave
 */
function renderMeasure(
  context: RenderContext,
  measure: Measure,
  x: number,
  y: number,
  width: number,
  timeSignature: string,
  isFirstMeasure: boolean,
  highlightEventIndex: number,
  globalEventOffset: number
): number {
  const timeSig = TIME_SIGNATURES[timeSignature];

  // Create stave
  const stave = new Stave(x, y, width);

  if (isFirstMeasure) {
    stave.addClef('percussion');
    stave.addTimeSignature(timeSignature);
  }

  stave.setContext(context).draw();

  // Create notes
  const staveNotes: StaveNote[] = [];

  measure.events.forEach((event, eventIndex) => {
    const globalIndex = globalEventOffset + eventIndex;
    const isHighlighted = globalIndex === highlightEventIndex;
    const staveNote = createStaveNote(event, isHighlighted);
    staveNotes.push(staveNote);
  });

  if (staveNotes.length === 0) return globalEventOffset;

  // Calculate total beats for voice
  const totalBeats = timeSig.beatsPerMeasure;
  const beatValue = 4 / timeSig.denominator; // Convert to quarter note beats

  // Create voice
  const voice = new Voice({
    num_beats: totalBeats * beatValue,
    beat_value: 4,
  });
  voice.setStrict(false); // Allow slight timing variations
  voice.addTickables(staveNotes);

  // Format and draw
  const formatter = new Formatter();
  formatter.joinVoices([voice]).format([voice], width - 50);

  voice.draw(context, stave);

  // Draw beams
  const beamGroups = getBeamGroups(staveNotes, measure.events);
  beamGroups.forEach((group) => {
    try {
      const beam = new Beam(group);
      beam.setContext(context).draw();
    } catch {
      // Beam creation can fail for certain note combinations
    }
  });

  // Draw triplet brackets
  const tripletGroups = getTripletGroups(staveNotes, measure.events);
  tripletGroups.forEach((group) => {
    try {
      const tuplet = new Tuplet(group, { num_notes: 3, notes_occupied: 2 });
      tuplet.setContext(context).draw();
    } catch {
      // Tuplet creation can fail for certain note combinations
    }
  });

  return globalEventOffset + measure.events.length;
}

// ============================================
// MAIN RENDERING FUNCTIONS
// ============================================

/**
 * Render a complete rhythm pattern to a div element
 */
export function renderPatternToDiv(
  containerDiv: HTMLDivElement,
  pattern: RhythmPattern,
  options: Partial<RenderOptions> = {}
): void {
  const opts = { ...DEFAULT_RENDER_OPTIONS, ...options };

  // Clear existing content
  containerDiv.innerHTML = '';

  // Calculate total width needed
  const measuresPerLine = Math.min(pattern.measures.length, 4);
  const totalWidth = opts.startX + (opts.staveWidth + opts.measureSpacing) * measuresPerLine + 50;
  const lines = Math.ceil(pattern.measures.length / measuresPerLine);
  const totalHeight = lines * (opts.height + 20);

  // Create renderer
  const renderer = new Renderer(containerDiv, Renderer.Backends.SVG);
  renderer.resize(Math.max(totalWidth, opts.width), totalHeight);

  const context = renderer.getContext();
  context.setFont('Arial', 10);

  // Render each measure
  let currentX = opts.startX;
  let currentY = opts.startY;
  let globalEventIndex = 0;
  let measuresInCurrentLine = 0;

  pattern.measures.forEach((measure, measureIndex) => {
    const isFirstMeasure = measureIndex === 0;
    const measureWidth = isFirstMeasure ? opts.staveWidth + 60 : opts.staveWidth;

    // Check if we need to wrap to next line
    if (measuresInCurrentLine >= measuresPerLine) {
      currentX = opts.startX;
      currentY += opts.height + 20;
      measuresInCurrentLine = 0;
    }

    globalEventIndex = renderMeasure(
      context,
      measure,
      currentX,
      currentY,
      measureWidth,
      pattern.settings.timeSignature,
      isFirstMeasure,
      opts.highlightEventIndex ?? -1,
      globalEventIndex
    );

    currentX += measureWidth + opts.measureSpacing;
    measuresInCurrentLine++;
  });
}

/**
 * Render pattern to a canvas element (for PDF export)
 */
export function renderPatternToCanvas(
  canvas: HTMLCanvasElement,
  pattern: RhythmPattern,
  options: Partial<RenderOptions> = {}
): void {
  const opts = { ...DEFAULT_RENDER_OPTIONS, ...options };

  // Create renderer using canvas backend
  const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
  renderer.resize(opts.width, opts.height);

  const context = renderer.getContext();
  context.setFont('Arial', 10);

  // Render measures
  let currentX = opts.startX;
  let globalEventIndex = 0;

  pattern.measures.forEach((measure, measureIndex) => {
    const isFirstMeasure = measureIndex === 0;
    const measureWidth = isFirstMeasure ? opts.staveWidth + 60 : opts.staveWidth;

    globalEventIndex = renderMeasure(
      context,
      measure,
      currentX,
      opts.startY,
      measureWidth,
      pattern.settings.timeSignature,
      isFirstMeasure,
      opts.highlightEventIndex ?? -1,
      globalEventIndex
    );

    currentX += measureWidth + opts.measureSpacing;
  });
}

/**
 * Calculate the SVG dimensions needed for a pattern
 */
export function calculatePatternDimensions(
  pattern: RhythmPattern,
  options: Partial<RenderOptions> = {}
): { width: number; height: number } {
  const opts = { ...DEFAULT_RENDER_OPTIONS, ...options };

  const measuresPerLine = Math.min(pattern.measures.length, 4);
  const lines = Math.ceil(pattern.measures.length / measuresPerLine);

  const width = opts.startX + (opts.staveWidth + opts.measureSpacing) * measuresPerLine + 100;
  const height = lines * (opts.height + 20) + 40;

  return { width, height };
}
