import type { CardProgress } from "../types";

interface Props {
  cardProgress?: CardProgress;
}

const pillColorMap = {
  new: "border-dashed border-blue-950/30 bg-transparent text-blue-950/50",
  streak: "border-blue-950/20 bg-blue-950/[0.03] text-blue-950/70",
  lapsed: "border-amber-500/30 bg-amber-50/50 text-amber-700",
  mastered: "border-emerald-500/30 bg-emerald-50/50 text-emerald-700",
};

const getStatus = (cardProgress?: CardProgress) => {
  if (!cardProgress) return "new";
  if (cardProgress.interval > 30) return "mastered";
  if (cardProgress.reps === 0) return "lapsed";
  return "streak";
};

export const StatusPill = ({ cardProgress }: Props) => {
  const statusLabel = {
    new: "NEW",
    streak: `STREAK ${cardProgress?.reps}`,
    lapsed: "LAPSED",
    mastered: "MASTERED",
  };

  const status = getStatus(cardProgress);

  return (
    <span
      className={`${pillColorMap[status]} px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] whitespace-nowrap uppercase tracking-widest border transition-colors duration-300`}
    >
      {statusLabel[status]}
    </span>
  );
};
