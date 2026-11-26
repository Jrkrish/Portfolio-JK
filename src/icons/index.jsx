// Every icon here is original artwork, drawn in the general style of a modern
// desktop OS. Apple's own icons, logo and fonts are deliberately not used.
import { useId } from "react";

export function FolderIcon({ size = 64, tint }) {
  const id = useId();
  const top = tint ?? "#74c6fb";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={tint ? top : "#3a9df0"} />
        </linearGradient>
      </defs>
      <path d="M6 18a5 5 0 0 1 5-5h13.5a4 4 0 0 1 2.9 1.2l2.2 2.3a4 4 0 0 0 2.9 1.2H53a5 5 0 0 1 5 5v5H6z" fill="#2f8fe0" />
      <path d="M6 23h52a3 3 0 0 1 3 3.4l-2.6 24a5 5 0 0 1-5 4.6H10.6a5 5 0 0 1-5-4.6L3 26.4A3 3 0 0 1 6 23z" fill={`url(#${id}f)`} />
      <path d="M6.5 23.4h51" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
    </svg>
  );
}

export function DocIcon({ size = 64, ext = "MD" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 4h26l14 14v39a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#fff" stroke="#c9ccd3" />
      <path d="M40 4v11a3 3 0 0 0 3 3h11z" fill="#e6e8ee" stroke="#c9ccd3" />
      {[24, 30, 36].map((y) => (
        <path key={y} d={`M19 ${y}h26`} stroke="#b4b9c4" strokeWidth="2" strokeLinecap="round" />
      ))}
      <text x="32" y="53" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6c7280" fontFamily="Inter, sans-serif">
        {ext}
      </text>
    </svg>
  );
}

export function ImageIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="10" width="52" height="44" rx="4" fill="#fff" stroke="#c9ccd3" />
      <rect x="10" y="14" width="44" height="36" rx="2" fill="#bfe3ff" />
      <circle cx="44" cy="24" r="4" fill="#ffd25a" />
      <path d="M10 50l14-18 11 13 7-7 12 12z" fill="#4caf72" />
    </svg>
  );
}

