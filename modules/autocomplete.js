import { gesture, gestureOff } from 'front-library/events/gesture';
import { extend } from 'front-library/helpers/extend';
import { append, remove } from 'front-library/dom/manipulation';
import { height } from 'front-library/dom/size';
import { offset } from 'front-library/dom/offset';
import { outerHeight, outerWidth } from 'front-library/dom/outer-size';
import { position } from 'front-library/dom/position';

/**
 * Autocomplete
 * @class
 *
 * @see extra/modules/autocomplete.md for details.
 *
 * @param {Object} userOptions
 * @param {HTMLElement} userOptions.$searchField
 * @param {HTMLElement} [userOptions.$panelWrapper=document.body]
 * @param {number} [userOptions.maxHeight=200]
 * @param {boolean} [userOptions.useCache=false]
 * @param {number} [userOptions.minchar=3]
 * @param {} [userOptions.source]
 * @param {string} userOptions.url
 * @param {string} [userOptions.cssPositionning=false] - Use CSS or Javascript for the position of the layer
 * @param {boolean} [userOptions.updateOnSelect=true] - Update or not the text field with the selected value
 * @param {Callback} [userOptions.onSelect] - ( option, query, resultsList ) => {}
 * @param {Callback} [userOptions.queryParams=query => { return { "search": query } }]
 * @param {Function} [userOptions.normalize=data => data ] - Conver the ajax response in the good JSON format => {success, results}
 * @param {Function} [userOptions.renderFieldValue=({item, query, resultList}) => item.name] - Allow to manipulate the displayed value of items
 * @param {Function} [userOptions.render=({resultItem, query, index, itemsList, cssClass}) => `<li role="option" data-idx="${index}" class="${cssClass.item}"><a class="${cssClass.link}">${resultItem.markedName}</a></li>`]
 * @param {Function} [userOptions.renderList=({resultList, query, cssClass}) => `<ul role="listbox" class="${cssClass.list}">${resultList.join('')}</ul>`]
 * @param {Function} [userOptions.renderError=({errorMsg, query, cssClass}) => `<li class="${cssClass.error}">${errorMsg}</li>`]
 * @param {Function} [userOptions.renderMark] - Allow to wrap the query with a tag in the result item name ({resultItem, reQuery, query, index, resultList, cssClass}) => {resultItem.name && (resultItem.markedName = resultItem.name.replace(reQuery,`<mark class="${cssClass.mark}">$1</mark>`));}
 * @param {Object} [userOptions.l10n]
 * @param {string} [userOptions.l10n.noResult=No result]
 * @param {string} [userOptions.l10n.error=Server error]
 * @param {Object} [userOptions.className]
 * @param {string} [userOptions.className.layer=ac-layer]
 * @param {string} [userOptions.className.list=ac-list]
 * @param {string} [userOptions.className.item=acl-itm]
 * @param {string} [userOptions.className.mark=acl-mrk]
 * @param {string} [userOptions.className.error=acl-error]
 * @param {string} [userOptions.className.hover=hover]
 */
