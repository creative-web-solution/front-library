import { extend } from 'front-library/Helpers/Extend';
import { wrap } from 'front-library/DOM/wrap';


const defaultOptions = {
    "wrap": "<span class=\"rb-skin\"></span>",
    "invalidClass": "invalid",
    "disabledClass": "disabled",
    "checkedClass": "checked"
};


function RadioSkin( $radio, userOptions = {} ) {
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


    this.check = function check() {
        $rdGroup.forEach( $r => {
            $r.checked = $r === $radio;
            $r.parentNode.classList[ $r === $radio ? 'add' : 'remove' ]( options.checkedClass );
        } );
    };


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


    this.enable = () => {
        enableDisable( 'remove', false );
    };


    this.disable = () => {
        enableDisable( 'add', true );
    };


    function validInvalid( fnName ) {
        $rdGroup.forEach( $r => {
            $r.parentNode.classList[ fnName ]( options.invalidClass );
        } );
    }


    this.setInvalid = () => {
        validInvalid( 'add' );
    };


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
 * @param {String} [options.wrap=<span class="cb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadio( $radio ) {
    new RadioSkin( $radio );
}


/**
 * Select all radio input in a $wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} options
 * @param {String} [options.wrap=<span class="cb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadioAll( $wrapper, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadioAll( $wrapper ) {
    let $radioButtons = $wrapper.querySelectorAll( 'input[type="radio"]' );

    $radioButtons.forEach( $radio => { skinRadio( $radio ) } );
}


/**
 * Select all radio input of the same group (same name)
 *
 * @function
 * @param {HTMLElement} $radio
 * @param {Object} options
 * @param {String} [options.wrap=<span class="cb-skin"></span>]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.checkedClass=checked]
 *
 * @example // Call with default options:
 * skinRadioGroup( $radio, {
 *  "wrap":  "<span class=\"cb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadioGroup( $radio ) {
    let $radioGroup = document.querySelectorAll( `input[type="radio"][name="${ $radio.getAttribute( 'name' ) }"]` );

    $radioGroup.forEach( $rd => {
        skinRadio( $rd );
    } );
}
