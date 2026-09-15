import { useState, useCallback } from "react";
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

export const App = () => {
  const selectRandomSubset = useCallback((data: DictionaryEntry[]) => {
    if (!data || data.length === 0) return [];

    const randomSubset = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      randomSubset.push(data[randomIndex]);
    }

    return randomSubset;
  }, []);

  const { data: vocab, isLoading } = useQuery({
    queryKey: ["vocab"],
    queryFn: async () => {
      const response = await fetch("/vocab/c1.json");
      if (!response.ok) throw new Error("Unable to fetch vocab");

      const data = await response.json();
      return data;
    },
    select: selectRandomSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"unanswered" | "correct" | "incorrect">(
    "unanswered",
  );

  if (!vocab || isLoading) return null;

  const wordIndex = currentIndex % vocab.length;
  const round = Math.floor(currentIndex / vocab.length);

  const word = vocab?.[wordIndex];
  const sense = word?.s?.[0];

  const examples = sense?.ex ?? [];
  const sentence = examples.length > 0 ? examples[round % examples.length] : "";

  const answer = sentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";

  const handleAction = () => {
    if (status === "unanswered") {
      if (input.trim().toLowerCase() === answer.trim().toLowerCase()) {
        setStatus("correct");
      } else {
        setStatus("incorrect");
      }
    } else {
      setInput("");
      setStatus("unanswered");
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-blue-950/3 text-xl sm:text-3xl w-full min-h-screen px-4 md:px-20 py-20 box-border">
      <div className="w-full text-center px-2">
        {/* Input Section */}
        <FillInTheBlank
          key={currentIndex}
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
