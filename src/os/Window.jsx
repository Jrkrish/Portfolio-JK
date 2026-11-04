import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { APP_INFO } from "./apps.js";
import { DOCK_H, MENU_H, useIsPhone, useOS } from "./store.jsx";
import { APP_COMPONENTS } from "./registry.js";
import { TrafficLights, WindowContext } from "./chrome.jsx";

// Dragging a window to a screen edge tiles it, as with Option-drag on a Mac.
function snapZone(x, y) {
  if (y <= MENU_H + 3) return "full";
  if (x <= 4) return "left";
  if (x >= window.innerWidth - 5) return "right";
  return null;
}

function snapRect(zone) {
  const w = window.innerWidth;
  const h = window.innerHeight - MENU_H - DOCK_H;
  const half = Math.round(w / 2);
  return { x: zone === "right" ? half : 0, y: MENU_H, w: zone === "full" ? w : half, h };
}

const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const EASE_IN = [0.5, 0, 0.9, 0.6];

const MIN_W = 340;
const MIN_H = 220;
const EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const edgeClass = {
  n: "left-2 right-2 -top-1 h-2 cursor-ns-resize",
  s: "left-2 right-2 -bottom-1 h-2 cursor-ns-resize",
  e: "top-2 bottom-2 -right-1 w-2 cursor-ew-resize",
  w: "top-2 bottom-2 -left-1 w-2 cursor-ew-resize",
  ne: "-top-1 -right-1 h-3 w-3 cursor-nesw-resize",
  nw: "-top-1 -left-1 h-3 w-3 cursor-nwse-resize",
  se: "-bottom-1 -right-1 h-3 w-3 cursor-nwse-resize",
  sw: "-bottom-1 -left-1 h-3 w-3 cursor-nesw-resize",
};

// Anything that should drag the window spreads these props.
function useDrag(win, os, phone, setBusy) {
  const drag = useRef(null);
  return {
    onPointerDown: (e) => {
      if (phone || win.maximized || e.button !== 0) return;
      if (e.target.closest("button, input, a, select")) return;
      drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      setBusy(true);
    },
    onPointerMove: (e) => {
      if (!drag.current) return;
      const d = drag.current;
      d.zone = snapZone(e.clientX, e.clientY);
      os.setSnap(d.zone ? snapRect(d.zone) : null);
      os.setRect(win.id, {
        x: Math.round(Math.min(window.innerWidth - 80, Math.max(80 - win.w, d.x + e.clientX - d.px))),
        y: Math.round(Math.min(window.innerHeight - 60, Math.max(MENU_H, d.y + e.clientY - d.py))),
      });
    },
    onPointerUp: () => {
      const zone = drag.current?.zone;
      drag.current = null;
      setBusy(false);
      os.setSnap(null);
      if (zone) os.setRect(win.id, snapRect(zone));
    },
    onDoubleClick: (e) => {
      if (!e.target.closest("button, input, a, select")) os.zoomWindow(win.id);
    },
  };
}

