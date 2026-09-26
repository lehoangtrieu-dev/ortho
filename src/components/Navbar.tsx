import { StatusPill } from "./StatusPill";
import type { CardProgress } from "../types";

interface Props {
  completedIds: string[];
  totalVocab: number;
  cardProgress?: CardProgress;
  isSettings: boolean;
  setIsSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar = ({
  completedIds,
  totalVocab,
  cardProgress,
  isSettings,
  setIsSettings,
}: Props) => {
  return (
    <nav className="w-full px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-950/5">
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-y-3 sm:gap-y-0">
        <div
          className="flex items-center sm:flex-1 order-1 cursor-pointer"
          onClick={() => {
            window.location.reload();
          }}
        >
          <span className="text-lg sm:text-xl font-bold text-blue-950 tracking-tighter">
            ortho<span className="text-blue-950/40">.</span>
          </span>
        </div>

        <div className="flex items-center justify-end sm:flex-1 order-2 sm:order-3">
          <button
            className="text-blue-950/40 hover:text-blue-950 transition-colors p-1 -mr-1 cursor-pointer"
            onClick={() => {
              if (isSettings) {
                window.location.reload();
              } else {
                setIsSettings(true);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {!isSettings && (
          <div className="col-span-2 flex items-center justify-between sm:justify-center sm:flex-1 order-3 sm:order-2 pt-3 sm:pt-0 border-t border-blue-950/5 sm:border-t-0 space-x-0 sm:space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 sm:w-24 h-1 bg-blue-950/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-950 rounded-full transition-[width]"
                  style={{
                    width: `${(completedIds.length / totalVocab) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-[10px] sm:text-xs tracking-widest text-blue-950/60">
                {completedIds.length}/{totalVocab}
              </span>
            </div>

            <span className="hidden sm:inline text-blue-950/20">•</span>

            <StatusPill cardProgress={cardProgress} />
          </div>
        )}
      </div>
    </nav>
  );
};
