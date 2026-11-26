// The portfolio as a file system. All of the site's content lives here:
// edit this file, not the components.
//
// A node is a folder (children), a markdown document (body), an image (src),
// a link (url) or an app shortcut (app).

export const person = {
  name: "Jayakrishnan B",
  role: "AI & Full-Stack Developer",
  location: "Tamil Nadu, India",
  email: "jayakrishxn@gmail.com",
  linkedin: "https://www.linkedin.com/in/krishinfowork/",
  github: "https://github.com/Jrkrish",
  coffee: "https://buymeacoffee.com/jrkrish",
  // Formspree endpoint carried over from the previous site.
  formEndpoint: "https://formspree.io/f/meoqnznv",
};

export const EDUCATION = {
  degree: "B.Tech Information Technology",
  college: "Sri Manakula Vinayagar Engineering College",
  place: "Puducherry",
  status: "Graduated 2026",
  cgpa: "7.90",
};

export const EXPERIENCE = [
  {
    title: "Gen AI Intern", org: "Flaunch IO", period: "2024", year: 2024,
    text: "Explored and applied generative AI technologies: transformer architectures, prompt engineering and fine-tuning of models, and building applications on them.",
  },
  {
    title: "Full Stack Intern", org: "Corizo Edutech", period: "2024", year: 2024,
    text: "Hands-on experience across front-end and back-end development, contributing to building and maintaining web applications.",
  },
  {
    title: "Creators of Metaverse", org: "Flaunch IO", period: "2023", year: 2023,
    text: "Gained real-world AR experience through project-based assignments.",
  },
];

export const SKILLS = {
  Languages: ["Python", "TypeScript", "JavaScript", "SQL", "PHP"],
  "AI and Agents": ["LangGraph", "Hybrid RAG", "Tool calling", "Gemini", "Groq"],
  "Computer Vision": ["YOLOv8", "PyTorch", "OpenCV", "ONNX Runtime", "Streamlit"],
  Web: ["Next.js", "React", "FastAPI", "Flask", "Tailwind CSS", "PostgreSQL", "Redis"],
  "Testing and Quality": ["DeepEval", "promptfoo", "pytest", "Playwright", "CI regression gates"],
  Tools: ["Docker", "AWS", "GitHub Actions", "Vercel", "Git"],
};

const folder = (name, children, extra = {}) => ({ kind: "folder", name, children, ...extra });
const doc = (name, body, extra = {}) => ({ kind: "markdown", name, body, ...extra });
const link = (name, url, extra = {}) => ({ kind: "link", name, url, ...extra });
const image = (name, src, alt, extra = {}) => ({ kind: "image", name, src, alt, ...extra });

const repo = (name) => `https://github.com/Jrkrish/${name}`;

function project({ name, tag, year, summary, points, stack, url, urlLabel = "View on GitHub", shot }) {
  const alt = `Cover illustration for ${name}`;
  const body = [
    `# ${name}`,
    `![${alt}](previews/${shot})`,
    summary,
    "## Highlights",
    ...points.map((p) => `- ${p}`),
    "## Built with",
    stack.join(", "),
    `[${urlLabel}](${url})`,
  ].join("\n\n");
  return folder(
    name,
    [
      doc("README.md", body, { tag, year }),
      image("Cover.jpg", `previews/${shot}`, alt, { tag, year }),
      link(`${urlLabel.replace("View on ", "")}.webloc`, url, { tag, year }),
    ],
    { tag, year, summary, stack },
  );
}

