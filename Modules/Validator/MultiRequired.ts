import { getValue }           from '../../Helpers/GetValue';
import isEmpty                from './Tools/IsEmpty';
import { addValidator }       from './index';
import { isRadioListChecked } from './Tools/RadioButton';


/**
 * Check for a group of field if at least x are checked (or filled) and maximum y
 *
 * on the first field:              data-multirequired="myGroup|x|y"
 * on other field of the group :    data-multirequired-group="myGroup"
 *
 */
addValidator( 'multirequired', '[data-multirequired]', ( $input, value, isLiveValidation ) => {
    let $group, arrayData, count, data, groupName, nbRequiredMax, nbRequiredMin;

    data = $input.getAttribute( 'data-multirequired' );
    count = 0;

    if ( data.indexOf( '|' ) === -1 ) {
        return Promise.resolve({
            $input,
            value,
            "isValid": true,
            "label":   "multirequired",
            isLiveValidation
        });
    }

    arrayData = data.split( '|' );
    groupName = arrayData[ 0 ];

    $group = document.querySelectorAll( `[data-multirequired-group^="${ groupName }"]` );

    if ( !$group.length ) {
        return Promise.resolve({
            $input,
            value,
            "isValid": true,
            "label":   "multirequired",
            isLiveValidation
        });
    }

    nbRequiredMin = parseInt( arrayData[ 1 ], 10 ) || 0

    if ( arrayData.length > 2 ) {
        nbRequiredMax = parseInt( arrayData[ 2 ], 10 );
    }
    else {
        nbRequiredMax = 10000;
    }

    $group = Array.prototype.slice.call( $group, 0 );

    $group.push( $input );

    $group.forEach( $elem => {
        const VALUE = getValue( $elem );
        if (
            ( $elem.type === 'checkbox' && $elem.checked ) ||
            ( $elem.type === 'radio' &&
                isRadioListChecked( $elem.__$radioGroup ) ) ||
            ( $elem.type !== 'checkbox' &&
                $elem.type !== 'radio' &&
                Array.isArray( VALUE ) ? VALUE.length > 0 : !isEmpty( VALUE as string ) )
        ) {
            count++
        }
    } );

    return Promise.resolve({
        $input,
        value,
        "isValid": nbRequiredMin <= count && count <= nbRequiredMax,
        "label":   "multirequired",
        isLiveValidation
    });
} );
