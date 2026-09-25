import type Autocomplete from "./";
import { type SelectedOptionParam } from "./";

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
    abortSource?(): void;
    dispose?(autocomplete: Autocomplete<OptionDataType>): void;
    abstract errorRender(
        options: ErrorRenderOptionsType<OptionDataType>,
    ): ErrorRenderReturnType;
    abstract noResultRender(
        options: NoResultRenderOptionsType<OptionDataType>,
    ): NoResultRenderReturnType;
    onCloseLayer?(autocomplete: Autocomplete<OptionDataType>): void;
    onOpenLayer?(autocomplete: Autocomplete<OptionDataType>): void;
    onReady?(autocomplete: Autocomplete<OptionDataType>): void;
    onSelect?(option: SelectedOptionParam<OptionDataType>): void;
    abstract optionRender(
        options: OptionRenderOptionsType<OptionDataType>,
    ): OptionRenderReturnType;
    abstract render(
        options: RenderOptionsType<OptionDataType>,
    ): RenderReturnType;
    abstract source(
        options: SourceOptionsType<OptionDataType>,
    ): SourceReturnType<OptionDataType>;
    updateSearchFieldValue?(
        options?: UpdateSearchFieldValueOptionType<OptionDataType>,
    ): UpdateSearchFieldValueReturnType;
}
