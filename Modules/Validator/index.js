import { getValue } from '@creative-web-solution/front-library/Helpers/getValue';
import { extend } from '@creative-web-solution/front-library/Helpers/extend';
import { defer } from '@creative-web-solution/front-library/Helpers/defer';
import { unique } from '@creative-web-solution/front-library/Helpers/unique';
import { on, off } from '@creative-web-solution/front-library/Events/EventsManager';
import { getRadioList } from '@creative-web-solution/front-library/Modules/Validator/Tools/RadioButton';


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



/*
 * Used to make one validation on one input
 * Store the state (valid or not) between validations
 */
function InputValidator( $input, validatorParams, validatorOptions ) {
    let validateFunc, state;

    const SELF = this;
    validateFunc = validatorParams.validate;

    this.$input = $input;
    this.name = validatorParams.name;
    this.isAsynch = validatorParams.isAsynch;
    // Extra message like warning, not error
    this.extraMessages = [];
    // Extra error message rise by the validator
    this.extraErrorMessages = [];
    // Extra data send by the validator
    this.data = null;

    /*
     * Validate the current input with one validator
     */
    this.validate = ( isLiveValidation ) => {
        let value, prom;

        value = getValue( $input );
        prom = defer();

        this.extraMessages.length = 0;
        this.extraErrorMessages.length = 0;
        this.data = null;

        validateFunc( $input, value, isLiveValidation, validatorOptions ).then( _state => {
            state = _state;

            SELF.extraMessages = _state.extraMessages || SELF.extraMessages;
            SELF.extraErrorMessages =
                _state.extraErrorMessages || SELF.extraErrorMessages;
            SELF.data = _state.data;

            prom.resolve();
        } );

        return prom;
    }

    this.isValid = () => {
        return state && state.isValid;
    }

    this.getData = () => {
        return this.data;
    }
}

/*
 * Object managing all validation functions
 */
