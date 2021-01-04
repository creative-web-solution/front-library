import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

/**
 * Min range validation
 */
addValidator( 'min', '[min]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat( value ) >= parseFloat( $input.getAttribute( 'min' ) ),
        'min',
        undefined,
        isLiveValidation
    );
} );
