declare namespace FLib {
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

        interface InputValidator {
            $input:             HTMLElement;
            name:               string;
            isAsynch:           boolean;
            extraMessages:      string[];
            extraErrorMessages: string[];
            data:               any;
            validate( isLiveValidation: boolean ): Promise<void>;
            isValid():          boolean;
            getData():          any;
        }

        interface Input {
            $input:             HTMLElement;
            $label:             HTMLElement | undefined;
            hasError:           boolean;
            isLiveValidation:   boolean;
            $radioGroup:        CustomValidatorRadioInput[] | undefined;
            $otherRadioOfGroup: CustomValidatorRadioInput[];
            hasValidator:       boolean;
            getErrors(): InputValidator[];
            getErrorMessages( _locale?: { [ key: string ]: string } ): { message: string, label: string, type: string }[];
            isValid(): Promise<void>;
            getData(): any[];
            destroy(): this
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
                eventsName?: {
                    /** @defaultValue change */
                    optin?:            string;
                    /** @defaultValue change */
                    select?:           string;
                    /** @defaultValue input */
                    inputText?:        string;
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
