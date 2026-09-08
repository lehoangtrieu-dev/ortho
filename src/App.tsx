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
    <div className="flex flex-col items-center justify-center bg-blue-950/3 text-xl sm:text-3xl w-full min-h-screen px-4 md:px-20 py-20 box-border">
      {/* Input Section */}
      <div className="w-full text-center leading-normal mb-8">
        <span className="warp-break-words hyphens-auto">{beforeText}</span>

        <span className="inline-block border-b-2 focus-within:border-blue-950 border-blue-950/30 transition-colors leading-tight mx-2">
          <Input placeholder={word.w[0]} />
        </span>

        <span className="warp-break-words hyphens-auto">{afterText}</span>
      </div>

      {/* Word Definition Section */}
      <div className="w-full text-center px-2">
        <div className="my-10">
          {/* Top Divider */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-black to-transparent mb-6" />

          <div className="mb-4">
            <span className="text-3xl sm:text-5xl font-black wrap-break-words hyphens-auto">
              {word.w}
            </span>
            <span className="text-blue-950/30 text-2xl sm:text-4xl ml-2">
              ({sense.pos})
            </span>
          </div>

          <div className="text-lg">{sense.defn}</div>

          {/* Bottom Divider */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-black to-transparent mt-6" />
        </div>

        <div className="flex justify-center w-full">
          <div className="columns-1 sm:columns-2 gap-10 sm:gap-20 px-4 sm:px-10 w-full max-w-5xl text-left">
            {/* Examples */}
            <div className="break-inside-avoid mb-8">
              <h6 className="mb-4 font-bold text-blue-950/70">Examples</h6>
              <div className="flex flex-col gap-3">
                {sense.ex.map((ex, index) => (
                  <span
                    key={index}
                    className="text-sm border-l-2 border-blue-950/30 pl-3 py-1 inline-block w-full"
                  >
                    {ex.split(/(\[\[.*?\]\]|\{\{.*?\}\})/g).map((part, i) =>
                      part.startsWith("[[") || part.startsWith("{{") ? (
                        <strong className="font-black text-blue-950" key={i}>
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      ),
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Collocations */}
            {word.col?.length > 0 && (
              <div className="break-inside-avoid mb-8">
                <h6 className="mb-3 font-bold text-blue-950/70">
                  Collocations
                </h6>
                <div className="flex flex-wrap gap-2">
                  {word.col.map((col, index) => (
                    <span
                      key={index}
                      className="text-sm border border-blue-950/30 rounded-full px-3 py-1.5"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms */}
            {sense.syn?.length > 0 && (
              <div className="break-inside-avoid mb-8">
                <h6 className="mb-3 font-bold text-blue-950/70">Synonyms</h6>
                <div className="flex flex-wrap gap-2">
                  {sense.syn.map((syn, index) => (
                    <span
                      key={index}
                      className="text-sm border border-blue-950/30 rounded-full px-3 py-1.5"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {sense.ant?.length > 0 && (
              <div className="break-inside-avoid mb-8">
                <h6 className="mb-3 font-bold text-blue-950/70">Antonyms</h6>
                <div className="flex flex-wrap gap-2">
                  {sense.ant.map((ant, index) => (
                    <span
                      key={index}
                      className="text-sm border border-blue-950/30 rounded-full px-3 py-1.5"
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
