// Regular expression from Symfony
const RE_EMAIL = /^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const RE_EMAIL_LOOSE = /^.+\@\S+\.\S+$/;

/**
 * Test if the value is an email
 *
 * @param value
 * @param [loose]
 *
 * @see extra/modules/validator.md for details
 */
export default function isEmail( value: string, loose?: boolean ): boolean {
    if ( loose ) {
        return RE_EMAIL_LOOSE.test( value );
    }
    return RE_EMAIL.test( value );
}
