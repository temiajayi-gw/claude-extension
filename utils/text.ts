import { SELECTORS } from "./selectors";

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

// Elements that get a blank line around them (paragraph-like).
const SPACED = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6",
  "PRE", "BLOCKQUOTE", "UL", "OL", "TABLE",
]);
// Elements that just start on a new line.
const LINE = new Set(["DIV", "LI", "TR", "SECTION", "ARTICLE"]);

type Options = {
  /** Keep line breaks inside text nodes. Use for user messages (CSS pre-wrap). */
  preserveWhitespace?: boolean;
};

/**
 * Reads the visible text of a message, skipping page furniture such as
 * timestamps and buttons. We walk the DOM ourselves instead of using
 * innerText because innerText can't skip elements, and a copy of the
 * element loses its line breaks once it's detached from the page.
 */
export function readText(root: Element, options: Options = {}): string {
  let out = "";
  // True right after a list marker, so a <p> inside an <li> doesn't push the marker onto its own line.
  let afterMarker = false;

  const startLine = () => {
    if (afterMarker || out === "" || out.endsWith("\n")) return;
    out += "\n";
  };
  const blankLine = () => {
    if (afterMarker || out === "") return;
    startLine();
    if (!out.endsWith("\n\n")) out += "\n";
  };

  const walk = (node: Node, inPre: boolean): void => {
    if (node.nodeType === TEXT_NODE) {
      const raw = node.textContent ?? "";
      if (inPre || options.preserveWhitespace) {
        out += raw;
        if (raw) afterMarker = false;
        return;
      }
      let text = raw.replace(/\s+/g, " ");
      if (out === "" || /\s$/.test(out)) text = text.trimStart();
      out += text;
      if (text) afterMarker = false;
      return;
    }
    if (node.nodeType !== ELEMENT_NODE) return;

    const el = node as Element;
    if (el.matches(SELECTORS.ignoredInText)) return;
    if (el.tagName === "BR") {
      out += "\n";
      return;
    }

    const spaced = SPACED.has(el.tagName);
    const line = LINE.has(el.tagName);
    if (spaced) blankLine();
    else if (line) startLine();

    if (el.tagName === "LI") {
      const parent = el.parentElement;
      const siblings = parent ? [...parent.children].filter((c) => c.tagName === "LI") : [];
      out += parent?.tagName === "OL" ? `${siblings.indexOf(el) + 1}. ` : "- ";
      afterMarker = true;
    }

    const pre = inPre || el.tagName === "PRE";
    el.childNodes.forEach((child) => walk(child, pre));

    if (spaced) blankLine();
    else if (line) startLine();
  };

  walk(root, false);

  return out
    .replace(/[ \t]+\n/g, "\n") // trailing spaces
    .replace(/\n{3,}/g, "\n\n") // at most one blank line
    .trim();
}
