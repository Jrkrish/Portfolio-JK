import { useEffect, useRef, useState } from "react";
import { person, resolve, root } from "../fs.js";
import { BatteryGlyph, Glyph, Logo } from "../icons/index.jsx";
import { APP_INFO } from "./apps.js";
import { MENU_H, useOS } from "./store.jsx";

const SHORTCUTS = `# Using this desktop

This portfolio works like a desktop computer. Everything lives in folders.

## Getting around

- Double-click a folder or document to open it
- Drag a window by its title bar, and resize it from any edge
- Press Space on a selected item in Finder for Quick Look
- Right-click the desktop or any file for more options

## Keyboard

- **Ctrl K** or **Cmd K** opens Spotlight search
- **F3** opens Mission Control, **F4** opens Launchpad
- Drag a window to the left, right or top edge to tile it
- **Esc** closes Spotlight, Quick Look and menus

## Terminal

Open Terminal from the Dock and type **help**.`;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Menu({ label, bold, items, open, setOpen, children }) {
  const isOpen = open === label;
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={children ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpen(isOpen ? null : label)}
        onMouseEnter={() => open && setOpen(label)}
        className={`flex h-[22px] items-center rounded px-2 text-[13px] ${bold ? "font-bold" : "font-medium"} ${isOpen ? "bg-white/25" : ""}`}
      >
        {children ?? label}
      </button>
      {isOpen && (
        <div role="menu" className="os-menu absolute left-0 top-[26px] z-[9000] min-w-[230px] rounded-lg p-1 text-[13px]">
          {items.map((item, i) =>
            item === "-" ? (
              <div key={i} className="mx-2 my-1 h-px bg-[var(--line)]" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(null);
                  item.run?.();
                }}
                className="flex w-full items-center justify-between gap-6 rounded px-2 py-[3px] text-left enabled:hover:bg-[var(--accent)] enabled:hover:text-white disabled:opacity-40"
              >
                <span>{item.label}</span>
                {item.keys && <span className="opacity-60">{item.keys}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function MenuBar({ onRestart, onLock }) {
  const os = useOS();
  const now = useClock();
  const [open, setOpen] = useState(null);
  const bar = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (!bar.current?.contains(e.target)) setOpen(null);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);

  const focused = os.windows.find((w) => w.id === os.focused);
  const appName = focused ? APP_INFO[focused.app].name : "Finder";
  const home = () => os.openApp("finder", { path: [root.name] }, { title: "Home" });
  const go = (name) => ({ label: name, run: () => os.openNode(resolve([root.name, name]), [root.name, name]) });

  const system = [
    { label: "About This Portfolio", run: () => os.openApp("about") },
    "-",
    { label: "Settings", run: () => os.openApp("settings") },
    "-",
    { label: "Lock Screen", run: onLock },
    { label: "Restart", run: onRestart },
  ];
  const menus = {
    File: [
      { label: "New Finder Window", run: home },
      { label: "New Message", run: () => os.openApp("mail") },
      "-",
      { label: "Close Window", disabled: !focused, run: () => os.closeWindow(focused.id) },
    ],
    Edit: [{ label: "Undo", disabled: true }, "-", { label: "Cut", disabled: true }, { label: "Copy", disabled: true }, { label: "Paste", disabled: true }],
    View: [
      { label: "Spotlight", keys: "Ctrl K", run: () => os.setOverlay("spotlight") },
      { label: "Mission Control", keys: "F3", run: () => os.setOverlay("mission") },
      { label: "Launchpad", keys: "F4", run: () => os.setOverlay("launchpad") },
      { label: "Notification Center", run: () => os.setOverlay("notifications") },
    ],
    Go: [{ label: "Home", run: home }, "-", go("Projects"), go("Experience"), go("Skills"), go("Education"), go("Contact")],
    Window: [
      { label: "Minimize", disabled: !focused, run: () => os.minimizeWindow(focused.id) },
      { label: "Zoom", disabled: !focused, run: () => os.zoomWindow(focused.id) },
      ...(os.windows.length ? ["-"] : []),
      ...os.windows.map((w) => ({ label: `${w.title}${w.id === os.focused ? "  •" : ""}`, run: () => os.focusWindow(w.id) })),
    ],
    Help: [
      {
        label: "Using This Desktop",
        run: () => os.openNode({ kind: "markdown", name: "Using This Desktop.md", body: SHORTCUTS }, ["help"]),
      },
      { label: `Contact ${person.name.split(" ")[0]}`, run: () => os.openApp("mail") },
    ],
  };

  const date = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <header ref={bar} className="os-menubar fixed inset-x-0 top-0 z-[8000] flex items-center justify-between px-2 text-white" style={{ height: MENU_H }}>
      <div className="flex items-center">
        <Menu label="Portfolio menu" items={system} open={open} setOpen={setOpen}>
          <Logo size={16} />
        </Menu>
        <Menu label={appName} bold items={[{ label: `About ${appName}`, run: () => os.openApp("about") }, "-", { label: "Settings", run: () => os.openApp("settings") }]} open={open} setOpen={setOpen} />
        <div className="hidden items-center md:flex">
          {Object.entries(menus).map(([label, items]) => (
            <Menu key={label} label={label} items={items} open={open} setOpen={setOpen} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2.5 px-1 text-[13px] font-medium">
        <span className="hidden items-center md:flex" role="img" aria-label="Battery full">
          <BatteryGlyph />
        </span>
        <span className="hidden md:block" role="img" aria-label="Connected">
          <Glyph.wifi size={15} />
        </span>
        <button type="button" aria-label="Open Spotlight" onClick={() => os.setOverlay(os.overlay === "spotlight" ? null : "spotlight")}>
          <Glyph.search size={14} />
        </button>
        <button type="button" aria-label="Open Control Center" onClick={() => os.setOverlay(os.overlay === "control" ? null : "control")}>
          <Glyph.control size={15} />
        </button>
        <button type="button" aria-label="Open Notification Center" onClick={() => os.setOverlay(os.overlay === "notifications" ? null : "notifications")} className="whitespace-nowrap">
          <span className="hidden md:inline">{date} </span>
          {time}
        </button>
      </div>
    </header>
  );
}
