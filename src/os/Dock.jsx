import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { resolve, root } from "../fs.js";
import { AppIcon } from "../icons/index.jsx";
import { useIsPhone, useOS } from "./store.jsx";

const BASE = 52;
const PEAK = 88;
const RANGE = 150;

const ABOUT = [root.name, "About Me.md"];
const PHONE_DOCK = ["finder", "launchpad", "mail", "assistant", "photos"];

function DockItem({ id, label, mouseX, onOpen, running, phone }) {
  const ref = useRef(null);
  const [bounce, setBounce] = useState(0);
  const [hover, setHover] = useState(false);
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const target = useTransform(distance, [-RANGE, 0, RANGE], [BASE, PEAK, BASE]);
  const size = useSpring(target, { stiffness: 320, damping: 24, mass: 0.2 });
  const Icon = AppIcon[id];

  return (
    <motion.button
      ref={ref}
      type="button"
      data-dock={id}
      aria-label={label}
      onClick={() => {
        setBounce((b) => b + 1);
        onOpen();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex flex-none items-end justify-center"
      style={phone ? { width: 38, height: 38 } : { width: size, height: size }}
    >
      {hover && !phone && <span className="os-tip absolute -top-9 whitespace-nowrap rounded-md px-2.5 py-1 text-[12px]">{label}</span>}
      <motion.span key={bounce} className="block h-full w-full" animate={bounce ? { y: [0, -18, 0, -8, 0] } : undefined} transition={{ duration: 0.6 }}>
        <Icon size="100%" />
      </motion.span>
      {running && <span className="absolute -bottom-[7px] h-1 w-1 rounded-full bg-[var(--text)]" />}
    </motion.button>
  );
}

export default function Dock() {
  const os = useOS();
  const phone = useIsPhone();
  const mouseX = useMotionValue(Infinity);
  const runs = (...apps) => os.windows.some((w) => apps.includes(w.app));

  const reveal = (app, open) => {
    const win = os.windows.filter((w) => w.app === app).sort((a, b) => b.z - a.z)[0];
    if (win) os.focusWindow(win.id);
    else open();
  };

  const items = [
    ["finder", "Finder", () => reveal("finder", () => os.openHome()), runs("finder")],
    ["launchpad", "Launchpad", () => os.setOverlay(os.overlay === "launchpad" ? null : "launchpad"), false],
    ["browser", "Browser", () => reveal("browser", () => os.openApp("browser")), runs("browser")],
    ["mail", "Mail", () => os.openApp("mail"), runs("mail")],
    ["photos", "Photos", () => os.openApp("photos"), runs("photos")],
    ["calendar", "Calendar", () => os.openApp("calendar"), runs("calendar")],
    ["activity", "Activity Monitor", () => os.openApp("activity"), runs("activity")],
    ["assistant", "Assistant", () => os.openApp("assistant"), runs("assistant")],
    ["terminal", "Terminal", () => os.openApp("terminal"), runs("terminal")],
    ["textedit", "About Me", () => os.openNode(resolve(ABOUT), ABOUT), runs("textedit")],
    ["settings", "Settings", () => os.openApp("settings"), runs("settings")],
  ].filter(([id]) => !phone || PHONE_DOCK.includes(id));

  const minimized = os.windows.filter((w) => w.minimized);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-1.5 z-[7000] flex justify-center">
      <nav
        aria-label="Dock"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="os-dock scroller pointer-events-auto flex max-w-[96vw] items-end gap-1.5 overflow-x-auto px-2 pb-2 pt-2 md:gap-2 md:overflow-visible md:px-2.5"
      >
        {items.map(([id, label, onOpen, running]) => (
          <DockItem key={id} id={id} label={label} mouseX={mouseX} onOpen={onOpen} running={running} phone={phone} />
        ))}
        <span className="mx-0.5 h-11 w-px flex-none self-center bg-[var(--dock-line)]" />
        {minimized.map((w) => (
          <button
            key={w.id}
            type="button"
            aria-label={`Restore ${w.title}`}
            title={w.title}
            onClick={() => os.focusWindow(w.id)}
            className="os-window is-focused flex h-[52px] w-[60px] flex-none flex-col items-center justify-center overflow-hidden rounded-md px-1 text-[8px] font-medium"
          >
            <span className="w-full truncate text-center">{w.title}</span>
          </button>
        ))}
        {!phone && <DockItem id="stack" label="Projects" mouseX={mouseX} onOpen={() => os.setOverlay(os.overlay === "stack" ? null : "stack")} phone={phone} />}
        <DockItem id="trash" label="Trash" mouseX={mouseX} onOpen={() => os.openApp("finder", { path: [root.name], trash: true }, { title: "Trash" })} phone={phone} />
      </nav>
    </div>
  );
}
