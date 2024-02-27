import { extend }                   from '../../Helpers/Extend';
import validatorFunctionsController from './Internal/ValidatorFunctionsController';
import Input                        from './Internal/Input';


export const addValidator = validatorFunctionsController.addValidator;
export const removeValidator = validatorFunctionsController.removeValidator;


const defaultOptions = {
    "fields":                   "input,textarea,select",
    "filter":                   "input[type=\"button\"],input[type=\"submit\"],input[type=\"reset\"],input[type=\"image\"]",
    "onValidate":               null,
    "onInvalidate":             null,
    "validatorsOptions":        null,
    "customErrorLabelPrefix":   "data-error-label",
    "errorMessages":            {},
    "liveValidation": {
        "onValidate":           null,
        "onInvalidate":         null,
        "eventsName": {
            "optin":            "change",
            "select":           "change",
            "inputText":        "input"
        },
        "eventsHook":           null
    }
};


/**
 * Validate a form, a fieldset or whatever had inputs inside
 *
 * @see extra/modules/validator.md for details
 *
 * @example
 * ```ts
 * let validator = new Validator( $form, options )
 *
 * on( $form, {
 *      "eventsName": "submit",
 *      "callback": e => {
 *         e.preventDefault();
 *         validator
 *                 .validate()
 *                 .then( data => {
 *                         console.log( 'Valid', data );
 *                         $form.submit();
 *                     }
 *                 )
 *                 .catch( data => {
 *                         console.log( 'Invalid', data );
 *                         data.errors.forEach( input => {
 *                                 console.log( input.getErrorMessages() );
 *                             }
 *                         )
 *                     }
 *                 );
 *     }
 * });
 * ```
 */
export default class Validator {
    #options:            FLib.Validator.Options & { hasLiveValidation: boolean };
    #inputsList:         Input[];
    #radioDuplicateHash: Record<string, boolean>;
    #state:              string;
    #$form:              HTMLElement;
    #validationPromise:  Promise<FLib.Validator.ValidationReturnType> | undefined | null;


    #STATE_IDLE       = 'idle';
    #STATE_VALIDATING = 'validating';


    constructor( $form: HTMLElement, userOptions: Partial<FLib.Validator.Options> = {} ) {
        this.#$form   = $form;
        this.#options = extend( defaultOptions, userOptions );
        this.#options.hasLiveValidation = !!this.#options.liveValidation?.onValidate || !!this.#options.liveValidation?.onInvalidate;
        this.#inputsList         = [];
        this.#radioDuplicateHash = {};

        this.#state              = this.#STATE_IDLE;

        $form.setAttribute( 'novalidate', 'novalidate' );

        this.#refresh();
    }


    /*
     * Filter radio button to validate only one button
     */
    #filterRadioButton = ( $input: HTMLInputElement ): boolean => {
        if ( $input.type !== 'radio' ) {
            return true;
        }

        if ( this.#radioDuplicateHash[ $input.name ] ) {
            return false;
        }

        this.#radioDuplicateHash[ $input.name ] = true;

