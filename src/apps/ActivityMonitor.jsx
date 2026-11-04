import { useMemo, useState } from "react";
import { languageShare, shortDate, useGitHub } from "../os/github.js";
import { useOS } from "../os/store.jsx";

const COLUMNS = [
  ["name", "Repository", (a, b) => a.name.localeCompare(b.name)],
  ["language", "Language", (a, b) => (a.language ?? "").localeCompare(b.language ?? "")],
  ["stargazers_count", "Stars", (a, b) => a.stargazers_count - b.stargazers_count],
  ["size", "Size", (a, b) => a.size - b.size],
  ["pushed_at", "Last Push", (a, b) => new Date(a.pushed_at) - new Date(b.pushed_at)],
];

const COLORS = ["#0a7cff", "#ff9f0a", "#30d158", "#ff375f", "#bf5af2", "#64d2ff", "#ffd60a"];
const size = (kb) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

export default function ActivityMonitor() {
  const os = useOS();
  const { status, repos } = useGitHub();
  const [sort, setSort] = useState({ key: "pushed_at", dir: -1 });

  const rows = useMemo(() => {
    const cmp = COLUMNS.find(([key]) => key === sort.key)[2];
    return [...repos].sort((a, b) => cmp(a, b) * sort.dir);
  }, [repos, sort]);
  const languages = useMemo(() => languageShare(repos), [repos]);

  if (status !== "ready") {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--paper)] p-6 text-center text-[13px] text-[var(--text-2)]">
        {status === "loading" ? "Reading live data from GitHub…" : "GitHub isn't responding right now. The rest of the portfolio works as normal."}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--paper)]">
      <div className="scroller min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="os-list-head text-left text-[11px] text-[var(--text-2)]">
              {COLUMNS.map(([key, label]) => (
                <th key={key} aria-sort={sort.key === key ? (sort.dir > 0 ? "ascending" : "descending") : undefined} className="px-3 py-1 font-medium">
                  <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }))}>
                    {label} {sort.key === key ? (sort.dir > 0 ? "▲" : "▼") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} onDoubleClick={() => os.openApp("browser", { url: r.html_url })} className={`hover:bg-[var(--selection-soft)] ${i % 2 ? "bg-[var(--stripe)]" : ""}`}>
                <td className="max-w-[210px] truncate px-3 py-[3px] font-medium">
                  <a href={r.html_url} target="_blank" rel="noreferrer" className="hover:underline">
                    {r.name}
                  </a>
                </td>
                <td className="px-3 text-[var(--text-2)]">{r.language ?? "--"}</td>
                <td className="px-3 text-[var(--text-2)]">{r.stargazers_count}</td>
                <td className="px-3 text-[var(--text-2)]">{size(r.size)}</td>
                <td className="whitespace-nowrap px-3 text-[var(--text-2)]">{shortDate(r.pushed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-none items-center gap-4 border-t border-[var(--line)] px-4 py-2.5">
        <div className="flex-none">
          <p className="text-[20px] font-semibold leading-none">{repos.length}</p>
          <p className="mt-0.5 text-[10.5px] text-[var(--text-2)]">public repos, live</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--hover)]">
            {languages.map((l, i) => (
              <span key={l.language} title={`${l.language}: ${l.n}`} style={{ width: `${l.share * 100}%`, background: COLORS[i % COLORS.length] }} />
            ))}
          </div>
          <p className="mt-1 truncate text-[11px] text-[var(--text-2)]">
            {languages.slice(0, 5).map((l, i) => (
              <span key={l.language} className="mr-3 whitespace-nowrap">
                <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {l.language} {Math.round(l.share * 100)}%
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}
