import { addValidator } from './index';


/**
 * Min length validation
 */
addValidator( 'minlength', '[minlength]', function( $input, value, isLiveValidation ) {
    return Promise.resolve({
        $input,
        value,
        "isValid": value.length >= Number( $input.getAttribute( 'minlength' ) ),
        "label":   "minlength",
        isLiveValidation
    });
} );
