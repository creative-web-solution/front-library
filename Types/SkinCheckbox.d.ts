declare namespace FLib {
    namespace SkinCheckbox {
        interface SkinCheckbox {
            check():      this;
            uncheck():    this;
            enable():     this;
            disable():    this;
            setInvalid(): this;
            setValid():   this;
        }

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
