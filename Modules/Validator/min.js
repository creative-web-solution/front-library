import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

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
