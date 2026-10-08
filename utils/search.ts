import type { Bookmark } from "./types";

/** Newest first. Keeps bookmarks whose prompt OR response contains the query. */
export function filterBookmarks(bookmarks: Bookmark[], query: string): Bookmark[] {
  const q = query.trim().toLowerCase();
  return bookmarks
    .filter(
      (b) =>
        q === "" ||
        b.prompt.toLowerCase().includes(q) ||
        b.response.toLowerCase().includes(q),
    )
    .sort((a, b) => b.savedAt - a.savedAt);
}
