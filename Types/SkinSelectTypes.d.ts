type SkinSelectOptionsType = {
    /**
     * If true, skin event the option list
     * @default false
    */
    full?:                boolean;
    /** @default [] */
    extraClass?:          string[];
    /** @default select-skin */
    className?:           string;
    /** @default select-itm */
    itemClassName?:       string;
    /** @default select */
    selectWrapClassName?: string;
    /** @default select-layer */
    layerClassName?:      string;
    /** @default hover */
    hoverItemClass?:      string;
    /** @default show */
    openedListClass?:     string;
    /** @default on */
    activeOptionClass?:   string;
    /** @default disabled */
    disabledClass?:       string;
    /** @default invalid */
    invalidClass?:        string;
    /** @default loading */
    loadingClass?:        string;
    listTpl?:             string;
}

type SkinSelectAllOptionsType = SkinSelectOptionsType & {
    selector?: string;
}

type CustomSelectType = HTMLSelectElement & {
    __skinAPI?:  SkinSelect;
}

type CustomSelectParentType = HTMLElement & {
    __skinAPI?:  SkinSelect;
}

type SkinSelectOptionArrayType = {
    text:      string;
    value:     string;
    selected?: boolean;
}
