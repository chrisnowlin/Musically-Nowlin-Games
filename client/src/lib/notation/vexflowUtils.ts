import { Clef } from '@/components/StaffWarsGame';

export interface StaffData {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  clef: Clef;
  staffY: number;
  staffX: number;
  staffWidth: number;
}

// Map note names to VexFlow note strings
const NOTE_MAP: Record<string, string> = {
  'C2': 'c/2', 'D2': 'd/2', 'E2': 'e/2', 'F2': 'f/2', 'G2': 'g/2', 'A2': 'a/2', 'B2': 'b/2',
  'C3': 'c/3', 'D3': 'd/3', 'E3': 'e/3', 'F3': 'f/3', 'G3': 'g/3', 'A3': 'a/3', 'B3': 'b/3',
  'C4': 'c/4', 'D4': 'd/4', 'E4': 'e/4', 'F4': 'f/4', 'G4': 'g/4', 'A4': 'a/4', 'B4': 'b/4',
  'C5': 'c/5', 'D5': 'd/5', 'E5': 'e/5', 'F5': 'f/5', 'G5': 'g/5', 'A5': 'a/5', 'B5': 'b/5',
  'C6': 'c/6', 'D6': 'd/6', 'E6': 'e/6', 'F6': 'f/6', 'G6': 'g/6', 'A6': 'a/6', 'B6': 'b/6',
};

export function initializeStaff(canvas: HTMLCanvasElement, clef: Clef): StaffData {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const staffY = height / 2;
  const staffX = 50;
  const staffWidth = width - 100;

  // Draw staff lines
  drawStaff(ctx, staffX, staffY, staffWidth, clef);

  return { canvas, ctx, clef, staffY, staffX, staffWidth };
}

function drawStaff(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, clef: Clef) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Draw 5 staff lines with increased spacing
  const lineSpacing = 15;
  for (let i = 0; i < 5; i++) {
    const lineY = y + i * lineSpacing;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  // Draw clef symbol (1.8x scale = 108px, normal weight)
  ctx.fillStyle = '#ffffff';
  ctx.font = '108px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const clefSymbol = clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡';
  
  // Position clef on correct staff line
  // For treble clef: the curl wraps around G line (2nd from bottom = line 3)
  // The baseline of the character should align so the curl is on that line
  // Staff lines: line 0=y, line 1=y+15, line 2=y+30, line 3=y+45, line 4=y+60
  // Treble clef: position baseline at y+65 so the curl sits on line 3 (y+45)
  const clefY = clef === 'treble' ? y + 65 : clef === 'bass' ? y + 65 : y + 50;
  ctx.fillText(clefSymbol, x + 10, clefY);
}

