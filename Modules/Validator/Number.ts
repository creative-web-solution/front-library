import isNumber         from './Tools/IsNumber';
import { addValidator } from './index';

/**
 * Number validation
 */
addValidator( 'number', '[type="number"]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' || isNumber( value as string ),
        "label":   "number",
        isLiveValidation
    });
} );
