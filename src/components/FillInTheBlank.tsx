import Input from "./Input";

interface Props {
  hint: string;
  sentence: string;
}

export const FillInTheBlank = ({ hint, sentence }: Props) => {
  const answer = sentence.match(/\[\[(.*?)\]\]/)?.[1] ?? "";
  const cleanSentence = sentence.replace(/\{\{.*?\}\}/g, "…");
  const [beforeText, afterText] = cleanSentence.split(/\[\[.*?\]\]/);

  return (
    <div className="w-full text-center leading-normal mb-8">
      <span className="warp-break-words hyphens-auto">{beforeText}</span>

      <span className="inline-block border-b-2 focus-within:border-blue-950 border-blue-950/30 transition-colors leading-tight mx-2">
        <Input placeholder={hint} />
      </span>

      <span className="warp-break-words hyphens-auto">{afterText}</span>
    </div>
  );
};