export function getNotePosition(staffData: StaffData, noteName: string): number {
  // Map each note to its position relative to the middle line (0 = middle line)
  // Positive numbers go DOWN (lower on staff), negative go UP (higher on staff)
  // Each step is 7.5 pixels (half the distance between staff lines - 15px spacing / 2)

  const treblePositions: Record<string, number> = {
    // Treble clef - Lines: E4, G4, B4, D5, F5 | Spaces: F4, A4, C5, E5
    'C6': -8, 'B5': -7, 'A5': -6, 'G5': -5,
    'F5': -4,  // Line 5 (top line)
    'E5': -3,  // Space 4
    'D5': -2,  // Line 4
    'C5': -1,  // Space 3
    'B4': 0,   // Line 3 (middle line)
    'A4': 1,   // Space 2
    'G4': 2,   // Line 2
    'F4': 3,   // Space 1
    'E4': 4,   // Line 1 (bottom line)
    'D4': 5, 'C4': 6, 'B3': 7, 'A3': 8, 'G3': 9,
    'F3': 10, 'E3': 11, 'D3': 12, 'C3': 13,
  };

  const bassPositions: Record<string, number> = {
    // Bass clef - Lines: G2, B2, D3, F3, A3 | Spaces: A2, C3, E3, G3
    'C4': -6, 'B3': -5,
    'A3': -4,  // Line 5 (top line)
    'G3': -3,  // Space 4
    'F3': -2,  // Line 4
    'E3': -1,  // Space 3
    'D3': 0,   // Line 3 (middle line)
    'C3': 1,   // Space 2
    'B2': 2,   // Line 2
    'A2': 3,   // Space 1
    'G2': 4,   // Line 1 (bottom line)
    'F2': 5, 'E2': 6, 'D2': 7, 'C2': 8,
  };

  const altoPositions: Record<string, number> = {
    // Alto clef - Lines: F3, A3, C4, E4, G4 | Spaces: G3, B3, D4, F4
    'C5': -7, 'B4': -6, 'A4': -5,
    'G4': -4,  // Line 5 (top line)
    'F4': -3,  // Space 4
    'E4': -2,  // Line 4
    'D4': -1,  // Space 3
    'C4': 0,   // Line 3 (middle line - Middle C)
    'B3': 1,   // Space 2
    'A3': 2,   // Line 2
    'G3': 3,   // Space 1
    'F3': 4,   // Line 1 (bottom line)
    'E3': 5, 'D3': 6, 'C3': 7,
  };

  // Select the appropriate position map based on clef
  let positionMap: Record<string, number>;
  switch (staffData.clef) {
    case 'treble':
      positionMap = treblePositions;
      break;
    case 'bass':
      positionMap = bassPositions;
      break;
    case 'alto':
      positionMap = altoPositions;
      break;
    case 'grand':
      positionMap = treblePositions; // Use treble for grand staff
      break;
    default:
      positionMap = treblePositions;
  }

  // Get position offset for this note
  const offset = positionMap[noteName];
  if (offset === undefined) {
    return staffData.staffY + 30; // Default to middle line if note not found
  }

  // Calculate Y position: middle line + (offset * 7.5 pixels per step)
  return staffData.staffY + 30 + (offset * 7.5);
}

export function renderNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  noteName: string,
  feedback: 'correct' | 'incorrect' | null,
  staffData?: StaffData
): void {
  // Draw a note head at the specified position (larger)
  const radius = 12;

  // Draw ledger lines if note is outside the staff
  if (staffData) {
    const staffY = staffData.staffY + 30; // Middle line position
    const relativeY = y - staffY;
    const lineSpacing = 15; // Updated to match new staff line spacing

    // Determine if we need ledger lines above or below the staff
    // Staff lines are at: -30, -15, 0, +15, +30 relative to middle line
    const topStaffLine = -30;
    const bottomStaffLine = 30;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Ledger lines above the staff (for high notes)
    if (relativeY < topStaffLine) {
      // Start from first ledger line above staff and work up
      for (let ledgerY = topStaffLine - lineSpacing; ledgerY >= relativeY; ledgerY -= lineSpacing) {
        // Only draw ledger line if it's at the note position or for lines, not spaces
        const needsLine = Math.abs(ledgerY - relativeY) < 3.75;
        if (needsLine) {
          const absoluteY = staffY + ledgerY;
          ctx.beginPath();
          ctx.moveTo(x - 20, absoluteY);
          ctx.lineTo(x + 20, absoluteY);
          ctx.stroke();
        }
      }
    }

    // Ledger lines below the staff (for low notes)
    if (relativeY > bottomStaffLine) {
      // Start from first ledger line below staff and work down
      for (let ledgerY = bottomStaffLine + lineSpacing; ledgerY <= relativeY; ledgerY += lineSpacing) {
        // Only draw ledger line if it's at the note position or for lines, not spaces
        const needsLine = Math.abs(ledgerY - relativeY) < 3.75;
        if (needsLine) {
          const absoluteY = staffY + ledgerY;
          ctx.beginPath();
          ctx.moveTo(x - 20, absoluteY);
          ctx.lineTo(x + 20, absoluteY);
          ctx.stroke();
        }
      }
    }
  }

  // Set color based on feedback
  let noteColor: string;
  if (feedback === 'correct') {
    noteColor = '#22c55e'; // Green
  } else if (feedback === 'incorrect') {
    noteColor = '#ef4444'; // Red
  } else {
    noteColor = '#93c5fd'; // Light blue
  }

  // Draw whole note as a thick-stroked oval (creates filled ring with transparent center)
  ctx.strokeStyle = noteColor;
  ctx.lineWidth = 6; // Thick stroke creates the filled "ring" effect
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.75, radius * 0.9, -0.3, 0, Math.PI * 2);
  ctx.stroke();
}

