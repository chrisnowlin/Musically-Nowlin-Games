export const TIMBRE_002_MODES = [
  "quality",
  "texture",
  "presence",
] as const;

export type Timbre002Mode = typeof TIMBRE_002_MODES[number];

export const MODE_DESCRIPTIONS = {
  quality: "Identify timbral qualities like bright, dark, warm, or cold",
  texture: "Recognize sound textures: smooth, rough, percussive, or sustained",
  presence: "Determine spatial presence: close, distant, spacious, or intimate",
};
