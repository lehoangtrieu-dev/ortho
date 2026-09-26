import Input from "./Input";

interface Props {
  sentence: string;
  answer: string;
  status: "unanswered" | "correct" | "incorrect";
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

const inputStyle = {
  unanswered:
    "text-blue-950 border-b-2 border-blue-950/30 focus-within:border-blue-950",
  correct: "text-emerald-800 border-b-2 border-emerald-500",
  incorrect: "text-rose-500/70",
};

export const FillInTheBlank = ({
  sentence,
  answer,
  status,
  input,
  setInput,
  onSubmit,
}: Props) => {
  const cleanSentence = sentence.replace(/\{\{.*?\}\}/g, "…");
  const [beforeText, afterText] = cleanSentence.split(/\[\[.*?\]\]/);

  return (
    <div className="w-full text-center leading-normal">
      <span className="warp-break-words hyphens-auto">{beforeText}</span>

      <span
        className={`inline-block transition-colors leading-tight mx-2 ${inputStyle[status]}`}
      >
        <Input
          placeholder={answer[0]}
          status={status}
          maxLength={18}
          input={input}
          setInput={setInput}
          onSubmit={onSubmit}
        />
        {status === "incorrect" && (
          <>
            <span className="text-rose-500 mx-1"> → </span>
            <span className="text-blue-950 font-bold border-b-2 border-rose-500">
              {answer}
            </span>
          </>
        )}
      </span>

      <span className="warp-break-words hyphens-auto">{afterText}</span>
    </div>
  );
};
