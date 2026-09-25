import { fire, off, on } from "../../Events/EventsManager";
import { debounce } from "../../Helpers/Debounce";
import AbstractAutocompleteAdapter from "./AbstractAutocompleteAdapter";
import { extend } from "../../Helpers/Extend";
import { offset } from "../../DOM/Offset";
import { height } from "../../DOM/Size";
import { outerHeight, outerSize } from "../../DOM/OuterSize";
import { position } from "../../DOM/Position";

type AutocompleteOptions<OptionDataType> = {
    adapter: AbstractAutocompleteAdapter<OptionDataType>;
    cssPositionning: boolean;
    debounceDelay: number;
    hideLayerDelay: number;
    layerPosition: "top" | "bottom";
    minChar: number;
    onCloseLayer?(autocomplete: Autocomplete<OptionDataType>): void;
    onOpenLayer?(autocomplete: Autocomplete<OptionDataType>): void;
    onReady?(autocomplete: Autocomplete<OptionDataType>): void;
    onSelect?(option: SelectedOptionParam<OptionDataType>): void;
    $searchField: HTMLInputElement;
    showLayerClass?: string;
};

type AutocompleteUserOptions<OptionDataType> = Partial<
    AutocompleteOptions<OptionDataType>
> & {
    adapter: AbstractAutocompleteAdapter<OptionDataType>;
    $searchField: HTMLInputElement;
};

export type SelectedOptionParam<OptionDataType> = {
    autocomplete: Autocomplete<OptionDataType>;
    option: OptionDataType;
    index: number;
    query: string;
    results: OptionDataType[];
};

type OptionType<OptionDataType> = {
    index: number;
    option: OptionDataType;
    $option: HTMLElement;
};

export const AutocompleteEventsName = {
    onReady: "onready",
    onSelect: "onselect",
    onOpenLayer: "onopenlayer",
    onCloseLayer: "oncloselayer",
} as const;

const ARIA_SELECTED_ATTRIBUTE = "aria-selected";
const FOCUSED_ATTRIBUTE = "data-focus";
const ITEM_ATTRIBUTE = "data-ac-item";
const ITEM_SELECTOR = `[${ITEM_ATTRIBUTE}]`;

const DEFAULT_OPTIONS = {
    cssPositionning: true,
    debounceDelay: 800,
    hideLayerDelay: 300,
    layerPosition: "top",
    minChar: 1,
};

let uid = 0;

export default class Autocomplete<OptionDataType> {
    #adapter: AbstractAutocompleteAdapter<OptionDataType>;
    #$button?: HTMLElement;
    #comboboxHasVisualFocus: boolean = false;
    #configuration: AutocompleteOptions<OptionDataType>;
    #currentQuery: string = "";
    #debouncedSourceCall!: (query: string) => Promise<void>;
    #hideTimeoutId: number = -1;
    #highlightedOption: OptionType<OptionDataType> | null = null;
    #isDisabled: boolean = false;
    #isLayerOpened: boolean = false;
    #$layer!: HTMLElement;
    #$list!: HTMLElement;
    #listboxHasHover: boolean = false;
    #listboxHasVisualFocus: boolean = false;
    #options: OptionType<OptionDataType>[] = [];
    #$searchField: HTMLInputElement;
    #selectedOption: OptionType<OptionDataType> | null = null;
    #selectionLocked: boolean = false;

    get hasResults(): boolean {
        return this.#options.length > 0;
    }

    get isDisable(): boolean {
        return this.#isDisabled || this.#$searchField.disabled;
    }

    get $layer(): HTMLElement {
        return this.#$layer;
    }

    get $list(): HTMLElement {
        return this.#$list;
    }

    get $searchField(): HTMLInputElement {
        return this.#$searchField;
    }

    get selectedOption(): OptionType<OptionDataType> | null {
        return this.#selectedOption;
    }

    constructor(options: AutocompleteUserOptions<OptionDataType>) {
        this.#configuration = extend(
            DEFAULT_OPTIONS,
            options,
        ) as AutocompleteOptions<OptionDataType>;

        this.#adapter = this.#configuration.adapter;
        this.#$searchField = this.#configuration.$searchField;

        this.#initElements();
        this.#initSourceCall();
        this.#initSearchFieldEvents();
        this.#initListboxEvents();
        this.#initButtonEvents();

        setTimeout(this.#dispatchReadyEvents, 0);
    }

