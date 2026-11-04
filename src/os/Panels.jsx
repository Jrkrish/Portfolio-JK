import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MonthGrid } from "../apps/Calendar.jsx";
import { allProjects, pathOfProject, person } from "../fs.js";
import { AppIcon, Avatar, Glyph } from "../icons/index.jsx";
import { useOS } from "./store.jsx";

const LAUNCH_APPS = [
  ["finder", "Finder"],
  ["browser", "Browser"],
  ["mail", "Mail"],
  ["photos", "Photos"],
  ["calendar", "Calendar"],
  ["terminal", "Terminal"],
  ["activity", "Activity Monitor"],
  ["assistant", "Assistant"],
  ["settings", "Settings"],
];

function NotificationCenter() {
  const os = useOS();
  return (
    <div className="fixed inset-0 z-[7900]" onPointerDown={() => os.setOverlay(null)}>
      <motion.aside
        initial={{ x: 380 }}
        animate={{ x: 0 }}
        exit={{ x: 380 }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        aria-label="Notification Center"
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-2 top-[34px] flex w-[330px] max-w-[94vw] flex-col gap-2.5"
      >
        <section className="os-menu rounded-[20px] p-3.5">
          <MonthGrid compact />
        </section>
        <button type="button" onClick={() => os.openApp("mail")} className="os-menu rounded-[20px] p-3.5 text-left">
          <p className="text-[13px] font-semibold">{person.name}</p>
          <p className="text-[12.5px] text-[var(--text-2)]">Open to new opportunities and collaborations. Click to get in touch.</p>
        </button>
      </motion.aside>
    </div>
  );
}

function Launchpad() {
  const os = useOS();
  const [query, setQuery] = useState("");
  const apps = LAUNCH_APPS.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()));

  const launch = (id) => {
    os.setOverlay(null);
    if (id === "finder") os.openHome();
    else os.openApp(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label="Launchpad"
      onPointerDown={() => os.setOverlay(null)}
      className="fixed inset-0 z-[7600] flex flex-col items-center bg-black/35 px-6 pb-28 pt-14 backdrop-blur-2xl"
    >
      <label onPointerDown={(e) => e.stopPropagation()} className="flex h-8 w-[240px] flex-none items-center gap-2 rounded-lg bg-white/15 px-2.5 text-white">
        <Glyph.search size={13} />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search apps" className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/60" />
      </label>
      <ul className="mt-12 grid max-w-3xl grid-cols-3 gap-x-8 gap-y-8 sm:grid-cols-4">
        {apps.map(([id, name], i) => {
          const Icon = AppIcon[id];
          return (
            <motion.li key={id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
              <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => launch(id)} className="flex w-[104px] flex-col items-center gap-1.5 text-white">
                <Icon size={84} />
                <span className="text-[12.5px] font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>
                  {name}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export function LockScreen({ onEnter }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 10000);
    const auto = setTimeout(onEnter, 5000);
    window.addEventListener("keydown", onEnter);
    return () => {
      clearInterval(clock);
      clearTimeout(auto);
      window.removeEventListener("keydown", onEnter);
    };
  }, [onEnter]);

  return (
    <motion.button
      type="button"
      onClick={onEnter}
      exit={{ opacity: 0, y: -60, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Enter ${person.name}'s portfolio`}
      className="fixed inset-0 z-[9300] flex flex-col items-center text-white backdrop-blur-2xl"
      style={{ background: "rgba(10,10,30,.28)", cursor: "pointer" }}
    >
      <span className="mt-[9vh] text-[19px] font-medium opacity-90">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
      <span className="text-[clamp(72px,12vw,112px)] font-bold leading-none tracking-tight" style={{ fontFeatureSettings: '"tnum"' }}>
        {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </span>
      <span className="mt-auto flex flex-col items-center pb-[10vh]">
        <Avatar size={84} className="ring-2 ring-white/40" />
        <span className="mt-2.5 text-[15px] font-semibold">{person.name}</span>
        <span className="mt-1 text-[12.5px] opacity-75">{person.role}</span>
        <span className="mt-3 rounded-full bg-white/15 px-4 py-1 text-[12.5px]">Click or press any key to enter</span>
      </span>
    </motion.button>
  );
}

// The Dock's Projects stack: covers fan out in an arc above the icon.
function ProjectStack() {
  const os = useOS();
  const anchor = document.querySelector('[data-dock="stack"]')?.getBoundingClientRect();
  if (!anchor) return null;
  const count = allProjects.length;
  const room = Math.min(58, (anchor.top - 40) / count);

  return (
    <div className="fixed inset-0 z-[6950]" onPointerDown={() => os.setOverlay(null)} role="dialog" aria-label="Projects stack">
      {allProjects.map((project, i) => {
        const t = (i + 1) / count;
        const shot = project.children.find((c) => c.kind === "image");
        return (
          <motion.button
            key={project.name}
            type="button"
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.5 }}
            animate={{ opacity: 1, x: -150 * t * t, y: -room * (i + 1), rotate: -9 * t, scale: 1 }}
            exit={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.5, transition: { duration: 0.16 } }}
            transition={{ type: "spring", stiffness: 340, damping: 26, delay: i * 0.018 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              os.setOverlay(null);
              os.openNode(project, pathOfProject(project.name));
            }}
            className="group fixed flex items-center gap-2.5 whitespace-nowrap"
            style={{ right: window.innerWidth - anchor.right + 4, top: anchor.top - 12, transformOrigin: "right center" }}
          >
            <span className="rounded-md bg-black/60 px-2 py-0.5 text-[12.5px] font-medium text-white backdrop-blur group-hover:bg-[var(--accent)]">{project.name}</span>
            <img src={`${import.meta.env.BASE_URL}${shot.src}`} alt="" className="h-[48px] w-[64px] rounded-md object-cover shadow-lg ring-1 ring-white/30 transition-transform group-hover:scale-110" />
          </motion.button>
        );
      })}
    </div>
  );
}

export function ShellPanels() {
  const os = useOS();
  return (
    <AnimatePresence>
      {os.overlay === "notifications" && <NotificationCenter key="notifications" />}
      {os.overlay === "launchpad" && <Launchpad key="launchpad" />}
      {os.overlay === "stack" && <ProjectStack key="stack" />}
    </AnimatePresence>
  );
}
