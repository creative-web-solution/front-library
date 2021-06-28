import { addValidator } from './index';


/**
 * Min range validation
 */
addValidator( 'min', '[min]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' ||
                parseFloat( value as string ) >= parseFloat( $input.getAttribute( 'min' )! ),
        "label": "min",
        isLiveValidation
    });
} );
