import { isString, isArray, isFunction } from '@creative-web-solution/front-library/Helpers/Type';


function normalizeCssClass( cssClass ) {
    if ( isString( cssClass ) ) {
        return cssClass.split( ' ' );
    }
    else if ( isArray( cssClass ) ) {
        return cssClass;
    }
    else {
        return [ cssClass ];
    }
}


function isIterable( obj ) {
    return ( obj instanceof NodeList || obj instanceof Array ) && typeof obj.forEach !== 'undefined'
}


function applyToggle( $element, cleanedCssClass, forceAdd ) {
    cleanedCssClass.forEach( css => {
        $element.classList[
              ( typeof forceAdd === 'undefined' ? !hClass( $element, css ) : forceAdd )
            ?
                'add'
            :
                'remove'
        ]( css );
    } );
}


// Use to toggle class only
function classToggle( $elements, cssClass, forceAdd ) {
    let cleanedCssClass = normalizeCssClass( cssClass );

    if ( isIterable( $elements ) ) {
        $elements.forEach( $element => {
            applyToggle( $element, cleanedCssClass, forceAdd );
        } );
    }
    else {
        applyToggle( $elements, cleanedCssClass, forceAdd );
    }

    return $elements;
}


// Used to add/remove class only
function classChange( $elements, cssClass, add ) {
    let cleanedCssClass, functionName;

    functionName    = add ? 'add' : 'remove';
    cleanedCssClass = normalizeCssClass( cssClass );

    if ( isIterable( $elements ) ) {
        $elements.forEach( $element => {
            $element.classList[ functionName ]( ...cleanedCssClass );
        } );
    }
    else {
        $elements.classList[ functionName ]( ...cleanedCssClass );
    }

    return $elements;
}


// Used to replace class only
function classReplace( $element, oldCssClass, newCssClass ) {
    if ( isFunction( $element.classList.replace ) ) {
        $element.classList.replace( oldCssClass, newCssClass );
        return;
    }

    if ( hClass( $element, oldCssClass ) ) {
        $element.classList.remove( oldCssClass );
        $element.classList.add( newCssClass );
    }
}


/**
 * Check if a class is present on a DOM element
 *
 * @param {HTMLElement} $element - DOM element
 * @param {String} cssClass
 *
 * @example boolean = hClass( $element, cssClass )
 *
 * @return {boolean} - true if a class is present on a DOM element
 */
export function hClass( $element, cssClass ) {
    return $element.classList.contains( cssClass );
}


/**
 * Add a class on an element or a list of elements
 *
 * @param {HTMLElement|HTMLElement[]} $elements - DOM element or array of DOM element
 * @param {String|string[]} cssClass - Class name, class names separated by space or array of class
 *
 * @example aClass( $elements, cssClass )
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function aClass( $elements, cssClass ) {
    return classChange( $elements, cssClass, true );
}

/**
 * Remove a class on an element or a list of elements
 *
 * @example rClass( $elements, cssClass )
 *
 * @param {HTMLElement|HTMLElement[]} $elements - DOM element or array of DOM element
 * @param {String|String[]} cssClass - Class name, class names separated by space or array of class
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function rClass( $elements, cssClass ) {
    return classChange( $elements, cssClass, false );
}

/**
 * Toggle a class on an element or a list of elements
 *
 * @param {HTMLElement|HTMLElement[]} $elements - DOM element or array of DOM element
 * @param {String|String[]} cssClass - Class name, class names separated by space or array of class
 * @param {Boolean} [forceAdd]
 *
 * @example tClass( $elements, cssClass )
 * tClass( $elements, cssClass, forceAdd )
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function tClass( $elements, cssClass, forceAdd ) {
    return classToggle(
        $elements,
        cssClass,
        forceAdd
    );
}


/**
 * Replace classes.
 * Remove oldCssClass and add newCssClass only if oldCssClass exists
 *
 * @param {HTMLElement|HTMLElement[]} $elements
 * @param {String} oldCssClass
 * @param {String} newCssClass
 *
 * @example sClass( $elements, oldCssClass, newCssClass )
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function sClass( $elements, oldCssClass, newCssClass ) {

    if ( isIterable( $elements ) ) {
        $elements.forEach( $element => {
            classReplace( $element, oldCssClass, newCssClass );
        } );
    }
    else {
        classReplace( $elements, oldCssClass, newCssClass );
    }

    return $elements;
}
