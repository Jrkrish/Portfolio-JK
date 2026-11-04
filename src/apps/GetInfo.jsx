import { NodeIcon } from "../icons/index.jsx";

const KIND = { folder: "Folder", markdown: "Markdown Document", image: "JPEG Image", link: "Web Location", app: "Application", resume: "PDF Document" };

export default function GetInfo({ node, path }) {
  const rows = [
    ["Kind", KIND[node.kind]],
    ["Where", path.slice(0, -1).join(" / ")],
    node.children && ["Contains", `${node.children.length} item${node.children.length === 1 ? "" : "s"}`],
    node.year && ["Year", node.year],
    node.tag && ["Tag", node.tag],
    node.stack && ["Built with", node.stack.join(", ")],
    node.url && ["Link", node.url],
  ].filter(Boolean);

  return (
    <div className="scroller flex-1 overflow-y-auto bg-[var(--paper)] p-4">
      <div className="flex items-center gap-3">
        <NodeIcon node={node} size={52} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{node.name}</p>
          <p className="text-[12px] text-[var(--text-2)]">{KIND[node.kind]}</p>
        </div>
      </div>
      {node.summary && <p className="mt-3 text-[12.5px] leading-relaxed">{node.summary}</p>}
      <dl className="mt-3 grid grid-cols-[76px_1fr] gap-x-3 gap-y-1 border-t border-[var(--line)] pt-3 text-[12px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-right text-[var(--text-2)]">{k}:</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
