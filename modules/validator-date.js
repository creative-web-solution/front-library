import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Date validation
 */
addValidator('date', '[data-date-control]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' ||
            validatorTools.isDate(
                value,
                $input.getAttribute('data-date-control')
            ),
        'date'
    );
});
