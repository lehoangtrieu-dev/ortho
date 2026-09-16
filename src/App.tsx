import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { FillInTheBlank } from "./components/FillInTheBlank";
import { WordHeader } from "./components/WordHeader";
import { ExampleList } from "./components/ExampleList";
import { TagGroup } from "./components/TagGroup";
import { Button } from "./components/Button";

export interface DictionaryEntry {
  id: number;
  w: string;
  ipa: string;
  pron: string;
  s: Sense[];
  col: string[];
}

export interface Sense {
  pos: string;
  defn: string;
  syn: string[];
  ant: string[];
  ex: string[];
}

export interface CardProgress {
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  wordId: number;
  senseId: number;
  reps: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}

function calculateNextReview(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number,
) {
  // 1. Calculate new Ease Factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Floor the EF at 1.3 so words don't get permanently stuck in daily review
  if (easeFactor < 1.3) easeFactor = 1.3;

  // 2. Calculate new Interval & Repetitions
  if (quality < 3) {
    // Failed: Reset the streak, but keep the lowered EF
    repetitions = 0;
    interval = 1;
  } else {
    // Passed: Increase streak and calculate days
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  return [easeFactor, interval, repetitions];
}

function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const App = () => {
  const level = "C1";
  const senseId = 0;

  const [cardProgress, setCardProgress] = useState<CardProgress[]>(() => {
    const saved = localStorage.getItem("cardProgress");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cardProgress", JSON.stringify(cardProgress));
  }, [cardProgress]);

  const selectSubset = useCallback((data: DictionaryEntry[]) => {
    if (!data || data.length === 0) return [];

    const saved: CardProgress[] = JSON.parse(
      localStorage.getItem("cardProgress") || "[]",
    );
    const todayStr = new Date().toISOString().split("T")[0];

    const studiedIds = new Set(saved.map((c) => c.wordId));
    const unstudiedWords = data.filter((w) => !studiedIds.has(w.id));

    const subset: DictionaryEntry[] = [];

    // 1. Add up to 10 new words
    const shuffled = [...unstudiedWords].sort(() => Math.random() - 0.5);
    subset.push(...shuffled.slice(0, 10));

    // 2. Add due review cards from data
    saved.forEach((card) => {
      if (card.dueDate <= todayStr && card.level === "C1") {
        const dueWord = data.find((w) => w.id === card.wordId);
        if (dueWord) subset.push(dueWord);
      }
    });

    return subset;
  }, []);

  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab"],
    queryFn: async () => {
      const response = await fetch(`/vocab/${level.toLowerCase()}.json`);
      if (!response.ok) throw new Error("Unable to fetch vocab");

      const data = await response.json();
      return data;
    },
    select: selectSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const activeVocab = vocab?.filter((w) => !completedIds.includes(w.id));

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"unanswered" | "correct" | "incorrect">(
    "unanswered",
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-9xl text-blue-950/6 animate-spin">&#x21BB;</p>
      </div>
    );

  if (!activeVocab || activeVocab?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <span className="px-3 py-1 mb-6 rounded-full text-[10px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-50/50 text-emerald-700">
          Session Complete
        </span>

        <h1 className="text-3xl font-bold text-blue-950 mb-3">
          All done for today.
        </h1>

        <p className="text-blue-950/60 mb-10 text-xs uppercase tracking-widest">
          Next review available tomorrow
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-md text-xs tracking-widest uppercase 
               bg-transparent border border-blue-950/20 text-blue-950/60 
               hover:border-blue-950/40 hover:text-blue-950 hover:bg-blue-950/2 
               transition-colors"
        >
          Review Again &rarr;
        </button>
      </div>
    );
  }

  const wordIndex = currentIndex % activeVocab.length;
  const round = Math.floor(currentIndex / activeVocab.length);

  const word = activeVocab?.[wordIndex];
  const sense = word?.s?.[senseId];

  const examples = sense?.ex ?? [];
  const sentence = examples.length > 0 ? examples[round % examples.length] : "";

  const answer = sentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";

  const handleAction = () => {
    if (status === "unanswered") {
      let quality = 5;

      if (input.trim().toLowerCase() === answer.trim().toLowerCase()) {
        setStatus("correct");
        quality = 5;
      } else {
        setStatus("incorrect");
        quality = 0;
      }

      setCardProgress((prev: CardProgress[]) => {
        // Check if the card exists
        const exists = prev.some(
          (card) => card.wordId === word.id && card.senseId === senseId,
        );

        if (exists) {
          // Modify the card in CardProgress
          return prev.map((card) => {
            const [nextEaseFactor, nextInterval, nextRepetitions] =
              calculateNextReview(
                card.easeFactor,
                card.interval,
                card.reps,
                quality,
              );
            return card.wordId === word.id && card.senseId === senseId
              ? {
                  ...card,
                  reps: nextRepetitions,
                  interval: nextInterval,
                  easeFactor: nextEaseFactor,
                  dueDate: getFutureDate(nextInterval),
                }
              : card;
          });
        } else {
          // Create a new card in CardProgress
          const [nextEaseFactor, nextInterval, nextRepetitions] =
            calculateNextReview(2.5, 1, 0, quality);

          const newCard: CardProgress = {
            level: level,
            wordId: word.id,
            senseId: senseId,
            reps: nextRepetitions,
            interval: nextInterval,
            easeFactor: nextEaseFactor,
            dueDate: getFutureDate(nextInterval),
          };
          return [...prev, newCard];
        }
      });
    } else {
      setInput("");
      setStatus("unanswered");

      if (status === "correct") {
        setCompletedIds((prev) => [...prev, word.id]);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-xl sm:text-3xl w-full min-h-screen px-4 md:px-20 py-20 box-border">
      <div className="w-full text-center px-2">
        {/* Input Section */}
        <FillInTheBlank
          key={status}
          sentence={sentence}
          answer={answer}
          status={status}
          input={input}
          setInput={setInput}
          onSubmit={handleAction}
        />
        {status == "unanswered" && (
          <div className="w-full flex justify-center items-center gap-4 mt-2">
            <TagGroup items={sense.syn} />
          </div>
        )}

        {/* Word Definition Section */}
        {status != "unanswered" && (
          <WordHeader word={word.w} pos={sense.pos} definition={sense.defn} />
        )}
      </div>

      {status != "unanswered" && (
        <div className="flex justify-center w-full">
          <div className="columns-1 sm:columns-2 gap-10 sm:gap-20 px-4 sm:px-10 w-full max-w-5xl text-left">
            {/* Examples */}
            <ExampleList examples={sense.ex} />

            {/* Collocations */}
            <TagGroup title="Collocations" items={word.col} />

            {/* Synonyms */}
            <TagGroup title="Synonyms" items={sense.syn} />

            {/* Antonyms */}
            <TagGroup title="Antonyms" items={sense.ant} />
          </div>
        </div>
      )}

      <Button status={status} onClick={handleAction} />
    </div>
  );
};
