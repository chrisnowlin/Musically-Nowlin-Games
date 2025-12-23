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
  Stem,
  type RenderContext,
} from 'vexflow';
import {
  RhythmPattern,
  RhythmEvent,
  Measure,
  NoteValue,
  RestValue,
  StaffLineMode,
  StemDirection,
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
  tripletQuarter: 'q',
  tripletEighth: '8',
  // Beamed groups use individual note durations (expanded before rendering)
  twoEighths: '8',
  fourSixteenths: '16',
  twoSixteenths: '16',
  // Mixed beamed groups (expanded before rendering)
  eighthTwoSixteenths: '8',         // First note type (eighth)
  twoSixteenthsEighth: '16',        // First note type (sixteenth)
  sixteenthEighthSixteenth: '16',   // First note type (sixteenth)
};

// Beamed group definitions
// For uniform groups: count + noteType + duration
// For mixed groups: notes array with individual note specifications
type BeamedGroupDef =
  | { count: number; noteType: NoteValue; duration: number }
  | { notes: Array<{ noteType: NoteValue; duration: number }> };

export const BEAMED_GROUP_INFO: Partial<Record<NoteValue, BeamedGroupDef>> = {
  // Uniform groups
  twoEighths: { count: 2, noteType: 'eighth', duration: 0.5 },
  fourSixteenths: { count: 4, noteType: 'sixteenth', duration: 0.25 },
  twoSixteenths: { count: 2, noteType: 'sixteenth', duration: 0.25 },
  // Mixed eighth + sixteenth groups
  eighthTwoSixteenths: {
    notes: [
      { noteType: 'eighth', duration: 0.5 },
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'sixteenth', duration: 0.25 },
    ]
  },
  twoSixteenthsEighth: {
    notes: [
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'eighth', duration: 0.5 },
    ]
  },
  sixteenthEighthSixteenth: {
    notes: [
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'eighth', duration: 0.5 },
      { noteType: 'sixteenth', duration: 0.25 },
    ]
  },
};

/**
 * Check if a note value is a beamed group
 */
export function isBeamedGroup(noteValue: NoteValue): boolean {
  return noteValue in BEAMED_GROUP_INFO;
}

/**
 * Expand beamed group events into individual note events
 */
export function expandBeamedGroups(events: RhythmEvent[]): RhythmEvent[] {
  const expanded: RhythmEvent[] = [];

  for (const event of events) {
    if (event.type === 'note' && isBeamedGroup(event.value as NoteValue)) {
      const groupInfo = BEAMED_GROUP_INFO[event.value as NoteValue]!;

      // Check if it's a mixed group (has 'notes' array) or uniform group (has 'count')
      if ('notes' in groupInfo) {
        // Mixed group - expand each note in the sequence
        groupInfo.notes.forEach((note, i) => {
          expanded.push({
            type: 'note',
            value: note.noteType,
            duration: note.duration,
            isAccented: i === 0 ? event.isAccented : false,
            isTriplet: false,
          });
        });
      } else {
        // Uniform group - create identical notes
        for (let i = 0; i < groupInfo.count; i++) {
          expanded.push({
            type: 'note',
            value: groupInfo.noteType,
            duration: groupInfo.duration,
            isAccented: i === 0 ? event.isAccented : false,
            isTriplet: false,
          });
        }
      }
    } else {
      expanded.push(event);
    }
  }

  return expanded;
}

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
  containerWidth?: number; // If provided, staveWidth will be calculated to fit
  staffLineMode?: StaffLineMode; // 'single' for single-line percussion, 'full' for 5-line staff
  stemDirection?: StemDirection; // 'up' or 'down' for note stems
  showMeasureNumbers?: boolean; // Show measure numbers above each measure
  totalMeasures?: number; // Total number of measures (used to auto-enable measure numbers)
}

export interface NotePosition {
  x: number;
  y: number;
  globalIndex: number;
  measureIndex: number;
}

export interface RenderResult {
  notePositions: NotePosition[];
}

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  width: 800,
  height: 120,
  staveWidth: 180,
  measureSpacing: 15,
  startX: 10,
  startY: 10,
  staffLineMode: 'single',
  stemDirection: 'up',
};

/**
 * Create a VexFlow StaveNote from a RhythmEvent
 * Note: stem direction is set later, not in constructor, to work properly with beams
 */
