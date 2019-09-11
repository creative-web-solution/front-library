import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * URL validation
 */
addValidator('url', '[type="url"]', ($input, value) => {
    return validatorTools.standardValidation(
        $input,
        value,
        value === '' || validatorTools.isUrl(value),
        'url'
    )
})
