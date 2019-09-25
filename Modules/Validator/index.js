import { getValue } from 'front-library/Helpers/getValue';
import { extend } from 'front-library/Helpers/Extend';
import { defer } from 'front-library/Helpers/defer';
import { unique } from 'front-library/Helpers/unique';

const defaultOptions = {
    "fields":               "input,textarea,select",
    "filter":               "input[type=\"button\"],input[type=\"submit\"],input[type=\"reset\"],input[type=\"image\"]",
    "onValidate":           null,
    "onInvalidate":         null,
    "validatorsOptions":    null,
    "customErrorLabelPrefix": "data-error-label",
    "errorMessages":        {}
};

const numRe                               = /^-?[0-9]*(\.[0-9]+)?$/;

// http://net.tutsplus.com/tutorials/other/8-regular-expressions-you-should-know/
const emailRe                             = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
const urlRe                               = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i;
const emptyRe                             = /(^$)|(^[\s]*$)/i;

/**
 * All validator tools
 * @namespace ValidatorTools
 *
 * @example
 * import { addValidator } from 'front-library/Modules/Validator'
 */

/**
 * Get all radio with the same name
 *
 * @function getRadioList
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement|string} inputRadioOrInputName
 * @param {Object} userOptions
 * @param {String} [userOptions.selector=input[name="{NAME}"]] - css selector of the elements with a {GROUP_NAME} tag that will be replace by groupName var.
 * @param {Boolean} [userOptions.othersOnly=false] - if true, return the list without the element in `inputRadioOrInputName`. If `inputRadioOrInputName` is a string (input name), return all radio
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {HTMLElement[]} Return all elements
 */
export function getRadioList( inputRadioOrInputName, userOptions ) {
    let $radioList, $currentInput, options;

    options = {
        "othersOnly":   false
    };

    if ( typeof userOptions === 'string' ) {
        options.selector = userOptions;
    }
    else {
        options = extend( options, {
            "selector":     "input[name=\"{NAME}\"]"
        }, userOptions );
    }


    if ( inputRadioOrInputName instanceof HTMLElement ) {
        $currentInput = inputRadioOrInputName;

        if ( $currentInput.__$radioGroup ) {
            $radioList = $currentInput.__$radioGroup;
        }
        else {
            $radioList = document.querySelectorAll( options.selector.replace('{NAME}', $currentInput.name) );
        }
    }
    else {
        $radioList = document.querySelectorAll( options.selector.replace('{NAME}', inputRadioOrInputName) );
    }

    if ( !options.othersOnly || !$currentInput ) {
        return $radioList;
    }

    return Array.from( $radioList ).filter( $rd => {
        return $rd !== $currentInput;
    } );
}


/**
 * Get the selected radio button from a list.
 *
 * @function isRadioListChecked
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement[]|HTMLElement} $iputRadioOrRadioList
 *
 * @see extra/modules/validator.md for details
 *
 * @return {false|HTMLElement} Return the selected radio button from a group or false
 */
export function isRadioListChecked( $iputRadioOrRadioList ) {
    let $list = ( $iputRadioOrRadioList instanceof NodeList || $iputRadioOrRadioList instanceof Array ) ? $iputRadioOrRadioList : getRadioList( $iputRadioOrRadioList );

    for ( let i = 0, len = $list.length; i < len; ++i ) {
        if ( $list[i].checked ) {
            return $list[ i ];
        }
    }
    return false;
}


/**
 * Get the label of an input
 *
 * @function getLabelElement
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement} $input
 * @param {HTMLElement} [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return {HTMLElement|HTMLElement[]|null} Return the label, if there is only one, the list of labels if many or null if none
*/
export function getLabelElement( $input, $wrapper = document.body ) {
    let $labels = $wrapper.querySelectorAll( `label[for="${ $input.id }"]` );

    if ( !$labels.length ) {
        return null;
    }
    if ( $labels.length === 1 ) {
        return $labels[ 0 ];
    }

    return $labels;
}


/**
 * Get the text of a label's input
 *
 * @function getLabel
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement} $input
 * @param {HTMLElement} [$wrapper=document.body]
 *
 * @see extra/modules/validator.md for details
 *
 * @return {string|string[]} Return the label, if there is only one, the list of labels if many or '' if none
*/
export function getLabel( $input, $wrapper = document.body ) {
    let $labels = getLabelElement( $input, $wrapper );

    if ( !$labels ) {
        return '';
    }
    else if ( $labels instanceof NodeList ) {
        return Array.from( $labels ).map( $label => $label.textContent );
    }

    return $labels.textContent;
}


/**
 * @typedef {Object} Validator_State
 * @memberof ValidatorTools
 *
 * @property {HTMLElement} $input
 * @property {String|Number} value
 * @property {Boolean} isValid
 * @property {String} validatorName
 * @property {*} data
 */