    #initElements(): void {
        this.#$searchField.setAttribute("autocomplete", "off");
        this.#$searchField.setAttribute("aria-autocomplete", "list");
        this.#$searchField.setAttribute("aria-expanded", "false");
        this.#$searchField.setAttribute("role", "combobox");

        if (!this.#$searchField.id) {
            this.#$searchField.id = `autocomp-search-field-${uid++}`;
        }

        const { $button, $layer, $list } = this.#adapter.render({
            autocomplete: this,
            $searchField: this.#$searchField,
        });

        this.#$button = $button;
        this.#$button?.setAttribute("aria-expanded", "false");

        this.#$list = $list;
        this.#$list.setAttribute("role", "listbox");
        if (!this.#$list.id) {
            this.#$list.id = `autocomp-search-list-${uid++}`;
        }

        this.#$layer = $layer;
        if (!this.#$layer.id) {
            this.#$layer.id = `autocomp-search-layer-${uid++}`;
        }

        this.#$layer.appendChild(this.#$list);

        this.#$layer.inert = true;
    }

    #initSourceCall(): void {
        this.#debouncedSourceCall = debounce(
            this.#sourceCall,
            this.#configuration.debounceDelay,
        ) as (query: string) => Promise<void>;
    }

    #initSearchFieldEvents(): void {
        on(this.#$searchField, {
            eventsName: "keydown",
            callback: this.#onSearchFieldKeydownHandler,
        });

        on(this.#$searchField, {
            eventsName: "keyup",
            callback: this.#onSearchFieldKeyupHandler,
        });

        on(this.#$searchField, {
            eventsName: "click",
            callback: this.#onSearchFieldClickHandler,
        });

        on(this.#$searchField, {
            eventsName: "focus",
            callback: this.#onSearchFieldFocusHandler,
        });

        on(this.#$searchField, {
            eventsName: "blur",
            callback: this.#onSearchFieldBlurHandler,
        });
    }

    #initListboxEvents(): void {
        on(this.#$list, {
            eventsName: "pointerover",
            callback: this.#onListBoxOverHandler,
        });

        on(this.#$list, {
            eventsName: "pointerout",
            callback: this.#onListBoxOutHandler,
        });

        on(this.#$list, {
            selector: ITEM_SELECTOR,
            eventsName: "click",
            callback: this.#onOptionClickHandler,
        });

        on(this.#$list, {
            selector: ITEM_SELECTOR,
            eventsName: "pointerover",
            callback: this.#onOptionOverHandler,
        });

        on(this.#$list, {
            selector: ITEM_SELECTOR,
            eventsName: "pointerout",
            callback: this.#onOptionOutHandler,
        });
    }

    #initButtonEvents(): void {
        if (!this.#$button) {
            return;
        }

        on(this.#$button, {
            eventsName: "click",
            callback: this.#onButtonClickHandler,
        });
    }

    #dispatchReadyEvents = (): void => {
        this.#configuration.onReady?.(this);
        fire(this, {
            eventsName: AutocompleteEventsName.onReady,
            detail: this,
        });

        this.#configuration.adapter.onReady?.(this);
        fire(this.#configuration.adapter, {
            eventsName: AutocompleteEventsName.onReady,
            detail: this,
        });
    };

    #onSearchFieldKeydownHandler = (e: KeyboardEvent): void => {
        if (this.isDisable || e.ctrlKey || e.shiftKey) {
            return;
        }

        let shouldPreventDefault = false;

        const query = this.#$searchField.value;

        switch (e.key) {
            case "Enter":
                shouldPreventDefault = true;

                if (this.#listboxHasVisualFocus) {
                    this.#select(this.#highlightedOption);
                }
                this.#hide(true);
                this.#setVisualFocusOnSearchField();
                break;

            case "Tab":
                if (this.#listboxHasVisualFocus) {
                    this.#select(this.#highlightedOption);
                }

                this.#hide(true);

                break;

            case "Down":
            case "ArrowDown":
                shouldPreventDefault = true;

                if (!this.hasResults) {
                    break;
                }

                if (this.#listboxHasVisualFocus) {
                    this.#highlightNextOption();
                    break;
                }

                this.#show();

                if (e.altKey) {
                    break;
                }

                this.#setVisualFocusOnListBox();
                this.#highlightFirstOption();
                break;

            case "Up":
            case "ArrowUp":
                shouldPreventDefault = true;

                if (!this.hasResults) {
                    break;
                }

                if (this.#listboxHasVisualFocus) {
                    this.#highlightPreviousOption();
                    break;
                }

                this.#show();

                if (e.altKey) {
                    break;
                }

                this.#setVisualFocusOnListBox();
                this.#highlightLastOption();
                break;

            case "Esc":
            case "Escape":
                shouldPreventDefault = true;

                this.#highlightedOption = null;
                if (this.#isLayerOpened) {
                    this.#hide(true);
                    this.#currentQuery = query;
                    this.#setVisualFocusOnSearchField();
                    break;
                }

                this.#$searchField.value = "";
                break;

            case "Home":
                shouldPreventDefault = true;

                this.#$searchField.setSelectionRange(0, 0);
                break;

            case "End":
                shouldPreventDefault = true;

                const length = this.#$searchField.value.length;
                this.#$searchField.setSelectionRange(length, length);
                break;

            default:
                break;
        }

        if (shouldPreventDefault) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    #onSearchFieldKeyupHandler = (e: KeyboardEvent): void => {
        if (this.isDisable || e.key === "Escape" || e.key === "Esc") {
            return;
        }

        let shouldPreventDefault = false;
        const query = this.#$searchField.value;

        switch (e.key) {
            case "Del":
            case "Delete":
            case "Backspace":
                shouldPreventDefault = true;
                this.#setVisualFocusOnSearchField();
                this.#clearOptionsAttribute();
                this.#search(query);
                break;

            case "Left":
            case "ArrowLeft":
            case "Right":
            case "ArrowRight":
            case "Home":
            case "End":
                shouldPreventDefault = true;
                this.#setVisualFocusOnSearchField();
                this.#clearOptionsAttribute();
                break;

            default:
                if (!this.#isPrintableCharacter(e.key)) {
                    break;
                }
                shouldPreventDefault = true;
                this.#setVisualFocusOnSearchField();
                this.#clearOptionsAttribute();
                this.#search(query);
                break;
        }

        if (shouldPreventDefault) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    #search(query: string): void {
        this.#highlightedOption = null;
        if (query.trim().length >= this.#configuration.minChar) {
            this.#debouncedSourceCall(query.trim());
            return;
        }

        this.#hide(true);
        this.#adapter.abortSource?.();
    }

    #onSearchFieldClickHandler = (): void => {
        if (this.#isLayerOpened) {
            this.#hide(true);
            return;
        }

        if (!this.hasResults) {
            return;
        }

        this.#show();
    };

    #onSearchFieldFocusHandler = (e: Event): void => {
        this.#currentQuery = this.#$searchField.value;
        this.#setVisualFocusOnSearchField();
        this.#highlightedOption = null;
        this.#clearOptionsAttribute();
    };

    #onSearchFieldBlurHandler = (e: Event): void => {
        this.#clearVisualFocus();
    };

    #onListBoxOverHandler = (e: PointerEvent): void => {
        this.#listboxHasHover = true;
    };

    #onListBoxOutHandler = (e: PointerEvent): void => {
        this.#listboxHasHover = false;
        this.#requestHide();
    };

    #onOptionClickHandler = (e: PointerEvent, $target: HTMLElement): void => {
        const option = this.#getOptionByElement($target);
        this.#select(option);
        this.#hide(true);
    };

    #onOptionOverHandler = (e: PointerEvent): void => {
        this.#listboxHasHover = true;
        this.#show();
    };

    #onOptionOutHandler = (e: PointerEvent): void => {
        this.#listboxHasHover = false;
        this.#requestHide();
    };

    #onButtonClickHandler = (e: PointerEvent): void => {
        e.preventDefault();
        this.#$searchField.focus();
        this.#setVisualFocusOnSearchField();

        if (this.#isLayerOpened) {
            this.#hide(true);
            return;
        }

        if (!this.hasResults) {
            return;
        }

        this.#show();
    };

    #select(option: Nullable<OptionType<OptionDataType>>): void {
        if (this.#selectionLocked || !option) {
            return;
        }

        const newSelectedOption = option ? option : this.#highlightedOption;

        if (!newSelectedOption) {
            return;
        }

        this.#selectedOption?.$option.setAttribute(
            ARIA_SELECTED_ATTRIBUTE,
            "false",
        );

        newSelectedOption.$option.setAttribute(ARIA_SELECTED_ATTRIBUTE, "true");

        this.#selectedOption = newSelectedOption;

        this.#updateSearchFieldValue(newSelectedOption);

        this.#hide();

        this.#dispatchSelectEvents({
            ...newSelectedOption,
            autocomplete: this,
            query: this.#currentQuery,
            results: this.#options.map((result) => result.option),
        });
    }

    #dispatchSelectEvents(
        eventParam: SelectedOptionParam<OptionDataType>,
    ): void {
        this.#configuration.onSelect?.({ ...eventParam });
        fire(this, {
            eventsName: AutocompleteEventsName.onSelect,
            detail: { ...eventParam },
        });

        this.#configuration.adapter.onSelect?.({ ...eventParam });
        fire(this.#configuration.adapter, {
            eventsName: AutocompleteEventsName.onSelect,
            detail: { ...eventParam },
        });
    }

    #updateSearchFieldValue(
        option?: Nullable<OptionType<OptionDataType>>,
    ): void {
        if (!this.#adapter.updateSearchFieldValue) {
            return;
        }
        if (!option) {
            this.#$searchField.value = this.#adapter.updateSearchFieldValue();
            return;
        }

        this.#$searchField.value = this.#adapter.updateSearchFieldValue({
            ...option,
            autocomplete: this,
            query: this.#currentQuery,
            results: this.#options.map((result) => result.option),
        });
    }

    #setVisualFocusOnSearchField(): void {
        this.#comboboxHasVisualFocus = true;
        this.#listboxHasVisualFocus = false;
        this.#$searchField.setAttribute(FOCUSED_ATTRIBUTE, "");
        this.#$list.removeAttribute(FOCUSED_ATTRIBUTE);
        this.#clearActiveDescendant();
    }

    #setVisualFocusOnListBox(): void {
        this.#comboboxHasVisualFocus = false;
        this.#listboxHasVisualFocus = true;
        this.#$searchField.removeAttribute(FOCUSED_ATTRIBUTE);
        this.#$list.setAttribute(FOCUSED_ATTRIBUTE, "");
        this.#setActiveDescendant(this.#highlightedOption);
    }

    #clearVisualFocus(): void {
        this.#comboboxHasVisualFocus = false;
        this.#listboxHasVisualFocus = false;
        this.#$searchField.removeAttribute(FOCUSED_ATTRIBUTE);
        this.#$list.removeAttribute(FOCUSED_ATTRIBUTE);
        this.#highlightedOption = null;
        this.#clearActiveDescendant();
    }

    #setActiveDescendant = (
        option: Nullable<OptionType<OptionDataType>>,
    ): void => {
        if (!option) {
            return;
        }
        this.#$searchField.setAttribute(
            "aria-activedescendant",
            option.$option.id,
        );
    };

    #clearActiveDescendant = (): void => {
        this.#$searchField.removeAttribute("aria-activedescendant");
    };

    #highlightPreviousOption(): void {
        this.#highlightOption(this.#getPreviousHighlightedOption());
    }

    #highlightNextOption(): void {
        this.#highlightOption(this.#getNextHighlightedOption());
    }

    #highlightFirstOption(): void {
        this.#highlightOption(this.#getFirstOption());
    }

    #highlightLastOption(): void {
        this.#highlightOption(this.#getLastOption());
    }

    #highlightOption(option: OptionType<OptionDataType>): void {
        if (!option) {
            return;
        }
        this.#highlightedOption?.$option.setAttribute("aria-selected", "false");
        this.#highlightedOption = option;
        option.$option.setAttribute("aria-selected", "true");
        this.#setActiveDescendant(option);

        const listOuterHeight = outerHeight(this.#$list);
        const optionPos = position(option.$option);
        const optionHeight = outerHeight(option.$option);
        const top = this.#$list.scrollTop;

        if (optionPos.top + optionHeight > listOuterHeight + top) {
            this.#$list.scrollTop =
                optionPos.top - listOuterHeight + optionHeight;
        } else if (top > 0 && optionPos.top < top) {
            this.#$list.scrollTop = optionPos.top;
        }
    }

    #getNextHighlightedOption(): OptionType<OptionDataType> {
        const nextHoveredItemIndex = (this.#highlightedOption?.index ?? -1) + 1;
        return this.#options[
            nextHoveredItemIndex < this.#options.length
                ? nextHoveredItemIndex
                : 0
        ];
    }

    #getPreviousHighlightedOption = (): OptionType<OptionDataType> => {
        const previousHoveredItemIndex =
            (this.#highlightedOption?.index ?? -1) - 1;
        return this.#options[
            previousHoveredItemIndex >= 0
                ? previousHoveredItemIndex
                : this.#options.length - 1
        ];
    };

    #getFirstOption(): OptionType<OptionDataType> {
        return this.#options[0];
    }

    #getLastOption(): OptionType<OptionDataType> {
        return this.#options[this.#options.length - 1];
    }

    #getOptionByElement(
        $item: HTMLElement,
    ): OptionType<OptionDataType> | undefined {
        return this.#options.find((result) => result.$option === $item);
    }

    async #sourceCall(query: string): Promise<void> {
        this.#currentQuery = query;
        this.#selectedOption = null;

        try {
            const results = await this.#adapter.source({
                autocomplete: this,
                query,
                $searchField: this.#$searchField,
            });
            this.#parseResults(results);
        } catch (e: any) {
            this.#createErrorDisplay(e.message);
        }
    }

    #parseResults(results: OptionDataType[]): void {
        if (!results.length) {
            this.#createEmptyResultDisplay();
            return;
        }
        this.#createResults(results);
    }

    #createResults(results: OptionDataType[]): void {
        this.resetResults();
        const optionPrefixId = uid++;

        this.#options = results.map((option, index) => {
            const $option = this.#adapter.optionRender({
                autocomplete: this,
                query: this.#currentQuery,
                option,
                index,
            });

            $option.setAttribute(ARIA_SELECTED_ATTRIBUTE, "false");
            $option.setAttribute(ITEM_ATTRIBUTE, String(index));
            $option.id = `autocomp-item-${optionPrefixId}-${index}`;

            this.#$list.appendChild($option);

            return {
                index,
                $option,
                option,
            };
        });

        this.#show();
    }

    #createEmptyResultDisplay(): void {
        this.resetResults();
        this.#$list.appendChild(
            this.#adapter.noResultRender({
                query: this.#currentQuery,
                autocomplete: this,
            }),
        );
        this.#show();
    }

    #createErrorDisplay(errorMessage: string): void {
        this.resetResults();
        const $error = this.#adapter.errorRender({
            autocomplete: this,
            errorMessage,
            query: this.#currentQuery,
        });
        $error.setAttribute("role", "alert");
        if (!$error.id) {
            $error.id = `autocomp-error-${uid++}`;
        }
        this.#$list.appendChild($error);

        this.#$searchField.setAttribute("aria-describedby", $error.id);

        this.#show();
    }

    #clearOptionsAttribute(): void {
        this.#options.forEach((result) =>
            result.$option.removeAttribute(ARIA_SELECTED_ATTRIBUTE),
        );
    }

    #isPrintableCharacter(str) {
        return str.length === 1 && str.match(/\S| /);
    }

    #show(): void {
        clearTimeout(this.#hideTimeoutId);

        if (this.#isLayerOpened) {
            return;
        }
        this.#isLayerOpened = true;

        this.#$searchField.setAttribute("aria-expanded", "true");
        this.#$button?.setAttribute("aria-expanded", "true");

        const wrapperStyle = this.#$layer.style;

        if (this.#configuration.showLayerClass) {
            this.#$layer.classList.add(this.#configuration.showLayerClass);
        } else {
            wrapperStyle.display = "block";
        }

        if (!this.#configuration.cssPositionning) {
            const parentFieldOffset = offset(this.#$searchField.parentElement!);
            const wrapperHeight = height(this.#$layer);
            const { height: fieldHeight, width: fieldWidth } = outerSize(
                this.#$searchField,
            );

            const topVal =
                this.#configuration.layerPosition === "top"
                    ? parentFieldOffset.top - wrapperHeight + 1
                    : parentFieldOffset.top + fieldHeight + 1;

            wrapperStyle.top = `${topVal}px`;
            wrapperStyle.left = `${parentFieldOffset.left}px`;
            wrapperStyle.width = `${fieldWidth}px`;
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

        this.#dispatchOpenLayerEvents();
    }

    #dispatchOpenLayerEvents(): void {
        this.#configuration.onOpenLayer?.(this);
        fire(this, {
            eventsName: AutocompleteEventsName.onOpenLayer,
            detail: this,
        });

        this.#configuration.adapter.onOpenLayer?.(this);
        fire(this.#configuration.adapter, {
            eventsName: AutocompleteEventsName.onOpenLayer,
            detail: this,
        });
    }

    hideLayer(): void {
        this.#hide(true);
    }

    #hide(force: boolean = false): void {
        clearTimeout(this.#hideTimeoutId);

        if (
            !this.#isLayerOpened ||
            (!force &&
                (this.#comboboxHasVisualFocus ||
                    this.#listboxHasVisualFocus ||
                    this.#listboxHasHover))
        ) {
            return;
        }

        this.#isLayerOpened = false;

        off(document.body, {
            eventsName: "click",
            callback: this.#clickOutsideHandler,
        });

        this.#$searchField.setAttribute("aria-expanded", "false");
        this.#clearActiveDescendant();
        this.#$button?.setAttribute("aria-expanded", "false");

        if (this.#configuration.showLayerClass) {
            this.#$layer.classList.remove(this.#configuration.showLayerClass);
        } else {
            this.#$layer.style.display = "none";
        }

        this.#$layer.inert = true;
        this.#selectionLocked = true;
        this.#highlightedOption = null;
        this.#clearOptionsAttribute();

        this.#dispatchCloseLayerEvents();
    }

    #dispatchCloseLayerEvents(): void {
        this.#configuration.onCloseLayer?.(this);
        fire(this, {
            eventsName: AutocompleteEventsName.onCloseLayer,
            detail: this,
        });

        this.#configuration.adapter.onCloseLayer?.(this);
        fire(this.#configuration.adapter, {
            eventsName: AutocompleteEventsName.onCloseLayer,
            detail: this,
        });
    }

    #clickOutsideHandler = (e: Event): void => {
        const $target = e.target as HTMLElement;

        if (
            !this.#$searchField.contains($target) &&
            !this.#$layer.contains($target) &&
            !this.#$button?.contains($target)
        ) {
            this.#requestHide();
        }
    };

    #requestHide(force: boolean = false): void {
        this.#hideTimeoutId = setTimeout(() => {
            this.#hide(force);
        }, this.#configuration.hideLayerDelay!);
    }

    reset(): this {
        this.resetField();
        this.resetResults();

        return this;
    }

    resetResults(): this {
        this.#options.length = 0;
        this.#selectedOption = null;
        this.#highlightedOption = null;
        this.#$list.replaceChildren();
        this.#$searchField.removeAttribute("aria-describedby");
        this.#$searchField.removeAttribute("aria-activedescendant");

        return this;
    }

    resetField(): this {
        this.#currentQuery = "";
        this.#$searchField.value = "";

        return this;
    }

    dispose(): void {
        this.reset();
        this.#disposeSearchFieldEvents();
        this.#disposeListboxEvents();
        this.#disposeButtonEvents();

        off(document.body, {
            eventsName: "click",
            callback: this.#clickOutsideHandler,
        });

        this.#$searchField.removeAttribute("autocomplete");
        this.#$searchField.removeAttribute("aria-autocomplete");
        this.#$searchField.removeAttribute("aria-expanded");
        this.#$searchField.removeAttribute("role");

        this.#configuration.adapter.dispose?.(this);
    }

    #disposeSearchFieldEvents(): void {
        off(this.#$searchField, {
            eventsName: "keydown",
            callback: this.#onSearchFieldKeydownHandler,
        });

        off(this.#$searchField, {
            eventsName: "keyup",
            callback: this.#onSearchFieldKeyupHandler,
        });

        off(this.#$searchField, {
            eventsName: "click",
            callback: this.#onSearchFieldClickHandler,
        });

        off(this.#$searchField, {
            eventsName: "focus",
            callback: this.#onSearchFieldFocusHandler,
        });

        off(this.#$searchField, {
            eventsName: "blur",
            callback: this.#onSearchFieldBlurHandler,
        });
    }

    #disposeListboxEvents(): void {
        off(this.#$list, {
            eventsName: "pointerover",
            callback: this.#onListBoxOverHandler,
        });

        off(this.#$list, {
            eventsName: "pointerout",
            callback: this.#onListBoxOutHandler,
        });

        off(this.#$list, {
            eventsName: "click",
            callback: this.#onOptionClickHandler,
        });

        off(this.#$list, {
            eventsName: "pointerover",
            callback: this.#onOptionOverHandler,
        });

        off(this.#$list, {
            eventsName: "pointerout",
            callback: this.#onOptionOutHandler,
        });
    }

    #disposeButtonEvents(): void {
        if (!this.#$button) {
            return;
        }

        off(this.#$button, {
            eventsName: "click",
            callback: this.#onButtonClickHandler,
        });
    }
}
