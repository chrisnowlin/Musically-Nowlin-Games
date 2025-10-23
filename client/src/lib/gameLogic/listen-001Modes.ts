export const LISTEN_001_MODES = [
  "forms",
  "styles",
] as const;

export type Listen001Mode = typeof LISTEN_001_MODES[number];

export const MODE_DESCRIPTIONS = {
  forms: "Identify musical forms like binary, ternary, rondo, and sonata",
  styles: "Recognize musical styles from Baroque to modern periods",
};
