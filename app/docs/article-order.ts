export function orderArticles<T extends { title: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const aGettingStarted = /^getting started\b/i.test(a.title);
    const bGettingStarted = /^getting started\b/i.test(b.title);

    if (aGettingStarted !== bGettingStarted) return aGettingStarted ? -1 : 1;
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });
}
