import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

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
