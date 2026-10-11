import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
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
    A2: true,
    B1: true,
    B2: true,
    C1: true,
  },
  customWords: [],
};

const SETTINGS_KEY = "settings";

export const loadSettings = async (userId?: string): Promise<UserSettings> => {
  if (userId) {
    try {
      const saveFileRef = doc(db, "users", userId);
      const snapshot = await getDoc(saveFileRef);

      if (snapshot.exists() && snapshot.data().settings) {
        const cloudSettings = {
          ...DEFAULT_SETTINGS,
          ...snapshot.data().settings,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudSettings));
        return cloudSettings;
      }
    } catch (error) {
      console.error("Error loading cloud settings:", error);
    }
  }

  return getLocalSettings();
};

export function getLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const saveSettings = async (settings: UserSettings, userId?: string) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  if (userId) {
    try {
      const saveFileRef = doc(db, "users", userId);
      await setDoc(saveFileRef, { settings }, { merge: true });
    } catch (error) {
      console.error("Error saving cloud settings:", error);
    }
  }
};
