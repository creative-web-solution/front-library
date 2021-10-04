import { gesture, gestureOff }     from '../Events/Gesture';
import { extend }                  from '../Helpers/Extend';
import { append, remove }          from '../DOM/Manipulation';
import { height }                  from '../DOM/Size';
import { offset }                  from '../DOM/Offset';
import { outerHeight, outerWidth } from '../DOM/OuterSize';
import { position }                from '../DOM/Position';


const defaultOptions = {
    "$panelWrapper": document.body,
    "maxHeight": 200,
    "useCache": false,
    "minchar": 3,
    "updateOnSelect": true,
    "layerPosition": "top",
    "cssPositionning": false,
    "queryParams": query => {
        return { search: query };
    },
    "normalize": data => {
        return data;
    },
    "renderFieldValue": ( { item } ) => {
        return item.name;
    },
    "render": ( { resultItem, index, cssClass } ) => {
        return `<li role="option" class="${ cssClass.item }"><a class="${ cssClass.link }" data-idx="${ index }">${ resultItem.markedName }</a></li>`;
    },
    "renderList": ( { resultList, cssClass } ) => {
        return `<ul role="listbox" class="${ cssClass.list }">${ resultList.join('') }</ul>`;
    },
    "renderError": ( { errorMsg, cssClass } ) => {
        return `<li class="${ cssClass.error }">${ errorMsg }</li>`;
    },
    "renderMark": ( { resultItem, reQuery, cssClass } ) => {
        if ( !reQuery ) {
            resultItem.markedName = resultItem.name;
            return;
        }

        resultItem.name && ( resultItem.markedName = resultItem.name.replace(
            reQuery,
            `<mark class="${ cssClass.mark }">$1</mark>`
        ) );
    },
    "l10n": {
        "noResult": "No result",
        "error": "Server error"
    },
    "className": {
        "layer": "ac-layer",
        "list": "ac-list",
        "item": "acl-itm",
        "link": "acl-lnk",
        "mark": "acl-mrk",
        "error": "acl-error",
        "hover": "hover",
        "disable": "disable"
    }
};

const PREVENT_DEFAULT_KEY_LIST = [ "Up", "ArrowUp", "Down", "ArrowDown", "Enter", "Esc", "Escape" ];


/**
 * Autocomplete
 *
 * @see extra/modules/autocomplete.md for details.
 */
export default class Autocomplete {
    #options:           FLib.Autocomplete.Options;
    #cacheQuery:        Record<string, FLib.Autocomplete.Item[]>;
    #timeoutId;
    #$layer:            HTMLElement;
    #$list;
    #currentResults;
    #tplSuggestion:     string;
    #selectionLocked;
    #hasResults;
    #selectedIndex;
    #nbResults;
    #url;
    #hideTimeoutId;
    #$field;
    #className:         FLib.Autocomplete.Classname;
    #$panelWrapper;
    #l10n:              FLib.Autocomplete.L10N;
    #currentQuery;
    #requestAbortController;
    #isDisabled;


    get isDisable(): boolean {
        return this.#isDisabled || this.#$field.disabled
    }


    constructor( userOptions: FLib.Autocomplete.OptionsInit ) {
        if ( !( "AbortController" in window ) ) {
            throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
        }

        this.#options         = extend( defaultOptions, userOptions );

        this.#cacheQuery      = {};
        this.#selectionLocked = true;
        this.#selectedIndex   = -1;
        this.#nbResults       = 0;
        this.#hasResults      = false;
        this.#url             = this.#options.url;
        this.#$field          = this.#options.$searchField;
        this.#$panelWrapper   = this.#options.$panelWrapper;
        this.#className       = this.#options.className;
        this.#l10n            = this.#options.l10n;

        this.#tplSuggestion   = `<ul role="listbox" class="${ this.#className.list }">{LIST}</ul>`;

        this.#$layer = document.createElement( 'DIV' );
        this.#$layer.classList.add( this.#className.layer as string );

        append( this.#$layer, this.#$panelWrapper );

        this.#$field.setAttribute( 'autocomplete', 'off' );
        this.#isDisabled = this.#$field.disabled || this.#$field.classList.contains( this.#className.disable );


        // Bind

        gesture( this.#$layer, '__AutocompleteTapLayer', {
            "selector": `.${ this.#className.link }`,
            "tap": this.#onTapLinks
        } );

        gesture( this.#$field, '__AutocompleteTapField', {
            "tap": this.#onTapField
        } );

