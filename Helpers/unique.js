/**
 * Remove all duplicate from a list
 *
 * @param {Array} list
 * @param {Function} [filter] - Optionnal, (currentItem, returnArray) => { should return true or false }
 *
 * @example // Using the native includes function
 * modifiedArray = unique( array )
 *
 * // With custom function (here, same as default behaviour)
 * modifiedArray = unique( array, (currentValue, returnArray) => { return !returnArray.includes(currentValue) } )
 *
 * @returns {Array}
 */
export function unique( list, filter ) {
    if ( !filter ) {
        return Array.from( new Set( list ) );
    }

    const returnArr = [];

    for ( const item of list ) {
        if ( filter( item, returnArr ) ) {
            returnArr.push( item );
        }
    }

    return returnArr;
}
