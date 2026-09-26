import type { CEFRLevel } from "../types";

export interface UserSettings {
  newWordsPerDay: number;
  selectedLevels: Record<CEFRLevel, boolean>;
  customWords: string[];
}

export const DEFAULT_SETTINGS: UserSettings = {
  newWordsPerDay: 10,
  selectedLevels: {
    A1: true,
    A2: false,
    B1: false,
    B2: false,
    C1: false,
  },
  customWords: [],
};

const SETTINGS_KEY = "ortho_settings";

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
