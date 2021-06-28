type AutocompleteItemType = {
    name: string;
    [ key: string ]: any;
}

type AutocompleteOptionsType = {
    $searchField: HTMLElement;
    /** @default document.body */
    $panelWrapper?: HTMLElement;
    /** @default 200 */
    maxHeight?: number;
    /** @default false */
    useCache?: boolean;
    /** @default 3 */
    minchar?: number;
    /** @default AutocompleteLayerPosition.top */
    layerPosition?: AutocompleteLayerPosition;
    source?: ( query: string | null, callback: ( results: AutocompleteItemType[] ) => void ) => void;
    url?: string;
    /**
     * Use CSS or Javascript for the position of the layer
     * @default false
    */
    cssPositionning?: boolean;
    /**
     * Update or not the text field with the selected value
     * @default true
    */
    updateOnSelect?: boolean;
    onSelect?: ({ item, query, resultsList }) => void;
    queryParams?: ( query: string ) => { "search": string };
    normalize?: ( data: any ) => { success: boolean, results: AutocompleteItemType[] };
    /**
     * Allow to manipulate the displayed value of items
     * @default ({item, query, resultList}) => item.name
    */
    renderFieldValue?: (options: { item: AutocompleteItemType, query: string, resultList: AutocompleteItemType[] }) => string;
    /**
     * @default ({resultItem, query, index, itemsList, cssClass}) => `<li role="option" data-idx="${index}" class="${cssClass.item}"><a class="${cssClass.link}">${resultItem.markedName}</a></li>`
     */
    render?: ( options: { resultItem: AutocompleteItemType, query: string, index: number, itemsList: AutocompleteItemType[], cssClass: AutocompleteClassnameType }) => string;
    /**
     * @default ({resultList, query, cssClass}) => `<ul role="listbox" class="${cssClass.list}">${resultList.join('')}</ul>`
     */
    renderList?: ( options: { resultList: AutocompleteItemType[], query: string, cssClass: AutocompleteClassnameType }) => string;
    /**
     * @default ({errorMsg, query, cssClass}) => `<li class="${cssClass.error}">${errorMsg}</li>`
     */
    renderError?: (options: { errorMsg: string, query: string, cssClass: AutocompleteClassnameType }) => string;
    /**
     * Allow to wrap the query with a tag in the result item name
     * @default ({resultItem, reQuery, query, index, resultList, cssClass}) => {resultItem.name && (resultItem.markedName = resultItem.name.replace(reQuery,`<mark class="${cssClass.mark}">$1</mark>`));}
    */
    renderMark?: ( options: { resultItem: AutocompleteItemType, reQuery?: RegExp, query: string, index: number, resultList: AutocompleteItemType[], cssClass: AutocompleteClassnameType }) => void;
    l10n?:      AutocompleteL10NType;
    className?: AutocompleteClassnameType;
}


type AutocompleteL10NType = {
    /** @default No result */
    noResult?: string;
    /** @default Server error */
    error?: string;
}

type AutocompleteClassnameType = {
    /** @default ac-layer */
    layer?: string;
    /** @default ac-list */
    list?: string;
    /** @default acl-itm */
    item?: string;
    /** @default acl-lnk */
    link?: string;
    /** @default acl-mrk */
    mark?: string;
    /** @default acl-error */
    error?: string;
    /** @default hover */
    hover?: string;
    /** @default disable */
    disable?: string;
}

