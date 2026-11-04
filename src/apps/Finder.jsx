import { useEffect, useMemo, useRef, useState } from "react";
import { allProjects, pathOfProject, resolve, root, trash, walk } from "../fs.js";
import { AppIcon, FolderIcon, Glyph, NodeIcon } from "../icons/index.jsx";
import { TrafficLights, useWindow } from "../os/chrome.jsx";
import { Markdown } from "./Markdown.jsx";

const asset = (src) => `${import.meta.env.BASE_URL}${src}`;
const HOME = [root.name];
const TAGS = [["AI", "#0a7cff"], ["Vision", "#a855f7"], ["Web", "#22a559"]];

const FAVOURITES = [
  ["Home", HOME, Glyph.home],
  ["Projects", [...HOME, "Projects"], Glyph.folder],
  ["Experience", [...HOME, "Experience"], Glyph.clock],
  ["Skills", [...HOME, "Skills"], Glyph.folder],
  ["Education", [...HOME, "Education"], Glyph.doc],
  ["Contact", [...HOME, "Contact"], Glyph.mail],
];

const VIEWS = [
  ["icons", "as Icons", Glyph.icons],
  ["list", "as List", Glyph.list],
  ["columns", "in Columns", Glyph.columns],
  ["gallery", "as Gallery", Glyph.gallery],
];

const KIND = { folder: "Folder", markdown: "Markdown Document", image: "JPEG Image", link: "Web Location", app: "Application", resume: "PDF Document" };

const sizeOf = (node) => {
  if (node.kind === "folder") return `${node.children.length} item${node.children.length === 1 ? "" : "s"}`;
  if (node.kind === "markdown") return `${Math.max(1, Math.round(node.body.length / 100) / 10)} KB`;
  return "--";
};

function previewOf(node) {
  if (node.kind === "image") return node;
  return node.children?.find((c) => c.kind === "image") ?? null;
}

function useFinder(initialPath, startInTrash) {
  const [history, setHistory] = useState([startInTrash ? { trash: true } : { path: initialPath ?? HOME }]);
  const [index, setIndex] = useState(0);
  const here = history[index];

  const go = (entry) => {
    setHistory((h) => [...h.slice(0, index + 1), entry]);
    setIndex(index + 1);
  };
  return {
    here,
    go,
    back: index > 0 ? () => setIndex(index - 1) : null,
    forward: index < history.length - 1 ? () => setIndex(index + 1) : null,
  };
}

function Sidebar({ here, go, query }) {
  const row = (active) =>
    `flex w-full items-center gap-2 rounded-md px-2 py-[3px] text-left text-[13px] ${active ? "bg-[var(--selection-soft)]" : "hover:bg-[var(--hover)]"}`;
  const isHere = (path) => !here.tag && !here.trash && !query && here.path?.join("/") === path.join("/");
  return (
    <nav className="os-sidebar scroller hidden w-[186px] flex-none overflow-y-auto px-2 pb-3 pt-1 md:block" aria-label="Finder sidebar">
      <p className="mb-0.5 mt-2 px-2 text-[11px] font-semibold text-[var(--text-3)]">Favourites</p>
      {FAVOURITES.map(([label, path, Icon]) => (
        <button key={label} type="button" onClick={() => go({ path })} className={row(isHere(path))}>
          <Icon size={15} className="text-[var(--accent)]" />
          {label}
        </button>
      ))}
      <p className="mb-0.5 mt-3 px-2 text-[11px] font-semibold text-[var(--text-3)]">Locations</p>
      <button type="button" onClick={() => go({ path: HOME })} className={row(false)}>
        <Glyph.disk size={15} className="text-[var(--text-2)]" />
        Portfolio HD
      </button>
      <button type="button" onClick={() => go({ trash: true })} className={row(here.trash)}>
        <Glyph.trash size={15} className="text-[var(--text-2)]" />
        Trash
      </button>
      <p className="mb-0.5 mt-3 px-2 text-[11px] font-semibold text-[var(--text-3)]">Tags</p>
      {TAGS.map(([tag, color]) => (
        <button key={tag} type="button" onClick={() => go({ tag })} className={row(here.tag === tag)}>
          <span className="ml-0.5 h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {tag}
        </button>
      ))}
    </nav>
  );
}

// Projects show their cover; everything else its icon.
function Thumb({ node }) {
  const shot = previewOf(node);
  if (!shot) return <NodeIcon node={node} size={60} />;
  return (
    <span className="relative block h-[60px] w-[80px]">
      <img src={asset(shot.src)} alt="" loading="lazy" className="h-full w-full rounded-[5px] object-cover shadow-md ring-1 ring-black/10" />
      {node.kind === "folder" && (
        <span className="absolute -bottom-1.5 -right-1.5">
          <FolderIcon size={26} />
        </span>
      )}
    </span>
  );
}