export function LinkIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 4h36a3 3 0 0 1 3 3v50a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#fff" stroke="#c9ccd3" />
      <circle cx="32" cy="30" r="14" fill="#2f8fe0" />
      <path d="M18 30h28M32 16c-9 9-9 19 0 28M32 16c9 9 9 19 0 28" stroke="#fff" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function Tile({ size, from, to, children }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${id})`} />
      {children}
      <path d="M16 2.500h32A13.500 13.500 0 0 1 61.500 16v4C52 12 12 12 2.500 20v-4A13.500 13.500 0 0 1 16 2.500z" fill="#fff" fillOpacity=".14" />
      <rect x="2.400" y="2.400" width="59.200" height="59.200" rx="13.600" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth=".8" />
    </svg>
  );
}

export const AppIcon = {
  finder: ({ size }) => (
    <Tile size={size} from="#6cc4ff" to="#1f7fe6">
      <path d="M14 24a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff" />
      <path d="M14 30h36" stroke="#1f7fe6" strokeWidth="2" />
    </Tile>
  ),
  browser: ({ size }) => (
    <Tile size={size} from="#ffffff" to="#dfe6ef">
      <circle cx="32" cy="32" r="19" fill="#2f8fe0" />
      <path d="M13 32h38M32 13c-11 11-11 27 0 38M32 13c11 11 11 27 0 38" stroke="#fff" strokeWidth="1.8" fill="none" />
    </Tile>
  ),
  mail: ({ size }) => (
    <Tile size={size} from="#5ec1ff" to="#1469e0">
      <rect x="12" y="19" width="40" height="27" rx="3" fill="#fff" />
      <path d="M13 21l19 15 19-15" stroke="#1469e0" strokeWidth="2.2" fill="none" />
    </Tile>
  ),
  terminal: ({ size }) => (
    <Tile size={size} from="#3a3f49" to="#16181d">
      <path d="M16 23l9 8-9 8" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 41h15" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
    </Tile>
  ),
  textedit: ({ size }) => (
    <Tile size={size} from="#fff3a6" to="#ffd23c">
      <rect x="15" y="12" width="34" height="40" rx="3" fill="#fffdf2" />
      {[21, 28, 35, 42].map((y) => (
        <path key={y} d={`M20 ${y}h24`} stroke="#c9b45e" strokeWidth="2" strokeLinecap="round" />
      ))}
    </Tile>
  ),
  settings: ({ size }) => (
    <Tile size={size} from="#c8ccd3" to="#8b9099">
      <circle cx="32" cy="32" r="13" fill="none" stroke="#fff" strokeWidth="6" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="29" y="11" width="6" height="9" rx="1.5" fill="#fff" transform={`rotate(${i * 45} 32 32)`} />
      ))}
    </Tile>
  ),
  preview: ({ size }) => (
    <Tile size={size} from="#b6e1ff" to="#4aa5ec">
      <rect x="13" y="16" width="38" height="32" rx="3" fill="#fff" />
      <path d="M15 46l11-14 9 10 6-6 8 10z" fill="#4caf72" />
      <circle cx="42" cy="24" r="3.5" fill="#ffd25a" />
    </Tile>
  ),
  assistant: ({ size }) => (
    <Tile size={size} from="#7c5cff" to="#ff5fa2">
      <path d="M12 24a9 9 0 0 1 9-9h22a9 9 0 0 1 9 9v13a9 9 0 0 1-9 9H29l-9 8v-8a9 9 0 0 1-8-9z" fill="#fff" fillOpacity=".95" />
      <path d="M32 21l2.800 7.700L42 31l-7.200 2.300L32 41l-2.800-7.700L22 31l7.200-2.300z" fill="#7c5cff" />
    </Tile>
  ),
  stack: ({ size }) => <FolderIcon size={size} />,
  launchpad: ({ size }) => (
    <Tile size={size} from="#e9ecf2" to="#b6bdca">
      {[14, 27, 40].flatMap((y, r) =>
        [14, 27, 40].map((x, c) => <rect key={`${r}${c}`} x={x} y={y} width="10" height="10" rx="3" fill={["#ff5f57", "#febc2e", "#28c840", "#0a7cff", "#bf5af2", "#ff9f0a", "#64d2ff", "#ff375f", "#30d158"][r * 3 + c]} />),
      )}
    </Tile>
  ),
  photos: ({ size }) => (
    <Tile size={size} from="#ffffff" to="#eef0f4">
      {["#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a7cff", "#bf5af2", "#ff375f", "#ff6b35"].map((c, i) => (
        <ellipse key={c} cx="32" cy="20" rx="7.500" ry="12" fill={c} fillOpacity=".82" transform={`rotate(${i * 45} 32 32)`} style={{ mixBlendMode: "multiply" }} />
      ))}
    </Tile>
  ),
  calendar: ({ size }) => {
    const d = new Date();
    return (
      <Tile size={size} from="#ffffff" to="#f1f2f5">
        <text x="32" y="19" textAnchor="middle" fontSize="9.500" fontWeight="700" fill="#ff3b30" fontFamily="Inter, sans-serif">
          {d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
        </text>
        <text x="32" y="48" textAnchor="middle" fontSize="28" fontWeight="500" fill="#1d1d1f" fontFamily="Inter, sans-serif">
          {d.getDate()}
        </text>
      </Tile>
    );
  },
  activity: ({ size }) => (
    <Tile size={size} from="#2b2f36" to="#121418">
      <path d="M10 36h9l4-13 7 25 6-18 4 6h14" stroke="#30d158" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Tile>
  ),
  trash: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M15 18h34l-3.2 37a4 4 0 0 1-4 3.6H22.2a4 4 0 0 1-4-3.6z" fill="#e5e9ef" fillOpacity=".92" stroke="#aeb4bf" />
      <rect x="11" y="12" width="42" height="7" rx="3" fill="#f4f6f9" stroke="#aeb4bf" />
      {[25, 32, 39].map((x) => (
        <path key={x} d={`M${x} 26v24`} stroke="#aeb4bf" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  ),
};

export function NodeIcon({ node, size = 64 }) {
  if (node.kind === "folder") return <FolderIcon size={size} />;
  if (node.kind === "image" && node.src) return <img src={`${import.meta.env.BASE_URL}${node.src}`} alt="" width={size} height={size} className="rounded-[4px] object-cover shadow-md ring-1 ring-white/40" style={{ width: size, height: size }} />;
  if (node.kind === "image") return <ImageIcon size={size} />;
  if (node.kind === "link") return <LinkIcon size={size} />;
  if (node.kind === "app") return AppIcon[node.app]({ size });
  if (node.kind === "resume") return <DocIcon size={size} ext="PDF" />;
  return <DocIcon size={size} />;
}

// Small line glyphs for the toolbar and menu bar.
const G = ({ size = 16, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const Glyph = {
  chevronLeft: (p) => <G {...p}><path d="M10 3L5 8l5 5" /></G>,
  chevronRight: (p) => <G {...p}><path d="M6 3l5 5-5 5" /></G>,
  search: (p) => <G {...p}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></G>,
  icons: (p) => <G {...p}><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></G>,
  list: (p) => <G {...p}><path d="M5 4h9M5 8h9M5 12h9M2 4h.5M2 8h.5M2 12h.5" /></G>,
  columns: (p) => <G {...p}><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" /><path d="M6 2.5v11M10 2.5v11" /></G>,
  gallery: (p) => <G {...p}><rect x="1.5" y="2.5" width="13" height="7.5" rx="1.5" /><path d="M2 13h2M7 13h2M12 13h2" /></G>,
  wifi: (p) => <G {...p}><path d="M1.5 6a10 10 0 0 1 13 0M4 8.8a6.2 6.2 0 0 1 8 0M6.4 11.4a2.6 2.6 0 0 1 3.2 0" /><circle cx="8" cy="13.4" r=".5" fill="currentColor" /></G>,
  control: (p) => <G {...p}><rect x="1.5" y="3" width="13" height="4.4" rx="2.2" /><rect x="1.5" y="9" width="13" height="4.4" rx="2.2" /><circle cx="12" cy="5.2" r="1.2" fill="currentColor" /><circle cx="4" cy="11.2" r="1.2" fill="currentColor" /></G>,
  sun: (p) => <G {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1" /></G>,
  moon: (p) => <G {...p}><path d="M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3z" /></G>,
  sound: (p) => <G {...p}><path d="M2 6.2v3.6h2.4L8 12.6V3.4L4.4 6.2zM10.5 6a3 3 0 0 1 0 4M12.2 4.2a5.5 5.5 0 0 1 0 7.6" /></G>,
  bluetooth: (p) => <G {...p}><path d="M4 5l8 6-4 3.5v-13L12 5l-8 6" /></G>,
  home: (p) => <G {...p}><path d="M2 7.5L8 2.5l6 5M3.5 6.5V13.5h9V6.5" /></G>,
  clock: (p) => <G {...p}><circle cx="8" cy="8" r="6.2" /><path d="M8 4.5V8l2.4 1.6" /></G>,
  folder: (p) => <G {...p}><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.6h4.5A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" /></G>,
  doc: (p) => <G {...p}><path d="M4 1.8h5l3.5 3.5V14H4zM9 1.8V5.5h3.5" /></G>,
  mail: (p) => <G {...p}><rect x="1.5" y="3" width="13" height="10" rx="1.5" /><path d="M2 4l6 5 6-5" /></G>,
  person: (p) => <G {...p}><circle cx="8" cy="5" r="3" /><path d="M2.5 14a5.5 5.5 0 0 1 11 0" /></G>,
  disk: (p) => <G {...p}><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" /><path d="M11.5 9.5h.5" /></G>,
  trash: (p) => <G {...p}><path d="M2.5 4.5h11M6 4.5V2.5h4v2M4 4.5l.8 9h6.4l.8-9" /></G>,
  coffee: (p) => <G {...p}><path d="M2.5 6.5h9V10A3.5 3.5 0 0 1 8 13.5H6A3.5 3.5 0 0 1 2.5 10zM11.5 7.5h1a1.75 1.75 0 0 1 0 3.5h-1M5.5 1.8c-.6.8.6 1.6 0 2.6M8.5 1.8c-.6.8.6 1.6 0 2.6" /></G>,};

// The portfolio's mark: a kolam, the looping line art drawn around a dot grid.
export function Logo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12C9 9 6 3 12 3s3 6 0 9c3-3 9-6 9 0s-6 3-9 0c3 3 6 9 0 9s-3-6 0-9c-3 3-9 6-9 0s6-3 9 0z" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Avatar({ size = 64, className = "" }) {
  return <img src={`${import.meta.env.BASE_URL}about/avatar.jpg`} alt="Jayakrishnan" width={size} height={size} className={`flex-none rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
}

export function BatteryGlyph() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
      <rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity=".5" />
      <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
      <path d="M23 4v4c.8-.3 1.5-1.1 1.5-2S23.800 4.300 23 4z" fill="currentColor" fillOpacity=".5" />
    </svg>
  );
}
