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
 * ```ts
 * // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "&lt;span class=\"rb-skin\"&gt;&lt;/span&gt;",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 * ```
 */
export default class SkinRadioButton implements FLib.SkinRadio.SkinRadio {
    #$radio:   FLib.SkinRadio.CustomRadioButton;
    #options:  FLib.SkinRadio.Options;
    #$parent:  FLib.SkinRadio.CustomRadioButtonParent;
    #$rdGroup: NodeListOf<FLib.SkinRadio.CustomRadioButton>;

    constructor( $radio: HTMLInputElement, userOptions?: Partial<FLib.SkinRadio.Options> ) {

        // Already skinned
        if ( ($radio as FLib.SkinRadio.CustomRadioButton).__skinAPI ) {
            throw 'SkinSelect: Select already skinned';
        }

        this.#$radio = $radio;

        this.#options  = extend( defaultOptions, userOptions );

        const rdName = this.#$radio.getAttribute( 'name' );

        // Store all radio with same name

        if ( !this.#$radio.__$radioGroup ) {
            this.#$rdGroup = document.querySelectorAll( `input[type="radio"][name="${ rdName }"]` ) as NodeListOf<FLib.SkinRadio.CustomRadioButton>;

            this.#$rdGroup.forEach( $r => {
                ($r as FLib.SkinRadio.CustomRadioButton).__$radioGroup = this.#$rdGroup;
            } );
        }
        else {
            this.#$rdGroup = this.#$radio.__$radioGroup;
        }


        wrap( this.#$radio, this.#options.wrap );
        this.#$parent = this.#$radio.parentNode as FLib.SkinRadio.CustomRadioButtonParent;

        this.#$parent.__skinAPI = this.#$radio.__skinAPI = this;

        if ( this.#$radio.hasAttribute( 'data-error' ) ) {
            this.setInvalid();
        }

        this.#$radio.addEventListener( 'click', this.#changeHandler );

        this.#update( this.#$radio );

    }


    #update = ( $rd: FLib.SkinRadio.CustomRadioButton ): void => {
        $rd.__skinAPI[ $rd.checked ? 'check' : 'uncheck' ]();
    }


    #changeHandler = (): void => {
        this.#$rdGroup.forEach( $rd => this.#update( $rd ) );
    }


    #enableDisable = ( fnName: string, disabled: boolean ): void => {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r as HTMLInputElement).disabled = disabled;
            ($r.parentNode as HTMLElement).classList[ fnName ]( this.#options.disabledClass );
        } )
    }


    #validInvalid = ( fnName: string ): void => {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r.parentNode as HTMLElement).classList[ fnName ]( this.#options.invalidClass );
        } );
    }


    /**
     * Force the radio button to be check
     */
    check(): this {
        this.#$rdGroup.forEach( ( $r: Node ) => {
            ($r as HTMLInputElement).checked = $r === this.#$radio;
            ($r.parentNode as HTMLElement).classList[ $r === this.#$radio ? 'add' : 'remove' ]( this.#options.checkedClass );
        } );

        return this;
    }


    /**
     * Force the radio button to be uncheck
     */
    uncheck(): this {
        this.#$radio.checked = false;
        this.#$parent.classList.remove( this.#options.checkedClass );

        return this;
    }


    /**
     * Force the radio button to be enable
     */
    enable(): this {
        this.#enableDisable( 'remove', false );

        return this;
    }


    /**
     * Force the radio button to be disable
     */
    disable(): this {
        this.#enableDisable( 'add', true );

        return this;
    }


    /**
     * Force the state of the radio button to invalid
     */
    setInvalid(): this {
        this.#validInvalid( 'add' );

        return this;
    }


    /**
     * Force the state of the radio button to valid
     */
    setValid(): this {
        this.#validInvalid( 'remove' );

        return this;
    }
}


/**
 * Skin a radio input
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinRadio( $radio, {
 *  "wrap":  "&lt;span class=\"rb-skin\"&gt;&lt;/span&gt;",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 * ```
*/
export function skinRadio( $radio: HTMLInputElement, options: Partial<FLib.SkinRadio.Options> ): SkinRadioButton {
    return new SkinRadioButton( $radio, options );
}


/**
 * Select all radio input in a $wrapper
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinRadioAll( $wrapper, {
 *  "wrap":  "&lt;span class=\"rb-skin\"&gt;&lt;/span&gt;",
 *  "selector": "input[type=\"radio\"]",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 * ```
*/
export function skinRadioAll( $wrapper: HTMLElement, options: Partial<FLib.SkinRadio.AllOptions> = {} ): SkinRadioButton[] {

    const $radioButtons = $wrapper.querySelectorAll( options.selector || 'input[type="radio"]' );
    const skinList: SkinRadioButton[] = [];

    $radioButtons.forEach( $radio => { skinList.push( skinRadio( $radio as HTMLInputElement, options ) ) } );

    return skinList;
}


/**
 * Select all radio input of the same group (same name)
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinRadioGroup( $radio, {
 *  "wrap":  "<span class=\"rb-skin\"></span>",
 *  "invalidClass": "invalid",
 *  "disabledClass": "disabled",
 *  "checkedClass": "checked"
 * } );
 * ```
*/
export function skinRadioGroup( $radioButtonOrInputName: HTMLInputElement | string, options: FLib.SkinRadio.Options ): SkinRadioButton[] {

    const inputName = isString( $radioButtonOrInputName ) ? $radioButtonOrInputName : ($radioButtonOrInputName as HTMLInputElement).getAttribute( 'name' );

    const $radioGroup = document.querySelectorAll( `input[type="radio"][name="${ inputName }"]` );
    const skinList: SkinRadioButton[] = [];

    $radioGroup.forEach( $rd => {
        skinList.push( skinRadio( $rd as HTMLInputElement, options ) );
    } );

    return skinList;
}
