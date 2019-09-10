/**
 * Remove all duplicate from a list
 *
 * @param {Array} arr
 * @param {?Function} fnc - Optionnal, (currentItem, returnArray) => { should return true or false }
 *
 * @example // Using the native includes function
 * modifiedArray = unique( array )
 *
 * // With custom function (here, same as default behaviour)
 * modifiedArray = unique( array, (currentValue, returnArray) => { return !returnArray.includes(currentValue) } )
 *
 * @returns {Array}
 */
export function unique(arr, fnc) {
    let returnArr = []

    for (let i = 0; i < arr.length; i++) {
        if (
            (fnc && fnc(arr[i], returnArr)) ||
            (!fnc && !returnArr.includes(arr[i]))
        ) {
            returnArr.push(arr[i])
        }
    }

    return returnArr
}
