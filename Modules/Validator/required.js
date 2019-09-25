import { standardValidation, isRadioListChecked, isEmpty, addValidator } from 'front-library/Modules/Validator';

/**
 * Required validation
 */
addValidator( 'required', '[required]', ( $input, value ) => {
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

    return standardValidation( $input, value, isValid, 'required' );
} );
