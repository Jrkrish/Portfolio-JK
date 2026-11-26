import { useEffect, useRef, useState } from "react";
import { person, resolve, root } from "../fs.js";
import { Avatar, Glyph, NodeIcon } from "../icons/index.jsx";
import { MENU_H, useIsPhone, useOS } from "./store.jsx";

const ITEMS = ["Projects", "Experience", "Skills", "Education", "Contact", "About Me.md", "Jayakrishnan.jpg", "Resume.pdf"].map((name) => ({
  name,
  path: [root.name, name],
  node: resolve([root.name, name]),
}));

const CELL_W = 100;
const CELL_H = 94;
const STORE = "os-icon-positions";

const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE)) ?? {};
  } catch {
    return {};
  }
};
const writeSaved = (value) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(value));
  } catch {
    // Without storage, icons just return to the grid on the next visit.
  }
};

// Icons fill columns from the top right, as on a Mac.
function defaultSpot(index) {
  const rows = Math.max(1, Math.floor((window.innerHeight - MENU_H - 110) / CELL_H));
  return { x: window.innerWidth - CELL_W - 8 - Math.floor(index / rows) * CELL_W, y: 10 + (index % rows) * CELL_H };
}

function ContextMenu({ at, close, cleanUp }) {
  const os = useOS();
  const items = [
    ["New Finder Window", () => os.openHome()],
    ["Search Portfolio", () => os.setOverlay("spotlight")],
    ["-"],
    ["Clean Up", cleanUp],
    ["Open Terminal", () => os.openApp("terminal")],
    ["Mission Control", () => os.setOverlay("mission")],
    ["Change Appearance", () => os.openApp("settings")],
    ["-"],
    ["About This Portfolio", () => os.openApp("about")],
  ];
  return (
    <div role="menu" className="os-menu fixed z-[7500] min-w-[210px] rounded-lg p-1 text-[13px]" style={{ left: Math.min(at.x, window.innerWidth - 220), top: Math.min(at.y, window.innerHeight - 250) }}>
      {items.map(([label, run], i) =>
        label === "-" ? (
          <div key={i} className="mx-2 my-1 h-px bg-[var(--line)]" />
        ) : (
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
        ),
      )}
    </div>
  );
}

function ProfileWidget() {
  const os = useOS();
  const [now] = useState(() => new Date());
  return (
    <aside className="os-widget rounded-[20px] p-4" aria-label="Profile">
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      <div className="mt-2 flex items-center gap-3">
        <Avatar size={68} className="ring-2 ring-white/40" />
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight">{person.name}</h1>
          <p className="text-[13px] opacity-90">{person.role}</p>
          <p className="text-[12.5px] opacity-70">{person.location}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12.5px]">
        <span className="h-2 w-2 rounded-full bg-[#34d058]" />
        Open to new opportunities
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => os.openApp("mail")} className="rounded-md bg-white/20 px-3 py-1 text-[12.5px] font-medium hover:bg-white/30">
          Get in touch
        </button>
        <button type="button" onClick={() => os.openApp("resume")} className="rounded-md bg-white/20 px-3 py-1 text-[12.5px] font-medium hover:bg-white/30">
          Resume
        </button>
      </div>
    </aside>
  );
}

// The QR code is drawn 37 modules square (tools/make_qr.mjs). Three pixels a
// module keeps every module whole and is large enough for a phone to read.
const QR_PX = 37 * 3;

