import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

/**
 * Email validation
 */
addValidator( 'pattern', '[pattern]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' || new RegExp( $input.getAttribute( 'pattern' ) ).test( value ),
        'pattern',
        undefined,
        isLiveValidation
    );
} );
