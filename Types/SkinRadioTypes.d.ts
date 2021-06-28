type SkinRadioOptionsType = {
    /** @default <span class="rb-skin"></span> */
    wrap?:          string;
    /** @default invalid */
    invalidClass?:  string;
    /** @default disabled */
    disabledClass?: string;
    /** @default checked */
    checkedClass?:  string;
}

type SkinRadioAllOptionsType = SkinRadioOptionsType & {
    selector?: string;
}

type CustomRadioButtonType = HTMLInputElement & {
    __skinAPI?:  SkinRadioButton;
    __$rdGroup?: NodeList;
}

type CustomRadioButtonParentType = HTMLElement & {
    __skinAPI?:  SkinRadioButton;
    __$rdGroup?: NodeList;
}
