import { useMemo, useState } from "react";
import { EDUCATION, allProjects } from "../fs.js";
import { Glyph } from "../icons/index.jsx";

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const COLOR = { AI: "#0a7cff", Vision: "#a855f7", Web: "#22a559", Work: "#ff9f0a", Study: "#ff375f" };

const MILESTONES = [
  [2026, "Study", `${EDUCATION.status}, ${EDUCATION.degree}`, `${EDUCATION.college}, CGPA ${EDUCATION.cgpa}`],
  [2022, "Study", "Started B.Tech Information Technology", "Sri Manakula Vinayagar Engineering College"],
  [2023, "Work", "Creators of Metaverse", "Flaunch IO"],
  [2024, "Work", "Full Stack Intern", "Corizo Edutech"],
  [2024, "Work", "Gen AI Intern", "Flaunch IO"],
];

// Career events by year, newest first. Dates are kept to the year on purpose.
function useTimeline() {
  return useMemo(() => {
    const events = [
      ...MILESTONES.map(([year, tag, title, detail]) => ({ year, tag, title, detail })),
      ...allProjects.map((p) => ({ year: p.year, tag: p.tag, title: p.name, detail: p.summary })),
    ];
    const years = [...new Set(events.map((e) => e.year))].sort((a, b) => b - a);
    return years.map((year) => ({ year, events: events.filter((e) => e.year === year) }));
  }, []);
}

export function MonthGrid({ compact = false }) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const lead = (cursor.getDay() + 6) % 7;
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const isThisMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">{cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
        {!compact && (
          <span className="flex gap-1">
            <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="os-tool !h-5 !w-5">
              <Glyph.chevronLeft size={11} />
            </button>
            <button type="button" aria-label="Next month" onClick={() => shift(1)} className="os-tool !h-5 !w-5">
              <Glyph.chevronRight size={11} />
            </button>
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {WEEK.map((d, i) => (
          <span key={i} className="font-semibold text-[var(--text-3)]">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const on = isThisMonth && i + 1 === today.getDate();
          return (
            <span key={i} className={`mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-full ${on ? "bg-[#ff375f] font-semibold text-white" : ""}`}>
              {i + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendar() {
  const timeline = useTimeline();
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="os-sidebar hidden w-[220px] flex-none p-3 md:block">
        <MonthGrid />
        <ul className="mt-4 flex flex-col gap-1 text-[12px]">
          {[
            ["AI", "AI & LLM"],
            ["Vision", "Computer Vision"],
            ["Web", "Web"],
            ["Work", "Experience"],
            ["Study", "Education"],
          ].map(([key, label]) => (
            <li key={key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: COLOR[key] }} />
              {label}
            </li>
          ))}
        </ul>
      </aside>
      <div className="scroller min-w-0 flex-1 overflow-y-auto bg-[var(--paper)] p-5">
        <h2 className="text-[22px] font-bold tracking-tight">Career Timeline</h2>
        {timeline.map(({ year, events }) => (
          <section key={year} className="mt-4 grid grid-cols-[56px_1fr] gap-3">
            <h3 className="text-[17px] font-semibold text-[#ff375f]">{year}</h3>
            <ul className="flex min-w-0 flex-col gap-1.5">
              {events.map((e) => (
                <li key={e.title} className="rounded-md py-1 pl-2.5 pr-2" style={{ background: `${COLOR[e.tag]}1f`, borderLeft: `3px solid ${COLOR[e.tag]}` }}>
                  <p className="text-[13px] font-semibold leading-tight">{e.title}</p>
                  <p className="truncate text-[11.5px] text-[var(--text-2)]">{e.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
