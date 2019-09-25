import { standardValidation, isNumber, addValidator } from 'front-library/Modules/Validator';

/**
 * Number validation
 */
addValidator( 'number', '[type="number"]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isNumber( value ),
        'number'
    );
} );
