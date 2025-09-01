// src/presets.js
export const PRESETS = {
  auto: { label: "Auto", desc: "Let the app pick the best mode" },
  general: { label: "General", desc: "Good default for most photos" },
  darkNavies: { label: "Dark Navies", desc: "Keep very dark pixels & bias toward blue" },
  whiteBackdrop: { label: "White Backdrop", desc: "Fight white backgrounds washing colors out" }
};

// Options passed to usePalette.extract(...)
export const PRESET_OPTIONS = {
  general: {
    maxWidth: 640,
    targetSamples: 30000,
    ignoreWhites: true,
    ignoreBlacks: true,
    chromaticBoost: 1.2,
    ensureBlue: false
  },
  darkNavies: {
    maxWidth: 640,
    targetSamples: 30000,
    ignoreWhites: true,
    ignoreBlacks: false,
    chromaticBoost: 1.25,
    ensureBlue: true,
    blueHueRange: [180, 285],
    blueDupes: 3,
    maxBlueDupes: 4000
  },
  whiteBackdrop: {
    maxWidth: 640,
    targetSamples: 30000,
    ignoreWhites: true,
    whiteThresh: 252,
    ignoreBlacks: false,
    minChroma: 6,
    chromaticBoost: 1.2,
    ensureBlue: true
  }
};
