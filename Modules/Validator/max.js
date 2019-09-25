import { standardValidation, addValidator } from 'front-library/Modules/Validator';

/**
 * Max range validation
 */
addValidator( 'max', '[max]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat( value ) <= parseFloat( $input.getAttribute( 'max' ) ),
        'max'
    );
} );
