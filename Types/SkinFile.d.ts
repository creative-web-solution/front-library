declare namespace FLib {
    namespace SkinFile {
        interface SkinFile {
            enable():     this;
            disable():    this;
            setInvalid(): this;
            setValid():   this;
        }

        type Options = {
            /** @defaultValue .file-skin */
            selector:             string;
            /** @defaultValue <div class="file-skin"></div> */
            wrap:                 string;
            /** @defaultValue .file-info */
            fileInfoSelector:     string;
            /** @defaultValue <div class="file-info"></div> */
            fileInfo:             string;
            /** @defaultValue true */
            autoHideFileInfo:     boolean;
            /** @defaultValue .file-reset */
            resetButtonSelector:  string;
            /** @defaultValue <span class="file-reset">&times;</span> */
            resetButton:          string;
            /** @defaultValue disabled */
            disabledClass:        string;
            /** @defaultValue invalid */
            invalidClass:         string;
            /** @defaultValue selected */
            selectedClass:        string;
        }

        type AllOptions = Options & {
            selector: string;
        }

        type CustomInputFile = HTMLInputElement & {
            __skinAPI?: SkinFile
        }

        type CustomInputFileParent = HTMLElement & {
            __skinAPI?: SkinFile
        }
    }
}
