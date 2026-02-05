import type { TestBench } from '../backend';

export function searchBenches(benches: TestBench[], query: string): TestBench[] {
  if (!query.trim()) return benches;

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  return benches.filter((bench) => {
    const searchableText = [
      bench.name,
      bench.agileCode,
      bench.description,
      ...bench.tags.map((t) => t.tagName),
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
}
