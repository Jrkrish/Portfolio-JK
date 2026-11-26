// The Assistant's brain: BM25 retrieval over the portfolio's own files, run
// entirely in the browser. It only ever answers with text found in those
// files and cites where each passage came from, so it cannot make anything up.

import { EDUCATION, EXPERIENCE, allProjects, pathOfProject, person, resolve, root, walk } from "../fs.js";

const STOP = new Set(
  "a an and are as at be been but by can could did do does for from had has have he her his how i in is it its me my of on or our she so that the their them they this to was we were what when where which who why will with would you your about tell show give any has jayakrishnan jayakrishnans experience work worked project projects done built build using use used".split(" "),
);

// Words a visitor might use, mapped onto words the portfolio uses.
const SYNONYMS = {
  rag: ["retrieval", "citations"],
  llm: ["llm", "agent", "gemini", "groq"],
  agents: ["agent", "langgraph"],
  ml: ["model", "pytorch"],
  cv: ["vision", "yolov8"],
  vision: ["yolov8", "opencv"],
  testing: ["evals", "eval", "quality", "pytest", "playwright"],
  qa: ["quality", "testing", "evals"],
  evaluation: ["evals", "eval"],
  medical: ["spine", "skin", "imaging"],
  healthcare: ["spine", "skin", "imaging"],
  frontend: ["react", "next.js", "tailwind"],
  backend: ["fastapi", "flask", "postgresql"],
  internship: ["intern", "experience"],
  job: ["intern", "experience"],
  payment: ["razorpay"],
  cloud: ["aws", "docker"],
  devops: ["docker", "github", "actions", "ci"],
};

const stem = (w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9.+#-]+/g) ?? [])
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

const clean = (s) => s.replace(/^- /, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

const TOPICS = { AI: "ai llm agent machine learning", Vision: "computer vision image detection segmentation", Web: "web website frontend" };

function buildIndex() {
  const passages = [];
  const add = (text, title, node, path, extra = "") => {
    const tokens = tokenize(`${title} ${text} ${extra}`);
    passages.push({ text, title, node, path, tokens, tf: tokens.reduce((m, t) => ({ ...m, [t]: (m[t] ?? 0) + 1 }), {}) });
  };

  // A project is one searchable unit: its whole README, shown as its summary.
  for (const project of allProjects) {
    const readme = project.children.find((c) => c.kind === "markdown");
    const path = [...pathOfProject(project.name), readme.name];
    add(project.summary, project.name, readme, path, `${readme.body} ${project.stack.join(" ")} ${TOPICS[project.tag]}`);
  }
  for (const { node, path } of walk()) {
    if (node.kind !== "markdown" || path[1] === "Projects") continue;
    const name = path[1];
    if (name !== "Experience" && name !== "Skills") continue;
    const title = node.name.replace(/\.md$/, "");
    const body = node.body.split(/\n\n+/).filter((b) => !b.startsWith("#")).map((b) => b.split("\n").map(clean).join(", ")).join(" ");
    add(body, title, node, path);
  }

  const df = {};
  for (const p of passages) for (const t of Object.keys(p.tf)) df[t] = (df[t] ?? 0) + 1;
  const avg = passages.reduce((n, p) => n + p.tokens.length, 0) / passages.length;
  return { passages, df, avg };
}

const index = buildIndex();

function search(query, limit = 4) {
  const words = tokenize(query);
  const terms = [...new Set(words.flatMap((w) => [w, ...(SYNONYMS[w] ?? []).map(stem)]))];
  const N = index.passages.length;
  const k1 = 1.4;
  const b = 0.6;

  const scored = index.passages
    .map((p) => {
      let score = 0;
      for (const t of terms) {
        const tf = p.tf[t];
        if (!tf) continue;
        const idf = Math.log(1 + (N - index.df[t] + 0.5) / (index.df[t] + 0.5));
        const norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * p.tokens.length) / index.avg));
        score += idf * norm * (words.includes(t) ? 1 : 0.6);
      }
      return { p, score };
    })
    .filter((r) => r.score > 1)
    .sort((x, y) => y.score - x.score);

  // Weak matches next to a strong one are noise, not extra evidence.
  const best = scored[0]?.score ?? 0;
  return scored.filter((r) => r.score >= best * 0.45).slice(0, limit).map((r) => r.p);
}

