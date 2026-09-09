interface Props {
  examples: string[];
}

export const ExampleList = ({ examples }: Props) => {
  return (
    <div className="break-inside-avoid mb-8">
      <h6 className="mb-4 font-bold text-blue-950/70">Examples</h6>
      <div className="flex flex-col gap-3">
        {examples.map((ex: string, index: number) => (
          <span
            key={index}
            className="text-sm border-l-2 border-blue-950/30 pl-3 py-1 inline-block w-full"
          >
            {ex.split(/(\[\[.*?\]\]|\{\{.*?\}\})/g).map((part, i) =>
              part.startsWith("[[") || part.startsWith("{{") ? (
                <strong className="font-black text-blue-950" key={i}>
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              ),
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
