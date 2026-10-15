import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DictionaryEntry, CEFRLevel, CardProgress } from "../types";
import {
  loadCardProgress,
  saveCardProgress,
  buildDailySubset,
  calculateNextReview,
  getFutureDate,
} from "../lib/srs";
import { useAuth } from "../lib/auth";
import { loadSettings, getLocalSettings } from "../lib/settings";
import { triggerCorrectConfetti } from "../lib/confetti";

export function useQuizSession(levelsParam?: CEFRLevel[]) {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(getLocalSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    async function initSettings() {
      setSettingsLoaded(false);
      const data = await loadSettings(user?.uid);
      if (active) {
        setSettings(data);
        setSettingsLoaded(true);
      }
    }
    initSettings();
    return () => {
      active = false;
    };
  }, [user?.uid, authLoading]);

  const queryClient = useQueryClient();

  const refreshSession = () => {
    setSettings(getLocalSettings());
    setCompletedIds([]);
    setCurrentIndex(0);
    queryClient.resetQueries({ queryKey: ["vocab"] });
  };

  const levels = useMemo(() => {
    const active =
      levelsParam ??
      (Object.keys(settings.selectedLevels) as CEFRLevel[]).filter(
        (lvl) => settings.selectedLevels[lvl],
      );
    return active;
  }, [levelsParam, settings.selectedLevels]);

  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    async function initProgress() {
      setIsLoaded(false);
      const data = await loadCardProgress(user?.uid);
      if (active) {
        setCardProgress(data);
        setIsLoaded(true);
      }
    }
    initProgress();
    return () => {
      active = false;
    };
  }, [user?.uid, authLoading]);

  useEffect(() => {
    if (authLoading || !isLoaded) return;
    saveCardProgress(cardProgress, user?.uid);
  }, [cardProgress, isLoaded, user?.uid, authLoading]);

  const {
    data: vocab,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "vocab",
      [...levels].sort().join(","),
      settings.newWordsPerDay,
      settings.customWords.join(","),
      user?.uid,
    ],
    queryFn: async () => {
      // Fetch words.json to find which level file custom words live in
      let wordsIndex: Record<string, CEFRLevel> = {};
      try {
        const indexRes = await fetch(
          `${import.meta.env.BASE_URL}vocab/words.json`,
        );
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
            const res = await fetch(
              `${import.meta.env.BASE_URL}vocab/${lvl.toLowerCase()}.json`,
            );
            if (!res.ok) return [];
            const data: DictionaryEntry[] = await res.json();
            // Tag each word with its level so IDs never collide
            return data.map((entry) => ({ ...entry, level: lvl }));
          } catch {
            return [];
          }
        }),
      );

      const allData = results.flat();

      return await buildDailySubset(
        allData,
        levels,
        settings.newWordsPerDay,
        settings.customWords,
        user?.uid,
      );
    },
    enabled: !authLoading && settingsLoaded && isLoaded,
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

  const cardIndex =
    activeVocab.length > 0 ? currentIndex % activeVocab.length : 0;
  const round =
    activeVocab.length > 0 ? Math.floor(currentIndex / activeVocab.length) : 0;

  const currentCard = activeVocab[cardIndex];
  const examples = currentCard?.ex ?? [];
  const sentence = examples.length > 0 ? examples[round % examples.length] : "";
  const answer = sentence.match(/\[(.*?)\]/)?.[1] ?? "";

  const handleAction = () => {
    if (!currentCard) return;

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
          (c) => c.wordId === currentCard.id && c.level === currentCard.level,
        );
        const [nextEaseFactor, nextInterval, nextReps] = calculateNextReview(
          existing?.easeFactor ?? 2.5,
          existing?.interval ?? 1,
          existing?.reps ?? 0,
          quality,
        );

        const updatedCard: CardProgress = {
          level: currentCard.level ?? levels[0],
          wordId: currentCard.id,
          reps: nextReps,
          interval: nextInterval,
          easeFactor: nextEaseFactor,
          dueDate: getFutureDate(nextInterval),
        };

        return existing
          ? prev.map((c) =>
              c.wordId === currentCard.id && c.level === currentCard.level
                ? updatedCard
                : c,
            )
          : [...prev, updatedCard];
      });
    } else {
      setInput("");
      setStatus("unanswered");
      if (status === "correct") {
        setCompletedIds((prev) => [...prev, getWordKey(currentCard)]);
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
    isLoading:
      authLoading ||
      !settingsLoaded ||
      !isLoaded ||
      isLoading ||
      isFetching ||
      vocab === undefined,
    isComplete: !isLoading && vocab && activeVocab.length === 0,
    currentCard,
    currentWord: currentCard,
    vocab,
    sentence,
    answer,
    status,
    completedIds,
    cardProgress: cardProgress.find(
      (item) =>
        item.wordId === currentCard?.id && item.level === currentCard?.level,
    ),
    input,
    setInput,
    handleAction,
    restartSession,
    refreshSession,
  };
}
