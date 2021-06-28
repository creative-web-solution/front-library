import { fire, on, off }  from '@creative-web-solution/front-library/Events/EventsManager';
import { extend }         from '@creative-web-solution/front-library/Helpers/Extend';
import { isNumber }       from '@creative-web-solution/front-library/Helpers/Type';
import template           from '@creative-web-solution/front-library/Modules/Template';
import { wrap }           from '@creative-web-solution/front-library/DOM/Wrap';
import { strToDOM }       from '@creative-web-solution/front-library/DOM/StrToDOM';
import { index }          from '@creative-web-solution/front-library/DOM/Index';
import { hClass, aClass } from '@creative-web-solution/front-library/DOM/Class';
import { rClass }         from '@creative-web-solution/front-library/DOM/Class';
import { position }       from '@creative-web-solution/front-library/DOM/Position';
import { height }         from '@creative-web-solution/front-library/DOM/Size';
import { outerHeight }    from '@creative-web-solution/front-library/DOM/OuterSize';


const defaultOptions: SkinSelectOptionsType = {
    "full":                false,
    "extraClass":          [],
    "className":           "select-skin",
    "itemClassName":       "select-itm",
    "selectWrapClassName": "select",
    "layerClassName":      "select-layer",
    "hoverItemClass":      "hover",
    "openedListClass":     "show",
    "activeOptionClass":   "on",
    "disabledClass":       "disabled",
    "invalidClass":        "invalid",
    "loadingClass":        "loading",
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
 */
export default class SkinSelect {
    #$select:           CustomSelectType;
    #loading!:          boolean;
    #options!:          SkinSelectOptionsType;
    #extraClass!:       string;
    #$parent!:          CustomSelectParentType;
    #$title!:           HTMLElement;
    #isListOpened!:     boolean;
    #$options!:         NodeList;
    #$lastOption!:      HTMLElement | null;
    #focusedItemIndex!: number;
    #$layer!:           HTMLElement;

    constructor( $select: HTMLSelectElement, userOptions?: SkinSelectOptionsType ) {

        this.#$select = $select;

        if ( this.#$select.hasAttribute( 'multiple' ) || this.#$select.__skinAPI ) {
            return;
        }

        this.#loading = false;

        this.#options = extend( defaultOptions, userOptions );

        this.#extraClass = (this.#options.extraClass as string[]).join( ' ' );

        if ( this.#$select.hasAttribute( 'data-class' ) ) {
            this.#extraClass = [ this.#extraClass, this.#$select.getAttribute( 'data-class' ) ].join( ' ' );
        }

        this.#$parent = $select.parentNode as HTMLElement;

        // Create skin
        if ( !hClass( this.#$parent, this.#options.className! ) ) {
            this.#$parent = wrap(
                this.#$select,
                `<span class="${ this.#options.className } ${ this.#extraClass }"></span>`
            ) as HTMLElement;
        }


        const $TITLE = this.#$parent.querySelector( `.${ this.#options.selectWrapClassName }`) as HTMLElement;

        if ( !$TITLE ) {
            this.#$title = document.createElement( 'SPAN' );
            aClass( this.#$title, this.#options.selectWrapClassName! );
            this.#$parent.appendChild( this.#$title );
        }
        else {
            this.#$title = $TITLE;
        }

        this.updateTitle();

        // Also skin list
        if ( this.#options.full ) {
            this.updateOptions();

            on( this.#$title, {
                "eventsName": "click",
                "callback":   this.#openList
            } );

            on( this.#$title, {
                "eventsName": "keydown",
                "callback":   this.#onKeydown
            } );

            on( this.#$title, {
                "eventsName": "keyup",
                "callback":   this.#onKeyup
            } );

            on( this.#$parent, {
                "eventsName": "click",
                "callback":   this.#fakeOptionsClickHandler
            } );

        }

        this.#$select.__skinAPI = this.#$parent.__skinAPI = this;

        if ( this.#$select.hasAttribute('data-error') ) {
            this.setInvalid();
        }

        on( this.#$select, {
            "eventsName": "change",
            "callback":   this.#changeHandler
        } );
    }


    #closeList = () => {
        this.#$parent.classList.remove( this.#options.openedListClass! );

        off( document.body, {
            "eventsName": "click",
            "callback":   this.#closeList
        } );

        this.#isListOpened = false;

        this.removeItemFocus();

    }


    #openList = () => {
        if ( this.#$select.disabled || this.#loading ) {
            return;
        }

        if ( this.#isListOpened ) {
            this.#closeList();
            return;
        }

        this.#$parent.classList.add( this.#options.openedListClass! );

        window.requestAnimationFrame( () => {
            on( document.body, {
                "eventsName": "click",
                "callback":   this.#closeList
            } );
        } );

        if ( this.#$options ) {
            if ( this.#$lastOption ) {
                this.#focusedItemIndex = index( this.#$lastOption );
                this.#focusedItemIndex = this.#focusedItemIndex > -1 ? this.#focusedItemIndex : 0;
            }

            this.focusItem( this.#focusedItemIndex );
        }

        this.#isListOpened = true;
    }


    private enableDisable( fnName: string, disabled: boolean ) {
        this.#$select.disabled = disabled;
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


    private loadingStatus( fnName: string, isLoading: boolean ) {
        this.#loading = isLoading;
        this.#$parent.classList[ fnName ]( this.#options.loadingClass );
    }


    /**
     * Add the loading css class to the main element
     */
    setLoading() {
        this.loadingStatus( 'add', true );
    }


    /**
     * Remove the loading css class to the main element
     */
    unsetLoading() {
        this.loadingStatus( 'remove', false );
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


    /**
     * Force the update of title with the currently selected element text
     */
    updateTitle() {
        let title;

        if ( this.#$select.selectedIndex < 0 ) {
            this.#$title.innerHTML = '';
            this.#closeList();
            return;
        }

        title = this.#$select.options[ this.#$select.selectedIndex ].text;

        this.#$title.innerHTML = title;

        this.#closeList();
    }


    /**
     * Select an option
     *
     * @param {HTMLElement|Number} optionOrIndex
     */
    select( optionOrIndex: HTMLElement | number ) {
        let _index, option, isParameterANumber;

        if ( this.#$select.disabled || this.#loading ) {
            return;
        }

        isParameterANumber = isNumber( optionOrIndex );

        if ( isParameterANumber ) {
            _index = optionOrIndex;
        }
        else {
            _index = index( optionOrIndex as HTMLElement );
        }

        if ( _index < 0 || _index > this.#$select.options.length ) {
            return;
        }

        this.#$select.options[ _index ].selected = true;

        if ( this.#options.full ) {
            option = this.#$parent.querySelectorAll( `.${ this.#options.itemClassName }` )[ _index ];

            if ( this.#$lastOption ) {
                this.#$lastOption.classList.remove( this.#options.activeOptionClass! );
            }

            if ( option ) {
                option.classList.add( this.#options.activeOptionClass );
                this.#$lastOption = option;
            }
        }

        fire( this.#$select, {
            "eventsName": "change"
        } );
    }


    private setSelectOptions( data: SkinSelectOptionArrayType[] ) {
        let normalizedData, hasSelectedOption;

        this.#$select.options.length = 0;

        normalizedData = data.map( dt => {
            if ( dt.selected ) {
                hasSelectedOption = true;
            }

            return {
                "text":     dt.text,
                "value":    dt.value,
                "selected": dt.selected || false
            }
        } );

        if ( !hasSelectedOption ) {
            normalizedData[ 0 ].selected = true;
        }

        normalizedData.forEach( ( optionData ) => {
            this.#$select.options.add(
                new Option( optionData.text, optionData.value, false, optionData.selected )
            );
        } );
    }


    /**
     * Update the options list. If optionsArray is not set, only update the html of the skinned options list.
     *
     * @param optionsArray
     *
     * @example
     * selectAPI.updateOptions( [{"text": "Option 1", "value": "value 1", "selected": true}, ...] )
     */
    updateOptions( optionsArray?: SkinSelectOptionArrayType[] ) {
        let htmlList;

        this.#$lastOption      = null;
        this.#focusedItemIndex = -1;

        if ( optionsArray ) {
            this.setSelectOptions( optionsArray );
            this.updateTitle();
        }

        if ( !this.#options.full ) {
            return;
        }

        this.#$select.style.display = 'none';
        this.#$title.setAttribute( 'tabindex', '0' );
        this.#closeList();

        if ( this.#$layer && this.#$layer.parentNode ) {
            this.#$layer.parentNode.removeChild( this.#$layer );
        }

        htmlList = template( this.#options.listTpl!, { "list": this.#$select.options } );
        this.#$parent.appendChild( strToDOM( htmlList ) );

        this.#$layer     = this.#$parent.querySelector( `.${ this.#options.layerClassName }` ) as HTMLElement;
        this.#$options   = this.#$layer.querySelectorAll( 'li' );

        this.#$lastOption = this.#$parent.querySelector( `li.${ this.#options.activeOptionClass }` );
    }


    #changeHandler = () => {
        this.updateTitle();
    }


    // Handle click on the skinned ul>li list
    #fakeOptionsClickHandler = ( e ) => {
        if ( !e.target.matches( '.' + this.#options.itemClassName ) ) {
            return;
        }
        this.select( e.target );
    }


    private focusItem( index ) {
        if ( index < 0 ) {
            index = this.#$options.length - 1;
        }
        if ( index >= this.#$options.length ) {
            index = 0;
        }
        if ( !this.#$options[ index ] ) {
            return;
        }

        this.removeItemFocus();

        aClass( this.#$options[ index ], this.#options.hoverItemClass! );
        this.updateListScroll( this.#$options[ index ] );

        this.#focusedItemIndex = index;
    }


    private removeItemFocus() {
        if ( this.#focusedItemIndex !== null && this.#$options && this.#$options[ this.#focusedItemIndex ] ) {
            rClass( this.#$options[ this.#focusedItemIndex ], this.#options.hoverItemClass! );
            this.#focusedItemIndex = -1;
        }
    }


    private updateListScroll( $item ) {
        let itemPos, itemHeight, layerScrollTop, layerHeight;

        if ( this.#$layer ) {
            itemPos        = position( $item );
            itemHeight     = outerHeight( $item );
            layerHeight    = height( this.#$layer );
            layerScrollTop = this.#$layer.scrollTop;

            if ( itemPos.top + itemHeight > layerHeight + layerScrollTop)  {
                this.#$layer.scrollTop = itemPos.top - layerHeight + itemHeight;
            }
            else if ( layerScrollTop > 0 && itemPos.top < layerScrollTop ) {
                this.#$layer.scrollTop = itemPos.top;
            }
        }
    }


    #onKeydown = ( e ) => {
        switch ( e.keyCode ) {
            case 38: // UP
            case 40: // DOWN
            case 13: // ENTER
            case 27: // ESCAPE
                e.preventDefault();
                break;
        }
    }


    #onKeyup = ( e ) => {
        switch ( e.keyCode ) {
            case 38: // UP
                this.focusItem( this.#focusedItemIndex - 1 );
                break;
            case 40: // DOWN
                if ( !this.#isListOpened ) {
                    this.#openList();
                    break;
                }
                this.focusItem( this.#focusedItemIndex + 1 );
                break;

            case 13: // ENTER
            case 32: // SPACE
                if ( !this.#isListOpened ) {
                    this.#openList();
                    break;
                }
                this.select( this.#focusedItemIndex );
                this.#closeList();
                break;

            case 27: // ESCAPE
                this.#closeList();
                break;
        }
    }
}


/**
 * Skin a select DOM element
 *
 * @example
 * // Call with default options:
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
*/
export function skinSelect( $select: HTMLSelectElement, options: SkinSelectOptionsType ): SkinSelect {
    return new SkinSelect( $select, options );
}


/**
 * Skin all select DOM element in a wrapper
 *
 * @example
 * // See skinSelect for example of options
 * skinSelectAll( $wrapper, options )
 *
 * @returns {SkinSelect[]}
 */
export function skinSelectAll( $wrapper: HTMLElement, userOptions: SkinSelectAllOptionsType = {} ): SkinSelect[] {
    const skinList: SkinSelect[] = [];

    const defaultOptions: SkinSelectAllOptionsType = {
        "full": false,
        "extraClass": []
    };

    const options = extend( {}, defaultOptions, userOptions );

    const $selects = $wrapper.querySelectorAll( options.selector || 'select' );

    $selects.forEach( $select => {
        skinList.push( skinSelect( $select, options ) );
    } );

    return skinList;
}
