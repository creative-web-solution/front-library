type ValidatorValidationState = {
    $input:              HTMLElement;
    value:               string | string[];
    isValid:             boolean;
    label:               string;
    data?:               any;
    isLiveValidation:    boolean;
    extraErrorMessages?: string[];
    extraMessages?:      string[];
}

type ValidatorValidatorType = {
    name:     string;
    selector: string;
    isAsynch: boolean;
    validate: ValidatorValidateFunctionType;
}


type ValidatorValidateFunctionType = ( $input: HTMLElement, value: string | string[], isLiveValidation: boolean, validatorOptions ) => Promise<ValidatorValidationState>


type ValidatorValidationReturnType = {
    "inputs": Input[];
    "errors": Input[];
    "$form":  HTMLElement;
}

type ValidatorFieldValidationReturnType = {
    "input":  Input;
    "error":  Input | null;
    "$form":  HTMLElement;
}


type ValidatorOptionsType = {
    /** @default input,textarea,select */
    fields?:                    string;
    /** @default input[type="button"], input[type="submit"], input[type="reset"], input */
    filter?:                    string;
    /** @default data-error-label */
    customErrorLabelPrefix?:    string;
    /** @default {} */
    errorMessages?:             { [ key: string ]: string };
    validatorsOptions?:         { [ key: string ]: any };
    onValidate?:                ( data: ValidatorValidationReturnType ) => void;
    onInvalidate?:              ( data: ValidatorValidationReturnType ) => void;
    liveValidation?: {
        onValidate?:            ( input: Input, event ) => void;
        onInvalidate?:          ( input: Input, event ) => void;
        eventsName?: {
            /** @default change */
            optin?:             string;
            /** @default change */
            select?:            string;
            /** @default input */
            inputText?:         string;
        }
        eventsHook
    }
}
