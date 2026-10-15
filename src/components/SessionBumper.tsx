import { useState, useEffect } from "react";
import { motion, cubicBezier, AnimatePresence } from "framer-motion";
import type { CEFRLevel } from "../types";

interface Props {
  topicTitle: string;
  levels: CEFRLevel[];
}

export const SessionBumper = ({ topicTitle, levels }: Props) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 850);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="bumper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.5, ease: cubicBezier(1, 0, 0, 1) },
          }}
          transition={{ duration: 0.08 }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-14 bg-blue-950 text-zinc-50 select-none cursor-pointer"
        >
          <div className="flex justify-between items-baseline text-xs tracking-wider text-blue-300/60">
            <span>ortho.</span>
            <span>[{levels.join(", ")}]</span>
          </div>

          <div className="my-auto">
            <h1 className="font-sans font-black text-5xl sm:text-8xl md:text-9xl tracking-tight uppercase leading-[0.88] text-white">
              {topicTitle}
            </h1>
          </div>

          <div className="flex justify-between items-baseline text-[10px] tracking-widest text-blue-300/60 uppercase">
            <span>PRESS ANYWHERE TO SKIP</span>
            <span>READY</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
