/**
 * Test if the value is a date
 *
 * @function isDate
 *
 * @param {String} value
 * @param {String} [format="d/m/y"]
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Boolean}
 */
export default function isDate( value, format = 'd/m/y' ) {
    var date,
        splittedValues,
        splittedFormat,
        SEPARATOR,
        yIndex,
        mIndex,
        dIndex,
        y,
        m,
        d;

    SEPARATOR = format.indexOf( '/' ) > -1 ? '/' : '-';

    splittedFormat = format.split( SEPARATOR );
    splittedValues = value.split( SEPARATOR );

    if ( splittedValues.length !== splittedFormat.length ) {
        return false;
    }

    yIndex = splittedFormat.indexOf( 'y' );
    mIndex = splittedFormat.indexOf( 'm' );
    dIndex = splittedFormat.indexOf( 'd' );

    y = +splittedValues[ yIndex ];
    m = +splittedValues[ mIndex ] - 1;
    d = +splittedValues[ dIndex ];

    date = new Date( y, m, d );

    return (
        date.getDate() === d &&
        date.getMonth() === m &&
        date.getFullYear() === y
    );
}
