import { fire, on, off }  from '../Events/EventsManager';
import { extend }         from '../Helpers/Extend';
import { isNumber }       from '../Helpers/Type';
import { wrap }           from '../DOM/Wrap';
import { strToDOM }       from '../DOM/StrToDOM';
import { index }          from '../DOM/Index';
import { hClass, aClass } from '../DOM/Class';
import { rClass }         from '../DOM/Class';
import { position }       from '../DOM/Position';
import { height }         from '../DOM/Size';
import { outerHeight }    from '../DOM/OuterSize';
import quickTemplate      from './QuickTemplate';


const defaultOptions: FLib.SkinSelect.Options = {
    "full":                false,
    "extraClass":          [],
    "className":           "select-skin",
    "itemClassName":       "select-itm",
    "selectWrapClassName": "select",
    "layerClassName":      "select-layer",
    "listClassName":       "select-list",
    "hoverItemClass":      "hover",
    "openedListClass":     "show",
    "activeOptionClass":   "on",
    "disabledClass":       "disabled",
    "invalidClass":        "invalid",
    "loadingClass":        "loading",
    "listTpl": {
        "wrapper": "<div class=\"{{ layerClassName }}\"><ul class=\"{{ listClassName }}\">{{ items }}</ul></div>",
        "item":    "<li class=\"{{ itemClassName }}{{ onClass }}\" data-value=\"{{ value }}\">{{ text }}</li>"
    }
};


/**
 * Skin an HTML select element. If options.full is set to true, also skin the options list.
 * You can access the skin API in the __skinAPI property of the $select HTMLElement or its wrapper.
 */
export default class SkinSelect implements FLib.SkinSelect.SkinSelect {
    #$select!:          FLib.SkinSelect.CustomSelect;
    #loading            = false;
    #options!:          FLib.SkinSelect.Options;
    #extraClass!:       string;
    #$parent!:          FLib.SkinSelect.CustomSelectParent;
    #$title!:           HTMLElement;
    #isListOpened       = false;
    #$options:          NodeList | undefined;
    #$lastOption:       HTMLElement | null = null;
    #focusedItemIndex   = -1;
    #$layer:            HTMLElement | undefined;

    constructor( $select: FLib.SkinSelect.CustomSelect, userOptions?: Partial<FLib.SkinSelect.Options> ) {

        if ( $select.hasAttribute( 'multiple' ) || $select.__skinAPI ) {
            return;
        }

        this.#$select = $select;

        this.#loading = false;

        this.#options = extend( defaultOptions, userOptions );

        this.#extraClass = (this.#options.extraClass as string[]).join( ' ' );

        if ( this.#$select.hasAttribute( 'data-class' ) ) {
            this.#extraClass = [ this.#extraClass, this.#$select.getAttribute( 'data-class' ) ].join( ' ' );
        }

        this.#$parent = $select.parentNode as HTMLElement;

        // Create skin
        if ( !hClass( this.#$parent, this.#options.className ) ) {
            this.#$parent = wrap(
                this.#$select,
                `<span class="${ this.#options.className } ${ this.#extraClass }"></span>`
            ) as HTMLElement;
        }


        const $TITLE = this.#$parent.querySelector( `.${ this.#options.selectWrapClassName }`) as HTMLElement;

        if ( !$TITLE ) {
            this.#$title = document.createElement( 'SPAN' );
            aClass( this.#$title, this.#options.selectWrapClassName );
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


    #closeList = (): void => {
        this.#$parent.classList.remove( this.#options.openedListClass );

        off( document.body, {
            "eventsName": "click",
            "callback":   this.#closeList
        } );

        this.#isListOpened = false;

        this.#removeItemFocus();
    }


    #openList = (): void => {
        if ( this.#$select.disabled || this.#loading ) {
            return;
        }

        if ( this.#isListOpened ) {
            this.#closeList();
            return;
        }

        this.#$parent.classList.add( this.#options.openedListClass );

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

            this.#focusItem( this.#focusedItemIndex );
        }

        this.#isListOpened = true;
    }


