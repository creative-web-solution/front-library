/**
 * Insert a value or an object in a list
 *
 * @param {Array} list
 * @param {*} what
 * @param {Number} where - Index
 *
 * @example modifiedArray = insert( array, obj, 2 )
 *
 * @returns {Array} - Modified array
 */
export function insert( list, what, indexWhere ) {
    let listLength, arrStart, arrEnd;

    listLength = list.length;

    if ( !listLength ) {
        return list;
    }

    if ( indexWhere <= 0 ) {
        return [ what, ...list ];
    }

    if ( indexWhere >= listLength ) {
        list.push( what );
        return list;
    }

    arrStart = list.slice( 0, indexWhere );
    arrEnd = list.slice( indexWhere, list.length );

    return [...arrStart, what, ...arrEnd ];
}
