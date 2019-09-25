import { standardValidation, isEmail, addValidator } from 'front-library/Modules/Validator';

/**
 * Email validation
 */
addValidator( 'email', '[type="email"]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isEmail( value ),
        'email'
    );
} );
