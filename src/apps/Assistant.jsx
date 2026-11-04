import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useOS } from "../os/store.jsx";
import { SUGGESTIONS, ask } from "./assistant-engine.js";

const WELCOME = {
  from: "bot",
  text: "Hi, I'm the assistant on this desktop. Ask me anything about Jayakrishnan's work. I answer only from the files here, and I cite them.",
};

function Bubble({ msg, onOpen, onApp }) {
  const mine = msg.from === "me";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div className={`max-w-[84%] rounded-[18px] px-3.5 py-2 text-[13.5px] leading-snug ${mine ? "bg-[var(--accent)] text-white" : "bg-[var(--hover)]"}`}>
        {msg.text}
        {msg.points && (
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4">
            {msg.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
      {(msg.sources?.length > 0 || msg.action) && (
        <div className="mt-1.5 flex max-w-[84%] flex-wrap items-center gap-1.5">
          {msg.sources?.length > 0 && <span className="text-[11px] text-[var(--text-3)]">Sources</span>}
          {msg.sources?.map((s) => (
            <button key={s.path.join("/")} type="button" onClick={() => onOpen(s)} className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[11.5px] hover:bg-[var(--hover)]">
              {s.name}
            </button>
          ))}
          {msg.action && (
            <button type="button" onClick={() => onApp(msg.action.app)} className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11.5px] font-medium text-white">
              {msg.action.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Assistant({ question }) {
  const os = useOS();
  const [messages, setMessages] = useState([WELCOME]);
  const [value, setValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const end = useRef(null);
  const lastQuestion = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text) => {
    const q = text.trim();
    if (!q || thinking) return;
    setValue("");
    setMessages((m) => [...m, { from: "me", text: q }]);
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", ...ask(q) }]);
      setThinking(false);
    }, 420);
  };

  // Spotlight hands questions over as a prop.
  useEffect(() => {
    if (question && question !== lastQuestion.current) {
      lastQuestion.current = question;
      send(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--paper)]">
      <div className="scroller flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} onOpen={(s) => os.openNode(s.node, s.path)} onApp={(app) => os.openApp(app)} />
        ))}
        {thinking && (
          <div className="flex w-fit gap-1 rounded-[18px] bg-[var(--hover)] px-3.5 py-3" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--text-3)]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16 }} />
            ))}
          </div>
        )}
        {messages.length === 1 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[12px] hover:bg-[var(--hover)]">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="flex flex-none items-center gap-2 border-t border-[var(--line)] p-2.5"
      >
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ask about projects, skills or experience" aria-label="Ask the assistant" className="min-w-0 flex-1 rounded-full bg-[var(--hover)] px-3.5 py-1.5 text-[13px] outline-none placeholder:text-[var(--text-3)]" />
        <button type="submit" disabled={!value.trim()} aria-label="Send" className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-40">
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
            <path d="M6.500 11V2M2.500 6l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
      <p className="flex-none pb-1.5 text-center text-[10.5px] text-[var(--text-3)]">Search-based and private: it runs in your browser and answers only from these files.</p>
    </div>
  );
}
