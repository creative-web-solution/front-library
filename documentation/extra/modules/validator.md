## Validator


### Full options example

For validation function, you can use either:

* onValidate and onInvalidate callback in the configuration
* then and catch in the form event binding
* both at the same time


*Initialisation*

```
import { Validator } from 'MODULES'

let $form, validator;

$form = document.getElementById( 'form-test' );

validator = new Validator(
    $form,
    {
        "fields":                   "input,textarea,select",
        "filter":                   "input[type=\"button\"],input[type=\"submit\"],input[type=\"reset\"],input[type=\"image\"]",


        // See `Localization and error messages` section
        "customErrorLabelPrefix": "data-error-label",
        "errorMessages": {},


        "validatorsOptions":
        {
            "servercheck":
            {
                "beforeCall":
                    ( $input, value ) =>
                    {
                        console.log( 'beforeCall: ', $input, value );
                    },
                "afterCall":
                    ( $input, value ) =>
                    {
                        console.log( 'afterCall: ', $input, value );
                    }
            }
        },
        "onValidate": data =>
        {
            console.log( 'Valid cb:', data );
        },
        "onInvalidate": data =>
        {
            console.log( 'Invalid cb:', data );
            data.errors.forEach(
                input =>
                {
                    console.log( input.getErrorMessages() );
                }
            );
        }
    }
);
```

*Form binding*

```
on(
    $form,
    {
        "eventsName": "submit",
        "callback": e =>
        {
            e.preventDefault();

            validator
                    .validate()
                    .then(
                        data =>
                        {
                            console.log( 'Valid', data );
                            $form.submit();
                        }
                    )
                    .catch(
                        data =>
                        {
                            console.log( 'Invalid', data );
                            data.errors.forEach(
                                input =>
                                {
                                    console.log( input.getErrorMessages() );
                                }
                            )
                        }
                    );
        }
    }
);
```

### Radio button DOM feature

The validator add some shortcut in the DOM for radio button:

```
$radioButton.__$radioMaster => This is the main radio button where validator and controls are.
$radioButton.__$radioGroup => The list of ALL radio buttons whith the same name
$radioButton.__$otherRadioOfGroup => The list of ALL radio buttons BUT the current one ($radioButton) whith the same name
```

### API

Update field to validate:

```
validator.update()
```

Get all fields (return an array of DOMElements):

```
validator.getAllFields()
```

Get fields with at least 1 validator (return an array of DOMElements):

```
validator.getCheckedFields()
```

Get all input objects (return an array of input objects):

```
validator.getAllInputs()
```

Get inputs object with at least 1 validator (return an array of input objects):

```
validator.getCheckedInputs()
```

Validate only one field

```
validator.validateField( $field ).then( ... ).catch( ... )
```

Get the validator object of one field (return a validator)

```
validator.getFieldValidator( $field )
```


### Parameter details

Parameter of `onValidate` and `onInvalidate` callback (or in `then` and `catch` when using Promise):

```
data = {
    // Contains all inputs
    "inputs":                   [],
    // Contains only inputs in error
    "errors":                   [],
    // Current validated form
    "$form":                    DOMElement
}
```

*Input object sample:*

```
input = {
    // Current validated input, select, textarea, ...
    $input:                     DOMElement

    // Label of the input (if available)
    $label:                     DOMElement

    // return an array with all label and error message
    getErrorMessages()          function

    // return all validator in error
    getErrors()                 function

    // Tell if this input is in error
    hasError                    boolean

    // Tell if this input as validator
    hasValidator                boolean

    // Validate the field and return a boolean
    isValid()                   function


    // For radio button only


    // All radio button of this group
    $radioGroup                 Array

    // All radio button but the current one (the master one)
    $otherRadioOfGroup          Array
}
```

*getErrors( locale ) function:*

Return an array of validators:

```
{
    "$input":                   DOMElement
    isValid()                   function
    name                        label of the validator
    validate                    function
}
```

*getErrorMessages( locale ) function:*

Take an optional parameter that contains a hash connecting labels to error message:


* See `Localization and error messages` section


Return an array of object:

```
[
    {
        "label":        "required"
        "message":      "Field required"
    },
    ...
]
```

If the message is equal the label, this mean no match was found for this label.


### Localization and error messages

Locale object are like this:

```
{
    "default":          "Field in error"
    "required":         "Field required",
    "email":            "Email not valid",
    ...
}
```

The key must match with the name of the validators. If there is no match the `default` key will be used


*Error messages*

Error messages can be defined in (in order of priority if set in several times):

