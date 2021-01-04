import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import isEmail from '@creative-web-solution/front-library/Modules/Validator/Tools/isEmail';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

/**
 * Email validation
 */
addValidator( 'email', '[type="email"]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isEmail( value, $input.hasAttribute( 'data-loose' ) ),
        'email',
        undefined,
        isLiveValidation
    );
} );
