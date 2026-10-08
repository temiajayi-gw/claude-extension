import { browser } from "wxt/browser";
import type { Bookmark } from "./types";

const KEY = "bookmarks";

// browser.storage.local is async and shared between the content script and the popup.
export async function getBookmarks(): Promise<Bookmark[]> {
  const result = await browser.storage.local.get(KEY);
  return (result[KEY] as Bookmark[] | undefined) ?? [];
}

export async function hasBookmark(id: string): Promise<boolean> {
  return (await getBookmarks()).some((b) => b.id === id);
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const all = await getBookmarks();
  // Same hash = same pair, so replace instead of duplicating.
  const rest = all.filter((b) => b.id !== bookmark.id);
  await browser.storage.local.set({ [KEY]: [bookmark, ...rest] });
}

export async function removeBookmark(id: string): Promise<void> {
  const all = await getBookmarks();
  await browser.storage.local.set({ [KEY]: all.filter((b) => b.id !== id) });
}
