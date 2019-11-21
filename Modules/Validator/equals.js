import { getValue } from 'front-library/Helpers/getValue';
import { standardValidation } from 'front-library/Modules/Validator/Tools/ValidationState';
import { addValidator } from 'front-library/Modules/Validator';


/**
 * "Two fields equals" validation
 */
addValidator( 'equals', '[data-equals]', ( $input, value, isLiveValidation ) => {
    let $target, name;

    name = $input.getAttribute( 'data-equals' );
    $target = document.getElementById( name );

    return standardValidation(
        $input,
        value,
        !$target || value === getValue( $target ),
        'email',
        undefined,
        isLiveValidation
    );
} );
