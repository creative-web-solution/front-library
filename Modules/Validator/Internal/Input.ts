import { on, off }                  from '../../../Events/EventsManager';
import { unique }                   from '../../../Helpers/Unique';
import validatorFunctionsController from './ValidatorFunctionsController';
import InputValidator               from './InputValidator';
import { getRadioList }             from '../Tools/RadioButton';


/*
 * Handle one input
 */
export default class Input implements FLib.Validator.Input {
    #isRadio:                   boolean;
    #inputType:                 string;
    #inputId:                   string;
    #$input:                    HTMLElement;
    #$group:                    FLib.Validator.CustomValidatorRadioInput[] | undefined;
    #$otherRadioOfGroup;
    #hasValidator:              boolean;
    #validatorsInErrors:        InputValidator[] = [];
    #inlineCustomErrorMessages: Record<string, string>;
    #liveHookFunctionHash;
    #$label:                    HTMLLabelElement | undefined;
    #validators:                InputValidator[];
    #hasError:                  boolean;
    #isLiveValidation           = false;
    #options;

    get $input(): HTMLElement {
        return this.#$input;
    }

    get $label(): HTMLElement | undefined {
        return this.#$label;
    }

    get hasError(): boolean {
        return this.#hasError;
    }

    get isLiveValidation(): boolean {
        return this.#isLiveValidation;
    }

    get $radioGroup(): FLib.Validator.CustomValidatorRadioInput[] | undefined {
        return this.#$group;
    }

    get $otherRadioOfGroup(): FLib.Validator.CustomValidatorRadioInput[] {
        return this.#$otherRadioOfGroup;
    }

    get hasValidator(): boolean {
        return this.#hasValidator;
    }


