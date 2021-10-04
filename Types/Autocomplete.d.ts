namespace FLib {
    namespace Autocomplete {
        type Item = {
            name: string;
            [ key: string ]: any;
        }

        type LayerPosition  = 'top' | 'bottom';

        interface Options {
            $searchField: HTMLElement;
            /** @defaultValue document.body */
            $panelWrapper: HTMLElement;
            /** @defaultValue 200 */
            maxHeight: number;
            /** @defaultValue false */
            useCache: boolean;
            /** @defaultValue 3 */
            minchar: number;
            /** @defaultValue LayerPosition.top */
            layerPosition: LayerPosition;
            source: ( query: string | null, callback: ( results: Item[] ) => void ) => void;
            url: string;
            /**
             * Use CSS or Javascript for the position of the layer
             * @defaultValue false
            */
            cssPositionning: boolean;
            /**
             * Update or not the text field with the selected value
             * @defaultValue true
            */
            updateOnSelect: boolean;
            onSelect: ({ item, query, resultsList }) => void;
            queryParams: ( query: string ) => { "search": string };
            normalize: ( data: any ) => { success: boolean, results: Item[] };
            /**
             * Allow to manipulate the displayed value of items
             * @defaultValue (`{`item, query, resultList`}`) `=>` item.name
            */
            renderFieldValue: (options: { item: Item, query: string, resultList: Item[] }) => string;
            /**
             * @defaultValue (`{`resultItem, query, index, itemsList, cssClass`}`) `=>` `<li role="option" data-idx="${index}" class="${cssClass.item}"><a class="${cssClass.link}">${resultItem.markedName}</a></li>`
             */
            render: ( options: { resultItem: Item, query: string, index: number, itemsList: Item[], cssClass: Classname }) => string;
            /**
             * @defaultValue (`{`resultList, query, cssClass`}`) `=>` `<ul role="listbox" class="${cssClass.list}">${resultList.join('')}</ul>`
             */
            renderList: ( options: { resultList: Item[], query: string, cssClass: Classname }) => string;
            /**
             * @defaultValue (`{`errorMsg, query, cssClass`}`) `=>` `<li class="${cssClass.error}">${errorMsg}</li>`
             */
            renderError: (options: { errorMsg: string, query: string, cssClass: Classname }) => string;
            /**
             * Allow to wrap the query with a tag in the result item name
             * @defaultValue (`{`resultItem, reQuery, query, index, resultList, cssClass`}`) `=>` `{`resultItem.name && (resultItem.markedName = resultItem.name.replace(reQuery,`<mark class="${cssClass.mark}">$1</mark>`));`}`
            */
            renderMark: ( options: { resultItem: Item, reQuery?: RegExp, query: string, index: number, resultList: Item[], cssClass: Classname }) => void;
            l10n:      L10N;
            className: Classname;
        }


        interface L10N {
            /** @defaultValue No result */
            noResult: string;
            /** @defaultValue Server error */
            error: string;
        }

        interface Classname {
            /** @defaultValue ac-layer */
            layer: string;
            /** @defaultValue ac-list */
            list: string;
            /** @defaultValue acl-itm */
            item: string;
            /** @defaultValue acl-lnk */
            link: string;
            /** @defaultValue acl-mrk */
            mark: string;
            /** @defaultValue acl-error */
            error: string;
            /** @defaultValue hover */
            hover: string;
            /** @defaultValue disable */
            disable: string;
        }

        interface OptionsInit extends Partial<Options> {
            l10n?:      Partial<L10N>;
            className?: Partial<Classname>;
        }
    }
}
