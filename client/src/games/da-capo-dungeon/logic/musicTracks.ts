export interface MusicTrack {
  id: string;
  name: string;
  emoji: string;
  filename: string;
  category: 'ambient' | 'battle';
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'cathedral', name: 'Cathedral in the Cavern', emoji: '🏰', filename: 'Cathedral in the Cavern.mp3', category: 'ambient' },
  { id: 'galactic', name: 'Galactic Groove', emoji: '🌌', filename: 'Galactic Groove.mp3', category: 'ambient' },
  { id: 'gentle-steps', name: 'Gentle Steps Through the Green', emoji: '🌿', filename: 'gentle-steps-through-the-green.mp3', category: 'ambient' },
  { id: 'dungeon-run', name: 'Dungeon Run', emoji: '⚔️', filename: 'Dungeon Run.mp3', category: 'battle' },
  { id: 'bloodsteel', name: 'Dungeon Run: Bloodsteel', emoji: '🩸', filename: 'Dungeon Run_ Bloodsteel.mp3', category: 'battle' },
];