const fileAt = (...names) => {
  const path = [root.name, ...names];
  return { name: names[names.length - 1].replace(/\.md$/, ""), node: resolve(path), path };
};

const INTENTS = [
  {
    test: /^(hi|hello|hey|namaste|vanakkam)\b/i,
    answer: () => ({ text: "Hello. Ask me about Jayakrishnan's projects, skills, experience or education. Every answer comes from the files on this desktop, and I'll show you where." }),
  },
  {
    test: /\b(contact|email|e-mail|reach|linkedin|phone|call|get in touch)\b/i,
    answer: () => ({
      text: `You can reach Jayakrishnan at ${person.email}, or on LinkedIn. Mail on this desktop sends a message directly.`,
      sources: [fileAt("Contact")],
      action: { label: "Open Mail", app: "mail" },
    }),
  },
  {
    // Not "sponsor": recruiters ask about visa sponsorship.
    test: /\b(coffee|donat\w*|tip jar|buy (him|you) a)\b/i,
    answer: () => ({
      text: `If something here helped you, you can buy Jayakrishnan a coffee at ${person.coffee.replace(/^https:\/\//, "")}. Never expected, always appreciated.`,
      sources: [fileAt("Contact", "Buy Me a Coffee.webloc")],
    }),
  },
  {
    test: /\b(cgpa|gpa|grade|marks|degree|college|university|graduat\w*|education|stud(y|ied))\b/i,
    answer: () => ({ text: `${EDUCATION.degree}, ${EDUCATION.college}, ${EDUCATION.place}. ${EDUCATION.status}, with a CGPA of ${EDUCATION.cgpa}.`, sources: [fileAt("Education", "B.Tech Information Technology.md")] }),
  },
  {
    test: /\b(where|location|based|live|from)\b.*\b(based|live|from|located|you|he|she|they|jayakrishnan)?\b/i,
    only: /\b(where|location|based)\b/i,
    answer: () => ({ text: `Jayakrishnan is based in ${person.location}.`, sources: [fileAt("About Me.md")] }),
  },
  {
    test: /\b(available|open to|looking for|hire|hiring|opportunit\w*|freelance)\b/i,
    answer: () => ({ text: "Yes. Jayakrishnan is open to new opportunities and collaborations.", sources: [fileAt("About Me.md")], action: { label: "Get in touch", app: "mail" } }),
  },
  {
    test: /^(what|show|tell|list|any|where|has|have)?\b.*\b(experience|internships?|career|worked)\b[^a-z]*$/i,
    answer: () => ({
      text: `Jayakrishnan has worked as ${EXPERIENCE.map((e) => `${e.title} at ${e.org} (${e.period})`).join(", ")}.`,
      sources: [fileAt("Experience")],
    }),
  },
  {
    test: /\b(how many|list|all)\b.*\bprojects?\b|\bwhat projects?\b|^projects?$/i,
    answer: () => ({ text: `There are ${allProjects.length} projects on this desktop: ${allProjects.map((p) => p.name).join(", ")}.`, sources: [fileAt("Projects")] }),
  },
  {
    test: /\b(skills?|tech stack|technolog\w*|tools|languages?)\b/i,
    answer: () => ({
      text: "Python, TypeScript, JavaScript, SQL and PHP, across AI and agents, computer vision, full-stack web, and testing. The Skills folder has the full list.",
      sources: [fileAt("Skills")],
    }),
  },
];

export const SUGGESTIONS = ["What is the CGPA?", "Show experience with RAG", "Any computer vision work?", "Is Jayakrishnan available?"];

export function ask(question) {
  const q = question.trim();
  const intent = INTENTS.find((i) => i.test.test(q) && (!i.only || i.only.test(q)));
  if (intent) return intent.answer();

  const hits = search(q);
  if (hits.length === 0) {
    return { text: "I couldn't find that in this portfolio, and I only answer from what's here. Try asking about a project, a skill or a past role." };
  }
  return {
    text: hits.length === 1 ? "This is the closest match in the portfolio:" : `I found ${hits.length} matches in the portfolio:`,
    points: hits.slice(0, 3).map((h) => `${h.title}: ${h.text}`),
    sources: hits.slice(0, 3).map((h) => ({ name: h.title, node: h.node, path: h.path })),
  };
}
