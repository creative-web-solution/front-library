import isEmail          from './Tools/IsEmail';
import { addValidator } from './index';


/**
 * Email validation
 */
addValidator( 'email', '[type="email"]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' || isEmail( value as string, $input.hasAttribute( 'data-loose' ) ),
        "label": "email",
        isLiveValidation
    });
} );
