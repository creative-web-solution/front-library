import { extend }              from '../Helpers/Extend';
import { strToDOM }            from '../DOM/StrToDOM';
import { insertAfter, append } from '../DOM/Manipulation';
import { on }                  from '../Events/EventsManager';


const defaultOptions: FLib.SkinFile.Options = {
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
 */
 export default class SkinFile implements FLib.SkinFile.SkinFile {

    #options:             FLib.SkinFile.Options;
    #$parent:             FLib.SkinFile.CustomInputFileParent;
    #$resetButton:        HTMLElement | undefined;
    #$fileInfo:           HTMLElement | undefined;
    #fileInfoId           = '';
    #$input:              FLib.SkinFile.CustomInputFile;

    #originalFileInfoText = '';


    constructor( $input: HTMLInputElement, userOptions?: Partial<FLib.SkinFile.Options> ) {

        this.#$input  = $input;
        this.#options = extend( defaultOptions, userOptions );

        const $PARENT = this.#$input.closest( this.#options.selector );

        // The html skin is already done. Just selecting elements for the initialistion
        if ( $PARENT ) {
            this.#$parent              = $PARENT as FLib.SkinFile.CustomInputFileParent;
            this.#$resetButton         = this.#$parent.querySelector( this.#options.resetButtonSelector ) as HTMLElement;
            if ( !this.#$resetButton ) {
                throw `[SkinFile]: "${ this.#options.resetButtonSelector }" not found`;
            }

            this.#$fileInfo            = this.#$parent.querySelector( this.#options.fileInfoSelector ) as HTMLElement;
            if ( !this.#$fileInfo ) {
                throw `[SkinFile]: "${ this.#options.fileInfoSelector }" not found`;
            }

            this.#originalFileInfoText = this.#$fileInfo.innerHTML;
            this.#originalFileInfoText = this.#originalFileInfoText.trim();
        }
        // No HTML skin, just input:file alone. Create the whole skin here:
        else {
            this.#$parent = strToDOM( this.#options.wrap ) as HTMLElement;

            insertAfter( this.#$parent, this.#$input );

            append( this.#$input, this.#$parent );

            if ( this.#$input.hasAttribute( 'data-file-info' ) ) {
                this.#fileInfoId = this.#$input.getAttribute( 'data-file-info' ) || '';
                this.#$fileInfo  = document.getElementById( this.#fileInfoId ) as HTMLElement;
            }

            if ( this.#$fileInfo ) {
                this.#originalFileInfoText = this.#$fileInfo.innerHTML;
                this.#originalFileInfoText = this.#originalFileInfoText.trim();
            }
            else {
                this.#$fileInfo = strToDOM( this.#options.fileInfo ) as HTMLElement;
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

        this.#changeState();

        this.#$input.__skinAPI = this.#$parent.__skinAPI = this;
    }


    #changeState = (): void => {

        if ( !this.#$input.value ) {
            ( this.#$fileInfo as HTMLElement ).innerHTML = this.#originalFileInfoText;

            if ( this.#options.autoHideFileInfo && !this.#originalFileInfoText ) {
                ( this.#$fileInfo as HTMLElement ).style.display = 'none';
            }

            this.#$parent.classList.remove( this.#options.selectedClass );

            return;
        }

        const aValue = this.#$input.value.split( /(\\|\/)/ );

        ( this.#$fileInfo as HTMLElement ).innerHTML = aValue[ aValue.length - 1 ];

        this.#$parent.classList.add( this.#options.selectedClass );

        if ( this.#options.autoHideFileInfo ) {
            ( this.#$fileInfo as HTMLElement ).style.display = '';
        }
    }


    #changeHandler = (): void => {
        this.#changeState();
    }


    #clickHandler = (): void => {
        this.#$input.click();
    }


    #resetHandler = (): void => {
        this.#$input.value = '';
        this.#changeState();
    }


    #enableDisable = ( fnName: string, disabled: boolean ): void => {
        this.#$input.disabled = disabled;
        this.#$parent.classList[ fnName ]( this.#options.disabledClass );
    }


    /**
     * Force the select to be enable
     */
    enable(): this {
        this.#enableDisable( 'remove', false );

        return this;
    }


    /**
     * Force the select to be disable
     */
    disable(): this {
        this.#enableDisable( 'add', true );

        return this;
    }


    #validInvalid = ( fnName: string ): void => {
        this.#$parent.classList[ fnName ]( this.#options.invalidClass );
    }


    /**
     * Force the state of the select to invalid
     */
    setInvalid(): this {
        this.#validInvalid( 'add' );

        return this;
    }


    /**
     * Force the state of the select to valid
     */
    setValid(): this {
        this.#validInvalid( 'remove' );

        return this;
    }
}


/**
 * Skin an input file DOM element
 *
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinInputFile( $input, {
 *  "selector": ".file-skin",
 *  "wrap": "&lt;div class=\"file-skin\"&gt;&lt;/div&gt;",
 *  "fileInfoSelector": ".file-info",
 *  "fileInfo": "&lt;div class=\"file-info\"&gt;&lt;/div&gt;",
 *  "autoHideFileInfo": true,
 *  "resetButtonSelector": ".file-reset",
 *  "resetButton": "&lt;span class=\"file-reset\"&gt;&times;&lt;/span&gt;",
 *  "disabledClass": "disabled",
 *  "invalidClass": "invalid",
 *  "selectedClass": "selected"
 * } );
 * ```
*/
export function skinInputFile( $input: HTMLInputElement, options: Partial<FLib.SkinFile.Options> ): SkinFile {
    return new SkinFile( $input, options );
}


/**
 * Skin all input file DOM element in a wrapper
 *
 * @example
 * ```ts
 * // Call with default options:
 * skinInputFileAll( $wrapper, {
 *  "selector": ".file-skin",
 *  "wrap": "&lt;div class=\"file-skin\"&gt;&lt;/div&gt;",
 *  "fileInfoSelector": ".file-info",
 *  "fileInfo": "&lt;div class=\"file-info\"&gt;&lt;/div&gt;",
 *  "autoHideFileInfo": true,
 *  "resetButtonSelector": ".file-reset",
 *  "resetButton": "&lt;span class=\"file-reset\"&gt;&times;&lt;/span&gt;",
 *  "disabledClass": "disabled",
 *  "invalidClass": "invalid",
 *  "selectedClass": "selected"
 * } );
 * ```
*/
export function skinInputFileAll( $wrapper: HTMLElement, options: Partial<FLib.SkinFile.AllOptions> = {} ): SkinFile[] {
    const skinList: SkinFile[] = [];

    const $inputs = $wrapper.querySelectorAll( options.selector || 'input[type="file"]' );

    $inputs.forEach( $input => {
        skinList.push( new SkinFile( $input as HTMLInputElement, options ) );
    } );

    return skinList;
}
