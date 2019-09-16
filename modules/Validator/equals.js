import { getValue } from 'front-library/Helpers/getValue';
import { validatorTools, addValidator } from 'front-library/Modules/Validator';

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
