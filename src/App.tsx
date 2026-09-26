import { useState } from "react";
import { useQuizSession } from "./hooks/useQuizSession";
import { Navbar } from "./components/Navbar";
import { CompletionScreen } from "./components/CompletionScreen";
import { FillInTheBlank } from "./components/FillInTheBlank";
import { WordHeader } from "./components/WordHeader";
import { ExampleList } from "./components/ExampleList";
import { TagGroup } from "./components/TagGroup";
import { Button } from "./components/Button";
import { Settings } from "./components/Settings";

export const App = () => {
  const {
    isLoading,
    isComplete,
    currentWord,
    vocab,
    sense,
    sentence,
    answer,
    status,
    completedIds,
    cardProgress,
    input,
    setInput,
    handleAction,
    restartSession,
  } = useQuizSession();

  const [isSettings, setIsSettings] = useState(false);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-9xl text-blue-950/6 animate-spin">&#x21BB;</p>
      </div>
    );
  if (isComplete) return <CompletionScreen onRestart={restartSession} />;
  if (!currentWord || !sense) return null;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Navbar
        completedIds={completedIds}
        totalVocab={vocab?.length || 1}
        cardProgress={cardProgress}
        isSettings={isSettings}
        setIsSettings={setIsSettings}
      />
      <div className="flex-1 overflow-y-auto flex flex-col px-4 md:px-20 py-8 box-border w-full">
        <div className="my-auto w-full flex flex-col items-center text-xl sm:text-3xl">
          {isSettings ? (
            <Settings />
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
                    <TagGroup items={sense.syn} />
                  </div>
                )}
                {status !== "unanswered" && (
                  <WordHeader
                    word={currentWord.w}
                    pos={sense.pos}
                    definition={sense.defn}
                  />
                )}
              </div>
              {status !== "unanswered" && (
                <div className="flex justify-center w-full">
                  <div className="columns-1 sm:columns-2 gap-10 sm:gap-20 px-4 sm:px-10 w-full max-w-5xl text-left">
                    <ExampleList examples={sense.ex} />
                    <TagGroup title="Collocations" items={currentWord.col} />
                    <TagGroup title="Synonyms" items={sense.syn} />
                    <TagGroup title="Antonyms" items={sense.ant} />
                  </div>
                </div>
              )}
              <Button status={status} onClick={handleAction} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
