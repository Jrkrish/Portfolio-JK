export default function Preview({ node }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--viewer)] p-4">
      <img src={`${import.meta.env.BASE_URL}${node.src}`} alt={node.alt} className="max-h-full max-w-full object-contain shadow-lg" />
    </div>
  );
}
