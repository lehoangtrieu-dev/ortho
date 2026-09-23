import { useState, useCallback, useEffect } from "react";
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

export function useQuizSession(level: CEFRLevel, senseId = 0) {
  const settings = loadSettings();

  const [cardProgress, setCardProgress] =
    useState<CardProgress[]>(loadCardProgress);

  useEffect(() => {
    saveCardProgress(cardProgress);
  }, [cardProgress]);

  const selectSubset = useCallback(
    (data: DictionaryEntry[]) =>
      buildDailySubset(data, level, settings.newWordsPerDay),
    [level, settings.newWordsPerDay],
  );

  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab", level],
    queryFn: async () => {
      const res = await fetch(`/vocab/${level.toLowerCase()}.json`);
      if (!res.ok) throw new Error("Unable to fetch vocab");
      return res.json();
    },
    select: selectSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const activeVocab = vocab?.filter((w) => !completedIds.includes(w.id)) ?? [];

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
          (c) => c.wordId === currentWord.id && c.senseId === senseId,
        );
        const [nextEaseFactor, nextInterval, nextReps] = calculateNextReview(
          existing?.easeFactor ?? 2.5,
          existing?.interval ?? 1,
          existing?.reps ?? 0,
          quality,
        );

        const updatedCard: CardProgress = {
          level: level as CardProgress["level"],
          wordId: currentWord.id,
          senseId,
          reps: nextReps,
          interval: nextInterval,
          easeFactor: nextEaseFactor,
          dueDate: getFutureDate(nextInterval),
        };

        return existing
          ? prev.map((c) =>
              c.wordId === currentWord.id && c.senseId === senseId
                ? updatedCard
                : c,
            )
          : [...prev, updatedCard];
      });
    } else {
      setInput("");
      setStatus("unanswered");
      if (status === "correct") {
        setCompletedIds((prev) => [...prev, currentWord.id]);
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
      (item) => item.wordId === currentWord?.id && item.senseId === senseId,
    ),
    input,
    setInput,
    handleAction,
    restartSession,
  };
}
