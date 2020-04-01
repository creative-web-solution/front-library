// Regular expression from Symfony
const RE_EMAIL = /^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const RE_EMAIL_LOOSE = /^.+\@\S+\.\S+$/;

/**
 * Test if the value is an email
 *
 * @function isEmail
 *
 * @param {String} value
 * @param {Boolean} [loose]
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isEmail( value, loose ) {
    if ( loose ) {
        return RE_EMAIL_LOOSE.test( value );
    }
    return RE_EMAIL.test( value );
}
