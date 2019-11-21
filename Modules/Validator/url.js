import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import isUrl from 'front-library/Modules/Validator/Tools/isUrl';
import { addValidator } from 'front-library/Modules/Validator';

/**
 * URL validation
 */
addValidator( 'url', '[type="url"]', ( $input, value, isLiveValidation ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isUrl( value ),
        'url',
        undefined,
        isLiveValidation
    );
} );
