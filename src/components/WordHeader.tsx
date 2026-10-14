import { useEffect, useCallback } from "react";
import { Volume2 } from "lucide-react";

interface Props {
  word: string;
  ipa: string;
  pos: string;
  definition: string;
}

export const WordHeader = ({ word, ipa, pos, definition }: Props) => {
  const playAudio = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-GB";
      window.speechSynthesis.speak(utterance);
    }
  }, [word]);

  useEffect(() => {
    playAudio();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [playAudio]);

  return (
    <div className="my-10">
      {/* Top Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-blue-950/20 to-transparent mb-6" />

      <div className="mb-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
        <span className="text-3xl sm:text-5xl font-black wrap-break-word hyphens-auto text-blue-950">
          {word}
        </span>

        <span className="text-blue-950/40 text-2xl sm:text-4xl italic">
          {pos}
        </span>

        <div className="flex items-center space-x-2 ml-4 text-blue-950/50">
          <span className="text-sm sm:text-base tracking-widest">{ipa}</span>
          <button
            tabIndex={-1}
            onClick={playAudio}
            className="p-1.5 rounded-md hover:bg-blue-950/10 hover:text-blue-950 transition-colors cursor-pointer"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      <div className="text-lg sm:text-xl text-center text-blue-950/80 leading-relaxed font-medium">
        {definition}
      </div>

      {/* Bottom Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-blue-950/20 to-transparent mt-6" />
    </div>
  );
};
