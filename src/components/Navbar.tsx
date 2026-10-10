import { StatusPill } from "./StatusPill";
import { AccountMenu } from "./AccountMenu";
import type { CardProgress } from "../types";

interface Props {
  completedIds: string[];
  totalVocab: number;
  cardProgress?: CardProgress;
  isSettings: boolean;
  isLearning: boolean;
  setIsSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar = ({
  completedIds,
  totalVocab,
  cardProgress,
  isSettings,
  isLearning,
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
          <AccountMenu isSettings={isSettings} setIsSettings={setIsSettings} />
        </div>

        {isLearning && (
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

            {cardProgress && (
              <>
                <span className="hidden sm:inline text-blue-950/20">•</span>
                <StatusPill cardProgress={cardProgress} />
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
