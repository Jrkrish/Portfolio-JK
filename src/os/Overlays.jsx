import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { walk } from "../fs.js";
import { AppIcon, Glyph, NodeIcon } from "../icons/index.jsx";
import { Markdown } from "../apps/Markdown.jsx";
import { useOS } from "./store.jsx";

const fade = { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 }, transition: { duration: 0.13 } };

const APPS = [
  ["Terminal", "terminal"],
  ["Mail", "mail"],
  ["Browser", "browser"],
  ["Settings", "settings"],
  ["Photos", "photos"],
  ["Calendar", "calendar"],
  ["Activity Monitor", "activity"],
  ["Assistant", "assistant"],
];

function Spotlight() {
  const os = useOS();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const entries = useMemo(() => walk(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return entries
        .filter((e) => ["Projects", "About Me.md", "Resume.pdf", "Experience", "Send a Message"].includes(e.node.name))
        .map((e) => ({ ...e, group: "Suggestions" }));
    }
    const apps = APPS.filter(([name]) => name.toLowerCase().includes(q)).map(([name, app]) => ({ node: { kind: "app", name, app }, path: [name], group: "Applications" }));
    const matches = (e) =>
      e.node.name.toLowerCase().includes(q) ||
      e.node.body?.toLowerCase().includes(q) ||
      e.node.summary?.toLowerCase().includes(q) ||
      e.node.stack?.some((s) => s.toLowerCase().includes(q));
    const files = entries
      .filter(matches)
      .filter((e) => !["Cover.jpg", "README.md"].includes(e.node.name))
      .slice(0, 8)
      .map((e) => ({ ...e, group: e.node.kind === "folder" ? "Folders" : "Documents" }));
    const askRow = { node: { kind: "app", name: `Ask Assistant: ${query.trim()}`, app: "assistant" }, path: ["assistant"], group: "Assistant", question: query.trim() };
    return [...apps, ...files, askRow];
  }, [query, entries]);

  const pick = (r) => {
    os.setOverlay(null);
    if (r.question) os.openApp("assistant", { question: r.question });
    else os.openNode(r.node, r.path);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && results[cursor]) {
      pick(results[cursor]);
    }
  };

  return (
    <div className="fixed inset-0 z-[8500] flex justify-center pt-[20vh]" onPointerDown={() => os.setOverlay(null)}>
      <motion.div {...fade} role="dialog" aria-label="Spotlight search" onPointerDown={(e) => e.stopPropagation()} className="os-spotlight h-fit w-[min(620px,92vw)] overflow-hidden rounded-2xl">
        <label className="flex items-center gap-3 px-4 py-3">
          <Glyph.search size={21} className="flex-none text-[var(--text-2)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKey}
            placeholder="Spotlight Search"
            aria-label="Search the portfolio"
            className="w-full bg-transparent text-[22px] font-light outline-none placeholder:text-[var(--text-3)]"
          />
        </label>
        {results.length > 0 && (
          <ul className="scroller max-h-[340px] overflow-y-auto border-t border-[var(--line)] p-1.5">
            {results.map((r, i) => (
              <li key={r.path.join("/")}>
                {(i === 0 || results[i - 1].group !== r.group) && <p className="px-2 pb-0.5 pt-1.5 text-[11px] font-semibold text-[var(--text-3)]">{r.group}</p>}
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => pick(r)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-left text-[13.5px] ${i === cursor ? "bg-[var(--accent)] text-white" : ""}`}
                >
                  <NodeIcon node={r.node} size={22} />
                  <span className="min-w-0 flex-1 truncate">{r.node.name.replace(/\.(md|webloc)$/, "")}</span>
                  <span className="truncate text-[11.5px] opacity-60">{r.path.slice(1, -1).join(" / ")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && <p className="border-t border-[var(--line)] p-4 text-[13px] text-[var(--text-2)]">No results</p>}
      </motion.div>
    </div>
  );
}

function Tile({ on, label, detail, Icon, onClick }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="flex items-center gap-2 rounded-xl bg-[var(--hover)] p-2 text-left">
      <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${on ? "bg-[var(--accent)] text-white" : "bg-[var(--hover)]"}`}>
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold leading-tight">{label}</span>
        <span className="block truncate text-[11px] leading-tight text-[var(--text-2)]">{detail}</span>
      </span>
    </button>
  );
}

function ControlCenter() {
  const os = useOS();
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  return (
    <div className="fixed inset-0 z-[7900]" onPointerDown={() => os.setOverlay(null)}>
      <motion.div {...fade} role="dialog" aria-label="Control Center" onPointerDown={(e) => e.stopPropagation()} className="os-menu absolute right-2 top-[32px] w-[300px] max-w-[94vw] rounded-2xl p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Tile on={wifi} label="Wi-Fi" detail={wifi ? "Connected" : "Off"} Icon={Glyph.wifi} onClick={() => setWifi(!wifi)} />
          <Tile on={bt} label="Bluetooth" detail={bt ? "On" : "Off"} Icon={Glyph.bluetooth} onClick={() => setBt(!bt)} />
          <Tile on={os.dark} label="Dark Mode" detail={os.dark ? "On" : "Off"} Icon={os.dark ? Glyph.moon : Glyph.sun} onClick={() => os.setTheme(os.dark ? "light" : "dark")} />
          <Tile on label="Status" detail="Open to work" Icon={Glyph.person} onClick={() => os.openApp("mail")} />
        </div>
        <label className="mt-2 block rounded-xl bg-[var(--hover)] p-2.5 text-[12px] font-semibold">
          Display
          <span className="mt-1 flex items-center gap-2 font-normal">
            <Glyph.sun size={13} />
            <input type="range" min="45" max="100" value={os.brightness} aria-label="Brightness" onChange={(e) => os.setBrightness(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
          </span>
        </label>
      </motion.div>
    </div>
  );
}

function QuickLook({ item }) {
  const os = useOS();
  const { node, path } = item;
  const shot = node.kind === "image" ? node : node.children?.find((c) => c.kind === "image");
  const readme = node.kind === "markdown" ? node : node.children?.find((c) => c.kind === "markdown");
  return (
    <div className="fixed inset-0 z-[8400] flex items-center justify-center p-4" onPointerDown={() => os.setQuickLook(null)}>
      <motion.div {...fade} role="dialog" aria-label={`Quick Look: ${node.name}`} onPointerDown={(e) => e.stopPropagation()} className="os-window is-focused flex max-h-[80vh] w-[min(640px,94vw)] flex-col overflow-hidden rounded-xl">
        <header className="os-titlebar flex h-9 flex-none items-center justify-between gap-3 px-3 text-[13px] font-semibold">
          <span className="truncate">{node.name}</span>
          <button
            type="button"
            onClick={() => {
              os.setQuickLook(null);
              os.openNode(node, path);
            }}
            className="flex-none rounded bg-[var(--hover)] px-2 py-0.5 text-[12px] font-medium"
          >
            Open
          </button>
        </header>
        <div className="scroller min-h-0 flex-1 overflow-y-auto bg-[var(--paper)] p-5">
          {shot && <img src={`${import.meta.env.BASE_URL}${shot.src}`} alt={shot.alt} className="mx-auto max-h-[300px] rounded object-contain" />}
          {readme && (
            <div className={shot ? "mt-4" : ""}>
              <Markdown source={readme.body} />
            </div>
          )}
          {!shot && !readme && (
            <div className="flex flex-col items-center gap-2 py-6">
              <NodeIcon node={node} size={84} />
              <p className="text-[13px] text-[var(--text-2)]">{node.url ?? (node.children ? `${node.children.length} items` : "")}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function MissionControl() {
  const os = useOS();
  const slots = Object.values(os.slots ?? {});
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9] bg-black/40 backdrop-blur-sm"
        onPointerDown={() => os.setOverlay(null)}
      />
      {!os.windows.some((w) => !w.minimized) ? (
        <p className="pointer-events-none fixed inset-x-0 top-1/2 z-[7700] text-center text-[15px] text-white">No open windows</p>
      ) : (
        slots.map((s) => (
          <motion.span
            key={s.title + s.cx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15 }}
            className="pointer-events-none fixed z-[7700] -translate-x-1/2 truncate rounded-md bg-black/55 px-2 py-0.5 text-[12px] font-medium text-white"
            style={{ left: s.cx, top: s.cy + s.cellH / 2 + 4, maxWidth: s.cellW }}
          >
            {s.title}
          </motion.span>
        ))
      )}
    </>
  );
}

function SnapGhost() {
  const { snap } = useOS();
  if (!snap) return null;
  return <div className="pointer-events-none fixed z-[6900] rounded-xl border-2 border-white/60 bg-white/20 backdrop-blur-md" style={{ left: snap.x + 6, top: snap.y + 6, width: snap.w - 12, height: snap.h - 12 }} />;
}

function Toasts() {
  const os = useOS();
  return (
    <div className="pointer-events-none fixed right-3 top-[36px] z-[7800] flex w-[340px] max-w-[94vw] flex-col gap-2">
      <AnimatePresence>
        {os.toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            layout
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={() => t.run?.()}
            className="os-menu pointer-events-auto flex items-start gap-2.5 rounded-2xl p-3 text-left"
          >
            <AppIcon.mail size={34} />
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">{t.title}</span>
              <span className="block text-[12.5px] leading-snug text-[var(--text-2)]">{t.body}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Overlays() {
  const os = useOS();
  return (
    <>
      <AnimatePresence>
        {os.overlay === "spotlight" && <Spotlight key="spotlight" />}
        {os.overlay === "control" && <ControlCenter key="control" />}
        {os.overlay === "mission" && <MissionControl key="mission" />}
        {os.quickLook && <QuickLook key="quicklook" item={os.quickLook} />}
      </AnimatePresence>
      <SnapGhost />
      <Toasts />
    </>
  );
}
