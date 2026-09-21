/**
 * Convert an html string into a DOM object
 *
 * @example
 * $element = strToDOM( html );
 *
 * @example
 * // Use of tag parameter
 * $li = strToDOM( '<li></li>' );
 *
 * @returns The created DOM element
 */
export function strToDOM<T extends HTMLElement>(html: string): T {
    const range = document.createRange();
    const $frag: DocumentFragment = range.createContextualFragment(html);

    return ($frag.childNodes.length === 1 ? $frag.childNodes[0] : $frag) as T;
}
