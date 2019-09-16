/**
 * Convert an html string into a DOM object
 *
 * @param {string} html
 * @param {string} tag - Used to create an element to convert html inside. 'DIV' by default
 *
 * @example $element = strToDOM( html );
 *
 * // Use of tag parameter
 * $li = strToDOM( '<li></li>', 'UL' );
 *
 * @returns {HTMLElement} - The created DOM element
 */
export function strToDOM(html, tag = 'DIV') {
    let $frag, $elem, $child

    $frag = document.createDocumentFragment()
    $elem = document.createElement(tag)

    $elem.innerHTML = html

    while ($elem.childNodes.length) {
        $child = $elem.childNodes[0]

        if ($child && $child.nodeType === 1) {
            $frag.appendChild($child)
        } else {
            $elem.removeChild($child)
        }
    }

    return $frag.childNodes.length === 1 ? $frag.childNodes[0] : $frag
}
