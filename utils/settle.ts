import { SELECTORS } from "./selectors";

/** Resolves once `el` has stopped changing for `quietMs`. Fallback "finished streaming" check. */
export function whenSettled(el: Element, quietMs = 1500): Promise<void> {
	return new Promise((resolve) => {
		let timer = setTimeout(done, quietMs);

		const observer = new MutationObserver(() => {
			clearTimeout(timer); // something changed, so restart the countdown
			timer = setTimeout(done, quietMs);
		});

		function done() {
			observer.disconnect();
			resolve();
		}

		observer.observe(el, {
			childList: true,
			subtree: true,
			characterData: true,
		});
	});
}

/**
 * Resolves once an assistant message has finished generating.
 *
 * Preferred signal: claude.ai flips data-is-streaming from "true" to "false".
 * If the attribute isn't there (the site changed), fall back to waiting for
 * the message to stop changing, so the extension degrades instead of breaking.
 */
export function whenFinished(
	el: Element,
	fallbackQuietMs = 1500,
): Promise<void> {
	const attr = SELECTORS.streamingAttr;
	if (!el.hasAttribute(attr)) return whenSettled(el, fallbackQuietMs);

	return new Promise((resolve) => {
		const observer = new MutationObserver(() => {
			if (el.getAttribute(attr) !== "true") {
				observer.disconnect();
				resolve();
			}
		});
		observer.observe(el, { attributes: true, attributeFilter: [attr] });

		// It may already be finished (an old message loaded from history).
		if (el.getAttribute(attr) !== "true") {
			observer.disconnect();
			resolve();
		}
	});
}
