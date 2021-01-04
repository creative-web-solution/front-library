import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

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
