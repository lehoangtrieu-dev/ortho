interface Props {
  word: string;
  pos: string;
  definition: string;
}

export const WordHeader = ({ word, pos, definition }: Props) => {
  return (
    <div className="my-10">
      {/* Top Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-black to-transparent mb-6" />

      <div className="mb-4">
        <span className="text-3xl sm:text-5xl font-black wrap-break-words hyphens-auto">
          {word}
        </span>
        <span className="text-blue-950/30 text-2xl sm:text-4xl ml-2">
          ({pos})
        </span>
      </div>

      <div className="text-lg">{definition}</div>

      {/* Bottom Divider */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-black to-transparent mt-6" />
    </div>
  );
};
