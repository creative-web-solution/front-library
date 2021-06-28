
type SkinCheckboxOptionsType = {
    /** @default <span class="cb-skin"></span> */
    wrap?:          string;
    /** @default invalid */
    invalidClass?:  string;
    /** @default disabled */
    disabledClass?: string;
    /** @default checked */
    checkedClass?:  string;
}

type SkinCheckboxAllOptionsType = SkinCheckboxOptionsType & {
    selector?: string;
}

type CustomCheckboxType = HTMLInputElement & {
    __skinAPI?: SkinCheckbox
}

type CustomCheckboxParentType = HTMLElement & {
    __skinAPI?: SkinCheckbox
}
