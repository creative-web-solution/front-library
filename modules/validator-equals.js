/*dependencies: modules::validator-core,helpers::value */

import { getValue } from 'front-library/helpers/value';
import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * "Two fields equals" validation
 */
addValidator('equals', '[data-equals]', ($input, value) => {
    let $target, name;

    name = $input.getAttribute('data-equals')
    $target = document.getElementById(name)

    return validatorTools.standardValidation(
        $input,
        value,
        !$target || value === getValue($target),
        'email'
    )
})
