// Records the README's demo: a scripted tour of the site, captured frame by
// frame from a real browser, with a visible cursor. Encode the result with
// tools/encode_demo.py.
//
//   node tools/record_demo.mjs [site url]
//
// Needs Microsoft Edge installed.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const SITE = process.argv[2] ?? "https://jrkrish.github.io/Portfolio-JK/";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "shots", "frames");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
const page = await ctx.newPage();

// Headless browsers draw no pointer, so the tour brings its own.
await page.addInitScript(() => {
  addEventListener("DOMContentLoaded", () => {
    const c = document.createElement("div");
    c.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;will-change:transform";
    c.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 2l15 12h-8l5 8-3 1.500-5-8-4 5z" fill="#000" stroke="#fff" stroke-width="1.500" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(c);
    addEventListener("mousemove", (e) => (c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`), true);
  });
});

const frames = [];
const cdp = await ctx.newCDPSession(page);
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const name = `${String(frames.length).padStart(5, "0")}.jpg`;
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  frames.push({ name, t: metadata.timestamp });
  await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});

let at = { x: 640, y: 420 };
const pause = (ms) => page.waitForTimeout(ms);

async function glide(x, y) {
  const steps = 26;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const e = t * t * (3 - 2 * t);
    await page.mouse.move(at.x + (x - at.x) * e, at.y + (y - at.y) * e);
    await pause(11);
  }
  at = { x, y };
}

async function to(locator) {
  const b = await locator.boundingBox();
  await glide(b.x + b.width / 2, b.y + b.height / 2);
}
async function click(locator, wait = 500) {
  await to(locator);
  await pause(160);
  await page.mouse.click(at.x, at.y);
  await pause(wait);
}
async function doubleClick(locator, wait = 700) {
  await to(locator);
  await pause(160);
  await page.mouse.dblclick(at.x, at.y);
  await pause(wait);
}
const win = (title) => page.locator(`section[data-window][aria-label="${title}"]`);
const dock = (id) => page.locator(`[data-dock="${id}"]`);

await page.goto(SITE);
await page.mouse.move(at.x, at.y);
await page.waitForSelector('button[aria-label^="Enter"]');
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 84, everyNthFrame: 1 });
await pause(1500);

// Unlock, then browse folders to the project covers.
await click(page.locator('button[aria-label^="Enter"]'), 1300);
await doubleClick(win("Home").locator('.grid button:has-text("Projects")'), 600);
await doubleClick(page.locator('section[data-window] .grid button:has-text("AI & LLM")'), 1000);
const shelf = page.locator('section[data-window] button[aria-label="DevPilot"]');
await click(shelf, 800);
await click(page.locator('section[data-window] button[aria-label="SDLC Agents"]'), 800);
await click(page.locator('section[data-window] button[aria-label="FanCare LLM Quality"]'), 700);

// Read a project.
await click(page.locator('section[data-window] button:text-is("Open")'), 700);
await doubleClick(page.locator('section[data-window] .grid button:has-text("README.md")'), 900);
await page.mouse.wheel(0, 300);
await pause(1100);
await click(win("README.md").locator('[aria-label="Close window"]'), 400);

// Ask the Assistant.
await click(dock("assistant"), 600);
await click(page.locator('[aria-label="Ask the assistant"]'), 150);
await page.keyboard.type("Which project uses LangGraph?", { delay: 26 });
await page.keyboard.press("Enter");
await pause(1500);
await page.keyboard.type("What is the CGPA?", { delay: 26 });
await page.keyboard.press("Enter");
await pause(1600);

// Every project, from the Dock.
await click(dock("stack"), 1200);
await to(page.locator('[aria-label="Projects stack"] button:has-text("Spine Segmentation")'));
await pause(500);
await page.keyboard.press("Escape");
await pause(400);

// Terminal, on the same folders.
await click(dock("terminal"), 500);
await page.keyboard.type("whoami", { delay: 45 });
await page.keyboard.press("Enter");
await pause(800);
await page.keyboard.type("ls Projects", { delay: 45 });
await page.keyboard.press("Enter");
await pause(1000);

// All the windows at once.
await page.keyboard.press("F3");
await pause(1500);
await page.keyboard.press("Escape");
await pause(700);

// The resume, then dark mode.
await click(page.locator('[aria-label="Profile"] button:has-text("Resume")'), 1400);
await click(page.locator('[aria-label="Open Control Center"]'), 450);
await click(page.locator('[aria-label="Control Center"] button:has-text("Dark Mode")'), 900);
await page.mouse.click(40, 640);
await pause(1400);

await cdp.send("Page.stopScreencast");
await pause(200);
writeFileSync(join(OUT, "frames.json"), JSON.stringify(frames));
console.log(`${frames.length} frames over ${(frames.at(-1).t - frames[0].t).toFixed(1)}s`);
await browser.close();
