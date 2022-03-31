/**
 * Test if the value is a date
 *
 * @param format - d for day, m for month and y for year. Only in lowercase. January = 1
 *
 * @see extra/modules/validator.md for details
 */
 export default function isDate( value: string, format = 'd/m/y' ): boolean {
    format = format.toLocaleLowerCase();

    const RE_SEPARATOR = ( /[^dmy]/ ).exec( format );

    if ( !RE_SEPARATOR ) {
        return false;
    }

    const SEPARATOR       = RE_SEPARATOR[ 0 ];

    if ( !( new RegExp( `^[0-9${ SEPARATOR }]+$` ) ).test( value ) ) {
        return false;
    }

    const ARR_FORMAT = format.split( SEPARATOR );
    const ARR_VALUE  = value.split( SEPARATOR );

    if ( ARR_FORMAT.length !== ARR_VALUE.length ) {
        return false;
    }

    const PARSED_DATE = {
        "d": -1,
        "m": -1,
        "y": -1
    };

    ARR_FORMAT.forEach( ( format, index ) => {
        const VALUE = Number( ARR_VALUE[ index ] );

        if ( format.indexOf( 'y' ) > -1 ) {
            PARSED_DATE.y = VALUE;
        }
        else if ( format.indexOf( 'm' ) > -1 ) {
            PARSED_DATE.m = VALUE - 1;
        }
        else if ( format.indexOf( 'd' ) > -1 ) {
            PARSED_DATE.d = VALUE;
        }
    } )

    const date = new Date( PARSED_DATE.y, PARSED_DATE.m, PARSED_DATE.d );

    return (
        date.getDate()     === PARSED_DATE.d &&
        date.getMonth()    === PARSED_DATE.m &&
        date.getFullYear() === PARSED_DATE.y
    );
}
