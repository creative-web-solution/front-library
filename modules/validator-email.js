/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Email validation
 */
addValidator('email', '[type="email"]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' || validatorTools.isEmail(value),
        'email'
    )
})
