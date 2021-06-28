import { addValidator } from './index';


/**
 * Max length validation
 */
addValidator( 'maxlength', '[maxlength]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value.length <= Number( $input.getAttribute( 'maxlength' ) ),
        "label": "maxlength",
        isLiveValidation
    });
} );
