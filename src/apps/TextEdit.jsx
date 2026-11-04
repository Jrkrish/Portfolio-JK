import { Markdown } from "./Markdown.jsx";

export default function TextEdit({ node }) {
  return (
    <div className="scroller flex-1 overflow-y-auto bg-[var(--paper)] px-7 py-6 md:px-10">
      <article className="mx-auto max-w-[560px]">
        <Markdown source={node.body} />
      </article>
    </div>
  );
}
