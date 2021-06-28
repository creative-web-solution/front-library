import { addValidator } from './index';


/**
 * Max range validation
 */
addValidator( 'max', '[max]', ( $input, value, isLiveValidation ) => {
    return Promise.resolve({
        $input,
        value,
        "isValid": value === '' ||
                    parseFloat( value as string ) <= parseFloat( $input.getAttribute( 'max' )! ),
        "label": "max",
        isLiveValidation
    });
} );
