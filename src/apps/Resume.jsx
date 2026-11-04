import { useState } from "react";
import { createPortal } from "react-dom";
import { EDUCATION, EXPERIENCE, SKILLS, allProjects, person } from "../fs.js";
import { Glyph } from "../icons/index.jsx";

const FEATURED = ["FanCare LLM Quality", "DevPilot", "SDLC Agents", "Spine Segmentation", "Studio Infinity"];

const Heading = ({ children }) => <h2 className="mb-1.5 mt-[18px] border-b border-[#1d1d1f] pb-0.5 text-[11.5px] font-bold uppercase tracking-[0.1em]">{children}</h2>;

function Sheet() {
  const projects = FEATURED.map((name) => allProjects.find((p) => p.name === name));
  return (
    <div className="resume-sheet text-[11.5px] leading-[1.45] text-[#1d1d1f]">
      <header>
        <h1 className="text-[27px] font-bold leading-tight tracking-tight">{person.name}</h1>
        <p className="text-[12.5px]">
          {person.role} · {person.location}
        </p>
        <p className="mt-0.5">
          {person.email} · linkedin.com/in/krishinfowork · github.com/Jrkrish
        </p>
      </header>

      <Heading>Summary</Heading>
      <p>Builds AI applications, computer-vision models and full-stack web products, with a focus on LLM agents and how to measure them: retrieval with citations, tool calling, evaluation suites, red-teaming and regression gates in CI.</p>

      <Heading>Experience</Heading>
      {EXPERIENCE.map((e) => (
        <div key={e.title} className="mb-1.5">
          <p className="flex justify-between font-semibold">
            <span>
              {e.title}, {e.org}
            </span>
            <span className="font-normal">{e.period}</span>
          </p>
          <p>{e.text}</p>
        </div>
      ))}

      <Heading>Selected Projects</Heading>
      {projects.map((p) => (
        <div key={p.name} className="mb-1.5">
          <p className="flex justify-between gap-4 font-semibold">
            <span>{p.name}</span>
            <span className="text-right font-normal">{p.stack.join(", ")}</span>
          </p>
          <p>{p.summary}</p>
        </div>
      ))}

      <Heading>Skills</Heading>
      {Object.entries(SKILLS).map(([group, items]) => (
        <p key={group}>
          <span className="font-semibold">{group}:</span> {items.join(", ")}
        </p>
      ))}

      <Heading>Education</Heading>
      <p className="flex justify-between font-semibold">
        <span>{EDUCATION.degree}</span>
        <span className="font-normal">{EDUCATION.status}</span>
      </p>
      <p>
        {EDUCATION.college}, {EDUCATION.place}. CGPA {EDUCATION.cgpa}.
      </p>
    </div>
  );
}

export default function Resume() {
  const [zoom, setZoom] = useState(1);
  const change = (d) => setZoom((z) => Math.min(1.5, Math.max(0.6, Math.round((z + d) * 10) / 10)));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="os-toolbar flex h-9 flex-none items-center justify-between gap-2 px-3">
        <span className="flex items-center gap-1 text-[12px] text-[var(--text-2)]">
          <button type="button" aria-label="Zoom out" onClick={() => change(-0.1)} className="os-tool !h-6 !w-6 text-[16px]">
            −
          </button>
          <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={() => change(0.1)} className="os-tool !h-6 !w-6 text-[16px]">
            +
          </button>
        </span>
        <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1 text-[12.5px] font-medium text-white">
          <Glyph.doc size={13} />
          Save as PDF
        </button>
      </div>
      <div className="scroller min-h-0 flex-1 overflow-auto bg-[var(--viewer)] p-5">
        <div className="mx-auto w-fit origin-top bg-white p-10 shadow-xl" style={{ width: 620, zoom }}>
          <Sheet />
        </div>
      </div>
      {createPortal(
        <div className="print-only">
          <Sheet />
        </div>,
        document.body,
      )}
    </div>
  );
}
