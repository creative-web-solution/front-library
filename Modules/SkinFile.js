import { extend } from '@creative-web-solution/front-library/Helpers/extend';
import { strToDOM } from '@creative-web-solution/front-library/DOM/strToDOM';
import { insertAfter, append } from '@creative-web-solution/front-library/DOM/manipulation';
import { on } from '@creative-web-solution/front-library/Events/EventsManager';


const defaultOptions = {
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
 *
 * @param {HTMLElement} $input
 * @param {Object} [userOptions]
 * @param {String} [userOptions.selector=".file-skin"]
 * @param {String} [userOptions.wrap=<div class="file-skin"></div>]
 * @param {String} [userOptions.fileInfoSelector=".file-info"]
 * @param {String} [userOptions.fileInfo=<div class="file-info"></div>]
 * @param {Boolean} [userOptions.autoHideFileInfo=true]
 * @param {String} [userOptions.resetButtonSelector=".file-reset"]
 * @param {String} [userOptions.resetButton=<span class="file-reset">&times;</span>]
 * @param {String} [userOptions.disabledClass=disabled]
 * @param {String} [userOptions.invalidClass=invalid]
 * @param {String} [userOptions.selectedClass=selected]
 */
function SkinFile( $input, userOptions = {} ) {
    let $fileInfo, $parent, $resetButton, fileInfoId, originalFileInfoText, options;

    options = extend( defaultOptions, userOptions );

    originalFileInfoText = '';


    function changeState() {
        let aValue;

        if ( !$input.value ) {
            $fileInfo.innerHTML = originalFileInfoText;

            if ( options.autoHideFileInfo && !originalFileInfoText ) {
                $fileInfo.style.display = 'none';
            }

            $parent.classList.remove( options.selectedClass );

            return;
        }

        aValue = $input.value.split( /(\\|\/)/ );

        $fileInfo.innerHTML = aValue[ aValue.length - 1 ];

        $parent.classList.add( options.selectedClass );

        if ( options.autoHideFileInfo ) {
            $fileInfo.style.display = '';
        }
    }


    function changeHandler() {
        changeState();
    }


    function clickHandler() {
        $input.click();
    }


    function resetHandler() {
        $input.value = '';
        changeState();
    }


    function enableDisable( fnName, disabled ) {
        $input.disabled = disabled;
        $parent.classList[ fnName ]( options.disabledClass );
    }


    /**
     * Force the select to be enable
     */
    this.enable = () => {
        enableDisable( 'remove', false );
    }


    /**
     * Force the select to be disable
     */
    this.disable = () => {
        enableDisable( 'add', true );
    }


    function validInvalid( fnName ) {
        $parent.classList[ fnName ]( options.invalidClass );
    }


    /**
     * Force the state of the select to invalid
     */
    this.setInvalid = () => {
        validInvalid( 'add' );
    };


    /**
     * Force the state of the select to valid
     */
    this.setValid = () => {
        validInvalid( 'remove' );
    };


    $parent = $input.closest( options.selector );


    if ( $parent ) {
        $resetButton = $parent.querySelector( options.resetButtonSelector );
        $fileInfo = $parent.querySelector( options.fileInfoSelector );
        originalFileInfoText = $fileInfo.innerHTML;
        originalFileInfoText = originalFileInfoText.trim();
    }
    else {
        $parent = strToDOM( options.wrap );

        insertAfter( $parent, $input );

        append( $input, $parent );

        if ( $input.hasAttribute( 'data-file-info' ) ) {
            fileInfoId = $input.getAttribute( 'data-file-info' );
            $fileInfo = document.getElementById( fileInfoId );
        }

        if ( $fileInfo ) {
            originalFileInfoText = $fileInfo.innerHTML;
            originalFileInfoText = originalFileInfoText.trim();
        }
        else {
            $fileInfo = strToDOM( options.fileInfo );
            append( $fileInfo, $parent );
        }


        if ( options.resetButton ) {
            $resetButton = strToDOM( options.resetButton );
            append( $resetButton, $parent );
        }
    }


    on( $input, {
        "eventsName": "change",
        "callback": changeHandler
    } );


    on( $fileInfo, {
        "eventsName": "click",
        "callback": clickHandler
    } );


    if ( $resetButton ) {
        on( $resetButton, {
            "eventsName": "click",
            "callback": resetHandler
        } );
    }


    changeState();

    $input.__skinAPI = $parent.__skinAPI = this;
}


/**
 * Skin an input file DOM element
 *
 * @function
 * @param {HTMLElement} $input
 * @param {Object} [options]
 * @param {String} [options.selector=".file-skin"]
 * @param {String} [options.wrap=<div class="file-skin"></div>]
 * @param {String} [options.fileInfoSelector=".file-info"]
 * @param {String} [options.fileInfo=<div class="file-info"></div>]
 * @param {Boolean} [options.autoHideFileInfo=true]
 * @param {String} [options.resetButtonSelector=".file-reset"]
 * @param {String} [options.resetButton=<span class="file-reset">&times;</span>]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.selectedClass=selected]
 *
 * @example // Call with default options:
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
 *
 * @returns {SkinFile}
*/
export function skinInputFile( $input, options ) {
    return new SkinFile( $input, options );
}


/**
 * Skin all input file DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} [options]
 * @param {String} [options.selector=".file-skin"]
 * @param {String} [options.wrap=<div class="file-skin"></div>]
 * @param {String} [options.fileInfoSelector=".file-info"]
 * @param {String} [options.fileInfo=<div class="file-info"></div>]
 * @param {Boolean} [options.autoHideFileInfo=true]
 * @param {String} [options.resetButtonSelector=".file-reset"]
 * @param {String} [options.resetButton=<span class="file-reset">&times;</span>]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.selectedClass=selected]
 *
 * @example // Call with default options:
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
 *
 * @returns {SkinFile[]}
*/
export function  skinInputFileAll( $wrapper, options = {} ) {
    let $inputs, skinList;

    skinList = [];

    $inputs = $wrapper.querySelectorAll( options.selector || 'input[type="file"]' );

    $inputs.forEach( $input => {
        skinList.push( new SkinFile( $input, options ) );
    } );

    return skinList;
}