const aiProjects = [
  project({
    name: "FanCare LLM Quality", tag: "AI", year: 2026, shot: "fancare.jpg",
    summary: "A RAG and tool-calling support assistant, wrapped in an automated quality platform built for non-deterministic outputs.",
    points: [
      "Answers from product documentation with citations, and calls tools for orders, warranty and support tickets",
      "Reads uploaded warranty cards with OCR",
      "Golden-set evaluations with repeated runs, thresholds and variance",
      "Red-team attacks, a regression gate in CI, and drift monitoring",
    ],
    stack: ["FastAPI", "DeepEval", "promptfoo", "GitHub Actions"], url: repo("fancare-llm-quality"),
  }),
  project({
    name: "DevPilot", tag: "AI", year: 2026, shot: "devpilot.jpg",
    summary: "Automates the software lifecycle end to end, from one requirement through to delivered artifacts.",
    points: [
      "State-driven LangGraph workflow with conditional routing",
      "Generates user stories, design documents, code, security recommendations and test cases",
      "Human-in-the-loop review with approve or feedback at each stage",
      "Redis-backed state, with Markdown artifacts for every phase",
    ],
    stack: ["LangGraph", "Redis", "Python"], url: repo("Devpilot-SDLC"),
  }),
  project({
    name: "SDLC Agents", tag: "AI", year: 2025, shot: "sdlc-agents.jpg",
    summary: "A team of AI agents, each responsible for one step of the development lifecycle.",
    points: [
      "Choice of Gemini, Groq or OpenAI models",
      "Produces user stories, specifications, code, tests and a production-readiness assessment",
      "Runs as a Streamlit application",
    ],
    stack: ["Python", "Streamlit", "Gemini", "Groq"], url: repo("SDLC-Agents"),
  }),
  project({
    name: "AI Resume Generator", tag: "AI", year: 2025, shot: "resume.jpg",
    summary: "Creates professional, ATS-friendly resumes in minutes.",
    points: ["Gemini generates the resume content", "Instant PDF download rendered with PDFKit", "Razorpay payments with multiple pricing tiers"],
    stack: ["Flask", "Gemini API", "Razorpay", "Tailwind CSS"], url: repo("Resume"),
  }),
  project({
    name: "Code Assistant", tag: "AI", year: 2024, shot: "code-assistant.jpg",
    summary: "Helps developers understand how their code works and find what is wrong with it.",
    points: ["Breaks down code logic and identifies errors", "Gives clear guidance for fixing bugs and improving code quality"],
    stack: ["Python", "Flask", "Groq"], url: repo("Code-Explanation-and-Debugging-Assistant"),
  }),
  project({
    name: "Finetuned LLM", tag: "AI", year: 2024, shot: "finetuned-llm.jpg",
    summary: "A Llama 2 7B model fine-tuned as a cricket chat assistant.",
    points: ["Fine-tuned model served through a Streamlit chat interface", "Generation tuned for sampling temperature and response length"],
    stack: ["Transformers", "PyTorch", "Streamlit"], url: "https://github.com/Jrkrish/Krish-Projects/tree/main/Finetuned%20LLM",
  }),
  project({
    name: "Smart Recipe Planner", tag: "AI", year: 2024, shot: "recipe.jpg",
    summary: "Plans a week of meals around dietary needs, cuisine preferences and skill level.",
    points: ["Recipe generation and weekly meal planning", "Cuisine fusion and nutritional analysis", "Generates a shopping list"],
    stack: ["Python", "Groq"], url: repo("Smart-Recipe-Planner"),
  }),
];

const visionProjects = [
  project({
    name: "Spine Segmentation", tag: "Vision", year: 2025, shot: "spine.jpg",
    summary: "Detects the L1 to L5 vertebrae and the S1 sacrum on spine scans.",
    points: ["YOLOv8 model drawing a labelled box around each part", "Reduces manual annotation work in medical imaging", "Streamlit interface for uploading scans"],
    stack: ["YOLOv8", "Python", "Streamlit"], url: repo("Yolo-Spine"),
  }),
  project({
    name: "Wrinkle Detection", tag: "Vision", year: 2024, shot: "wrinkles.jpg",
    summary: "Instance segmentation of facial wrinkles.",
    points: ["YOLOv8s segmentation fine-tuned on three classes: forehead, frown and wrinkle", "Upload an image in the Streamlit app to see the masks"],
    stack: ["YOLOv8", "OpenCV", "Streamlit"], url: repo("Wrinkle-Detection"),
  }),
  project({
    name: "Skin Cancer Prediction", tag: "Vision", year: 2025, shot: "skin.jpg",
    summary: "Classifies an uploaded image of a skin lesion.",
    points: ["Trained model served through a Flask web application"],
    stack: ["Flask", "Python", "Jupyter"], url: repo("Skin-Cancer-Prediction"),
  }),
];

