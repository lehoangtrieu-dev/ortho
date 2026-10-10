import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  DictionaryEntry,
  CEFRLevel,
  CardProgress,
  QuizCard,
} from "../types";
import {
  loadCardProgress,
  saveCardProgress,
  buildDailySubset,
  calculateNextReview,
  getFutureDate,
} from "../lib/srs";
import { loadSettings } from "../lib/settings";
import { triggerCorrectConfetti } from "../lib/confetti";

export function useQuizSession(levelsParam?: CEFRLevel[]) {
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
    (data: DictionaryEntry[]): QuizCard[] =>
      buildDailySubset(
        data,
        levels,
        settings.newWordsPerDay,
        settings.customWords,
      ),
    [levels, settings.newWordsPerDay, settings.customWords],
  );

  const { data: vocab, isLoading } = useQuery<
    DictionaryEntry[],
    Error,
    QuizCard[]
  >({
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

  const getCardKey = (c?: QuizCard) =>
    c ? `${c.word.level}-${c.word.id}-${c.senseId}` : "";

  const activeVocab =
    vocab?.filter((c) => !completedIds.includes(getCardKey(c))) ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"unanswered" | "correct" | "incorrect">(
    "unanswered",
  );

  const cardIndex =
    activeVocab.length > 0 ? currentIndex % activeVocab.length : 0;
  const round =
    activeVocab.length > 0 ? Math.floor(currentIndex / activeVocab.length) : 0;

  const currentCard = activeVocab[cardIndex];
  const currentWord = currentCard?.word;
  const currentSenseId = currentCard?.senseId ?? 0;
  const sense = currentWord?.s?.[currentSenseId];
  const examples = sense?.ex ?? [];
  const sentence = examples.length > 0 ? examples[round % examples.length] : "";
  const answer = sentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";

  const handleAction = () => {
    if (!currentWord || !sense) return;

    if (status === "unanswered") {
      const isCorrect =
        input.trim().toLowerCase() === answer.trim().toLowerCase();
      const quality = isCorrect ? 5 : 0;
      setStatus(isCorrect ? "correct" : "incorrect");
      if (isCorrect) {
        triggerCorrectConfetti();
      }

      setCardProgress((prev) => {
        const existing = prev.find(
          (c) =>
            c.wordId === currentWord.id &&
            c.level === currentWord.level &&
            c.senseId === currentSenseId,
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
          senseId: currentSenseId,
          reps: nextReps,
          interval: nextInterval,
          easeFactor: nextEaseFactor,
          dueDate: getFutureDate(nextInterval),
        };

        return existing
          ? prev.map((c) =>
              c.wordId === currentWord.id &&
              c.level === currentWord.level &&
              c.senseId === currentSenseId
                ? updatedCard
                : c,
            )
          : [...prev, updatedCard];
      });
    } else {
      setInput("");
      setStatus("unanswered");
      if (status === "correct") {
        setCompletedIds((prev) => [...prev, getCardKey(currentCard)]);
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
    currentCard,
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
        item.senseId === currentSenseId,
    ),
    input,
    setInput,
    handleAction,
    restartSession,
  };
}
