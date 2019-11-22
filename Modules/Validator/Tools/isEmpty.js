const emptyRe                             = /(^$)|(^[\s]*$)/i;

/**
 * Test if there is a value
 *
 * @function isEmpty
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isEmpty( value ) {
    return emptyRe.test( value );
}
