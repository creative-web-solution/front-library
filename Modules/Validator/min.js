import { standardValidation, addValidator } from 'front-library/Modules/Validator';

/**
 * Min range validation
 */
addValidator( 'min', '[min]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat( value ) >= parseFloat( $input.getAttribute( 'min' ) ),
        'min'
    );
} );
