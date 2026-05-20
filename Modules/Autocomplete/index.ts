import { off, on } from "../../Events/EventsManager";
import { debounce } from "../../Helpers/Debounce";
import AbstractAutocompleteAdapter from "./AbstractAutocompleteAdapter";
import { extend } from "../../Helpers/Extend";
import { strToDOM } from "../../DOM/StrToDOM";
import { offset } from "DOM/Offset";
import { height } from "../../DOM/Size";
import { position } from "../../DOM/Position";
import { outerHeight, outerWidth } from "../../DOM/OuterSize";
import { remove } from "../../DOM/Manipulation";
import { index } from "../../DOM/Index";

type AutocompleteOptions<ItemDataType> = {
    adapter: AbstractAutocompleteAdapter<ItemDataType>;
    cssPositionning?: boolean;
    debounceDelay?: number;
    hideLayerDelay?: number;
    layerPosition?: "top" | "bottom";
    $layerWrapper: HTMLElement;
    minChar?: number;
    onSelect?: (options: {
        item: ItemDataType;
        index: number;
        query: string;
        results: ItemDataType[];
    }) => void;
    $searchField: HTMLInputElement;
    shouldMarkValue?: boolean;
};

const PREVENT_DEFAULT_KEY_LIST = [
    "Up",
    "ArrowUp",
    "Down",
    "ArrowDown",
    "Esc",
    "Escape",
];

const ARIA_SELECTED_ATTRIBUTE = "aria-selected";
const HOVERED_ATTRIBUTE = "data-hovered";
const ITEM_ATTRIBUTE = "data-ac-item";
const ITEM_SELECTOR = `[${ITEM_ATTRIBUTE}]`;

const DEFAULT_OPTIONS = {
    cssPositionning: true,
    debounceDelay: 800,
    hideLayerDelay: 300,
    layerPosition: "top",
    $layerWrapper: document.body,
    minChar: 3,
    shouldMarkValue: false,
};

export default class Autocomplete<ItemDataType> {
    #adapter: AbstractAutocompleteAdapter<ItemDataType>;
    #debouncedSourceCall!: (query: string) => Promise<void>;
    #currentQuery: string = "";
    #currentResults: { $item: HTMLElement; item: ItemDataType }[] = [];
    #hideTimeoutId;
    #hoveredItemIndex: number = -1;
    #isDisabled: boolean = false;
    #$layerWrapper: HTMLElement;
    #$layer!: HTMLElement;
    #$list!: HTMLElement;
    #options: AutocompleteOptions<ItemDataType>;
    #$searchField: HTMLInputElement;
    #selectedItemIndex: number = -1;
    #selectionLocked: boolean = false;

    get isDisable(): boolean {
        return this.#isDisabled || this.#$searchField.disabled;
    }

    constructor(options: AutocompleteOptions<ItemDataType>) {
        this.#options = extend(DEFAULT_OPTIONS, options);

        this.#adapter = this.#options.adapter;
        this.#$layerWrapper = this.#options.$layerWrapper;
        this.#$layerWrapper = this.#options.$layerWrapper;
        this.#$searchField = this.#options.$searchField;

        this.#initElements();
        this.#init();
    }

    #initElements(): void {
        this.#$layer = strToDOM(this.#adapter.layerRender()) as HTMLElement;
        this.#$list = strToDOM(this.#adapter.listRender()) as HTMLElement;
        this.#$layer.appendChild(this.#$list);
        this.#$layerWrapper.appendChild(this.#$layer);

