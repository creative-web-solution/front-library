import { validatorTools, addValidator } from 'front-library/Modules/Validator';

/**
 * Required validation
 */
addValidator('required', '[required]', ($input, value) => {
    let isValid

    if ($input.type === 'checkbox') {
        isValid = $input.checked
    } else if ($input.type === 'radio') {
        isValid = validatorTools.isRadioListChecked($input.__$radioGroup)
    } else {
        isValid = !validatorTools.isEmpty(value)
    }

    return validatorTools.standardValidation($input, value, isValid, 'required')
})