        this.#$field.addEventListener( 'keyup', this.#onKeyup );
        this.#$field.addEventListener( 'keydown', this.#onKeydown );
        this.#$field.addEventListener( 'focus', this.#onFocus );
    }



    /**
     * Update the current options
     *
     * @param newOption - Same options as constructor
     */
    setOptions( _newOption: FLib.Autocomplete.Options ): this {
        this.#options = extend( this.#options, _newOption );

        return this;
    }


    /**
     * Display the result list
     */
    #show = (): void => {
        let topVal, parentFieldOffset, fieldHeight, wrapperHeight;

        const wrapperStyle = this.#$layer.style;

        if ( !this.#options.cssPositionning ) {
            parentFieldOffset = offset( this.#$field.parentNode );
            wrapperHeight = height( this.#$layer );
            fieldHeight = outerHeight( this.#$field );

            topVal =
                this.#options.layerPosition === "top"
                    ? parentFieldOffset.top - wrapperHeight + 1
                    : parentFieldOffset.top + fieldHeight + 1;


            wrapperStyle.top   = `${ topVal }px`;
            wrapperStyle.left  = `${ parentFieldOffset.left }px`;
            wrapperStyle.width = `${ outerWidth( this.#$field ) }px`;
        }

        wrapperStyle.display = 'block';

        this.#$layer.scrollTop = 0;

        setTimeout( () => {
            gesture( document.body, '__AutocompleteTapOutside', {
                "tap": this.#clickOutsideHandler
            } )
        }, 0 )
    }


    /**
     * Hide the result list
     */
    #hide = (): void => {
        clearTimeout( this.#hideTimeoutId );
        gestureOff( document.body, '__AutocompleteTapOutside' );

        this.#$layer.style.display = 'none';
        this.#selectionLocked = true;
        // $layer.innerHTML                = '';
        // $list = null;
    }


    #clickOutsideHandler = ( e: Event, $target: HTMLElement ): void => {
        const $parent = $target.closest( this.#className.layer as string );

        if ( !$parent && $target !== this.#$field ) {
            this.#hideTimeoutId = setTimeout( () => {
                this.#hide();
            }, 500 );
        }
    }


    /**
     * Create the results list
     *
     * @param _list - Array of result
     */
    #set = ( _list: FLib.Autocomplete.Item[], _query: string ): this => {
        let html;

        this.#currentResults = _list;
        this.#currentQuery = _query;

        html = [];
        this.#hasResults = true;

        const reQuery = new RegExp(`(${ _query
            .replace( /a/gi, '[aàâä]' )
            .replace( /c/gi, '[cç]' )
            .replace( /e/gi, '[eéèêë]' )
            .replace( /i/gi, '[iìïî]' )
            .replace( /o/gi, '[oòôö]' )
            .replace( /u/gi, '[uùûü]' )
            .replace( /y/gi, '[y]')})`, 'gi' );

        html = _list.map( ( item, i ) => {
            this.#options.renderMark?.(
                {
                    "resultItem": item,
                    reQuery,
                    "query": _query,
                    "index": i,
                    "resultList": _list,
                    "cssClass": this.#className
                }
            );
            return this.#options.render( {
                "resultItem": item,
                "index": i,
                "query": _query,
                "itemsList": _list,
                "cssClass": this.#className
            } );
        } );

        this.#$layer.innerHTML = this.#options.renderList( {
            "resultList": html,
            "query": _query,
            "cssClass": this.#className
        } );

        this.#$list = this.#$layer.querySelector( this.#className.list );

        this.#selectionLocked = false;
        this.#nbResults       = _list.length;
        this.#selectedIndex   = -1;

        return this;
    }


    /**
     * Create the results list
     *
     * @param _list - Array of result
     */
    #setAll = ( _list: FLib.Autocomplete.Item[] ): this => {
        let html;

        this.#currentResults = _list;
        this.#currentQuery = '';

        html = [];
        this.#hasResults = true;

        html = _list.map( ( item, i ) => {
            this.#options.renderMark(
                {
                    "resultItem": item,
                    "index": i,
                    "query": "",
                    "resultList": _list,
                    "cssClass": this.#className
                }
            );
            return this.#options.render( {
                "resultItem": item,
                "index": i,
                "query": "",
                "itemsList": _list,
                "cssClass": this.#className
            } );
        } );

        this.#$layer.innerHTML = this.#options.renderList( {
            "resultList": html,
            "cssClass": this.#className,
            "query": ""
        } );

        this.#$list = this.#$layer.querySelector( this.#className.list );

        this.#selectionLocked = false;
        this.#nbResults       = _list.length;
        this.#selectedIndex   = -1;

        return this;
    }


    /**
     * Display error message (like "No results")
     */
    #setError = ( errorMsg?: string ): void => {
        const html: string[] = [];

        html.push( this.#options.renderError( {
            "errorMsg": errorMsg || this.#l10n.noResult,
            "query":    this.#currentQuery,
            "cssClass": this.#className
        } ) );

        this.#$layer.innerHTML = this.#tplSuggestion.replace( '{LIST}', html.join('') );

        this.#selectionLocked = true;
        this.#selectedIndex = 0;
        this.#nbResults = 0;
    }


    /**
     * Select the choose element and fill the field with its value
     *
     * @param selectedIndex - Index of the selected item
     */
    #select = ( _selectedIndex?: number ): void => {
        if ( this.#selectionLocked ) {
            return;
        }

        this.#selectedIndex = typeof _selectedIndex === 'undefined' ? this.#selectedIndex : _selectedIndex;

        if ( this.#options.updateOnSelect && this.#options.renderFieldValue ) {
            this.#$field.value = this.#options.renderFieldValue.call(
                this,
                {
                    "item":       this.#currentResults[ this.#selectedIndex ],
                    "query":      this.#currentQuery,
                    "resultList": this.#currentResults
                }
            );
        }

        this.#hide();

        if ( this.#options.onSelect ) {
            this.#options.onSelect.call(
                this,
                {
                    "resultsList": this.#currentResults,
                    "query":       this.#currentQuery,
                    "item":        this.#currentResults[ this.#selectedIndex ]
                }
            );
        }
    }


    /**
     * Highlight the choosen item
     *
     * @param _index - Index of the item to hover
     */
    #hover = ( _index: number ): void => {
        let $item, itemPos, top, itemHeight;

        if ( this.#selectionLocked ) {
            return;
        }

        this.#selectedIndex = _index;
        $item = this.#$layer.querySelector( `.${ this.#className.hover }` );

        if ( $item ) {
            $item.classList.remove( this.#className.hover );
        }

        $item = this.#$layer.querySelectorAll( 'li' )[ _index ];

        if ( $item ) {
            $item.classList.add( this.#className.hover );
        }

        // $field.value = query;

        if ( this.#$list ) {
            itemPos = position( $item );
            itemHeight = outerHeight( $item );
            top = this.#$list.scrollTop;

            if ( itemPos.top + itemHeight > this.#options.maxHeight + top)  {
                this.#$list.scrollTop = itemPos.top - this.#options.maxHeight + itemHeight;
            }
            else if ( top > 0 && itemPos.top < top ) {
                this.#$list.scrollTop = itemPos.top;
            }
        }
    }


    /**
     * Highlight the next item
     */
    #hoverNext = (): void => {
        this.#hover( this.#selectedIndex + 1 < this.#nbResults ? this.#selectedIndex + 1 : 0 );
    }


    /**
     * Highlight the previous item
     */
    #hoverPrevious = (): void => {
        this.#hover( this.#selectedIndex - 1 >= 0 ? this.#selectedIndex - 1 : this.#nbResults - 1 );
    }


    /**
     * Load the results list
     */
    #load = ( _query: string ): void => {
        this.#currentResults = [];

        this.#hasResults = false;

        if (!!this.#cacheQuery[ _query ] && this.#options.useCache ) {
            this.#set( this.#cacheQuery[ _query ], _query );
            this.#show();
        }
        else if ( this.#options.source ) {
            this.#options.source( _query, results => {
                this.#cacheQuery[ _query ] = results;

                if ( results.length ) {
                    this.#set( results, _query );
                }
                else {
                    this.#setError( this.#l10n.noResult );
                }

                this.#show();
            } );

            return;
        }
        else {
            let params;

            if ( this.#requestAbortController ) {
                this.#requestAbortController.abort();
            }

            this.#requestAbortController = new AbortController();

            params = this.#options.queryParams( _query );

            params = Object.keys( params ).reduce( ( result, key, index ) => {
                return (index > 0 ? result + '&' : '') + key + '=' + params[ key ];
            }, '' );

            const newUrl = [ this.#url, this.#url.indexOf( '?' ) > -1 ? '&' : '?', params ].join('');

            const myHeaders = new Headers();
            myHeaders.append( 'X-Requested-With', 'XMLHttpRequest' );

            fetch( newUrl, {
                "signal":  this.#requestAbortController.signal,
                "headers": myHeaders
            } )
                .then( response => {
                    if ( response.status >= 200 && response.status < 300 ) {
                        return response;
                    }
                    else {
                        throw new Error( response.statusText );
                    }
                })
                .then( function( response ) {
                    return response.json();
                } )
                .then( _data => {
                    const normalizedData = this.#options.normalize( _data );

                    if (
                        normalizedData.success &&
                        normalizedData.results.length > 0
                    ) {
                        this.#set( normalizedData.results, _query);
                        this.#cacheQuery[ _query ] = normalizedData.results;
                    }
                    else if ( !normalizedData.results.length ) {
                        this.#setError( this.#l10n.noResult );
                    }
                    else {
                        this.#setError( this.#l10n.error ) ;
                    }
                } )
                .catch( () => {
                    this.#setError();
                } )
                .finally(() => {
                    this.#show();
                    this.#requestAbortController = null;
                } );
        }
    }


    #onKeydown = ( e: KeyboardEvent ): void => {
        if ( PREVENT_DEFAULT_KEY_LIST.includes( e.key ) ) {
            e.preventDefault();
        }
    }


    #onKeyup = ( e: KeyboardEvent ): void => {

        if ( this.isDisable ) {
            return;
        }

        const query = ( e.target as HTMLInputElement ).value;

        switch ( e.key ) {
            case "Up":
            case "ArrowUp":
                this.#hoverPrevious();
                break;

            case "Down":
            case "ArrowDown":
                this.#hoverNext();
                break;

            case "Enter":
                this.#select();
                break;

            case "Esc":
            case "Escape":
                this.#hide();
                // if ( this.#options.results ) {
                //     this.#options.results.hide();
                // }
                break;

            case "Left":
            case "ArrowLeft":
            case "Right":
            case "ArrowRight":
            case "Shift":
            case "Control":
            case "Alt":
            case "CapsLock":
            case "End":
            case "Home":
            case "PageDown":
            case "PageUp":
            case "Meta":
            case "OS":
                break;

            default:
                clearTimeout( this.#timeoutId );

                if ( query.trim().length >= this.#options.minchar ) {
                    this.#timeoutId = setTimeout( () => {
                        this.#load( query );
                    }, 800 );
                }
                else {
                    this.#hide();
                    if ( this.#requestAbortController ) {
                        this.#requestAbortController.abort();
                    }
                }
                break;
        }
    }


    #onFocus = (): void => {
        clearTimeout( this.#hideTimeoutId );
    }


    #onTapField = (): void => {
        if ( this.isDisable ) {
            return;
        }

        if ( this.#hasResults ) {
            this.#selectionLocked = false;
            this.#show();
        }
    }


    #onTapLinks = ( e: Event, $target: HTMLElement ): void => {
        if ( this.isDisable ) {
            return;
        }

        const idx = $target.getAttribute( 'data-idx' );
        this.#select( Number( idx ) );
    }



    /**
     * When 'source' is used, display the list with all items
     */
    showAll(): this {
        if ( !this.#options.source || this.isDisable) {
            return this;
        }

        this.#options.source( null, ( results: FLib.Autocomplete.Item[] ) => {
            if ( results.length ) {
                this.#setAll( results );
            }
            else {
                this.#setError( this.#l10n.noResult );
            }

            this.#show();
        } );

        return this;
    }


    /**
     * Disable the autocomplete
     */
    disable(): this {
        this.#isDisabled = true;
        this.#$field.disabled = true;
        this.#$field.classList.add( this.#className.disable );

        return this;
    }


    /**
     * Enable the autocomplete
     */
    enable(): this {
        this.#isDisabled = false;
        this.#$field.disabled = false;
        this.#$field.classList.remove( this.#className.disable );

        return this;
    }


    /**
     * Destroy the Autocomplete
     */
    clean(): this {
        this.#$field.removeEventListener( 'keyup',   this.#onKeyup );
        this.#$field.removeEventListener( 'keydown', this.#onKeydown );
        this.#$field.removeEventListener( 'focus',   this.#onFocus );

        gestureOff( document.body, '__AutocompleteTapOutside' );

        gestureOff( this.#$field, '__AutocompleteTapField' );

        gestureOff( this.#$layer, '__AutocompleteTapLayer' );

        clearTimeout( this.#hideTimeoutId );

        if ( this.#requestAbortController ) {
            this.#requestAbortController.abort();
            this.#requestAbortController = null;
        }

        remove( this.#$layer );

        return this;
    }


    /**
     * Reset the input field
     */
    resetField(): this {
        this.#$field.value = '';

        return this;
    }


    /**
     * Reset the results
     */
    resetResults(): this {
        this.#currentQuery   = '';
        this.#currentResults = [];
        this.#selectedIndex  = -1;
        this.#nbResults      = 0;
        this.#hasResults     = false;

        return this;
    }


    /**
     * Reset the input field and the results
     */
    reset(): this {
        this.resetField();
        this.resetResults();

        return this;
    }
}
