import { useEffect, useState } from "react";
import { allProjects, person } from "../fs.js";
import { Glyph, NodeIcon } from "../icons/index.jsx";
import { TrafficLights, useWindow } from "../os/chrome.jsx";

const bookmarks = [
  ["GitHub", person.github, "All of my public repositories"],
  ["LinkedIn", person.linkedin, "My professional profile"],
];

function linkOf(project) {
  return project.children.find((c) => c.kind === "link").url;
}

// Most sites refuse to load inside another page, so links open in a real tab
// from a page that says where they lead.
export default function Browser({ url }) {
  const { dragProps } = useWindow();
  const [current, setCurrent] = useState(url ?? null);
  useEffect(() => setCurrent(url ?? null), [url]);

  const shown = current?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? "Start Page";
  const project = current && allProjects.find((p) => linkOf(p) === current);
  const bookmark = current && bookmarks.find(([, u]) => u === current);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header {...dragProps} className="os-toolbar flex h-[46px] flex-none items-center gap-3 px-3">
        <TrafficLights />
        <button type="button" aria-label="Start page" onClick={() => setCurrent(null)} className="os-tool">
          <Glyph.home size={15} />
        </button>
        <p className="mx-auto w-full max-w-[420px] truncate rounded-md bg-[var(--hover)] px-3 py-1 text-center text-[12.5px]">{shown}</p>
        <span className="w-8" />
      </header>

      <div className="scroller flex-1 overflow-y-auto bg-[var(--paper)] p-6 md:p-8">
        {current ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 pt-6 text-center">
            <NodeIcon node={{ kind: "link" }} size={64} />
            <h2 className="text-[20px] font-semibold">{project?.name ?? bookmark?.[0] ?? shown}</h2>
            <p className="text-[13.5px] leading-relaxed text-[var(--text-2)]">{project?.summary ?? bookmark?.[2]}</p>
            <a href={current} target="_blank" rel="noreferrer" className="mt-2 rounded-md bg-[var(--accent)] px-4 py-1.5 text-[13px] font-medium text-white">
              Open in a new tab
            </a>
            <p className="break-all text-[11.5px] text-[var(--text-3)]">{current}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[18px] font-semibold">Favourites</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bookmarks.map(([name, u]) => (
                <button key={name} type="button" onClick={() => setCurrent(u)} className="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-[var(--hover)]">
                  <NodeIcon node={{ kind: "link" }} size={46} />
                  <span className="text-[12.5px]">{name}</span>
                </button>
              ))}
              {allProjects
                .filter((p) => !linkOf(p).includes("github.com"))
                .map((p) => (
                  <button key={p.name} type="button" onClick={() => setCurrent(linkOf(p))} className="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-[var(--hover)]">
                    <NodeIcon node={{ kind: "link" }} size={46} />
                    <span className="text-[12.5px]">{p.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
