type SkinFileOptionsType = {
    /** @default .file-skin */
    selector?:            string;
    /** @default <div class="file-skin"></div> */
    wrap?:                string;
    /** @default .file-info */
    fileInfoSelector?:    string;
    /** @default <div class="file-info"></div> */
    fileInfo?:            string;
    /** @default true */
    autoHideFileInfo?:    boolean;
    /** @default .file-reset */
    resetButtonSelector?: string;
    /** @default <span class="file-reset">&times;</span> */
    resetButton?:         string;
    /** @default disabled */
    disabledClass?:       string;
    /** @default invalid */
    invalidClass?:        string;
    /** @default selected */
    selectedClass?:       string;
}

type SkinFileAllOptionsType = SkinFileOptionsType & {
    selector?: string;
}

type CustomInputFileType = HTMLInputElement & {
    __skinAPI?: SkinFile
}

type CustomInputFileParentType = HTMLElement & {
    __skinAPI?: SkinFile
}
