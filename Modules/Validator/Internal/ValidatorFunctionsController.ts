import InputValidator from './InputValidator';


/*
 * Object managing all validation functions
 */
class ValidatorFunctions {
    #validators: Map<string, FLib.Validator.Validator> = new Map();

    addValidator = ( name: string, selector: string, isAsynch: boolean | FLib.Validator.ValidateFunction, func?: FLib.Validator.ValidateFunction ) => {
        if ( typeof func === 'undefined' ) {
            func    = (isAsynch as unknown) as FLib.Validator.ValidateFunction;
            isAsynch = false;
        }

        this.#validators.set(name, {
            name,
            selector,
            "validate": func,
            "isAsynch": isAsynch as boolean
        } );
    }


    removeValidator = ( name: string ) => {
        this.#validators.delete(name);
    }


    /*
     * Create and return all validators that apply to an inputs
     */
    getValidators( $input: HTMLElement, options: FLib.Validator.Options & { hasLiveValidation: boolean; } ) {
        let validatorOptions;

        const inputsValidators: InputValidator[] = [];

        this.#validators.forEach( validatorParams => {
            if ( $input.matches( validatorParams.selector ) ) {
                validatorOptions =
                    options.validatorsOptions &&
                    options.validatorsOptions[ validatorParams.name ]
                        ? options.validatorsOptions[ validatorParams.name ]
                        : null;
                inputsValidators.push(
                    new InputValidator(
                        $input,
                        validatorParams,
                        validatorOptions
                    )
                );
            }
        })

        return inputsValidators;
    }
}


export default new ValidatorFunctions();
