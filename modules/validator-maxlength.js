import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Max length validation
 */
addValidator('maxlength', '[maxlength]', ($input, value) => {
    let max = $input.getAttribute('maxlength')
    return validatorTools.standardValidation(
        $input,
        value,
        value.length <= max,
        'max'
    )
})
