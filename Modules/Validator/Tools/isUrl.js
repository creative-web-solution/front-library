const urlRe                               = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i;

/**
 * Test if the value is an url
 *
 * @function isUrl
 *
 * @param {String} value
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isUrl( value ) {
    return urlRe.test( value );
}