function ValidatorFunctions() {
    let validators = [];

    /*
     * Add new validator to the list
     * @ignore
     */
    this.addValidator = ( name, selector, isAsynch, func ) => {
        if ( typeof func === 'undefined' ) {
            func = isAsynch;
            isAsynch = false;
        }

        validators.push( {
            name,
            selector,
            "validate": func,
            isAsynch
        } );
    }

    /*
     * Create and return all validators that apply to an inputs
     * @ignore
     */
    this.getValidators = ( $input, options ) => {
        let inputsValidators, validatorOptions;

        inputsValidators = [];

        validators.forEach( validatorParams => {
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

const validatorFunctions = new ValidatorFunctions();


/**
 * Create and add a new validation function to the validator
 *
 * @function addValidator
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} name - Name of the validator. Use as label for error message
 * @param {String} selector
 * @param {Boolean} isAsynch
 * @param {Function} func
 *
 * @see extra/modules/validator.md for details
 */
export const addValidator = validatorFunctions.addValidator;

/*
 * Handle one input
 */
function Input( $input, options ) {
    let isRadio,
        inputType,
        inputId,
        $group,
        validators,
        _hasValidator,
        validatorsInErrors,
        inlineCustomErrorMessages,
        liveHookFunctionHash;

    const SELF = this;

    if ( $input.type === 'radio' || $input.type === 'checkbox' ) {
        inputType = 'optin';
    }
    else if ( $input.type === 'hidden' ) {
        inputType = 'hidden';
    }
    else if ( $input.nodeName === 'SELECT' ) {
        inputType = 'select';
    }
    else {
        inputType = 'inputText';
    }

    isRadio = $input.type === 'radio';
    inputId = $input.id;

    if ( inputId ) {
        this.$label = document.querySelector( `label[for="${ inputId }"]` );
    }

    if ( !this.$label ) {
        this.$label = $input.closest( 'label' );
    }

    // Get all validators for this input
    validators = validatorFunctions.getValidators( $input, options );

    _hasValidator = validators.length > 0;
    inlineCustomErrorMessages = {};

    if ( $input.hasAttribute( options.customErrorLabelPrefix ) ) {
        inlineCustomErrorMessages[ 'default' ] =
            options.errorMessages[ $input.getAttribute( options.customErrorLabelPrefix ) ];
    }

    validators.forEach( validator => {
        let attrName = [ options.customErrorLabelPrefix, validator.name ].join( '-' );

        if ( $input.hasAttribute( attrName ) ) {
            inlineCustomErrorMessages[validator.name] = $input.getAttribute( attrName );
        }
    })

    // Cache all radio button with the same name attribute
    if ( isRadio ) {
        $group = getRadioList( $input );
        this.$radioGroup = $group;
        this.$otherRadioOfGroup = Array.from( $group ).filter( $rd => {
            return $rd !== $input;
        } );

        this.$radioGroup.forEach( $rd => {
            $rd.__$radioMaster = $input;
            $rd.__$radioGroup = $group;
            $rd.__$otherRadioOfGroup = Array.from( $group ).filter( $rd2 => {
                return $rd2 !== $rd;
            } );
        } );
    }

    this.$input = $input;
    this.hasValidator = _hasValidator;
    this.hasError = false;


    if ( _hasValidator && options.hasLiveValidation && inputType !== 'hidden' ) {
        on( isRadio ? $group : $input, {
            "eventsName":   options.liveValidation.eventsName[ inputType ],
            "callback":     onLiveValidation
        } );
    }

    // Add extra listener (focus, blur, ...) on the input
    if ( options.liveValidation.eventsHook ) {
        liveHookFunctionHash = {};

        Object
            .keys( options.liveValidation.eventsHook )
            .forEach( key => {
                liveHookFunctionHash[ key ] = () => {
                    options.liveValidation.eventsHook[ key ]( SELF, event );
                }

                on( isRadio ? $group : $input, {
                    "eventsName":   key,
                    "callback":     liveHookFunctionHash[ key ]
                } );
            } );
    }


    /*
     * Validate this input
     */
    function validate( isLiveValidation ) {
        let promArray;

        validatorsInErrors = null;
        SELF.hasError = false;
        SELF.isLiveValidation = isLiveValidation;

        // This input has no (known) validation
        if ( !_hasValidator ) {
            return Promise.resolve();
        }

        promArray = [];

        // Call all validators
        validators.forEach( validator => {
            promArray.push( validator.validate( isLiveValidation ) )
        } );

        return Promise.all( promArray ).then(() => {
            validators.forEach( validator => {
                if ( !validator.isValid() ) {
                    SELF.hasError = true
                }
            } );
        } );
    }


    /*
     * Return an array of validator in error
     */
    this.getErrors = () => {
        validatorsInErrors = [];

        // No validator => Field is valid
        if ( !_hasValidator ) {
            return validatorsInErrors;
        }

        // Return only validator in invalid state
        validators.forEach( validator => {
            if ( !validator.isValid() ) {
                validatorsInErrors.push( validator );
            }
        })

        return validatorsInErrors;
    }


    function labelToMessage( validatorName, _locale, avoidDefaultMessage ) {
        let customInlineDefaultMessage,
            customErrorDefaultMessage,
            forcedJSMessage,
            customInlineMessage,
            customErrorMessage;

        if ( !avoidDefaultMessage ) {
            // In attribute data-error-label
            customInlineDefaultMessage = inlineCustomErrorMessages[ 'default' ];
            // In global options configuration
            customErrorDefaultMessage = options.errorMessages[ 'default' ];
        }

        // Forced in parameters of this function
        forcedJSMessage = _locale ? _locale[ validatorName ] : null;

        if ( forcedJSMessage ) {
            return forcedJSMessage;
        }

        // In attribute data-error-label-VALIDATOR_NAME
        customInlineMessage = inlineCustomErrorMessages[ validatorName ];
        if ( customInlineMessage ) {
            customInlineMessage =
                options.errorMessages[ customInlineMessage ] ||
                customInlineMessage;
        }

        if ( customInlineMessage ) {
            return customInlineMessage;
        }

        // In global options configuration
        customErrorMessage = options.errorMessages[ validatorName ];

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
    this.getErrorMessages = _locale => {
        if ( !validatorsInErrors ) {
            this.getErrors();
        }

        if ( !validatorsInErrors.length ) {
            return [];
        }

        const messages = [];

        validatorsInErrors.forEach( validator => {
            // BASIC MESSAGE (determined from validator name)
            messages.push( {
                "message": labelToMessage( validator.name, _locale ),
                "label": validator.name,
                "type": "basic"
            } );

            // EXTRA MESSAGE (from the validator function)

            validator.extraErrorMessages.forEach( extraErrorMessage => {
                messages.push( {
                    "message": labelToMessage( extraErrorMessage, _locale, true ),
                    "label": validator.name,
                    "type": "extra"
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
     * Return a promise
     */
    this.isValid = () => {
        return validate( false );
    }


    this.getData = () => {
        let dataArray;

        if ( !validatorsInErrors ) {
            this.getErrors();
        }

        if ( !validatorsInErrors.length ) {
            return [];
        }

        dataArray = [];

        validatorsInErrors.forEach( validator => {
            let data = validator.getData();

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
    this.destroy = () => {

        if ( _hasValidator && options.hasLiveValidation && inputType !== 'hidden' ) {
            off( isRadio ? $group : $input, {
                "eventsName":   options.liveValidation.eventsName[ inputType ],
                "callback":     onLiveValidation
            } );
        }


        if ( options.liveValidation.eventsHook && liveHookFunctionHash ) {
            Object
                .keys( options.liveValidation.eventsHook )
                .forEach( key => {
                    off( isRadio ? $group : $input, {
                        "eventsName":   key,
                        "callback":     liveHookFunctionHash[ key ]
                    } );
                } );
        }
    };


    function onLiveValidation( event ) {
        validate( true )
            .then( () => {
                if ( SELF.hasError && options.liveValidation.onInvalidate ) {
                    options.liveValidation.onInvalidate( SELF, event );
                }
                else if ( !SELF.hasError && options.liveValidation.onValidate ) {
                    options.liveValidation.onValidate( SELF, event );
                }
            } )
            .catch( err => {
                if ( window.$$DEBUG$$ ) {
                    console.log( err );
                }
            } );
    }

}

/**
 * @typedef {Object} Input
 * @memberof Validator
 * @property {HTMLElement} $input
 * @property {HTMLElement} $label
 * @property {Function} getErrorMessages
 * @property {Function} getErrors
 * @property {Boolean} hasError
 * @property {Function} isValid
 * @property {Boolean} isLiveValidation
 */
/**
 * Validate a form, a fieldset or whatever had inputs inside
 * @class Validator
 *
 * @param {HTMLElement} $form
 * @param {Object} userOptions
 * @param {String} [userOptions.fields=input,textarea,select]
 * @param {String} [userOptions.filter=input[type=\"button\"], input[type=\"submit\"], input[type=\"reset\"], input[type=\"image\"]]
 * @param {String} [userOptions.customErrorLabelPrefix=data-error-label]
 * @param {Object} [userOptions.errorMessages={}]
 * @param {Object} [userOptions.validatorsOptions]
 * @param {Callback} [userOptions.onValidate=data => {}]
 * @param {Callback} [userOptions.onInvalidate=data => {}]
 * @param {Object} [userOptions.liveValidation]
 * @param {Function} [userOptions.liveValidation.onValidate]
 * @param {Function} [userOptions.liveValidation.onInvalidate]
 * @param {Object} [userOptions.liveValidation.eventsName]
 * @param {String} [userOptions.liveValidation.eventsName.optin]
 * @param {String} [userOptions.liveValidation.eventsName.select]
 * @param {String} [userOptions.liveValidation.eventsName.inputText]
 * @param {Object} [userOptions.liveValidation.eventsHook]
 *
 * @see extra/modules/validator.md for details
 *
 * @example let validator = new Validator( $form, options )
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
export function Validator( $form, userOptions = {} ) {
    let options,
        inputsList,
        radioDuplicateHash,
        state;

    options = extend( defaultOptions, userOptions );
    options.hasLiveValidation = options.liveValidation.onValidate || options.liveValidation.onInvalidate;
    inputsList = [];
    radioDuplicateHash = {};

    const STATE_IDLE = 'idle';
    const STATE_VALIDATING = 'validating';
    state = STATE_IDLE;

    $form.setAttribute( 'novalidate', 'novalidate' );


    /*
     * Filter radio button to validate only one button
     */
    function filterRadioButton( $input ) {
        if ( $input.type !== 'radio' ) {
            return true;
        }

        if ( radioDuplicateHash[ $input.name ] ) {
            return false;
        }

        radioDuplicateHash[ $input.name ] = true;

        return true;
    }


    /*
     * Call the function cleanup of all inputs and empty the list
     */
    function cleanup() {
        inputsList.forEach( input => input.destroy() );
        inputsList.length = 0;
        radioDuplicateHash = {};
    }


    /*
     * Create and add one input to the list
     */
    function addInput( $input ) {
        // Check if this input type
        if ( !$input.matches( options.filter ) && filterRadioButton( $input ) ) {
            inputsList.push( new Input( $input, options ) );
        }
    }


    /*
     * Empty and clean the input list and recreate it
     */
    function refresh() {
        let $fieldToAdd;

        cleanup();

        $fieldToAdd = $form.querySelectorAll( options.fields );

        $fieldToAdd.forEach( addInput );
    }


    /*
     * Validate all fields and return a promise
     */
    function _validate() {
        let inputsValid = [];

        inputsList.forEach( input => {
            inputsValid.push( input.isValid() );
        } );

        return Promise.all(inputsValid);
    }


    function filterInputError( input ) {
        return input.hasError;
    }


    /*
     * Call validation and call callback if needed
     */
    function process() {
        let prom, retObject;

        state = STATE_VALIDATING;
        prom = defer();

        retObject = {
            "inputs": inputsList,
            "errors": [],
            $form
        };

        _validate()
            .then( () => {
                let errors = inputsList.filter( filterInputError );

                state = STATE_IDLE;

                if ( errors && errors.length ) {
                    retObject.errors = errors;

                    if ( options.onInvalidate ) {
                        options.onInvalidate( retObject );
                    }

                    prom.reject( retObject );

                    return;
                }

                if ( options.onValidate ) {
                    options.onValidate( retObject );
                }
                prom.resolve( retObject );
            } )
            .catch( err => {
                state = STATE_IDLE;
                if ( window.$$DEBUG$$ ) {
                    console.log( err );
                }
            } );

        return prom;
    }


    /**
     * Start the validation of all the form
     *
     * @function validate
     * @memberof Validator
     * @instance
     *
     * @returns {Promise}
     */
    this.validate = () => {
        if ( state !== STATE_IDLE ) {
            return defer();
        }
        return process();
    }


    /**
     * Bind or rebind all inputs
     *
     * @function update
     * @memberof Validator
     * @instance
     */
    this.update = () => {
        refresh();
    }


    /**
     * Return the validator object of an input
     *
     * @function getFieldValidator
     * @memberof Validator
     * @instance
     * @param {HTMLElement} $field
     *
     * @return {Input}
     */
    this.getFieldValidator = $field => {

        for ( const input of inputsList ) {
            if ( input.$input === $field ) {
                return input;
            }
        }

    }


    /**
     * Validate one field
     *
     * @function validateField
     * @memberof Validator
     * @instance
     * @param {HTMLElement} $field
     *
     * @return {Promise}
     */
    this.validateField = $field => {
        let input, prom, retObject;

        input = this.getFieldValidator( $field );

        if ( !input ) {
            return Promise.resolve();
        }

        state = STATE_VALIDATING;

        prom = defer();

        retObject = {
            "input": input,
            "error": null,
            $form
        };

        input.isValid()
                .then( () => {
                    state = STATE_IDLE;
                    if ( input.hasError ) {
                        retObject.error = input;
                        prom.reject( retObject );
                        return;
                    }
                    prom.resolve( retObject );
                } )
                .catch( err => {
                    state = STATE_IDLE;
                    if ( window.$$DEBUG$$ ) {
                        console.log( err );
                    }
                } )

        return prom;
    }


    /**
     * Get all handled fields (DOM elements)
     *
     * @function getAllFields
     * @memberof Validator
     * @instance
     * @param {Boolean} onlyValidated - If true, remove all fields without validator
     *
     * @return {HTMLElement[]}
     */
    this.getAllFields = onlyValidated => {
        let $fields = [];

        inputsList.forEach( input => {
            if ( !onlyValidated || input.hasValidator ) {
                $fields.push( input.$input );
            }
        } )

        return $fields;
    }


    /**
     * Get only the fields (DOM elements) with at least one validator
     *
     * @function getCheckedFields
     * @memberof Validator
     * @instance
     *
     * @return {HTMLElement[]}
     */
    this.getCheckedFields = () => {
        return this.getAllFields( true );
    }


    /**
     * Get all inputs (input objects, not DOM elements)
     *
     * @function getAllInputs
     * @memberof Validator
     * @instance
     *
     * @return {Input[]}
     */
    this.getAllInputs = () => {
        return inputsList;
    }


    /**
     * Get all inputs (input objects, not DOM elements) with at least one validator
     *
     * @function getCheckedInputs
     * @memberof Validator
     * @instance
     *
     * @return {Input[]}
     */
    this.getCheckedInputs = () => {
        let inputs = [];

        inputsList.forEach( input => {
            if ( input.hasValidator ) {
                inputs.push(input);
            }
        } )

        return inputs;
    }

    refresh();
}
