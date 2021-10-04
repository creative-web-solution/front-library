import isDate           from './Tools/IsDate';
import { addValidator } from './index';


/**
 * Date validation
 */
addValidator( 'date', '[data-date-control]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' ||
                    isDate(
                        value as string,
                        $input.getAttribute( 'data-date-control' ) || ''
                    ),
        "label": "date",
        isLiveValidation
    });
} );
