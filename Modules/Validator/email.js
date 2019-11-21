import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import isEmail from 'front-library/Modules/Validator/Tools/isEmail';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Email validation
 */
addValidator( 'email', '[type="email"]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isEmail( value ),
        'email',
        undefined,
        isLiveValidation
    );
} );
