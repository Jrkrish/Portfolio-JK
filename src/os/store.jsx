import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { APP_INFO } from "./apps.js";
import { root } from "../fs.js";

export const MENU_H = 28;
export const DOCK_H = 78;

const OSContext = createContext(null);
export const useOS = () => useContext(OSContext);

const load = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows can refuse storage; the setting just won't persist.
  }
};

export function useIsPhone() {
  const query = "(max-width: 767px)";
  const [phone, setPhone] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

function nextPlacement(state, info) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(info.w, vw - 40);
  const h = Math.min(info.h, vh - MENU_H - DOCK_H - 24);
  const step = (state.opened % 6) * 28;
  // On wide screens, keep clear of the profile widget at the left of the desktop.
  const left = vw >= 1024 ? Math.max(336, Math.round((vw - w) / 2)) : Math.round((vw - w) / 2);
  return {
    w,
    h,
    x: Math.max(12, Math.min(left + step, vw - w - 110)),
    y: Math.max(MENU_H + 10, Math.round(MENU_H + 24 + step)),
  };
}

function reducer(state, action) {
  const topZ = state.z + 1;
  const patch = (id, change) => state.windows.map((w) => (w.id === id ? { ...w, ...change } : w));

  switch (action.type) {
    case "open": {
      const info = APP_INFO[action.app];
      const key = action.key ?? (info.single ? action.app : null);
      const existing = key && state.windows.find((w) => w.key === key);
      if (existing) {
        return {
          ...state,
          z: topZ,
          focused: existing.id,
          windows: patch(existing.id, { z: topZ, minimized: false, props: { ...existing.props, ...action.props } }),
        };
      }
      const id = state.nextId;
      const win = { id, key, app: action.app, title: action.title ?? info.title, props: action.props ?? {}, z: topZ, minimized: false, maximized: false, ...nextPlacement(state, info) };
      return { ...state, z: topZ, nextId: id + 1, opened: state.opened + 1, focused: id, windows: [...state.windows, win] };
    }
    case "close": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      const next = windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
      return { ...state, windows, focused: state.focused === action.id ? (next?.id ?? null) : state.focused };
    }
    case "focus":
      if (state.focused === action.id) return state;
      return { ...state, z: topZ, focused: action.id, windows: patch(action.id, { z: topZ, minimized: false }) };
    case "minimize": {
      const windows = patch(action.id, { minimized: true });
      const next = windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
      return { ...state, windows, focused: next?.id ?? null };
    }
    case "toggleZoom": {
      const win = state.windows.find((w) => w.id === action.id);
      return { ...state, windows: patch(action.id, { maximized: !win.maximized }) };
    }
    case "rect":
      return { ...state, windows: patch(action.id, action.rect) };
    case "title":
      return { ...state, windows: patch(action.id, { title: action.title }) };
    case "reset":
      return { ...state, windows: [], focused: null };
    default:
      return state;
  }
}

// Where each open window sits in Mission Control, as a box on screen.
function missionSlots(windows) {
  const open = windows.filter((w) => !w.minimized).sort((a, b) => a.id - b.id);
  const cols = Math.ceil(Math.sqrt(open.length));
  const rows = Math.ceil(open.length / cols) || 1;
  const areaW = window.innerWidth - 80;
  const areaH = window.innerHeight - MENU_H - DOCK_H - 70;
  const cellW = areaW / cols;
  const cellH = areaH / rows;
  const slots = {};
  open.forEach((w, i) => {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? open.length - row * cols : cols;
    const col = i - row * cols;
    const offset = (areaW - inRow * cellW) / 2;
    slots[w.id] = {
      cx: 40 + offset + cellW * (col + 0.5),
      cy: MENU_H + 34 + cellH * (row + 0.5),
      cellW: cellW * 0.86,
      cellH: cellH * 0.8,
      title: w.title,
    };
  });
  return slots;
}

const ACCENTS = { blue: "#0a7cff", purple: "#8e5cf0", pink: "#e8488f", orange: "#f2820f", green: "#34a853", graphite: "#7d7d82" };

export function OSProvider({ children }) {
  const [wm, dispatch] = useReducer(reducer, { windows: [], focused: null, z: 10, nextId: 1, opened: 0 });
  const [theme, setThemeState] = useState(() => load("os-theme", "auto"));
  const [accent, setAccentState] = useState(() => load("os-accent", "blue"));
  const [brightness, setBrightness] = useState(100);
  const [overlay, setOverlay] = useState(null); // spotlight | control | mission
  const [quickLook, setQuickLook] = useState(null);
  const [snap, setSnap] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [system, setSystem] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSystem(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const dark = theme === "dark" || (theme === "auto" && system);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.setProperty("--accent", ACCENTS[accent]);
  }, [dark, accent]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    save("os-theme", t);
  }, []);
  const setAccent = useCallback((a) => {
    setAccentState(a);
    save("os-accent", a);
  }, []);

  const notify = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.ms ?? 7000);
  }, []);

  const value = useMemo(() => {
    const openApp = (app, props, opts = {}) => dispatch({ type: "open", app, props, ...opts });

    const openNode = (node, path) => {
      if (node.kind === "folder") return openApp("finder", { path }, { title: node.name });
      if (node.kind === "markdown") return openApp("textedit", { node }, { title: node.name, key: path.join("/") });
      if (node.kind === "image") return openApp("preview", { node }, { title: node.name, key: path.join("/") });
      if (node.kind === "link") return openApp("browser", { url: node.url });
      if (node.kind === "app") return openApp(node.app);
      if (node.kind === "resume") return openApp("resume");
      return undefined;
    };

    return {
      ...wm,
      dark, theme, setTheme, accent, setAccent, accents: ACCENTS,
      brightness, setBrightness,
      overlay, setOverlay,
      quickLook, setQuickLook,
      snap, setSnap,
      toasts, notify,
      openApp, openNode,
      openHome: () => openApp("finder", { path: [root.name] }, { title: "Home" }),
      slots: overlay === "mission" ? missionSlots(wm.windows) : null,
      closeWindow: (id) => dispatch({ type: "close", id }),
      focusWindow: (id) => dispatch({ type: "focus", id }),
      minimizeWindow: (id) => dispatch({ type: "minimize", id }),
      zoomWindow: (id) => dispatch({ type: "toggleZoom", id }),
      setRect: (id, rect) => dispatch({ type: "rect", id, rect }),
      setTitle: (id, title) => dispatch({ type: "title", id, title }),
      resetWindows: () => dispatch({ type: "reset" }),
    };
  }, [wm, dark, theme, setTheme, accent, setAccent, brightness, overlay, quickLook, snap, toasts, notify]);

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}
