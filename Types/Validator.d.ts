namespace FLib {
    namespace Validator {
        type ValidationState = {
            $input:              HTMLElement;
            value:               string | string[];
            isValid:             boolean;
            label:               string;
            data?:               any;
            isLiveValidation:    boolean;
            extraErrorMessages?: string[];
            extraMessages?:      string[];
        }

        type Validator = {
            name:     string;
            selector: string;
            isAsynch: boolean;
            validate: ValidateFunction;
        }


        type ValidateFunction = ( $input: HTMLElement, value: string | string[], isLiveValidation: boolean, validatorOptions ) => Promise<ValidationState>


        type ValidationReturnType = {
            "inputs": Input[];
            "errors": Input[];
            "$form":  HTMLElement;
        }

        type FieldValidationReturnType = {
            "input":  Input;
            "error":  Input | null;
            "$form":  HTMLElement;
        }


        type Options = {
            /** @defaultValue input,textarea,select */
            fields:                    string;
            /** @defaultValue input[type="button"], input[type="submit"], input[type="reset"], input */
            filter:                    string;
            /** @defaultValue data-error-label */
            customErrorLabelPrefix:    string;
            /** @defaultValue `{}` */
            errorMessages:             { [ key: string ]: string };
            validatorsOptions?:        { [ key: string ]: any };
            onValidate?:               ( data: ValidationReturnType ) => void;
            onInvalidate?:             ( data: ValidationReturnType ) => void;
            liveValidation?: {
                onValidate?:           ( input: Input, event ) => void;
                onInvalidate?:         ( input: Input, event ) => void;
                eventsName: {
                    /** @defaultValue change */
                    optin:             string;
                    /** @defaultValue change */
                    select:            string;
                    /** @defaultValue input */
                    inputText:         string;
                }
                eventsHook
            }
        }


        type CustomValidatorRadioInput = HTMLInputElement & {
            __$radioMaster:       CustomValidatorRadioInput;
            __$radioGroup:        CustomValidatorRadioInput[];
            __$otherRadioOfGroup: CustomValidatorRadioInput[];
        }
    }
}
