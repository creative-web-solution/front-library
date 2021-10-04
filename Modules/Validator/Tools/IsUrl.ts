const urlRe = /^(https?:\/\/)?[\da-z.-]+\.[a-z.]{2,6}[#&+_?/\w .\-=]*$/i;

/**
 * Test if the value is an url
 *
 * @see extra/modules/validator.md for details
 */
export default function isUrl( value: string ): boolean {
    return urlRe.test( value );
}
