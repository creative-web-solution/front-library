import type Autocomplete from "./";

export type RenderOptionsType<OptionDataType> = {
    $searchField: HTMLElement;
    autocomplete: Autocomplete<OptionDataType>;
};
export type RenderReturnType = {
    $button?: HTMLElement;
    $layer: HTMLElement;
    $list: HTMLElement;
};
export type OptionRenderOptionsType<OptionDataType> = {
    autocomplete: Autocomplete<OptionDataType>;
    index: number;
    option: OptionDataType;
    query: string;
};
export type OptionRenderReturnType = HTMLElement;
export type ErrorRenderOptionsType<OptionDataType> = {
    errorMessage: string;
    query: string;
    autocomplete: Autocomplete<OptionDataType>;
};
export type ErrorRenderReturnType = HTMLElement;
export type NoResultRenderOptionsType<OptionDataType> = {
    query: string;
    autocomplete: Autocomplete<OptionDataType>;
};
export type NoResultRenderReturnType = HTMLElement;
export type UpdateSearchFieldValueOptionType<OptionDataType> = {
    autocomplete: Autocomplete<OptionDataType>;
    option: OptionDataType;
    index: number;
    query: string;
    results: OptionDataType[];
};
export type UpdateSearchFieldValueReturnType = string;

export type SourceOptionsType<OptionDataType> = {
    autocomplete: Autocomplete<OptionDataType>;
    query: string;
    $searchField: HTMLElement;
};

export type SourceReturnType<OptionDataType> = Promise<OptionDataType[]>;

export default abstract class AbstractAutocompleteAdapter<OptionDataType> {
    abstract render(
        options: RenderOptionsType<OptionDataType>,
    ): RenderReturnType;
    abstract optionRender(
        options: OptionRenderOptionsType<OptionDataType>,
    ): OptionRenderReturnType;
    abstract errorRender(
        options: ErrorRenderOptionsType<OptionDataType>,
    ): ErrorRenderReturnType;
    abstract noResultRender(
        options: NoResultRenderOptionsType<OptionDataType>,
    ): NoResultRenderReturnType;
    updateSearchFieldValue?(
        options?: UpdateSearchFieldValueOptionType<OptionDataType>,
    ): UpdateSearchFieldValueReturnType;
    abstract source(
        options: SourceOptionsType<OptionDataType>,
    ): SourceReturnType<OptionDataType>;
    abortSource?(): void;
    onOpenLayer?(autocomplete: Autocomplete<OptionDataType>): void;
    onCloseLayer?(autocomplete: Autocomplete<OptionDataType>): void;
}
