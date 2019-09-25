import { standardValidation, addValidator } from 'front-library/Modules/Validator';

addValidator( 'recaptcha', '.js--recaptcha', true, ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        !window.grecaptcha || window.grecaptcha.getResponse() !== '',
        'recaptcha'
    );
} );
