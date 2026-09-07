export default abstract class AbstractAutocompleteAdapter<ItemDataType> {
    abstract layerRender(): string;
    abstract listRender(): string;
    abstract itemRender(options: { item: ItemDataType; index: number }): string;
    abstract errorRender(errorMessage: string, query: string): string;
    abstract noResultRender(query: string): string;
    abstract queryParamAdapter(
        query: string,
        $input: HTMLElement,
    ): Record<string, any>;
    markValue?(options: {
        item: ItemDataType;
        index: number;
        query: string;
    }): ItemDataType;
    updateInputValueFromItem?(options: {
        item: ItemDataType;
        index: number;
        query: string;
        results: ItemDataType[];
    }): string;
    abstract source(query: string): Promise<ItemDataType[]>;
    abstract abortSource?(): void;
}
