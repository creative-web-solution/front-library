/**
 * Remove an object from a list
 *
 * @param {Array} list
 * @param {*} what
 *
 * @example modifiedArray = slice( list, obj )
 *
 * @returns {Array} - Modified list
 */
export function slice( list, what ) {
    var index;

    if ( !list || !list.length ) {
        return;
    }

    index = list.indexOf( what );

    if ( index > -1 ) {
        list.splice( index, 1 );
    }

    return list;
}
