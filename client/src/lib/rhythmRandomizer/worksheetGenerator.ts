/**
 * Worksheet Generator
 * Creates printable PDF worksheets for rhythm exercises
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  RhythmPattern,
  RhythmSettings,
  WorksheetSettings,
  WorksheetFormat,
  DEFAULT_WORKSHEET_SETTINGS,
  EnsemblePattern,
} from './types';
import { generateRhythmPattern } from './rhythmGenerator';
import { addSyllablesToPattern } from './countingSyllables';

// ============================================
// WORKSHEET CONTENT TYPES
// ============================================

interface WorksheetExercise {
  pattern: RhythmPattern;
  number: number;
  showAnswer: boolean;
  blankMeasures?: number[]; // Indices of measures to leave blank
}

interface WorksheetContent {
  title: string;
  subtitle?: string;
  exercises: WorksheetExercise[];
  settings: WorksheetSettings;
  rhythmSettings: RhythmSettings;
  hasAnswerKey: boolean;
}

// ============================================
// PDF STYLING CONSTANTS
// ============================================

const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 20,
  titleFontSize: 18,
  subtitleFontSize: 12,
  bodyFontSize: 10,
  exerciseTitleFontSize: 11,
  lineHeight: 1.4,
  exerciseSpacing: 40,
  headerHeight: 50,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate multiple difficulty variants of a pattern
 */
function generateDifficultyVariants(
  baseSettings: RhythmSettings,
  count: number
): RhythmPattern[] {
  const variants: RhythmPattern[] = [];

  for (let i = 0; i < count; i++) {
    // Adjust difficulty for each variant
    const variantSettings: RhythmSettings = {
      ...baseSettings,
      syncopationProbability: Math.min(
        100,
        baseSettings.syncopationProbability + i * 15
      ),
      restProbability: Math.max(
        0,
        baseSettings.restProbability - i * 5
      ),
      // Increase note variety for harder variants
      noteDensity: i === 0 ? 'sparse' : i === 1 ? 'medium' : 'dense',
    };

    const pattern = generateRhythmPattern(variantSettings);
    variants.push(pattern);
  }

  return variants;
}

/**
 * Create blank completion exercise (some measures empty)
 */
function createBlankCompletionExercise(
  pattern: RhythmPattern,
  blankCount: number = 2
): WorksheetExercise {
  const totalMeasures = pattern.measures.length;
  const blankIndices: number[] = [];

  // Randomly select measures to blank (not first or last)
  const availableIndices = Array.from(
    { length: totalMeasures - 2 },
    (_, i) => i + 1
  );

  while (blankIndices.length < Math.min(blankCount, availableIndices.length)) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const idx = availableIndices[randomIndex];
    if (!blankIndices.includes(idx)) {
      blankIndices.push(idx);
    }
  }

  return {
    pattern,
    number: 0, // Will be set later
    showAnswer: false,
    blankMeasures: blankIndices.sort((a, b) => a - b),
  };
}

// ============================================
// WORKSHEET GENERATION
// ============================================

/**
 * Generate worksheet content based on format
 */
export function generateWorksheetContent(
  rhythmSettings: RhythmSettings,
  worksheetSettings: WorksheetSettings = DEFAULT_WORKSHEET_SETTINGS
): WorksheetContent {
  const exercises: WorksheetExercise[] = [];

  switch (worksheetSettings.format) {
    case 'standard': {
      // Generate patterns for each difficulty variant
      const variants = generateDifficultyVariants(
        rhythmSettings,
        worksheetSettings.difficultyVariants
      );
      variants.forEach((pattern, idx) => {
        exercises.push({
          pattern: worksheetSettings.includeSyllables
            ? addSyllablesToPattern(pattern, rhythmSettings.countingSystem)
            : pattern,
          number: idx + 1,
          showAnswer: false,
        });
      });
      break;
    }

    case 'blankCompletion': {
      // Generate patterns with blank measures
      for (let i = 0; i < worksheetSettings.difficultyVariants; i++) {
        const pattern = generateRhythmPattern(rhythmSettings);
        const exercise = createBlankCompletionExercise(pattern);
        exercise.number = i + 1;
        exercise.pattern = worksheetSettings.includeSyllables
          ? addSyllablesToPattern(exercise.pattern, rhythmSettings.countingSystem)
          : exercise.pattern;
        exercises.push(exercise);
      }
      break;
    }

    case 'quiz': {
      // Generate quiz-style exercises with numbering
      for (let i = 0; i < Math.max(4, worksheetSettings.difficultyVariants); i++) {
        const pattern = generateRhythmPattern(rhythmSettings);
        exercises.push({
          pattern: worksheetSettings.includeSyllables
            ? addSyllablesToPattern(pattern, rhythmSettings.countingSystem)
            : pattern,
          number: i + 1,
          showAnswer: false,
        });
      }
      break;
    }
  }

  return {
    title: worksheetSettings.title,
    subtitle: getWorksheetSubtitle(rhythmSettings, worksheetSettings),
    exercises,
    settings: worksheetSettings,
    rhythmSettings,
    hasAnswerKey: worksheetSettings.includeAnswerKey,
  };
}

/**
 * Generate worksheet subtitle with details
 */
function getWorksheetSubtitle(
  rhythmSettings: RhythmSettings,
  worksheetSettings: WorksheetSettings
): string {
  const parts: string[] = [];
  parts.push(`Time: ${rhythmSettings.timeSignature}`);
  parts.push(`Tempo: ${rhythmSettings.tempo} BPM`);

  if (worksheetSettings.format === 'blankCompletion') {
    parts.push('(Fill in the blank measures)');
  } else if (worksheetSettings.format === 'quiz') {
    parts.push('(Quiz)');
  }

  return parts.join(' | ');
}

