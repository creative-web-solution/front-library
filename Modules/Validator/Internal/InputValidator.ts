import { getValue } from '../../../Helpers/GetValue';


/*
 * Used to make one validation on one input
 * Store the state (valid or not) between validations
 */
export default class InputValidator implements FLib.Validator.InputValidator {
    #$input:                HTMLElement;
    #name:                  string;
    #isAsynch:              boolean;
    #extraMessages;
    #extraErrorMessages;
    #data;
    #validateFunc:          FLib.Validator.ValidateFunction;
    #state:                 FLib.Validator.ValidationState | undefined;
    #validatorOptions;


    get $input(): HTMLElement {
        return this.#$input;
    }

    get name(): string {
        return this.#name;
    }

    get isAsynch(): boolean {
        return this.#isAsynch;
    }

    get extraMessages(): string[] {
        return this.#extraMessages;
    }

    get extraErrorMessages(): string[] {
        return this.#extraErrorMessages;
    }

    get data(): any {
        return this.#data;
    }


    constructor( $input: HTMLElement, validatorParams: FLib.Validator.Validator, validatorOptions: FLib.Validator.Validator & { hasLiveValidation: boolean; } ) {
        this.#validateFunc       = validatorParams.validate;

        this.#$input             = $input;
        this.#name               = validatorParams.name;
        this.#isAsynch           = validatorParams.isAsynch;
        // Extra message like warning, not error
        this.#extraMessages      = [];
        // Extra error message rise by the validator
        this.#extraErrorMessages = [];
        // Extra data send by the validator
        this.#data               = null;
        this.#validatorOptions   = validatorOptions;
    }


    /*
     * Validate the current input with one validator
     */
    validate( isLiveValidation: boolean ): Promise<void> {
        const value = getValue( this.#$input );

        this.#extraMessages.length      = 0;
        this.#extraErrorMessages.length = 0;
        this.#data                      = null;

        return new Promise<void>( resolve => {
            this.#validateFunc( this.#$input, value, isLiveValidation, this.#validatorOptions ).then( _state => {
                this.#state              = _state;

                this.#extraMessages      = _state.extraMessages || this.#extraMessages;
                this.#extraErrorMessages = _state.extraErrorMessages || this.#extraErrorMessages;
                this.#data               = _state.data;

                resolve();
            } );
        } );
    }


    /**
     * @returns true if the input is valid
     */
    isValid(): boolean {
        return !!this.#state && this.#state.isValid;
    }


    /**
     * Get custom data that can optionnaly be passed to the validator
     */
    getData(): any {
        return this.#data;
    }
}
