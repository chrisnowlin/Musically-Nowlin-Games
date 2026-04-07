/**
 * Worksheet Generator
 * Creates printable PDF worksheets for rhythm exercises using vector SVG rendering
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  RhythmPattern,
  RhythmSettings,
  WorksheetSettings,
  WorksheetFormat,
  DEFAULT_WORKSHEET_SETTINGS,
  RestValue,
} from './types';
import { generateRhythmPattern } from './rhythmGenerator';
import { addSyllablesToPattern } from './countingSyllables';
import { renderPatternToDiv, expandBeamedGroups } from './rhythmNotation';

// Note: Using html2canvas instead of svg2pdf.js for proper music font rendering

// ============================================
// WORKSHEET CONTENT TYPES
// ============================================

interface WorksheetExercise {
  pattern: RhythmPattern;
  number: number;
  showAnswer: boolean;
  blankMeasures?: number[];
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

export type PageSize = 'letter' | 'a4' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  letter: { width: 215.9, height: 279.4 },
  a4: { width: 210, height: 297 },
  legal: { width: 215.9, height: 355.6 },
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  size: 'letter',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
};

const PDF_STYLES = {
  titleFontSize: 18,
  subtitleFontSize: 11,
  bodyFontSize: 10,
  exerciseLabelFontSize: 12,
  syllableFontSize: 9,
  lineHeight: 1.4,
  exerciseSpacing: 8, // Space between exercises in mm
  notationHeight: 35, // Height reserved for notation in mm
  syllableRowHeight: 6, // Height for syllables below notation
};

// ============================================
// IMAGE-BASED NOTATION RENDERING
// ============================================

/**
 * Render a rhythm pattern to a canvas image for PDF export
 * Uses html2canvas to properly capture VexFlow's music fonts
 */
export async function renderPatternToImage(
  pattern: RhythmPattern,
  width: number = 500,
  showSyllables: boolean = true
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Create a temporary container that's visible for proper rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '10px';
  container.style.zIndex = '99999'; // Make it visible for html2canvas
  document.body.appendChild(container);

  try {
    // Render the notation using VexFlow
    const result = renderPatternToDiv(container, pattern, {
      containerWidth: width - 20, // Account for padding
      width: width - 20,
      height: 80,
      staffLineMode: pattern.settings.staffLineMode,
      stemDirection: pattern.settings.stemDirection,
    });

    // Add syllables if enabled
    if (showSyllables && pattern.settings.countingSystem !== 'none') {
      const syllablesContainer = document.createElement('div');
      syllablesContainer.style.display = 'flex';
      syllablesContainer.style.justifyContent = 'flex-start';
      syllablesContainer.style.gap = '0';
      syllablesContainer.style.paddingLeft = '10px';
      syllablesContainer.style.paddingTop = '2px';
      syllablesContainer.style.fontFamily = 'Arial, sans-serif';
      syllablesContainer.style.fontSize = '11px';
      syllablesContainer.style.color = '#374151';
      syllablesContainer.style.position = 'relative';
      syllablesContainer.style.height = '18px';

      // Get syllables from the pattern
      result.notePositions.forEach((pos) => {
        let syllable: string | undefined;
        let eventIndex = 0;
        for (const measure of pattern.measures) {
          const expandedEvents = expandBeamedGroups(measure.events);
          for (const event of expandedEvents) {
            if (eventIndex === pos.globalIndex) {
              syllable = event.syllable;
              break;
            }
            eventIndex++;
          }
          if (syllable !== undefined) break;
        }

        if (syllable) {
          const syllableSpan = document.createElement('span');
          syllableSpan.textContent = syllable;
          syllableSpan.style.position = 'absolute';
          syllableSpan.style.left = `${pos.x}px`;
          syllableSpan.style.transform = 'translateX(-50%)';
          syllablesContainer.appendChild(syllableSpan);
        }
      });

      container.appendChild(syllablesContainer);
    }

    // Wait for fonts to load
    await document.fonts.ready;

    // Small delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Use html2canvas to capture the rendered notation
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution for crisp output
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const imageWidth = canvas.width / 2; // Divide by scale
    const imageHeight = canvas.height / 2;

    return { dataUrl, width: imageWidth, height: imageHeight };
  } finally {
    // Always clean up
    document.body.removeChild(container);
  }
}

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
    const variantSettings: RhythmSettings = {
      ...baseSettings,
      syncopationProbability: Math.min(
        100,
        baseSettings.syncopationProbability + i * 15
      ),
      restProbability: Math.max(0, baseSettings.restProbability - i * 5),
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
    number: 0,
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
  parts.push(`Time Signature: ${rhythmSettings.timeSignature}`);
  parts.push(`Tempo: ${rhythmSettings.tempo} BPM`);

  if (worksheetSettings.format === 'blankCompletion') {
    parts.push('Fill in the blank measures');
  } else if (worksheetSettings.format === 'quiz') {
    parts.push('Quiz');
  }

  return parts.join('  •  ');
}

