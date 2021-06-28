import { addValidator } from './index';

addValidator( 'recaptcha', '.js--recaptcha', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": !window.grecaptcha || window.grecaptcha.getResponse() !== '',
        "label":   "pattern",
        isLiveValidation
    });
} );
