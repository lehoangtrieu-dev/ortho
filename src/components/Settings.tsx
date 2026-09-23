import { useState, useEffect } from "react";
import { Button } from "./Button";
import Input from "./Input";
import { loadSettings, saveSettings } from "../lib/settings";
import { type CEFRLevel } from "../types";

export const Settings = () => {
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmit) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmit]);

  const [initialSettings] = useState(loadSettings);
  const [newWordsPerDay, setNewWordsPerDay] = useState(
    initialSettings.newWordsPerDay,
  );
  const [selectedLevels, setSelectedLevels] = useState(
    initialSettings.selectedLevels,
  );
  const [customWords, setCustomWords] = useState<string[]>(
    initialSettings.customWords,
  );
  const [newWordInput, setNewWordInput] = useState("");

  const handleLevelToggle = (level: CEFRLevel) => {
    setSelectedLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleAddWord = () => {
    if (
      newWordInput.trim() &&
      !customWords.includes(newWordInput.toLowerCase())
    ) {
      setCustomWords([newWordInput.toLowerCase(), ...customWords]);
      setNewWordInput("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setCustomWords(customWords.filter((word) => word !== wordToRemove));
  };

  return (
    <form
      className="w-full max-w-md mx-auto flex flex-col pt-12 pb-8"
      onSubmit={() => {
        saveSettings({
          newWordsPerDay,
          selectedLevels,
          customWords,
        });
      }}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-blue-950 mb-10 tracking-tight">
        Configuration
      </h2>

      <div className="space-y-12">
        {/* Number Selector */}
        <div className="flex flex-col space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-blue-950/60">
            New Words Per Day
          </label>

          <div className="flex items-center space-x-6">
            {/* Decrement Button */}
            <button
              onClick={() => setNewWordsPerDay(Math.max(5, newWordsPerDay - 5))}
              className="w-10 h-10 flex items-center justify-center rounded-md border border-blue-950/20 text-blue-950 hover:bg-blue-950/3 transition-colors"
              type="button"
            >
              -
            </button>

            {/* The Number */}
            <div className="text-3xl text-blue-950 font-bold w-16 text-center">
              {newWordsPerDay}
            </div>

            {/* Increment Button */}
            <button
              onClick={() =>
                setNewWordsPerDay(Math.min(50, newWordsPerDay + 5))
              }
              className="w-10 h-10 flex items-center justify-center rounded-md border border-blue-950/20 text-blue-950 hover:bg-blue-950/3 transition-colors"
              type="button"
            >
              +
            </button>
          </div>
        </div>

        {/* Custom Checkboxes */}
        <div className="flex flex-col space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-blue-950/60">
            Target Difficulty
          </label>

          <div className="flex flex-wrap gap-6">
            {Object.entries(selectedLevels).map(([level, isChecked]) => (
              <label
                key={level}
                className="flex items-center space-x-3 cursor-pointer group w-fit"
                onClick={(e) => {
                  e.preventDefault();
                  handleLevelToggle(level as CEFRLevel);
                }}
              >
                {/* Custom Checkbox Box */}
                <div
                  className={`
                  flex items-center justify-center w-5 h-5 rounded-sm border transition-colors duration-200
                  ${isChecked ? "border-blue-950" : "border-blue-950/30 group-hover:border-blue-950/60"}
                `}
                >
                  {/* Inner checkmark dot (only visible if checked) */}
                  <div
                    className={`
                    w-2.5 h-2.5 rounded-xs bg-blue-950 transition-opacity duration-200
                    ${isChecked ? "opacity-100" : "opacity-0"}
                  `}
                  />
                </div>

                {/* Label Text */}
                <span
                  className={`text-sm transition-colors duration-200 ${isChecked ? "text-blue-950 font-bold" : "text-blue-950/60"}`}
                >
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Vocabulary Management */}
        <div className="flex flex-col space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-blue-950/60">
            Manage Target Words
          </label>

          <div className="flex justify-between items-center space-x-3 w-full">
            <div className="text-xl text-blue-950 border-b-2 border-blue-950/30 focus-within:border-blue-950">
              <Input
                placeholder="Enter a new word..."
                status="unanswered"
                input={newWordInput}
                setInput={setNewWordInput}
                onSubmit={handleAddWord}
              />
            </div>
            <Button status="unanswered" onClick={handleAddWord}></Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto">
            {customWords.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleRemoveWord(word)}
                className="px-3 py-1.5 rounded-md border border-blue-950/15 bg-blue-950/2 text-sm text-blue-950 transition-colors focus:outline-none hover:bg-rose-100 hover:border-rose-200 hover:text-rose-700 hover:line-through"
              >
                {word}
              </button>
            ))}

            {customWords.length === 0 && (
              <span className="text-xs text-blue-950/40 italic">
                No words added yet.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          status="correct"
          onClick={(e) => {
            setIsSubmit(true);
            e.currentTarget.type = "submit";
          }}
        />
      </div>
    </form>
  );
};
