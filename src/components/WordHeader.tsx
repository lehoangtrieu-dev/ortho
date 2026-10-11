import { useEffect, useRef, useCallback } from "react";
import { Volume2 } from "lucide-react";

interface Props {
  word: string;
  ipa: string;
  pron: string;
  pos: string;
  definition: string;
}

export const WordHeader = ({ word, ipa, pron, pos, definition }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(() => {
    if (!pron) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(
      `https://www.oxfordlearnersdictionaries.com/media/english/${pron}`,
    );
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [pron]);

  useEffect(() => {
    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [playAudio]);

  return (
    <div className="my-10">
      {/* Top Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-blue-950/20 to-transparent mb-6" />

      <div className="mb-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
        <span className="text-3xl sm:text-5xl font-black wrap-break-words hyphens-auto text-blue-950">
          {word}
        </span>

        <span className="text-blue-950/40 text-2xl sm:text-4xl italic">
          {pos}
        </span>

        <div className="flex items-center space-x-2 ml-auto sm:ml-4 text-blue-950/50">
          <span className="text-sm sm:text-base tracking-widest">{ipa}</span>
          <button
            onClick={playAudio}
            className="p-1.5 rounded-md hover:bg-blue-950/10 hover:text-blue-950 transition-colors focus:outline-none cursor-pointer"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      <div className="text-lg sm:text-xl text-left sm:text-center text-blue-950/80 leading-relaxed font-medium">
        {definition}
      </div>

      {/* Bottom Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-blue-950/20 to-transparent mt-6" />
    </div>
  );
};
