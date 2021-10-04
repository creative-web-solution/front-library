namespace FLib {
    namespace SkinRadio {
        type Options = {
            /** @defaultValue <span class="rb-skin"></span> */
            wrap:          string;
            /** @defaultValue invalid */
            invalidClass:  string;
            /** @defaultValue disabled */
            disabledClass: string;
            /** @defaultValue checked */
            checkedClass:  string;
        }

        type AllOptions = Options & {
            selector: string;
        }

        type CustomRadioButton = HTMLInputElement & {
            __skinAPI?:  SkinRadioButton;
            __$radioGroup?: NodeListOf<CustomRadioButton>;
        }

        type CustomRadioButtonParent = HTMLElement & {
            __skinAPI?:  SkinRadioButton;
            __$radioGroup?: NodeListOf<CustomRadioButton>;
        }
    }
}
