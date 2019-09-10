/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Email validation
 */
addValidator('pattern', '[pattern]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' || new RegExp($input.getAttribute('pattern')).test(value),
        'pattern'
    )
})
