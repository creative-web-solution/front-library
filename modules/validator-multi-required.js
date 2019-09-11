import { getValue } from 'front-library/helpers/value';
import { validatorTools, addValidator } from 'front-library/modules/validator-core';

/**
 * Check for a group of field if at least x are checked (or filled) and maximum y
 *
 * on the first field:              data-multirequired="myGroup|x|y"
 * on other field of the group :    data-multirequired-group="myGroup"
 *
 */
addValidator('multirequired', '[data-multirequired]', ($input, value) => {
    let $group, arrayData, count, data, groupName, nbRequiredMax, nbRequiredMin

    data = $input.getAttribute('data-multirequired')
    count = 0

    if (data.indexOf('|') === -1) {
        return validatorTools.standardValidation(
            $input,
            value,
            true,
            'multirequired'
        )
    }

    arrayData = data.split('|')
    groupName = arrayData[0]

    $group = document.querySelectorAll(
        '[data-multirequired-group^="' + groupName + '"]'
    )

    if (!$group.length) {
        return validatorTools.standardValidation(
            $input,
            value,
            true,
            'multirequired'
        )
    }

    nbRequiredMin = parseInt(arrayData[1], 10) || 0

    if (arrayData.length > 2) {
        nbRequiredMax = parseInt(arrayData[2], 10)
    } else {
        nbRequiredMax = 10000
    }

    $group = Array.prototype.slice.call($group, 0)

    $group.push($input)

    $group.forEach($elem => {
        if (
            ($elem.type === 'checkbox' && $elem.checked) ||
            ($elem.type === 'radio' &&
                validatorTools.isRadioListChecked($elem.__$radioGroup)) ||
            ($elem.type !== 'checkbox' &&
                $elem.type !== 'radio' &&
                !validatorTools.isEmpty(getValue($elem)))
        ) {
            count++
        }
    })

    return validatorTools.standardValidation(
        $input,
        value,
        nbRequiredMin <= count && count <= nbRequiredMax,
        'multirequired'
    )
})
