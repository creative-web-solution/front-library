import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Min length validation
 */
addValidator( 'minlength', '[minlength]', function( $input, value, isLiveValidation ) {
    var min;

    min = $input.getAttribute( 'minlength' );

    return standardValidation(
        $input,
        value,
        value.length >= min,
        'min',
        undefined,
        isLiveValidation
    );
} );
