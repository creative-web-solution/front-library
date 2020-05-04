import { fire, on, off } from 'front-library/Events/EventsManager';
import { extend } from 'front-library/Helpers/Extend';
import { isNumber } from 'front-library/Helpers/Type';
import { template } from 'front-library/Modules/template';
import { wrap } from 'front-library/DOM/wrap';
import { strToDOM } from 'front-library/DOM/strToDOM';
import { index } from 'front-library/DOM/index';
import { hClass, aClass } from 'front-library/DOM/Class';
import { rClass } from 'front-library/DOM/Class';
import { position } from 'front-library/DOM/position';
import { height } from 'front-library/DOM/Size';
import { outerHeight } from 'front-library/DOM/OuterSize';


const defaultOptions = {
    "full": false,
    "extraClass": [],
    "className": "select-skin",
    "itemClassName": "select-itm",
    "selectWrapClassName": "select",
    "layerClassName": "select-layer",
    "hoverItemClass": "hover",
    "openedListClass": "show",
    "activeOptionClass": "on",
    "disabledClass": "disabled",
    "invalidClass": "invalid",
    "loadingClass": "loading",
    "listTpl": [
        '<div class="select-layer">',
        '<ul class="select-list">',
        '<% for ( var i = 0, len = list.length; i < len; ++i ) { %>',
        '<li class="select-itm<%= list[ i ].selected ? " on" : "" %>" data-value="<%= list[ i ].value %>">',
        '<%= list[ i ].text %>',
        '</li>',
        '<% } %>',
        '</ul>',
        '</div>'
    ].join('')
};


/**
 * Skin an HTML select element. If options.full is set to true, also skin the options list.
 * You can access the skin API in the __skinAPI property of the $select HTMLElement or its wrapper.
 * @class
 *
 * @param {HTMLElement} $select
 * @param {Object} [userOptions]
 * @param {Boolean} [userOptions.full=false] - if true, skin event the option list
 * @param {Array} [userOptions.extraClass=[]]
 * @param {String} [userOptions.className=select-skin]
 * @param {String} [userOptions.itemClassName=select-itm]
 * @param {String} [userOptions.selectWrapClassName=select]
 * @param {String} [userOptions.openedListClass=show]
 * @param {String} [userOptions.activeOptionClass=on]
 * @param {String} [userOptions.disabledClass=disabled]
 * @param {String} [userOptions.invalidClass=invalid]
 * @param {String} [userOptions.loadingClass=loading]
 * @param {String} [userOptions.listTpl]
 */
