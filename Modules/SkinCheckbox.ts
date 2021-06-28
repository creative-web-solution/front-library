import { extend } from '@creative-web-solution/front-library/Helpers/Extend';
import { wrap }   from '@creative-web-solution/front-library/DOM/Wrap';


const defaultOptions: SkinCheckboxOptionsType = {
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

    #$checkbox!: CustomCheckboxType;
    #options!:   SkinCheckboxOptionsType;
    #$parent!:   CustomCheckboxParentType;


    constructor( $checkbox: HTMLInputElement, userOptions: SkinCheckboxOptionsType = {} ) {

        // Already skinned
        if ( ($checkbox as CustomCheckboxType).__skinAPI ) {
            return;
        }

        this.#$checkbox = $checkbox;

        this.#options = extend( defaultOptions, userOptions );

        // Add the skin
        wrap( this.#$checkbox, this.#options.wrap! );

        this.#$parent = this.#$checkbox.parentNode as CustomCheckboxParentType;

        this.#$parent.__skinAPI = this.#$checkbox.__skinAPI = this;

        if ( this.#$checkbox.hasAttribute( 'data-has-error' ) ) {
            this.setInvalid();
        }

        this.#$checkbox.addEventListener( 'click', this.#changeHandler );

        this.update();
    }


    // Change the display
    private update() {
        this.#$checkbox.__skinAPI?.[ this.#$checkbox.checked ? 'check' : 'uncheck' ]();
    }


    #changeHandler = () => {
        this.update();
    }


    private checkUncheck( fnName: string, checked: boolean ) {
        this.#$checkbox.checked = checked;
        this.#$parent.classList[ fnName ]( this.#options.checkedClass );
    }


    private enableDisable( fnName: string, disabled: boolean ) {
        this.#$checkbox.disabled = disabled;
        this.#$parent.classList[ fnName ]( this.#options.disabledClass );
    }


    private validInvalid( fnName: string ) {
        this.#$parent.classList[ fnName ]( this.#options.invalidClass );
    }


    /**
     * Force the checkbox to be check
     */
    check() {
        this.checkUncheck( 'add', true );
    }


    /**
     * Force the checkbox to be uncheck
     */
    uncheck() {
        this.checkUncheck( 'remove', false );
    }


    /**
     * Force the checkbox to be enable
     */
    enable() {
        this.enableDisable( 'remove', false );
    };


    /**
     * Force the checkbox to be disable
     */
    disable() {
        this.enableDisable( 'add', true );
    };


    /**
     * Force the state of the checkbox to invalid
     */
    setInvalid() {
        this.validInvalid( 'add' );
    };


    /**
     * Force the state of the checkbox to valid
     */
    setValid() {
        this.validInvalid( 'remove' );
    };
}


/**
 * Skin a checkbox DOM element
 *
 * @example
 * // Call with default options:
 * skinCheckbox( $input, {
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
 *
 * @returns {SkinCheckbox}
*/
export function skinCheckbox( $checkbox: HTMLInputElement, options?: SkinCheckboxOptionsType ): SkinCheckbox {
    return new SkinCheckbox( $checkbox, options );
}


/**
 * Skin all checkbox DOM element in a wrapper
 *
 * @example
 * // Call with default options:
 * skinCheckboxAll( $wrapper,
 *   "selector": "input[type="checkbox"]",
 *   "wrap": "<span class=\"cb-skin\"></span>",
 *   "invalidClass": "invalid",
 *   "disabledClass": "disabled",
 *   "checkedClass": "checked"
 * });
*/
export function skinCheckboxAll( $wrapper: HTMLElement, options: SkinCheckboxAllOptionsType = {} ): SkinCheckbox[] {

    const $checkboxes = $wrapper.querySelectorAll( options.selector || 'input[type="checkbox"]' );

    const skinList: SkinCheckbox[]  = [];

    $checkboxes.forEach( $checkbox => {
        skinList.push( skinCheckbox( $checkbox as HTMLInputElement, options ) );
    } );

    return skinList;
}
