/** Small DOM helpers shared by the outer page modules. No dynamic HTML strings. */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

interface IconDefinition {
  paths: readonly string[];
  /** Solid glyph instead of an outline. */
  solid?: boolean;
}

const ICONS = {
  soundOn: {
    paths: [
      "M4 9.5h3.2L12 5.5v13l-4.8-4H4z",
      "M15.5 9a4.2 4.2 0 0 1 0 6",
      "M18 6.5a7.8 7.8 0 0 1 0 11",
    ],
  },
  soundOff: { paths: ["M4 9.5h3.2L12 5.5v13l-4.8-4H4z", "M16 9.5l5 5", "M21 9.5l-5 5"] },
  help: {
    paths: [
      "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z",
      "M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9",
      "M12 16.9v.1",
    ],
  },
  pause: { paths: ["M7 5h3.4v14H7z", "M13.6 5H17v14h-3.4z"], solid: true },
  play: { paths: ["M8 5l11 7-11 7z"], solid: true },
  restart: { paths: ["M19 12a7 7 0 1 1-2.2-5.1", "M19.2 4.2v4.2H15"] },
  bulb: {
    paths: [
      "M9 17.5h6",
      "M10 20.5h4",
      "M12 3.5a6 6 0 0 0-3.6 10.8c.6.5.9 1 .9 1.7h5.4c0-.7.3-1.2.9-1.7A6 6 0 0 0 12 3.5z",
    ],
  },
  lock: {
    paths: ["M6.5 11h11v8.5h-11z", "M8.8 11V8.2a3.2 3.2 0 0 1 6.4 0V11"],
  },
  check: { paths: ["M5.5 12.5l4.2 4.2L18.5 7.5"] },
  star: {
    paths: ["M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17.1 6.6 20l1.1-6.1L3.2 9.6l6.1-.8z"],
    solid: true,
  },
  info: { paths: ["M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z", "M12 11v5.5", "M12 7.6v.1"] },
  external: { paths: ["M13.5 5H19v5.5", "M19 5l-8 8", "M17.5 14v4.5h-12v-12H10"] },
  chevron: { paths: ["M7 9.5l5 5 5-5"] },
  grid: {
    paths: [
      "M5 5h5.5v5.5H5z",
      "M13.5 5H19v5.5h-5.5z",
      "M5 13.5h5.5V19H5z",
      "M13.5 13.5H19V19h-5.5z",
    ],
  },
  close: { paths: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"] },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

/** Decorative inline SVG icon (24x24 grid, inherits `currentColor`). */
export function icon(name: IconName, className = "icon"): SVGSVGElement {
  const definition: IconDefinition = ICONS[name];
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", definition.solid ? `${className} icon--solid` : className);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const d of definition.paths) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }
  return svg;
}

/** `<button type="button">` with an optional leading icon and a text label span. */
export function button(
  className: string,
  label: string,
  iconName?: IconName
): { element: HTMLButtonElement; label: HTMLSpanElement; setIcon(name: IconName): void } {
  const element = el("button", className);
  element.type = "button";
  let iconNode: SVGSVGElement | null = iconName ? icon(iconName) : null;
  if (iconNode) element.appendChild(iconNode);
  const labelNode = el("span", "btn__label", label);
  element.appendChild(labelNode);
  return {
    element,
    label: labelNode,
    setIcon(name: IconName) {
      const next = icon(name);
      if (iconNode) iconNode.replaceWith(next);
      else element.prepend(next);
      iconNode = next;
    },
  };
}
