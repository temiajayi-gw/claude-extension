import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Prompt Bookmarks",
    description:
      "Bookmark Claude prompt and response pairs. Saved locally on your machine.",
    // "storage" lets us use chrome.storage.local. That's the only permission.
    permissions: ["storage"],
  },
});
