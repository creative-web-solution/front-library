// http://net.tutsplus.com/tutorials/other/8-regular-expressions-you-should-know/
const emailRe                             = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;

/**
 * Test if the value is an email
 *
 * @function isEmail
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isEmail( value ) {
    return emailRe.test( value );
}
