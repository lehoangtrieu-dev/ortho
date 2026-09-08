import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion } from "framer-motion";

export default function Input({ placeholder }: { placeholder: string }) {
  const [text, setText] = useState<string>("");
  const [caretIndex, setCaretIndex] = useState<number>(0);

  const [isFocused, setIsFocused] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    if (isDesktop && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setCaretIndex(e.target.selectionStart || 0);
  };

  const handleSelection = (
    e: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    setCaretIndex(target.selectionStart || 0);
  };

  return (
    <div className="relative inline text-gray-800">
      {/* Smooth Caret */}
      <motion.div
        className="absolute top-1 bottom-1 w-0.5 bg-blue-900 rounded-full"
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

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyUp={handleSelection}
        onClick={handleSelection}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={18}
        className="relative z-10 bg-transparent align-baseline text-blue-900 outline-none caret-transparent field-sizing-content min-w-[5ch] h-lh"
        placeholder={placeholder}
      />
    </div>
  );
}
