import dayjs             from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend( customParseFormat )

/**
 * Test if the value is a date
 *
 * @see extra/modules/validator.md for details
 */
 export default function isDate( value: string, format = 'DD/MM/YYYY' ): boolean {
    const PARSED_DATE = dayjs( value, format, true );
    return PARSED_DATE.isValid()
}
