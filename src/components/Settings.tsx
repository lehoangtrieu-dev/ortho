import { useState, useEffect } from "react";
import { Button } from "./Button";
import Input from "./Input";
import { useAuth } from "../lib/auth";
import { loadSettings, saveSettings, getLocalSettings } from "../lib/settings";
import { type CEFRLevel } from "../types";
import { Plus, Minus } from "lucide-react";

const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

interface Props {
  onClose: () => void;
}

export const Settings = ({ onClose }: Props) => {
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

  const [initialSettings] = useState(getLocalSettings);

  const [newWordsPerDay, setNewWordsPerDay] = useState(
    initialSettings.newWordsPerDay,
  );
  const [selectedLevels, setSelectedLevels] = useState(
    initialSettings.selectedLevels,
  );
  const [customWords, setCustomWords] = useState<string[]>(
    initialSettings.customWords,
  );

  const { user } = useAuth();

  useEffect(() => {
    async function initProgress() {
      const data = await loadSettings(user?.uid);
      setNewWordsPerDay(data.newWordsPerDay);
      setSelectedLevels(data.selectedLevels);
      setCustomWords(data.customWords);
    }
    initProgress();
  }, [user?.uid]);

  const [newWordInput, setNewWordInput] = useState("");

  const handleLevelToggle = (level: CEFRLevel) => {
    setSelectedLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const [wordIndex, setWordIndex] = useState<Record<string, CEFRLevel> | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  const handleInputChange: React.Dispatch<React.SetStateAction<string>> = (
    value,
  ) => {
    setNewWordInput(value);
    if (errorMessage) setErrorMessage(null);
    if (duplicateMessage) setDuplicateMessage(null);
  };

  useEffect(() => {
    fetch("/vocab/words.json")
      .then((res) => res.json())
      .then((data: Record<string, CEFRLevel>) => setWordIndex(data))
      .catch(() => setWordIndex({}));
  }, []);

  const handleAddWord = () => {
    if (!wordIndex) return;

    const wordsToAdd = newWordInput
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    if (wordsToAdd.length === 0) return;

    const notFound: string[] = [];
    const duplicates: string[] = [];
    const validToAdd: string[] = [];
    const existing = new Set(customWords);

    wordsToAdd.forEach((word) => {
      if (!wordIndex[word]) {
        notFound.push(word);
      } else if (existing.has(word)) {
        duplicates.push(word);
      } else {
        existing.add(word);
        validToAdd.push(word);
      }
    });

    if (notFound.length > 0) {
      setErrorMessage(`Not found in dictionary: ${notFound.join(", ")}`);
    } else {
      setErrorMessage(null);
    }

    if (duplicates.length > 0) {
      setDuplicateMessage(`Already in list: ${duplicates.join(", ")}`);
    } else {
      setDuplicateMessage(null);
    }

    if (validToAdd.length > 0) {
      setCustomWords((prev) => [...validToAdd, ...prev]);
    }

    setNewWordInput("");
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setCustomWords(customWords.filter((word) => word !== wordToRemove));
  };

  const handleSave = async () => {
    await saveSettings(
      {
        newWordsPerDay,
        selectedLevels,
        customWords,
      },
      user?.uid,
    );
    setIsSubmit(true);
    onClose();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col pt-12 pb-8">
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
              <Minus size={16} />
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
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Custom Checkboxes */}
        <div className="flex flex-col space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-blue-950/60">
            Target Difficulty
          </label>

          <div className="flex flex-wrap gap-6">
            {CEFR_LEVELS.map((level) => {
              const isChecked = selectedLevels[level];
              return (
                <label
                  key={level}
                  className="flex items-center space-x-3 cursor-pointer group w-fit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLevelToggle(level);
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
              );
            })}
          </div>
        </div>

        {/* Custom Vocabulary Management */}
        <div className="flex flex-col space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-blue-950/60">
            Manage Target Words
          </label>

          <div className="flex justify-between items-center space-x-3 w-full">
            <div className="text-xl text-blue-950 border-b-2 border-blue-950/30 focus-within:border-blue-950 overflow-hidden">
              <Input
                placeholder="apple, ball, cat..."
                status="unanswered"
                input={newWordInput}
                setInput={handleInputChange}
                onSubmit={handleAddWord}
              />
            </div>
            <Button status="unanswered" onClick={handleAddWord}></Button>
          </div>

          {errorMessage && (
            <p className="text-rose-600 text-xs">{errorMessage}</p>
          )}
          {duplicateMessage && (
            <p className="text-amber-600 text-xs">{duplicateMessage}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto">
            {customWords.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleRemoveWord(word)}
                className="px-3 py-1.5 rounded-md border border-blue-950/15 bg-blue-950/2 text-sm text-blue-950 transition-colors focus:outline-none hover:bg-rose-100 hover:border-rose-200 hover:text-rose-700 hover:line-through"
              >
                <span>{word}</span>
                {wordIndex?.[word] && (
                  <span className="ml-1.5 text-[10px] font-semibold text-blue-950/40 uppercase">
                    {wordIndex[word]}
                  </span>
                )}
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
        <Button status="correct" onClick={handleSave} />
      </div>
    </div>
  );
};
