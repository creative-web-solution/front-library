import { standardValidation, addValidator } from 'front-library/Modules/Validator';

/**
 * Email validation
 */
addValidator( 'pattern', '[pattern]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' || new RegExp( $input.getAttribute( 'pattern' ) ).test( value ),
        'pattern'
    );
} );
