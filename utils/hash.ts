export async function hashPair(prompt: string, response: string): Promise<string> {
  // The separator stops two different pairs joining into the same string.
  const bytes = new TextEncoder().encode(`${prompt}\n---\n${response}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
