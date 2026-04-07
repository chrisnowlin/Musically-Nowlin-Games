import type { WorksheetFormat } from './types';

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

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  size: 'letter',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
};

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
