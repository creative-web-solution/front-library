/**
 * Simple template function based on string substitution
 * @function
 *
 * @param {String} template
 * @param {Object} data
 *
 * @returns {String}
 *
 * @example
 *
 * let HTML = quickTemplate( 'My name is { lastname }. { firstname} { lastname }.', { "firstname": "James", "lastname": "Bond" } );
 */
export function quickTemplate( template, data ) {

    Object.keys( data ).forEach( key => {
        template = template.replace( new RegExp( `{\\s*${ key }\\s*}`, 'g' ), data[ key ] );
    } );

    return template;
}
