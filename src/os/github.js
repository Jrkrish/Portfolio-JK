import { useEffect, useState } from "react";

const USER = "Jrkrish";
let cache = null;

// Live public data from GitHub. Fetched once per visit; unauthenticated
// requests are limited per visitor, so callers must handle `status: "error"`.
function load() {
  cache ??= fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
    headers: { Accept: "application/vnd.github+json" },
  }).then((res) => {
    if (!res.ok) throw new Error(`GitHub: HTTP ${res.status}`);
    return res.json();
  });
  return cache;
}

export function useGitHub() {
  const [state, setState] = useState({ status: "loading", repos: [] });

  useEffect(() => {
    let live = true;
    load()
      .then((all) => {
        const repos = all.filter((r) => !r.fork && r.name !== USER);
        if (live) setState({ status: "ready", repos });
      })
      .catch(() => {
        cache = null;
        if (live) setState({ status: "error", repos: [] });
      });
    return () => {
      live = false;
    };
  }, []);

  return state;
}

export function languageShare(repos) {
  const counts = {};
  for (const r of repos) if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([language, n]) => ({ language, n, share: n / total }));
}

export const shortDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
