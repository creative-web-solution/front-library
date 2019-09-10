/*dependencies: modules::validator-core */

import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Min length validation
 */
addValidator('minlength', '[minlength]', function($input, value) {
    var min

    min = $input.getAttribute('minlength')

    return validatorTools.standardValidation(
        $input,
        value,
        value.length >= min,
        'min'
    )
})
