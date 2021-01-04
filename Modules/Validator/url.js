import { standardValidation } from '@creative-web-solution/front-library/Modules/Validator/Tools/ValidationState';
import isUrl from '@creative-web-solution/front-library/Modules/Validator/Tools/isUrl';
import { addValidator } from '@creative-web-solution/front-library/Modules/Validator';

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