function SkinSelect( $select, userOptions = {} ) {
    var $parent,
        extraClass,
        $span,
        $lastOption,
        loading,
        $layer,
        focusedItemIndex,
        $options,
        isListOpened,
        options;

    const SELF = this;

    loading = false;

    if ( $select.hasAttribute('multiple') || $select.__skinAPI ) {
        return;
    }

    options = extend( defaultOptions, userOptions );

    extraClass = options.extraClass.join( ' ' );

    if ( $select.hasAttribute( 'data-class' ) ) {
        extraClass = [extraClass, $select.getAttribute('data-class')].join( ' ' );
    }


    function closeList() {
        $parent.classList.remove( options.openedListClass );

        off( document.body, {
            "eventsName": "click",
            "callback":   closeList
        } );

        isListOpened = false;

        removeItemFocus();

    }


    function openList( e ) {
        e && e.stopPropagation();

        if ( $select.disabled || loading ) {
            return;
        }

        if ( isListOpened ) {
            closeList();
            return;
        }

        $parent.classList.add( options.openedListClass );

        on( document.body, {
            "eventsName": "click",
            "callback":   closeList
        } );

        if ( $options ) {
            if ( $lastOption ) {
                focusedItemIndex = index( $lastOption );
                focusedItemIndex = focusedItemIndex > -1 ? focusedItemIndex : null;
            }

            focusItem( focusedItemIndex !== null ? focusedItemIndex : 0 );
        }

        isListOpened = true;
    }


    function enableDisable( fnName, disabled ) {
        $select.disabled = disabled;
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


    function loadingStatus( fnName, isLoading ) {
        loading = isLoading;
        $parent.classList[ fnName ]( options.loadingClass );
    }


    /**
     * Add the loading css class to the main element
     */
    this.setLoading = () => {
        loadingStatus( 'add', true );
    }


    /**
     * Remove the loading css class to the main element
     */
    this.unsetLoading = () => {
        loadingStatus( 'remove', false );
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


    /**
     * Force the update of title with the currently selected element text
     */
    this.updateTitle = () => {
        let title;

        if ( $select.selectedIndex < 0 ) {
            $span.innerHTML = '';
            closeList();
            return;
        }

        title = $select.options[ $select.selectedIndex ].text;

        $span.innerHTML = title;

        closeList();
    }


    /**
     * Select an option
     *
     * @param {HTMLElement|Number} optionOrIndex
     */
    this.select = optionOrIndex => {
        let _index, option, isParameterANumber;

        if ( $select.disabled || loading ) {
            return;
        }

        isParameterANumber = isNumber( optionOrIndex );

        if ( isParameterANumber ) {
            _index = optionOrIndex;
        }
        else {
            _index = index( optionOrIndex );
        }

        if ( _index < 0 || _index > $select.options.length ) {
            return;
        }

        $select.options[ _index ].selected = true;

        if ( options.full ) {
            option = $parent.querySelectorAll( `.${ options.itemClassName }` )[ _index ];

            if ( $lastOption ) {
                $lastOption.classList.remove( options.activeOptionClass );
            }

            if ( option ) {
                option.classList.add( options.activeOptionClass );
                $lastOption = option;
            }
        }

        fire( $select, {
            "eventsName": "change"
        } );
    }


    function setSelectOptions( data ) {
        let normalizedData, hasSelectedOption;

        $select.options.length = 0;

        normalizedData = data.map( dt => {
            if ( dt.selected ) {
                hasSelectedOption = true;
            }

            return {
                "text":     dt.text || dt.nm,
                "value":    dt.value || dt.vl,
                "selected": dt.selected || false
            }
        } );

        if ( !hasSelectedOption ) {
            normalizedData[ 0 ].selected = true;
        }

        normalizedData.forEach( ( optionData ) => {
            $select.options.add(
                new Option( optionData.text, optionData.value, false, optionData.selected )
            );
        } );
    }


    /**
     * Update the options list. If optionsArray is not set, only update the html of the skinned options list.
     *
     * @param {Array} [optionsArray]
     *
     * @example selectAPI.updateOptions( [{"text": "Option 1", "value": "value 1", "selected": true}, ...] )
     */
    this.updateOptions = optionsArray => {
        let htmlList;

        $lastOption = null;
        focusedItemIndex = null;

        if ( optionsArray ) {
            setSelectOptions( optionsArray );
            SELF.updateTitle( true );
        }

        if ( !options.full ) {
            return;
        }

        $select.style.display = 'none';
        $span.setAttribute( 'tabindex', '0' );
        closeList();

        if ( $layer && $layer.parentNode ) {
            $layer.parentNode.removeChild( $layer );
        }

        htmlList = template( options.listTpl, { "list": $select.options } );
        $parent.appendChild( strToDOM( htmlList ) );

        $layer     = $parent.querySelector( `.${ options.layerClassName }` );
        $options   = $layer.querySelectorAll( 'li' );

        $lastOption = $parent.querySelector( `li.${ options.activeOptionClass }` );
    }


    function changeHandler() {
        SELF.updateTitle();
    }


    // Handle click on the skinned ul>li list
    function fakeOptionsClickHandler( e ) {
        if ( !e.target.matches( '.' + options.itemClassName ) ) {
            return;
        }
        SELF.select( e.target );
    }


    function focusItem( index ) {
        if ( index < 0 ) {
            index = $options.length - 1;
        }
        if ( index >= $options.length ) {
            index = 0;
        }
        if ( !$options[ index ] ) {
            return;
        }

        removeItemFocus();

        aClass( $options[ index ], options.hoverItemClass );
        updateListScroll( $options[ index ] );

        focusedItemIndex = index;
    }


    function removeItemFocus() {
        if ( focusedItemIndex !== null && $options && $options[ focusedItemIndex ] ) {
            rClass( $options[ focusedItemIndex ], options.hoverItemClass );
            focusedItemIndex = null;
        }
    }


    function updateListScroll( $item ) {
        let itemPos, itemHeight, layerScrollTop, layerHeight;

        if ( $layer ) {
            itemPos     = position( $item );
            itemHeight  = outerHeight( $item );
            layerHeight = height( $layer );
            layerScrollTop   = $layer.scrollTop;

            if ( itemPos.top + itemHeight > layerHeight + layerScrollTop)  {
                $layer.scrollTop = itemPos.top - layerHeight + itemHeight;
            }
            else if ( layerScrollTop > 0 && itemPos.top < layerScrollTop ) {
                $layer.scrollTop = itemPos.top;
            }
        }
    }


    function onKeydown( e ) {
        switch ( e.keyCode ) {
            case 38: // UP
            case 40: // DOWN
            case 13: // ENTER
            case 27: // ESCAPE
                e.preventDefault();
                break;
        }
    }


    function onKeyup( e ) {
        switch ( e.keyCode ) {
            case 38: // UP
                focusItem( focusedItemIndex - 1 );
                break;
            case 40: // DOWN
                if ( !isListOpened ) {
                    openList();
                    break;
                }
                focusItem( focusedItemIndex + 1 );
                break;

            case 13: // ENTER
            case 32: // SPACE
                if ( !isListOpened ) {
                    openList();
                    break;
                }
                SELF.select( focusedItemIndex );
                closeList();
                break;

            case 27: // ESCAPE
                closeList();
                break;
        }
    }


    // Create skin
    if ( !hClass( $select.parentNode, options.className ) ) {
        wrap(
            $select,
            `<span class="${ options.className } ${ extraClass }"></span>`
        );
    }

    $parent = $select.parentNode;

    $span = $parent.querySelector( `.${ options.selectWrapClassName }`);

    if ( !$span ) {
        $span = document.createElement( 'SPAN' );
        aClass( $span, options.selectWrapClassName );
        $parent.appendChild( $span );
    }

    this.updateTitle( true );

    // Also skin list
    if ( options.full ) {
        this.updateOptions();

        on( $span, {
            "eventsName": "click",
            "callback":   openList
        } );

        on( $span, {
            "eventsName": "keydown",
            "callback":   onKeydown
        } );

        on( $span, {
            "eventsName": "keyup",
            "callback":   onKeyup
        } );

        on( $parent, {
            "eventsName": "click",
            "callback":   fakeOptionsClickHandler
        } );

    }

    $select.__skinAPI = $parent.__skinAPI = this;

    if ( $select.hasAttribute('data-error') ) {
        this.setInvalid();
    }

    on( $select, {
        "eventsName": "change",
        "callback":   changeHandler
    } );
}


/**
 * Skin a select DOM element
 *
 * @function
 * @param {HTMLElement} $select
 * @param {Object} [options]
 * @param {Boolean} [options.full=false] - if true, skin event the option list
 * @param {Array} [options.extraClass=[]]
 * @param {String} [options.className=select-skin]
 * @param {String} [options.itemClassName=select-itm]
 * @param {String} [options.selectWrapClassName=select]
 * @param {String} [options.openedListClass=show]
 * @param {String} [options.activeOptionClass=on]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.loadingClass=loading]
 * @param {String} [options.listTpl]
 *
 * @example // Call with default options:
 * skinSelect( $select, {
 *  "full": false,
 *  "extraClass": ['otherClassName'],
 *  "className": "select-skin",
 *  "itemClassName": "select-itm",
 *  "selectWrapClassName": "select",
 *  "openedListClass": "show",
 *  "activeOptionClass": "on",
 *  "disabledClass": "disabled",
 *  "loadingClass": "loading",
 *  "listTpl": [
 *          '<div class="select-layer">',
 *              '<ul class="select-list">',
 *                  '<% for ( var i = 0, len = list.length; i < len; ++i ) { %>',
 *                      '<li class="select-itm<%= list[ i ].selected ? " on" : "" %>" data-value="<%= list[ i ].value %>">',
 *                      '<%= list[ i ].text %>',
 *                      '</li>',
 *                  '<% } %>',
 *              '</ul>',
 *          '</div>'
 *      ].join( '' )
 * } );
 *
 * @returns {SkinSelect}
*/
export function skinSelect( $select, options ) {
    return new SkinSelect( $select, options );
}


/**
 * Skin all select DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} [options]
 * @param {Boolean} [options.full=false] - if true, skin event the option list
 * @param {Array} [options.extraClass=[]]
 * @param {String} [options.className=select-skin]
 * @param {String} [options.itemClassName=select-itm]
 * @param {String} [options.selectWrapClassName=select]
 * @param {String} [options.openedListClass=show]
 * @param {String} [options.activeOptionClass=on]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.invalidClass=invalid]
 * @param {String} [options.loadingClass=loading]
 * @param {String} [options.listTpl]
 *
 * @example // See skinSelect for example of options
 * skinSelectAll( $wrapper, options )
 *
 * @returns {SkinSelect[]}
 */
export function skinSelectAll( $wrapper, userOptions = {} ) {
    let $selects, defaultOptions, options, skinList;

    skinList = [];

    defaultOptions = {
        "full": false,
        "extraClass": []
    };

    options = extend( {}, defaultOptions, userOptions );

    $selects = $wrapper.querySelectorAll( 'select' );

    $selects.forEach( $select => {
        skinList.push( skinSelect( $select, options ) );
    } );

    return skinList;
}