const webProjects = [
  project({
    name: "Studio Infinity", tag: "Web", year: 2025, shot: "studio.jpg",
    summary: "A modern, minimalist website for a digital studio.",
    points: ["Responsive design with smooth animations and a custom cursor", "Filterable portfolio and a validated contact form"],
    stack: ["Next.js 15", "TypeScript", "Tailwind CSS"], url: "https://company-portfolio-sage.vercel.app/", urlLabel: "Live Site",
  }),
  project({
    name: "Game Store", tag: "Web", year: 2024, shot: "game-store.jpg",
    summary: "A game-console e-commerce site.",
    points: ["Built with PHP"],
    stack: ["PHP", "Bootstrap"], url: repo("PHP-game-space"),
  }),
];

const role = (name, title, org, period, text, year) =>
  doc(`${name}.md`, `# ${title}\n\n**${org}** · ${period}\n\n${text}`, { year });

const skill = (name, items) => doc(`${name}.md`, `# ${name}\n\n${items.map((i) => `- ${i}`).join("\n")}`);

export const root = folder("Portfolio", [
  doc(
    "About Me.md",
    `# ${person.name}

![Portrait of Jayakrishnan](about/avatar.jpg)

**${person.role}** · ${person.location}

I build AI applications, computer-vision models and full-stack web products, and I test them until they break.

My recent work focuses on LLM agents and on how to measure them: retrieval with citations, tool calling, evaluation suites, red-teaming and regression gates in CI.

## Education

${EDUCATION.degree}, ${EDUCATION.college}, ${EDUCATION.place}. ${EDUCATION.status}, CGPA ${EDUCATION.cgpa}.

## Languages

English, Tamil.

## Status

Open to new opportunities and collaborations.`,
  ),
  image("Jayakrishnan.jpg", "about/portrait.jpg", "Portrait of Jayakrishnan in a lime green T-shirt"),
  { kind: "resume", name: "Resume.pdf" },
  folder("Projects", [
    folder("AI & LLM", aiProjects, { tag: "AI" }),
    folder("Computer Vision", visionProjects, { tag: "Vision" }),
    folder("Web", webProjects, { tag: "Web" }),
  ]),
  folder("Experience", EXPERIENCE.map((e) => role(e.title, e.title, e.org, e.period, e.text, e.year))),
  folder("Skills", Object.entries(SKILLS).map(([name, items]) => skill(name, items))),
  folder("Education", [
    doc(
      `${EDUCATION.degree}.md`,
      `# ${EDUCATION.degree}\n\n**${EDUCATION.college}**, ${EDUCATION.place}\n\n${EDUCATION.status}\n\nCGPA ${EDUCATION.cgpa}`,
    ),
  ]),
  folder("Contact", [
    { kind: "app", name: "Send a Message", app: "mail" },
    link("LinkedIn.webloc", person.linkedin),
    link("GitHub.webloc", person.github),
    link("Buy Me a Coffee.webloc", person.coffee),
  ]),
]);

export const trash = folder("Trash", []);

// ---------------------------------------------------------------- lookups

export function resolve(path) {
  let node = root;
  for (const name of path.slice(1)) {
    node = node.children?.find((c) => c.name === name);
    if (!node) return null;
  }
  return node;
}

// Every node, with its path, for Spotlight and the Terminal.
export function walk(node = root, path = [root.name], out = []) {
  for (const child of node.children ?? []) {
    const childPath = [...path, child.name];
    out.push({ node: child, path: childPath });
    if (child.kind === "folder") walk(child, childPath, out);
  }
  return out;
}

export const allProjects = [...aiProjects, ...visionProjects, ...webProjects];

export function pathOfProject(name) {
  return walk().find((e) => e.node.kind === "folder" && e.node.name === name)?.path;
}
