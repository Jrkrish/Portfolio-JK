import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { person, root } from "./fs.js";
import Desktop from "./os/Desktop.jsx";
import Dock from "./os/Dock.jsx";
import MenuBar from "./os/MenuBar.jsx";
import Window from "./os/Window.jsx";
import { Overlays } from "./os/Overlays.jsx";
import { LockScreen, ShellPanels } from "./os/Panels.jsx";
import { OSProvider, useOS } from "./os/store.jsx";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

function Shell() {
  const os = useOS();
  const [locked, setLocked] = useState(true);
  const started = useRef(false);

  const unlock = useCallback(() => setLocked(false), []);

  useEffect(() => {
    if (locked || started.current) return;
    started.current = true;
    // Phones start on the desktop, with no window or notification in the way.
    if (window.innerWidth < 768) return undefined;
    os.openHome();
    const id = setTimeout(() => {
      os.notify({
        title: person.name,
        body: "Open to new opportunities and collaborations. Click to get in touch.",
        run: () => os.openApp("mail"),
        ms: 9000,
      });
    }, 1400);
    return () => clearTimeout(id);
    // Runs once, after the boot screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        os.setOverlay(os.overlay === "spotlight" ? null : "spotlight");
      } else if (e.key === "F3") {
        e.preventDefault();
        os.setOverlay(os.overlay === "mission" ? null : "mission");
      } else if (e.key === "F4") {
        e.preventDefault();
        os.setOverlay(os.overlay === "launchpad" ? null : "launchpad");
      } else if (e.key === "Escape") {
        os.setOverlay(null);
        os.setQuickLook(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [os]);

  const restart = () => {
    os.resetWindows();
    started.current = false;
    setLocked(true);
  };

  return (
    <div className="fixed inset-0 select-none overflow-hidden">
      <img src={asset(os.dark ? "wallpaper-dark.jpg" : "wallpaper-light.jpg")} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <MenuBar onRestart={restart} onLock={() => setLocked(true)} />
      <Desktop />
      <AnimatePresence>
        {os.windows.map((win) => (
          <Window key={win.id} win={win} />
        ))}
      </AnimatePresence>
      <Dock />
      <Overlays />
      <ShellPanels />
      <div className="pointer-events-none fixed inset-0 z-[9400] bg-black" style={{ opacity: (100 - os.brightness) / 100 }} />
      <AnimatePresence>{locked && <LockScreen key="lock" onEnter={unlock} />}</AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
