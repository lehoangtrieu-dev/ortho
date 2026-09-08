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
      const response = await fetch("/vocab/c1.json");
      if (!response.ok) throw new Error("Unable to fetch vocab");

      const data = await response.json();
      return data;
    },
    select: selectRandomSubset,
    staleTime: 1000 * 60 * 60,
    structuralSharing: false,
  });

  if (!vocab || isLoading) return null;

  const word = vocab?.[0];
  const sense = word?.s?.[0];
  const exampleSentence = sense?.ex?.[0];

  const answer = exampleSentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";
  const cleanSentence = exampleSentence.replace(/\{\{.*?\}\}/g, "…");
  const [beforeText, afterText] = cleanSentence.split(/\[\[.*?\]\]/);

  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 text-xl sm:text-3xl w-full min-h-screen px-4 md:px-20 py-20 box-border">
      {/* Input Section */}
      <div className="w-full text-center leading-normal mb-8">
        <span className="warp-break-words hyphens-auto">{beforeText}</span>

        <span className="inline-block border-b-2 border-blue-900 leading-tight mx-2">
          <Input />
        </span>

        <span className="warp-break-words hyphens-auto">{afterText}</span>
      </div>
    </div>
  );
};
