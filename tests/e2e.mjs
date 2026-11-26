import { chromium } from "playwright-core";

const URL = process.env.SITE ?? "http://localhost:5199/Portfolio-JK/";
const OUT = new globalThis.URL("./shots/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const results = [];
const check = (name, ok, note = "") => {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${note ? `  (${note})` : ""}`);
};

const browser = await chromium.launch({ channel: "msedge", headless: true });

async function open(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, colorScheme: "light", ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(URL);
  return { page, errors, ctx };
}

const shot = (page, name) => page.screenshot({ path: `${OUT}${name}.png` });
const box = (page, title) => page.locator(`section[data-window][aria-label="${title}"]`).boundingBox();
const titles = (page) => page.locator("section[data-window]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));

// ---------------------------------------------------------------- desktop
{
  const { page, errors, ctx } = await open({ width: 1440, height: 860 });
  await page.waitForSelector('button[aria-label^="Enter"]', { timeout: 1500 });
  check("opens straight on the lock screen, with no loading screen", true);
  await page.waitForTimeout(500);
  await shot(page, "01-lock");
  const photo = await page.locator('button[aria-label^="Enter"] img').evaluate((i) => i.complete && i.naturalWidth > 0);
  check("lock screen shows the photo", photo);
  check("nothing calls the owner JB", !/\bJB\b|J\.B\./.test(await page.locator("body").innerText()));
  await page.keyboard.press("Enter");
  await page.waitForSelector('section[aria-label="Home"]', { timeout: 4000 });
  await page.waitForTimeout(800);
  check("unlocking opens Finder", (await titles(page)).includes("Home"));
  const desktopText = await page.locator("body").innerText();
  check("no JB anywhere on the desktop", !/\bJB\b|J\.B\./.test(desktopText));
  check("no GitHub live widget", !/GitHub, live/i.test(desktopText));
  check("profile widget shows the photo", await page.locator('[aria-label="Profile"] img').evaluate((i) => i.complete && i.naturalWidth > 0));

  // Launchpad
  await page.click('[data-dock="launchpad"]');
  await page.waitForTimeout(500);
  await shot(page, "02-launchpad");
  check("Launchpad opens", await page.locator('[role="dialog"][aria-label="Launchpad"]').isVisible());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // Notification Center
  await page.click('[aria-label="Open Notification Center"]');
  await page.waitForTimeout(700);
  await shot(page, "03-notifications");
  check("Notification Center opens", await page.locator('[aria-label="Notification Center"]').isVisible());
  await page.mouse.click(700, 500);
  await page.waitForTimeout(400);

  // Finder context menu and Get Info
  await page.click('section[aria-label="Home"] .grid button:has-text("Projects")', { button: "right" });
  await page.waitForTimeout(250);
  await page.click('[role="menuitem"]:has-text("Get Info")');
  await page.waitForTimeout(500);
  check("Get Info opens from right-click", (await titles(page)).includes("Projects Info"));
  await page.click('section[aria-label="Projects Info"] [aria-label="Close window"]');
  await page.waitForTimeout(300);

  // Quick Look with the keyboard
  await page.click('section[aria-label="Home"] .grid button:has-text("About Me.md")');
  await page.keyboard.press("Space");
  await page.waitForTimeout(400);
  await shot(page, "04-quicklook");
  check("Space opens Quick Look", await page.locator('[aria-label^="Quick Look"]').isVisible());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // New apps, then Mission Control over real windows
  for (const app of ["calendar", "activity", "photos"]) {
    await page.click(`[data-dock="${app}"]`);
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(1000);
  await shot(page, "05-apps");
  const rows = await page.locator('section[aria-label="Activity Monitor"] tbody tr').count();
  check("Activity Monitor shows live repos", rows > 10, `${rows} rows`);

  await page.keyboard.press("F3");
  await page.waitForTimeout(900);
  await shot(page, "06-mission");
  const small = await box(page, "Photos");
  check("Mission Control scales real windows", small.width < 600, `Photos ${Math.round(small.width)}px wide`);
  await page.mouse.click(small.x + small.width / 2, small.y + small.height / 2);
  await page.waitForTimeout(700);
  const back = await box(page, "Photos");
  check("clicking a window leaves Mission Control", back.width > 700, `Photos ${Math.round(back.width)}px wide`);

  // Genie: catch it mid-flight, then confirm it lands in the Dock
  await page.click('section[aria-label="Photos"] [aria-label="Minimize window"]');
  await page.waitForTimeout(170);
  await shot(page, "07-genie");
  await page.waitForTimeout(600);
  await shot(page, "08-minimized");
  check("minimized window appears in the Dock", await page.locator('button[aria-label="Restore Photos"]').isVisible());
  await page.click('button[aria-label="Restore Photos"]');
  await page.waitForTimeout(700);
  const restored = await box(page, "Photos");
  check("restoring brings the window back", restored.width > 700);

  // Snap: drag a real window to the left edge
  await page.click('section[aria-label="Photos"] [aria-label="Close window"]');
  await page.waitForTimeout(300);
  const cal = await box(page, "Activity Monitor");
  await page.mouse.move(cal.x + cal.width / 2, cal.y + 16);
  await page.mouse.down();
  await page.mouse.move(300, 400, { steps: 8 });
  await page.mouse.move(2, 400, { steps: 8 });
  await page.waitForTimeout(250);
  await shot(page, "09-snap-preview");
  await page.mouse.up();
  await page.waitForTimeout(500);
  const snapped = await box(page, "Activity Monitor");
  check("dragging to the edge tiles the window", snapped.x === 0 && snapped.width === 720, `${snapped.x},${snapped.width}`);

  // Resize from a corner
  const b = await box(page, "Calendar");
  await page.mouse.move(b.x + b.width - 1, b.y + b.height - 1);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width - 121, b.y + b.height - 81, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const r = await box(page, "Calendar");
  check("corner resize works", Math.abs(r.width - (b.width - 120)) < 6, `${b.width} to ${r.width}`);

  // Spotlight with the real keyboard
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(300);
  await page.keyboard.type("langgraph");
  await page.waitForTimeout(300);
  await shot(page, "10-spotlight");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  check("Spotlight opens a result", (await titles(page)).length >= 3, (await titles(page)).join(", "));

  // Terminal
  await page.click('[data-dock="terminal"]');
  await page.waitForTimeout(500);
  await page.keyboard.type("open About");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  check("Terminal tab-completes and opens a file", (await titles(page)).includes("About Me.md"));

  // Dark mode, whole desktop
  await page.click('[aria-label="Open Control Center"]');
  await page.waitForTimeout(300);
  await page.click('[aria-label="Control Center"] button:has-text("Dark Mode")');
  await page.waitForTimeout(800);
  await page.mouse.click(30, 700);
  await page.waitForTimeout(300);
  await shot(page, "11-dark");

  // Restart goes through boot and lock again
  await page.click('button[aria-label="Portfolio menu"]');
  await page.click('[role="menuitem"]:has-text("Restart")');
  await page.waitForSelector('button[aria-label^="Enter"]', { timeout: 6000 });
  check("Restart returns to the lock screen", true);

  check("no console errors on desktop", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- content and new apps
{
  const { page, errors, ctx } = await open({ width: 1440, height: 900 });
  await page.waitForSelector('button[aria-label^="Enter"]', { timeout: 6000 });
  await page.keyboard.press("Enter");
  await page.waitForSelector('section[aria-label="Home"]', { timeout: 4000 });
  await page.waitForTimeout(900);

  // Project covers, in the gallery view project lists open with
  await page.dblclick('section[aria-label="Home"] .grid button:has-text("Projects")');
  await page.waitForTimeout(300);
  await page.dblclick('section[data-window] .grid button:has-text("AI & LLM")');
  await page.waitForTimeout(700);
  check("project lists open in Gallery", (await page.locator('[aria-label="View as Gallery"]').getAttribute("aria-pressed")) === "true");
  const covers = await page.locator('section[data-window] img[src*="previews/"]').evaluateAll((imgs) => imgs.map((i) => i.complete && i.naturalWidth > 0));
  check("project covers load", covers.length >= 7 && covers.every(Boolean), `${covers.length} images`);
  await shot(page, "30-gallery");

  // Education facts
  await page.click('section[data-window] button:has-text("Education")');
  await page.waitForTimeout(350);
  await page.dblclick('section[data-window] .grid button:has-text("B.Tech")');
  await page.waitForTimeout(500);
  const edu = await page.locator('section[aria-label="B.Tech Information Technology.md"]').innerText();
  check("Education shows CGPA 7.90 and graduation", edu.includes("7.90") && edu.includes("Graduated 2026"));
  const whole = await page.locator("body").innerText();
  check("the old CGPA is gone", !whole.includes("7.74"));

  // Contact: the coffee link opens a page that leads to the real site
  await page.getByRole("button", { name: "Go", exact: true }).click();
  await page.click('[role="menuitem"]:has-text("Contact")');
  await page.waitForTimeout(500);
  await page.dblclick('section[aria-label="Contact"] .grid button:has-text("Buy Me a Coffee")');
  await page.waitForTimeout(600);
  const coffee = page.locator('section[aria-label="Browser"]');
  check(
    "Contact's Buy Me a Coffee link leads to the page",
    (await coffee.locator('h2:has-text("Buy Me a Coffee")').count()) === 1 &&
      (await coffee.locator('a[href="https://buymeacoffee.com/jrkrish"][target="_blank"]').count()) === 1,
  );
  await shot(page, "34-coffee");

  // Assistant: answers, cites, and refuses to invent
  await page.click('[data-dock="assistant"]');
  await page.waitForTimeout(500);
  const asks = async (q) => {
    await page.fill('[aria-label="Ask the assistant"]', q);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    return page.locator('section[aria-label="Assistant"] [role="log"]').innerText();
  };
  let log = await asks("What is the CGPA?");
  check("Assistant answers the CGPA with a source", log.includes("7.90") && log.includes("Sources"));
  log = await asks("Show experience with RAG");
  {
    const ans = log.split("Show experience with RAG")[1] ?? "";
    check("Assistant's RAG answer is relevant", /FanCare/.test(ans) && !/Metaverse/.test(ans), ans.replace(/\s+/g, " ").slice(0, 110));
  }
  log = await asks("Any computer vision work?");
  {
    const ans = log.split("Any computer vision work?")[1] ?? "";
    const names = ["Spine Segmentation", "Wrinkle Detection", "Skin Cancer Prediction"].filter((n) => ans.includes(n));
    check("Assistant lists vision projects without repeats", names.length >= 2 && (ans.match(/Wrinkle Detection:/g) ?? []).length <= 1, names.join(", "));
  }
  log = await asks("What internships has Jayakrishnan done?");
  check("Assistant summarises experience", /Flaunch IO/.test(log.split("internships has")[1] ?? ""));
  log = await asks("Which project uses LangGraph?");
  check("Assistant finds a project by tool", /DevPilot/.test(log.split("uses LangGraph?")[1] ?? ""));
  log = await asks("Can I buy you a coffee?");
  check("Assistant points to the coffee page", /buymeacoffee\.com\/jrkrish/.test(log.split("buy you a coffee?")[1] ?? ""));
  log = await asks("Does he need visa sponsorship?");
  check("a visa sponsorship question doesn't get the coffee answer", !/buymeacoffee/.test(log.split("visa sponsorship?")[1] ?? ""));
  log = await asks("What is the capital of France?");
  check("Assistant refuses to invent answers", (log.split("capital of France?")[1] ?? "").includes("couldn't find"));
  await shot(page, "31-assistant");
  await page.locator('section[aria-label="Assistant"] button:has-text("Open Mail"), section[aria-label="Assistant"] [role="log"] button').first().isVisible();

  // Dock stack
  await page.click('[data-dock="stack"]');
  await page.waitForTimeout(900);
  await shot(page, "32-stack");
  const fans = await page.locator('[aria-label="Projects stack"] button').count();
  check("Dock stack fans out every project", fans === 12, String(fans));
  await page.click('[aria-label="Projects stack"] button:has-text("Spine Segmentation")');
  await page.waitForTimeout(600);
  check("stack opens a project", (await titles(page)).includes("Spine Segmentation"));

  // Resume
  await page.click('button:has-text("Resume")');
  await page.waitForTimeout(700);
  await shot(page, "33-resume");
  const sheet = await page.locator('section[aria-label="Resume.pdf"]').innerText();
  check("Resume shows education and no phone number", sheet.includes("CGPA 7.90") && !/\+91|\b\d{10}\b/.test(sheet));
  await page.emulateMedia({ media: "print" });
  const printed = await page.locator(".print-only").isVisible();
  check("Save as PDF prints only the resume", printed && !(await page.locator("#root").isVisible()));
  await page.pdf({ path: `${OUT}resume.pdf`, format: "A4", printBackground: true });
  await page.emulateMedia({ media: "screen" });

  check("no console errors in new apps", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

{
  // Icons, on a clear desktop
  const { page, errors, ctx } = await open({ width: 1440, height: 900 });
  await page.waitForSelector('button[aria-label^="Enter"]', { timeout: 6000 });
  await page.keyboard.press("Enter");
  await page.waitForSelector('section[aria-label="Home"]', { timeout: 4000 });
  await page.waitForTimeout(600);
  await page.click('section[aria-label="Home"] [aria-label="Close window"]');
  await page.waitForTimeout(400);
  const icon = page.locator('[data-desktop-icon="Skills"]');
  const a = await icon.boundingBox();
  await page.mouse.move(a.x + 40, a.y + 30);
  await page.mouse.down();
  await page.mouse.move(800, 300, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const b = await icon.boundingBox();
  check("desktop icons can be dragged", Math.abs(b.x - a.x) > 200, `${Math.round(a.x)} to ${Math.round(b.x)}`);
  await icon.dblclick();
  await page.waitForTimeout(600);
  check("a dragged icon still opens", (await titles(page)).includes("Skills"));
  check("no console errors with icons", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- phone
{
  const { page, errors, ctx } = await open({ width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await page.waitForSelector('button[aria-label^="Enter"]', { timeout: 6000 });
  await page.waitForTimeout(300);
  await shot(page, "20-phone-lock");
  await page.tap('button[aria-label^="Enter"]');
  await page.waitForTimeout(900);
  await shot(page, "21-phone-desktop");
  const dock = await page.locator('nav[aria-label="Dock"]').evaluate((n) => ({ sw: n.scrollWidth, cw: n.clientWidth }));
  check("phone Dock fits without scrolling", dock.sw <= dock.cw, `${dock.sw}/${dock.cw}`);
  await page.tap('li button:has-text("Projects")');
  await page.waitForTimeout(600);
  await page.tap('section[aria-label="Projects"] .grid button:has-text("AI & LLM")');
  await page.waitForTimeout(400);
  await page.tap('section[data-window] .grid button:has-text("DevPilot")');
  await page.waitForTimeout(400);
  await shot(page, "22-phone-finder");
  await page.tap('section[data-window] .grid button:has-text("README.md")');
  await page.waitForTimeout(600);
  await shot(page, "23-phone-doc");
  check("phone taps open folders and documents", (await titles(page)).includes("README.md"));
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  check("no sideways scroll on phone", w <= 390, String(w));
  check("no console errors on phone", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("PASS")).length}/${results.length} passed`);
