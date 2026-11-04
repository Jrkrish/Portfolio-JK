import { allProjects, person } from "../fs.js";
import { Avatar } from "../icons/index.jsx";

const specs = [
  ["Developer", person.name],
  ["Role", person.role],
  ["Location", person.location],
  ["Projects", `${allProjects.length} on disk`],
  ["Built with", "React, Vite, Framer Motion"],
  ["Tested", "Automated browser checks"],
];

export default function AboutThis() {
  return (
    <div className="flex flex-1 items-center gap-6 bg-[var(--paper)] px-7 pb-5">
      <Avatar size={96} />
      <div className="min-w-0">
        <h3 className="text-[20px] font-bold tracking-tight">Portfolio OS</h3>
        <p className="text-[12px] text-[var(--text-2)]">Version 1.0, a desktop for one developer</p>
        <dl className="mt-3 grid grid-cols-[84px_1fr] gap-x-3 gap-y-0.5 text-[12.5px]">
          {specs.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-right font-medium">{k}</dt>
              <dd className="truncate text-[var(--text-2)]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
