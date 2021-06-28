const numRe = /^-?[0-9]*(\.[0-9]+)?$/;

/**
 * Test if the value is a number
 *
 * @param value
 *
 * @see extra/modules/validator.md for details
 */
export default function isNumber( value: string ): boolean {
    return numRe.test( value );
}
