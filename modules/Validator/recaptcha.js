import { validatorTools, addValidator } from 'front-library/Modules/Validator';

addValidator('recaptcha', '.js--recaptcha', true, ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        !window.grecaptcha || window.grecaptcha.getResponse() !== '',
        'recaptcha'
    )
})
