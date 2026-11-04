import { createContext, useContext } from "react";

export const WindowContext = createContext(null);
export const useWindow = () => useContext(WindowContext);

export function TrafficLights() {
  const { win, os } = useWindow();
  const active = os.focused === win.id;
  const buttons = [
    ["Close", "#ff5f57", "#a0342f", () => os.closeWindow(win.id), "M3 3l4 4M7 3l-4 4"],
    ["Minimize", "#febc2e", "#9a6b10", () => os.minimizeWindow(win.id), "M2.5 5h5"],
    ["Zoom", "#28c840", "#0f7a22", () => os.zoomWindow(win.id), "M3 7l4-4M3.5 3H7v3.5"],
  ];
  return (
    <div className="group flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
      {buttons.map(([label, color, ink, onClick, d]) => (
        <button
          key={label}
          type="button"
          aria-label={`${label} window`}
          onClick={onClick}
          className="flex h-3 w-3 items-center justify-center rounded-full"
          style={{ background: active ? color : "var(--light-off)", boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.15)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-0 group-hover:opacity-100" aria-hidden="true">
            <path d={d} stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}