* The parameter of `getErrorMessages` function (only apply to the current input)
* Data attribute like `data-error-label` (only apply to the current input) (see `customErrorLabelPrefix` in configuration)
* The configuration object (`errorMessages` key) (apply to all input)

For data attribute, `customErrorLabelPrefix` represents the default error message of the input. You can add messages for specific error by adding `-error_label` at the end.

Example for an email error message:

```
<input type="email" required data-error-label="Field in error" data-error-label-email="Invalid email" >
```

*Used labels:*

* email
* equals
* max
* min
* maxlength
* minlength
* multirequired
* number
* pattern
* recaptcha
* required
* servercheck
* url


### Custom validator

A validator return a Promise which is ALWAYS resolve when the validation is ended. This is its parameter (called state) which will tell us if the validation is ok or not.

 ```
import { addValidator } from 'MODULES'

addValidator(
    VALIDATOR_NAME,
    SELECTOR,
    ( $input, value ) =>
    {
        return Promise_Object
    }
);
```

You can add an ASYNC parameter (Boolean). By default all functions are declare as not asynchronous.
The ASYNC parameter as no effect on validation, it's just here for indication purpose.
Can be useful for debug.

 ```
import { addValidator } from 'MODULES'

addValidator(
    VALIDATOR_NAME,
    SELECTOR,
    ASYNC,
    ( $input, value ) =>
    {
        return Promise_Object;
    }
);
```

See sample below.

A state (object return by the promise) is like this:

```
{
    // MANDATORY
    "$input":                       DOM element,
    "value":                        input value,
    "isValid":                      true|false,
    "label":                        validatorName,

    // OPTIONAL
    "extraMessages":                [], // Like warning, info, ...
    "extraErrorMessages":           [], // Extra error message/label
    "data":                         {}
}
```

There are available tools/helper:

Import its with:

```
import { validatorTools } from 'MODULES'
```


*Group selection*

```
validatorTools.getRadioList( RADIO_OR_INPUT_NAME [, {
    [selector]
    [othersOnly]
} ] );

validatorTools.getRadioList( $inputRadio );
// or
validatorTools.getRadioList( $inputRadio.name );
```

Return a NodeList of all `input[name="{NAME}"]`

For example, you can set a custom selector like `select[data-group="{NAME}"]`:

```
validatorTools.getRadioList( $inputRadio, {
    [selector]
    [othersOnly]
} );
```


*Check if one of the radio button is check:*

```
validatorTools.isRadioListChecked( $listOfInputRadio );
validatorTools.isRadioListChecked( $inputRadio );
```

Return the radio button checked or false.


*Get the text of a label's field:*

```
validatorTools.getLabel( $input );
validatorTools.getLabel( $input, $wrapper );
```

Return the text of the label, if there is only one, an array of string if more than 1, and '' if no label is found


*Get the label element of a field:*

```
validatorTools.getLabelElement( $input );
validatorTools.getLabelElement( $input, $wrapper );
```

Return the label, if there is only one, the list of labels if many or null if none

*Validation promise helper*

```
validatorTools.standardValidation( $input, value, isValid, validatorName );
```

Return a promise that will be rejected in case of error. See complete example below.


*Some helpers:*

```
validatorTools.isEmpty( value );
validatorTools.isNumber( value );
validatorTools.isEmail( value );
validatorTools.isUrl( isUrl );
validatorTools.isDate( stringDate, format? );
```


*Full sample of the url checking:*

```
addValidator(
    'url',
    '[type="url"]',
    ( $input, value ) =>
    {
        let isValid                        = value === '' || validatorTools.isUrl( value );

        return validatorTools.standardValidation( $input, value, isValid, 'url' );
    }
);
```

Example of an asynchronous validation:

```
addValidator(
    'testasync',
    '[data-testasync]',
    true,
    ( $input, value ) =>
    {
        let deferred                        = defer();

        isValid                             = true|false;

        // Simulate an asynchrone test
        setTimeout(
            () =>
            {
                deferred.resolve( validatorTools.createState( $input, value, isValid, 'testasync' ) );
            },
            1000
        );

        return deferred;
    }
);
```

Example with a custom state:

```
addValidator(
    'test',
    '[data-test]',
    ( $input, value ) =>
    {
        let deferred                        = defer();

        deferred.resolve(
            {
                "$input":                       $input,
                "value":                        value,
                "isValid":                      true,
                "label":                        'test',

                "extraMessages":                [ 'Here is a warning or an information' ],
                "extraErrorMessages":           [ 'Here is an extra error message', 'or-some-label' ],
                "data": {
                    "key":                      value
                }
            }
        );

        return deferred;
    }
);
```
