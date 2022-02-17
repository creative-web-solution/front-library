/**
 * Remove all duplicate from a list. Doesn't change the original list.
 *
 * @param filter - Optionnal, (currentItem, returnArray) =&gt; `{` should return true or false `}`
 *
 * @example
 * ```ts
 * // Using the native includes function
 * modifiedArray = unique( array )
 *
 * // With custom function (here, same as default behaviour)
 * modifiedArray = unique( array, (currentValue, returnArray) => { return !returnArray.includes(currentValue) } )
 * ```
 *
 * @returns Filtered list
 */
export function unique( list: any[], filter?: ( item: any, returnArr: any[] ) => boolean ): any[]  {
    if ( !filter ) {
        return Array.from( new Set( list ) );
    }

    const returnArr: any[] = [];

    for ( const item of list ) {
        if ( filter( item, returnArr ) ) {
            returnArr.push( item );
        }
    }

    return returnArr;
}