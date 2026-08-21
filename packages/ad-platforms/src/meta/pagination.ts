export interface Page<T> { data: T[]; next?: string; }

export interface PaginatedTransport {
  get(path: string, params?: Record<string, string>): Promise<{ data?: unknown[]; paging?: { next?: string } }>;
}

export async function fetchAllPages<T>(transport: PaginatedTransport, path: string, params: Record<string, string> = {}, maxPages = 50): Promise<T[]> {
  const results: T[] = [];
  let currentPath = path;
  let currentParams = params;
  for (let page = 0; page < maxPages; page++) {
    const response = await transport.get(currentPath, currentParams);
    results.push(...((response.data ?? []) as T[]));
    if (!response.paging?.next) return results;
    currentPath = response.paging.next;
    currentParams = {};
  }
  throw new Error(`Meta pagination exceeded maxPages=${maxPages}`);
}
