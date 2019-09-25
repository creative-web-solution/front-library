import { standardValidation, isUrl, addValidator } from 'front-library/Modules/Validator';

/**
 * URL validation
 */
addValidator( 'url', '[type="url"]', ( $input, value ) => {
    return standardValidation(
        $input,
        value,
        value === '' || isUrl( value ),
        'url'
    );
} );
