import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';

addValidator( 'recaptcha', '.js--recaptcha', true, ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        !window.grecaptcha || window.grecaptcha.getResponse() !== '',
        'recaptcha',
        undefined,
        isLiveValidation
    );
} );
