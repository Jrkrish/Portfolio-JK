// Draws the project covers in public/previews/. Each cover is an original
// illustration built from SVG, rendered to JPEG so the fonts are baked in.
//
//   npm run covers
//
// Needs Microsoft Edge installed. The output is committed, so the site itself
// never runs this.

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "previews");
const W = 1200;
const H = 900;
const FONT = "'Segoe UI Variable Display','Segoe UI',Inter,sans-serif";
const MONO = "'Cascadia Code',Consolas,monospace";

const text = (x, y, s, size, fill = "#fff", o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.mono ? MONO : FONT}" font-size="${size}" font-weight="${o.w ?? 600}" fill="${fill}" text-anchor="${o.a ?? "start"}" opacity="${o.o ?? 1}" letter-spacing="${o.ls ?? 0}">${s}</text>`;

const glass = (x, y, w, h, r = 22, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${o.fill ?? "rgba(255,255,255,.1)"}" stroke="${o.stroke ?? "rgba(255,255,255,.28)"}" stroke-width="1.5"/>`;

const chip = (x, y, label, fill, ink = "#fff", size = 22) => {
  const w = label.length * size * 0.56 + 36;
  return `<rect x="${x}" y="${y}" width="${w}" height="${size * 2}" rx="${size}" fill="${fill}"/>${text(x + w / 2, y + size * 1.38, label, size, ink, { a: "middle", w: 700 })}`;
};

function page({ a, b, c, title, tag, art }) {
  return `<!doctype html><html><body style="margin:0;background:#000">
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="glowA" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c}" stop-opacity=".75"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" fill-opacity=".1"/></pattern>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity=".42"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .06"/></feComponentTransfer></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <circle cx="930" cy="170" r="430" fill="url(#glowA)"/>
  <circle cx="190" cy="640" r="340" fill="url(#glowB)"/>
  ${art}
  <rect width="${W}" height="${H}" fill="url(#fadeB)"/>
  ${text(62, 786, tag.toUpperCase(), 25, "#fff", { w: 700, o: 0.8, ls: 3 })}
  ${text(60, 846, title, 62, "#fff", { w: 800 })}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg></body></html>`;
}

const covers = {
  fancare: {
    a: "#07243f", b: "#0b6b73", c: "#22d3c5", title: "FanCare LLM Quality", tag: "Tested RAG support agent",
    art: (() => {
      const blades = [0, 72, 144, 216, 288].map((r) => `<path d="M0 -36C48 -86 66 -210 18 -262C-20 -270 -56 -196 -28 -36z" fill="url(#blade)" transform="rotate(${r})"/>`).join("");
      return `<defs><linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fffb"/><stop offset="1" stop-color="#7fd8d0"/></linearGradient></defs>
      <g transform="translate(830 310)" filter="url(#soft)"><circle r="282" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2" stroke-dasharray="6 14"/>${blades}<circle r="56" fill="#0b3b4b" stroke="#bff5ee" stroke-width="6"/><circle r="16" fill="#bff5ee"/></g>
      <g filter="url(#soft)">${glass(70, 96, 470, 112, 26, { fill: "rgba(255,255,255,.14)" })}${text(104, 146, "Is my fan under warranty?", 30)}${text(104, 182, "Customer", 20, "#fff", { o: 0.6, w: 500 })}
      ${glass(112, 236, 520, 196, 26, { fill: "#f4fffd", stroke: "#fff" })}${text(146, 288, "Yes. The warranty runs for", 29, "#07243f", { w: 600 })}${text(146, 328, "two years from purchase.", 29, "#07243f", { w: 600 })}
      ${chip(146, 354, "Cited: warranty.md", "#0b8f8a", "#fff", 20)}</g>
      <g filter="url(#soft)">${chip(70, 486, "Evals", "#22d3c5", "#05303a", 24)}${chip(190, 486, "Red team", "#ff6b6b", "#fff", 24)}${chip(362, 486, "CI gate", "#ffd166", "#3a2a00", 24)}</g>`;
    })(),
  },
  devpilot: {
    a: "#161a55", b: "#4a1c8c", c: "#7c5cff", title: "DevPilot", tag: "Requirement to release",
    art: (() => {
      const pts = [[120, 590, "Requirements"], [300, 420, "Stories"], [500, 520, "Design"], [690, 340, "Code"], [880, 430, "Tests"], [1040, 210, "Release"]];
      const nodes = pts.map(([x, y, l], i) => `<g filter="url(#soft)"><circle cx="${x}" cy="${y}" r="42" fill="${i === 5 ? "#ffd166" : "#fff"}"/>${text(x, y + 13, i + 1, 36, "#2a1a78", { a: "middle", w: 800 })}${text(x, y + 84, l, 25, "#fff", { a: "middle" })}</g>`).join("");
      return `<path d="M120 590C210 470 240 400 300 420S430 540 500 520 620 330 690 340 810 450 880 430 980 260 1040 210" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-dasharray="4 16" stroke-linecap="round"/>
      ${nodes}<g transform="translate(965 96) rotate(14)" filter="url(#soft)"><path d="M0 60L150 0 104 128 70 88z" fill="#fff"/><path d="M70 88L150 0 52 76z" fill="#c9c2ff"/></g>`;
    })(),
  },
  sdlc: {
    a: "#04313a", b: "#0a5c46", c: "#3ee8a0", title: "SDLC Agents", tag: "A team of AI agents",
    art: (() => {
      const cx = 600, cy = 345, R = 248;
      const names = ["Product", "Design", "Code", "QA", "Deploy"];
      const colors = ["#ffd166", "#ff8fab", "#7cc7ff", "#b79cff", "#7ff0b8"];
      const spots = names.map((n, i) => {
        const a = ((-90 + i * 72) * Math.PI) / 180;
        return [cx + R * 1.35 * Math.cos(a), cy + R * Math.sin(a), n, colors[i]];
      });
      const links = spots.map(([x, y]) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="3 12" stroke-linecap="round"/>`).join("");
      const bots = spots.map(([x, y, n, c]) => `<g transform="translate(${x} ${y})" filter="url(#soft)"><rect x="-58" y="-52" width="116" height="96" rx="30" fill="${c}"/><line x1="0" y1="-52" x2="0" y2="-74" stroke="${c}" stroke-width="7"/><circle cy="-80" r="9" fill="${c}"/><circle cx="-24" cy="-10" r="12" fill="#0b2b2b"/><circle cx="24" cy="-10" r="12" fill="#0b2b2b"/><path d="M-20 18q20 16 40 0" stroke="#0b2b2b" stroke-width="6" fill="none" stroke-linecap="round"/>${text(0, 84, n, 25, "#fff", { a: "middle" })}</g>`).join("");
      return `${links}<g filter="url(#soft)"><path d="M${cx} ${cy - 100}l87 50v100l-87 50-87-50v-100z" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="3"/>${text(cx, cy + 15, "SDLC", 44, "#fff", { a: "middle", w: 800 })}</g>${bots}`;
    })(),
  },
  resume: {
    a: "#3a1c71", b: "#b1387a", c: "#ffaf7b", title: "AI Resume Generator", tag: "ATS-friendly, in minutes",
    art: `<g transform="translate(150 66) rotate(-6)" filter="url(#soft)"><rect width="470" height="610" rx="20" fill="#fff"/><circle cx="76" cy="84" r="42" fill="#d9c7f5"/><rect x="138" y="58" width="230" height="24" rx="12" fill="#3a1c71"/><rect x="138" y="96" width="160" height="16" rx="8" fill="#c9bfdd"/>
      ${[176, 212, 248].map((y, i) => `<rect x="36" y="${y}" width="${[398, 350, 380][i]}" height="14" rx="7" fill="#e3deed"/>`).join("")}<rect x="36" y="300" width="150" height="20" rx="10" fill="#b1387a"/>
      ${[344, 380, 416, 452].map((y, i) => `<rect x="36" y="${y}" width="${[380, 330, 398, 300][i]}" height="14" rx="7" fill="#e3deed"/>`).join("")}<rect x="36" y="504" width="150" height="20" rx="10" fill="#b1387a"/>${[546, 576].map((y) => `<rect x="36" y="${y}" width="360" height="12" rx="6" fill="#e3deed"/>`).join("")}</g>
      <g transform="translate(790 300)" filter="url(#soft)"><circle r="152" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.3)"/><circle r="118" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="26"/><circle r="118" fill="none" stroke="#ffd166" stroke-width="26" stroke-linecap="round" stroke-dasharray="640 800" transform="rotate(-90)"/>${text(0, 14, "ATS", 56, "#fff", { a: "middle", w: 800 })}${text(0, 56, "friendly", 26, "#fff", { a: "middle", o: 0.8 })}</g>
      <g fill="#fff" filter="url(#soft)"><path d="M1010 92l14 40 40 14-40 14-14 40-14-40-40-14 40-14z"/><path d="M700 92l8 24 24 8-24 8-8 24-8-24-24-8 24-8z"/></g>`,
  },
  "code-assistant": {
    a: "#101426", b: "#27305c", c: "#5b8cff", title: "Code Assistant", tag: "Explain. Debug. Fix.",
    art: (() => {
      const k = "#ff7ab6", f = "#7cc7ff", s = "#a5e887", w = "#e7ecff", c = "#7d86a8";
      const line = (n, y, parts) => {
        let x = 200;
        const spans = parts.map(([t, col]) => {
          const out = text(x, y, t.replace(/ /g, " "), 28, col, { mono: true, w: 500 });
          x += t.length * 15.5;
          return out;
        }).join("");
        return text(136, y, n, 26, c, { mono: true, a: "end", w: 400 }) + spans;
      };
      return `<g filter="url(#soft)">${glass(70, 72, 860, 590, 24, { fill: "#171c33", stroke: "rgba(255,255,255,.18)" })}<circle cx="110" cy="112" r="10" fill="#ff5f57"/><circle cx="142" cy="112" r="10" fill="#febc2e"/><circle cx="174" cy="112" r="10" fill="#28c840"/>${text(500, 121, "app.py", 25, "#c8cfe8", { a: "middle", w: 500 })}
      <rect x="70" y="384" width="860" height="52" fill="#ff5f57" fill-opacity=".2"/><rect x="70" y="384" width="6" height="52" fill="#ff5f57"/>
      ${line(1, 186, [["def ", k], ["average", f], ["(values):", w]])}${line(2, 240, [["    # mean of a list", c]])}${line(3, 294, [["    total = ", w], ["sum", f], ["(values)", w]])}${line(4, 348, [["    count = ", w], ["len", f], ["(values)", w]])}${line(5, 420, [["    return total / count", w]])}${line(6, 474, [["", w]])}${line(7, 528, [["print", f], ["(average([]))", w]])}</g>
      <g filter="url(#soft)">${glass(620, 300, 500, 250, 22, { fill: "#fff", stroke: "#fff" })}<circle cx="668" cy="350" r="24" fill="#ff5f57"/>${text(668, 360, "!", 30, "#fff", { a: "middle", w: 800 })}${text(706, 360, "ZeroDivisionError", 29, "#101426", { w: 700 })}${text(650, 418, "An empty list makes count 0.", 25, "#3a415f", { w: 500 })}${text(650, 454, "Check for it before dividing.", 25, "#3a415f", { w: 500 })}${chip(650, 480, "Suggested fix", "#28c840", "#fff", 21)}</g>`;
    })(),
  },
  "finetuned-llm": {
    a: "#3d0c11", b: "#7a1b1f", c: "#ff9f43", title: "Finetuned LLM", tag: "Llama 2 for cricket chat",
    art: (() => {
      const nodes = [[640, 120], [640, 250], [640, 380], [790, 70], [790, 190], [790, 310], [790, 430], [940, 150], [940, 300]];
      const lines = [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6], [3, 7], [4, 7], [4, 8], [5, 8], [6, 8], [1, 3], [2, 4]]
        .map(([p, q]) => `<line x1="${nodes[p][0]}" y1="${nodes[p][1]}" x2="${nodes[q][0]}" y2="${nodes[q][1]}" stroke="#ffd9a8" stroke-opacity=".45" stroke-width="2.5"/>`).join("");
      const dots = nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#ffd9a8"/>`).join("");
      const stitch = Array.from({ length: 13 }, (_, i) => {
        const y = -176 + i * 29;
        return `<path d="M-20 ${y}l14 8M20 ${y}l-14 8" stroke="#ffe9d6" stroke-width="5" stroke-linecap="round" transform="rotate(24)"/>`;
      }).join("");
      return `${lines}<g filter="url(#soft)">${dots}</g>
      <g transform="translate(300 300)" filter="url(#soft)"><circle r="200" fill="#c8272c"/><circle r="200" fill="url(#glowB)"/><path d="M-60 -180Q-10 0 -60 180M60 -180Q10 0 60 180" fill="none" stroke="#ffe9d6" stroke-width="5" transform="rotate(24)"/>${stitch}</g>
      <g filter="url(#soft)">${glass(610, 470, 510, 150, 28, { fill: "#fff5e8", stroke: "#fff" })}${text(646, 530, "How does a yorker work?", 31, "#3d0c11", { w: 700 })}${text(646, 578, "Fine-tuned answers, on topic.", 26, "#7a1b1f", { w: 500 })}</g>`;
    })(),
  },
  recipe: {
    a: "#0f3d2e", b: "#c76a12", c: "#ffd166", title: "Smart Recipe Planner", tag: "A week of meals, planned",
    art: (() => {
      const days = ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => `<g filter="url(#soft)"><rect x="${70 + i * 96}" y="72" width="82" height="118" rx="18" fill="${i === 2 ? "#ffd166" : "rgba(255,255,255,.14)"}" stroke="rgba(255,255,255,.3)"/>${text(111 + i * 96, 118, d, 27, i === 2 ? "#3a2a00" : "#fff", { a: "middle", w: 700 })}<circle cx="${111 + i * 96}" cy="152" r="17" fill="${["#ff8f6b", "#a5e887", "#ff6b6b", "#ffd166", "#7ff0b8", "#ffb4c6", "#c6a5ff"][i]}"/></g>`).join("");
      const list = ["Tomatoes", "Spinach", "Lentils", "Yoghurt"].map((t, i) => `<rect x="${876}" y="${312 + i * 62}" width="28" height="28" rx="8" fill="${i < 2 ? "#2f9e5b" : "#e6ded0"}"/>${i < 2 ? `<path d="M${882} ${327 + i * 62}l7 7 11-13" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` : ""}${text(918, 335 + i * 62, t, 28, "#2c2a24", { w: 500 })}`).join("");
      return `${days}<g transform="translate(400 440)" filter="url(#soft)"><circle r="218" fill="#fbf7ef"/><circle r="170" fill="#f0e8da"/><path d="M-110 -60a130 130 0 0 1 220 0l-110 60z" fill="#7cc35b"/><circle cx="-80" cy="50" r="58" fill="#ff7a59"/><circle cx="-80" cy="50" r="36" fill="#ffb199"/><path d="M0 30h130a90 90 0 0 1-130 90z" fill="#f4c542"/><circle cx="40" cy="-30" r="18" fill="#e4572e"/><circle cx="-16" cy="-44" r="12" fill="#2f9e5b"/></g>
      <g filter="url(#soft)">${glass(842, 240, 300, 340, 22, { fill: "#fffaf0", stroke: "#fff" })}${text(876, 288, "Shopping list", 28, "#0f3d2e", { w: 800 })}${list}</g>`;
    })(),
  },
  spine: {
    a: "#06121f", b: "#10304a", c: "#3aa0ff", title: "Spine Segmentation", tag: "YOLOv8 vertebra detection",
    art: (() => {
      const labels = ["L1", "L2", "L3", "L4", "L5", "S1"];
      const colors = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#b197fc"];
      const v = labels.map((l, i) => {
        const y = 66 + i * 104;
        const x = 470 + Math.sin((i / 5) * Math.PI * 0.9) * 110;
        const w = 170 + i * 16;
        const h = i === 5 ? 92 : 78;
        return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="url(#bone)"/><rect x="${x + w + 8}" y="${y + 26}" width="66" height="26" rx="13" fill="#dfe9f5" fill-opacity=".55"/>${i < 5 ? `<rect x="${x + 22}" y="${y + h + 4}" width="${w - 30}" height="18" rx="9" fill="#7fa6c9" fill-opacity=".55"/>` : ""}
        <rect x="${x - 18}" y="${y - 10}" width="${w + 112}" height="${h + 20}" rx="10" fill="${colors[i]}" fill-opacity=".1" stroke="${colors[i]}" stroke-width="4"/><rect x="${x - 18}" y="${y - 44}" width="62" height="34" rx="6" fill="${colors[i]}"/>${text(x + 13, y - 19, l, 25, "#06121f", { a: "middle", w: 800 })}</g>`;
      }).join("");
      return `<defs><linearGradient id="bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset="1" stop-color="#9cb9d4"/></linearGradient></defs>
      <path d="M380 0C520 240 560 420 600 900" stroke="#3aa0ff" stroke-opacity=".14" stroke-width="150" fill="none"/><g filter="url(#soft)">${v}</g>
      <g filter="url(#soft)">${glass(70, 96, 300, 200, 22, { fill: "rgba(255,255,255,.08)" })}${text(102, 152, "6 classes", 40, "#fff", { w: 800 })}${text(102, 196, "L1 to L5 and S1", 27, "#fff", { o: 0.85, w: 500 })}${text(102, 240, "Labelled boxes", 27, "#fff", { o: 0.85, w: 500 })}</g>`;
    })(),
  },
  wrinkles: {
    a: "#2b1055", b: "#7597de", c: "#ff8fd0", title: "Wrinkle Detection", tag: "YOLOv8 segmentation",
    art: `<g transform="translate(600 345)" filter="url(#soft)"><path d="M-214 -30C-214 -214 -110 -280 0 -280S214 -214 214 -30C214 104 110 262 0 262S-214 104 -214 -30z" fill="#f6d9c4"/><path d="M-214 -30C-226 -190 -130 -300 0 -300S226 -190 214 -30C200 -110 150 -176 0 -176S-200 -110 -214 -30z" fill="#2c2233"/><circle cx="-84" cy="-8" r="18" fill="#2c2233"/><circle cx="84" cy="-8" r="18" fill="#2c2233"/><path d="M-130 -46q46 -24 92 0M38 -46q46 -24 92 0" stroke="#2c2233" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M0 0q-22 62 -8 78h28" stroke="#c99a7e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-62 142q62 38 124 0" stroke="#b8606a" stroke-width="10" fill="none" stroke-linecap="round"/></g>
      <g fill="none" stroke-linecap="round"><path d="M480 212q120 -26 240 0" stroke="#ff4f9a" stroke-width="8"/><path d="M506 240q94 -20 188 0" stroke="#ff4f9a" stroke-width="8"/><path d="M584 268l12 34M616 268l-12 34" stroke="#ffb020" stroke-width="8"/><path d="M430 376q-12 22 -2 46M770 376q12 22 2 46" stroke="#23d5ab" stroke-width="8"/></g>
      <rect x="456" y="178" width="288" height="86" rx="14" fill="#ff4f9a" fill-opacity=".16" stroke="#ff4f9a" stroke-width="4" stroke-dasharray="12 8"/><rect x="566" y="262" width="68" height="50" rx="10" fill="#ffb020" fill-opacity=".16" stroke="#ffb020" stroke-width="4" stroke-dasharray="10 7"/><rect x="408" y="362" width="52" height="74" rx="10" fill="#23d5ab" fill-opacity=".16" stroke="#23d5ab" stroke-width="4" stroke-dasharray="10 7"/><rect x="740" y="362" width="52" height="74" rx="10" fill="#23d5ab" fill-opacity=".16" stroke="#23d5ab" stroke-width="4" stroke-dasharray="10 7"/>
      <g filter="url(#soft)">${chip(820, 150, "forehead", "#ff4f9a", "#fff", 25)}<path d="M820 175h-76" stroke="#ff4f9a" stroke-width="4"/>${chip(820, 270, "frown", "#ffb020", "#3a2600", 25)}<path d="M820 295h-186" stroke="#ffb020" stroke-width="4"/>${chip(860, 380, "wrinkle", "#23d5ab", "#04352b", 25)}<path d="M860 405h-68" stroke="#23d5ab" stroke-width="4"/></g>`,
  },
  skin: {
    a: "#3b1d2a", b: "#a4553c", c: "#ffc48a", title: "Skin Cancer Prediction", tag: "Image classification",
    art: `<defs><radialGradient id="skinTone" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f3caa5"/><stop offset="1" stop-color="#cf8f68"/></radialGradient><clipPath id="lens"><circle cx="400" cy="320" r="232"/></clipPath></defs>
      <g filter="url(#soft)"><circle cx="400" cy="320" r="232" fill="url(#skinTone)"/><g clip-path="url(#lens)"><path d="M340 240c50 -40 130 -26 150 40s-20 130 -90 130 -130 -30 -130 -90 30 -60 70 -80z" fill="#6b3d2a"/><path d="M380 276c30 -16 70 -6 76 30s-20 66 -56 62 -60 -22 -54 -54 14 -28 34 -38z" fill="#3f2118"/><g stroke="#fff" stroke-opacity=".25" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<line x1="170" y1="${130 + i * 48}" x2="640" y2="${130 + i * 48}"/>`).join("")}</g></g><circle cx="400" cy="320" r="232" fill="none" stroke="#f7f1ea" stroke-width="26"/><path d="M566 488l150 150" stroke="#f7f1ea" stroke-width="44" stroke-linecap="round"/></g>
      <g filter="url(#soft)">${glass(740, 130, 390, 330, 24, { fill: "#fffaf5", stroke: "#fff" })}${text(776, 190, "Classifier", 34, "#3b1d2a", { w: 800 })}${text(776, 228, "Lesion image analysis", 24, "#7a5a4d", { w: 500 })}${[["Class A", 0.72, "#a4553c"], ["Class B", 0.44, "#d98f5f"], ["Class C", 0.2, "#e8c2a0"]].map(([l, v, c], i) => `${text(776, 286 + i * 58, l, 24, "#3b1d2a", { w: 600 })}<rect x="776" y="${298 + i * 58}" width="320" height="16" rx="8" fill="#f0e2d6"/><rect x="776" y="${298 + i * 58}" width="${320 * v}" height="16" rx="8" fill="${c}"/>`).join("")}</g>`,
  },
  studio: {
    a: "#0b0b2b", b: "#2a0f5e", c: "#a855f7", title: "Studio Infinity", tag: "Minimal, with motion",
    art: `<defs><linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f8cff"/><stop offset=".5" stop-color="#b14eff"/><stop offset="1" stop-color="#ff6ab5"/></linearGradient></defs>
      <g filter="url(#soft)">${glass(110, 70, 980, 590, 24, { fill: "rgba(14,12,48,.72)", stroke: "rgba(255,255,255,.2)" })}<circle cx="150" cy="110" r="10" fill="#ff5f57"/><circle cx="182" cy="110" r="10" fill="#febc2e"/><circle cx="214" cy="110" r="10" fill="#28c840"/><rect x="380" y="94" width="440" height="32" rx="16" fill="rgba(255,255,255,.1)"/>${text(600, 118, "studio-infinity", 21, "#fff", { a: "middle", w: 500, o: 0.75 })}</g>
      <path d="M600 360C520 250 380 240 330 330S400 480 500 430 700 280 800 280 930 370 870 440 690 470 600 360z" fill="none" stroke="url(#ribbon)" stroke-width="46" stroke-linecap="round"/><path d="M600 360C520 250 380 240 330 330S400 480 500 430" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"/>
      ${text(600, 580, "Crafting digital experiences", 36, "#fff", { a: "middle", w: 600 })}`,
  },
  "game-store": {
    a: "#101535", b: "#0b6fb0", c: "#34d3ff", title: "Game Store", tag: "Console e-commerce in PHP",
    art: `<g filter="url(#soft)" transform="translate(70 90)">${[0, 1, 2].map((i) => `<g transform="translate(${i * 214} 0)"><rect width="190" height="250" rx="20" fill="#fff"/><rect x="14" y="14" width="162" height="124" rx="12" fill="${["#ff6b6b", "#7c5cff", "#2fd4a7"][i]}"/><rect x="24" y="${156}" width="142" height="14" rx="7" fill="#d5dbe8"/><rect x="24" y="${182}" width="96" height="14" rx="7" fill="#d5dbe8"/><rect x="24" y="${206}" width="142" height="30" rx="10" fill="#0b6fb0"/></g>`).join("")}</g>
      <g transform="translate(790 470)" filter="url(#soft)"><path d="M-250 -90h500c70 0 110 120 110 220 0 66 -74 80 -118 24l-64 -84h-356l-64 84c-44 56 -118 42 -118 -24 0 -100 40 -220 110 -220z" fill="#f4f7ff"/><rect x="-200" y="-30" width="30" height="100" rx="8" fill="#101535"/><rect x="-235" y="5" width="100" height="30" rx="8" fill="#101535"/><circle cx="170" cy="-16" r="24" fill="#ff6b6b"/><circle cx="226" cy="24" r="24" fill="#34d3ff"/><circle cx="114" cy="24" r="24" fill="#ffd166"/><circle cx="170" cy="64" r="24" fill="#2fd4a7"/><rect x="-46" y="-34" width="92" height="22" rx="11" fill="#c8d1e6"/></g>
      <g transform="translate(860 90)" filter="url(#soft)">${glass(0, 0, 250, 170, 22, { fill: "rgba(255,255,255,.14)" })}<path d="M50 56h24l24 78h86l18 -60H86" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="108" cy="150" r="10" fill="#fff"/><circle cx="174" cy="150" r="10" fill="#fff"/></g>`,
  },
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: W, height: H } });
const tab = await context.newPage();
for (const [name, c] of Object.entries(covers)) {
  await tab.setContent(page(c));
  await tab.screenshot({ path: join(OUT, `${name === "sdlc" ? "sdlc-agents" : name}.jpg`), type: "jpeg", quality: 86 });
  console.log(name);
}
await browser.close();
