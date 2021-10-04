namespace FLib {
    namespace SkinCheckbox {
        type Options = {
            /** @defaultValue <span class="cb-skin"></span> */
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

        type CustomCheckbox = HTMLInputElement & {
            __skinAPI?: SkinCheckbox
        }

        type CustomCheckboxParent = HTMLElement & {
            __skinAPI?: SkinCheckbox
        }
    }
}
