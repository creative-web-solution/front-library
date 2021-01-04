import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import isNumber from '@creative-web-solution/front-library/Modules/Validator/Tools/isNumber';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

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
