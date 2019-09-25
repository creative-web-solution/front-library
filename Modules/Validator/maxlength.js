import { standardValidation, addValidator } from 'front-library/Modules/Validator';

/**
 * Max length validation
 */
addValidator( 'maxlength', '[maxlength]', ( $input, value ) => {
    let max = $input.getAttribute( 'maxlength' );
    return standardValidation(
        $input,
        value,
        value.length <= max,
        'max'
    );
} );
