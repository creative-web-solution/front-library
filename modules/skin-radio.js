/*dependencies: dom::wrap,helpers::extend */
import { extend } from 'front-library/helpers/extend';
import { wrap } from 'front-library/dom/wrap';

/**
 * Skin a radio input
 *
 * @function
 * @param {HTMLElement} $radio
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.invalidClass=invalid]
 * @param {string} [options.disabledClass=disabled]
 * @param {string} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 */
let skinRadio;

/**
 * Select all radio input in a $wrapper
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
 * skinRadioAll( $wrapper, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 */
let skinRadioAll;

/**
 * Select all radio input of the same group (same name)
 *
 * @function
 * @param {HTMLElement} $radio
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.invalidClass=invalid]
 * @param {string} [options.disabledClass=disabled]
 * @param {string} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadioGroup( $radio, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 */
let skinRadioGroup;

{
    const defaultOptions = {
        wrap: '<span class="rb-skin"></span>',
        invalidClass: 'invalid',
        disabledClass: 'disabled',
        checkedClass: 'checked'
    }

    function RadioSkin($radio, userOptions = {}) {
        let $parent, $rdGroup, rdName, options

        // Already skinned
        if ($radio.__skinAPI) {
            return
        }

        options = extend(defaultOptions, userOptions)

        rdName = $radio.getAttribute('name')

        // Store all radio with same name
        $rdGroup = $radio.__$rdGroup

        if (!$rdGroup) {
            $rdGroup = document.querySelectorAll(
                'input[type="radio"][name="' + rdName + '"]'
            )

            $rdGroup.forEach($r => {
                $r.__$rdGroup = $rdGroup
            })
        }

        function update($rd) {
            $rd.__skinAPI[$rd.checked ? 'check' : 'uncheck']()
        }

        function changeHandler() {
            $rdGroup.forEach($rd => update($rd))
        }

        this.check = function check() {
            $rdGroup.forEach($r => {
                $r.checked = $r === $radio
                $r.parentNode.classList[$r === $radio ? 'add' : 'remove'](
                    options.checkedClass
                )
            })
        }

        this.uncheck = () => {
            $radio.checked = false
            $radio.parentNode.classList.remove(options.checkedClass)
        }

        function enableDisable(fnName, disabled) {
            $rdGroup.forEach($r => {
                $r.disabled = disabled
                $r.parentNode.classList[fnName](options.disabledClass)
            })
        }

        this.enable = () => {
            enableDisable('remove', false)
        }

        this.disable = () => {
            enableDisable('add', true)
        }

        function validInvalid(fnName) {
            $rdGroup.forEach($r => {
                $r.parentNode.classList[fnName](options.invalidClass)
            })
        }

        this.setInvalid = () => {
            validInvalid('add')
        }

        this.setValid = () => {
            validInvalid('remove')
        }

        wrap($radio, options.wrap)
        $parent = $radio.parentNode

        $parent.__skinAPI = $radio.__skinAPI = this

        if ($radio.hasAttribute('data-error')) {
            this.setInvalid()
        }

        $radio.addEventListener('click', changeHandler)

        update($radio)
    }

    skinRadio = function($radio) {
        new RadioSkin($radio)
    }

    skinRadioAll = function($wrapper) {
        let $radioButtons = $wrapper.querySelectorAll('input[type="radio"]')

        $radioButtons.forEach($radio => {
            skinRadio($radio)
        })
    }

    skinRadioGroup = function($radio) {
        let $radioGroup = document.querySelectorAll(
            'input[type="radio"][name="' + $radio.getAttribute('name') + '"]'
        )

        $radioGroup.forEach($rd => {
            skinRadio($rd)
        })
    }
}

export { skinRadio, skinRadioAll, skinRadioGroup }
