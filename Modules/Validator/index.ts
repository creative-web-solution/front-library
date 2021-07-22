import { extend }                   from '../../Helpers/Extend';
import validatorFunctionsController from './Internal/ValidatorFunctionsController';
import Input                        from './Internal/Input';


export const addValidator = validatorFunctionsController.addValidator;


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
 */
export default class Validator {
    #options:            ValidatorOptionsType & { hasLiveValidation: boolean };
    #inputsList:         Input[];
    #radioDuplicateHash: { [ key: string ]: boolean };
    #state:              string;
    #$form:              HTMLElement;
    #validationPromise!: Promise<ValidatorValidationReturnType> | null;


    #STATE_IDLE       = 'idle';
    #STATE_VALIDATING = 'validating';


    constructor( $form: HTMLElement, userOptions: ValidatorOptionsType = {} ) {
        this.#$form   = $form;
        this.#options = extend( defaultOptions, userOptions );
        this.#options.hasLiveValidation = !!this.#options.liveValidation?.onValidate || !!this.#options.liveValidation?.onInvalidate;
        this.#inputsList         = [];
        this.#radioDuplicateHash = {};

        this.#state              = this.#STATE_IDLE;

        $form.setAttribute( 'novalidate', 'novalidate' );

        this.refresh();
    }

    /*
     * Filter radio button to validate only one button
     */
    private filterRadioButton( $input: HTMLInputElement ): boolean {
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
    private cleanup() {
        this.#inputsList.forEach( input => input.destroy() );
        this.#inputsList.length = 0;
        this.#radioDuplicateHash = {};
    }


    /*
     * Create and add one input to the list
     */
    private addInput( $input: Element ) {
        // Check if this input type
        if ( !$input.matches( this.#options.filter! ) && this.filterRadioButton( $input as HTMLInputElement ) ) {
            this.#inputsList.push( new Input( $input, this.#options ) );
        }
    }


    /*
     * Empty and clean the input list and recreate it
     */
    private refresh() {
        this.cleanup();

        const $fieldToAdd = this.#$form.querySelectorAll( this.#options.fields! );

        $fieldToAdd.forEach( this.addInput.bind( this ) );
    }


    /*
     * Validate all fields and return a promise
     */
    private _validate(): Promise<void[]> {
        let inputsValid: Promise<void>[] = [];

        this.#inputsList.forEach( input => {
            inputsValid.push( input.isValid() );
        } );

        return Promise.all( inputsValid );
    }


    private filterInputError( input: Input ): boolean {
        return input.hasError;
    }


    /*
     * Call validation and call callback if needed
     */
    private process(): Promise<ValidatorValidationReturnType> {
        if ( this.#validationPromise ) {
            return this.#validationPromise;
        }
        this.#validationPromise = new Promise<ValidatorValidationReturnType>( ( resolve, reject ) => {
            this.#state = this.#STATE_VALIDATING;

            const retObject: ValidatorValidationReturnType = {
                "inputs": this.#inputsList,
                "errors": [],
                "$form":  this.#$form
            };

            this._validate()
                .then( () => {
                    this.#validationPromise = null;
                    this.#state             = this.#STATE_IDLE;

                    const errors = this.#inputsList.filter( this.filterInputError );


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
    validate(): Promise<ValidatorValidationReturnType> {
        if ( this.#state !== this.#STATE_IDLE ) {
            return this.#validationPromise as Promise<ValidatorValidationReturnType>;
        }

        return this.process();
    }


    /**
     * Bind or rebind all inputs
     */
    update() {
        this.refresh();
    }


    /**
     * Return the validator object of an input
     *
     * @param $field
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
     *
     * @param $field
     */
    validateField( $field: HTMLElement ): Promise<ValidatorFieldValidationReturnType | void> {
        return new Promise<ValidatorFieldValidationReturnType | void>( ( resolve, reject ) => {
            const input = this.getFieldValidator( $field );

            if ( !input ) {
                return resolve();
            }

            this.#state = this.#STATE_VALIDATING;

            const retObject: ValidatorFieldValidationReturnType = {
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
        let $fields: HTMLElement[] = [];

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
        let inputs: Input[] = [];

        this.#inputsList.forEach( input => {
            if ( input.hasValidator ) {
                inputs.push( input );
            }
        } )

        return inputs;
    }
}
