import type { NoteValue, RhythmEvent } from './types';

// For uniform groups: count + noteType + duration
// For mixed groups: notes array with individual note specifications
type BeamedGroupDef =
  | { count: number; noteType: NoteValue; duration: number }
  | { notes: Array<{ noteType: NoteValue; duration: number }> };

export const BEAMED_GROUP_INFO: Partial<Record<NoteValue, BeamedGroupDef>> = {
  twoEighths: { count: 2, noteType: 'eighth', duration: 0.5 },
  fourSixteenths: { count: 4, noteType: 'sixteenth', duration: 0.25 },
  twoSixteenths: { count: 2, noteType: 'sixteenth', duration: 0.25 },
  eighthTwoSixteenths: {
    notes: [
      { noteType: 'eighth', duration: 0.5 },
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'sixteenth', duration: 0.25 },
    ],
  },
  twoSixteenthsEighth: {
    notes: [
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'eighth', duration: 0.5 },
    ],
  },
  sixteenthEighthSixteenth: {
    notes: [
      { noteType: 'sixteenth', duration: 0.25 },
      { noteType: 'eighth', duration: 0.5 },
      { noteType: 'sixteenth', duration: 0.25 },
    ],
  },
};

export function isBeamedGroup(noteValue: NoteValue): boolean {
  return noteValue in BEAMED_GROUP_INFO;
}

/**
 * Expand beamed group events into individual note events.
 * Preserves pitch and vexflowKey from the parent event for sight reading.
 */
export function expandBeamedGroups(events: RhythmEvent[]): RhythmEvent[] {
  const expanded: RhythmEvent[] = [];

  for (const event of events) {
    if (event.type === 'note' && isBeamedGroup(event.value as NoteValue)) {
      const groupInfo = BEAMED_GROUP_INFO[event.value as NoteValue]!;

      if ('notes' in groupInfo) {
        groupInfo.notes.forEach((note, i) => {
          expanded.push({
            type: 'note',
            value: note.noteType,
            duration: note.duration,
            isAccented: i === 0 ? event.isAccented : false,
            isTriplet: false,
            pitch: event.pitch,
            vexflowKey: event.vexflowKey,
          });
        });
      } else {
        for (let i = 0; i < groupInfo.count; i++) {
          expanded.push({
            type: 'note',
            value: groupInfo.noteType,
            duration: groupInfo.duration,
            isAccented: i === 0 ? event.isAccented : false,
            isTriplet: false,
            pitch: event.pitch,
            vexflowKey: event.vexflowKey,
          });
        }
      }
    } else {
      expanded.push(event);
    }
  }

  return expanded;
}
