const numRe                               = /^-?[0-9]*(\.[0-9]+)?$/;

/**
 * Test if the value is a number
 *
 * @function isNumber
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isNumber( value ) {
    return numRe.test( value );
}
