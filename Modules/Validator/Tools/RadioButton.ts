import { extend } from '@creative-web-solution/front-library/Helpers/Extend';

/**
 * Get all radio with the same name
 *
 * @param inputRadioOrInputName
 * @param userOptions
 * @param [userOptions.selector=input[name="{NAME}"]] - css selector of the elements with a {GROUP_NAME} tag that will be replace by groupName var.
 * @param [userOptions.othersOnly=false] - if true, return the list without the element in `inputRadioOrInputName`. If `inputRadioOrInputName` is a string (input name), return all radio
 *
 * @see extra/modules/validator.md for details
 *
 * @returns Return all elements
 */
export function getRadioList( inputRadioOrInputName: HTMLElement | string, userOptions?: { selector?: string, othersOnly?: boolean } ): HTMLElement[] | NodeList {
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

    return Array.from<HTMLElement>( $radioList ).filter( $rd => {
        return $rd !== $currentInput;
    } );
}


/**
 * Get the selected radio button from a list.
 *
 * @param $iputRadioOrRadioList
 *
 * @see extra/modules/validator.md for details
 *
 * @return Return the selected radio button from a group or false
 */
export function isRadioListChecked( $iputRadioOrRadioList: HTMLElement[] | HTMLElement | NodeList ): false | HTMLInputElement {
    let $list = ( $iputRadioOrRadioList instanceof NodeList || $iputRadioOrRadioList instanceof Array ) ? $iputRadioOrRadioList : getRadioList( $iputRadioOrRadioList );

    for ( const $item of Array.from( $list ) ) {
        if ( ($item as HTMLInputElement).checked ) {
            return ($item as HTMLInputElement);
        }
    }

    return false;
}
