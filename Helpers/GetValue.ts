import { isString, isNumber } from './Type';


function cleanFieldsValue( value: any ): string {
    if ( isString( value ) ) {
        return value;
    }
    else if ( isNumber( value ) ) {
        return `${ value }`;
    }
    else {
        return value == null ? '' : value;
    }
}


/**
 * Get the value of a form field (get from jQuery)
 *
 * @param $input
 *
 * @example value = getValue( $input )
 *
 * @returns The value of the form field
 */
export function getValue( $input: Element ): string | string[] {

    if ( $input.nodeName === 'SELECT' ) {
        let value, i;

        const options          = ($input as HTMLSelectElement).options;
        const index            = ($input as HTMLSelectElement).selectedIndex;
        const one              = ($input as HTMLSelectElement).type === 'select-one' || index < 0;
        const values: string[] = [];
        const max              = one ? index + 1 : options.length;

        i = index < 0 ? max : one ? index : 0;

        // Loop through all the selected options
        for ( ; i < max; i++ ) {
            const option = options[ i ];

            if (
                // oldIE doesn't update selected after form reset (#2551)
                ( option.selected || i === index ) &&
                // Don't return options that are disabled or in a disabled optgroup
                !option.disabled &&
                ( !(option.parentNode as HTMLSelectElement).disabled ||
                    option.parentNode?.nodeName !== 'OPTGROUP' )
            ) {
                // Get the specific value for the option
                value = option.getAttribute('value');

                if ( value == null || typeof value === 'undefined' ) {
                    value = option.text;
                }

                value = cleanFieldsValue( value );

                // We don't need an array for one selects
                if ( one ) {
                    return value;
                }

                // Multi-Selects return an array
                values.push( value );
            }
        }

        return values;
    }
    else if ( ($input as HTMLInputElement).type === 'radio' ) {
        let value;
        const groupFields: NodeList = document.querySelectorAll( `input[name="${ ($input as HTMLInputElement).name }"]` );

        for ( let idx = 0, len = groupFields.length; idx < len; ++idx ) {
            const field: HTMLInputElement = groupFields[ idx ] as HTMLInputElement;

            if ( field.checked && !field.disabled ) {
                value = field.value;
                break;
            }
        }

        return cleanFieldsValue( value );
    }

    return cleanFieldsValue( ($input as HTMLInputElement).value );
}
