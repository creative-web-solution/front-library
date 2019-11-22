/**
 * Get the label of an input
 *
 * @function getLabelElement
 *
 * @param {HTMLElement} $input
 * @param {HTMLElement} [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return {HTMLElement|HTMLElement[]|null} Return the label, if there is only one, the list of labels if many or null if none
*/
export function getLabelElement( $input, $wrapper = document.body ) {
    let $labels = $wrapper.querySelectorAll( `label[for="${ $input.id }"]` );

    if ( !$labels.length ) {
        return null;
    }
    if ( $labels.length === 1 ) {
        return $labels[ 0 ];
    }

    return $labels;
}


/**
 * Get the text of a label's input
 *
 * @function getLabel
 *
 * @param {HTMLElement} $input
 * @param {HTMLElement} [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return {string|string[]} Return the label, if there is only one, the list of labels if many or '' if none
*/
export function getLabel( $input, $wrapper = document.body ) {
    let $labels = getLabelElement( $input, $wrapper );

    if ( !$labels ) {
        return '';
    }
    else if ( $labels instanceof NodeList ) {
        return Array.from( $labels ).map( $label => $label.textContent );
    }

    return $labels.textContent;
}
