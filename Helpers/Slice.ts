/**
 * Remove an object from a list. Doesn't change the original list.
 *
 * @param list
 * @param what
 *
 * @example
 * modifiedArray = slice( list, obj )
 *
 * @returns New modified list
 */
export function slice( list: any[], what: any ): any[] {
    if ( !list || !list.length || !what ) {
        return list;
    }

    const index = list.indexOf( what );
    const modifiedList = [ ...list ];

    if ( index > -1 ) {
        modifiedList.splice( index, 1 );
    }

    return modifiedList;
}
