/**
 * Test if the value is a date
 *
 * @function isDate
 *
 * @param {String} value
 * @param {String} [format="d/m/y"] d for day, m for month and y for year. Only in lowercase. January = 1
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isDate( value, format = 'd/m/y' ) {
    const RE_SEPARATOR = ( /[^dmy]/ ).exec( format );

    if ( !RE_SEPARATOR ) {
        return false;
    }

    const SEPARATOR       = RE_SEPARATOR[ 0 ];

    if ( !( new RegExp( `^[0-9${ SEPARATOR }]+$` ) ).test( value ) ) {
        return false;
    }

    const SPLITTED_FORMAT = format.split( SEPARATOR );
    const SPLITTED_VALUE  = value.split( SEPARATOR );

    if ( SPLITTED_FORMAT.length !== SPLITTED_VALUE.length ) {
        return false;
    }

    const y = Number( SPLITTED_VALUE[ SPLITTED_FORMAT.indexOf( 'y' ) ] );
    const m = Number( SPLITTED_VALUE[ SPLITTED_FORMAT.indexOf( 'm' ) ] - 1 );
    const d = Number( SPLITTED_VALUE[ SPLITTED_FORMAT.indexOf( 'd' ) ] );

    const date = new Date( y, m, d );

    return (
        date.getDate()     === d &&
        date.getMonth()    === m &&
        date.getFullYear() === y
    );
}
