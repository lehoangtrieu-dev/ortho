interface Props {
  status: "unanswered" | "correct" | "incorrect";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const buttonConfig = {
  unanswered: {
    text: "Enter ↵",
    styles:
      "w-fit px-8 bg-transparent border border-dashed border-blue-950/20 text-blue-950/40 hover:border-blue-950/40 hover:text-blue-950/60",
  },
  correct: {
    text: "Continue",
    styles:
      "w-full sm:max-w-5xl mt-16 bg-emerald-50/50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  },
  incorrect: {
    text: "Continue",
    styles:
      "w-full sm:max-w-5xl mt-16 bg-rose-50/50 border border-rose-200 text-rose-700 hover:bg-rose-100",
  },
};

export const Button = ({ status, onClick }: Props) => {
  const currentConfig = buttonConfig[status];

  return (
    <button
      className={`py-3 rounded-md text-sm tracking-widest uppercase transition-colors ${currentConfig.styles}`}
      onClick={onClick}
    >
      {currentConfig.text}
    </button>
  );
};