/**
 * Get page dimensions based on settings
 */
function getPageDimensions(pageSettings: PageSettings): {
  width: number;
  height: number;
} {
  const baseDims = PAGE_DIMENSIONS[pageSettings.size];
  if (pageSettings.orientation === 'landscape') {
    return { width: baseDims.height, height: baseDims.width };
  }
  return baseDims;
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
  pageSettings: PageSettings,
  yOffset: number
): number {
  const { title, subtitle, settings } = content;
  const { margins } = pageSettings;
  const pageDims = getPageDimensions(pageSettings);
  let y = yOffset;

  // Title
  doc.setFontSize(PDF_STYLES.titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margins.left, y);
  y += 7;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(PDF_STYLES.subtitleFontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, margins.left, y);
    doc.setTextColor(0, 0, 0);
    y += 5;
  }

  // Name and Date fields
  if (settings.includeNameField || settings.includeDateField) {
    y += 4;
    doc.setFontSize(PDF_STYLES.bodyFontSize);
    doc.setFont('helvetica', 'normal');

    if (settings.includeNameField) {
      doc.text('Name: ___________________________', margins.left, y);
    }

    if (settings.includeDateField) {
      const dateX = settings.includeNameField
        ? pageDims.width / 2
        : margins.left;
      doc.text('Date: ________________', dateX, y);
    }

    y += 6;
  }

  // Divider line
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margins.left, y, pageDims.width - margins.right, y);
  y += 6;

  return y;
}

/**
 * Add exercise notation to PDF using image rendering
 * Uses html2canvas to capture VexFlow with proper music fonts
 */