function createStaveNote(event: RhythmEvent, isHighlighted: boolean, stemDir: number = Stem.UP): StaveNote {
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

  // Create the note - DON'T set stem_direction here, it will be set later
  // Setting it in constructor can interfere with beam flag hiding
  const staveNote = new StaveNote({
    keys: [RHYTHM_NOTE_KEY],
    duration: baseDuration,
  });

  // Add dot for dotted notes
  if (isDotted && !isRest) {
    Dot.buildAndAttach([staveNote], { all: true });
  }

  // Add accent articulation
  if (event.isAccented && !isRest) {
    const articulation = new Articulation('a>');
    articulation.setPosition(stemDir === Stem.UP ? 3 : 4); // Above note if stems up, below if stems down
    staveNote.addModifier(articulation);
  }

  // Apply highlight styling
  if (isHighlighted) {
    staveNote.setStyle({ fillStyle: '#8b5cf6', strokeStyle: '#8b5cf6' });
  }

  return staveNote;
}

/**
 * Group eighth/sixteenth notes for beaming by beat position
 * Groups notes that fall within the same beat (e.g., 2 eighths = 1 beat)
 */
function getBeamGroupsByBeat(notes: StaveNote[], events: RhythmEvent[]): StaveNote[][] {
  const groups: StaveNote[][] = [];
  let currentGroup: StaveNote[] = [];
  let currentBeatStart = 0;
  let beatPosition = 0;
  const beatDuration = 1; // Each beat is 1 quarter note worth (1.0)

  events.forEach((event, index) => {
    const note = notes[index];
    if (!note) return;

    const isBeamable =
      event.type === 'note' &&
      ['eighth', 'sixteenth', 'tripletEighth'].includes(event.value as string);

    // Check if we've crossed into a new beat
    const currentBeat = Math.floor(beatPosition / beatDuration);
    const groupBeat = Math.floor(currentBeatStart / beatDuration);
    const crossedBeat = currentBeat !== groupBeat;

    if (isBeamable) {
      // If we crossed a beat boundary, finalize the current group
      if (crossedBeat && currentGroup.length >= 2) {
        groups.push([...currentGroup]);
        currentGroup = [];
        currentBeatStart = beatPosition;
      } else if (crossedBeat) {
        // Started new beat but didn't have enough for a group
        currentGroup = [];
        currentBeatStart = beatPosition;
      }

      // Start a new group if empty
      if (currentGroup.length === 0) {
        currentBeatStart = beatPosition;
      }

      currentGroup.push(note);
    } else {
      // Non-beamable note - finalize any existing group
      if (currentGroup.length >= 2) {
        groups.push([...currentGroup]);
      }
      currentGroup = [];
      currentBeatStart = beatPosition + event.duration;
    }

    beatPosition += event.duration;
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
 * Returns: { nextGlobalIndex, notePositions }
 */
function renderMeasure(
  context: RenderContext,
  measure: Measure,
  measureIndex: number,
  x: number,
  y: number,
  width: number,
  timeSignature: string,
  isFirstMeasure: boolean,
  highlightEventIndex: number,
  globalEventOffset: number,
  staffLineMode: StaffLineMode = 'single',
  stemDirection: StemDirection = 'up',
  showMeasureNumbers: boolean = false
): { nextGlobalIndex: number; notePositions: NotePosition[] } {
  // Convert stem direction to VexFlow format using Stem constants
  const stemDir = stemDirection === 'up' ? Stem.UP : Stem.DOWN;
  const timeSig = TIME_SIGNATURES[timeSignature];

  // Create stave
  const stave = new Stave(x, y, width);

  // Configure staff lines based on mode
  if (staffLineMode === 'single') {
    // Show only the middle line for single-line percussion notation
    // Use setConfigForLines() to properly configure line visibility
    stave.setConfigForLines([
      { visible: false },
      { visible: false },
      { visible: true },  // Middle line only (where b/4 notes are placed)
      { visible: false },
      { visible: false },
    ]);
  }

  if (isFirstMeasure) {
    stave.addClef('percussion');
    stave.addTimeSignature(timeSignature);
  }

  stave.setContext(context).draw();

  // Draw measure number above the stave if enabled
  if (showMeasureNumbers) {
    const measureNumber = measureIndex + 1; // 1-based measure numbers

    // Try SVG context first (for renderPatternToDiv)
    const svgContext = context as unknown as { svg: SVGElement };
    if (svgContext.svg) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x + 5));
      text.setAttribute('y', String(y + 18)); // Position just above top staff line
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'normal');
      text.setAttribute('fill', '#666666');
      text.textContent = String(measureNumber);
      svgContext.svg.appendChild(text);
    } else {
      // Canvas context (for renderPatternToCanvas)
      const canvasContext = context as unknown as { context2D: CanvasRenderingContext2D };
      if (canvasContext.context2D) {
        const ctx2d = canvasContext.context2D;
        ctx2d.save();
        ctx2d.font = '10px Arial, sans-serif';
        ctx2d.fillStyle = '#666666';
        ctx2d.fillText(String(measureNumber), x + 5, y + 18);
        ctx2d.restore();
      }
    }
  }

  // Calculate the actual space available for notes
  // getNoteStartX() returns where notes should start (after clef/time sig)
  // getNoteEndX() returns where notes should end (before barline)
  const noteStartX = stave.getNoteStartX();
  const noteEndX = stave.getNoteEndX();
  const availableWidth = noteEndX - noteStartX;

  // Expand beamed groups into individual notes for rendering
  const expandedEvents = expandBeamedGroups(measure.events);

  // Create notes from expanded events
  // Use expanded event indices for highlighting to match playback
  const staveNotes: StaveNote[] = [];

  for (let i = 0; i < expandedEvents.length; i++) {
    const globalIndex = globalEventOffset + i;
    const isHighlighted = globalIndex === highlightEventIndex;
    const staveNote = createStaveNote(expandedEvents[i], isHighlighted, stemDir);
    staveNotes.push(staveNote);
  }

  if (staveNotes.length === 0) {
    return { nextGlobalIndex: globalEventOffset, notePositions: [] };
  }

  // Calculate actual beats in this measure (allowing for variable measure lengths)
  const actualBeats = measure.events.reduce((sum, event) => sum + event.duration, 0);
  const beatValue = 4 / timeSig.denominator; // Convert to quarter note beats

  // Create voice with actual measure duration (not fixed)
  const voice = new Voice({
    num_beats: actualBeats * beatValue,
    beat_value: 4,
  });
  voice.setStrict(false); // Allow slight timing variations
  voice.addTickables(staveNotes);

  // Set stem direction on ALL notes BEFORE beam creation
  staveNotes.forEach((note) => {
    if (!note.isRest()) {
      note.setStemDirection(stemDir);
    }
  });

  // Group notes for beaming by beat position and create beams with auto_stem=false
  const beams: Beam[] = [];
  const beamGroups = getBeamGroupsByBeat(staveNotes, expandedEvents);
  beamGroups.forEach((group) => {
    try {
      // Ensure stem direction is set on all notes in the group
      group.forEach((note) => note.setStemDirection(stemDir));
      // Create beam with auto_stem=false to respect our stem directions
      beams.push(new Beam(group, false));
    } catch {
      // Beam creation can fail for certain note combinations
    }
  });

  // Format and draw voice - use the actual available width for proper distribution
  const formatter = new Formatter();
  formatter.joinVoices([voice]).format([voice], availableWidth - 10, {
    align_rests: true,
  });

  // Set the starting X position for the voice to align with stave
  voice.draw(context, stave);

  // Draw beams after notes
  beams.forEach((beam) => {
    beam.setContext(context).draw();
  });

  // Draw triplet brackets (use expanded events since staveNotes corresponds to expanded events)
  const tripletGroups = getTripletGroups(staveNotes, expandedEvents);
  tripletGroups.forEach((group) => {
    try {
      const tuplet = new Tuplet(group, { num_notes: 3, notes_occupied: 2 });
      tuplet.setContext(context).draw();
    } catch {
      // Tuplet creation can fail for certain note combinations
    }
  });

  // Collect note positions after rendering
  const notePositions: NotePosition[] = staveNotes.map((note, i) => ({
    x: note.getAbsoluteX(),
    y: y + 60, // Below the stave (staff is typically ~50px, add some padding)
    globalIndex: globalEventOffset + i,
    measureIndex,
  }));

  // Return offset using expanded event count to match playback indices
  return {
    nextGlobalIndex: globalEventOffset + expandedEvents.length,
    notePositions,
  };
}

