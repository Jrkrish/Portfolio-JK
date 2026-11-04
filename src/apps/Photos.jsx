import { useEffect, useMemo, useState } from "react";
import { allProjects, pathOfProject } from "../fs.js";
import { Glyph } from "../icons/index.jsx";
import { useOS } from "../os/store.jsx";

const ALBUMS = [
  ["All Projects", null],
  ["AI & LLM", "AI"],
  ["Computer Vision", "Vision"],
  ["Web", "Web"],
];

const photos = allProjects.map((project) => ({ project, shot: project.children.find((c) => c.kind === "image") }));

export default function Photos() {
  const os = useOS();
  const [album, setAlbum] = useState(null);
  const [open, setOpen] = useState(null);
  const shown = useMemo(() => photos.filter((p) => !album || p.project.tag === album), [album]);
  const current = open === null ? null : shown[open];

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % shown.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + shown.length) % shown.length);
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shown.length]);

  return (
    <div className="flex min-h-0 flex-1">
      <nav className="os-sidebar hidden w-[160px] flex-none p-2 md:block" aria-label="Albums">
        <p className="mb-1 px-2 text-[11px] font-semibold text-[var(--text-3)]">Albums</p>
        {ALBUMS.map(([label, tag]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setAlbum(tag);
              setOpen(null);
            }}
            className={`block w-full rounded-md px-2 py-[3px] text-left text-[13px] ${album === tag ? "bg-[var(--selection-soft)]" : "hover:bg-[var(--hover)]"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="relative min-w-0 flex-1 bg-[var(--paper)]">
        <div className="scroller grid h-full content-start gap-1 overflow-y-auto p-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {shown.map((p, i) => (
            <button key={p.project.name} type="button" onClick={() => setOpen(i)} aria-label={`View ${p.project.name}`} className="group relative aspect-[4/3] overflow-hidden rounded-[3px]">
              <img src={`${import.meta.env.BASE_URL}${p.shot.src}`} alt={p.shot.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-left text-[11.5px] font-medium text-white">{p.project.name}</span>
            </button>
          ))}
        </div>

        {current && (
          <div className="absolute inset-0 flex flex-col bg-black">
            <div className="flex flex-none items-center gap-2 px-3 py-2 text-white">
              <button type="button" onClick={() => setOpen(null)} aria-label="Back to album" className="os-tool">
                <Glyph.chevronLeft size={15} />
              </button>
              <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{current.project.name}</p>
              <button type="button" onClick={() => os.openNode(current.project, pathOfProject(current.project.name))} className="rounded bg-white/15 px-2 py-0.5 text-[12px]">
                Open Folder
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center p-3">
              <img src={`${import.meta.env.BASE_URL}${current.shot.src}`} alt={current.shot.alt} className="max-h-full max-w-full object-contain" />
              <button type="button" aria-label="Previous" onClick={() => setOpen((i) => (i - 1 + shown.length) % shown.length)} className="absolute left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                <Glyph.chevronLeft size={14} />
              </button>
              <button type="button" aria-label="Next" onClick={() => setOpen((i) => (i + 1) % shown.length)} className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                <Glyph.chevronRight size={14} />
              </button>
            </div>
            <p className="flex-none px-4 pb-3 text-center text-[12.5px] text-white/75">{current.project.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
