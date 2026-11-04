// A small renderer for the portfolio's documents: headings, lists,
// paragraphs, **bold** and [links](url).

function inline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline underline-offset-2">
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function Markdown({ source, compact = false }) {
  const blocks = source.split(/\n\n+/);
  const size = compact ? "" : "text-[14px]";
  return (
    <div className={`flex flex-col ${compact ? "gap-1.5 leading-relaxed" : "gap-3 leading-[1.65]"}`}>
      {blocks.map((block, i) => {
        const figure = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (figure) return compact ? null : <img key={i} src={`${import.meta.env.BASE_URL}${figure[2]}`} alt={figure[1]} className={figure[2].startsWith("about/") ? "h-32 w-32 rounded-full object-cover shadow-md" : "w-full rounded-lg shadow-md"} />;
        if (block.startsWith("# ")) return <h1 key={i} className={compact ? "hidden" : "text-[26px] font-bold leading-tight tracking-tight"}>{block.slice(2)}</h1>;
        if (block.startsWith("## ")) return <h2 key={i} className={compact ? "mt-1 font-semibold" : "mt-2 text-[16px] font-semibold"}>{block.slice(3)}</h2>;
        if (block.startsWith("- ")) {
          return (
            <ul key={i} className={`flex list-disc flex-col gap-1 pl-5 ${size}`}>
              {block.split("\n").map((line, j) => (
                <li key={j}>{inline(line.replace(/^- /, ""), `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={size}>
            {inline(block, i)}
          </p>
        );
      })}
    </div>
  );
}
