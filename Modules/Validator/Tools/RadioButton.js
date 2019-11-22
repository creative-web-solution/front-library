import { extend } from 'front-library/Helpers/Extend';

/**
 * Get all radio with the same name
 *
 * @function getRadioList
 *
 * @param {HTMLElement|string} inputRadioOrInputName
 * @param {Object} userOptions
 * @param {String} [userOptions.selector=input[name="{NAME}"]] - css selector of the elements with a {GROUP_NAME} tag that will be replace by groupName var.
 * @param {Boolean} [userOptions.othersOnly=false] - if true, return the list without the element in `inputRadioOrInputName`. If `inputRadioOrInputName` is a string (input name), return all radio
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {HTMLElement[]} Return all elements
 */
export function getRadioList( inputRadioOrInputName, userOptions ) {
    let $radioList, $currentInput, options;

    options = {
        "othersOnly":   false
    };

    if ( typeof userOptions === 'string' ) {
        options.selector = userOptions;
    }
    else {
        options = extend( options, {
            "selector":     "input[name=\"{NAME}\"]"
        }, userOptions );
    }


    if ( inputRadioOrInputName instanceof HTMLElement ) {
        $currentInput = inputRadioOrInputName;

        if ( $currentInput.__$radioGroup ) {
            $radioList = $currentInput.__$radioGroup;
        }
        else {
            $radioList = document.querySelectorAll( options.selector.replace('{NAME}', $currentInput.name) );
        }
    }
    else {
        $radioList = document.querySelectorAll( options.selector.replace('{NAME}', inputRadioOrInputName) );
    }

    if ( !options.othersOnly || !$currentInput ) {
        return $radioList;
    }

    return Array.from( $radioList ).filter( $rd => {
        return $rd !== $currentInput;
    } );
}


/**
 * Get the selected radio button from a list.
 *
 * @function isRadioListChecked
 *
 * @param {HTMLElement[]|HTMLElement} $iputRadioOrRadioList
 *
 * @see extra/modules/validator.md for details
 *
 * @return {false|HTMLElement} Return the selected radio button from a group or false
 */
export function isRadioListChecked( $iputRadioOrRadioList ) {
    let $list = ( $iputRadioOrRadioList instanceof NodeList || $iputRadioOrRadioList instanceof Array ) ? $iputRadioOrRadioList : getRadioList( $iputRadioOrRadioList );

    for ( let i = 0, len = $list.length; i < len; ++i ) {
        if ( $list[i].checked ) {
            return $list[ i ];
        }
    }
    return false;
}
