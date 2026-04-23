export const highlightText = (text, query) => {
  if (!query.trim()) return null;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-amber-200 dark:bg-amber-800/60 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </p>
  );
};
