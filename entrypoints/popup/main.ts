import "./style.css";
import { browser } from "wxt/browser";
import { filterBookmarks } from "../../utils/search";
import { getBookmarks, removeBookmark } from "../../utils/storage";
import type { Bookmark } from "../../utils/types";

const searchInput = document.querySelector<HTMLInputElement>("#search")!;
const list = document.querySelector<HTMLUListElement>("#list")!;
const empty = document.querySelector<HTMLParagraphElement>("#empty")!;
const count = document.querySelector<HTMLParagraphElement>("#count")!;

let all: Bookmark[] = [];

// Tiny helper to build elements. We only ever set textContent, never
// innerHTML, so saved text can't inject markup into the popup (XSS-safe).
function h<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className?: string,
	text?: string,
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	if (className) el.className = className;
	if (text !== undefined) el.textContent = text;
	return el;
}

function copyButton(label: string, text: string): HTMLButtonElement {
	const button = h("button", "action", label);
	button.type = "button";
	button.addEventListener("click", async () => {
		await navigator.clipboard.writeText(text);
		button.textContent = "Copied";
		setTimeout(() => (button.textContent = label), 1200);
	});
	return button;
}

function renderItem(b: Bookmark): HTMLLIElement {
	const li = h("li", "item");

	const prompt = h("p", "prompt", b.prompt);
	const response = h("p", "response", b.response);

	const toggle = h("button", "action", "Expand");
	toggle.type = "button";
	toggle.setAttribute("aria-expanded", "false");
	toggle.addEventListener("click", () => {
		const expanded = li.classList.toggle("expanded");
		toggle.textContent = expanded ? "Collapse" : "Expand";
		toggle.setAttribute("aria-expanded", String(expanded));
	});

	const open = h("a", "action", "Open chat");
	open.href = b.chatUrl;
	open.target = "_blank";
	open.rel = "noreferrer";

	const del = h("button", "action danger", "Delete");
	del.type = "button";
	del.addEventListener("click", () => removeBookmark(b.id)); // the storage listener re-renders

	const actions = h("div", "actions");
	actions.append(
		toggle,
		copyButton("Copy prompt", b.prompt),
		copyButton("Copy response", b.response),
		open,
		del,
	);

	const date = h(
		"p",
		"meta",
		new Date(b.savedAt).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		}),
	);

	li.append(prompt, response, actions, date);
	return li;
}

function render() {
	const results = filterBookmarks(all, searchInput.value);
	list.replaceChildren(...results.map(renderItem));

	const searching = searchInput.value.trim() !== "";
	empty.hidden = results.length > 0;
	empty.textContent = searching
		? "No bookmarks match that search."
		: "No bookmarks yet. Open a chat on claude.ai and click Bookmark under a response.";

	count.textContent =
		all.length === 0
			? ""
			: searching
				? `${results.length} of ${all.length} bookmarks`
				: `${all.length} ${all.length === 1 ? "bookmark" : "bookmarks"}`;
}

async function load() {
	all = await getBookmarks();
	render();
}

searchInput.addEventListener("input", render);

// Keep the popup in sync if bookmarks change while it's open (including our own deletes).
browser.storage.onChanged.addListener((_changes, area) => {
	if (area === "local") load();
});

load();