async function addExerciseNotation(
  doc: jsPDF,
  exercise: WorksheetExercise,
  pageSettings: PageSettings,
  yOffset: number,
  isAnswerKey: boolean = false
): Promise<number> {
  const { margins } = pageSettings;
  const pageDims = getPageDimensions(pageSettings);
  const contentWidth = pageDims.width - margins.left - margins.right;
  let y = yOffset;

  // Exercise label
  doc.setFontSize(PDF_STYLES.exerciseLabelFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`${exercise.number}.`, margins.left, y);

  // Render the pattern to image (syllables disabled for cleaner worksheet output)
  const showSyllables = false;

  // Calculate image width based on available PDF space (convert mm to px, roughly 3.78 px/mm)
  const imageWidthPx = Math.round(contentWidth * 3.78);

  let imageData: { dataUrl: string; width: number; height: number };
  try {
    // For blank completion exercises in non-answer-key mode, we need to handle blank measures
    if (exercise.blankMeasures?.length && !isAnswerKey) {
      // Create a modified pattern with blank measures
      const modifiedPattern: RhythmPattern = {
        ...exercise.pattern,
        measures: exercise.pattern.measures.map((measure, idx) => {
          if (exercise.blankMeasures?.includes(idx)) {
            // Return empty measure placeholder
            return {
              ...measure,
              events: [
                {
                  type: 'rest' as const,
                  value: 'wholeRest' as RestValue,
                  duration: measure.events.reduce((sum, e) => sum + e.duration, 0),
                },
              ],
            };
          }
          return measure;
        }),
      };
      imageData = await renderPatternToImage(modifiedPattern, imageWidthPx, false);
    } else {
      imageData = await renderPatternToImage(
        exercise.pattern,
        imageWidthPx,
        false // No syllables in worksheet exports
      );
    }
  } catch (error) {
    // Fallback to text-based rendering if image fails
    console.error('Image rendering failed, using text fallback:', error);
    return addTextExercise(doc, exercise, pageSettings, yOffset, isAnswerKey);
  }

  // Calculate PDF dimensions (scale to fit content width)
  const scale = Math.min(1, (contentWidth - 10) / (imageData.width / 3.78));
  const pdfWidth = (imageData.width / 3.78) * scale;
  const pdfHeight = (imageData.height / 3.78) * scale;

  // Position after exercise label
  const imageX = margins.left + 8;
  const imageY = y - 3;

  try {
    // Add image to PDF
    doc.addImage(
      imageData.dataUrl,
      'PNG',
      imageX,
      imageY,
      pdfWidth,
      pdfHeight
    );
  } catch (error) {
    console.error('addImage failed:', error);
    // Fallback to text
    return addTextExercise(doc, exercise, pageSettings, yOffset, isAnswerKey);
  }

  y += pdfHeight + PDF_STYLES.exerciseSpacing;

  // Add "blank measures" indicator if applicable
  if (exercise.blankMeasures?.length && !isAnswerKey) {
    doc.setFontSize(PDF_STYLES.bodyFontSize);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `(Fill in measure${exercise.blankMeasures.length > 1 ? 's' : ''} ${exercise.blankMeasures.map((i) => i + 1).join(', ')})`,
      margins.left + 8,
      y
    );
    doc.setTextColor(0, 0, 0);
    y += 5;
  }

  return y;
}

/**
 * Fallback text-based exercise rendering
 */
