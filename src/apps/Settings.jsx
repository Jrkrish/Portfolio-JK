import { useOS } from "../os/store.jsx";
import { person } from "../fs.js";
import { Avatar } from "../icons/index.jsx";

const THEMES = [
  ["light", "Light", "linear-gradient(135deg, #fff, #dfe5ee)"],
  ["dark", "Dark", "linear-gradient(135deg, #3b3d46, #15161a)"],
  ["auto", "Auto", "linear-gradient(135deg, #fff 50%, #15161a 50%)"],
];

export default function Settings() {
  const os = useOS();
  return (
    <div className="scroller flex-1 overflow-y-auto bg-[var(--paper)] px-6 py-5">
      <section className="flex items-center gap-3 rounded-xl bg-[var(--hover)] p-3">
        <Avatar size={48} />
        <div>
          <p className="text-[14px] font-semibold">{person.name}</p>
          <p className="text-[12px] text-[var(--text-2)]">{person.role}</p>
        </div>
      </section>

      <h3 className="mb-2 mt-5 text-[13px] font-semibold">Appearance</h3>
      <div className="rounded-xl bg-[var(--hover)] p-4">
        <div className="flex gap-5" role="radiogroup" aria-label="Appearance">
          {THEMES.map(([id, label, swatch]) => (
            <button key={id} type="button" role="radio" aria-checked={os.theme === id} onClick={() => os.setTheme(id)} className="flex flex-col items-center gap-1.5 text-[12px]">
              <span className="h-14 w-20 rounded-md shadow" style={{ background: swatch, outline: os.theme === id ? "2px solid var(--accent)" : "none", outlineOffset: 2 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-[13px] font-semibold">Accent Colour</h3>
      <div className="flex gap-3 rounded-xl bg-[var(--hover)] p-4" role="radiogroup" aria-label="Accent colour">
        {Object.entries(os.accents).map(([id, color]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={os.accent === id}
            aria-label={id}
            onClick={() => os.setAccent(id)}
            className="h-6 w-6 rounded-full"
            style={{ background: color, outline: os.accent === id ? `2px solid ${color}` : "none", outlineOffset: 2 }}
          />
        ))}
      </div>

      <h3 className="mb-2 mt-5 text-[13px] font-semibold">Display</h3>
      <label className="flex items-center gap-3 rounded-xl bg-[var(--hover)] p-4 text-[13px]">
        Brightness
        <input type="range" min="45" max="100" value={os.brightness} onChange={(e) => os.setBrightness(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
      </label>
    </div>
  );
}
