import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion } from "framer-motion";

interface Props {
  placeholder: string;
  status: "unanswered" | "correct" | "incorrect";
  maxLength?: number;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

export default function Input({
  placeholder,
  status,
  maxLength,
  input,
  setInput,
  onSubmit,
}: Props) {
  const [caretIndex, setCaretIndex] = useState<number>(0);

  const [isFocused, setIsFocused] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    if (isDesktop && inputRef.current && status == "unanswered") {
      inputRef.current.focus();
    }
  }, [status]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCaretIndex(e.target.selectionStart || 0);
  };

  const handleSelection = (
    e: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    setCaretIndex(target.selectionStart || 0);
  };

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const charCount =
    status === "incorrect"
      ? Math.max(input.length, 1)
      : input.length > 0
        ? Math.max(input.length, 5)
        : Math.max(placeholder.length, 5);

  return (
    <div className="relative inline">
      {/* Smooth Caret */}
      {status === "unanswered" && (
        <motion.div
          className="absolute top-1 bottom-1 w-0.5 bg-blue-950 rounded-full"
          animate={{
            x: `${caretIndex}ch`,
            opacity: isFocused ? [1, 0, 1] : 0,
          }}
          transition={{
            x: {
              type: "spring",
              stiffness: 700,
              damping: 35,
            },
            opacity: {
              duration: 1,
              repeat: isFocused ? Infinity : 0,
              ease: "easeInOut",
            },
          }}
        />
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyUp={handleSelection}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        onClick={handleSelection}
        onFocus={() => setIsFocused(true)}
        maxLength={maxLength}
        disabled={status !== "unanswered"}
        style={{ width: `${charCount}ch` }}
        className={`relative z-10 bg-transparent align-baseline outline-none caret-transparent h-lh ${
          status === "incorrect" ? "line-through" : ""
        }`}
        placeholder={placeholder}
      />
    </div>
  );
}
