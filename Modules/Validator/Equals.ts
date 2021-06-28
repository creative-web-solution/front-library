import { getValue }     from '@creative-web-solution/front-library/Helpers/GetValue';
import { addValidator } from './index';


/**
 * "Two fields equals" validation
 */
addValidator( 'equals', '[data-equals]', ( $input, value, isLiveValidation ) => {
    const name    = $input.getAttribute( 'data-equals' )!;
    const $target = document.getElementById( name );

    return Promise.resolve({
        $input,
        value,
        "isValid": !$target || value === getValue( $target as HTMLInputElement ),
        "label": "equals",
        isLiveValidation
    });
} );
