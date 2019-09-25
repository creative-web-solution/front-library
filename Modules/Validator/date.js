import { standardValidation, isDate, addValidator } from 'front-library/Modules/Validator';

/**
 * Date validation
 */
addValidator( 'date', '[data-date-control]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' ||
            isDate(
                value,
                $input.getAttribute( 'data-date-control' )
            ),
        'date'
    );
} );
