import { useState } from "react";
import { person } from "../fs.js";
import { useOS } from "../os/store.jsx";

const row = "flex items-center gap-2 border-b border-[var(--line)] px-4 py-1.5 text-[13px]";
const input = "min-w-0 flex-1 bg-transparent outline-none";

export default function Mail() {
  const os = useOS();
  const [status, setStatus] = useState("idle");

  const send = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(person.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus("idle");
      os.notify({ title: "Message Sent", body: `Thank you. ${person.name.split(" ")[0]} will reply by email.` });
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={send} className="flex min-h-0 flex-1 flex-col bg-[var(--paper)]">
      <div className={row}>
        <span className="w-[72px] flex-none whitespace-nowrap text-[var(--text-2)]">To:</span>
        <span className="rounded bg-[var(--selection-soft)] px-2 py-px">{person.name}</span>
      </div>
      <label className={row}>
        <span className="w-[72px] flex-none whitespace-nowrap text-[var(--text-2)]">Your Name:</span>
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className={row}>
        <span className="w-[72px] flex-none whitespace-nowrap text-[var(--text-2)]">Email:</span>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className={row}>
        <span className="w-[72px] flex-none whitespace-nowrap text-[var(--text-2)]">Subject:</span>
        <input name="subject" className={input} />
      </label>
      <textarea name="message" required aria-label="Message" placeholder="Write your message here" className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-[14px] leading-relaxed outline-none placeholder:text-[var(--text-3)]" />
      <div className="flex flex-none items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-2">
        <p role="status" className="text-[12px] text-[var(--text-2)]">
          {status === "error" ? `That didn't send. Please email ${person.email}.` : person.email}
        </p>
        <button type="submit" disabled={status === "sending"} className="rounded-md bg-[var(--accent)] px-4 py-1 text-[13px] font-medium text-white disabled:opacity-50">
          {status === "sending" ? "Sending" : "Send"}
        </button>
      </div>
    </form>
  );
}
