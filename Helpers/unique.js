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
    let returnArr = [];

    for ( let i = 0; i < list.length; i++ ) {
        if (
            ( filter && filter(list[ i ], returnArr ) ) ||
            ( !filter && !returnArr.includes(list[ i ] ) )
        ) {
            returnArr.push( list[ i ] );
        }
    }

    return returnArr;
}
