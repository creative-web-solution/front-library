/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

addValidator('recaptcha', '.js--recaptcha', true, ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        !window.grecaptcha || window.grecaptcha.getResponse() !== '',
        'recaptcha'
    )
})
