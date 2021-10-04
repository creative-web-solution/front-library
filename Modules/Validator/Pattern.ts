import { addValidator } from './index';


/**
 * Email validation
 */
addValidator( 'pattern', '[pattern]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' || new RegExp( $input.getAttribute( 'pattern' ) as string ).test( value as string ),
        "label":   "pattern",
        isLiveValidation
    });
} );
