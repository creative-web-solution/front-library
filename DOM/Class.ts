import { isFunction } from '@creative-web-solution/front-library/Helpers/Type';


function normalizeCssClass( cssClass: string[] | string ): string[] {
    if ( typeof cssClass === 'string' ) {
        return cssClass.split( ' ' );
    }
    else {
        return cssClass;
    }
}


function isIterable( obj: ClassInputType ): boolean {
    return ( obj instanceof NodeList || obj instanceof Array ) && typeof obj.forEach !== 'undefined'
}


function applyToggle( $element: Element, cleanedCssClass: string[], forceAdd?: boolean ) {
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
function classToggle( $elements: ClassInputType, cssClass: string | string[], forceAdd?: boolean ): ClassInputType {
    const cleanedCssClass: string[] = normalizeCssClass( cssClass );

    if ( isIterable( $elements ) ) {
        ($elements as Element[]).forEach( ( $element ) => {
            applyToggle( $element as Element, cleanedCssClass, forceAdd );
        } );
    }
    else {
        applyToggle( $elements as Element, cleanedCssClass, forceAdd );
    }

    return $elements;
}


// Used to add/remove class only
function classChange( $elements: ClassInputType, cssClass: string | string[], add: boolean ): ClassInputType {
    const functionName: 'add' | 'remove' = add ? 'add' : 'remove';
    const cleanedCssClass: string[]      = normalizeCssClass( cssClass );

    if ( isIterable( $elements ) ) {
        ($elements as Element[]).forEach( ( $element ) => {
            $element.classList[ functionName ]( ...cleanedCssClass );
        } );
    }
    else {
        ($elements as Element).classList[ functionName ]( ...cleanedCssClass );
    }

    return $elements;
}


// Used to replace class only
function classReplace( $element: Element, oldCssClass: string, newCssClass:string ) {
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
 * @param $element - DOM element
 * @param cssClass - Class name
 *
 * @example
 * boolean = hClass( $element, "css-class" )
 *
 * @return - true if a class is present on a DOM element
 */
export function hClass( $element: Element, cssClass: string ): boolean {
    return $element.classList.contains( cssClass );
}


/**
 * Add a class on an element or a list of elements
 *
 * @param $elements - DOM element or array of DOM element
 * @param cssClass - Class name, class names separated by space or array of class
 *
 * @example
 * aClass( $elements, "some-class" )
 *
 * @returns $elements
 */
export function aClass( $elements: ClassInputType, cssClass: string | string[] ): ClassInputType {
    return classChange( $elements, cssClass, true );
}

/**
 * Remove a class on an element or a list of elements
 *
 * @param $elements - DOM element or array of DOM element
 * @param cssClass - Class name, class names separated by space or array of class
 *
 * @example
 * rClass( $elements, "some-class" )
 *
 * @returns $elements
 */
export function rClass( $elements: ClassInputType, cssClass: string | string[] ): ClassInputType {
    return classChange( $elements, cssClass, false );
}


/**
 * Toggle a class on an element or a list of elements
 *
 * @param $elements - DOM element or array of DOM element
 * @param cssClass - Class name, class names separated by space or array of class
 * @param forceAdd - If explicitly set to true, add the class, if false, remove the class, if undefined, toggle the class
 *
 * @example
 * tClass( $elements, "some-class" )
 *
 * @example
 * tClass( $elements, "some-class", condition )
 *
 * @returns $elements
 */
export function tClass( $elements: ClassInputType, cssClass: string | string[], forceAdd?: boolean ): ClassInputType {
    return classToggle(
        $elements,
        cssClass,
        forceAdd
    );
}


/**
 * Replace a css class by another.
 * Remove oldCssClass and add newCssClass only if oldCssClass exists
 *
 * @param $elements
 * @param oldCssClass
 * @param newCssClass
 *
 * @example
 * sClass( $elements, "old-css-class", "new-css-class" )
 *
 * @returns $elements
 */
export function sClass( $elements: ClassInputType, oldCssClass: string, newCssClass: string ): ClassInputType {

    if ( isIterable( $elements ) ) {
        ($elements as Element[]).forEach( $element => {
            classReplace( $element as Element, oldCssClass, newCssClass );
        } );
    }
    else {
        classReplace( $elements as Element, oldCssClass, newCssClass );
    }

    return $elements;
}