export function Autocomplete(userOptions = {}) {
    let options, cacheQuery, timeoutId, $layer, $list, currentResults, tplSuggestion, selectionLocked, hasResults, selectedIndex, nbResults, url, hideTimeoutId, $field, className, $panelWrapper, l10n, defaultOptions, currentQuery, requestAbortController;

    if (!("AbortController" in window)) {
        throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
    }

    defaultOptions = {
        $searchField: null,
        $panelWrapper: document.body,
        maxHeight: 200,
        useCache: false,
        minchar: 3,
        source: null,
        url: "",
        updateOnSelect: true,
        onSelect: null,
        cssPositionning: false,
        queryParams: query => {
            return { search: query }
        },
        normalize: data => {
            return data
        },
        renderFieldValue: ({ item }) => {
            return item.name;
        },
        render: ({resultItem, index, cssClass}) => {
            return `<li role="option" class="${cssClass.item}"><a class="${cssClass.link}" data-idx="${index}">${resultItem.markedName}</a></li>`;
        },
        renderList: ({resultList, cssClass}) => {
            return `<ul role="listbox" class="${cssClass.list}">${resultList.join('')}</ul>`;
        },
        renderError: ({errorMsg, cssClass}) => {
            return `<li class="${cssClass.error}">${errorMsg}</li>`;
        },
        renderMark: ({resultItem, reQuery, cssClass}) => {
            resultItem.name && (resultItem.markedName = resultItem.name.replace(
                reQuery,
                `<mark class="${cssClass.mark}">$1</mark>`
            ));
        },
        l10n: {
            noResult: "No result",
            error: "Server error"
        },
        className: {
            layer: "ac-layer",
            list: "ac-list",
            item: "acl-itm",
            link: "acl-lnk",
            mark: "acl-mrk",
            error: "acl-error",
            hover: "hover"
        }
    }

    const SELF = this;

    options = extend(defaultOptions, userOptions);

    cacheQuery = {};
    selectionLocked = true;
    selectedIndex = -1;
    nbResults = 0;
    hasResults = false;
    url = options.url;
    $field = options.$searchField;
    $panelWrapper = options.$panelWrapper;
    className = options.className;
    l10n = options.l10n;

    tplSuggestion = `<ul role="listbox" class="${className.list}">{LIST}</ul>`;

    $layer = document.createElement('DIV');
    $layer.classList.add(className.layer);

    append($layer, $panelWrapper);

    $field.setAttribute('autocomplete', 'off');

    /**
     * Update the current options
     *
     * @param {object} newOption - Same options as constructor
     */
    this.setOptions = function(_newOption = {}) {
        options = extend(options, _newOption);
    }


    /**
     * Display the result list
     * @ignore
     */
    function show() {
        let topVal, parentFieldOffset, fieldHeight, wrapperHeight, wrapperStyle;

        wrapperStyle = $layer.style;

        if ( !options.cssPositionning ) {
            parentFieldOffset = offset($field.parentNode);
            wrapperHeight = height($layer);
            fieldHeight = outerHeight($field);

            topVal =
                options.display === 'top'
                    ? parentFieldOffset.top - wrapperHeight + 1
                    : parentFieldOffset.top + fieldHeight + 1;


            wrapperStyle.top = `${topVal}px`;
            wrapperStyle.left = `${parentFieldOffset.left}px`;
            wrapperStyle.width = `${outerWidth($field)}px`;
        }

        wrapperStyle.display = 'block';

        $layer.scrollTop = 0;

        setTimeout(() => {
            gesture(document.body, '__AutocompleteTapOutside', {
                tap: clickOutsideHandler
            })
        }, 0)
    }


    /**
     * Hide the result list
     * @ignore
     */
    function hide() {
        clearTimeout(hideTimeoutId);
        gestureOff(document.body, '__AutocompleteTapOutside');

        $layer.style.display = 'none';
        selectionLocked = true;
        // $layer.innerHTML                = '';
        // $list = null;
    }

    function clickOutsideHandler(e, $target) {
        let $parent = $target.closest(className.layer);

        if (!$parent && $target !== $field) {
            hideTimeoutId = setTimeout(() => {
                hide();
            }, 500);
        }
    }

    /**
     * Create the results list
     * @ignore
     *
     * @param {string[]} _list - Array of result
     * @param {string} _query
     */
    function set(_list, _query) {
        let html, reQuery;

        currentResults = _list;
        currentQuery = _query;

        html = [];
        hasResults = true;

        reQuery = new RegExp(`(${_query
            .replace(/a/gi, '[aàâä]')
            .replace(/c/gi, '[cç]')
            .replace(/e/gi, '[eéèêë]')
            .replace(/i/gi, '[iìïî]')
            .replace(/o/gi, '[oòôö]')
            .replace(/u/gi, '[uùûü]')
            .replace(/y/gi, '[y]')})`, 'gi');

        html = _list.map( (item, i) => {
            options.renderMark(
                {
                    "resultItem": item,
                    reQuery,
                    "query": _query,
                    "index": i,
                    "resultList": _list,
                    "cssClass": className
                }
            );
            return options.render({
                resultItem: item,
                index: i,
                itemsList: _list,
                cssClass: className
            });
        });

        $layer.innerHTML = options.renderList({
            resultList: html,
            cssClass: className
        });

        $list = $layer.querySelector(className.list);

        selectionLocked = false;
        nbResults = _list.length;
        selectedIndex = -1;
    }


    /**
     * Display error message (like "No results")
     * @ignore
     */
    function setError() {
        let html = []

        html.push(options.renderError( {
            errorMsg: l10n.noResult,
            query: currentQuery,
            cssClass: className
        } ));

        $layer.innerHTML = tplSuggestion.replace('{LIST}', html);

        selectionLocked = true;
        selectedIndex = 0;
        nbResults = 0;
    }

    /**
     * Select the choose element and fill the field with its value
     * @ignore
     *
     * @param {number} selectedIndex - Index of the selected item
     */
    function select(_selectedIndex) {
        if (selectionLocked) {
            return;
        }

        selectedIndex =
            typeof _selectedIndex === 'undefined' ? selectedIndex : _selectedIndex;

        if (options.updateOnSelect && options.renderFieldValue) {
            $field.value = options.renderFieldValue.call(
                SELF,
                {
                    item: currentResults[selectedIndex],
                    query: currentQuery,
                    resultList: currentResults
                }
            );
        }

        hide();

        if (options.onSelect) {
            options.onSelect.call(
                SELF,
                {
                    resultsList: currentResults,
                    query: currentQuery,
                    item: currentResults[selectedIndex]
                }
            );
        }
    }


    /**
     * Highlight the choosen item
     * @ignore
     *
     * @param {number} _index - Index of the item to hover
     */
    function hover(_index) {
        let $item, itemPos, top, itemHeight;

        if (selectionLocked) {
            return;
        }

        selectedIndex = _index;
        $item = $layer.querySelector('.' + className.hover);

        if ($item) {
            $item.classList.remove(className.hover);
        }

        $item = $layer.querySelectorAll('li')[_index];

        if ($item) {
            $item.classList.add(className.hover);
        }

        // $field.value = query;

        if ($list) {
            itemPos = position($item);
            itemHeight = outerHeight($item);
            top = $list.scrollTop;

            if (itemPos.top + itemHeight > options.maxHeight + top) {
                $list.scrollTop = itemPos.top - options.maxHeight + itemHeight;
            } else if (top > 0 && itemPos.top < top) {
                $list.scrollTop = itemPos.top;
            }
        }
    }


    /**
     * Highlight the next item
     * @ignore
     */
    function hoverNext() {
        hover(selectedIndex + 1 < nbResults ? selectedIndex + 1 : 0);
    }


    /**
     * Highlight the previous item
     * @ignore
     */
    function hoverPrevious() {
        hover(selectedIndex - 1 >= 0 ? selectedIndex - 1 : nbResults - 1);
    }


    /**
     * Load the results list
     * @ignore
     *
     * @param {string} _query
     */
    function load(_query) {
        currentResults = [];

        hasResults = false;

        if (!!cacheQuery[_query] && options.useCache) {
            set(cacheQuery[_query], _query);
            show();
        }
        else if (options.source) {
            options.source(_query, results => {
                cacheQuery[_query] = results;

                if (results.length) {
                    set(results, _query);
                } else {
                    setError(l10n.noResult);
                }

                show();
            })

            return
        }
        else {
            let params, myHeaders;

            if (requestAbortController) {
                requestAbortController.abort();
            }

            requestAbortController = new AbortController();

            params = options.queryParams(_query);

            params = Object.keys(params).reduce((result, key, index) => {
                return (index > 0 ? result + '&' : '') + key + '=' + params[key];
            }, '' );

            url = [ url, url.indexOf('?') > -1 ? '&' : '?', params ].join('');

            myHeaders = new Headers();
            myHeaders.append('X-Requested-With', 'XMLHttpRequest');

            fetch( url, {
                signal: requestAbortController.signal,
                "headers": myHeaders
            } )
                .then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response;
                    }
                    else {
                        let error = new Error(response.statusText);
                        error.response = response;
                        throw error;
                    }
                })
                .then(function(response) {
                    return response.json()
                })
                .then(_data => {
                    let normalizedData = options.normalize(_data);

                    if (
                        normalizedData.success &&
                        normalizedData.results.length > 0
                    ) {
                        set(normalizedData.results, _query);
                        cacheQuery[_query] = normalizedData.results;
                    } else if (!normalizedData.results.length) {
                        setError(l10n.noResult);
                    } else {
                        setError(l10n.error);
                    }
                })
                .catch(() => {
                    setError();
                })
                .finally(() => {
                    show();
                    requestAbortController = null;
                });
        }
    }

    function onKeydown(e) {
        switch (e.keyCode) {
            case 38: // UP
            case 40: // DOWN
            case 13: // ENTER
            case 27: // ESCAPE
                e.preventDefault();
                break;

            default:
                break;
        }
    }

    function onKeyup(e) {
        let query = e.target.value;

        // Autocomplete désactivé pour l'instant
        switch (e.keyCode) {
            case 38: // UP
                hoverPrevious();
                break;

            case 40: // DOWN
                hoverNext();
                break;

            case 13: // ENTER
                select();
                break;

            case 27: // ESCAPE
                hide();
                if (options.results) {
                    options.results.hide();
                }
                break;

            case 39: // RIGHT
            case 37: // LEFT
            case 35: // END
            case 36: // HOME
            case 16: // SHIFT
            case 17: // CTRL
            case 18: // ALT
            case 20: // CAPS LOCK
            case 33: // PAGE UP
            case 34: // PAGE DOWN
            case 91: // CMD (Apple)
                break;

            // case 8:   // BS
            // case 46:    // DEL
            default:
                clearTimeout(timeoutId);

                if (query.trim().length >= options.minchar) {
                    timeoutId = setTimeout(() => {
                        load(query);
                    }, 800);
                } else {
                    hide();
                    if (requestAbortController) {
                        requestAbortController.abort();
                    }
                }
                break
        }
    }

    function onFocus() {
        clearTimeout(hideTimeoutId);
    }

    function onTapField() {
        if (hasResults) {
            selectionLocked = false;
            show();
        }
    }

    function onTapLinks(e, $target) {
        let idx = $target.getAttribute('data-idx');
        select(+idx);
    }

    // Bind

    gesture($layer, '__AutocompleteTapLayer', {
        selector: `.${ className.link }`,
        tap: onTapLinks
    });

    gesture($field, '__AutocompleteTapField', {
        tap: onTapField
    });

    $field.addEventListener('keyup', onKeyup);
    $field.addEventListener('keydown', onKeydown);
    $field.addEventListener('focus', onFocus);

    /**
     * Destroy the Autocomplete
     */
    this.clean = () => {
        $field.removeEventListener('keyup', onKeyup);
        $field.removeEventListener('keydown', onKeydown);
        $field.removeEventListener('focus', onFocus);

        gestureOff(document.body, '__AutocompleteTapOutside');

        gestureOff($field, '__AutocompleteTapField');

        gestureOff($layer, '__AutocompleteTapLayer');

        clearTimeout(hideTimeoutId);

        if (requestAbortController) {
            requestAbortController.abort();
            requestAbortController = null;
        }

        remove($layer);
    }
}
