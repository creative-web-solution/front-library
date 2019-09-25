import { fire } from 'front-library/Events/EventsManager';
import { extend } from 'front-library/Helpers/Extend';
import { isNumber } from 'front-library/Helpers/Type';
import { template } from 'front-library/Modules/template';
import { wrap } from 'front-library/DOM/wrap';
import { strToDOM } from 'front-library/DOM/strToDOM';
import { index } from 'front-library/DOM/index';


const defaultOptions = {
    "full": false,
    "extraClass": [],
    "className": "select-skin",
    "itemClassName": "select-itm",
    "selectWrapClassName": "select",
    "openedListClass": "show",
    "activeOptionClass": "on",
    "disabledClass": "disabled",
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


function SelectSkin( $select, userOptions = {} ) {
    var $parent,
        extraClass,
        $span,
        lastOption,
        loading,
        $layer,
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

        document.body.removeEventListener( 'click', closeList );

        isListOpened = false;
    }


    function openList( e ) {
        e.stopPropagation();

        if ( $select.disabled || loading ) {
            return;
        }

        if ( isListOpened ) {
            closeList();
            return;
        }

        $parent.classList.add( options.openedListClass );

        document.body.addEventListener( 'click', closeList );

        isListOpened = true;
    }


    function enableDisable( fnName, disabled ) {
        $select.disabled = disabled;
        $parent.classList[ fnName ]( options.disabledClass );
    }


    this.enable = () => {
        enableDisable( 'remove', false );
    }


    this.disable = () => {
        enableDisable( 'add', true );
    }


    function loadingNotLoding( fnName, isLoading ) {
        loading = isLoading;
        $parent.classList[ fnName ]( options.loadingClass );
    }


    this.setLoading = () => {
        loadingNotLoding( 'add', true );
    }


    this.unsetLoading = () => {
        loadingNotLoding( 'remove', false );
    }


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


    this.select = optionOrIndex => {
        let _index, option;

        if ( $select.disabled || loading ) {
            return;
        }

        if ( isNumber( optionOrIndex ) ) {
            _index = optionOrIndex;
            option = $parent.querySelectorAll( `.${ options.itemClassName }` )[ _index ];
        }
        else {
            option = optionOrIndex;
            _index = index( optionOrIndex );
        }

        if ( _index < 0 || _index > $select.options.length ) {
            return;
        }

        $select.options[ _index ].selected = true;

        // this.updateTitle();

        if ( lastOption ) {
            lastOption.classList.remove( options.activeOptionClass );
        }

        if ( option ) {
            option.classList.add( options.activeOptionClass );
            lastOption = option;
        }

        fire( $select, {
            "eventsName": "change"
        } );
    }


    function setSelectOptions(data) {
        $select.options.length = 0;

        data.forEach( ( optionData, index ) => {
            $select.options.add(
                new Option( optionData.nm, optionData.vl, false, index === 0 )
            );
        } );
    }


    // Set new options
    this.updateOptions = data => {
        let htmlList;

        lastOption = null;

        if (data) {
            setSelectOptions( data );
            SELF.updateTitle();
        }

        if ( !options.full ) {
            return;
        }

        $select.style.display = 'none';
        closeList();

        if ( $layer && $layer.parentNode ) {
            $layer.parentNode.removeChild( $layer );
        }

        htmlList = template( options.listTpl, { list: $select.options } );
        $parent.appendChild( strToDOM( htmlList ) );

        $layer = $parent.querySelector( '.select-layer' );

        lastOption = $parent.querySelector( `li.${ options.activeOptionClass }` );
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

    // Create skin
    wrap(
        $select,
        `<span class="${ options.className } ${ extraClass }"></span>`
    );

    $parent = $select.parentNode;

    $span = document.createElement( 'SPAN' );
    $span.classList.add( options.selectWrapClassName );
    $parent.appendChild( $span );

    this.updateTitle();

    // Also skin list
    if ( options.full ) {
        this.updateOptions();

        $span.addEventListener( 'click', openList );
        $parent.addEventListener( 'click', fakeOptionsClickHandler );
    }

    $select.__skinAPI = $parent.__skinAPI = this;

    if ( $select.hasAttribute('data-error') ) {
        this.setInvalid();
    }

    $select.addEventListener( 'change', changeHandler );
}


/**
 * Skin a select DOM element
 *
 * @function
 * @param {HTMLElement} $select
 * @param {Object} options
 * @param {Boolean} [options.full=false] - if true, skin event the option list
 * @param {Array} [options.extraClass=[]]
 * @param {String} [options.className=select-skin]
 * @param {String} [options.itemClassName=select-itm]
 * @param {String} [options.selectWrapClassName=select]
 * @param {String} [options.openedListClass=show]
 * @param {String} [options.activeOptionClass=on]
 * @param {String} [options.disabledClass=disabled]
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
*/
export function skinSelect( $select, options ) {
    new SelectSkin( $select, options );
}


/**
 * Skin all select DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} options
 * @param {Boolean} [options.full=false] - if true, skin event the option list
 * @param {Array} [options.extraClass=[]]
 * @param {String} [options.className=select-skin]
 * @param {String} [options.itemClassName=select-itm]
 * @param {String} [options.selectWrapClassName=select]
 * @param {String} [options.openedListClass=show]
 * @param {String} [options.activeOptionClass=on]
 * @param {String} [options.disabledClass=disabled]
 * @param {String} [options.loadingClass=loading]
 * @param {String} [options.listTpl]
 *
 * @example // See skinSelect for example of options
 * skinSelectAll( $wrapper, options )
 */
export function skinSelectAll( $wrapper, userOptions = {} ) {
    let $selects, defaultOptions, options;

    defaultOptions = {
        "full": false,
        "extraClass": []
    };

    options = {};

    options = extend( options, defaultOptions, userOptions );

    $selects = $wrapper.querySelectorAll( 'select' );

    $selects.forEach( $select => {
        skinSelect( $select, options );
    } );
}
