declare namespace FLib {
    namespace SkinRadio {
        interface SkinRadio {
            check():      this;
            uncheck():    this;
            enable():     this;
            disable():    this;
            setInvalid(): this;
            setValid():   this;
        }

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