    constructor( $input: HTMLElement & { type?: string }, options: FLib.Validator.Options & { hasLiveValidation: boolean; } ) {

        this.#options = options;

        if ( $input.type === 'radio' || $input.type === 'checkbox' ) {
            this.#inputType = 'optin';
        }
        else if ( $input.type === 'hidden' ) {
            this.#inputType = 'hidden';
        }
        else if ( $input.nodeName === 'SELECT' ) {
            this.#inputType = 'select';
        }
        else {
            this.#inputType = 'inputText';
        }

        this.#isRadio = $input.type === 'radio';
        this.#inputId = $input.id;

        if ( this.#inputId ) {
            this.#$label = document.querySelector( `label[for="${ this.#inputId }"]` ) as HTMLLabelElement;
        }

        if ( !this.#$label ) {
            this.#$label = $input.closest( 'label' ) as HTMLLabelElement;
        }

        // Get all validators for this input
        this.#validators = validatorFunctionsController.getValidators( $input, options );

        this.#hasValidator              = this.#validators.length > 0;
        this.#inlineCustomErrorMessages = {};

        if ( $input.hasAttribute( options.customErrorLabelPrefix ) ) {
            this.#inlineCustomErrorMessages[ 'default' ] =
                options.errorMessages[ $input.getAttribute( options.customErrorLabelPrefix ) as string ];
        }

        this.#validators.forEach( validator => {
            const attrName = [ options.customErrorLabelPrefix, validator.name ].join( '-' );

            if ( $input.hasAttribute( attrName ) ) {
                this.#inlineCustomErrorMessages[ validator.name ] = $input.getAttribute( attrName ) as string;
            }
        })

        // Cache all radio button with the same name attribute
        if ( this.#isRadio ) {
            this.#$group      = getRadioList( $input ) as FLib.Validator.CustomValidatorRadioInput[];
            this.#$otherRadioOfGroup = Array.from( this.#$group ).filter( $rd => {
                return $rd !== $input;
            } );

            this.#$group.forEach( $rd => {
                $rd.__$radioMaster = $input as FLib.Validator.CustomValidatorRadioInput;
                $rd.__$radioGroup  = this.#$group as FLib.Validator.CustomValidatorRadioInput[];
                $rd.__$otherRadioOfGroup = ( Array.from( this.#$group as FLib.Validator.CustomValidatorRadioInput[] ) as FLib.Validator.CustomValidatorRadioInput[] ).filter( $rd2 => {
                    return $rd2 !== $rd;
                } );
            } );
        }

        this.#$input      = $input;
        this.#hasError    = false;


        if ( this.#hasValidator && options.hasLiveValidation && this.#inputType !== 'hidden' ) {
            on( this.#isRadio ? this.#$group : $input, {
                "eventsName":   options.liveValidation?.eventsName[ this.#inputType ],
                "callback":     this.#onLiveValidation
            } );
        }

        // Add extra listener (focus, blur, ...) on the input
        if ( options.liveValidation?.eventsHook ) {
            this.#liveHookFunctionHash = {};

            Object
                .keys( options.liveValidation.eventsHook )
                .forEach( key => {
                    this.#liveHookFunctionHash[ key ] = () => {
                        options.liveValidation?.eventsHook[ key ]( this, event );
                    }

                    on( this.#isRadio ? this.#$group : $input, {
                        "eventsName":   key,
                        "callback":     this.#liveHookFunctionHash[ key ]
                    } );
                } );
        }
    }


    /*
     * Validate this input
    */
    #validate = ( isLiveValidation: boolean ): Promise<void> => {
        this.#validatorsInErrors.length = 0;
        this.#hasError                  = false;
        this.#isLiveValidation          = isLiveValidation;

        // This input has no (known) validation
        if ( !this.#hasValidator ) {
            return Promise.resolve();
        }

        const promArray: Promise<void>[] = [];

        // Call all validators
        this.#validators.forEach( validator => {
            promArray.push( validator.validate( isLiveValidation ) )
        } );

        return Promise.all( promArray ).then(() => {
            this.#validators.forEach( validator => {
                if ( !validator.isValid() ) {
                    this.#hasError = true
                }
            } );
        } );
    }


    /*
     * Return an array of validator in error
     */
    getErrors(): InputValidator[] {
        this.#validatorsInErrors.length = 0;

        // No validator => Field is valid
        if ( !this.#hasValidator ) {
            return this.#validatorsInErrors;
        }

        // Return only validator in invalid state
        this.#validators.forEach( validator => {
            if ( !validator.isValid() ) {
                this.#validatorsInErrors.push( validator );
            }
        });

        return this.#validatorsInErrors;
    }


    #labelToMessage = ( validatorName: string, _locale?: { [ key: string ]: string }, avoidDefaultMessage?: boolean ): string => {
        let customInlineDefaultMessage,
            customErrorDefaultMessage,
            customInlineMessage;

        if ( !avoidDefaultMessage ) {
            // In attribute data-error-label
            customInlineDefaultMessage = this.#inlineCustomErrorMessages[ 'default' ];
            // In global options configuration
            customErrorDefaultMessage = this.#options.errorMessages[ 'default' ];
        }

        // Forced in parameters of this function
        const forcedJSMessage = _locale ? _locale[ validatorName ] : null;

        if ( forcedJSMessage ) {
            return forcedJSMessage;
        }

        // In attribute data-error-label-VALIDATOR_NAME
        customInlineMessage = this.#inlineCustomErrorMessages[ validatorName ];
        if ( customInlineMessage ) {
            customInlineMessage =
                this.#options.errorMessages[ customInlineMessage ] ||
                customInlineMessage;
        }

        if ( customInlineMessage ) {
            return customInlineMessage;
        }

        // In global options configuration
        const customErrorMessage = this.#options.errorMessages[ validatorName ];

        if ( customErrorMessage ) {
            return customErrorMessage;
        }

        return (
            customInlineDefaultMessage ||
            customErrorDefaultMessage ||
            validatorName
        );
    }


    /*
     * Return an array of error messages and labels
     */
    getErrorMessages( _locale?: { [ key: string ]: string } ): { message: string, label: string, type: string }[] {
        this.getErrors();

        if ( !this.#validatorsInErrors.length ) {
            return [];
        }

        const messages: { message: string, label: string, type: string }[] = [];

        this.#validatorsInErrors.forEach( validator => {
            // BASIC MESSAGE (determined from validator name)
            messages.push( {
                "message": this.#labelToMessage( validator.name, _locale ),
                "label":   validator.name,
                "type":    "basic"
            } );

            // EXTRA MESSAGE (from the validator function)

            validator.extraErrorMessages.forEach( extraErrorMessage => {
                messages.push( {
                    "message": this.#labelToMessage( extraErrorMessage, _locale, true ),
                    "label":   validator.name,
                    "type":    "extra"
                } );
            });
        });

        return unique( messages, ( elem, resultArray ) => {
            return !resultArray.find( resultElem => {
                return elem.message === resultElem.message
            } );
        } );
    }


    /*
     * Return a promise that resolve if the validation is successful
     */
    isValid(): Promise<void> {
        return this.#validate( false );
    }


    /**
     * Get custom data of all validators
     */
    getData(): any[] {
        this.getErrors();

        if ( !this.#validatorsInErrors.length ) {
            return [];
        }

        const dataArray: any[] = [];

        this.#validatorsInErrors.forEach( validator => {
            const data = validator.getData();

            if ( !data ) {
                return;
            }

            dataArray.push( data );
        })

        return dataArray;
    }


    /*
     * Remove events binding from the field
     */
    destroy(): this {

        if ( this.#hasValidator && this.#options.hasLiveValidation && this.#inputType !== 'hidden' ) {
            off( this.#isRadio ? this.#$group : this.#$input, {
                "eventsName":   this.#options.liveValidation.eventsName[ this.#inputType ],
                "callback":     this.#onLiveValidation
            } );
        }


        if ( this.#options.liveValidation.eventsHook && this.#liveHookFunctionHash ) {
            Object
                .keys( this.#options.liveValidation.eventsHook )
                .forEach( key => {
                    off( this.#isRadio ? this.#$group : this.#$input, {
                        "eventsName":   key,
                        "callback":     this.#liveHookFunctionHash[ key ]
                    } );
                } );
        }

        return this;
    }


    #onLiveValidation = ( event: Event ): void => {
        this.#validate( true )
            .then( () => {
                if ( this.hasError && this.#options.liveValidation.onInvalidate ) {
                    this.#options.liveValidation.onInvalidate( this, event );
                }
                else if ( !this.hasError && this.#options.liveValidation.onValidate ) {
                    this.#options.liveValidation.onValidate( this, event );
                }
            } )
            .catch( err => {
                if ( window.$$DEBUG$$ ) {
                    console.log( err );
                }
            } );
    }
}
