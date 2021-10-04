namespace FLib {
    namespace SkinSelect {
        type Options = {
            /**
             * If true, skin event the option list
             * @defaultValue false
            */
            full:                boolean;
            /** @defaultValue [] */
            extraClass:          string[];
            /** @defaultValue select-skin */
            className:           string;
            /** @defaultValue select-itm */
            itemClassName:       string;
            /** @defaultValue select */
            selectWrapClassName: string;
            /** @defaultValue select-layer */
            layerClassName:      string;
            /** @defaultValue select-list */
            listClassName:       string;
            /** @defaultValue hover */
            hoverItemClass:      string;
            /** @defaultValue show */
            openedListClass:     string;
            /** @defaultValue on */
            activeOptionClass:   string;
            /** @defaultValue disabled */
            disabledClass:       string;
            /** @defaultValue invalid */
            invalidClass:        string;
            /** @defaultValue loading */
            loadingClass:        string;
            listTpl: {
                /** @defaultValue `<div class="{{ layerClassName }}"><ul class="{{ listClassName }}">{{ items }}</ul></div>` */
                wrapper: string;
                /** @defaultValue `<li class="{{ itemClassName }}{{ onClass }}" data-value="{{ value }}">{{ text }}</li>` */
                item:    string;
            };
        }

        type AllOptions = Options & {
            selector: string;
        }

        type CustomSelect = HTMLSelectElement & {
            __skinAPI?:  SkinSelect;
        }

        type CustomSelectParent = HTMLElement & {
            __skinAPI?:  SkinSelect;
        }

        type OptionArray = {
            text:      string;
            value:     string;
            selected?: boolean;
        }
    }
}
