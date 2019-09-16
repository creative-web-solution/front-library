import { extend } from 'front-library/Helpers/Extend';
import { wrap } from 'front-library/DOM/Wrap';

/**
 * Skin a checkbox DOM element
 *
 * @function
 * @param {HTMLElement} $checkbox
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.invalidClass=invalid]
 * @param {string} [options.disabledClass=disabled]
 * @param {string} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinCheckbox( $input, {
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 */
let skinCheckbox;

/**
 * Skin all checkbox DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.invalidClass=invalid]
 * @param {string} [options.disabledClass=disabled]
 * @param {string} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinCheckboxAll( $wrapper,
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 */
let skinCheckboxAll;

{
    const defaultOptions = {
        wrap: '<span class="cb-skin"></span>',
        invalidClass: 'invalid',
        disabledClass: 'disabled',
        checkedClass: 'checked'
    }

    function CheckboxSkin($checkbox, userOptions = {}) {
        let $parent, options

        // Already skinned
        if ($checkbox.__skinAPI) {
            return
        }

        options = extend(defaultOptions, userOptions)

        // Change the display
        function update() {
            $checkbox.__skinAPI[$checkbox.checked ? 'check' : 'uncheck']()
        }

        function changeHandler() {
            update()
        }

        function checkUncheck(fnName, checked) {
            $checkbox.checked = checked
            $parent.classList[fnName](options.checkedClass)
        }

        this.check = () => {
            checkUncheck('add', true)
        }

        this.uncheck = () => {
            checkUncheck('remove', false)
        }

        function enableDisable(fnName, disabled) {
            $checkbox.disabled = disabled
            $checkbox.parentNode.classList[fnName](options.disabledClass)
        }

        this.enable = () => {
            enableDisable('remove', false)
        }

        this.disable = () => {
            enableDisable('add', true)
        }

        function validInvalid(fnName) {
            $checkbox.parentNode.classList[fnName](options.invalidClass)
        }

        this.setInvalid = () => {
            validInvalid('add')
        }

        this.setValid = () => {
            validInvalid('remove')
        }

        // Add the skin
        wrap($checkbox, options.wrap)

        $parent = $checkbox.parentNode

        $parent.__skinAPI = $checkbox.__skinAPI = this

        if ($checkbox.hasAttribute('data-has-error')) {
            this.setInvalid()
        }

        $checkbox.addEventListener('click', changeHandler)

        update()
    }

    skinCheckbox = function($checkbox, options) {
        new CheckboxSkin($checkbox, options)
    }

    skinCheckboxAll = function($wrapper, options) {
        let $checkboxes = $wrapper.querySelectorAll('input[type="checkbox"]')

        $checkboxes.forEach($checkbox => {
            skinCheckbox($checkbox, options)
        })
    }
}

export { skinCheckbox, skinCheckboxAll }
