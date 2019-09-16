import { validatorTools, addValidator } from 'front-library/Modules/Validator';

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
