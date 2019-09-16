import { isString, isNumber } from 'front-library/Helpers/Type';

/**
 * Get the value of a form field (get from jQuery)
 *
 * @function getValue
 *
 * @param {HTMLElement} $input
 *
 * @example value = getValue( $input )
 *
 * @returns {(string|number)} - the value of the form field
 */
let getValue;

{
    function cleanFieldsValue(value) {
        if (isString(value)) {
            return value
        } else if (isNumber(value)) {
            return '' + value
        } else {
            return value == null ? '' : value
        }
    }

    getValue = function($input) {
        let value, field, option, options, index, one, values, max, i

        if ($input.nodeName === 'SELECT') {
            options = $input.options
            index = $input.selectedIndex
            one = $input.type === 'select-one' || index < 0
            values = one ? null : []
            max = one ? index + 1 : options.length
            i = index < 0 ? max : one ? index : 0

            // Loop through all the selected options
            for (; i < max; i++) {
                option = options[i]

                if (
                    // oldIE doesn't update selected after form reset (#2551)
                    (option.selected || i === index) &&
                    // Don't return options that are disabled or in a disabled optgroup
                    !option.disabled &&
                    (!option.parentNode.disabled ||
                        option.parentNode.nodeName !== 'OPTGROUP')
                ) {
                    // Get the specific value for the option
                    value = option.getAttribute('value')

                    if (value == null || typeof value === 'undefined') {
                        value = option.text
                    }

                    value = cleanFieldsValue(value)

                    // We don't need an array for one selects
                    if (one) {
                        return value
                    }

                    // Multi-Selects return an array
                    values.push(value)
                }
            }

            return values
        } else if ($input.type === 'radio') {
            let groupFields = document.querySelectorAll(
                'input[name="' + $input.name + '"]'
            )

            for (let idx = 0, len = groupFields.length; idx < len; ++idx) {
                field = groupFields[idx]

                if (field.checked && !field.disabled) {
                    value = field.value
                    break
                }
            }

            return cleanFieldsValue(value)
        }

        return cleanFieldsValue($input.value)
    }
}

export { getValue }