        return true;
    }


    /*
     * Call the function cleanup of all inputs and empty the list
     */
    #cleanup = (): void => {
        this.#inputsList.forEach( input => input.destroy() );
        this.#inputsList.length = 0;
        this.#radioDuplicateHash = {};
    }


    /*
     * Create and add one input to the list
     */
    #addInput = ( $input: HTMLElement ): void => {
        // Check if this input type
        if ( !$input.matches( this.#options.filter ) && this.#filterRadioButton( $input as HTMLInputElement ) ) {
            this.#inputsList.push( new Input( $input, this.#options ) );
        }
    }


    /*
     * Empty and clean the input list and recreate it
     */
    #refresh = (): void => {
        this.#cleanup();

        const $fieldToAdd = this.#$form.querySelectorAll( this.#options.fields ) as NodeListOf<HTMLElement>;

        $fieldToAdd.forEach( this.#addInput.bind( this ) );
    }


    /*
     * Validate all fields and return a promise
     */
    #_validate = (): Promise<void[]> => {
        const inputsValid: Promise<void>[] = [];

        this.#inputsList.forEach( input => {
            inputsValid.push( input.isValid() );
        } );

        return Promise.all( inputsValid );
    }


    #filterInputError = ( input: Input ): boolean => {
        return input.hasError;
    }


    /*
     * Call validation and call callback if needed
     */
    #process = (): Promise<FLib.Validator.ValidationReturnType> => {
        if ( this.#validationPromise ) {
            return this.#validationPromise;
        }
        this.#validationPromise = new Promise<FLib.Validator.ValidationReturnType>( ( resolve, reject ) => {
            this.#state = this.#STATE_VALIDATING;

            const retObject: FLib.Validator.ValidationReturnType = {
                "inputs": this.#inputsList,
                "errors": [],
                "$form":  this.#$form
            };

            this.#_validate()
                .then( () => {
                    this.#validationPromise = null;
                    this.#state             = this.#STATE_IDLE;

                    const errors = this.#inputsList.filter( this.#filterInputError );


                    if ( errors && errors.length ) {
                        retObject.errors = errors;

                        if ( this.#options.onInvalidate ) {
                            this.#options.onInvalidate( retObject );
                        }

                        reject( retObject );

                        return;
                    }

                    if ( this.#options.onValidate ) {
                        this.#options.onValidate( retObject );
                    }

                    resolve( retObject );
                } )
                .catch( err => {
                    this.#validationPromise = null;
                    this.#state             = this.#STATE_IDLE;
                    if ( window.$$DEBUG$$ ) {
                        console.log( err );
                    }
                } );
        } );

        return this.#validationPromise;
    }


    /**
     * Start the validation of all the form
     */
    validate(): Promise<FLib.Validator.ValidationReturnType> {
        if ( this.#state !== this.#STATE_IDLE ) {
            return this.#validationPromise as Promise<FLib.Validator.ValidationReturnType>;
        }

        return this.#process();
    }


    /**
     * Bind or rebind all inputs
     */
    update(): this {
        this.#refresh();

        return this
    }


    /**
     * Return the validator object of an input
     */
    getFieldValidator( $field: HTMLElement ): Input | void {

        for ( const input of this.#inputsList ) {
            if ( input.$input === $field ) {
                return input;
            }
        }
    }


    /**
     * Validate one field
     */
    validateField( $field: HTMLElement ): Promise<FLib.Validator.FieldValidationReturnType | void> {
        return new Promise<FLib.Validator.FieldValidationReturnType | void>( ( resolve, reject ) => {
            const input = this.getFieldValidator( $field );

            if ( !input ) {
                return resolve();
            }

            this.#state = this.#STATE_VALIDATING;

            const retObject: FLib.Validator.FieldValidationReturnType = {
                "input": input,
                "error": null,
                "$form": this.#$form
            };

            input.isValid()
                    .then( () => {
                        this.#state = this.#STATE_IDLE;
                        if ( input.hasError ) {
                            retObject.error = input;
                            reject( retObject );
                            return;
                        }

                        resolve( retObject );
                    } )
                    .catch( err => {
                        this.#state = this.#STATE_IDLE;
                        if ( window.$$DEBUG$$ ) {
                            console.log( err );
                        }
                    } )
        } );
    }


    /**
     * Get all handled fields (DOM elements)
     *
     * @param onlyValidated - If true, remove all fields without validator
     */
    getAllFields( onlyValidated: boolean ): HTMLElement[] {
        const $fields: HTMLElement[] = [];

        this.#inputsList.forEach( input => {
            if ( !onlyValidated || input.hasValidator ) {
                $fields.push( input.$input );
            }
        } )

        return $fields;
    }


    /**
     * Get only the fields (DOM elements) with at least one validator
     */
    getCheckedFields(): HTMLElement[] {
        return this.getAllFields( true );
    }


    /**
     * Get all inputs (input objects, not DOM elements)
     */
    getAllInputs(): Input[] {
        return this.#inputsList;
    }


    /**
     * Get all inputs (input objects, not DOM elements) with at least one validator
     */
    getCheckedInputs(): Input[] {
        const inputs: Input[] = [];

        this.#inputsList.forEach( input => {
            if ( input.hasValidator ) {
                inputs.push( input );
            }
        } )

        return inputs;
    }
}
