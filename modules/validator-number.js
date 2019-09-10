/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Number validation
 */
addValidator('number', '[type="number"]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' || validatorTools.isNumber(value),
        'number'
    )
})
