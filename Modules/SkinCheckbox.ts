import { extend } from '../Helpers/Extend';
import { wrap }   from '../DOM/Wrap';


const defaultOptions: FLib.SkinCheckbox.Options = {
    "wrap":          "<span class=\"cb-skin\"></span>",
    "invalidClass":  "invalid",
    "disabledClass": "disabled",
    "checkedClass":  "checked"
}


/**
 * Skin an HTML input checkbox element.
 * You can access the skin API in the __skinAPI property of the $checkbox HTMLElement or its wrapper.
 */
 export default class SkinCheckbox {

    #$checkbox!: FLib.SkinCheckbox.CustomCheckbox;
    #options!:   FLib.SkinCheckbox.Options;
    #$parent!:   FLib.SkinCheckbox.CustomCheckboxParent;


    constructor( $checkbox: HTMLInputElement, userOptions: Partial<FLib.SkinCheckbox.Options> = {} ) {

        // Already skinned
        if ( ($checkbox as FLib.SkinCheckbox.CustomCheckbox).__skinAPI ) {
            return;
        }

        this.#$checkbox = $checkbox;

        this.#options = extend( defaultOptions, userOptions );

        // Add the skin
        wrap( this.#$checkbox, this.#options.wrap );

        this.#$parent = this.#$checkbox.parentNode as FLib.SkinCheckbox.CustomCheckboxParent;

        this.#$parent.__skinAPI = this.#$checkbox.__skinAPI = this;

        if ( this.#$checkbox.hasAttribute( 'data-has-error' ) ) {
            this.setInvalid();
        }

        this.#$checkbox.addEventListener( 'click', this.#changeHandler );

        this.#update();
    }


    // Change the display
    #update = (): void => {
        this.#$checkbox.__skinAPI?.[ this.#$checkbox.checked ? 'check' : 'uncheck' ]();
    }


    #changeHandler = (): void => {
        this.#update();
    }


    #checkUncheck = ( fnName: string, checked: boolean ): void => {
        this.#$checkbox.checked = checked;
        this.#$parent.classList[ fnName ]( this.#options.checkedClass );
    }


    #enableDisable = ( fnName: string, disabled: boolean ): void => {
        this.#$checkbox.disabled = disabled;
        this.#$parent.classList[ fnName ]( this.#options.disabledClass );
    }


    #validInvalid = ( fnName: string ): void => {
        this.#$parent.classList[ fnName ]( this.#options.invalidClass );
    }


    /**
     * Force the checkbox to be check
     */
    check(): this {
        this.#checkUncheck( 'add', true );

        return this;
    }


    /**
     * Force the checkbox to be uncheck
     */
    uncheck(): this {
        this.#checkUncheck( 'remove', false );

        return this;
    }


    /**
     * Force the checkbox to be enable
     */
    enable(): this {
        this.#enableDisable( 'remove', false );

        return this;
    }


    /**
     * Force the checkbox to be disable
     */
    disable(): this {
        this.#enableDisable( 'add', true );

        return this;
    }


    /**
     * Force the state of the checkbox to invalid
     */
    setInvalid(): this {
        this.#validInvalid( 'add' );

        return this;
    }


    /**
     * Force the state of the checkbox to valid
     */
    setValid(): this {
        this.#validInvalid( 'remove' );

        return this;
    }
}


/**
 * Skin a checkbox DOM element
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinCheckbox( $input, {
 *   "wrap": "&lt;span class=\"cb-skin\"&gt;&lt;/span&gt;",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 * ```
*/
export function skinCheckbox( $checkbox: HTMLInputElement, options?: Partial<FLib.SkinCheckbox.Options> ): SkinCheckbox {
    return new SkinCheckbox( $checkbox, options );
}


/**
 * Skin all checkbox DOM element in a wrapper
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinCheckboxAll( $wrapper,
 *   "selector": "input[type="checkbox"]",
 *   "wrap": "&lt;span class=\"cb-skin\"&gt;&lt;/span&gt;",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 * ```
*/
export function skinCheckboxAll( $wrapper: HTMLElement, options: Partial<FLib.SkinCheckbox.AllOptions> = {} ): SkinCheckbox[] {

    const $checkboxes = $wrapper.querySelectorAll( options.selector || 'input[type="checkbox"]' );

    const skinList: SkinCheckbox[]  = [];

    $checkboxes.forEach( $checkbox => {
        skinList.push( skinCheckbox( $checkbox as HTMLInputElement, options ) );
    } );

    return skinList;
}