// ============================================
// MAIN RENDERING FUNCTIONS
// ============================================

/**
 * Render a complete rhythm pattern to a div element
 * Returns note positions for syllable alignment
 */
export function renderPatternToDiv(
  containerDiv: HTMLDivElement,
  pattern: RhythmPattern,
  options: Partial<RenderOptions> = {}
): RenderResult {
  const opts = { ...DEFAULT_RENDER_OPTIONS, ...options };

  // Clear existing content
  containerDiv.innerHTML = '';

  // Get expected beats per measure from time signature
  const timeSig = TIME_SIGNATURES[pattern.settings.timeSignature];
  const expectedBeatsPerMeasure = timeSig.beatsPerMeasure;

  // Calculate expanded note counts for each measure (for width calculations)
  const measureNoteCounts = pattern.measures.map(measure =>
    expandBeamedGroups(measure.events).length
  );

  // Find the maximum note count to determine measures per line
  const maxNoteCount = Math.max(...measureNoteCounts);

  // Adjust measures per line based on density - fewer measures per line for dense patterns
  // Standard: 4 measures per line for simple patterns (4-6 notes per measure)
  // Reduce to 2 measures per line for dense patterns (10+ notes per measure)
  // Reduce to 1 measure per line for very dense patterns (16+ notes per measure)
  const densityFactor = maxNoteCount >= 16 ? 1 : maxNoteCount > 10 ? 2 : maxNoteCount > 6 ? 3 : 4;
  const measuresPerLine = Math.min(pattern.measures.length, densityFactor);
  const lines = Math.ceil(pattern.measures.length / measuresPerLine);

  // Calculate base stave width to fit within container
  // First measure needs extra 60px for clef and time signature
  const firstMeasureExtra = 60;
  const availableWidth = opts.containerWidth || opts.width;
  const totalSpacing = opts.measureSpacing * (measuresPerLine - 1);
  const availableForStaves = availableWidth - opts.startX - totalSpacing - firstMeasureExtra - 20; // 20px padding
  const baseStaveWidth = opts.containerWidth
    ? Math.max(120, Math.floor(availableForStaves / measuresPerLine))
    : opts.staveWidth;

  // Minimum pixels per note to ensure readability of syllables
  const minPixelsPerNote = 32;

  // Calculate desired widths for each measure based on note count (not just duration)
  // This ensures measures with many notes get more space
  const desiredWidths = measureNoteCounts.map((noteCount, index) => {
    const isFirstInLine = index % measuresPerLine === 0;
    const baseWidth = isFirstInLine ? baseStaveWidth + firstMeasureExtra : baseStaveWidth;

    // Calculate minimum width needed based on note count
    const minWidthForNotes = noteCount * minPixelsPerNote;

    // Use the larger of: base width or minimum for note count
    const desiredWidth = Math.max(baseWidth, minWidthForNotes);

    return desiredWidth;
  });

  // Calculate total width needed for each line and find the maximum
  const lineWidths: number[] = [];
  let currentLineWidth = 0;
  
  desiredWidths.forEach((width, index) => {
    const isFirstInLine = index % measuresPerLine === 0;
    
    if (isFirstInLine) {
      // New line - save previous line width and start new line
      if (index > 0) {
        lineWidths.push(currentLineWidth);
      }
      currentLineWidth = opts.startX;
    } else {
      currentLineWidth += opts.measureSpacing;
    }
    currentLineWidth += width;
  });
  
  // Don't forget the last line
  lineWidths.push(currentLineWidth);
  const maxLineWidth = Math.max(...lineWidths);
  
  // Scale down all widths proportionally if they exceed container width
  const maxAllowedWidth = availableWidth - 20; // 20px padding
  let measureWidths = desiredWidths;
  
  if (maxLineWidth > maxAllowedWidth && maxAllowedWidth > 0) {
    const scaleFactor = maxAllowedWidth / maxLineWidth;
    measureWidths = desiredWidths.map(width => width * scaleFactor);
  }

  // Calculate final total width (find the widest line after scaling)
  let finalMaxLineWidth = 0;
  let finalCurrentLineWidth = opts.startX;
  
  measureWidths.forEach((width, index) => {
    const isFirstInLine = index % measuresPerLine === 0;
    
    if (isFirstInLine && index > 0) {
      finalMaxLineWidth = Math.max(finalMaxLineWidth, finalCurrentLineWidth);
      finalCurrentLineWidth = opts.startX;
    }
    
    if (!isFirstInLine) {
      finalCurrentLineWidth += opts.measureSpacing;
    }
    finalCurrentLineWidth += width;
  });
  
  finalMaxLineWidth = Math.max(finalMaxLineWidth, finalCurrentLineWidth);
  const totalWidth = Math.min(finalMaxLineWidth + 10, availableWidth); // Ensure it doesn't exceed container
  const totalHeight = lines * (opts.height + 15) + 10;

  // Create renderer
  const renderer = new Renderer(containerDiv, Renderer.Backends.SVG);
  renderer.resize(Math.min(Math.max(totalWidth, availableWidth), availableWidth), totalHeight);

  const context = renderer.getContext();
  context.setFont('Arial', 10);

  // Determine if measure numbers should be shown
  // Auto-enable when total measures > 4, or use explicit option
  const totalMeasures = opts.totalMeasures ?? pattern.measures.length;
  const showMeasureNumbers = opts.showMeasureNumbers ?? totalMeasures > 4;

  // Render each measure
  let currentX = opts.startX;
  let currentY = opts.startY;
  let globalEventIndex = 0;
  let measuresInCurrentLine = 0;
  const allNotePositions: NotePosition[] = [];

  pattern.measures.forEach((measure, measureIndex) => {
    const isFirstMeasure = measureIndex === 0;
    const isFirstInLine = measuresInCurrentLine === 0;
    const measureWidth = measureWidths[measureIndex];

    // Check if we need to wrap to next line
    if (measuresInCurrentLine >= measuresPerLine) {
      currentX = opts.startX;
      currentY += opts.height + 15;
      measuresInCurrentLine = 0;
    }

    const result = renderMeasure(
      context,
      measure,
      measureIndex,
      currentX,
      currentY,
      measureWidth,
      pattern.settings.timeSignature,
      isFirstMeasure,
      opts.highlightEventIndex ?? -1,
      globalEventIndex,
      opts.staffLineMode ?? 'single',
      opts.stemDirection ?? 'up',
      showMeasureNumbers
    );

    globalEventIndex = result.nextGlobalIndex;
    allNotePositions.push(...result.notePositions);

    currentX += measureWidth + opts.measureSpacing;
    measuresInCurrentLine++;
  });

  return { notePositions: allNotePositions };
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

  // Get expected beats per measure from time signature
  const timeSig = TIME_SIGNATURES[pattern.settings.timeSignature];
  const expectedBeatsPerMeasure = timeSig.beatsPerMeasure;

  // Calculate actual durations for each measure
  const measureDurations = pattern.measures.map(measure => 
    measure.events.reduce((sum, event) => sum + event.duration, 0)
  );

  // Calculate desired widths for each measure based on actual duration
  const firstMeasureExtra = 60;
  const desiredWidths = measureDurations.map((actualBeats, index) => {
    const isFirstMeasure = index === 0;
    const baseWidth = isFirstMeasure ? opts.staveWidth + firstMeasureExtra : opts.staveWidth;
    // Scale width based on actual duration (with minimum width constraint)
    const durationRatio = actualBeats / expectedBeatsPerMeasure;
    const scaledWidth = baseWidth * durationRatio;
    // Ensure minimum width for readability
    return Math.max(isFirstMeasure ? opts.staveWidth * 0.7 + firstMeasureExtra : opts.staveWidth * 0.7, scaledWidth);
  });

  // Calculate total width needed
  let totalDesiredWidth = opts.startX;
  desiredWidths.forEach((width, index) => {
    if (index > 0) {
      totalDesiredWidth += opts.measureSpacing;
    }
    totalDesiredWidth += width;
  });
  totalDesiredWidth += 10; // Padding

  // Scale down all widths proportionally if they exceed canvas width
  const maxAllowedWidth = opts.width - 20; // 20px padding
  let measureWidths = desiredWidths;
  
  if (totalDesiredWidth > maxAllowedWidth && maxAllowedWidth > 0) {
    const scaleFactor = maxAllowedWidth / totalDesiredWidth;
    measureWidths = desiredWidths.map(width => width * scaleFactor);
    totalDesiredWidth = maxAllowedWidth;
  }

  const totalWidth = Math.min(totalDesiredWidth, opts.width);

  // Create renderer using canvas backend
  const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
  renderer.resize(Math.max(totalWidth, opts.width), opts.height);

  const context = renderer.getContext();
  context.setFont('Arial', 10);

  // Determine if measure numbers should be shown
  const totalMeasures = opts.totalMeasures ?? pattern.measures.length;
  const showMeasureNumbers = opts.showMeasureNumbers ?? totalMeasures > 4;

  // Render measures
  let currentX = opts.startX;
  let globalEventIndex = 0;

  pattern.measures.forEach((measure, measureIndex) => {
    const isFirstMeasure = measureIndex === 0;
    const measureWidth = measureWidths[measureIndex];

    const result = renderMeasure(
      context,
      measure,
      measureIndex,
      currentX,
      opts.startY,
      measureWidth,
      pattern.settings.timeSignature,
      isFirstMeasure,
      opts.highlightEventIndex ?? -1,
      globalEventIndex,
      opts.staffLineMode ?? 'single',
      opts.stemDirection ?? 'up',
      showMeasureNumbers
    );

    globalEventIndex = result.nextGlobalIndex;
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
  const height = lines * (opts.height + 15) + 20;

  return { width, height };
}