        this.#$layer.inert = true;
        this.#$searchField.setAttribute("autocomplete", "off");
    }

    #init(): void {
        this.#debouncedSourceCall = debounce(
            this.#sourceCall,
            this.#options.debounceDelay,
        ) as (query: string) => Promise<void>;

        on(this.#$searchField, {
            eventsName: "keyup",
            callback: this.#onKeyup,
        });

        on(this.#$searchField, {
            eventsName: "keydown",
            callback: this.#onKeydown,
        });

        on(this.#$searchField, {
            eventsName: "focus",
            callback: this.#onFocus,
        });

        on(this.#$list, {
            selector: ITEM_SELECTOR,
            eventsName: "click",
            callback: this.#onItemClick,
        });

        on(this.#$list, {
            selector: ITEM_SELECTOR,
            eventsName: "mouseover",
            callback: this.#onItemOver,
        });
    }

    #onItemClick = (e: Event, $item: HTMLElement): void => {
        if (this.isDisable) {
            return;
        }

        this.#select(index($item));
    };

    #onKeydown = (e: KeyboardEvent): void => {
        if (
            PREVENT_DEFAULT_KEY_LIST.includes(e.key) ||
            (e.key === "Enter" && this.#hoveredItemIndex !== -1)
        ) {
            e.preventDefault();
        }
    };

    #onKeyup = (e: KeyboardEvent): void => {
        if (this.isDisable) {
            return;
        }

        const query = this.#$searchField.value;

        switch (e.key) {
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
                this.hideLayer();
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
                if (query.trim().length >= this.#options.minChar!) {
                    this.#debouncedSourceCall(query.trim());
                } else {
                    this.hideLayer();
                    this.#adapter.abortSource?.();
                }
                break;
        }
    };

    async #sourceCall(query: string): Promise<void> {
        this.#currentQuery = query;

        try {
            const results = await this.#adapter.source(query);
            this.#parseResults(results);
        } catch (e: any) {
            this.#createErrorDisplay(e.message);
        }
    }

    #parseResults(results: ItemDataType[]): void {
        if (!results.length) {
            this.#createEmptyResultDisplay();
            return;
        }
        this.#createResults(results);
    }

    #createResults(results: ItemDataType[]): void {
        this.resetResults();

        this.#currentResults = results.map((item, index) => {
            const markedItem = this.#options.shouldMarkValue
                ? this.#adapter.markValue({
                      item,
                      index,
                      query: this.#currentQuery,
                  })
                : item;
            const $item = strToDOM(
                this.#adapter.itemRender({
                    item: markedItem,
                    index,
                }),
            ) as HTMLElement;

            $item.setAttribute(ARIA_SELECTED_ATTRIBUTE, "false");
            $item.setAttribute(ITEM_ATTRIBUTE, String(index));

            this.#$list.appendChild($item);

            return {
                $item,
                item: markedItem,
            };
        });

        this.#show();
    }

    #createEmptyResultDisplay(): void {
        this.resetResults();
        this.#$list.appendChild(
            strToDOM(this.#adapter.noResultRender(this.#currentQuery)),
        );
        this.#show();
    }

    #createErrorDisplay(errorMessage: string): void {
        this.resetResults();
        this.#$list.appendChild(
            strToDOM(
                this.#adapter.errorRender(errorMessage, this.#currentQuery),
            ),
        );
        this.#show();
    }

    #select = (_selectedIndex?: number): void => {
        if (this.#selectionLocked) {
            return;
        }

        const newSelectedItemIndex =
            typeof _selectedIndex === "undefined"
                ? this.#hoveredItemIndex
                : _selectedIndex;

        if (
            newSelectedItemIndex < 0 ||
            newSelectedItemIndex > this.#currentResults.length - 1
        ) {
            return;
        }

        const newSelectedResult = this.#currentResults[newSelectedItemIndex];

        if (!newSelectedResult) {
            return;
        }
        const currentlySelectedResult =
            this.#currentResults[this.#selectedItemIndex];

        if (currentlySelectedResult) {
            currentlySelectedResult.$item.setAttribute(
                ARIA_SELECTED_ATTRIBUTE,
                "false",
            );
        }

        newSelectedResult.$item.setAttribute(ARIA_SELECTED_ATTRIBUTE, "true");

        this.#selectedItemIndex = newSelectedItemIndex;

        const data = {
            index: this.#selectedItemIndex,
            item: newSelectedResult.item,
            query: this.#currentQuery,
            results: this.#currentResults.map((result) => result.item),
        };

        if (this.#adapter.updateInputValueFromItem) {
            this.#$searchField.value =
                this.#adapter.updateInputValueFromItem(data);
        }

        this.hideLayer();

        this.#options.onSelect?.(data);
    };

    #show = (): void => {
        const wrapperStyle = this.#$layer.style;

        wrapperStyle.display = "block";

        if (!this.#options.cssPositionning) {
            const parentFieldOffset = offset(this.#$searchField.parentElement!);
            const wrapperHeight = height(this.#$layer);
            const fieldHeight = outerHeight(this.#$searchField);

            const topVal =
                this.#options.layerPosition === "top"
                    ? parentFieldOffset.top - wrapperHeight + 1
                    : parentFieldOffset.top + fieldHeight + 1;

            wrapperStyle.top = `${topVal}px`;
            wrapperStyle.left = `${parentFieldOffset.left}px`;
            wrapperStyle.width = `${outerWidth(this.#$searchField)}px`;
        }

        this.#$layer.scrollTop = 0;
        this.#$layer.inert = false;
        this.#selectionLocked = false;

        setTimeout(() => {
            on(document.body, {
                eventsName: "click",
                callback: this.#clickOutsideHandler,
            });
        }, 0);
    };

    hideLayer = (): void => {
        clearTimeout(this.#hideTimeoutId);
        off(document.body, {
            eventsName: "click",
            callback: this.#clickOutsideHandler,
        });

        this.#$layer.style.display = "none";
        this.#$layer.inert = true;
        this.#selectionLocked = true;
        this.#hoveredItemIndex = -1;
        this.#selectedItemIndex = -1;
    };

    #clickOutsideHandler = (e: Event): void => {
        const $target = e.target as HTMLElement;

        if (
            this.#$layer !== $target &&
            !this.#$layer.contains($target) &&
            $target !== this.#$searchField
        ) {
            this.#hideTimeoutId = setTimeout(() => {
                this.hideLayer();
            }, this.#options.hideLayerDelay!);
        }
    };

    #onFocus = (): void => {
        clearTimeout(this.#hideTimeoutId);

        if (this.isDisable) {
            return;
        }

        if (this.#currentResults.length) {
            this.#show();
        }
    };

    #onItemOver = (e: Event, $item: HTMLElement): void => {
        if (this.isDisable) {
            return;
        }

        this.#hover(index($item));
    };

    #hover = (_index: number): void => {
        if (
            this.#selectionLocked ||
            _index < 0 ||
            _index >= this.#currentResults.length
        ) {
            return;
        }

        const currentlyHoveredItem =
            this.#currentResults[this.#hoveredItemIndex];

        const nextHoveredItem = this.#currentResults[_index];
        this.#hoveredItemIndex = _index;

        if (currentlyHoveredItem) {
            currentlyHoveredItem.$item.removeAttribute(HOVERED_ATTRIBUTE);
        }

        if (nextHoveredItem) {
            nextHoveredItem.$item.setAttribute(HOVERED_ATTRIBUTE, "true");
        }

        if (this.#$list) {
            const listOuterHeight = outerHeight(this.#$list);
            const itemPos = position(nextHoveredItem.$item);
            const itemHeight = outerHeight(nextHoveredItem.$item);
            const top = this.#$list.scrollTop;

            if (itemPos.top + itemHeight > listOuterHeight + top) {
                this.#$list.scrollTop =
                    itemPos.top - listOuterHeight + itemHeight;
            } else if (top > 0 && itemPos.top < top) {
                this.#$list.scrollTop = itemPos.top;
            }
        }
    };

    #hoverNext = (): void => {
        this.#hover(
            this.#hoveredItemIndex + 1 < this.#currentResults.length
                ? this.#hoveredItemIndex + 1
                : 0,
        );
    };

    #hoverPrevious = (): void => {
        this.#hover(
            this.#hoveredItemIndex - 1 >= 0
                ? this.#hoveredItemIndex - 1
                : this.#currentResults.length - 1,
        );
    };

    resetField(): this {
        this.#currentQuery = "";
        this.#$searchField.value = "";

        return this;
    }

    resetResults(): this {
        this.#currentResults.length;
        this.#selectedItemIndex = -1;
        this.#hoveredItemIndex = -1;
        this.#$list.innerHTML = "";

        return this;
    }

    reset(): this {
        this.resetField();
        this.resetResults();

        return this;
    }

    disable(): this {
        this.#isDisabled = true;
        this.#$searchField.disabled = true;

        return this;
    }

    enable(): this {
        this.#isDisabled = false;
        this.#$searchField.disabled = false;

        return this;
    }

    dispose(): this {
        off(this.#$searchField, {
            eventsName: "keyup",
            callback: this.#onKeyup,
        });

        off(this.#$searchField, {
            eventsName: "keydown",
            callback: this.#onKeydown,
        });

        off(this.#$searchField, {
            eventsName: "focus",
            callback: this.#onFocus,
        });

        off(this.#$list, {
            eventsName: "click",
            callback: this.#onItemClick,
        });

        off(document.body, {
            eventsName: "click",
            callback: this.#clickOutsideHandler,
        });

        off(this.#$list, {
            eventsName: "mouseover",
            callback: this.#onItemOver,
        });

        clearTimeout(this.#hideTimeoutId);

        this.#adapter.abortSource?.();

        remove(this.#$layer);

        return this;
    }
}
