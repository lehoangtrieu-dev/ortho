interface Props {
  title: string;
  items: string[];
}

export const TagGroup = ({ title, items }: Props) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="break-inside-avoid mb-8">
      <h6 className="mb-3 font-bold text-blue-950/70">{title}</h6>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="text-sm border border-blue-950/30 rounded-full px-3 py-1.5"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
