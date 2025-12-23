/**
 * Note Value Selector Component
 * Checkbox grid for selecting allowed note values and rest values
 * Uses Bravura font with SMuFL codepoints for consistent music notation display
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NoteValue, RestValue } from '@/lib/rhythmRandomizer/types';

interface NoteValueSelectorProps {
  selectedValues: NoteValue[];
  selectedRestValues: RestValue[];
  onNoteValuesChange: (values: NoteValue[]) => void;
  onRestValuesChange: (values: RestValue[]) => void;
}

interface NoteOption {
  value: NoteValue;
  label: string;
  symbol: string;
  beats: string;
}

interface RestOption {
  value: RestValue;
  label: string;
  symbol: string;
  beats: string;
}

// SMuFL codepoints for Bravura font
// Individual notes range: U+E1D0-U+E1EF
// Rests range: U+E4E0-U+E4FF
// Text-combining beamed notes: U+E1F0-U+E20A
// Structure: firstNote + continuingBeam(s) + lastNoteWithFractionalBeam
const NOTE_OPTIONS: NoteOption[] = [
  { value: 'whole', label: 'Whole', symbol: '\uE1D2', beats: '4 beats' },              // noteWhole
  { value: 'half', label: 'Half', symbol: '\uE1D3', beats: '2 beats' },                // noteHalfUp
  { value: 'quarter', label: 'Quarter', symbol: '\uE1D5', beats: '1 beat' },           // noteQuarterUp
  { value: 'eighth', label: 'Eighth', symbol: '\uE1D7', beats: '½ beat' },             // note8thUp
  // Two eighths: blackNote + cont8thBeam + fractional8th (long stems)
  { value: 'twoEighths', label: '2 Eighths', symbol: '\uE1F1\uE1F8\uE1F3', beats: '1 beat' },
  { value: 'sixteenth', label: 'Sixteenth', symbol: '\uE1D9', beats: '¼ beat' },       // note16thUp
  // Two 16ths: SHORT STEM versions - blackNote + cont8thBeam + cont16thBeam + fractional16th
  { value: 'twoSixteenths', label: '2 Sixteenths', symbol: '\uE1F0\uE1F7\uE1F9\uE1F4', beats: '½ beat' },
  // Four 16ths: single beamed group with short stems
  { value: 'fourSixteenths', label: '4 Sixteenths', symbol: '\uE1F0\uE1F7\uE1F9\uE1F0\uE1F7\uE1F9\uE1F0\uE1F7\uE1F9\uE1F4', beats: '1 beat' },
  // Mixed eighth + sixteenth beamed groups
  { value: 'eighthTwoSixteenths', label: '8th+2 16ths', symbol: '\uE1F1\uE1F8\uE1FA\uE1F5', beats: '1 beat' },
  { value: 'twoSixteenthsEighth', label: '2 16ths+8th', symbol: '\uE1F1\uE1FA\uE1F5\uE1F3', beats: '1 beat' },
  { value: 'sixteenthEighthSixteenth', label: '16th+8th+16th', symbol: '\uE1F1\uE1FA\uE1F8\uE1F5', beats: '1 beat' },
];

const REST_OPTIONS: RestOption[] = [
  { value: 'wholeRest', label: 'Whole Rest', symbol: '\uE4E3', beats: '4 beats' },     // restWhole
  { value: 'halfRest', label: 'Half Rest', symbol: '\uE4E4', beats: '2 beats' },       // restHalf
  { value: 'quarterRest', label: 'Quarter Rest', symbol: '\uE4E5', beats: '1 beat' },  // restQuarter
  { value: 'eighthRest', label: 'Eighth Rest', symbol: '\uE4E6', beats: '½ beat' },    // rest8th
  { value: 'sixteenthRest', label: 'Sixteenth Rest', symbol: '\uE4E7', beats: '¼ beat' }, // rest16th
];

/**
 * Beamed-group rendering config.
 *
 * Why this exists:
 * - The SMuFL beamed-group block uses multiple glyphs that must be tightly kerned/overlapped.
 * - A single global `letter-spacing` can't independently overlap the *beam stack* (8th+16th)
 *   without also collapsing the noteheads.
 */
// Beamed group configurations using SMuFL text-combining glyphs (long stem versions)
// These render as a single text string with letter-spacing to control overlap
const BEAMED_GROUP_CONFIG: Record<
  'twoEighths' | 'twoSixteenths' | 'fourSixteenths' | 'eighthTwoSixteenths' | 'twoSixteenthsEighth' | 'sixteenthEighthSixteenth',
  { symbol: string; letterSpacing: string }
