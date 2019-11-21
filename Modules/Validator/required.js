import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import isEmpty from 'front-library/Modules/Validator/Tools/isEmpty';
import { addValidator } from 'front-library/Modules/Validator';
import { isRadioListChecked } from 'front-library/Modules/Validator/Tools/RadioButton';

/**
 * Required validation
 */
addValidator( 'required', '[required]', ( $input, value, isLiveValidation ) => {
    let isValid;

    if ( $input.type === 'checkbox' ) {
        isValid = $input.checked;
    }
    else if ( $input.type === 'radio' ) {
        isValid = isRadioListChecked( $input.__$radioGroup );
    }
    else {
        isValid = !isEmpty( value );
    }

    return standardValidation(
        $input,
        value,
        isValid,
        'required',
        undefined,
        isLiveValidation
    );
} );