function IconsView({ items, selected, select, open, phone, onItemMenu }) {
  return (
    <div className="scroller grid flex-1 content-start gap-x-2 gap-y-3 overflow-y-auto p-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))" }}>
      {items.map((item) => {
        const on = selected === item.node.name;
        return (
          <button
            key={item.path.join("/")}
            type="button"
            onClick={() => (phone ? open(item) : select(item.node.name))}
            onDoubleClick={() => open(item)}
            onContextMenu={(e) => onItemMenu(e, item)}
            className="flex flex-col items-center gap-1 outline-none"
          >
            <span className={`rounded-md p-1.5 ${on ? "bg-[var(--selection-soft)]" : ""}`}>
              <Thumb node={item.node} />
            </span>
            <span className={`max-w-[100px] break-words rounded px-1 text-center text-[12px] leading-tight ${on ? "bg-[var(--accent)] text-white" : ""}`}>{item.node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function ListView({ items, selected, select, open, phone, onItemMenu }) {
  return (
    <div className="scroller flex-1 overflow-auto">
      <table className="w-full min-w-[440px] border-collapse text-[13px]">
        <thead className="sticky top-0 z-10">
          <tr className="os-list-head text-left text-[11px] text-[var(--text-2)]">
            <th className="px-4 py-1 font-medium">Name</th>
            <th className="w-16 px-2 font-medium">Year</th>
            <th className="w-24 px-2 font-medium">Size</th>
            <th className="w-40 px-2 font-medium">Kind</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const on = selected === item.node.name;
            return (
              <tr
                key={item.path.join("/")}
                onClick={() => (phone ? open(item) : select(item.node.name))}
                onDoubleClick={() => open(item)}
                onContextMenu={(e) => onItemMenu(e, item)}
                className={on ? "bg-[var(--accent)] text-white" : i % 2 ? "bg-[var(--stripe)]" : ""}
              >
                <td className="px-4 py-[3px]">
                  <span className="flex items-center gap-2">
                    <NodeIcon node={item.node} size={18} />
                    <span className="truncate">{item.node.name}</span>
                  </span>
                </td>
                <td className={`px-2 ${on ? "" : "text-[var(--text-2)]"}`}>{item.node.year ?? "--"}</td>
                <td className={`px-2 ${on ? "" : "text-[var(--text-2)]"}`}>{sizeOf(item.node)}</td>
                <td className={`truncate px-2 ${on ? "" : "text-[var(--text-2)]"}`}>{KIND[item.node.kind]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Inspector({ node }) {
  const shot = node.hideShot ? null : previewOf(node);
  return (
    <div className="scroller h-full overflow-y-auto p-4 text-center">
      {node.hideShot ? null : shot ? <img src={asset(shot.src)} alt={shot.alt} className="mx-auto max-h-[190px] rounded object-contain shadow" /> : <span className="inline-block"><NodeIcon node={node} size={96} /></span>}
      <p className="mt-3 text-[14px] font-semibold">{node.name}</p>
      <p className="text-[12px] text-[var(--text-2)]">
        {KIND[node.kind]} · {sizeOf(node)}
      </p>
      {node.summary && <p className="mt-3 text-left text-[12.5px] leading-relaxed">{node.summary}</p>}
      {node.stack && <p className="mt-2 text-left text-[12px] text-[var(--text-2)]">{node.stack.join(" · ")}</p>}
      {node.kind === "markdown" && (
        <div className="mt-3 text-left text-[12.5px]">
          <Markdown source={node.body} compact />
        </div>
      )}
    </div>
  );
}

function ColumnsView({ path, go, selected, select, open }) {
  const depths = path.map((_, i) => path.slice(0, i + 1));
  const leaf = resolve(path)?.children?.find((c) => c.name === selected);
  const scroller = useRef(null);
  useEffect(() => {
    scroller.current?.scrollTo({ left: 99999, behavior: "smooth" });
  }, [path, selected]);
  return (
    <div ref={scroller} className="scroller flex flex-1 overflow-x-auto">
      {depths.map((p, d) => {
        const folder = resolve(p);
        const nextName = path[d + 1];
        return (
          <ul key={p.join("/")} className="scroller w-[210px] flex-none overflow-y-auto border-r border-[var(--line)] py-1">
            {folder.children.map((child) => {
              const childPath = [...p, child.name];
              const on = nextName === child.name || (d === depths.length - 1 && selected === child.name);
              return (
                <li key={child.name}>
                  <button
                    type="button"
                    onClick={() => (child.kind === "folder" ? go({ path: childPath }) : (go({ path: p }), select(child.name)))}
                    onDoubleClick={() => open({ node: child, path: childPath })}
                    className={`mx-1 flex w-[calc(100%-8px)] items-center gap-2 rounded px-2 py-[3px] text-left text-[13px] ${on ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--hover)]"}`}
                  >
                    <NodeIcon node={child} size={16} />
                    <span className="flex-1 truncate">{child.name}</span>
                    {child.kind === "folder" && <Glyph.chevronRight size={10} />}
                  </button>
                </li>
              );
            })}
          </ul>
        );
      })}
      <div className="min-w-[260px] flex-1">{leaf ? <Inspector node={leaf} /> : <Inspector node={resolve(path)} />}</div>
    </div>
  );
}

function GalleryView({ items, selected, select, open, onItemMenu }) {
  const current = items.find((i) => i.node.name === selected) ?? items[0];
  if (!current) return <div className="flex-1" />;
  const shot = previewOf(current.node);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 items-center justify-center p-5">
          {shot ? (
            <img src={asset(shot.src)} alt={shot.alt} className="max-h-full max-w-full rounded-md object-contain shadow-lg" />
          ) : (
            <NodeIcon node={current.node} size={150} />
          )}
        </div>
        <div className="hidden w-[240px] flex-none flex-col border-l border-[var(--line)] md:flex">
          <div className="min-h-0 flex-1">
            <Inspector node={{ ...current.node, children: current.node.children, hideShot: true }} />
          </div>
          <div className="flex-none border-t border-[var(--line)] p-2">
            <button type="button" onClick={() => open(current)} className="w-full rounded-md bg-[var(--accent)] py-1 text-[12.5px] font-medium text-white">
              Open
            </button>
          </div>
        </div>
      </div>
      <div className="scroller flex flex-none gap-1 overflow-x-auto border-t border-[var(--line)] p-2">
        {items.map((item) => (
          <button
            key={item.path.join("/")}
            type="button"
            onClick={() => select(item.node.name)}
            onDoubleClick={() => open(item)}
            onContextMenu={(e) => onItemMenu(e, item)}
            aria-label={item.node.name}
            className={`flex-none rounded p-1 ${item === current ? "bg-[var(--accent)]" : ""}`}
          >
            {previewOf(item.node) ? <img src={asset(previewOf(item.node).src)} alt="" loading="lazy" className="h-11 w-[59px] rounded-[3px] object-cover" /> : <NodeIcon node={item.node} size={44} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ItemMenu({ menu, close, open, os }) {
  const { item, x, y } = menu;
  const rows = [
    ["Open", () => open(item)],
    ["Quick Look", () => os.setQuickLook(item)],
    ["Get Info", () => os.openApp("info", { node: item.node, path: item.path }, { title: `${item.node.name} Info`, key: `info:${item.path.join("/")}` })],
  ];
  return (
    <div role="menu" className="os-menu fixed z-[7500] min-w-[170px] rounded-lg p-1 text-[13px]" style={{ left: Math.min(x, window.innerWidth - 180), top: Math.min(y, window.innerHeight - 110) }}>
      {rows.map(([label, run]) => (
        <button
          key={label}
          type="button"
          role="menuitem"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            close();
            run();
          }}
          className="block w-full rounded px-2 py-[3px] text-left hover:bg-[var(--accent)] hover:text-white"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Finder({ path: startPath, trash: startTrash }) {
  const { win, os, dragProps, phone } = useWindow();
  const { here, go: rawGo, back, forward } = useFinder(startPath, startTrash);
  const [chosenView, setView] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (!menu) return undefined;
    const away = () => setMenu(null);
    window.addEventListener("pointerdown", away, { once: true });
    return () => window.removeEventListener("pointerdown", away);
  }, [menu]);

  const go = (entry) => {
    setSelected(null);
    setQuery("");
    rawGo(entry);
  };

  useEffect(() => {
    if (!startTrash && startPath && startPath.join("/") !== (here.path ?? []).join("/")) go({ path: startPath });
    // Reopening a Finder window at a new folder arrives as a new prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPath]);

  const items = useMemo(() => {
    if (query) {
      const q = query.toLowerCase();
      return walk()
        .filter((e) => e.node.kind !== "app" && e.node.name.toLowerCase().includes(q))
        .slice(0, 60);
    }
    if (here.trash) return [];
    if (here.tag) return allProjects.filter((p) => p.tag === here.tag).map((node) => ({ node, path: pathOfProject(node.name) }));
    const folder = resolve(here.path);
    return (folder?.children ?? []).map((node) => ({ node, path: [...here.path, node.name] }));
  }, [here, query]);

  const title = query ? "Searching" : here.trash ? trash.name : here.tag ? here.tag : (here.path[here.path.length - 1] === root.name ? "Home" : here.path[here.path.length - 1]);

  useEffect(() => {
    os.setTitle(win.id, title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const open = ({ node, path }) => {
    if (node.kind === "folder") go({ path });
    else os.openNode(node, path);
  };

  const onKey = (e) => {
    if (e.target.tagName === "INPUT") return;
    const i = items.findIndex((x) => x.node.name === selected);
    if (e.key === " ") {
      e.preventDefault();
      if (os.quickLook) os.setQuickLook(null);
      else if (items[i]) os.setQuickLook(items[i]);
    } else if (e.key === "Enter" && items[i]) {
      open(items[i]);
    } else if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      setSelected(items[Math.min(items.length - 1, i + 1)]?.node.name ?? null);
    } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      setSelected(items[Math.max(0, i - 1)]?.node.name ?? null);
    }
  };

  // Lists of projects open in Gallery, so their covers lead, until a view is chosen.
  const view = chosenView ?? (!phone && items.length > 1 && items.every((i) => i.node.summary) ? "gallery" : "icons");
  const activeView = phone && view === "columns" ? "list" : view;
  const crumbs = here.path && !query && !here.tag && !here.trash ? here.path : null;
  const onItemMenu = (e, item) => {
    e.preventDefault();
    setSelected(item.node.name);
    setMenu({ item, x: e.clientX, y: e.clientY });
  };
  const props = { items, selected, select: setSelected, open, phone, onItemMenu };

  return (
    <div className="flex min-h-0 flex-1 outline-none" tabIndex={0} onKeyDown={onKey}>
      <div className="flex min-h-0 flex-col">
        <div {...dragProps} className="os-sidebar hidden h-[52px] flex-none items-center px-4 md:flex" style={{ width: 186 }}>
          <TrafficLights />
        </div>
        <Sidebar here={here} go={go} query={query} />
      </div>

      {menu && <ItemMenu menu={menu} close={() => setMenu(null)} open={open} os={os} />}
      <div className="os-content flex min-h-0 min-w-0 flex-1 flex-col">
        <header {...dragProps} className="os-toolbar flex h-[52px] flex-none items-center gap-2 px-3">
          <div className="md:hidden">
            <TrafficLights />
          </div>
          <button type="button" aria-label="Back" disabled={!back} onClick={back ?? undefined} className="os-tool disabled:opacity-30">
            <Glyph.chevronLeft size={15} />
          </button>
          <button type="button" aria-label="Forward" disabled={!forward} onClick={forward ?? undefined} className="os-tool hidden disabled:opacity-30 md:flex">
            <Glyph.chevronRight size={15} />
          </button>
          <h2 className="ml-1 min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</h2>
          <div className="hidden items-center rounded-md bg-[var(--hover)] p-0.5 sm:flex" role="group" aria-label="View">
            {VIEWS.map(([id, label, Icon]) => (
              <button key={id} type="button" aria-label={`View ${label}`} aria-pressed={view === id} onClick={() => setView(id)} className={`flex h-6 w-8 items-center justify-center rounded ${view === id ? "bg-[var(--seg-on)] shadow-sm" : ""}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <label className="flex h-7 w-[150px] items-center gap-1.5 rounded-md bg-[var(--hover)] px-2 max-md:w-[110px]">
            <Glyph.search size={12} className="flex-none text-[var(--text-2)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search portfolio" className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-[var(--text-3)]" />
          </label>
        </header>

        {here.trash && !query ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[var(--text-2)]">
            <AppIcon.trash size={72} />
            <p className="text-[15px]">Trash is empty</p>
            <p className="text-[12px]">Bugs are deleted permanently.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-[14px] text-[var(--text-2)]">{query ? "No results" : "This folder is empty"}</div>
        ) : activeView === "icons" ? (
          <IconsView {...props} />
        ) : activeView === "list" ? (
          <ListView {...props} />
        ) : activeView === "columns" && crumbs ? (
          <ColumnsView path={crumbs} go={go} selected={selected} select={setSelected} open={open} />
        ) : activeView === "columns" ? (
          <ListView {...props} />
        ) : (
          <GalleryView {...props} />
        )}

        <footer className="os-pathbar flex h-[24px] flex-none items-center justify-between gap-3 px-3 text-[11px] text-[var(--text-2)]">
          <span className="flex min-w-0 items-center gap-1 truncate">
            {crumbs?.map((name, i) => (
              <span key={name} className="flex items-center gap-1">
                {i > 0 && <Glyph.chevronRight size={8} />}
                <button type="button" onClick={() => go({ path: crumbs.slice(0, i + 1) })} className="hover:underline">
                  {name}
                </button>
              </span>
            ))}
          </span>
          <span className="flex-none">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </footer>
      </div>
    </div>
  );
}
