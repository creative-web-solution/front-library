import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Min length validation
 */
addValidator( 'minlength', '[minlength]', function( $input, value, isLiveValidation ) {

    return standardValidation(
        $input,
        value,
        value.length >= Number( $input.getAttribute( 'minlength' ) ),
        'min',
        undefined,
        isLiveValidation
    );
} );
