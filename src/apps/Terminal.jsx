import { useEffect, useRef, useState } from "react";
import { person, resolve, root } from "../fs.js";
import { useOS } from "../os/store.jsx";

const HOME = [root.name];
const USER = person.name.split(" ")[0].toLowerCase();

const HELP = `Commands:
  ls [folder]      list a folder
  cd <folder>      change folder (cd .. to go up)
  cat <file>       print a document
  open <name>      open a file or folder in its app
  pwd              show the current folder
  whoami           about the owner of this machine
  contact          how to reach me
  clear            clear the screen`;

// Paths are typed relative to the current folder, or from ~ for home.
function target(cwd, arg) {
  if (!arg || arg === "~") return HOME;
  const parts = arg.replace(/^~\/?/, "").split("/").filter(Boolean);
  let path = arg.startsWith("~") ? [...HOME] : [...cwd];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (path.length > 1) path = path.slice(0, -1);
      continue;
    }
    const folder = resolve(path);
    const match = folder?.children?.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!match) return null;
    path = [...path, match.name];
  }
  return path;
}

const quoted = (name) => (name.includes(" ") ? `"${name}"` : name);
const label = (path) => (path.length === 1 ? "~" : path[path.length - 1]);

export default function Terminal() {
  const os = useOS();
  const [cwd, setCwd] = useState(HOME);
  const [lines, setLines] = useState([{ text: `Last login: today on console\nType "help" to see what this terminal can do.` }]);
  const [value, setValue] = useState("");
  const [past, setPast] = useState([]);
  const [cursor, setCursor] = useState(null);
  const input = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw) => {
    const cmd = raw.trim();
    const [name] = cmd.split(/\s+/);
    const arg = cmd.slice(name.length).trim().replace(/^["']|["']$/g, "").replace(/\\ /g, " ");
    const prompt = `${USER}@portfolio ${label(cwd)} % ${raw}`;
    const print = (text) => setLines((l) => [...l, { text: prompt }, ...(text ? [{ text }] : [])]);

    switch (name) {
      case "":
        return print("");
      case "help":
        return print(HELP);
      case "clear":
        return setLines([]);
      case "pwd":
        return print(`/${cwd.join("/")}`);
      case "whoami":
        return print(`${person.name}\n${person.role}\n${person.location}\nOpen to new opportunities and collaborations.`);
      case "contact":
        return print(`Email     ${person.email}\nLinkedIn  ${person.linkedin}\nGitHub    ${person.github}`);
      case "ls": {
        const path = target(cwd, arg || ".");
        const node = path && resolve(path);
        if (!node) return print(`ls: ${arg}: No such file or directory`);
        if (node.kind !== "folder") return print(node.name);
        return print(node.children.map((c) => quoted(c.name) + (c.kind === "folder" ? "/" : "")).join("\n"));
      }
      case "cd": {
        const path = target(cwd, arg);
        const node = path && resolve(path);
        if (!node) return print(`cd: no such file or directory: ${arg}`);
        if (node.kind !== "folder") return print(`cd: not a directory: ${arg}`);
        setCwd(path);
        return print("");
      }
      case "cat": {
        const path = target(cwd, arg);
        const node = path && resolve(path);
        if (!node) return print(`cat: ${arg}: No such file or directory`);
        if (node.kind === "folder") return print(`cat: ${arg}: Is a directory`);
        return print(node.body ?? node.url ?? `cat: ${arg}: Binary file`);
      }
      case "open": {
        const path = target(cwd, arg);
        const node = path && resolve(path);
        if (!node) return print(`open: ${arg}: not found`);
        os.openNode(node, path);
        return print("");
      }
      default:
        return print(`zsh: command not found: ${name}. Try "help".`);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") {
      run(value);
      if (value.trim()) setPast((p) => [...p, value]);
      setValue("");
      setCursor(null);
    } else if (e.key === "ArrowUp" && past.length) {
      e.preventDefault();
      const next = cursor === null ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(past[next]);
    } else if (e.key === "ArrowDown" && cursor !== null) {
      e.preventDefault();
      const next = cursor + 1;
      setCursor(next >= past.length ? null : next);
      setValue(next >= past.length ? "" : past[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [, word = ""] = value.match(/\s(\S*)$/) ?? [];
      const hit = resolve(cwd)?.children?.find((c) => c.name.toLowerCase().startsWith(word.toLowerCase()));
      if (hit && value.includes(" ")) setValue(value.slice(0, value.length - word.length) + quoted(hit.name));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div onClick={() => input.current?.focus()} className="scroller flex-1 overflow-y-auto bg-[#1b1c20] p-2.5 font-mono text-[12.5px] leading-[1.45] text-[#e6e6e6]">
      {lines.map((line, i) => (
        <pre key={i} className="whitespace-pre-wrap break-words font-mono">
          {line.text}
        </pre>
      ))}
      <label className="flex">
        <span className="sr-only">Command</span>
        <span className="whitespace-pre">{`${USER}@portfolio ${label(cwd)} % `}</span>
        <input
          ref={input}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent caret-[#e6e6e6] outline-none"
        />
      </label>
      <div ref={end} />
    </div>
  );
}
