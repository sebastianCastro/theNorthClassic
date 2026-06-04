function parseListItems(text: string): string[] | null {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const items = lines.map((l) =>
    l.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "").trim()
  );
  if (items.every((item) => item.length > 0)) return items;
  return null;
}

export function FaqAnswer({
  answer,
  asList = false,
}: {
  answer: string;
  asList?: boolean;
}) {
  const items =
    parseListItems(answer) ??
    (asList ? parseListItems(answer.replace(/;\s*/g, "\n")) : null) ??
    (asList ? parseListItems(answer.replace(/\.\s+(?=[A-ZÁÉÍÓÚ])/g, "\n")) : null);

  if (items && items.length > 0) {
    return (
      <ul className="list-disc space-y-2 pl-5 text-muted marker:text-accent">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return <p className="leading-relaxed text-muted">{answer}</p>;
}