function addTextExercise(
  doc: jsPDF,
  exercise: WorksheetExercise,
  pageSettings: PageSettings,
  yOffset: number,
  isAnswerKey: boolean = false
): number {
  const { margins } = pageSettings;
  let y = yOffset;

  // Exercise label
  doc.setFontSize(PDF_STYLES.exerciseLabelFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`${exercise.number}.`, margins.left, y);
  y += 6;

  // Pattern text representation
  doc.setFontSize(PDF_STYLES.bodyFontSize);
  doc.setFont('courier', 'normal');

  exercise.pattern.measures.forEach((measure, mIdx) => {
    const isBlank = exercise.blankMeasures?.includes(mIdx) && !isAnswerKey;

    if (isBlank) {
      doc.text(
        `  Measure ${mIdx + 1}: [________________________________]`,
        margins.left,
        y
      );
    } else {
      const events = measure.events
        .map((e) => {
          if (e.type === 'rest') return '—';
          return e.syllable || e.value;
        })
        .join('  ');
      doc.text(`  Measure ${mIdx + 1}: ${events}`, margins.left, y);
    }
    y += 5;
  });

  y += 4;

  // Show syllables in answer key
  if (isAnswerKey && exercise.pattern.settings.countingSystem !== 'none') {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const syllables = exercise.pattern.measures
      .flatMap((m) => m.events.map((e) => e.syllable || ''))
      .filter(Boolean)
      .join('  ');
    if (syllables) {
      doc.text(`  Syllables: ${syllables}`, margins.left, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }
  }

  return y;
}

/**
 * Generate a complete PDF worksheet with vector notation
 */
export async function generateWorksheetPdf(
  content: WorksheetContent,
  pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS
): Promise<Blob> {
  const pageDims = getPageDimensions(pageSettings);
  const { margins } = pageSettings;

  const doc = new jsPDF({
    orientation: pageSettings.orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: pageSettings.size,
  });

  let y = margins.top;

  // Add header
  y = addPdfHeader(doc, content, pageSettings, y);

  // Calculate available height for exercises
  const maxY = pageDims.height - margins.bottom - 10;

  // Add exercises
  for (const exercise of content.exercises) {
    // Estimate exercise height
    const estimatedHeight = PDF_STYLES.notationHeight + PDF_STYLES.exerciseSpacing;

    // Check if we need a new page
    if (y + estimatedHeight > maxY) {
      doc.addPage();
      y = margins.top;
    }

    y = await addExerciseNotation(doc, exercise, pageSettings, y);
    y += 5; // Extra spacing between exercises
  }

  // Add answer key if requested
  if (content.hasAnswerKey) {
    doc.addPage();
    y = margins.top;

    // Answer key header
    doc.setFontSize(PDF_STYLES.titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key', margins.left, y);
    y += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margins.left, y, pageDims.width - margins.right, y);
    y += 8;

    // Answer key exercises
    for (const exercise of content.exercises) {
      const estimatedHeight = PDF_STYLES.notationHeight + PDF_STYLES.exerciseSpacing;

      if (y + estimatedHeight > maxY) {
        doc.addPage();
        y = margins.top;
      }

      y = await addExerciseNotation(doc, exercise, pageSettings, y, true);
      y += 5;
    }
  }

  // Add footer with generation info
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by Rhythm Randomizer`,
      margins.left,
      pageDims.height - 8
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageDims.width - margins.right - 20,
      pageDims.height - 8
    );
    doc.setTextColor(0, 0, 0);
  }

  return doc.output('blob');
}

/**
 * Generate and download a worksheet PDF
 */
export async function downloadWorksheetPdf(
  rhythmSettings: RhythmSettings,
  worksheetSettings: WorksheetSettings = DEFAULT_WORKSHEET_SETTINGS,
  pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS
): Promise<void> {
  const content = generateWorksheetContent(rhythmSettings, worksheetSettings);
  const blob = await generateWorksheetPdf(content, pageSettings);

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
 * Generate a PDF preview URL (for iframe display)
 */
export async function generatePreviewUrl(
  rhythmSettings: RhythmSettings,
  worksheetSettings: WorksheetSettings = DEFAULT_WORKSHEET_SETTINGS,
  pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS
): Promise<string> {
  const content = generateWorksheetContent(rhythmSettings, worksheetSettings);
  const blob = await generateWorksheetPdf(content, pageSettings);
  return URL.createObjectURL(blob);
}

/**
 * Export current pattern notation to PDF (quick single-pattern export)
 */
export async function exportPatternToPdf(
  pattern: RhythmPattern,
  filename: string = 'rhythm-pattern.pdf',
  pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS
): Promise<void> {
  const pageDims = getPageDimensions(pageSettings);
  const { margins } = pageSettings;

  const doc = new jsPDF({
    orientation: pageSettings.orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: pageSettings.size,
  });

  const contentWidth = pageDims.width - margins.left - margins.right;
  const imageWidthPx = Math.round(contentWidth * 3.78);

  // Render pattern to image (syllables disabled for cleaner output)
  const imageData = await renderPatternToImage(pattern, imageWidthPx, false);

  const scale = Math.min(1, contentWidth / (imageData.width / 3.78));
  const pdfWidth = (imageData.width / 3.78) * scale;
  const pdfHeight = (imageData.height / 3.78) * scale;

  // Center horizontally
  const x = (pageDims.width - pdfWidth) / 2;
  const y = margins.top + 20;

  // Add title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rhythm Pattern', pageDims.width / 2, margins.top + 10, {
    align: 'center',
  });

  // Add time signature info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${pattern.settings.timeSignature}  •  ${pattern.settings.tempo} BPM`,
    pageDims.width / 2,
    margins.top + 16,
    { align: 'center' }
  );
  doc.setTextColor(0, 0, 0);

  // Add image
  doc.addImage(
    imageData.dataUrl,
    'PNG',
    x,
    y,
    pdfWidth,
    pdfHeight
  );

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
