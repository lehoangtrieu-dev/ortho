import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Input from "./components/Input";

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

  const {
    data: vocab,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["vocab"],
    queryFn: async () => {
      const response = await fetch("./../public/vocab/c1.json");
      if (!response.ok) throw new Error("Unable to fetch vocab");

      const data = await response.json();
      return data;
    },
    select: selectRandomSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  if (!vocab || isLoading) return null;

  const word = vocab[0].w;
  const exampleSentence = vocab[0].s[0].ex[0];

  const matchIndex = exampleSentence.toLowerCase().indexOf(word.toLowerCase());
  const beforeText =
    matchIndex !== -1 ? exampleSentence.slice(0, matchIndex) : exampleSentence;
  const afterText =
    matchIndex !== -1 ? exampleSentence.slice(matchIndex + word.length) : "";

  return (
    <div className="flex items-center justify-center h-screen mx-4 text-3xl">
      <div className="leading-normal">
        <span>{beforeText}</span>

        {matchIndex !== -1 && (
          <span className="inline-block border-solid border-b-2 border-blue-900 leading-tight">
            <Input />
          </span>
        )}

        <span>{afterText}</span>
      </div>
    </div>
  );
};