function CoffeeWidget() {
  const site = person.coffee.replace(/^https:\/\//, "");
  return (
    <aside className="os-widget flex items-center gap-3 rounded-[20px] p-3" aria-label="Buy me a coffee">
      <a href={person.coffee} target="_blank" rel="noreferrer" className="flex-none" title={site}>
        <img
          src={`${import.meta.env.BASE_URL}coffee-qr.svg`}
          alt={`QR code for ${site}`}
          width={QR_PX}
          height={QR_PX}
          className="block rounded-[10px]"
          style={{ width: QR_PX, height: QR_PX, imageRendering: "pixelated" }}
        />
      </a>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[14.5px] font-semibold leading-tight">
          <Glyph.coffee size={15} />
          Buy me a coffee
        </p>
        <p className="mt-1.5 text-[12px] leading-snug opacity-80">If something here helped you, scan the code or follow the link.</p>
        <a href={person.coffee} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-[11.5px] font-semibold underline decoration-white/50 underline-offset-[3px] hover:decoration-white">
          {site}
        </a>
      </div>
    </aside>
  );
}

function DesktopIcon({ item, index, spot, on, select, phone, onMoved }) {
  const os = useOS();
  const [drag, setDrag] = useState(null);
  const moved = useRef(false);

  const down = (e) => {
    e.stopPropagation();
    if (phone || e.button !== 0) return;
    moved.current = false;
    const start = { px: e.clientX, py: e.clientY, x: spot.x, y: spot.y };
    const move = (ev) => {
      const dx = ev.clientX - start.px;
      const dy = ev.clientY - start.py;
      if (!moved.current && Math.hypot(dx, dy) < 5) return;
      moved.current = true;
      setDrag({ x: start.x + dx, y: start.y + dy });
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDrag(null);
      if (moved.current) {
        // Drop onto the nearest grid cell, kept on screen.
        const x = Math.round((start.x + ev.clientX - start.px) / CELL_W) * CELL_W;
        const y = Math.round((start.y + ev.clientY - start.py) / CELL_H) * CELL_H + 10;
        onMoved(item.name, {
          x: Math.max(0, Math.min(window.innerWidth - CELL_W, x)),
          y: Math.max(0, Math.min(window.innerHeight - MENU_H - 190, y)),
        });
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const place = drag ?? spot;
  return (
    <li className={phone ? "" : "absolute transition-[left,top] duration-200 ease-out"} style={phone ? undefined : { left: place.x, top: place.y, zIndex: drag ? 8 : 1, transitionProperty: drag ? "none" : undefined }} data-index={index}>
      <button
        type="button"
        data-desktop-icon={item.name}
        onPointerDown={down}
        onClick={() => {
          if (moved.current) return;
          if (phone) os.openNode(item.node, item.path);
          else select(item.name);
        }}
        onDoubleClick={() => os.openNode(item.node, item.path)}
        className="flex w-[92px] flex-col items-center gap-0.5"
      >
        <span className={`rounded-md p-1 ${on ? "bg-black/25" : ""}`}>
          <NodeIcon node={item.node} size={58} />
        </span>
        <span className={`rounded px-1.5 text-center text-[12px] font-medium leading-tight text-white ${on ? "bg-[var(--accent)]" : ""}`} style={{ textShadow: on ? "none" : "0 1px 3px rgba(0,0,0,.65)" }}>
          {item.name}
        </span>
      </button>
    </li>
  );
}

export default function Desktop() {
  const phone = useIsPhone();
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(null);
  const [band, setBand] = useState(null);
  const [saved, setSaved] = useState(readSaved);
  const surface = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;
    const away = () => setMenu(null);
    window.addEventListener("pointerdown", away, { once: true });
    return () => window.removeEventListener("pointerdown", away);
  }, [menu]);

  const onMoved = (name, spot) => {
    setSaved((s) => {
      const next = { ...s, [name]: spot };
      writeSaved(next);
      return next;
    });
  };

  const cleanUp = () => {
    setSaved({});
    writeSaved({});
  };

  // Dragging on empty desktop draws a selection rectangle.
  const startBand = (e) => {
    setSelected(null);
    if (e.target !== surface.current || e.button !== 0 || phone) return;
    const origin = { x: e.clientX, y: e.clientY };
    const move = (ev) => setBand({ x: Math.min(origin.x, ev.clientX), y: Math.min(origin.y, ev.clientY), w: Math.abs(ev.clientX - origin.x), h: Math.abs(ev.clientY - origin.y) });
    const up = () => {
      setBand(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={surface}
      onPointerDown={startBand}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
      className="absolute inset-0"
      style={{ top: MENU_H }}
    >
      <div className="absolute left-5 top-[18px] hidden w-[300px] flex-col gap-3 lg:flex">
        <ProfileWidget />
        <CoffeeWidget />
      </div>

      <ul className={phone ? "grid grid-cols-3 justify-items-center gap-3 p-4" : "contents"}>
        {ITEMS.map((item, i) => (
          <DesktopIcon key={item.name} item={item} index={i} spot={saved[item.name] ?? defaultSpot(i)} on={selected === item.name} select={setSelected} phone={phone} onMoved={onMoved} />
        ))}
      </ul>

      {band && <div className="pointer-events-none fixed z-[5] rounded-[2px] border border-white/60 bg-white/15" style={{ left: band.x, top: band.y, width: band.w, height: band.h }} />}
      {menu && <ContextMenu at={menu} close={() => setMenu(null)} cleanUp={cleanUp} />}
    </div>
  );
}
