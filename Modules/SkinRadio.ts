import { extend }   from '../Helpers/Extend';
import { wrap }     from '../DOM/Wrap';
import { isString } from '../Helpers/Type';


const defaultOptions = {
    "wrap":          "<span class=\"rb-skin\"></span>",
    "invalidClass":  "invalid",
    "disabledClass": "disabled",
    "checkedClass":  "checked"
};


/**
 * Skin an HTML input radio element.
 * You can access the skin API in the __skinAPI property of the $radio HTMLElement or its wrapper.
 *
 * @example
 * // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 */
export default class SkinRadioButton {
    #$radio!:   CustomRadioButtonType;
    #options!:  SkinRadioOptionsType;
    #$parent!:  CustomRadioButtonParentType;
    #$rdGroup!: NodeList;

    constructor( $radio: HTMLInputElement, userOptions?: SkinRadioOptionsType ) {

        // Already skinned
        if ( ($radio as CustomRadioButtonType).__skinAPI ) {
            return;
        }

        this.#$radio = $radio;

        this.#options  = extend( defaultOptions, userOptions );

        const rdName = this.#$radio.getAttribute( 'name' );

        // Store all radio with same name

        if ( !this.#$radio.__$rdGroup ) {
            this.#$rdGroup = document.querySelectorAll( `input[type="radio"][name="${ rdName }"]` );

            this.#$rdGroup.forEach( $r => {
                ($r as CustomRadioButtonType).__$rdGroup = this.#$rdGroup;
            } );
        }
        else {
            this.#$rdGroup = this.#$radio.__$rdGroup;
        }


        wrap( this.#$radio, this.#options.wrap! );
        this.#$parent = this.#$radio.parentNode as CustomRadioButtonParentType;

        this.#$parent.__skinAPI = this.#$radio.__skinAPI = this;

        if ( this.#$radio.hasAttribute( 'data-error' ) ) {
            this.setInvalid();
        }

        this.#$radio.addEventListener( 'click', this.#changeHandler );

        this.update( this.#$radio );

    }


    private update( $rd ) {
        $rd.__skinAPI[ $rd.checked ? 'check' : 'uncheck' ]();
    }


    #changeHandler = () => {
        this.#$rdGroup.forEach( $rd => this.update( $rd ) );
    }


    private enableDisable( fnName: string, disabled: boolean ) {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r as HTMLInputElement).disabled = disabled;
            ($r.parentNode as HTMLElement).classList[ fnName ]( this.#options.disabledClass );
        } )
    }


    private validInvalid( fnName: string ) {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r.parentNode as HTMLElement).classList[ fnName ]( this.#options.invalidClass );
        } );
    }


    /**
     * Force the radio button to be check
     */
    check() {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r as HTMLInputElement).checked = $r === this.#$radio;
            ($r.parentNode as HTMLElement).classList[ $r === this.#$radio ? 'add' : 'remove' ]( this.#options.checkedClass! );
        } );
    };


    /**
     * Force the radio button to be uncheck
     */
    uncheck() {
        this.#$radio.checked = false;
        this.#$parent.classList.remove( this.#options.checkedClass! );
    };


    /**
     * Force the radio button to be enable
     */
    enable() {
        this.enableDisable( 'remove', false );
    };


    /**
     * Force the radio button to be disable
     */
    disable() {
        this.enableDisable( 'add', true );
    };


    /**
     * Force the state of the radio button to invalid
     */
    setInvalid() {
        this.validInvalid( 'add' );
    };


    /**
     * Force the state of the radio button to valid
     */
    setValid() {
        this.validInvalid( 'remove' );
    };
}


/**
 * Skin a radio input
 *
 * @example
 * // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadio( $radio: HTMLInputElement, options: SkinRadioOptionsType ): SkinRadioButton {
    return new SkinRadioButton( $radio, options );
}


/**
 * Select all radio input in a $wrapper
 *
 * @example
 * // Call with default options:
 * skinRadioAll( $wrapper, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "selector": "input[type=\"radio\"]",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadioAll( $wrapper: HTMLElement, options: SkinRadioAllOptionsType = {} ): SkinRadioButton[] {

    const $radioButtons = $wrapper.querySelectorAll( options.selector || 'input[type="radio"]' );
    const skinList: SkinRadioButton[] = [];

    $radioButtons.forEach( $radio => { skinList.push( skinRadio( $radio as HTMLInputElement, options ) ) } );

    return skinList;
}


/**
 * Select all radio input of the same group (same name)
 *
 * @example
 * // Call with default options:
 * skinRadioGroup( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
*/
export function skinRadioGroup( $radioButtonOrInputName: HTMLInputElement | string, options: SkinRadioOptionsType ): SkinRadioButton[] {

    const inputName = isString( $radioButtonOrInputName ) ? $radioButtonOrInputName : ($radioButtonOrInputName as HTMLInputElement).getAttribute( 'name' );

    const $radioGroup = document.querySelectorAll( `input[type="radio"][name="${ inputName }"]` );
    const skinList: SkinRadioButton[] = [];

    $radioGroup.forEach( $rd => {
        skinList.push( skinRadio( $rd as HTMLInputElement, options ) );
    } );

    return skinList;
}