> = {
  twoEighths: {
    // blackNoteLongStem + cont8thBeamLong + frac8thLong
    symbol: '\uE1F1\uE1F8\uE1F3',
    letterSpacing: '-0.01em',
  },
  twoSixteenths: {
    // blackNoteLongStem + cont8thBeamLong + cont16thBeamLong + frac16thLong
    symbol: '\uE1F1\uE1FA\uE1F5',
    letterSpacing: '-0.01em',
  },
  fourSixteenths: {
    // Four 16ths with long stems: (note + beams) x3 + final note with frac beam
    symbol: '\uE1F1\uE1FA\uE1F5\uE1FA\uE1F5\uE1FA\uE1F5',
    letterSpacing: '-0.02em',
  },
  eighthTwoSixteenths: {
    // Eighth + two sixteenths: note + 8thBeam + two 16ths with partial beam
    symbol: '\uE1F1\uE1F8\uE1F3\uE1FA\uE1F5',
    letterSpacing: '-0.01em',
  },
  twoSixteenthsEighth: {
    // Two sixteenths + eighth: 16th + 16th partial beam + 8th final
    symbol: '\uE1F1\uE1FA\uE1F5\uE1F3',
    letterSpacing: '-0.01em',
  },
  sixteenthEighthSixteenth: {
    // Sixteenth + eighth + sixteenth: syncopated pattern
    symbol: '\uE1F1\uE1FA\uE1F3\uE1F8\uE1F5',
    letterSpacing: '-0.01em',
  },
};

function getBeamedGroupConfig(value: NoteValue) {
  return (BEAMED_GROUP_CONFIG as Partial<
    Record<NoteValue, { symbol: string; letterSpacing: string }>
  >)[value];
}

export function NoteValueSelector({
  selectedValues,
  selectedRestValues,
  onNoteValuesChange,
  onRestValuesChange
}: NoteValueSelectorProps) {
  const handleNoteToggle = (noteValue: NoteValue) => {
    if (selectedValues.includes(noteValue)) {
      // Don't allow deselecting the last note value
      if (selectedValues.length > 1) {
        onNoteValuesChange(selectedValues.filter((v) => v !== noteValue));
      }
    } else {
      onNoteValuesChange([...selectedValues, noteValue]);
    }
  };

  const handleRestToggle = (restValue: RestValue) => {
    if (selectedRestValues.includes(restValue)) {
      onRestValuesChange(selectedRestValues.filter((v) => v !== restValue));
    } else {
      onRestValuesChange([...selectedRestValues, restValue]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notes Section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Notes</Label>
        <div className="grid grid-cols-2 gap-2">
          {NOTE_OPTIONS.map((option) => {
            const beamedConfig = getBeamedGroupConfig(option.value);
            const isSelected = selectedValues.includes(option.value);

            return (
              <label
                key={option.value}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                  ${isSelected
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleNoteToggle(option.value)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl leading-none flex-shrink-0"
                      style={{
                        // Use Bravura Text for beamed groups (text-combining glyph metrics), regular Bravura for single notes
                        fontFamily: beamedConfig ? '"Bravura Text", Bravura, serif' : 'Bravura, serif',
                        fontKerning: 'normal',
                        fontFeatureSettings: '"kern" 1, "liga" 1',
                        textRendering: 'optimizeLegibility',
                        whiteSpace: 'nowrap',
                        letterSpacing: beamedConfig?.letterSpacing ?? 'normal',
                      }}
                    >
                      {beamedConfig ? beamedConfig.symbol : option.symbol}
                    </span>
                    <span className="text-sm font-medium truncate">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{option.beats}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rests Section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Rests</Label>
        <div className="grid grid-cols-2 gap-2">
          {REST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                ${selectedRestValues.includes(option.value)
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Checkbox
                checked={selectedRestValues.includes(option.value)}
                onCheckedChange={() => handleRestToggle(option.value)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl leading-none flex-shrink-0"
                    style={{
                      fontFamily: 'Bravura, serif',
                      fontKerning: 'normal',
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      textRendering: 'optimizeLegibility',
                    }}
                  >
                    {option.symbol}
                  </span>
                  <span className="text-sm font-medium truncate">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">{option.beats}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
