import { getValue } from 'front-library/Helpers/getValue';

/**
 * Create a query with the fields of a form.
 * Use a fallback for browser that doesn't support new URLSearchParams( formData ).toString()
 *
 * @function getQueryFromForm
 *
 * @param {HTMLElement} $form
 * @param {String} [selector='select,input,textarea'] Only used for browser with no native new URLSearchParams( formData ).toString()
 *
 * @returns {String}
 */
export default function getQueryFromForm( $form, selector = 'select,input,textarea' ) {
    let formData, query;

    formData    = new FormData( $form );

    try {
        query       = new URLSearchParams( formData ).toString();
    }
    catch ( e ) {
        // EDGE doesn't support new URLSearchParams( formData ).toString();
        const urlParams = new URLSearchParams();
        const $fields = $form.querySelectorAll( selector );

        $fields.forEach( $input => {
            if (
                [ 'button', 'submit', 'image', 'file', 'reset' ].includes( $input.type ) ||
                ( $input.type === 'checkbox' || $input.type === 'radio' ) && !$input.checked
            ) {
                return;
            }

            urlParams.append( $input.name, getValue( $input ) );
        } );

        query = urlParams.toString();
    }

    return query;
}
