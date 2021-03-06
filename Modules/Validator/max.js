import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

/**
 * Max range validation
 */
addValidator( 'max', '[max]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat( value ) <= parseFloat( $input.getAttribute( 'max' ) ),
        'max',
        undefined,
        isLiveValidation
    );
} );
