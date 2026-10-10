import type {
  CardProgress,
  DictionaryEntry,
  CEFRLevel,
  QuizCard,
} from "../types";

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
): QuizCard[] {
  if (!data || data.length === 0) return [];

  const saved = loadCardProgress();
  const todayStr = new Date().toISOString().split("T")[0];

  // Compound key: "level-wordId-senseId"
  const studiedKeys = new Set(
    saved.map((c) => `${c.level}-${c.wordId}-${c.senseId}`),
  );

  // For each word, find its earliest unstudied sense (0, 1, ...)
  // Introduces sense 0 first, and higher senses as the user progresses.
  const unstudiedCards: QuizCard[] = [];
  data.forEach((w) => {
    const nextSenseId = (w.s || []).findIndex(
      (_, idx) => !studiedKeys.has(`${w.level}-${w.id}-${idx}`),
    );
    if (nextSenseId !== -1) {
      unstudiedCards.push({ word: w, senseId: nextSenseId });
    }
  });

  const customSet = new Set(customWords.map((w) => w.toLowerCase()));

  const unstudiedCustom = unstudiedCards.filter((card) =>
    customSet.has(card.word.w.toLowerCase()),
  );
  const unstudiedPool = unstudiedCards.filter(
    (card) => !customSet.has(card.word.w.toLowerCase()),
  );

  // Take custom words first (up to the daily limit)
  const pickedCustom = unstudiedCustom.slice(0, newCardsLimit);

  // Fill remaining quota with random words from pool (if any level selected)
  const remainingQuota = newCardsLimit - pickedCustom.length;
  const shuffledPool = [...unstudiedPool].sort(() => Math.random() - 0.5);
  const pickedPool =
    levels.length > 0 ? shuffledPool.slice(0, remainingQuota) : [];

  const newCards: QuizCard[] = [...pickedCustom, ...pickedPool];

  // Add due reviews (exact sense due today)
  const reviews: QuizCard[] = [];
  const seenReviewKeys = new Set<string>();

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
        if (dueWord.s && dueWord.s[card.senseId]) {
          const cardKey = `${card.level}-${card.wordId}-${card.senseId}`;
          if (!seenReviewKeys.has(cardKey)) {
            seenReviewKeys.add(cardKey);
            reviews.push({ word: dueWord, senseId: card.senseId });
          }
        }
      }
    }
  });

  return [...newCards, ...reviews];
}
