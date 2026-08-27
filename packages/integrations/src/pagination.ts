export interface Page<T> { items: T[]; nextCursor?: string; }
export interface PageFetcher<T> { fetch(cursor?: string): Promise<Page<T>>; }

export async function collectPages<T>(fetcher: PageFetcher<T>, maxItems = 1000): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  while (items.length < maxItems) {
    const page = await fetcher.fetch(cursor);
    items.push(...page.items);
    if (!page.nextCursor || seen.has(page.nextCursor)) break;
    seen.add(page.nextCursor);
    cursor = page.nextCursor;
  }
  return items.slice(0, maxItems);
}