function resizeHandler(win, os, edge, setBusy) {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    setBusy(true);
    const move = (ev) => {
      const dx = ev.clientX - start.px;
      const dy = ev.clientY - start.py;
      const next = { x: start.x, y: start.y, w: start.w, h: start.h };
      if (edge.includes("e")) next.w = Math.max(MIN_W, start.w + dx);
      if (edge.includes("s")) next.h = Math.max(MIN_H, start.h + dy);
      if (edge.includes("w")) {
        next.w = Math.max(MIN_W, start.w - dx);
        next.x = start.x + start.w - next.w;
      }
      if (edge.includes("n")) {
        next.h = Math.max(MIN_H, start.h - dy);
        next.y = Math.max(MENU_H, start.y + start.h - next.h);
      }
      os.setRect(win.id, next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setBusy(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
}

export default function Window({ win }) {
  const os = useOS();
  const phone = useIsPhone();
  const info = APP_INFO[win.app];
  const App = APP_COMPONENTS[win.app];
  const focused = os.focused === win.id;
  // While dragging or resizing, the window follows the pointer with no spring.
  const [busy, setBusy] = useState(false);
  const dragProps = useDrag(win, os, phone, setBusy);
  const slot = os.slots?.[win.id] ?? null;
  const full = phone || win.maximized;
  const rect = full
    ? { x: 0, y: MENU_H, width: window.innerWidth, height: window.innerHeight - MENU_H - (phone ? 70 : DOCK_H) }
    : { x: win.x, y: win.y, width: win.w, height: win.h };

  // Where the genie lands: the app's Dock icon, or Finder's if it has none.
  let dock = { x: 0, y: 0 };
  if (win.minimized) {
    const el = document.querySelector(`[data-dock="${win.app}"]`) ?? document.querySelector('[data-dock="finder"]');
    const r = el?.getBoundingClientRect();
    if (r) dock = { x: r.left + r.width / 2 - rect.width / 2, y: r.top - rect.height / 2 };
  }

  const fit = slot ? Math.min(slot.cellW / rect.width, slot.cellH / rect.height, 0.8) : 1;

  return (
    <motion.section
      data-window
      aria-label={win.title}
      role="dialog"
      onPointerDownCapture={(e) => {
        os.focusWindow(win.id);
        if (slot) {
          e.stopPropagation();
          os.setOverlay(null);
        }
      }}
      className={`os-window absolute left-0 top-0 ${phone ? "" : "rounded-[11px]"} ${focused ? "is-focused" : ""}`}
      style={{ zIndex: win.z, visibility: "visible" }}
      initial={{ opacity: 0, clipPath: FULL_CLIP, scaleX: 0.94, scaleY: 0.94, x: rect.x, y: rect.y + 10, width: rect.width, height: rect.height }}
      animate={
        win.minimized
          ? {
              opacity: [1, 1, 0],
              scaleX: [1, 0.46, 0.09],
              scaleY: [1, 0.72, 0.04],
              x: [rect.x, (rect.x + dock.x) / 2, dock.x],
              y: [rect.y, rect.y + (dock.y - rect.y) * 0.62, dock.y + rect.height * 0.46],
              clipPath: [FULL_CLIP, "polygon(0% 0%, 100% 0%, 68% 100%, 32% 100%)", "polygon(14% 0%, 86% 0%, 54% 100%, 46% 100%)"],
              width: rect.width,
              height: rect.height,
              transitionEnd: { visibility: "hidden" },
            }
          : slot
            ? {
                opacity: 1,
                scaleX: fit,
                scaleY: fit,
                x: slot.cx - rect.width / 2,
                y: slot.cy - rect.height / 2,
                width: rect.width,
                height: rect.height,
                visibility: "visible",
                clipPath: FULL_CLIP,
                transitionEnd: { clipPath: "none" },
              }
            : {
                opacity: 1,
                scaleX: 1,
                scaleY: 1,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                visibility: "visible",
                clipPath: FULL_CLIP,
                transitionEnd: { clipPath: "none" },
              }
      }
      exit={{ opacity: 0, scaleX: 0.94, scaleY: 0.94, transition: { duration: 0.14 } }}
      transition={busy ? { duration: 0 } : win.minimized ? { duration: 0.42, ease: EASE_IN } : { type: "spring", stiffness: 420, damping: 38, mass: 0.7 }}
    >
      <WindowContext.Provider value={{ win, os, dragProps, phone }}>
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[inherit]">
        {info.chrome !== false && (
          <header {...dragProps} className="os-titlebar relative flex h-9 flex-none items-center px-3">
            <TrafficLights />
            <h2 className="pointer-events-none absolute inset-x-20 truncate text-center text-[13px] font-semibold">{win.title}</h2>
          </header>
        )}
        <div className={`flex min-h-0 flex-1 flex-col ${slot ? "pointer-events-none" : ""}`}>
          <App {...win.props} />
        </div>
        </div>
      </WindowContext.Provider>
      {!full && EDGES.map((edge) => <span key={edge} onPointerDown={resizeHandler(win, os, edge, setBusy)} className={`absolute z-50 ${edgeClass[edge]}`} />)}
    </motion.section>
  );
}