    #enableDisable = ( fnName: string, disabled: boolean ): void => {
        this.#$select.disabled = disabled;
        this.#$parent.classList[ fnName ]( this.#options.disabledClass );
    }


    /**
     * Force the select to be enable
     */
    enable(): this {
        this.#enableDisable( 'remove', false );

        return this
    }


    /**
     * Force the select to be disable
     */
    disable(): this {
        this.#enableDisable( 'add', true );

        return this
    }


    #loadingStatus = ( fnName: string, isLoading: boolean ): void => {
        this.#loading = isLoading;
        this.#$parent.classList[ fnName ]( this.#options.loadingClass );
    }


    /**
     * Add the loading css class to the main element
     */
    setLoading(): this {
        this.#loadingStatus( 'add', true );

        return this;
    }


    /**
     * Remove the loading css class to the main element
     */
    unsetLoading(): this {
        this.#loadingStatus( 'remove', false );

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


    /**
     * Force the update of title with the currently selected element text
     */
    updateTitle(): this {

        if ( this.#$select.selectedIndex < 0 ) {
            this.#$title.innerHTML = '';
            this.#closeList();
            return this;
        }

        const title = this.#$select.options[ this.#$select.selectedIndex ].text;

        this.#$title.innerHTML = title;

        this.#closeList();

        return this;
    }


    /**
     * Select an option
     */
    select( optionOrIndex: HTMLElement | number ): this {
        let _index, option;

        if ( this.#$select.disabled || this.#loading ) {
            return this;
        }

        const isParameterANumber = isNumber( optionOrIndex );

        if ( isParameterANumber ) {
            _index = optionOrIndex;
        }
        else {
            _index = index( optionOrIndex as HTMLElement );
        }

        if ( _index < 0 || _index > this.#$select.options.length ) {
            return this;
        }

        this.#$select.options[ _index ].selected = true;

        if ( this.#options.full ) {
            option = this.#$parent.querySelectorAll( `.${ this.#options.itemClassName }` )[ _index ];

            if ( this.#$lastOption ) {
                this.#$lastOption.classList.remove( this.#options.activeOptionClass );
            }

            if ( option ) {
                option.classList.add( this.#options.activeOptionClass );
                this.#$lastOption = option;
            }
        }

        fire( this.#$select, {
            "eventsName": "change"
        } );

        return this;
    }


    #setSelectOptions = ( data: FLib.SkinSelect.OptionArray[] ): void => {
        let hasSelectedOption;

        this.#$select.options.length = 0;

        const normalizedData = data.map( dt => {
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
     * @example
     * ```ts
     * selectAPI.updateOptions( [{"text": "Option 1", "value": "value 1", "selected": true}, ...] )
     * ```
     */
    updateOptions( optionsArray?: FLib.SkinSelect.OptionArray[] ): this {

        this.#$lastOption      = null;
        this.#focusedItemIndex = -1;

        if ( optionsArray ) {
            this.#setSelectOptions( optionsArray );
            this.updateTitle();
        }

        if ( !this.#options.full ) {
            return this;
        }

        this.#$select.style.display = 'none';
        this.#$title.setAttribute( 'tabindex', '0' );
        this.#closeList();

        if ( this.#$layer && this.#$layer.parentNode ) {
            this.#$layer.parentNode.removeChild( this.#$layer );
        }

        // let htmlList = template( this.#options.listTpl, { "list": this.#$select.options } );
        const HTML_LIST: string[] = [];

        for ( const opt of Array.from( this.#$select.options ) ) {
            HTML_LIST.push( quickTemplate( this.#options.listTpl.item, {
                "onClass": opt.selected ? " on" : "",
                "text":    opt.text,
                "value":   opt.value
            } ) );
        }

        this.#$parent.appendChild( strToDOM( quickTemplate( this.#options.listTpl.wrapper, {
            "items": HTML_LIST.join( '' )
        } ) ) );


        this.#$layer     = this.#$parent.querySelector( `.${ this.#options.layerClassName }` ) as HTMLElement;
        this.#$options   = this.#$layer.querySelectorAll( 'li' );

        this.#$lastOption = this.#$parent.querySelector( `li.${ this.#options.activeOptionClass }` );

        return this;
    }


    #changeHandler = (): void => {
        this.updateTitle();
    }


    // Handle click on the skinned ul>li list
    #fakeOptionsClickHandler = ( e: MouseEvent ): void => {
        if ( !(e.target as HTMLElement).matches( '.' + this.#options.itemClassName ) ) {
            return;
        }
        this.select( e.target as HTMLElement );
    }


    #focusItem = ( index: number ): void => {
        if ( !this.#$options ) {
            return;
        }

        if ( index < 0 ) {
            index = this.#$options.length - 1;
        }
        if ( index >= this.#$options.length ) {
            index = 0;
        }
        if ( !this.#$options[ index ] ) {
            return;
        }

        this.#removeItemFocus();

        aClass( this.#$options[ index ], this.#options.hoverItemClass );
        this.#updateListScroll( this.#$options[ index ] as HTMLElement );

        this.#focusedItemIndex = index;
    }


    #removeItemFocus = (): void => {
        if ( this.#focusedItemIndex !== null && this.#$options && this.#$options[ this.#focusedItemIndex ] ) {
            rClass( this.#$options[ this.#focusedItemIndex ], this.#options.hoverItemClass );
            this.#focusedItemIndex = -1;
        }
    }


    #updateListScroll = ( $item: HTMLElement ): void => {
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


    #onKeydown = ( e: KeyboardEvent ): void => {
        switch ( e.keyCode ) {
            case 38: // UP
            case 40: // DOWN
            case 13: // ENTER
            case 27: // ESCAPE
                e.preventDefault();
                break;
        }
    }


    #onKeyup = ( e: KeyboardEvent ): void => {
        switch ( e.keyCode ) {
            case 38: // UP
                this.#focusItem( this.#focusedItemIndex - 1 );
                break;
            case 40: // DOWN
                if ( !this.#isListOpened ) {
                    this.#openList();
                    break;
                }
                this.#focusItem( this.#focusedItemIndex + 1 );
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
 * ```ts
 * // Call with default options:
 * skinSelect( $select, {
 *  "full": false,
 *  "extraClass": [],
 *  "className": "select-skin",
 *  "itemClassName": "select-itm",
 *  "selectWrapClassName": "select",
 *  "layerClassName": "select-layer",
 *  "listClassName": "select-list",
 *  "hoverItemClass": "hover",
 *  "openedListClass": "show",
 *  "activeOptionClass": "on",
 *  "disabledClass": "disabled",
 *  "invalidClass": "invalid",
 *  "loadingClass": "loading",
 *  "listTpl": {
 *      "wrapper": "<div class=\"{{ layerClassName }}\"><ul class=\"{{ listClassName }}\">{{ items }}</ul></div>",
 *      "item": "<li class=\"{{ itemClassName }}{{ onClass }}\" data-value=\"{{ value }}\">{{ text }}</li>"
 *  }
 * ```
*/
export function skinSelect( $select: HTMLSelectElement, options: Partial<FLib.SkinSelect.Options> ): SkinSelect {
    return new SkinSelect( $select, options );
}


/**
 * Skin all select DOM element in a wrapper
 *
 * @example
 * // See skinSelect for example of options
 * skinSelectAll( $wrapper, options )
 */
export function skinSelectAll( $wrapper: HTMLElement, userOptions: Partial<FLib.SkinSelect.AllOptions> = {} ): SkinSelect[] {
    const skinList: SkinSelect[] = [];

    const defaultOptions: Partial<FLib.SkinSelect.AllOptions> = {
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
