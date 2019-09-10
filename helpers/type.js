/**
 * Check the type of an object
 *
 * @param {*} obj
 * @param {string} type
 *
 * @example boolean = isType( obj, 'String' )
 *
 * @returns {boolean} - true if the object is in the asked type
 */
export function isType(obj, type) {
    return Object.prototype.toString.call(obj).indexOf(type) > -1
}

/**
 * Return true if the objec is an Array
 *
 * @param {*} obj
 *
 * @example boolean = isArray( obj )
 *
 * @returns {boolean}
 */
export function isArray(obj) {
    return isType(obj, 'Array')
}

/**
 * Return true if the object is a Function
 *
 * @param {*} obj
 *
 * @example boolean = isFunction( obj )
 *
 * @returns {boolean}
 */
export function isFunction(obj) {
    return isType(obj, 'Function')
}

/**
 * Return true if the object is a String
 *
 * @param {*} obj
 *
 * @example boolean = isString( obj )
 *
 * @returns {boolean}
 */
export function isString(obj) {
    return isType(obj, 'String')
}

/**
 * Return true if the object is a Number
 *
 * @param {*} obj
 *
 * @example boolean = isNumber( obj )
 *
 * @returns {boolean}
 */
export function isNumber(obj) {
    return isType(obj, 'Number')
}
