import type { CardProgress, DictionaryEntry } from "../types";

export const STORAGE_KEY = "cardProgress";

export function loadCardProgress(): CardProgress[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCardProgress(progress: CardProgress[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function calculateNextReview(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number,
): [number, number, number] {
  // 1. Ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // 2. Interval & Reps
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  return [easeFactor, interval, repetitions];
}

export function buildDailySubset(
  data: DictionaryEntry[],
  level: string,
  newCardsLimit: number,
): DictionaryEntry[] {
  if (!data || data.length === 0) return [];

  const saved = loadCardProgress();
  const todayStr = new Date().toISOString().split("T")[0];

  const studiedIds = new Set(saved.map((c) => c.wordId));
  const unstudiedWords = data.filter((w) => !studiedIds.has(w.id));

  // Pick random unstudied words
  const shuffled = [...unstudiedWords].sort(() => Math.random() - 0.5);
  const subset = shuffled.slice(0, newCardsLimit);

  // Add due review words
  saved.forEach((card) => {
    if (card.dueDate <= todayStr && card.level === level) {
      const dueWord = data.find((w) => w.id === card.wordId);
      if (dueWord) subset.push(dueWord);
    }
  });

  return subset;
}
