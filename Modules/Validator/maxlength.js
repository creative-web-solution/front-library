import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Max length validation
 */
addValidator( 'maxlength', '[maxlength]', ( $input, value, isLiveValidation ) => {
    let max = $input.getAttribute( 'maxlength' );
    return standardValidation(
        $input,
        value,
        value.length <= max,
        'max',
        undefined,
        isLiveValidation
    );
} );
