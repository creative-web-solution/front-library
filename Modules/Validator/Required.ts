import isEmpty                from './Tools/IsEmpty';
import { addValidator }       from './index';
import { isRadioListChecked } from './Tools/RadioButton';


/**
 * Required validation
 */
addValidator( 'required', '[required]', ( $input, value, isLiveValidation ) => {
    let isValid;

    if ( ($input as HTMLInputElement).type === 'checkbox' ) {
        isValid = ($input as HTMLInputElement).checked;
    }
    else if ( ($input as HTMLInputElement).type === 'radio' ) {

        isValid = isRadioListChecked( ($input as FLib.Validator.CustomValidatorRadioInput).__$radioGroup );
    }
    else {
        isValid = !isEmpty( value );
    }

    return Promise.resolve({
        $input,
        value,
        isValid,
        "label": "required",
        isLiveValidation
    });
} );
