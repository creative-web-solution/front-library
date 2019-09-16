import { validatorTools, addValidator } from 'front-library/Modules/Validator';

/**
 * Min range validation
 */
addValidator('min', '[min]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' ||
            parseFloat(value) >= parseFloat($input.getAttribute('min')),
        'min'
    )
})