// ============================================
// PDF GENERATION
// ============================================

/**
 * Create a PDF header with title and optional fields
 */
function addPdfHeader(
  doc: jsPDF,
  content: WorksheetContent,
  yOffset: number
): number {
  const { title, subtitle, settings } = content;
  let y = yOffset;

  // Title
  doc.setFontSize(PDF_CONFIG.titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PDF_CONFIG.margin, y);
  y += 8;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(PDF_CONFIG.subtitleFontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, PDF_CONFIG.margin, y);
    y += 6;
  }

  // Name and Date fields
  if (settings.includeNameField || settings.includeDateField) {
    y += 4;
    doc.setFontSize(PDF_CONFIG.bodyFontSize);

    if (settings.includeNameField) {
      doc.text('Name: _______________________', PDF_CONFIG.margin, y);
    }

    if (settings.includeDateField) {
      const dateX = settings.includeNameField
        ? PDF_CONFIG.pageWidth / 2
        : PDF_CONFIG.margin;
      doc.text('Date: _______________', dateX, y);
    }

    y += 8;
  }

  // Divider line
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(
    PDF_CONFIG.margin,
    y,
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin,
    y
  );
  y += 8;

  return y;
}

/**
 * Add exercise notation to PDF (placeholder - uses text representation)
 */
function addExerciseNotation(
  doc: jsPDF,
  exercise: WorksheetExercise,
  yOffset: number,
  isAnswerKey: boolean = false
): number {
  let y = yOffset;

  // Exercise number
  doc.setFontSize(PDF_CONFIG.exerciseTitleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`Exercise ${exercise.number}`, PDF_CONFIG.margin, y);
  y += 6;

  // Pattern representation (simplified text version for now)
  doc.setFontSize(PDF_CONFIG.bodyFontSize);
  doc.setFont('courier', 'normal');

  exercise.pattern.measures.forEach((measure, mIdx) => {
    const isBlank =
      exercise.blankMeasures?.includes(mIdx) && !isAnswerKey;

    if (isBlank) {
      // Show blank measure placeholder
      doc.text(
        `Measure ${mIdx + 1}: [_________________________________]`,
        PDF_CONFIG.margin + 10,
        y
      );
    } else {
      // Show rhythm pattern
      const events = measure.events
        .map((e) => {
          if (e.type === 'rest') return 'rest';
          return e.syllable || e.value;
        })
        .join('  ');
      doc.text(`Measure ${mIdx + 1}: ${events}`, PDF_CONFIG.margin + 10, y);
    }
    y += 5;
  });

  y += 4;

  // Show syllables if included and it's the answer key
  if (isAnswerKey && exercise.pattern.settings.countingSystem !== 'none') {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const syllables = exercise.pattern.measures
      .flatMap((m) => m.events.map((e) => e.syllable || ''))
      .filter(Boolean)
      .join('  ');
    doc.text(`Syllables: ${syllables}`, PDF_CONFIG.margin + 10, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  return y;
}

/**
 * Generate a complete PDF worksheet
 */
export async function generateWorksheetPdf(
  content: WorksheetContent
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = PDF_CONFIG.margin;

  // Add header
  y = addPdfHeader(doc, content, y);

  // Add exercises
  for (const exercise of content.exercises) {
    // Check if we need a new page
    if (y > PDF_CONFIG.pageHeight - PDF_CONFIG.exerciseSpacing) {
      doc.addPage();
      y = PDF_CONFIG.margin;
    }

    y = addExerciseNotation(doc, exercise, y);
    y += 10; // Spacing between exercises
  }

  // Add answer key if requested
  if (content.hasAnswerKey) {
    doc.addPage();
    y = PDF_CONFIG.margin;

    // Answer key header
    doc.setFontSize(PDF_CONFIG.titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key', PDF_CONFIG.margin, y);
    y += 12;

    // Answer key exercises
    for (const exercise of content.exercises) {
      if (y > PDF_CONFIG.pageHeight - PDF_CONFIG.exerciseSpacing) {
        doc.addPage();
        y = PDF_CONFIG.margin;
      }

      y = addExerciseNotation(doc, exercise, y, true);
      y += 10;
    }
  }

  return doc.output('blob');
}

/**
 * Generate and download a worksheet PDF
 */
export async function downloadWorksheetPdf(
  rhythmSettings: RhythmSettings,
  worksheetSettings: WorksheetSettings = DEFAULT_WORKSHEET_SETTINGS
): Promise<void> {
  const content = generateWorksheetContent(rhythmSettings, worksheetSettings);
  const blob = await generateWorksheetPdf(content);

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${worksheetSettings.title.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF from rendered notation element
 */
export async function exportNotationToPdf(
  element: HTMLElement,
  filename: string = 'rhythm-pattern.pdf'
): Promise<void> {
  // Use html2canvas to capture the notation
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  doc.save(filename);
}

/**
 * Get worksheet format display name
 */
export function getWorksheetFormatName(format: WorksheetFormat): string {
  switch (format) {
    case 'standard':
      return 'Standard Practice';
    case 'blankCompletion':
      return 'Fill in the Blank';
    case 'quiz':
      return 'Quiz Format';
    default:
      return format;
  }
}

/**
 * Get worksheet format description
 */
export function getWorksheetFormatDescription(format: WorksheetFormat): string {
  switch (format) {
    case 'standard':
      return 'Complete rhythm patterns for practice';
    case 'blankCompletion':
      return 'Patterns with blank measures to fill in';
    case 'quiz':
      return 'Numbered exercises in quiz format';
    default:
      return '';
  }
}
