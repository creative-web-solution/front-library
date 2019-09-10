/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Max range validation
 */
addValidator('max', '[max]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat(value) <= parseFloat($input.getAttribute('max')),
        'max'
    )
})
