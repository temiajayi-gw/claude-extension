export type Bookmark = {
  id: string; // SHA-256 hash of prompt + response, so saving the same pair twice dedupes
  chatId: string; // the UUID from the claude.ai chat URL
  chatUrl: string;
  prompt: string;
  response: string;
  savedAt: number; // Date.now()
};
