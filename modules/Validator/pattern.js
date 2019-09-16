import { validatorTools, addValidator } from 'front-library/Modules/Validator';

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