/**
 * Create a basic state object that will be return as parameter in promises
 *
 * @function createState
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement} $input
 * @param {String|Number} value
 * @param {Boolean} isValid
 * @param {String} validatorName
 * @param {*} data
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Validator_State}
 */
export function createState( $input, value, isValid, validatorName, data ) {
    return {
        $input,
        value,
        isValid,
        "label": validatorName,
        data
    };
}


/**
 * Helper for basic (synchronous) validation system
 *
 * @function standardValidation
 * @memberof ValidatorTools
 * @instance
 *
 * @param {HTMLElement} $input
 * @param {String} value
 * @param {Boolean} isValid
 * @param {String} validatorName
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Promise}
 */
export function standardValidation( $input, value, isValid, validatorName ) {
    let deferred, state;

    deferred = defer();
    state = createState( $input, value, isValid, validatorName );

    deferred.resolve( state );

    return deferred;
}


/**
 * Test if there is a value
 *
 * @function isEmpty
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export function isEmpty( value ) {
    return emptyRe.test( value );
}


/**
 * Test if the value is a number
 *
 * @function isNumber
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export function isNumber( value ) {
    return numRe.test( value );
}


/**
 * Test if the value is an email
 *
 * @function isEmail
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export function isEmail( value ) {
    return emailRe.test( value );
}


/**
 * Test if the value is an url
 *
 * @function isUrl
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export function isUrl( value ) {
    return urlRe.test( value );
}


/**
 * Test if the value is a date
 *
 * @function isDate
 * @memberof ValidatorTools
 * @instance
 *
 * @param {String} value
 * @param {String} [format="d/m/y"]
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export function isDate( value, format = 'd/m/y' ) {
    var date,
        splittedValues,
        splittedFormat,
        SEPARATOR,
        yIndex,
        mIndex,
        dIndex,
        y,
        m,
        d;

    SEPARATOR = format.indexOf( '/' ) > -1 ? '/' : '-';

    splittedFormat = format.split( SEPARATOR );
    splittedValues = value.split( SEPARATOR );

    if ( splittedValues.length !== splittedFormat.length ) {
        return false;
    }

    yIndex = splittedFormat.indexOf( 'y' );
    mIndex = splittedFormat.indexOf( 'm' );
    dIndex = splittedFormat.indexOf( 'd' );

    y = +splittedValues[ yIndex ];
    m = +splittedValues[ mIndex ] - 1;
    d = +splittedValues[ dIndex ];

    date = new Date( y, m, d );

    return (
        date.getDate() === d &&
        date.getMonth() === m &&
        date.getFullYear() === y
    );
}

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
    this.validate = () => {
        let value, prom;

        value = getValue( $input );
        prom = defer();

        this.extraMessages.length = 0;
        this.extraErrorMessages.length = 0;
        this.data = null;

        validateFunc( $input, value, validatorOptions ).then( _state => {
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
        inputId,
        $group,
        validators,
        _hasValidator,
        validatorsInErrors,
        inlineCustomErrorMessages;

    const SELF = this;

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
    if ( _hasValidator && isRadio ) {
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

    /*
     * Validate this input
     */
    function validate() {
        let promArray;

        validatorsInErrors = null;
        SELF.hasError = false;

        // This input has no (known) validation
        if ( !_hasValidator ) {
            return Promise.resolve();
        }

        promArray = [];

        // Call all validators
        validators.forEach( validator => {
            promArray.push( validator.validate() )
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
        let messages;

        if ( !validatorsInErrors ) {
            this.getErrors();
        }

        if ( !validatorsInErrors.length ) {
            return [];
        }

        messages = [];

        validatorsInErrors.forEach( validator => {
            // BASIC MESSAGE (determined form validator name)
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
        return validate();
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
 */
/**
 * Validate a form, a fieldset or whatever had inputs inside
 * @class Validator
 *
 * @param {HTMLElement} $form
 * @param {Object} userOptions
 * @param {String} [userOptions.fields=input,textarea,select]
 * @param {String} [userOptions.filter=input[type=\"button\"],input[type=\"submit\"],input[type=\"reset\"],input[type=\"image\"]]
 * @param {String} [userOptions.customErrorLabelPrefix=data-error-label]
 * @param {Object} [userOptions.errorMessages={}]
 * @param {Object} [userOptions.validatorsOptions]
 * @param {Callback} [userOptions.onValidate=data => {}]
 * @param {Callback} [userOptions.onInvalidate=data => {}]
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
        state,
        STATE_IDLE,
        STATE_VALIDATING;

    options = extend( defaultOptions, userOptions );
    inputsList = [];
    radioDuplicateHash = {};

    STATE_IDLE = 'idle';
    STATE_VALIDATING = 'validating';
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
        let input;

        for ( let i = 0, len = inputsList.length; i < len; ++i ) {
            if ( inputsList[ i ].$input === $field ) {
                input = inputsList[ i ];
                break;
            }
        }

        return input;
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
