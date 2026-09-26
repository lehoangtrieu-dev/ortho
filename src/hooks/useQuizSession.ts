import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DictionaryEntry, CEFRLevel, CardProgress } from "../types";
import {
  loadCardProgress,
  saveCardProgress,
  buildDailySubset,
  calculateNextReview,
  getFutureDate,
} from "../lib/srs";
import { loadSettings } from "../lib/settings";

export function useQuizSession(levelsParam?: CEFRLevel[], senseId = 0) {
  const [settings] = useState(loadSettings);

  const levels = useMemo(() => {
    const active =
      levelsParam ??
      (Object.keys(settings.selectedLevels) as CEFRLevel[]).filter(
        (lvl) => settings.selectedLevels[lvl],
      );
    return active;
  }, [levelsParam, settings.selectedLevels]);

  const [cardProgress, setCardProgress] =
    useState<CardProgress[]>(loadCardProgress);

  useEffect(() => {
    saveCardProgress(cardProgress);
  }, [cardProgress]);

  const selectSubset = useCallback(
    (data: DictionaryEntry[]) =>
      buildDailySubset(
        data,
        levels,
        settings.newWordsPerDay,
        settings.customWords,
      ),
    [levels, settings.newWordsPerDay, settings.customWords],
  );

  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab", [...levels].sort().join(",")],
    queryFn: async () => {
      // Fetch words.json to find which level file custom words live in
      let wordsIndex: Record<string, CEFRLevel> = {};
      try {
        const indexRes = await fetch("/vocab/words.json");
        if (indexRes.ok) wordsIndex = await indexRes.json();
      } catch {
        // ignore if index fails
      }

      // Collect all levels needed: selected levels + levels for custom words
      const customLevels = settings.customWords
        .map((w) => wordsIndex[w.toLowerCase()])
        .filter(Boolean) as CEFRLevel[];

      const allLevelsToFetch = Array.from(
        new Set([...levels, ...customLevels]),
      );

      // Fetch all needed files in parallel
      const results = await Promise.all(
        allLevelsToFetch.map(async (lvl) => {
          try {
            const res = await fetch(`/vocab/${lvl.toLowerCase()}.json`);
            if (!res.ok) return [];
            const data: DictionaryEntry[] = await res.json();
            // Tag each word with its level so IDs never collide
            return data.map((entry) => ({ ...entry, level: lvl }));
          } catch {
            return [];
          }
        }),
      );

      return results.flat();
    },
    select: selectSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const getWordKey = (w?: DictionaryEntry) => (w ? `${w.level}-${w.id}` : "");

  const activeVocab =
    vocab?.filter((w) => !completedIds.includes(getWordKey(w))) ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"unanswered" | "correct" | "incorrect">(
    "unanswered",
  );

  const wordIndex =
    activeVocab.length > 0 ? currentIndex % activeVocab.length : 0;
  const round =
    activeVocab.length > 0 ? Math.floor(currentIndex / activeVocab.length) : 0;

  const currentWord = activeVocab[wordIndex];
  const sense = currentWord?.s?.[senseId];
  const examples = sense?.ex ?? [];
  const sentence = examples.length > 0 ? examples[round % examples.length] : "";
  const answer = sentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";

  const handleAction = () => {
    if (status === "unanswered") {
      const isCorrect =
        input.trim().toLowerCase() === answer.trim().toLowerCase();
      const quality = isCorrect ? 5 : 0;
      setStatus(isCorrect ? "correct" : "incorrect");

      setCardProgress((prev) => {
        const existing = prev.find(
          (c) =>
            c.wordId === currentWord.id &&
            c.level === currentWord.level &&
            c.senseId === senseId,
        );
        const [nextEaseFactor, nextInterval, nextReps] = calculateNextReview(
          existing?.easeFactor ?? 2.5,
          existing?.interval ?? 1,
          existing?.reps ?? 0,
          quality,
        );

        const updatedCard: CardProgress = {
          level: currentWord.level ?? levels[0],
          wordId: currentWord.id,
          senseId,
          reps: nextReps,
          interval: nextInterval,
          easeFactor: nextEaseFactor,
          dueDate: getFutureDate(nextInterval),
        };

        return existing
          ? prev.map((c) =>
              c.wordId === currentWord.id &&
              c.level === currentWord.level &&
              c.senseId === senseId
                ? updatedCard
                : c,
            )
          : [...prev, updatedCard];
      });
    } else {
      setInput("");
      setStatus("unanswered");
      if (status === "correct") {
        setCompletedIds((prev) => [...prev, getWordKey(currentWord)]);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const restartSession = () => {
    setCompletedIds([]);
    setCurrentIndex(0);
    setInput("");
    setStatus("unanswered");
  };

  return {
    isLoading,
    isComplete: !isLoading && vocab && activeVocab.length === 0,
    currentWord,
    vocab,
    sense,
    sentence,
    answer,
    status,
    completedIds,
    cardProgress: cardProgress.find(
      (item) =>
        item.wordId === currentWord?.id &&
        item.level === currentWord?.level &&
        item.senseId === senseId,
    ),
    input,
    setInput,
    handleAction,
    restartSession,
  };
}
