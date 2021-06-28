const emptyRe = /(^$)|(^[\s]*$)/i;

/**
 * Test if there is a value
 *
 * @param value
 *
 * @see extra/modules/validator.md for details
 */
export default function isEmpty( value: string | string[] ): boolean {
    if ( Array.isArray( value ) ) {
        return value.length > 0;
    }
    return emptyRe.test( value );
}
