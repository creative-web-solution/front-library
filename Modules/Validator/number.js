import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import isNumber from 'front-library/Modules/Validator/Tools/isNumber';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * Number validation
 */
addValidator( 'number', '[type="number"]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isNumber( value ),
        'number',
        undefined,
        isLiveValidation
    );
} );
