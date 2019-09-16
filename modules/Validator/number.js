import { validatorTools, addValidator } from 'front-library/Modules/Validator';

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
