import { extend }              from '../Helpers/Extend';
import { strToDOM }            from '../DOM/StrToDOM';
import { insertAfter, append } from '../DOM/Manipulation';
import { on }                  from '../Events/EventsManager';


const defaultOptions: SkinFileOptionsType = {
    "selector": ".file-skin",
    "wrap": "<div class=\"file-skin\"></div>",
    "fileInfoSelector": ".file-info",
    "fileInfo": "<div class=\"file-info\"></div>",
    "autoHideFileInfo": true,
    "resetButtonSelector": ".file-reset",
    "resetButton": "<span class=\"file-reset\">&times;</span>",
    "disabledClass": "disabled",
    "invalidClass": "invalid",
    "selectedClass": "selected"
}


/**
 * Skin an HTML input file element.
 * @class
 */
 export default class SkinFile {

    #options:             SkinFileOptionsType;
    #$parent:             CustomInputFileParentType;
    #$resetButton!:       HTMLElement | null;
    #$fileInfo!:          HTMLElement | null;
    #fileInfoId:          string = '';
    #$input:              CustomInputFileType;

    #originalFileInfoText = '';


    constructor( $input: HTMLInputElement, userOptions?: SkinFileOptionsType ) {

        this.#$input  = $input;
        this.#options = extend( defaultOptions, userOptions );

        const $PARENT = this.#$input.closest( this.#options.selector! );

        // The html skin is already done. Just selecting elements for the initialistion
        if ( $PARENT ) {
            this.#$parent              = $PARENT as CustomInputFileParentType;
            this.#$resetButton         = this.#$parent.querySelector( this.#options.resetButtonSelector! );
            if ( !this.#$resetButton ) {
                throw `[SkinFile]: "${ this.#options.resetButtonSelector }" not found`;
            }

            this.#$fileInfo            = this.#$parent.querySelector( this.#options.fileInfoSelector! );
            if ( !this.#$fileInfo ) {
                throw `[SkinFile]: "${ this.#options.fileInfoSelector }" not found`;
            }

            this.#originalFileInfoText = this.#$fileInfo.innerHTML;
            this.#originalFileInfoText = this.#originalFileInfoText.trim();
        }
        // No HTML skin, just input:file alone. Create the whole skin here:
        else {
            this.#$parent = strToDOM( this.#options.wrap! ) as HTMLElement;

            insertAfter( this.#$parent, this.#$input );

            append( this.#$input, this.#$parent );

            if ( this.#$input.hasAttribute( 'data-file-info' ) ) {
                this.#fileInfoId = this.#$input.getAttribute( 'data-file-info' ) || '';
                this.#$fileInfo  = document.getElementById( this.#fileInfoId );
            }

            if ( this.#$fileInfo !== null ) {
                this.#originalFileInfoText = this.#$fileInfo.innerHTML;
                this.#originalFileInfoText = this.#originalFileInfoText.trim();
            }
            else {
                this.#$fileInfo = strToDOM( this.#options.fileInfo! ) as HTMLElement;
                append( this.#$fileInfo, this.#$parent );
            }

            if ( this.#options.resetButton ) {
                this.#$resetButton = strToDOM( this.#options.resetButton ) as HTMLElement;
                append( this.#$resetButton, this.#$parent );
            }
        }


        on( this.#$input, {
            "eventsName": "change",
            "callback": this.#changeHandler
        } );


        on( this.#$fileInfo, {
            "eventsName": "click",
            "callback": this.#clickHandler
        } );


        if ( this.#$resetButton ) {
            on( this.#$resetButton, {
                "eventsName": "click",
                "callback": this.#resetHandler
            } );
        }

        this.changeState();

        this.#$input.__skinAPI = this.#$parent.__skinAPI = this;
    }


    private changeState() {
        let aValue;

        if ( !this.#$input.value ) {
            this.#$fileInfo!.innerHTML = this.#originalFileInfoText;

            if ( this.#options.autoHideFileInfo && !this.#originalFileInfoText ) {
                this.#$fileInfo!.style.display = 'none';
            }

            this.#$parent.classList.remove( this.#options.selectedClass! );

            return;
        }

        aValue = this.#$input.value.split( /(\\|\/)/ );

        this.#$fileInfo!.innerHTML = aValue[ aValue.length - 1 ];

        this.#$parent.classList.add( this.#options.selectedClass! );

        if ( this.#options.autoHideFileInfo ) {
            this.#$fileInfo!.style.display = '';
        }
    }


    #changeHandler = () => {
        this.changeState();
    }


    #clickHandler = () => {
        this.#$input.click();
    }


    #resetHandler = () => {
        this.#$input.value = '';
        this.changeState();
    }


    private enableDisable( fnName: string, disabled: boolean ) {
        this.#$input.disabled = disabled;
        this.#$parent.classList[ fnName ]( this.#options.disabledClass );
    }


    /**
     * Force the select to be enable
     */
    enable() {
        this.enableDisable( 'remove', false );
    }


    /**
     * Force the select to be disable
     */
    disable() {
        this.enableDisable( 'add', true );
    }


    private validInvalid( fnName: string ) {
        this.#$parent.classList[ fnName ]( this.#options.invalidClass );
    }


    /**
     * Force the state of the select to invalid
     */
    setInvalid() {
        this.validInvalid( 'add' );
    };


    /**
     * Force the state of the select to valid
     */
    setValid() {
        this.validInvalid( 'remove' );
    };
}


/**
 * Skin an input file DOM element
 *
 *
 * @example
 * // Call with default options:
 * skinInputFile( $input, {
 *  "selector": ".file-skin",
 *  "wrap": "<div class=\"file-skin\"></div>",
 *  "fileInfoSelector": ".file-info",
 *  "fileInfo": "<div class=\"file-info\"></div>",
 *  "autoHideFileInfo": true,
 *  "resetButtonSelector": ".file-reset",
 *  "resetButton": "<span class=\"file-reset\">&times;</span>",
 *  "disabledClass": "disabled",
 *  "invalidClass": "invalid",
 *  "selectedClass": "selected"
 * } );
*/
export function skinInputFile( $input: HTMLInputElement, options: SkinFileOptionsType ): SkinFile {
    return new SkinFile( $input, options );
}


/**
 * Skin all input file DOM element in a wrapper
 *
 * @example
 * // Call with default options:
 * skinInputFileAll( $wrapper, {
 *  "selector": ".file-skin",
 *  "wrap": "<div class=\"file-skin\"></div>",
 *  "fileInfoSelector": ".file-info",
 *  "fileInfo": "<div class=\"file-info\"></div>",
 *  "autoHideFileInfo": true,
 *  "resetButtonSelector": ".file-reset",
 *  "resetButton": "<span class=\"file-reset\">&times;</span>",
 *  "disabledClass": "disabled",
 *  "invalidClass": "invalid",
 *  "selectedClass": "selected"
 * } );
*/
export function skinInputFileAll( $wrapper: HTMLElement, options: SkinFileAllOptionsType = {} ): SkinFile[] {
    const skinList: SkinFile[] = [];

    const $inputs = $wrapper.querySelectorAll( options.selector || 'input[type="file"]' );

    $inputs.forEach( $input => {
        skinList.push( new SkinFile( $input as HTMLInputElement, options ) );
    } );

    return skinList;
}
