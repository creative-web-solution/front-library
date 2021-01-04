import { extend } from '@creative-web-solution/front-library/Helpers/Extend';
import { wrap } from '@creative-web-solution/front-library/DOM/Wrap';


const defaultOptions = {
    "wrap": "<span class=\"cb-skin\"></span>",
    "invalidClass": "invalid",
    "disabledClass": "disabled",
    "checkedClass": "checked"
}


/**
 * Skin an HTML input checkbox element.
 * You can access the skin API in the __skinAPI property of the $checkbox HTMLElement or its wrapper.
 * @class
 *
 * @param {HTMLElement} $checkbox
 * @param {Object} userOptions
 * @param {String} [userOptions.wrap=<span class="cb-skin"></span>]
 * @param {String} [userOptions.invalidClass=invalid]
 * @param {String} [userOptions.disabledClass=disabled]
 * @param {String} [userOptions.checkedClass=checked]
 */
function SkinCheckbox( $checkbox, userOptions = {} ) {
    let $parent, options;

    // Already skinned
    if ( $checkbox.__skinAPI ) {
        return;
    }

    options = extend( defaultOptions, userOptions );


    // Change the display
    function update() {
        $checkbox.__skinAPI[ $checkbox.checked ? 'check' : 'uncheck' ]();
    }


    function changeHandler() {
        update();
    }

    function checkUncheck( fnName, checked ) {
        $checkbox.checked = checked;
        $parent.classList[ fnName ]( options.checkedClass );
    }


    /**
     * Force the checkbox to be check
     */
    this.check = () => {
        checkUncheck( 'add', true );
    }


    /**
     * Force the checkbox to be uncheck
     */
    this.uncheck = () => {
        checkUncheck( 'remove', false );
    }


    function enableDisable( fnName, disabled ) {
        $checkbox.disabled = disabled;
        $checkbox.parentNode.classList[ fnName ]( options.disabledClass );
    }


    /**
     * Force the checkbox to be enable
     */
    this.enable = () => {
        enableDisable( 'remove', false );
    };


    /**
     * Force the checkbox to be disable
     */
    this.disable = () => {
        enableDisable( 'add', true );
    };


    function validInvalid( fnName ) {
        $checkbox.parentNode.classList[ fnName ]( options.invalidClass );
    }


    /**
     * Force the state of the checkbox to invalid
     */
    this.setInvalid = () => {
        validInvalid( 'add' );
    };


    /**
     * Force the state of the checkbox to valid
     */
    this.setValid = () => {
        validInvalid( 'remove' );
    };


    // Add the skin
    wrap( $checkbox, options.wrap );

    $parent = $checkbox.parentNode;

    $parent.__skinAPI = $checkbox.__skinAPI = this;

    if ( $checkbox.hasAttribute( 'data-has-error' ) ) {
        this.setInvalid();
    }

    $checkbox.addEventListener( 'click', changeHandler );

    update();
}


/**
 * Skin a checkbox DOM element
 *
 * @function
 * @param {HTMLElement} $checkbox
 * @param {Object} options
 * @param {String} [options.wrap=<span class="cb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinCheckbox( $input, {
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 *
 * @returns {SkinCheckbox}
*/
export function skinCheckbox( $checkbox, options ) {
    return new SkinCheckbox( $checkbox, options );
}


/**
 * Skin all checkbox DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} [options]
 * @param {String} [options.wrap=<span class="cb-skin"></span>]
 * @param {String} [options.selector='input[type="checkbox"]']
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinCheckboxAll( $wrapper,
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 *
 * @returns {SkinCheckbox[]}
*/
export function skinCheckboxAll( $wrapper, options = {} ) {
    let $checkboxes, skinList;

    $checkboxes = $wrapper.querySelectorAll( options.selector || 'input[type="checkbox"]' );

    skinList = [];

    $checkboxes.forEach( $checkbox => {
        skinList.push( skinCheckbox( $checkbox, options ) );
    } );

    return skinList;
}
