import isUrl            from './Tools/IsUrl';
import { addValidator } from './index';

/**
 * URL validation
 */
addValidator( 'url', '[type="url"]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' || isUrl( value as string ),
        "label":   "url",
        isLiveValidation
    });
} );
