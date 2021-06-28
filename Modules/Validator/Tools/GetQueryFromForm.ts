import { getValue } from '@creative-web-solution/front-library/Helpers/GetValue';


/**
 * Create a query with the fields of a form.
 * Use a fallback for browser that doesn't support new URLSearchParams( formData ).toString()
 *
 * @function getQueryFromForm
 *
 * @param $form
 * @param [selector='select,input,textarea'] Only used for browser with no native new URLSearchParams( formData ).toString()
 *
 * @returns {String}
 */
export default function getQueryFromForm( $form: HTMLFormElement, selector = 'select,input,textarea' ): string {
    let query;

    const formData    = new FormData( $form );

    try {
        /** @ts-expect-error */
        query   = new URLSearchParams( formData ).toString();
    }
    catch ( e ) {
        // EDGE doesn't support new URLSearchParams( formData ).toString();
        const urlParams = new URLSearchParams();
        const $fields = $form.querySelectorAll( selector );

        $fields.forEach( $input => {
            if (
                !($input as HTMLInputElement).name ||
                [ 'button', 'submit', 'image', 'file', 'reset' ].includes( ($input as HTMLInputElement).type ) ||
                ( ($input as HTMLInputElement).type === 'checkbox' || ($input as HTMLInputElement).type === 'radio' ) && !($input as HTMLInputElement).checked
            ) {
                return;
            }

            const VALUE = getValue( ($input as HTMLInputElement) );

            urlParams.append( ($input as HTMLInputElement).name, typeof VALUE === 'string' ? VALUE : VALUE.join( '' ) );
        } );

        query = urlParams.toString();
    }

    return query;
}
