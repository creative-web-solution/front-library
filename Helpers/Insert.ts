/**
 * Insert a value or an object in a list. Doesn't change the original list.
 *
 * @param list
 * @param what - Something to insert
 * @param indexWhere - Index in the list
 *
 * @example
 * modifiedArray = insert( array, obj, 2 )
 *
 * @returns New modified array
 */
export function insert( list: any[], what: any, indexWhere: number ): any[] {
    const listLength = list.length;

    if ( !listLength ) {
        return list;
    }

    if ( indexWhere <= 0 ) {
        return [ what, ...list ];
    }

    if ( indexWhere >= listLength ) {
        return [ ...list, what ];
    }

    return [
        ...list.slice( 0, indexWhere ),
        what,
        ...list.slice( indexWhere, list.length )
    ];
}
