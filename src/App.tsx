import { useState } from "react";
import { motion, cubicBezier } from "framer-motion";
import { useQuizSession } from "./hooks/useQuizSession";
import { SessionBumper } from "./components/SessionBumper";
import { Navbar } from "./components/Navbar";
import { CompletionScreen } from "./components/CompletionScreen";
import { FillInTheBlank } from "./components/FillInTheBlank";
import { WordHeader } from "./components/WordHeader";
import { ExampleList } from "./components/ExampleList";
import { TagGroup } from "./components/TagGroup";
import { Button } from "./components/Button";
import { Settings } from "./components/Settings";
import { Loader2 } from "lucide-react";
import { TOPIC_MAPPING } from "./types";

export const App = () => {
  const {
    isLoading,
    isComplete,
    currentWord,
    currentTopic,
    vocab,
    levels,
    sentence,
    answer,
    status,
    completedIds,
    cardProgress,
    input,
    setInput,
    handleAction,
    restartSession,
    refreshSession,
  } = useQuizSession();

  const [isSettings, setIsSettings] = useState(false);

  const isLearning = currentWord && !isSettings && !isLoading && !isComplete;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <SessionBumper topicTitle={TOPIC_MAPPING[currentTopic]} levels={levels} />
      <Navbar
        completedIds={completedIds}
        totalVocab={vocab?.length || 1}
        cardProgress={cardProgress}
        isSettings={isSettings}
        isLearning={isLearning}
        setIsSettings={setIsSettings}
      />
      <motion.div
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-4 md:px-20 py-8 box-border w-full"
        key={`${isSettings}${isLoading}${status}`}
        initial={{ opacity: 0, y: 100, x: 0 }}
        animate={{
          opacity: 1,
          y: 0,
          x:
            status === "incorrect" && isLearning
              ? [0, -10, 10, -6, 6, -2, 2, 0]
              : 0,
        }}
        transition={{
          default: { duration: 1, ease: cubicBezier(0, 1, 0, 1) },
          x: { duration: 0.25 },
        }}
      >
        <div className="my-auto w-full flex flex-col items-center text-xl sm:text-3xl">
          {isSettings ? (
            <Settings
              onClose={() => {
                setIsSettings(false);
                refreshSession();
              }}
            />
          ) : isLoading ? (
            <Loader2 size={64} className="text-blue-950/20 animate-spin" />
          ) : !currentWord || isComplete ? (
            <CompletionScreen onRestart={restartSession} />
          ) : (
            <>
              <div className="w-full text-center px-2">
                <FillInTheBlank
                  key={status}
                  sentence={sentence}
                  answer={answer}
                  status={status}
                  input={input}
                  setInput={setInput}
                  onSubmit={handleAction}
                />
                {status === "unanswered" && (
                  <div className="w-full flex justify-center items-center gap-4 mt-2">
                    <TagGroup items={currentWord.syn} />
                  </div>
                )}
                {status !== "unanswered" && (
                  <WordHeader
                    word={currentWord.w}
                    ipa={currentWord.ipa}
                    pos={currentWord.pos}
                    definition={currentWord.defn}
                  />
                )}
              </div>
              {status !== "unanswered" && (
                <div className="flex justify-center w-full">
                  <div className="columns-1 sm:columns-2 gap-10 sm:gap-20 px-4 sm:px-10 w-full max-w-5xl text-left">
                    <ExampleList title="Examples" examples={currentWord.ex} />
                    <ExampleList title="Pattern" examples={[currentWord.pat]} />
                    <TagGroup title="Collocations" items={currentWord.col} />
                    <TagGroup title="Synonyms" items={currentWord.syn} />
                  </div>
                </div>
              )}
              <Button status={status} onClick={handleAction} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
