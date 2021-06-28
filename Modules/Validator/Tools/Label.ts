/**
 * Get the label of an input
 *
 * @param $input
 * @param [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return Return the label, if there is only one, the list of labels if many or null if none
*/
export function getLabelElement( $input: HTMLElement, $wrapper: HTMLElement = document.body ): HTMLElement | NodeList | null {
    let $labels = $wrapper.querySelectorAll( `label[for="${ $input.id }"]` );

    if ( !$labels.length ) {
        return null;
    }
    if ( $labels.length === 1 ) {
        return $labels[ 0 ] as HTMLElement;
    }

    return $labels;
}


/**
 * Get the text of a label's input
 *
 * @param $input
 * @param [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return Return the label, if there is only one, the list of labels if many or '' if none
*/
export function getLabel( $input: HTMLElement, $wrapper: HTMLElement = document.body ): string | string[] {
    let $labels = getLabelElement( $input, $wrapper );

    if ( !$labels ) {
        return '';
    }
    else if ( $labels instanceof NodeList ) {
        return Array.from( $labels ).map( $label => $label.textContent || '' );
    }

    return $labels.textContent || '';
}
