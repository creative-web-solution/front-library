import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Max length validation
 */
addValidator( 'maxlength', '[maxlength]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value.length <= Number( $input.getAttribute( 'maxlength' ) ),
        'max',
        undefined,
        isLiveValidation
    );
} );
