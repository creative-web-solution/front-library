import { extend } from '@creative-web-solution/front-library/Helpers/Extend';
import { wrap } from '@creative-web-solution/front-library/DOM/wrap';
import { isString } from '@creative-web-solution/front-library/Helpers/Type';


const defaultOptions = {
    "wrap": "<span class=\"rb-skin\"></span>",
    "invalidClass": "invalid",
    "disabledClass": "disabled",
    "checkedClass": "checked"
};

/**
 * Skin an HTML input radio element.
 * You can access the skin API in the __skinAPI property of the $radio HTMLElement or its wrapper.
 * @class
 *
 * @param {HTMLElement} $radio
 * @param {Object} userOptions
 * @param {String} [userOptions.wrap=<span class="rb-skin"></span>]
 * @param {String} [userOptions.invalidClass=invalid]
 * @param {String} [userOptions.disabledClass=disabled]
 * @param {String} [userOptions.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 */
function SkinRadio( $radio, userOptions = {} ) {
    let $parent, $rdGroup, rdName, options;

    // Already skinned
    if ( $radio.__skinAPI ) {
        return;
    }

    options = extend( defaultOptions, userOptions );

    rdName = $radio.getAttribute( 'name' );

    // Store all radio with same name
    $rdGroup = $radio.__$rdGroup;

    if ( !$rdGroup ) {
        $rdGroup = document.querySelectorAll( `input[type="radio"][name="${ rdName }"]` );

        $rdGroup.forEach( $r => {
            $r.__$rdGroup = $rdGroup;
        } );
    }


    function update( $rd ) {
        $rd.__skinAPI[ $rd.checked ? 'check' : 'uncheck' ]();
    }


    function changeHandler() {
        $rdGroup.forEach( $rd => update( $rd ) );
    }


    /**
     * Force the radio button to be check
     */
    this.check = () => {
        $rdGroup.forEach( $r => {
            $r.checked = $r === $radio;
            $r.parentNode.classList[ $r === $radio ? 'add' : 'remove' ]( options.checkedClass );
        } );
    };


    /**
     * Force the radio button to be uncheck
     */
    this.uncheck = () => {
        $radio.checked = false;
        $radio.parentNode.classList.remove( options.checkedClass );
    };


    function enableDisable( fnName, disabled ) {
        $rdGroup.forEach( $r => {
            $r.disabled = disabled;
            $r.parentNode.classList[ fnName ]( options.disabledClass );
        } )
    }


    /**
     * Force the radio button to be enable
     */
    this.enable = () => {
        enableDisable( 'remove', false );
    };


    /**
     * Force the radio button to be disable
     */
    this.disable = () => {
        enableDisable( 'add', true );
    };


    function validInvalid( fnName ) {
        $rdGroup.forEach( $r => {
            $r.parentNode.classList[ fnName ]( options.invalidClass );
        } );
    }


    /**
     * Force the state of the radio button to invalid
     */
    this.setInvalid = () => {
        validInvalid( 'add' );
    };


    /**
     * Force the state of the radio button to valid
     */
    this.setValid = () => {
        validInvalid( 'remove' );
    };


    wrap( $radio, options.wrap );
    $parent = $radio.parentNode;

    $parent.__skinAPI = $radio.__skinAPI = this;

    if ( $radio.hasAttribute( 'data-error' ) ) {
        this.setInvalid();
    }

    $radio.addEventListener( 'click', changeHandler );

    update( $radio );
}


/**
 * Skin a radio input
 *
 * @function
 * @param {HTMLElement} $radio
 * @param {Object} options
 * @param {String} [options.wrap=<span class="rb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 *
 * @returns {SkinRadio}
*/
export function skinRadio( $radio, options ) {
    return new SkinRadio( $radio, options );
}


/**
 * Select all radio input in a $wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} [options]
 * @param {String} [options.wrap=<span class="rb-skin"></span>]
 * @param {String} [options.selector='input[type="radio"]']
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadioAll( $wrapper, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "selector": "input[type=\"radio\"]",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 *
 * @returns {SkinRadio[]}
*/
export function skinRadioAll( $wrapper, options = {} ) {
    let skinList, $radioButtons;

    $radioButtons = $wrapper.querySelectorAll( options.selector || 'input[type="radio"]' );
    skinList = [];

    $radioButtons.forEach( $radio => { skinList.push( skinRadio( $radio, options ) ) } );

    return skinList;
}


/**
 * Select all radio input of the same group (same name)
 *
 * @function
 * @param {HTMLElement|String} $radioButtonOrInputName
 * @param {Object} [options]
 * @param {String} [options.wrap=<span class="rb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadioGroup( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 *
 * @returns {SkinRadio[]}
*/
export function skinRadioGroup( $radioButtonOrInputName, options ) {
    let skinList, $radioGroup, inputName;

    inputName = isString( $radioButtonOrInputName ) ? $radioButtonOrInputName : $radioButtonOrInputName.getAttribute( 'name' );

    $radioGroup = document.querySelectorAll( `input[type="radio"][name="${ inputName }"]` );
    skinList = [];

    $radioGroup.forEach( $rd => {
        skinList.push( skinRadio( $rd, options ) );
    } );

    return skinList;
}
