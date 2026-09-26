import type { CardProgress, DictionaryEntry, CEFRLevel } from "../types";

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
  levels: CEFRLevel[],
  newCardsLimit: number,
  customWords: string[] = [],
): DictionaryEntry[] {
  if (!data || data.length === 0) return [];

  const saved = loadCardProgress();
  const todayStr = new Date().toISOString().split("T")[0];

  // Unique key like "B2-800" or "A1-800"
  const studiedKeys = new Set(saved.map((c) => `${c.level}-${c.wordId}`));
  const unstudiedWords = data.filter(
    (w) => !studiedKeys.has(`${w.level}-${w.id}`),
  );

  const customSet = new Set(customWords.map((w) => w.toLowerCase()));

  const unstudiedCustom = unstudiedWords.filter((w) =>
    customSet.has(w.w.toLowerCase()),
  );
  const unstudiedPool = unstudiedWords.filter(
    (w) => !customSet.has(w.w.toLowerCase()),
  );

  // Take custom words first (up to the daily limit)
  const pickedCustom = unstudiedCustom.slice(0, newCardsLimit);

  // Fill the remaining quota with random words from the pool
  const remainingQuota = newCardsLimit - pickedCustom.length;
  const shuffledPool = [...unstudiedPool].sort(() => Math.random() - 0.5);
  const pickedPool =
    levels.length > 0 ? shuffledPool.slice(0, remainingQuota) : [];

  // Combine both to form today's new cards
  const subset: DictionaryEntry[] = [...pickedCustom, ...pickedPool];

  // Add due review words
  saved.forEach((card) => {
    if (card.dueDate <= todayStr) {
      const isLevelSelected = levels.includes(card.level as CEFRLevel);
      const dueWord = data.find(
        (w) => w.id === card.wordId && w.level === card.level,
      );
      if (
        dueWord &&
        (isLevelSelected || customSet.has(dueWord.w.toLowerCase()))
      ) {
        subset.push(dueWord);
      }
    }
  });

  return subset;
}
