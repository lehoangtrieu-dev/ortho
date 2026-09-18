interface Props {
  onRestart: () => void;
}

export const CompletionScreen = ({ onRestart }: Props) => (
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
      onClick={onRestart}
      className="px-8 py-3 rounded-md text-xs tracking-widest uppercase 
               bg-transparent border border-blue-950/20 text-blue-950/60 
               hover:border-blue-950/40 hover:text-blue-950 hover:bg-blue-950/2 
               transition-colors"
    >
      Review Again &rarr;
    </button>
  </div>
);
